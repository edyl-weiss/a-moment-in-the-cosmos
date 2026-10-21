// Sky passport: a scrapbook of the constellations you've explored, with wax seals for milestones.
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

// Seals: little milestones, in the order they're shown.
const STICKERS = [
  { id: 'first', label: 'One small step', hint: 'Stamp any constellation', test: (n) => n >= 1, icon: 'star' },
  { id: 'zodiac', label: 'All twelve signs', hint: 'Stamp all 12 birthday-sign constellations', test: () => ZODIAC.every((k) => book.stamps[k]), icon: 'ring' },
  { id: 'polaris', label: 'Pole Star', hint: 'Stamp Ursa Minor, home of Polaris', test: () => Boolean(book.stamps.UMi), icon: 'pole' },
  { id: 'cross', label: 'Southern Cross', hint: 'Stamp Crux, the Southern Cross', test: () => Boolean(book.stamps.Cru), icon: 'cross' },
  { id: 'kinds', label: 'Galaxy, nebula, cluster', hint: 'Open a photograph of a galaxy, a nebula and a star cluster', test: () => ['galaxy', 'nebula', 'star'].every((c) => book.kinds[c]), icon: 'kinds' },
  { id: 'week', label: 'Weekly orbit', hint: 'Solve the Cosmic guess 7 days in a row', test: () => guessStats().best >= 7, icon: 'week' },
  { id: 'birthday', label: 'Birthday sky', hint: 'Look up the universe on your birthday', test: () => Boolean(book.flags.birthday), icon: 'cake' },
  { id: 'owl', label: 'Night owl', hint: 'Visit Tonight’s sky between midnight and 4 am', test: () => Boolean(book.flags.owl), icon: 'owl' },
  { id: 'sharp', label: 'Eagle eye', hint: 'Solve a Cosmic guess on the very first look', test: () => Boolean(book.flags.sharp), icon: 'eye' },
  { id: 'phew', label: 'Phew', hint: 'Solve a Cosmic guess on your last look', test: () => Boolean(book.flags.phew), icon: 'phew' },
  { id: 'moonwave', label: 'Wave at the Moon', hint: 'Tap the Moon on Tonight’s sky', test: () => Boolean(book.flags.moon), icon: 'moon' },
  { id: 'planets', label: 'Planet spotter', hint: 'Tap three different planets on Tonight’s sky', test: () => Object.keys(book.planets || {}).length >= 3, icon: 'planet' },
  { id: 'timetravel', label: 'Time traveler', hint: 'Set Tonight’s sky to a night at least ten years away', test: () => Boolean(book.flags.travel), icon: 'hourglass' },
  { id: 'redlight', label: 'Seeing red', hint: 'Turn on Night vision', test: () => Boolean(book.flags.red), icon: 'red' },
  { id: 'thennow', label: 'Then and now', hint: 'Slide between Hubble’s and Webb’s view of the same spot', test: () => Boolean(book.flags.compare), icon: 'split' },
  { id: 'closeup', label: 'Nose to the glass', hint: 'Zoom in four times closer in Immersive view', test: () => Boolean(book.flags.zoom), icon: 'loupe' },
  { id: 'deeptime', label: 'Ancient light', hint: 'Open a photograph of something over a billion light-years away', test: () => Boolean(book.flags.deep), icon: 'spiral' },
  { id: 'lucky', label: 'Feeling lucky', hint: 'Press Surprise me three times in one visit', test: () => Boolean(book.flags.lucky), icon: 'dice' },
  { id: 'tour', label: 'Tour guide', hint: 'Follow a guided tour all the way to its last stop', test: () => Boolean(book.flags.tour), icon: 'flag' },
  { id: 'wow', label: 'Mind blown', hint: 'React “Wow” to a photograph', test: () => Boolean(book.flags.wow), icon: 'burst' },
  { id: 'fullhouse', label: 'Full house', hint: 'Open a photograph from Hubble, Webb, ESO, NOIRLab and NASA', test: () => ['hubble', 'webb', 'eso', 'noirlab', 'nasa'].every((o) => book.orgs?.[o]), icon: 'fan' },
  { id: 'nickname', label: 'Hidden in plain sight', hint: 'Find a constellation on Tonight’s sky by its nickname, like “Big Dipper”', test: () => Boolean(book.flags.nickname), icon: 'seek' },
  { id: 'curious', label: 'Down the rabbit hole', hint: 'Open both “Look closer” and “Behind the photograph” on the same photograph', test: () => Boolean(book.flags.curious), icon: 'cat' },
  { id: 'calendar', label: 'Calendar hopper', hint: 'Visit “On this day” on five different dates', test: () => Object.keys(book.otd || {}).length >= 5, icon: 'calhop' },
  { id: 'starcrossed', label: 'Star-crossed', hint: 'Save five photographs to your Favorites', test: () => (store.get('amitc.favorites.v1', []) || []).length >= 5, icon: 'heart' },
  { id: 'moonstruck', label: 'Moonstruck', hint: 'Find a full Moon on Tonight’s sky (try another date)', test: () => Boolean(book.flags.fullmoon), icon: 'fullmoon' },
  { id: 'firstline', label: 'First in line', hint: 'Visit within an hour of the new photographs arriving', test: () => Boolean(book.flags.early), icon: 'clock' },
  { id: 'hemi', label: 'Hemisphere hopper', hint: 'Switch Tonight’s sky between the whole northern and southern views', test: () => Boolean(book.flags.hemiN && book.flags.hemiS), icon: 'globe' },
  { id: 'twin', label: 'Birthday twin', hint: 'Open a photograph released on your birthday', test: () => Boolean(book.flags.twin), icon: 'twin' },
  { id: 'hopping', label: 'Star-hopping', hint: 'Visit ten constellations on Tonight’s sky in one visit', test: () => Boolean(book.flags.hop), icon: 'hop' },
  { id: 'rewind', label: 'Rewind', hint: 'Step back through seven days of the archive with Previous', test: () => Boolean(book.flags.rewind), icon: 'rewind' },
  { id: 'quick', label: 'Quick draw', hint: 'Solve the Cosmic guess within 20 seconds', test: () => Boolean(book.flags.quick), icon: 'bolt' },
  { id: 'messier', label: 'Messier business', hint: 'Search for an object by its catalog number, like “M42” or “NGC 1300”', test: () => Boolean(book.flags.catalog), icon: 'mtag' },
  { id: 'namedrop', label: 'Name dropper', hint: 'Read the name origins of ten different objects', test: () => Object.keys(book.names || {}).length >= 10, icon: 'tag' },
  { id: 'warp', label: 'Warp drive', hint: 'Warp to a galaxy, a nebula, a star and a night sky', test: () => ['galaxy', 'nebula', 'star', 'night'].every((c) => book.warps?.[c]), icon: 'warp' },
  { id: 'perfect', label: 'Perfect ten', hint: 'Solve ten Cosmic guesses in all', test: () => guessStats().won >= 10, icon: 'ten' },
  { id: 'regular', label: 'Frequent flyer', hint: 'Visit on five different days', test: () => Object.keys(book.days || {}).length >= 5, icon: 'rocket' },
  { id: 'neighbor', label: 'Hello, neighbor', hint: 'Open a photograph of the Andromeda Galaxy or a Magellanic Cloud', test: () => Boolean(book.flags.neighbor), icon: 'wave' },
  { id: 'nakedeye', label: 'Naked eye', hint: 'Turn off the star figures and names on Tonight’s sky', test: () => Boolean(book.flags.bare), icon: 'eyeopen' },
  { id: 'all', label: 'Sky’s the limit', hint: 'Stamp all 88 constellations', test: (n) => n >= 88, icon: 'full' }
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
    if (!book.stickers[s.id] && s.test(n)) { book.stickers[s.id] = today(); save(); toast(`New seal · ${s.label}`); }
  }
  if (location.hash === '#passport') render();
}

document.addEventListener('photo:change', ({ detail: { item } }) => {
  if (!item) return;
  const e = INDEX_BY_ID[item.id];
  if (item.cat && item.cat !== 'night') { book.kinds[item.cat] = true; save(); }
  if (/billion light/i.test(item.celestial || '') && !book.flags.deep) { book.flags.deep = true; save(); }
  if (/Andromeda Galaxy|Magellanic Cloud|\bM ?31\b|Messier 31/i.test(`${item.title} ${item.celestial || ''}`)) flag('neighbor');
  const bd = store.get('bday', '');
  if (bd && item.releaseDate) { const [, m, d] = bd.split('-').map(Number), r = new Date(item.releaseDate + ' UTC'); if (r.getUTCMonth() + 1 === m && r.getUTCDate() === d) flag('twin'); }
  if (item.org) { book.orgs = book.orgs || {}; if (!book.orgs[item.org]) { book.orgs[item.org] = true; save(); } }
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
document.addEventListener('seal:compare', () => flag('compare'));
document.addEventListener('seal:zoom', () => flag('zoom'));
document.addEventListener('seal:tour', () => flag('tour'));
document.addEventListener('seal:wow', () => flag('wow'));
document.addEventListener('sky:fullmoon', () => flag('fullmoon'));
document.addEventListener('sky:hemi', ({ detail: { mode } }) => { if (mode === 'N') flag('hemiN'); if (mode === 'S') flag('hemiS'); });
document.addEventListener('sky:bare', () => flag('bare'));
const hops = new Set();
document.addEventListener('sky:visit', ({ detail: { con } }) => { hops.add(con); if (hops.size >= 10) flag('hop'); });
let backs = 0;
document.addEventListener('seal:prev', () => { if (++backs >= 7) flag('rewind'); });
document.addEventListener('seal:search', ({ detail: { q } }) => { if (/^\s*(m|messier|ngc|ic|caldwell|c)\s?-?\d+/i.test(q)) flag('catalog'); });
document.addEventListener('seal:name', ({ detail: { key } }) => { book.names = book.names || {}; if (!book.names[key]) { book.names[key] = true; save(); checkStickers(); } });
document.addEventListener('seal:warp', ({ detail: { cat } }) => { book.warps = book.warps || {}; if (!book.warps[cat]) { book.warps[cat] = true; save(); checkStickers(); } });
document.addEventListener('favorites:change', () => checkStickers());
// visits on different days, and "First in line": within an hour of the new photograph (midnight UTC)
{ book.days = book.days || {}; const d = new Date().toISOString().slice(0, 10); if (!book.days[d]) { book.days[d] = true; save(); } if (new Date().getUTCHours() === 0) book.flags.early = true; save(); setTimeout(checkStickers, 0); }
// Curious cat: both panels under one photograph opened
let curiousOn = null, opened = new Set();
document.addEventListener('photo:change', ({ detail: { item } }) => { if (item?.id !== curiousOn) { curiousOn = item?.id; opened = new Set(); } });
for (const id of ['exploreDetails', 'behindDetails']) {
  document.getElementById(id)?.addEventListener('toggle', (e) => { if (e.target.open) { opened.add(id); if (opened.size === 2) flag('curious'); } });
}
document.addEventListener('seal:nickname', () => flag('nickname'));
document.addEventListener('seal:otd', ({ detail: { date } }) => { book.otd = book.otd || {}; if (!book.otd[date]) { book.otd[date] = true; save(); checkStickers(); } });
let surprises = 0;
document.addEventListener('seal:surprise', () => { if (++surprises >= 3) flag('lucky'); });
document.addEventListener('guess:done', ({ detail }) => {
  if (detail.won && detail.picks.length === 1) flag('sharp');
  if (detail.won && detail.picks.length === 3) flag('phew');
  if (detail.won && detail.secs != null && detail.secs <= 20) flag('quick');
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

// ---- hand drawing: everything on a stamp is sketched as if with a pencil and colored in with crayon ----
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
export const WAX = ['#a4282f', '#2d4a86', '#b8841f', '#2f6a4f', '#6a3a88', '#bf5a26', '#8a2f55', '#1f6470'];
// The outline of a blob of melted wax: round, but lumpy, with a few spills where it ran out from under the seal.
function waxBlob(r) {
  const ph = [r() * 6.3, r() * 6.3, r() * 6.3];
  // a few big lobes where the wax pooled out, plus gentle waviness all round
  const lobes = Array.from({ length: 4 + Math.floor(r() * 3) }, () => [r() * Math.PI * 2, 2.5 + r() * 5, 0.2 + r() * 0.28]);
  // and a couple of pinches where the wax pulled in
  const notches = Array.from({ length: 2 + Math.floor(r() * 2) }, () => [r() * Math.PI * 2, 1.5 + r() * 2, 0.08 + r() * 0.08]);
  const pts = [];
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    let rad = 37 + 1.6 * Math.sin(2 * a + ph[0]) + 1.4 * Math.sin(3 * a + ph[1]) + 1.1 * Math.sin(5 * a + ph[2]) + 0.6 * Math.sin(7 * a + ph[0] * 2);
    for (const [c, h, w] of lobes) { const d = Math.atan2(Math.sin(a - c), Math.cos(a - c)); rad += h * Math.exp(-(d * d) / (2 * w * w)); }
    for (const [c, h, w] of notches) { const d = Math.atan2(Math.sin(a - c), Math.cos(a - c)); rad -= h * Math.exp(-(d * d) / (2 * w * w)); }
    pts.push([50 + Math.min(rad, 47) * Math.cos(a), 50 + Math.min(rad, 47) * Math.sin(a)]);
  }
  // smooth: curve through the midpoints, using each point as the control
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M${mid(pts[pts.length - 1], pts[0]).map(f1).join(' ')}`;
  pts.forEach((p, i) => { const m = mid(p, pts[(i + 1) % pts.length]); d += `Q${f1(p[0])} ${f1(p[1])} ${f1(m[0])} ${f1(m[1])}`; });
  return d + 'Z';
}
// the scalloped border pressed into the seal face
const scallop = (cx, cy, rad, n = 30, amp = 0.9) => { let d = ''; for (let i = 0; i <= n * 4; i++) { const a = (i / (n * 4)) * Math.PI * 2, q = rad + amp * Math.abs(Math.sin((a * n) / 2)) * -1 + amp / 2; d += `${i ? 'L' : 'M'}${f1(cx + q * Math.cos(a))} ${f1(cy + q * Math.sin(a))}`; } return d + 'Z'; };

// crayon coloring: loose, slightly curved strokes back and forth across the shape
function scribble(r, box = [6, 6, 94, 94], gap = 2.6) {
  const [x0, y0, x1, y1] = box, ang = (-32 + r() * 18) * Math.PI / 180, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const L = Math.hypot(x1 - x0, y1 - y0) / 2 + 4, ca = Math.cos(ang), sa = Math.sin(ang);
  const T = (u, v) => `${f1(cx + u * ca - v * sa)} ${f1(cy + u * sa + v * ca)}`;
  let d = '';
  for (let v = -L; v <= L; v += gap * (0.8 + r() * 0.45)) {
    const a = -L - r() * 3, b = L + r() * 3, bow = (r() - 0.5) * 3;
    d += `M${T(a, v)}Q${T(0, v + bow)} ${T(b, v + (r() - 0.5) * 1.5)}`;
  }
  return d;
}
// a little doodled five-pointed star
function doodleStar(x, y, rad, r) {
  const pts = [];
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + (r() - 0.5) * 0.18; const q = (i % 2 ? rad * 0.46 : rad) * (0.9 + r() * 0.2); pts.push(`${f1(x + q * Math.cos(a))} ${f1(y + q * Math.sin(a))}`); }
  return `<path class="pp-sp" d="M${pts.join('L')}Z"/>`;
}

// Stamps come in four shapes, each in a soft pastel crayon: a postage stamp with a perforated edge, a scalloped
// flower, a little cloud and a round badge with a wavy rim. A ribbon carries the name.
const SHAPES = {
  postage: (r) => {
    const w = () => (r() - 0.5) * 1.6;
    const box = [[9 + w(), 9 + w()], [91 + w(), 9 + w()], [91 + w(), 91 + w()], [9 + w(), 91 + w()]];
    let holes = '';
    for (let i = 0; i <= 8; i++) { const p = 12 + i * 9.5; holes += `<circle cx="${f1(p + w() / 2)}" cy="9" r="2.5"/><circle cx="${f1(p + w() / 2)}" cy="91" r="2.5"/><circle cx="9" cy="${f1(p + w() / 2)}" r="2.5"/><circle cx="91" cy="${f1(p + w() / 2)}" r="2.5"/>`; }
    return { outline: [[...box, box[0], [box[1][0] - 3, box[1][1] + 0.6]]], inner: [[[16, 16.5], [84, 15.5], [84.5, 84], [15.5, 84.5], [16, 16.5]]], holes };
  },
  flower: () => ({ outline: [loop((a) => 41 + 6 * Math.abs(Math.cos(a * 8)), 96)], inner: [loop(() => 34, 40)] }),
  cloud: () => ({ outline: [loop((a) => 34 + 6 * Math.abs(Math.sin(a * 2.5 + 0.4)) + 4 * Math.sin(a), 72)], inner: [] }),
  badge: () => ({ outline: [loop((a) => 44 + 2.4 * Math.sin(a * 12), 120)], inner: [loop(() => 36, 40)] })
};
const SHAPE_NAMES = Object.keys(SHAPES);
const PASTELS = ['#ffb3c1', '#a9c6f0', '#ffd98a', '#b8e0c8', '#d9c2f0', '#ffc8a2'];

function stampHtml(k, sky) {
  const st = book.stamps[k];
  const h = hash(k), ink = PASTELS[h % PASTELS.length], tilt = ((h % 15) - 7) * 1.1;
  const r = rng(h);
  const shape = SHAPES[SHAPE_NAMES[(h >> 3) % SHAPE_NAMES.length]](r);
  const { lines, pts } = figure(k, sky);
  const name = NAME(k);
  const fresh = st && !book.seen?.[k];
  const nick = nickname(k);
  const id = `pp${k}`;
  const label = st ? `${name}${nick ? `, ${nick}` : ''}, stamped ${short(st.date)} from ${VIA[st.via] || 'the site'}` : `${name}, not stamped yet`;
  const ribbon = [[10, 70.5], [90, 69.5], [85.5, 78], [90, 86.5], [10, 86], [14.5, 78], [10, 70.5]];
  const stars = pts.map(([x, y], i) => (st ? doodleStar(x, y, i % 3 ? 3.2 : 4.2, r) : `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.3"/>`)).join('');
  const twinkles = st ? [[18 + (h % 7), 22], [80 - (h % 5), 26], [84, 70 - (h % 9)]].map(([x, y], i) => doodleStar(x, y, i === 1 ? 4.2 : 3, r)).join('') : '';
  const fs = name.length > 14 ? 10.6 : name.length > 10 ? 12.4 : 14.2;
  const fit = name.length * fs * 0.46 > 66 ? ' textLength="66" lengthAdjust="spacingAndGlyphs"' : '';
  const body = closed(shape.outline[0]);
  return `<li><button type="button" class="pp-stamp crayon${st ? ' on' : ''}${fresh ? ' fresh' : ''}" data-con="${k}" aria-label="${esc(label)}. Show it on Tonight’s sky" style="--stamp:${ink};--tilt:${st ? tilt : 0}deg">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs><clipPath id="${id}s"><path d="${body}"/></clipPath><clipPath id="${id}r"><path d="${closed(ribbon)}"/></clipPath></defs>
      <g class="pp-draw">
        ${st ? `<path class="pp-wash" d="${body}"/><path class="pp-crayon" clip-path="url(#${id}s)" d="${scribble(r)}"/>` : ''}
        ${shape.holes ? `<g class="pp-holes">${shape.holes}</g>` : ''}
        <path class="pp-shape" d="${sketch(shape.outline, r, 1.4)}"/>
        ${shape.inner.length ? `<path class="pp-inner" d="${sketch(shape.inner, r, 1, 1)}"/>` : ''}
        <g class="pp-fig" transform="translate(50 42) scale(.78) translate(-50 -50)"><path d="${sketch(lines, r, 1.6)}"/>${stars}</g>
        ${twinkles}
        ${st ? `<path class="pp-wash rib" d="${closed(ribbon)}"/><path class="pp-crayon rib" clip-path="url(#${id}r)" d="${scribble(r, [8, 68, 92, 88], 2.4)}"/>` : ''}
        <path class="pp-rib" d="${sketch([ribbon], r, 1.1)}"/>
      </g>
      <text class="pp-label" x="50" y="82.6" text-anchor="middle" style="font-size:${fs}px"${fit}>${esc(name)}</text>
    </svg>
    <span class="pp-nick">${esc(nick || ' ')}</span>
    <span class="pp-when">${st ? esc(short(st.date)) : ''}</span></button></li>`;
}

// Seals (the milestones): a blob of glossy sealing wax with the milestone's emblem pressed into it.
function sealSvg(s, i) { return waxSeal(s.id, WAX[(i * 3) % WAX.length], ICONS[s.icon]); }

// A seal of melted wax: a lumpy blob (its shape set by `key`), a pressed face with a scalloped border and an
// emblem (24 × 24 SVG markup), lit by the shared #ppWax filter. A `label` runs around the bottom of the face.
// Used for the passport's milestone seals and, from votes.js, for your pick and Yesterday's winner.
export function waxSeal(key, color, icon, { label = '', cls = '' } = {}) {
  const h = hash(key), r = rng(h), id = `w${h.toString(36)}`;
  const s = label ? 1.55 : 2.05, iy = label ? 46 : 50;
  return `<svg class="pp-seal${cls ? ` ${cls}` : ''}" viewBox="0 0 100 100" style="--stamp:${color}" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="${id}g" cx="36%" cy="30%" r="78%"><stop offset="0" class="w-hi"/><stop offset=".55" class="w-mid"/><stop offset="1" class="w-lo"/></radialGradient>
      <linearGradient id="${id}f" x1=".2" y1=".1" x2=".8" y2=".95"><stop offset="0" class="f-a"/><stop offset="1" class="f-b"/></linearGradient>
      <linearGradient id="${id}rh" x1="0" y1="0" x2="1" y2="1"><stop offset=".35" class="rh-a"/><stop offset="1" class="rh-b"/></linearGradient>
      <linearGradient id="${id}ws" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="ws-a"/><stop offset=".7" class="ws-b"/></linearGradient>
      <clipPath id="${id}c"><circle cx="50" cy="50" r="29"/></clipPath>
      ${label ? `<path id="${id}t" d="M29 52A21 21 0 0 0 71 52"/>` : ''}
    </defs>
    <g class="pp-wax" filter="url(#ppWax)">
      <path d="${waxBlob(r)}" fill="url(#${id}g)"/>
      <circle class="w-face" cx="50" cy="50" r="29" fill="url(#${id}f)"/>
      <circle class="w-shade" cx="50" cy="50" r="29" stroke="url(#${id}ws)" clip-path="url(#${id}c)" filter="url(#ppSoft)"/>
      <circle class="w-rimhi" cx="50" cy="50" r="31.6" stroke="url(#${id}rh)" filter="url(#ppSoft)"/>
      <circle class="w-lip" cx="50" cy="50" r="29.2"/>
      <path class="w-gloss" d="M19.5 37A33.5 33.5 0 0 1 38 18.5" filter="url(#ppSoft)"/><path class="w-gloss thin" d="M23.5 36.5A29 29 0 0 1 36.5 23.5"/><circle class="w-gloss-dot" cx="22.5" cy="31" r="1.2"/>
      <g filter="url(#ppMelt${h % 3})">
        <path class="w-scallop hi" d="${scallop(50.4, 50.5, 26.6)}"/><path class="w-scallop" d="${scallop(50, 50, 26.6)}"/>
        <g class="w-icon hi" transform="translate(50.7 ${iy + 0.8}) scale(${s}) translate(-12 -12)">${icon}</g>
        <g class="w-icon" transform="translate(50 ${iy}) scale(${s}) translate(-12 -12)">${icon}</g>
        ${label ? `<text class="w-label hi" dx=".5" dy=".6"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${label}</textPath></text>
        <text class="w-label"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${label}</textPath></text>` : ''}
      </g>
    </g></svg>`;
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
  split: '<circle cx="12" cy="12" r="8.5" fill="none"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z"/><path d="M12 1.5v21" fill="none"/>',
  loupe: '<circle cx="10" cy="10" r="6" fill="none"/><path d="M14.5 14.5l6 6" fill="none" stroke-width="2.4"/><path d="M10 7v6M7 10h6" fill="none"/>',
  spiral: '<path d="M12 12.2c.6-.9-.3-1.9-1.2-1.4-1.4.7-.9 2.9.6 3.2 2.2.4 3.7-1.9 3-3.9-.9-2.6-4.2-3.4-6.4-1.9-2.8 1.9-2.6 6.2.1 8 3.3 2.2 7.9.6 9.3-3 1.6-4.2-1.4-8.6-5.7-9.3" fill="none"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3" fill="none"/><circle cx="8.5" cy="8.5" r="1.4"/><circle cx="15.5" cy="15.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="15.5" cy="8.5" r="1.4"/><circle cx="8.5" cy="15.5" r="1.4"/>',
  flag: '<path d="M6 21V4" fill="none"/><path d="M6 4.5c3-1.5 5 1.5 8 0s3.5-.5 4.5 0v8c-1-.5-1.5-1.5-4.5 0s-5-1.5-8 0z"/>',
  burst: '<path d="M12 2.5l1.6 5.2 5-2.2-2.6 4.8 5.3 1.7-5.3 1.7 2.6 4.8-5-2.2-1.6 5.2-1.6-5.2-5 2.2 2.6-4.8-5.3-1.7 5.3-1.7-2.6-4.8 5 2.2z"/>',
  fan: '<path d="M12.0 2.4L12.8 4.2L14.8 4.4L13.2 5.7L13.7 7.6L12.0 6.6L10.3 7.6L10.8 5.7L9.2 4.4L11.2 4.2ZM18.8 7.4L19.6 9.2L21.6 9.4L20.1 10.7L20.6 12.6L18.8 11.6L17.1 12.6L17.6 10.7L16.1 9.4L18.1 9.2ZM16.2 15.4L17.0 17.3L19.0 17.4L17.5 18.7L17.9 20.7L16.2 19.6L14.5 20.7L15.0 18.7L13.5 17.4L15.5 17.3ZM7.8 15.4L8.5 17.3L10.5 17.4L9.0 18.7L9.5 20.7L7.8 19.6L6.1 20.7L6.5 18.7L5.0 17.4L7.0 17.3ZM5.2 7.4L5.9 9.2L7.9 9.4L6.4 10.7L6.9 12.6L5.2 11.6L3.4 12.6L3.9 10.7L2.4 9.4L4.4 9.2Z"/>',
  seek: '<circle cx="10" cy="10" r="6.5" fill="none"/><path d="M14.8 14.8l6 6" fill="none" stroke-width="2.4"/><circle cx="8" cy="8.5" r="1.1"/><circle cx="12" cy="9.5" r="1"/><circle cx="10" cy="12.4" r="1"/><path d="M8 8.5l4 1-2 2.9" fill="none" stroke-width=".8"/>',
  cat: '<path d="M5 20v-9l-1-6.5 4.5 3.5h7L20 4.5 19 11v9z" fill="none"/><circle cx="9.5" cy="13" r="1.2"/><circle cx="14.5" cy="13" r="1.2"/><path d="M11 16.3l1 .9 1-.9" fill="none"/><path d="M3 15.5l4 .7M3 18l4-.4M21 15.5l-4 .7M21 18l-4-.4" fill="none" stroke-width=".8"/>',
  calhop: '<rect x="4" y="5.5" width="16" height="14" rx="2" fill="none"/><path d="M4 9.5h16M8 3.5v4M16 3.5v4" fill="none"/><path d="M8 14.5h8M13.5 12l2.5 2.5-2.5 2.5" fill="none"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="none"/><path d="M12 10.2l.8 1.7 1.9.2-1.4 1.3.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.3 1.9-.2z"/>',
  fullmoon: '<circle cx="12" cy="12" r="8"/><circle cx="9.5" cy="10" r="1.3" fill="none"/><circle cx="14.5" cy="14" r="1.8" fill="none"/>',
  clock: '<circle cx="12" cy="12" r="8.5" fill="none"/><path d="M12 6.5V12l3.5 2" fill="none"/><path d="M12 2v1.5" fill="none"/>',
  globe: '<circle cx="12" cy="12" r="8.5" fill="none"/><path d="M3.5 12h17" fill="none"/><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5h-17A8.5 8.5 0 0 1 12 3.5z"/>',
  twin: '<path d="M4 20h16v-6H4z" fill="none"/><path d="M4 16.5c2 1 3 1 4 0s2-1 4 0 3 1 4 0 3-1 4 0" fill="none"/><path d="M9 14v-3M15 14v-3" fill="none"/><path d="M9 9.5c-.8-1-.4-2 0-3 .4 1 .8 2 0 3zM15 9.5c-.8-1-.4-2 0-3 .4 1 .8 2 0 3z"/>',
  hop: '<circle cx="4.5" cy="17" r="1.6"/><circle cx="9.5" cy="9" r="1.6"/><circle cx="14.5" cy="14" r="1.6"/><circle cx="19.5" cy="5.5" r="1.6"/><path d="M4.5 17c1-5 3-7 5-8M9.5 9c2 1 4 3 5 5M14.5 14c1-4 3-7 5-8.5" fill="none" stroke-dasharray="1.5 1.5"/>',
  rewind: '<path d="M11 6l-7 6 7 6zM20 6l-7 6 7 6z"/>',
  bolt: '<path d="M13.5 2.5L5.5 13.5h5.5L9.5 21.5l8-11h-5.5z"/>',
  mtag: '<text x="12" y="16.5" text-anchor="middle" font-size="13" font-weight="700" font-family="serif" stroke="none">M</text><circle cx="12" cy="12" r="9" fill="none"/>',
  tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8z" fill="none"/><circle cx="8" cy="9" r="1.6"/>',
  warp: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.2 3.2M15.2 15.2l3.2 3.2M5.6 18.4l3.2-3.2M15.2 8.8l3.2-3.2" fill="none"/><circle cx="12" cy="12" r="1.8"/>',
  ten: '<text x="12" y="16.3" text-anchor="middle" font-size="11" font-weight="700" font-family="serif" stroke="none">10</text><circle cx="12" cy="12" r="9" fill="none"/>',
  rocket: '<path d="M12 2.5c3 2.5 4.5 6 4 10.5l-2 2.5h-4l-2-2.5c-.5-4.5 1-8 4-10.5z" fill="none"/><circle cx="12" cy="9" r="1.6"/><path d="M8 13l-3 3 1 3 3-2M16 13l3 3-1 3-3-2M10.5 18l1.5 3.5 1.5-3.5" fill="none"/>',
  wave: '<path d="M7.5 20c-2.5-2-3-5-1.5-7.5l3-5c.6-1 2-1 2.3.2L10 11l4.5-6c.7-.9 2-.2 1.6.9L14 11l3.2-3.6c.8-.8 2 0 1.6 1L16 14c-1.5 4-5 7.5-8.5 6z" fill="none"/>',
  eyeopen: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" fill="none"/><circle cx="12" cy="12" r="3.2" fill="none"/><circle cx="12" cy="12" r="1.2"/>',
  red: '<circle cx="12" cy="12" r="8.5" fill="none"/><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" fill="none"/>'
};
function stickerHtml(s, i) {
  const got = book.stickers[s.id];
  const tilt = ((hash(s.id) % 11) - 5) * 1.2;
  return `<li class="pp-sticker${got ? ' on' : ''}" style="--tilt:${got ? tilt : 0}deg;--hue:${(i * 47) % 360}">
    <span class="pp-sticker-badge" aria-hidden="true">${got ? sealSvg(s, i) : `<svg viewBox="0 0 24 24">${ICONS[s.icon]}</svg>`}</span>
    <span class="pp-sticker-text"><strong>${esc(s.label)}</strong><em>${got ? `Earned ${esc(short(got))}` : esc(s.hint)}</em></span></li>`;
}

async function render() {
  const sky = await loadSky();
  const n = Object.keys(book.stamps).length, got = STICKERS.filter((x) => book.stickers[x.id]).length;
  $('#ppTally').innerHTML = `<b>${n}</b> of 88 constellations stamped <span>·</span> <b>${got}</b> of ${STICKERS.length} seals`;
  const lat = (k) => (k === 'Ser' ? 0 : sky.con[k].c[1]);
  const north = ALL.filter((k) => !ZODIAC.includes(k) && lat(k) >= 0).sort((a, b) => NAME(a).localeCompare(NAME(b)));
  const south = ALL.filter((k) => !ZODIAC.includes(k) && lat(k) < 0).sort((a, b) => NAME(a).localeCompare(NAME(b)));
  const page = (title, note, keys, tape) => {
    const have = keys.filter((k) => book.stamps[k]).length;
    return `<details class="pp-page" data-page="${esc(title)}" style="--tape:${tape}"${isOpen(title) ? ' open' : ''}><summary class="pp-page-head"><span class="pp-tape" aria-hidden="true"></span>
      <h3>${title}</h3><p>${note} · <b>${have}</b> of ${keys.length}</p></summary><ul class="pp-stamps">${keys.map((k) => stampHtml(k, sky)).join('')}</ul></details>`;
  };
  $('#ppBook').innerHTML =
    `<details class="pp-page pp-stickers-page" data-page="seals" style="--tape:rgba(242,193,78,.32)"${isOpen('seals') ? ' open' : ''}><summary class="pp-page-head"><span class="pp-tape" aria-hidden="true"></span>
      <h3>Venture forth and ye shall find…</h3><p>Little milestones · <b>${got}</b> of ${STICKERS.length}</p></summary><ul class="pp-stickers">${STICKERS.map(stickerHtml).join('')}</ul></details>` +
    page('Birthday signs', 'Twelve constellations you already know by name', ZODIAC, 'rgba(226,85,61,.3)') +
    page('The northern sky', 'North of the celestial equator', north, 'rgba(169,198,240,.3)') +
    page('The southern sky', 'South of the celestial equator', south, 'rgba(143,201,163,.3)');
  // newly earned stamps get a little "thunk" the first time you see them
  book.seen = book.seen || {};
  for (const k of Object.keys(book.stamps)) book.seen[k] = true;
  save();
}
// On phones each page starts folded and opens with a tap on its heading; on wider screens every page stays open.
const narrow = matchMedia('(max-width: 600px)');
const openPages = new Set();
function isOpen(page) { return !narrow.matches || openPages.has(page); }
$('#ppBook').addEventListener('toggle', (e) => {
  const d = e.target;
  if (!d.matches?.('details.pp-page')) return;
  if (!narrow.matches && !d.open) { d.open = true; return; }
  d.open ? openPages.add(d.dataset.page) : openPages.delete(d.dataset.page);
}, true);
narrow.addEventListener('change', () => { if (location.hash === '#passport') render(); });
$('#ppBook').addEventListener('click', (e) => { const b = e.target.closest('.pp-stamp'); if (b) showConOnSky(b.dataset.con === 'Ser' ? 'Ser1' : b.dataset.con); });
addEventListener('hashchange', () => { if (location.hash === '#passport') render(); });
if (location.hash === '#passport') render();
