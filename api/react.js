// "Wow" reactions. One per visitor per photograph, counted forever and in a weekly leaderboard.
//   GET  /api/react?id=<photo>   → { count }
//   GET  /api/react?top=week     → { week, items: [{ id, count }] }   (this week, topped up from last week)
//   POST /api/react  { id }      → { count, counted }
// Visitors are recognised by a salted hash of their IP address per photograph; the IP itself is never stored.
import { createHash } from 'node:crypto';
import { configured, credentials, pipeline } from './_redis.js';

const ID = /^[A-Za-z0-9._-]{1,100}$/;
const WEEK_TTL = 60 * 60 * 24 * 21;

// ISO week key, e.g. "2026-W41".
export function weekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${String(w).padStart(2, '0')}`;
}

const pairs = (flat) => { const out = []; for (let i = 0; i < flat.length; i += 2) out.push({ id: flat[i], count: Number(flat[i + 1]) }); return out; };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  // Setup check: /api/react?status — says which variable names were found (never their values)
  // and whether the database answers.
  if (req.method === 'GET' && 'status' in (req.query || {})) {
    const c = credentials();
    const envNames = Object.keys(process.env).filter((k) => /REDIS|KV_|UPSTASH/.test(k));
    if (!c) return res.status(200).json({ ok: false, problem: 'No Upstash variables found in this deployment. Connect the database to this project, then redeploy.', seen: envNames });
    try { const [pong] = await pipeline([['PING']]); return res.status(200).json({ ok: pong === 'PONG', using: c.from, seen: envNames }); }
    catch (e) { return res.status(200).json({ ok: false, using: c.from, problem: String(e.message || e) }); }
  }
  if (!configured()) return res.status(503).json({ error: 'reactions are not set up' });
  try {
    if (req.method === 'GET' && req.query.top === 'week') {
      const now = weekKey(), last = weekKey(new Date(Date.now() - 7 * 864e5));
      const [a, b] = await pipeline([['ZREVRANGE', `week:${now}`, 0, 7, 'WITHSCORES'], ['ZREVRANGE', `week:${last}`, 0, 7, 'WITHSCORES']]);
      const items = pairs(a || []);
      for (const it of pairs(b || [])) if (items.length < 8 && !items.some((x) => x.id === it.id)) items.push({ ...it, lastWeek: true });
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(200).json({ week: now, items });
    }
    const id = req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}).id : req.query.id;
    if (!ID.test(String(id || ''))) return res.status(400).json({ error: 'bad id' });
    if (req.method === 'GET') {
      const [count] = await pipeline([['GET', `count:${id}`]]);
      return res.status(200).json({ count: Number(count) || 0 });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
    const who = createHash('sha256').update(`${process.env.REACT_SALT || 'cosmos'}|${ip}|${id}`).digest('hex').slice(0, 24);
    const [added] = await pipeline([['SADD', `who:${id}`, who]]);
    if (added === 1) {
      const wk = `week:${weekKey()}`;
      const [count] = await pipeline([['INCR', `count:${id}`], ['ZINCRBY', wk, 1, id], ['EXPIRE', wk, WEEK_TTL]]);
      return res.status(200).json({ count: Number(count), counted: true });
    }
    const [count] = await pipeline([['GET', `count:${id}`]]);
    return res.status(200).json({ count: Number(count) || 0, counted: false });
  } catch {
    return res.status(502).json({ error: 'storage unavailable' });
  }
}
