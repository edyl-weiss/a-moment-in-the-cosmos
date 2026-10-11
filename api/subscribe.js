// POST /api/subscribe { email } → sends a confirmation email (double opt-in).
// Always answers the same way whether or not the address is already subscribed, so the form can't be
// used to find out who's on the list.
import { createHash } from 'node:crypto';
import { configured, pipeline } from './_redis.js';
import { mailReady, EMAIL, normalize, sign, siteUrl, resend, env, confirmEmail } from './_mail.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!configured() || !mailReady()) return res.status(503).json({ error: 'Email sign-up isn’t set up yet' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (body.website) return res.status(200).json({ ok: true });            // honeypot field: bots fill it in
  const email = normalize(body.email);
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'That doesn’t look like an email address' });
  try {
    // Limit: 5 sign-up attempts per IP per hour, and one confirmation email per address per 10 minutes.
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const ipKey = `rl:sub:${createHash('sha256').update(ip).digest('hex').slice(0, 16)}`;
    const [hits, , already, fresh] = await pipeline([
      ['INCR', ipKey], ['EXPIRE', ipKey, 3600], ['SISMEMBER', 'subscribers', email], ['SET', `rl:mail:${email}`, '1', 'EX', 600, 'NX']
    ]);
    if (hits > 5) return res.status(429).json({ error: 'Too many tries. Please wait a bit and try again' });
    if (!already && fresh) {
      const link = `${siteUrl()}/api/confirm?t=${sign(`c:${email}:${Date.now()}`)}`;
      const m = confirmEmail(link);
      await resend('/emails', { from: env('MAIL_FROM'), to: email, subject: m.subject, html: m.html, text: m.text });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'Couldn’t send the email just now. Please try again later' });
  }
}
