// Sky passport: a scrapbook of the constellations you've explored, with stickers for milestones.
// A constellation earns a stamp when you open it on Tonight's sky, open a photograph taken in it, or solve a
// Cosmic guess whose object lies in it. Everything is kept in this browser.
import { $, esc, store } from './util.js';
import { INDEX_BY_ID } from './collection.js';
import { CON_NAMES } from '../data/constellations.js';
import { stats as guessStats } from './play.js';
import { showConOnSky } from './nightsky.js';
import { CON_ALIASES } from './skysearch.js';

const KEY = 'passport.v1';
let book = store.get(KEY, { stamps: {}, stickers: {}, kinds: {}, flags: {} });
const save = () => store.set(KEY, book);
const today = () => new Date().toISOString().slice(0, 10);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (d) => { const [y, m, dd] = d.split('-').map(Number); return `${dd} ${MONTHS[m - 1]} ${y}`; };
const norm = (k) => (k === 'Ser1' || k === 'Ser2' ? 'Ser' : k);
const NAME = (k) => (k === 'Ser' ? 'Serpens' : CON_NAMES[k] || k);
const VIA = { sky: 'Tonight’s sky', photo: 'a photograph', guess: 'a Cosmic guess' };

const ZODIAC = ['Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir', 'Lib', 'Sco', 'Sgr', 'Cap', 'Aqr', 'Psc'];
const ALL = Object.keys(CON_NAMES).map(norm).filter((k, i, a) => a.indexOf(k) === i);   // the 88

// Stickers: little milestones, in the order they're shown.
const STICKERS = [
  { id: 'first', label: 'First stamp', hint: 'Stamp any constellation', test: (n) => n >= 1, icon: 'star' },
  { id: 'zodiac', label: 'All twelve signs', hint: 'Stamp all 12 birthday-sign constellations', test: () => ZODIAC.every((k) => book.stamps[k]), icon: 'ring' },
  { id: 'polaris', label: 'Pole Star', hint: 'Stamp Ursa Minor, home of Polaris', test: () => Boolean(book.stamps.UMi), icon: 'pole' },
  { id: 'cross', label: 'Southern Cross', hint: 'Stamp Crux, the Southern Cross', test: () => Boolean(book.stamps.Cru), icon: 'cross' },
  { id: 'kinds', label: 'Galaxy, nebula, cluster', hint: 'Open a photograph of a galaxy, a nebula and a star cluster', test: () => ['galaxy', 'nebula', 'star'].every((c) => book.kinds[c]), icon: 'kinds' },
  { id: 'week', label: 'A week of guesses', hint: 'Solve the Cosmic guess 7 days in a row', test: () => guessStats().best >= 7, icon: 'week' },
  { id: 'birthday', label: 'Birthday sky', hint: 'Look up the universe on your birthday', test: () => Boolean(book.flags.birthday), icon: 'cake' },
  { id: 'owl', label: 'Night owl', hint: 'Visit Tonight’s sky between midnight and 4 am', test: () => Boolean(book.flags.owl), icon: 'owl' },
  { id: 'sharp', label: 'Eagle eye', hint: 'Solve a Cosmic guess on the very first look', test: () => Boolean(book.flags.sharp), icon: 'eye' },
  { id: 'phew', label: 'Phew', hint: 'Solve a Cosmic guess on your last look', test: () => Boolean(book.flags.phew), icon: 'phew' },
  { id: 'moonwave', label: 'Wave at the Moon', hint: 'Tap the Moon on Tonight’s sky', test: () => Boolean(book.flags.moon), icon: 'moon' },
  { id: 'planets', label: 'Planet spotter', hint: 'Tap three different planets on Tonight’s sky', test: () => Object.keys(book.planets || {}).length >= 3, icon: 'planet' },
  { id: 'timetravel', label: 'Time traveler', hint: 'Set Tonight’s sky to a night at least ten years away', test: () => Boolean(book.flags.travel), icon: 'hourglass' },
  { id: 'redlight', label: 'Red-eye mode', hint: 'Turn on Night vision', test: () => Boolean(book.flags.red), icon: 'red' },
  { id: 'all', label: 'The whole sky', hint: 'Stamp all 88 constellations', test: (n) => n >= 88, icon: 'full' }
];

// ---------- earning ----------
let queue = [], toasting = false;
function stamp(raw, via) {
  const k = norm(raw);
  if (!k || !ALL.includes(k)) return;
  if (!book.stamps[k]) {
    book.stamps[k] = { date: today(), via };
    save();
    toast(`New stamp · ${NAME(k)}`, k);
  }
  checkStickers();
}
function checkStickers() {
  const n = Object.keys(book.stamps).length;
  for (const s of STICKERS) {
    if (!book.stickers[s.id] && s.test(n)) { book.stickers[s.id] = today(); save(); toast(`New sticker · ${s.label}`); }
  }
  if (location.hash === '#passport') render();
}

document.addEventListener('photo:change', ({ detail: { item } }) => {
  if (!item) return;
  const e = INDEX_BY_ID[item.id];
  if (item.cat && item.cat !== 'night') { book.kinds[item.cat] = true; save(); }
  const con = e?.con || item.sky?.con;
  if (con) stamp(con, 'photo'); else checkStickers();
});
document.addEventListener('sky:visit', ({ detail: { con } }) => stamp(con, 'sky'));
const flag = (f) => { if (!book.flags[f]) { book.flags[f] = true; save(); checkStickers(); } };
document.addEventListener('sky:body', ({ detail: { id } }) => {
  if (id === 'moon') flag('moon');
  else { book.planets = book.planets || {}; if (!book.planets[id]) { book.planets[id] = true; save(); checkStickers(); } }
});
document.addEventListener('sky:date', ({ detail: { date } }) => { if (Math.abs(Number(date.slice(0, 4)) - new Date().getFullYear()) >= 10) flag('travel'); });
document.addEventListener('sky:nightvision', () => flag('red'));
document.addEventListener('guess:done', ({ detail }) => {
  if (detail.won && detail.picks.length === 1) flag('sharp');
  if (detail.won && detail.picks.length === 3) flag('phew');
  const con = INDEX_BY_ID[detail.id]?.con;
  if (detail.won && con) stamp(con, 'guess'); else checkStickers();
});
document.addEventListener('birthday:shown', () => { book.flags.birthday = true; save(); checkStickers(); });
function owl() {
  const h = new Date().getHours();
  if (location.hash === '#sky' && h < 4 && !book.flags.owl) { book.flags.owl = true; save(); checkStickers(); }
}
addEventListener('hashchange', owl);
owl();

// A small note at the bottom of the screen when something new goes in the passport.
function toast(text, k) {
  queue.push([text, k]);
  if (!toasting) nextToast();
}
function nextToast() {
  const item = queue.shift();
  if (!item) { toasting = false; return; }
  toasting = true;
  let el = $('#ppToast');
  if (!el) {
    el = document.createElement('button');
    el.id = 'ppToast'; el.type = 'button'; el.className = 'pp-toast';
    el.addEventListener('click', () => { location.hash = 'passport'; el.classList.remove('on'); });
    document.body.append(el);
  }
  el.innerHTML = `<span class="pp-toast-k">Sky passport</span><span>${esc(item[0])}</span><span class="pp-toast-go">Open →</span>`;
  requestAnimationFrame(() => el.classList.add('on'));
  setTimeout(() => { el.classList.remove('on'); setTimeout(nextToast, 450); }, 3600);
}

// ---------- the scrapbook ----------
let SKY = null;
const loadSky = () => SKY || (SKY = fetch('data/sky.json').then((r) => r.json()));
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

// The constellation's stick figure, flattened around its center and fitted inside the stamp.
let STAR_GRID = null;
// The brightness (magnitude) of the catalog star at a line's corner, so brighter stars press in deeper.
function magAt(sky, lon, lat) {
  if (!STAR_GRID) { STAR_GRID = new Map(); for (const [ra, dec, m] of sky.stars) { const key = `${Math.round(ra)},${Math.round(dec)}`; (STAR_GRID.get(key) || STAR_GRID.set(key, []).get(key)).push([ra, dec, m]); } }
  const ra = ((lon % 360) + 360) % 360; let best = null, bd = 0.6;
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    for (const [r, d, m] of STAR_GRID.get(`${(Math.round(ra) + i + 360) % 360},${Math.round(lat) + j}`) || []) {
      const dd = Math.hypot(((r - ra + 540) % 360 - 180) * Math.cos(lat * Math.PI / 180), d - lat);
      if (dd < bd) { bd = dd; best = m; }
    }
  }
  return best ?? 4.5;
}

// The constellation's stick figure, flattened around its center and fitted inside the stamp. Each corner of the
// figure is a star; it comes back with its magnitude so the seal can size it.
function figure(k, sky) {
  const parts = k === 'Ser' ? [sky.con.Ser1, sky.con.Ser2] : [sky.con[k]];
  const [lon0, lat0] = parts.length > 1 ? [(parts[0].c[0] + parts[1].c[0]) / 2, (parts[0].c[1] + parts[1].c[1]) / 2] : parts[0].c;
  const cos = Math.cos(lat0 * Math.PI / 180);
  const P = ([lon, lat]) => [-(((lon - lon0 + 540) % 360) - 180) * cos, -(lat - lat0)];
  const raw = parts.flatMap((c) => (c.l?.length ? c.l : [c.b]));
  let lines = raw.map((l) => l.map(P));
  const pts = lines.flat();
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1);
  const s = 46 / span;
  lines = lines.map((l) => l.map(([x, y]) => [50 + (x - cx) * s, 50 + (y - cy) * s]));
  const seen = new Set(), stars = [];
  lines.forEach((l, li) => l.forEach(([x, y], pi) => {
    const key = `${x.toFixed(0)},${y.toFixed(0)}`;
    if (!seen.has(key)) { seen.add(key); stars.push([x, y, sky.stars ? magAt(sky, ...raw[li][pi]) : 3]); }
  }));
  return { lines, pts: stars };
}

// ---- hand drawing: everything on a stamp is sketched as if with a pencil and coloured in with crayon ----
// seeded wobble, so each stamp is drawn the same way every time
const rng = (seed) => { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
const f1 = (n) => (+n).toFixed(1);
// a wobbly pencil line through the points, gone over twice like a real sketch
function sketch(lines, r, amp = 1.1, passes = 2) {
  let d = '';
  for (const l of lines) for (let pass = 0; pass < passes; pass++) {
    const j = () => (r() - 0.5) * amp * (pass ? 1.7 : 1);
    d += `M${f1(l[0][0] + j())} ${f1(l[0][1] + j())}`;
    for (let i = 1; i < l.length; i++) {
      const [x0, y0] = l[i - 1], [x1, y1] = l[i];
      d += `Q${f1((x0 + x1) / 2 + j() * 1.5)} ${f1((y0 + y1) / 2 + j() * 1.5)} ${f1(x1 + j())} ${f1(y1 + j())}`;
    }
  }
  return d;
}
// a closed outline from a function of the angle, with a little overshoot where the pencil comes round again
const loop = (rad, n = 48) => { const pts = []; for (let i = 0; i <= n + 3; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; const r = rad(a); pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]); } return pts; };
const cap = (t) => t.replace(/\b\w/g, (c) => c.toUpperCase());
const nickname = (k) => { const a = (CON_ALIASES[k === 'Ser' ? 'Ser1' : k] || [])[0]; return a && a.toLowerCase() !== NAME(k).toLowerCase() ? `the ${cap(a).replace(/^The /, '')}` : ''; };
const closed = (l) => `M${l.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z`;

// Wax colors for the seals: deep, slightly dusty tones that read as real sealing wax.
const WAX = ['#a4282f', '#2d4a86', '#b8841f', '#2f6a4f', '#6a3a88', '#bf5a26', '#8a2f55', '#1f6470'];
// The outline of a blob of melted wax: round, but lumpy, with a few spills where it ran out from under the seal.
function waxBlob(r) {
  const ph = [r() * 6.3, r() * 6.3, r() * 6.3];
  const spills = Array.from({ length: 2 + Math.floor(r() * 3) }, () => [r() * Math.PI * 2, 2.5 + r() * 3.5, 0.18 + r() * 0.22]);
  const pts = [];
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    let rad = 40 + 1.4 * Math.sin(3 * a + ph[0]) + 0.9 * Math.sin(5 * a + ph[1]) + 0.5 * Math.sin(11 * a + ph[2]);
    for (const [c, h, w] of spills) { const d = Math.atan2(Math.sin(a - c), Math.cos(a - c)); rad += h * Math.exp(-(d * d) / (2 * w * w)); }
    pts.push([50 + rad * Math.cos(a), 50 + rad * Math.sin(a)]);
  }
  return closed(pts);
}

function stampHtml(k, sky) {
  const st = book.stamps[k];
  const h = hash(k), wax = WAX[h % WAX.length], tilt = ((h % 15) - 7) * 1.4;
  const r = rng(h);
  const { lines, pts } = figure(k, sky);
  const name = NAME(k);
  const fresh = st && !book.seen?.[k];
  const nick = nickname(k);
  const id = `pp${k}`;
  const label = st ? `${name}${nick ? `, ${nick}` : ''}, stamped ${short(st.date)} from ${VIA[st.via] || 'the site'}` : `${name}, not stamped yet`;
  // the figure, pressed into the middle of the seal
  const fig = (cls) => `<g class="${cls}" transform="translate(50 61) scale(.52) translate(-50 -50)"><path d="${lines.map((l) => `M${l.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}`).join('')}"/>${pts.map(([x, y, m]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(Math.max(1.9, Math.min(4.6, 4.1 - 0.55 * m)))}"/>`).join('')}</g>`;
  // the name runs around the rim, as on a real seal
  const fs = name.length > 13 ? 5.1 : name.length > 9 ? 5.9 : 6.8;
  const rim = `<path id="${id}t" d="M27.5 58a22.5 22.5 0 0 1 45 0" fill="none"/>`;
  const text = (cls, dx = 0, dy = 0) => `<text class="${cls}" style="font-size:${fs}px" ${dx || dy ? `transform="translate(${dx} ${dy})"` : ''}><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${esc(name.toUpperCase())}</textPath></text>`;
  const svg = st
    ? `<defs>
        <radialGradient id="${id}g" cx="36%" cy="30%" r="78%"><stop offset="0" class="w-hi"/><stop offset=".55" class="w-mid"/><stop offset="1" class="w-lo"/></radialGradient>
        <linearGradient id="${id}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="w-lo"/><stop offset="1" class="w-mid"/></linearGradient>
        <linearGradient id="${id}f" x1=".2" y1=".1" x2=".8" y2=".95"><stop offset="0" class="f-a"/><stop offset="1" class="f-b"/></linearGradient>
        ${rim}
      </defs>
      <g class="pp-wax" filter="url(#ppWax)">
        <path class="w-blob" d="${waxBlob(r)}" fill="url(#${id}g)"/>
        <circle class="w-well" cx="50" cy="54" r="28" fill="url(#${id}d)"/>
        <circle class="w-lip" cx="50" cy="54" r="28"/>
        <circle class="w-face" cx="50" cy="54" r="27.2" fill="url(#${id}f)"/>
        ${fig('w-fig hi')}${fig('w-fig')}
        ${text('w-name hi', 0.35, 0.45)}${text('w-name')}
      </g>`
    : `<defs>${rim}</defs>
      <g class="pp-draw">
        <path class="pp-ghost" d="${sketch([loop(() => 38, 60)], r, 1.2)}"/>
        <path class="pp-ghost thin" d="${sketch([loop(() => 28, 48).map(([x, y]) => [x, y + 4])], r, 0.8, 1)}"/>
        ${fig('pp-ghost-fig')}
      </g>
      ${text('pp-ghost-name')}`;
  return `<li><button type="button" class="pp-stamp${st ? ' on' : ''}${fresh ? ' fresh' : ''}" data-con="${k}" aria-label="${esc(label)}. Show it on Tonight’s sky" style="--stamp:${wax};--tilt:${st ? tilt : 0}deg">
    <svg viewBox="0 0 100 100" aria-hidden="true">${svg}</svg>
    <span class="pp-nick">${esc(nick || ' ')}</span>
    <span class="pp-when">${st ? esc(short(st.date)) : ''}</span></button></li>`;
}

const ICONS = {
  star: '<path d="M12 3l2.4 5.6 6 .5-4.6 4 1.4 5.9L12 16l-5.2 3 1.4-5.9-4.6-4 6-.5z"/>',
  ten: '<text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700">10</text>',
  quarter: '<path d="M12 12V3a9 9 0 0 1 9 9z"/><circle cx="12" cy="12" r="9" fill="none"/>',
  half: '<path d="M12 3a9 9 0 0 1 0 18z"/><circle cx="12" cy="12" r="9" fill="none"/>',
  full: '<circle cx="12" cy="12" r="9"/>',
  ring: '<circle cx="12" cy="12" r="8" fill="none" stroke-dasharray="2.1 2.1"/><circle cx="12" cy="12" r="2.5"/>',
  pole: '<path d="M12 4l1.6 6.4L20 12l-6.4 1.6L12 20l-1.6-6.4L4 12l6.4-1.6z"/>',
  cross: '<circle cx="12" cy="4.5" r="1.8"/><circle cx="12" cy="19.5" r="1.8"/><circle cx="5" cy="11" r="1.6"/><circle cx="18.5" cy="12" r="1.4"/><path d="M12 6v12M6.5 11l10.5 1" fill="none"/>',
  kinds: '<ellipse cx="7" cy="9" rx="4.5" ry="2" transform="rotate(-25 7 9)" fill="none"/><rect x="13" y="5" width="7" height="7" fill="none"/><circle cx="12" cy="17" r="3.5" fill="none" stroke-dasharray="1.6 1.2"/>',
  week: '<rect x="3.5" y="5.5" width="17" height="15" rx="2" fill="none"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4" fill="none"/><text x="12" y="18.5" text-anchor="middle" font-size="7" font-weight="700">7</text>',
  cake: '<path d="M5 20v-7h14v7zM5 15.5c2 1.4 3.5-1 5 0s3 1.4 5 0 3-1.4 4 0" fill="none"/><path d="M12 9v4" fill="none"/><path d="M12 4.5c1.2 1.4 1.2 2.6 0 3.4-1.2-.8-1.2-2 0-3.4z"/>',
  moon: '<path d="M16.5 15.5A7 7 0 0 1 9 4.6a7.5 7.5 0 1 0 7.5 10.9z"/>',
  owl: '<path d="M5 9c0-3 2-5 7-5s7 2 7 5v6c0 3-3 5-7 5s-7-2-7-5z" fill="none"/><circle cx="9.3" cy="10.5" r="2.2" fill="none"/><circle cx="14.7" cy="10.5" r="2.2" fill="none"/><circle cx="9.3" cy="10.5" r=".8"/><circle cx="14.7" cy="10.5" r=".8"/><path d="M12 12.5l-.9 1.6h1.8z"/><path d="M5.5 5.5L8 7.5M18.5 5.5L16 7.5" fill="none"/>',
  eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" fill="none"/><circle cx="12" cy="12" r="3"/><path d="M19 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
  phew: '<circle cx="12" cy="12" r="8.5" fill="none"/><path d="M8.5 10h1.5M14 10h1.5" fill="none"/><path d="M8.8 14.6c1.8 1.6 4.6 1.6 6.4 0" fill="none"/><path d="M18.6 5.2c.9 1.3.9 2.3 0 3-.9-.7-.9-1.7 0-3z"/>',
  planet: '<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10" ry="3.2" transform="rotate(-20 12 12)" fill="none"/>',
  hourglass: '<path d="M7 3.5h10M7 20.5h10M8 3.5c0 5 8 5 8 8.5s-8 3.5-8 8.5M16 3.5c0 5-8 5-8 8.5s8 3.5 8 8.5" fill="none"/><path d="M10 18.5h4l-2-2.2z"/>',
  red: '<circle cx="12" cy="12" r="8.5" fill="none"/><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" fill="none"/>'
};
function stickerHtml(s, i) {
  const got = book.stickers[s.id];
  const tilt = ((hash(s.id) % 11) - 5) * 1.2;
  return `<li class="pp-sticker${got ? ' on' : ''}" style="--tilt:${got ? tilt : 0}deg;--hue:${(i * 47) % 360}">
    <span class="pp-sticker-badge" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[s.icon]}</svg></span>
    <span class="pp-sticker-text"><strong>${esc(s.label)}</strong><em>${got ? `Earned ${esc(short(got))}` : esc(s.hint)}</em></span></li>`;
}

async function render() {
  const sky = await loadSky();
  const n = Object.keys(book.stamps).length, got = STICKERS.filter((x) => book.stickers[x.id]).length;
  $('#ppTally').innerHTML = `<b>${n}</b> of 88 constellations stamped <span>·</span> <b>${got}</b> of ${STICKERS.length} stickers`;
  const lat = (k) => (k === 'Ser' ? 0 : sky.con[k].c[1]);
  const north = ALL.filter((k) => !ZODIAC.includes(k) && lat(k) >= 0).sort((a, b) => NAME(a).localeCompare(NAME(b)));
  const south = ALL.filter((k) => !ZODIAC.includes(k) && lat(k) < 0).sort((a, b) => NAME(a).localeCompare(NAME(b)));
  const page = (title, note, keys, tape) => {
    const have = keys.filter((k) => book.stamps[k]).length;
    return `<section class="pp-page" style="--tape:${tape}"><header class="pp-page-head"><span class="pp-tape" aria-hidden="true"></span>
      <h3>${title}</h3><p>${note} · <b>${have}</b> of ${keys.length}</p></header><ul class="pp-stamps">${keys.map((k) => stampHtml(k, sky)).join('')}</ul></section>`;
  };
  $('#ppBook').innerHTML =
    `<section class="pp-page pp-stickers-page" style="--tape:rgba(242,193,78,.32)"><header class="pp-page-head"><span class="pp-tape" aria-hidden="true"></span>
      <h3>Stickers</h3><p>Little milestones · <b>${got}</b> of ${STICKERS.length}</p></header><ul class="pp-stickers">${STICKERS.map(stickerHtml).join('')}</ul></section>` +
    page('Birthday signs', 'Twelve constellations you already know by name', ZODIAC, 'rgba(226,85,61,.3)') +
    page('The northern sky', 'North of the celestial equator', north, 'rgba(169,198,240,.3)') +
    page('The southern sky', 'South of the celestial equator', south, 'rgba(143,201,163,.3)');
  // newly earned stamps get a little "thunk" the first time you see them
  book.seen = book.seen || {};
  for (const k of Object.keys(book.stamps)) book.seen[k] = true;
  save();
}
$('#ppBook').addEventListener('click', (e) => { const b = e.target.closest('.pp-stamp'); if (b) showConOnSky(b.dataset.con === 'Ser' ? 'Ser1' : b.dataset.con); });
addEventListener('hashchange', () => { if (location.hash === '#passport') render(); });
if (location.hash === '#passport') render();
