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

// ---- Email look: the site's almanac page, rebuilt with tables and inline styles (what mail apps support).
// Spectral and IBM Plex Mono load where the mail app allows web fonts (Apple Mail, iOS); elsewhere
// Georgia and Courier stand in.
const C = { paper: '#0d0c0b', ink: '#e9e4d8', ink2: '#bdb6a8', ink3: '#857f74', rule: '#34312c', red: '#e2553d', blue: '#a9c6f0', navy: '#0a1a3f', navy2: '#11285a' };
const SERIF = "Spectral, Georgia, 'Times New Roman', serif";
const MONO = "'IBM Plex Mono', 'Courier New', Courier, monospace";
const label = (t) => `<span style="font:500 11px/1.4 ${MONO};letter-spacing:.14em;text-transform:uppercase;color:${C.ink3}">${t}</span>`;
const button = (href, text) => `<a href="${href}" style="display:inline-block;padding:13px 26px;border:1px solid ${C.blue};border-radius:999px;background:${C.navy};color:${C.ink};font:500 16px/1 ${SERIF};text-decoration:none">${text}</a>`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function frame({ preheader = '', issue = '', date = '', inner, email }) {
  // A faint star field behind the page (mail apps that ignore background images just show the dark color).
  const stars = `${siteUrl()}/email/stars.png`;
  const site = siteUrl().replace(/^https?:\/\//, '');
  const unsub = email ? `<a href="${unsubLink(email)}" style="color:${C.ink2};text-decoration:underline">Unsubscribe</a> &nbsp;·&nbsp; ` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<title>A Moment in the Cosmos</title></head>
<body style="margin:0;padding:0;background:${C.paper};color:${C.ink};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.paper}" style="background:${C.paper}"><tr>
<td align="center" background="${stars}" bgcolor="${C.paper}" style="padding:32px 16px 40px;background-color:${C.paper};background-image:url('${stars}');background-repeat:repeat;background-size:480px 480px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
  <tr><td style="padding:0 0 10px;font:300 34px/1.1 ${SERIF};letter-spacing:-.01em;color:${C.ink}"><a href="${siteUrl()}" style="color:${C.ink};text-decoration:none">A Moment in the Cosmos</a></td></tr>
  <tr><td style="border-top:1px solid ${C.rule};border-bottom:1px solid ${C.rule};padding:8px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font:12px/1.4 ${MONO};color:${C.ink3}">${esc(issue)}</td>
      <td align="right" style="font:12px/1.4 ${MONO};color:${C.ink3}">${esc(date)}</td>
    </tr></table></td></tr>
  ${inner}
  <tr><td style="padding:34px 0 0;font:italic 17px/1.5 ${SERIF};color:${C.ink2}">Ad astra,<br><span style="font-style:normal;color:${C.ink}">Joe</span></td></tr>
  <tr><td style="padding:28px 0 0"><div style="border-top:1px solid ${C.rule};font-size:0;line-height:0">&nbsp;</div></td></tr>
  <tr><td style="padding:16px 0 0;font:12px/1.7 ${MONO};color:${C.ink3}">
    ${unsub}<a href="${siteUrl()}" style="color:${C.ink2};text-decoration:underline">${esc(site)}</a>
    ${env('MAIL_ADDRESS') ? `<br>${esc(env('MAIL_ADDRESS'))}` : ''}
    <br>Images belong to the observatories and photographers credited with them.</td></tr>
</table></td></tr></table></body></html>`;
}

export function confirmEmail(link) {
  const inner = `
  <tr><td style="padding:30px 0 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#06102b" style="background:#06102b;border:1px solid #15204a;border-radius:10px">
      <tr><td style="padding:30px 28px 32px">
        <p style="margin:0 0 10px">${label('One more step')}</p>
        <p style="margin:0 0 14px;font:400 26px/1.25 ${SERIF};color:${C.ink}">Welcome aboard!</p>
        <p style="margin:0 0 24px;font:17px/1.6 ${SERIF};color:${C.ink2}">Confirm your email below, and each day a new Cosmic guess, a close-up of something wonderful in the universe, will find its way to you.</p>
        ${button(link, 'Confirm my email')}
      </td></tr></table></td></tr>
  <tr><td style="padding:18px 2px 0;font:italic 14px/1.6 ${SERIF};color:${C.ink3}">If this message was sent by mistake, no worries! Just ignore it, and you won’t receive another one.</td></tr>`;
  return {
    subject: 'Confirm your daily photograph',
    html: frame({ preheader: 'One click and the universe starts arriving in your inbox.', issue: 'Welcome', date: '', inner, email: null }),
    text: `Welcome aboard! Confirm your email, and each day a new Cosmic guess, a close-up of something wonderful in the universe, will find its way to you.\n\n${link}\n\nIf this message was sent by mistake, no worries! Just ignore it, and you won't receive another one.`
  };
}

// One almanac row: small label on the left, value on the right, hairline between rows.
const fact = (k, v) => v ? `<tr><td style="padding:10px 14px 10px 0;border-top:1px solid ${C.rule};vertical-align:top;white-space:nowrap">${label(k)}</td>
  <td style="padding:9px 0;border-top:1px solid ${C.rule};font:16px/1.5 ${SERIF};color:${C.ink}">${v}</td></tr>` : '';

export function dailyEmail(photo, email, { dateLabel = '', issue = '', event = null } = {}) {
  const url = `${siteUrl()}/#${encodeURIComponent(photo.id)}`;
  const img = photo.img?.screen || photo.img?.large || photo.img?.pub;
  const story = photo.story?.[0] || photo.caption || '';
  const con = (photo.celestial || '').match(/constellation ([^·,]+)/)?.[1]?.trim();
  const ra = photo.sky?.ra;
  const when = Number.isFinite(ra) ? `highest around midnight in ${MONTHS[Math.floor(ra / 30 + 8.5) % 12]}` : '';
  const where = con ? `${esc(con)}${when ? `<span style="color:${C.ink3}"> · ${when}</span>` : ''}` : '';
  const scope = [photo.behind?.observatory, photo.behind?.instrument].filter((x, i, a) => x && a.indexOf(x) === i && !/^Not /.test(x)).join(', ');
  const cat = { galaxy: 'Galaxy', nebula: 'Nebula', star: 'Star', night: 'Night sky' }[photo.cat] || '';
  const inner = `
  <tr><td style="padding:28px 0 6px">${label(`<span style="color:${C.red}">${esc(cat)}</span> &nbsp;·&nbsp; Today’s photograph`)}</td></tr>
  <tr><td style="padding:0 0 18px;font:400 32px/1.15 ${SERIF};letter-spacing:-.01em;color:${C.ink}"><a href="${url}" style="color:${C.ink};text-decoration:none">${esc(photo.title)}</a></td></tr>
  ${img ? `<tr><td style="padding:0"><a href="${url}"><img src="${esc(img)}" alt="${esc(photo.alt || photo.title)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;background:#000"></a></td></tr>` : ''}
  <tr><td style="padding:8px 0 0;font:11px/1.5 ${MONO};color:${C.ink3}">${esc(photo.credit || '')}</td></tr>
  <tr><td style="padding:20px 0 0;font:18px/1.65 ${SERIF};color:${C.ink2}">${esc(story)}</td></tr>
  <tr><td style="padding:22px 0 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${fact('Where to look', where)}
    ${fact('Imaged by', esc(scope))}
    ${fact('Released', esc(photo.releaseDate || ''))}
  </table></td></tr>
  <tr><td style="padding:26px 0 0">${button(url, 'See it on the site')}</td></tr>
  ${event ? `<tr><td style="padding:34px 0 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.navy};border:1px solid #1d2c55;border-radius:10px">
      <tr><td style="padding:20px 22px 22px">
        <p style="margin:0 0 8px">${label(`On this day in ${event.year}`)}</p>
        <p style="margin:0;font:16px/1.6 ${SERIF};color:${C.ink2}">${esc(event.text)}</p>
      </td></tr></table></td></tr>` : ''}`;
  return {
    subject: photo.title,
    html: frame({ preheader: (story.match(/^.*?[.!?](\s|$)/)?.[0] || story).slice(0, 140), issue, date: dateLabel, inner, email }),
    text: `${photo.title}\n${dateLabel}\n\n${story}\n\n${url}\n\n${event ? `On this day in ${event.year}: ${event.text}\n\n` : ''}Ad astra,\nJoe\n\nUnsubscribe: ${unsubLink(email)}${env('MAIL_ADDRESS') ? `\n${env('MAIL_ADDRESS')}` : ''}`
  };
}

// The daily email: today's Cosmic guess. Each answer is a link that opens the site with that answer
// already given; the signed `t` ties the result to this subscriber, so their record follows them.
export const guessToken = (email) => sign(`g:${email}`);
// Yesterday's winner and today's three, below the puzzle. `lineup` = { three: [index entries], winner: { photo, n, total, pct, tiedWith } | null }.
const KIND = { galaxy: 'Galaxy', nebula: 'Nebula', star: 'Star', night: 'Night sky' };
function lineupHtml(lineup) {
  if (!lineup?.three?.length) return '';
  const site = siteUrl(), link = (id) => `${site}/#${encodeURIComponent(id)}`;
  const w = lineup.winner;
  const wImg = w && (w.photo.img?.screen || w.photo.img?.thumb || w.photo.thumb);
  const winner = w ? `
  <tr><td style="padding:40px 0 6px">${label(`<span style="color:${C.red}">Yesterday’s winner</span>`)}</td></tr>
  <tr><td style="padding:0 0 14px;font:400 26px/1.2 ${SERIF};color:${C.ink}"><a href="${link(w.photo.id)}" style="color:${C.ink};text-decoration:none">${esc(w.photo.title)}</a></td></tr>
  ${wImg ? `<tr><td style="padding:0"><a href="${link(w.photo.id)}"><img src="${esc(wImg)}" alt="${esc(w.photo.alt || w.photo.title)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:6px;background:#000"></a></td></tr>` : ''}
  <tr><td style="padding:10px 0 0;font:13px/1.5 ${MONO};color:${C.ink3}"><span style="color:${C.ink}">${w.pct}%</span> of ${w.total.toLocaleString('en')} vote${w.total === 1 ? '' : 's'}${w.tiedWith ? ` · tied with ${esc(w.tiedWith)}` : ''}</td></tr>` : '';
  const last = lineup.three.length - 1;
  const cell = (e, i) => `<td width="33%" valign="top" style="padding:0 ${i === last ? 0 : 5}px 0 ${i ? 5 : 0}px">
      <a href="${link(e.id)}" style="text-decoration:none;color:${C.ink}">
        ${e.thumb ? `<img src="${esc(e.thumb)}" alt="" width="186" style="display:block;width:100%;height:auto;border:0;border-radius:4px;background:#000">` : ''}
        <p style="margin:8px 0 3px;font:500 10px/1.3 ${MONO};letter-spacing:.12em;text-transform:uppercase;color:${C.red}">${esc(KIND[e.cat] || '')}</p>
        <p style="margin:0;font:15px/1.35 ${SERIF};color:${C.ink}">${esc(e.title)}</p></a></td>`;
  return `${winner}
  <tr><td style="padding:40px 0 6px">${label(`<span style="color:${C.red}">Today’s destinations</span>`)}</td></tr>
  <tr><td style="padding:0 0 16px;font:17px/1.6 ${SERIF};color:${C.ink2}">A galaxy, a little stardust and a night sky. Which one’s your favorite? Cast your vote on the site, and I’ll share the winner tomorrow.</td></tr>
  <tr><td style="padding:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${lineup.three.map(cell).join('')}</tr></table></td></tr>
  <tr><td style="padding:22px 0 0">${button(`${site}/#trio`, 'Vote for your favorite')}</td></tr>`;
}
const lineupText = (lineup) => !lineup?.three?.length ? '' :
  (lineup.winner ? `Yesterday’s winner: ${lineup.winner.photo.title} (${lineup.winner.pct}% of ${lineup.winner.total} votes)\n${siteUrl()}/#${encodeURIComponent(lineup.winner.photo.id)}\n\n` : '') +
  `Today’s destinations. Vote for your favorite:\n${lineup.three.map((e) => `- ${KIND[e.cat] || ''}: ${e.title}`).join('\n')}\n${siteUrl()}/#trio\n\n`;

export function guessEmail(puzzle, cropSrc, email, { dateLabel = '', issue = '', event = null, lineup = null } = {}) {
  const t = guessToken(email);
  const link = (i) => `${siteUrl()}/?g=${puzzle.day}&a=${i}&t=${encodeURIComponent(t)}#play`;
  const play = `${siteUrl()}/?t=${encodeURIComponent(t)}#play`;
  const kind = { galaxy: 'a galaxy', nebula: 'a nebula', star: 'a star or star cluster' }[puzzle.cat] || 'an object';
  const option = (name, i) => `<tr><td style="padding:0 0 10px"><a href="${link(i)}" style="display:block;padding:14px 18px;border:1px solid ${C.rule};border-radius:10px;background:#141311;color:${C.ink};font:400 18px/1.3 ${SERIF};text-decoration:none">
    <span style="font:600 12px/1 ${MONO};color:${C.blue};margin-right:12px">${'ABCD'[i]}</span>${esc(name)}</a></td></tr>`;
  const inner = `
  <tr><td style="padding:28px 0 6px">${label(`<span style="color:${C.red}">Cosmic guess</span>`)}</td></tr>
  <tr><td style="padding:0 0 18px;font:400 32px/1.15 ${SERIF};letter-spacing:-.01em;color:${C.ink}">What are you looking at?</td></tr>
  <tr><td style="padding:0"><a href="${play}"><img src="${esc(cropSrc)}" alt="A close-up of today’s mystery object" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:6px;background:#000"></a></td></tr>
  <tr><td style="padding:16px 0 18px;font:17px/1.6 ${SERIF};color:${C.ink2}">I’ve hidden ${kind} behind a very close zoom. Think you can name it? Pick one! Each miss pulls the view back a little further, and you’ve got three chances to get it.</td></tr>
  ${puzzle.options.map(option).join('')}
  <tr><td style="padding:14px 0 0;font:italic 15px/1.6 ${SERIF};color:${C.ink3}">Your answers count toward your streak and stats on the site, on any device.</td></tr>
  ${lineupHtml(lineup)}
  ${event ? `<tr><td style="padding:34px 0 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.navy};border:1px solid #1d2c55;border-radius:10px">
      <tr><td style="padding:20px 22px 22px">
        <p style="margin:0 0 8px">${label(`On this day in ${event.year}`)}</p>
        <p style="margin:0;font:16px/1.6 ${SERIF};color:${C.ink2}">${esc(event.text)}</p>
      </td></tr></table></td></tr>` : ''}`;
  return {
    subject: `${issue}: What are you looking at?`,
    html: frame({ preheader: `Today’s Cosmic guess: is it ${puzzle.options.slice(0, 3).join(', ')} or ${puzzle.options[3]}?`, issue, date: dateLabel, inner, email }),
    text: `Cosmic guess, ${issue}\n${dateLabel}\n\nWhat are you looking at? I’ve hidden ${kind} behind a very close zoom. Think you can name it? Pick one! Each miss pulls the view back a little further, and you’ve got three chances to get it.\n\n` +
      puzzle.options.map((n, i) => `${'ABCD'[i]}. ${n}\n${link(i)}`).join('\n\n') +
      `\n\n${lineupText(lineup)}${event ? `On this day in ${event.year}: ${event.text}\n\n` : ''}Ad astra,\nJoe\n\nUnsubscribe: ${unsubLink(email)}${env('MAIL_ADDRESS') ? `\n${env('MAIL_ADDRESS')}` : ''}`
  };
}
