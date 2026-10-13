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

// Star days also draw on well-known star clusters and stars that go by catalog names.
const STAR_EXTRA = { 'Jewel Box': 'Jewel Box', 'M 4': 'Messier 4', 'M 15': 'Messier 15', 'Messier 92': 'Messier 92', 'M 7': 'Ptolemy Cluster',
  'Westerlund 1': 'Westerlund 1', 'R136': 'R136', 'Pismis 24': 'Pismis 24', 'Terzan 5': 'Terzan 5', 'SN 1987A': 'Supernova 1987A',
  'Trumpler 14': 'Trumpler 14', 'NGC 3603': 'NGC 3603', 'NGC 6397': 'NGC 6397', 'NGC 6752': 'NGC 6752', 'NGC 1850': 'NGC 1850' };
let starCache = null;
function starPool(index, all) {
  if (starCache && starCache.size === index.length) return starCache.objects;
  const by = new Map(all.filter((o) => kindOf(o.name) === 'star').map((o) => [key(o.name), o]));
  for (const e of index) {
    if (!/^(h|w|e|n|nasa)-/.test(e.id) || e.cat !== 'star' || !e.q) continue;
    const first = e.q.split(/ · constellation| · about /)[0].split(/\s*[·;]\s*|,\s+/)[0].trim();
    const n = STAR_EXTRA[first];
    if (!n) continue;
    const k = key(n);
    if (!by.has(k)) by.set(k, { name: n, cat: 'star', ids: [] });
    if (!by.get(k).ids.includes(e.id)) by.get(k).ids.push(e.id);
  }
  const objects = [...by.values()].sort((a, b) => key(a.name).localeCompare(key(b.name)));
  starCache = { size: index.length, objects };
  return objects;
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

// From this puzzle on, the mystery object takes turns: a nebula, then a galaxy, then a star or star cluster.
// Earlier puzzles keep the objects they were drawn with, so past results never change.
export const ROTATE_FROM = 15;
const TURNS = ['nebula', 'galaxy', 'star'];
// what a name says the object is: a galaxy, a nebula, or otherwise a star or star cluster
const kindOf = (name) => (/Galax|Magellanic|Quintet|Septet|Centaurus A|Triplet|Antennae|Mice|(Bullet|Antlia|Virgo|Coma|Fornax|Pandora|Perseus|Norma|Phoenix|Hydra|Abell) ?.{0,3}Cluster/i.test(name) ? 'galaxy'
  : /Nebula|Pillars|Remnant|Loop|Superbubble|Bubble|Helmet|Wolf|Cloud/i.test(name) ? 'nebula' : 'star');

export function puzzleFor(day, index) {
  const all = pool(index);
  if (all.length < 4) return null;
  // the objects to draw from today, and the day count within that set
  const turn = day >= ROTATE_FROM ? TURNS[(day - ROTATE_FROM) % TURNS.length] : null;
  let objects = all, t = day;
  if (turn) {
    const mine = turn === 'star' ? starPool(index, all) : all.filter((o) => kindOf(o.name) === turn);
    if (mine.length >= 4) { objects = mine; t = Math.floor((day - ROTATE_FROM) / TURNS.length); }
  }
  const n = objects.length;
  let step = 37; while (gcd(step, n) !== 1) step++;
  const today = dailyId(day);
  let k = t, obj = null;
  for (let tries = 0; tries < n; tries++, k++) {
    obj = objects[(k * step) % n];
    if (!obj.ids.includes(today)) break;                 // never the photograph already on the front page
  }
  const cycle = Math.floor(k / n);
  const id = obj.ids[cycle % obj.ids.length];
  const r = rng(day * 9973 + 17);
  // decoys of the same kind (by name on rotating days, so a star never sits beside three galaxies)
  const same = turn ? objects.filter((o) => o !== obj) : all.filter((o) => o !== obj && o.cat === obj.cat);
  const others = (same.length >= 3 ? same : all.filter((o) => o !== obj));
  const decoys = [];
  while (decoys.length < 3) { const o = others[Math.floor(r() * others.length)]; if (!decoys.includes(o)) decoys.push(o); }
  const options = [obj, ...decoys].map((o) => o.name);
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
  return { no: day + 1, day, id, name: obj.name, cat: turn || obj.cat, options, answer: options.indexOf(obj.name), focal: [0.38 + r() * 0.24, 0.38 + r() * 0.24] };
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
