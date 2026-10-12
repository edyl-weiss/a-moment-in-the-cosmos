// Cosmic guess results for a subscriber, so their record follows them from the email to any device.
//   POST /api/guess { t, day, picks: [option indexes], won, cat }  → stores one day's result (first one wins)
//   GET  /api/guess?t=…                                            → every stored result
// `t` is the signed token from the daily email's links ("g:<email>"); nothing works without it.
import { createHash } from 'node:crypto';
import { configured, pipeline } from './_redis.js';
import { verify } from './_mail.js';

const keyFor = (email) => `gs:${createHash('sha256').update(email).digest('hex').slice(0, 24)}`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const t = req.method === 'GET' ? req.query.t : (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}).t;
  const payload = verify(t);
  if (!payload || !payload.startsWith('g:')) return res.status(401).json({ error: 'not linked' });
  if (!configured()) return res.status(503).json({ error: 'not set up' });
  const key = keyFor(payload.slice(2));
  try {
    if (req.method === 'GET') {
      const [flat] = await pipeline([['HGETALL', key]]);
      const results = {};
      for (let i = 0; i < (flat || []).length; i += 2) { try { results[flat[i]] = JSON.parse(flat[i + 1]); } catch { /* skip */ } }
      return res.status(200).json({ results });
    }
    if (req.method !== 'POST') return res.status(405).end();
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const day = Number(b.day), picks = Array.isArray(b.picks) ? b.picks.slice(0, 3).map(Number).filter((n) => n >= 0 && n < 4) : [];
    if (!Number.isInteger(day) || day < 0 || !picks.length) return res.status(400).json({ error: 'bad result' });
    const rec = JSON.stringify({ picks, won: Boolean(b.won), cat: String(b.cat || '').slice(0, 10) });
    await pipeline([['HSETNX', key, String(day), rec]]);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'storage unavailable' });
  }
}
