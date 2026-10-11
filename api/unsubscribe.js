// GET or POST /api/unsubscribe?t=… → removes the address. POST is the one-click unsubscribe that mail
// apps trigger from their own "Unsubscribe" button (RFC 8058), so it answers without a redirect.
import { configured, pipeline } from './_redis.js';
import { verify, siteUrl } from './_mail.js';

export default async function handler(req, res) {
  const payload = verify(req.query.t);
  const email = payload?.startsWith('u:') ? payload.slice(2) : null;
  if (email && configured()) {
    try { await pipeline([['SREM', 'subscribers', email], ['DEL', `sub:${email}`]]); } catch { /* try again from the link */ }
  }
  if (req.method === 'POST') return res.status(email ? 200 : 400).end();
  res.redirect(302, `${siteUrl()}/${email ? '#unsubscribed' : '#email-expired'}`);
}
