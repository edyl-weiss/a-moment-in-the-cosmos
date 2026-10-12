// Cosmic guess: the daily puzzle, shared by the site and the daily email (no DOM here).
// Each day picks one famous object from the collection, a photograph of it, three decoys of the same kind,
// and a point to zoom in on. The same day number always gives the same puzzle, everywhere.
import { dailyId } from './util.js';

// How far in each look is: the first look is 1/4.5 of the photograph's width, then wider, then wider still.
export const ZOOMS = [4.5, 2.6, 1.5];
export const TRIES = ZOOMS.length;

const OK = /\b(Nebula|Galaxy|Galaxies|Cluster|Cloud|Pillars|Quintet|Centauri|Carinae|Tucanae|Remnant|Loop|Superbubble|Centaurus A|Pleiades|Star)\b/;
const CATALOG = /^(M|NGC|IC|Messier|Abell|Arp|ESO|UGC|LEDA|PGC|HD|HH|Sh ?2|LHA|N ?\d|SN|Hickson|RCW|Gum|IRAS|2MASS)\s?-?\d/i;
const GENERIC = /^(the )?(young |open |globular |star |spiral |barred spiral |dwarf |planetary )*(cluster|nebula|galaxy|galaxies|cloud|star)$/i;
const ODD = /^(galaxy field|star |serpens nebula hbc|cha ir|the great)/i;
const key = (n) => n.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// The familiar name a photograph leads with ("Orion Nebula"), if it has one worth guessing.
export function nameOf(e) {
  if (!e || e.cat === 'night' || !e.q) return null;
  const seg = e.q.split(/ · constellation| · about /)[0];
  if (seg.startsWith('constellation')) return null;
  const n = seg.split(/\s*[·;]\s*|,\s+/)[0].trim().replace(/[“”"]/g, '');
  if (!OK.test(n) || CATALOG.test(n) || GENERIC.test(n) || ODD.test(n) || n.length > 34) return null;
  return n.replace(/'/g, '’');
}

let cache = null;
function pool(index) {
  if (cache && cache.size === index.length) return cache.objects;
  const by = new Map();
  // collection photographs only (ids carry a source prefix), so the site, which also lists the hand-picked
  // photographs, and the email, which reads the collection index, build exactly the same pool
  for (const e of index) {
    if (!/^(h|w|e|n|nasa)-/.test(e.id)) continue;
    const n = nameOf(e);
    if (!n) continue;
    const k = key(n);
    if (!by.has(k)) by.set(k, { name: n, cat: e.cat, ids: [] });
    by.get(k).ids.push(e.id);
  }
  const objects = [...by.values()].sort((a, b) => key(a.name).localeCompare(key(b.name)));
  cache = { size: index.length, objects };
  return objects;
}

// Small seeded random numbers, so a day's choices are the same on every device.
function rng(seed) {
  let t = seed >>> 0;
  return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export function puzzleFor(day, index) {
  const objects = pool(index);
  const n = objects.length;
  if (n < 4) return null;
  let step = 37; while (gcd(step, n) !== 1) step++;
  const today = dailyId(day);
  let k = day, obj = null;
  for (let tries = 0; tries < n; tries++, k++) {
    obj = objects[(k * step) % n];
    if (!obj.ids.includes(today)) break;                 // never the photograph already on the front page
  }
  const cycle = Math.floor(k / n);
  const id = obj.ids[cycle % obj.ids.length];
  const r = rng(day * 9973 + 17);
  const same = objects.filter((o) => o !== obj && o.cat === obj.cat);
  const others = (same.length >= 3 ? same : objects.filter((o) => o !== obj));
  const decoys = [];
  while (decoys.length < 3) { const o = others[Math.floor(r() * others.length)]; if (!decoys.includes(o)) decoys.push(o); }
  const options = [obj, ...decoys].map((o) => o.name);
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
  return { no: day + 1, day, id, name: obj.name, cat: obj.cat, options, answer: options.indexOf(obj.name), focal: [0.38 + r() * 0.24, 0.38 + r() * 0.24] };
}

// A close-up of the photograph for a given look, cut by a public image service (images.weserv.nl): the
// photograph is resized to a known width, then the crop is taken around the puzzle's focal point.
export function cropUrl(photo, puzzle, look = 0) {
  // work at the photograph's own published size (up to 4,000 px), so a close-up is never an enlargement
  const W = Math.min(4000, photo.img.pubW || 3000), H = Math.round(W * photo.img.pubH / photo.img.pubW);
  const z = ZOOMS[Math.min(look, ZOOMS.length - 1)];
  const aspect = 16 / 10;
  let cw = Math.round(W / z), ch = Math.round(cw / aspect);
  if (ch > H) { ch = H; cw = Math.round(ch * aspect); }
  const cx = Math.round(Math.min(Math.max(puzzle.focal[0] * W - cw / 2, 0), W - cw));
  const cy = Math.round(Math.min(Math.max(puzzle.focal[1] * H - ch / 2, 0), H - ch));
  const src = (photo.img.pub || photo.img.screen).replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=${W}&h=${H}&fit=fill&cx=${cx}&cy=${cy}&cw=${cw}&ch=${ch}&output=jpg&q=82&maxage=31d`;
}
