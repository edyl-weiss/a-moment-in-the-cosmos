// Today's vote: which of the day's three photographs visitors like most.
//   GET  /api/vote?day=N&v=<visitor>   → { day, total, counts: [a,b,c] | null, mine: slot | null }
//   POST /api/vote { day, slot, v }    → { day, total, counts, mine }
// Only today's lineup takes votes. A visitor may change their pick during the day; the last pick counts.
// Today's counts are only returned to someone who has voted, so the race stays a surprise until you join in;
// past days are open to everyone (that's "Yesterday's winner").
// Visitors: `v` is a random id the browser keeps. It is stored only as a salted hash, and each network
// (a salted hash of the IP address, never the address itself) can cast at most PER_NETWORK new votes a day,
// so a household or office can all vote without anyone stuffing the box by clearing their browser.
import { createHash } from 'node:crypto';
import { configured, pipeline } from './_redis.js';
import { readCounts, pickOf, cast, VOTER_TTL } from './_votes.js';
import { todayIndex, trioDay, dailyIds } from '../src/js/util.js';

const PER_NETWORK = 8;
const VISITOR = /^[A-Za-z0-9_-]{8,64}$/;
const hash = (s) => createHash('sha256').update(`${process.env.REACT_SALT || 'cosmos'}|${s}`).digest('hex').slice(0, 24);
const sum = (c) => c.reduce((a, b) => a + b, 0);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) return res.status(503).json({ error: 'voting is not set up' });
  let body;
  try { body = req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) : req.query || {}; }
  catch { return res.status(400).json({ error: 'bad request' }); }
  const day = Number(body.day), today = todayIndex();
  if (!Number.isInteger(day) || day < 0 || day > today || !trioDay(day)) return res.status(400).json({ error: 'bad day' });
  const n = dailyIds(day).length;
  const who = VISITOR.test(String(body.v || '')) ? hash(`v|${body.v}`) : null;
  try {
    if (req.method === 'GET') {
      const [counts, mine] = await Promise.all([readCounts(day, n), who ? pickOf(day, who) : null]);
      const open = day < today || mine !== null;
      if (day < today) res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).json({ day, total: sum(counts), counts: open ? counts : null, mine });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
    const slot = Number(body.slot);
    if (day !== today) return res.status(400).json({ error: 'voting for that day has closed' });
    if (!who || !Number.isInteger(slot) || slot < 0 || slot >= n) return res.status(400).json({ error: 'bad vote' });
    if (await pickOf(day, who) === null) {
      const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
      const net = `votenet:${day}:${hash(`ip|${ip}|${day}`)}`;
      const [used] = await pipeline([['INCR', net], ['EXPIRE', net, VOTER_TTL]]);
      if (used > PER_NETWORK) return res.status(429).json({ error: 'too many votes from this network today' });
    }
    const counts = await cast(day, who, slot, n);
    return res.status(200).json({ day, total: sum(counts), counts, mine: slot });
  } catch {
    return res.status(502).json({ error: 'storage unavailable' });
  }
}
