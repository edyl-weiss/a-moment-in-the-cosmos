// Vercel Cron, a few minutes after midnight UTC: email today's Cosmic guess to every subscriber.
// Runs at most once per day (a "sent" marker in Redis), sends in batches of 100 through Resend.
// The puzzle comes from the same code the site uses (src/js/guess-core.js), so the email and the site agree.
import { configured, pipeline } from './_redis.js';
import { mailReady, env, siteUrl, resend, guessEmail, unsubLink } from './_mail.js';
import { puzzleFor, cropUrl } from '../src/js/guess-core.js';
import { todayIndex, dateOf } from '../src/js/util.js';
import { CATALOG } from '../src/data/catalog.js';
import { CATALOG_SKY } from '../src/data/constellations.js';

async function photoFor(id) {
  const curated = CATALOG.find((c) => c.id === id);
  if (curated) return { ...curated, sky: CATALOG_SKY[id] };
  const r = await fetch(`${siteUrl()}/data/collection/photos/${encodeURIComponent(id)}.json`);
  if (!r.ok) throw new Error(`photo ${id}: ${r.status}`);
  return r.json();
}

export default async function handler(req, res) {
  if (env('CRON_SECRET') && req.headers.authorization !== `Bearer ${env('CRON_SECRET')}`) return res.status(401).end();
  if (!configured() || !mailReady()) return res.status(503).json({ error: 'not set up' });
  const day = todayIndex();
  const [first] = await pipeline([['SET', `sent:${day}`, '1', 'EX', 172800, 'NX']]);
  if (first !== 'OK' && req.query.force !== '1') return res.status(200).json({ skipped: 'already sent today' });
  try {
    const index = await (await fetch(`${siteUrl()}/data/collection/index.json`)).json();
    const puzzle = puzzleFor(day, index);
    if (!puzzle) throw new Error('no puzzle for today');
    const photo = await photoFor(puzzle.id);
    const crop = cropUrl(photo, puzzle, 0);
    const d = dateOf(day);
    const dateLabel = d.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const issue = `No. ${(day + 1).toLocaleString('en')}`;
    // One "On this day" note, from the same data as the site's On this day section.
    let event = null;
    try {
      const otd = await (await fetch(`${siteUrl()}/data/onthisday.json`)).json();
      const key = `${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      event = otd[key]?.events?.[0] || null;
    } catch { /* the email is fine without it */ }
    const [list] = await pipeline([['SMEMBERS', 'subscribers']]);
    let sent = 0;
    for (let i = 0; i < list.length; i += 100) {
      const batch = list.slice(i, i + 100).map((to) => {
        const m = guessEmail(puzzle, crop, to, { dateLabel, issue, event });
        return { from: env('MAIL_FROM'), to, subject: m.subject, html: m.html, text: m.text,
          headers: { 'List-Unsubscribe': `<${unsubLink(to)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } };
      });
      await resend('/emails/batch', batch);
      sent += batch.length;
    }
    return res.status(200).json({ day, puzzle: puzzle.id, sent });
  } catch (e) {
    await pipeline([['DEL', `sent:${day}`]]).catch(() => {});   // let a retry go out
    return res.status(500).json({ error: String(e.message || e) });
  }
}
