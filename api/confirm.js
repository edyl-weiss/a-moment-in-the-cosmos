// GET /api/confirm?t=… → adds the address to the list (links last 3 days) and returns to the site.
import { configured, pipeline } from './_redis.js';
import { verify, siteUrl } from './_mail.js';

export default async function handler(req, res) {
  const payload = verify(req.query.t);
  const [kind, email, at] = (payload || '').split(':');
  const ok = kind === 'c' && email && Date.now() - Number(at) < 3 * 864e5;
  if (ok && configured()) {
    try { await pipeline([['SADD', 'subscribers', email], ['HSET', `sub:${email}`, 'since', new Date().toISOString()]]); }
    catch { return res.redirect(302, `${siteUrl()}/#email-error`); }
  }
  res.redirect(302, `${siteUrl()}/${ok ? '#subscribed' : '#email-expired'}`);
}
