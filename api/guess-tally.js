// Everyone's Cosmic guess results for a day, anonymous.
//   POST /api/guess-tally { day, picks: [option indexes in order], won }  → counted once per visitor per day
//   GET  /api/guess-tally?day=N                                          → { players, first: [a,b,c,d], looks: [1st,2nd,3rd,missed] }
// Only today's puzzle can be counted. Nothing personal is stored: a hashed IP marks "already counted" for two days.
import { createHash } from 'node:crypto';
import { configured, pipeline } from './_redis.js';
import { todayIndex } from '../src/js/util.js';

const KEEP = 60 * 60 * 24 * 45;   // tallies stay for 45 days

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) return res.status(503).json({ error: 'not set up' });
  try {
    if (req.method === 'GET') {
      const day = Number(req.query.day);
      if (!Number.isInteger(day) || day < 0) return res.status(400).json({ error: 'bad day' });
      const [flat] = await pipeline([['HGETALL', `gt:${day}`]]);
      const h = {};
      for (let i = 0; i < (flat || []).length; i += 2) h[flat[i]] = Number(flat[i + 1]) || 0;
      return res.status(200).json({ day, players: h.n || 0, first: [0, 1, 2, 3].map((i) => h[`p${i}`] || 0), looks: ['l1', 'l2', 'l3', 'miss'].map((k) => h[k] || 0) });
    }
    if (req.method !== 'POST') return res.status(405).end();
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const day = Number(b.day);
    const picks = Array.isArray(b.picks) ? b.picks.slice(0, 3).map(Number) : [];
    if (day !== todayIndex() || !picks.length || picks.some((p) => !(p >= 0 && p < 4)) || new Set(picks).size !== picks.length) return res.status(400).json({ error: 'bad result' });
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const seen = `gtl:${day}:${createHash('sha256').update(`${ip}|${day}`).digest('hex').slice(0, 20)}`;
    const [fresh] = await pipeline([['SET', seen, '1', 'EX', 172800, 'NX']]);
    if (fresh !== 'OK') return res.status(200).json({ ok: true, counted: false });
    const look = b.won ? `l${picks.length}` : 'miss';
    await pipeline([['HINCRBY', `gt:${day}`, 'n', 1], ['HINCRBY', `gt:${day}`, `p${picks[0]}`, 1], ['HINCRBY', `gt:${day}`, look, 1], ['EXPIRE', `gt:${day}`, KEEP]]);
    return res.status(200).json({ ok: true, counted: true });
  } catch {
    return res.status(502).json({ error: 'storage unavailable' });
  }
}
