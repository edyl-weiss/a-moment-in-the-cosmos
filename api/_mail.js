// Shared pieces for the daily-email feature: settings, Resend client, unsubscribe tokens and the email templates.
//
// Settings (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  API key from resend.com
//   MAIL_FROM       e.g.  A Moment in the Cosmos <wheatley@yourdomain.com>   (a verified Resend domain)
//   SITE_URL        e.g.  https://yourdomain.com   (no trailing slash)
//   MAIL_ADDRESS    the postal address printed in every email footer (required by US CAN-SPAM)
//   SUB_SECRET      any long random string; signs confirm/unsubscribe links
//   CRON_SECRET     any long random string; Vercel sends it with the daily cron call
import { createHmac, timingSafeEqual } from 'node:crypto';

export const env = (k, d = '') => process.env[k] || d;
export const siteUrl = () => env('SITE_URL', 'https://example.com').replace(/\/$/, '');
export const mailReady = () => Boolean(env('RESEND_API_KEY') && env('MAIL_FROM') && env('SUB_SECRET'));

export const EMAIL = /^[^\s@<>"',;]{1,64}@[^\s@<>"',;]{1,190}\.[a-z]{2,24}$/i;
export const normalize = (e) => String(e || '').trim().toLowerCase();

// Signed tokens: "<payload>.<sig>" so links can't be forged or edited.
const sig = (s) => createHmac('sha256', env('SUB_SECRET')).update(s).digest('base64url').slice(0, 32);
export const sign = (payload) => `${Buffer.from(payload).toString('base64url')}.${sig(payload)}`;
export function verify(token) {
  const [p, s] = String(token || '').split('.');
  if (!p || !s) return null;
  const payload = Buffer.from(p, 'base64url').toString();
  const good = Buffer.from(sig(payload)), got = Buffer.from(s);
  return good.length === got.length && timingSafeEqual(good, got) ? payload : null;
}
export const unsubLink = (email) => `${siteUrl()}/api/unsubscribe?t=${sign(`u:${email}`)}`;

export async function resend(path, body) {
  const r = await fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// A plain, dark, almanac-style layout with inline styles (what email clients understand).
function frame(inner, email) {
  const unsub = email ? `<a href="${unsubLink(email)}" style="color:#a8a296">Unsubscribe</a> · ` : '';
  return `<!doctype html><html><body style="margin:0;background:#0d0c0b;color:#e9e4d8;font-family:Georgia,'Times New Roman',serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0c0b"><tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 4px 18px;border-bottom:1px solid #34312c;font-size:26px;letter-spacing:-.01em">A Moment in the Cosmos</td></tr>
${inner}
<tr><td style="padding:26px 4px 0;border-top:1px solid #34312c;font:12px/1.6 'Courier New',monospace;color:#7b766c">
${unsub}<a href="${siteUrl()}" style="color:#a8a296">${esc(siteUrl().replace(/^https?:\/\//, ''))}</a><br>${esc(env('MAIL_ADDRESS'))}</td></tr>
</table></td></tr></table></body></html>`;
}

export function confirmEmail(link) {
  return {
    subject: 'Confirm your daily photograph',
    html: frame(`<tr><td style="padding:26px 4px;font-size:17px;line-height:1.6">
<p style="margin:0 0 16px">Thank you for looking up with us. Confirm, and each day a new photograph of the universe will find its way to you</p>
<p style="margin:0 0 22px"><a href="${link}" style="display:inline-block;padding:12px 22px;border:1px solid #a9c6f0;border-radius:999px;color:#e9e4d8;text-decoration:none">Confirm my email</a></p>
<p style="margin:0;font-size:14px;color:#7b766c">If you didn’t ask for this, ignore this email and nothing will happen</p></td></tr>`, null),
    text: `Confirm your subscription to A Moment in the Cosmos: ${link}\n\nIf you didn't ask for this, ignore this email.`
  };
}

export function dailyEmail(photo, email, dateLabel) {
  const url = `${siteUrl()}/#${encodeURIComponent(photo.id)}`;
  const img = photo.img?.screen || photo.img?.large || photo.img?.pub;
  const first = (photo.story?.[0] || '').match(/^.*?[a-z0-9)”'"][.!?](?=\s+[A-Z“"']|\s*$)/)?.[0] || photo.caption || '';
  return {
    subject: photo.title,
    html: frame(`<tr><td style="padding:22px 4px 8px;font:12px 'Courier New',monospace;letter-spacing:.12em;text-transform:uppercase;color:#e2553d">${esc(dateLabel)}</td></tr>
<tr><td style="padding:0 4px 16px;font-size:30px;line-height:1.15">${esc(photo.title)}</td></tr>
${img ? `<tr><td style="padding:0 0 14px"><a href="${url}"><img src="${esc(img)}" alt="${esc(photo.alt || photo.title)}" width="600" style="display:block;width:100%;height:auto;border:0;background:#000"></a></td></tr>` : ''}
<tr><td style="padding:0 4px 8px;font-size:17px;line-height:1.6;color:#d8d2c4">${esc(first)}</td></tr>
<tr><td style="padding:0 4px 8px;font:12px/1.6 'Courier New',monospace;color:#7b766c">${esc(photo.credit || '')}</td></tr>
<tr><td style="padding:16px 4px 30px"><a href="${url}" style="display:inline-block;padding:12px 22px;border:1px solid #a9c6f0;border-radius:999px;color:#e9e4d8;text-decoration:none">See it on the site</a></td></tr>`, email),
    text: `${photo.title}\n\n${first}\n\n${url}\n\nUnsubscribe: ${unsubLink(email)}\n${env('MAIL_ADDRESS')}`
  };
}
