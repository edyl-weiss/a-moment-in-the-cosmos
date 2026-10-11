// Night sky page. Three views of the same data:
//   Tonight  – the sky above the visitor right now (or at a time they pick tonight): an all-sky chart
//              centered overhead with the horizon as the rim, computed from their approximate location
//              and the current sidereal time. Only what is above the horizon is drawn.
//   Whole northern / Whole southern – the whole celestial hemisphere around the pole, out to 20° past the equator.
// The chart opens with just the stars and constellations. Tapping a constellation flies to it and marks
// the photographs taken there (an atlas symbol for each); leaving it clears them again. Only those few
// markers are ever drawn, which keeps zooming and panning smooth on phones.
import { $, $$, esc, CAT, store } from './util.js';
import { show } from './feature.js';
import { INDEX, INDEX_BY_ID, getPhoto } from './collection.js';
import { tile, scrollToFeature } from './tiles.js';
import { CON_NAMES } from '../data/constellations.js';
import { whereAmI } from './geo.js';
import { browseConstellation } from './archive.js';
import { planetsAt, moonAt } from './planets.js';

const SIZE = 1000, C = SIZE / 2, EDGE = 20;              // degrees beyond the equator (pole views)
const rad = Math.PI / 180;
const RMAX = 2 * Math.tan((90 + EDGE) / 2 * rad);
const K = (C - 34) / RMAX;
const KT = (C - 34) / 2;                                 // tonight view: horizon (altitude 0) at radius 2
const PLURAL = { galaxy: 'Galaxies', nebula: 'Nebulae', star: 'Stars' };
// Map symbols, after the conventions of printed star atlases: an oval for a galaxy, a square for a
// nebula, a broken circle for a star cluster. Thin outlines with a faint fill, drawn in a unit box and
// scaled per zoom level so they keep the same size on screen.
const SYMBOLS = `
  <g id="nsSym-galaxy" fill="none" stroke="currentColor" stroke-width=".26"><ellipse rx="1.3" ry=".55" transform="rotate(-30)" fill="currentColor" fill-opacity=".22"/></g>
  <g id="nsSym-nebula" fill="none" stroke="currentColor" stroke-width=".24"><rect x="-.9" y="-.9" width="1.8" height="1.8" fill="currentColor" fill-opacity=".2"/></g>
  <g id="nsSym-star" fill="none" stroke="currentColor" stroke-width=".26"><circle r="1" stroke-dasharray=".42 .3"/><circle r=".24" fill="currentColor" stroke="none"/></g>`;
const symbolSvg = (cat, color) => `<svg class="ns-sym" viewBox="-1.7 -1.7 3.4 3.4" aria-hidden="true" style="color:${color}"><use href="#nsSym-${cat}"/></svg>`;
const COLORS = { galaxy: '#a9c6f0', nebula: '#ec8b6d', star: '#f2c14e' };

const touch = matchMedia('(pointer: coarse)').matches;
// Settings people choose here (view, photograph types, observatory, layers) are remembered in this browser.
const saved = store.get('nsPrefs', {});
const shown = new Set(Array.isArray(saved.shown) && saved.shown.length ? saved.shown.filter((c) => c in COLORS) : Object.keys(COLORS));
// The best-known constellations keep their names on a small screen at the whole-sky view; the rest appear on zooming in.
const MAJOR = new Set('Ori UMa UMi Cas Cyg Lyr Aql Sco Sgr Leo Gem Tau CMa Peg And Per Aur Boo Vir Cru Cen Car Dra Cep Her Oph Aqr Cap Psc Ari Cnc Lib'.split(' '));
const LAYERS = { planets: 'Moon and planets', names: 'Constellation names', lines: 'Star figures' };
// Faint stars show on larger screens and stay off on phones (less clutter, less to draw); it isn't a setting.
const layersOn = new Set(Array.isArray(saved.layers) ? saved.layers.filter((l) => l in LAYERS) : ['names', 'lines']);
if (saved.v !== 2) layersOn.add('planets');                 // added later: on for everyone once
const savePrefs = () => store.set('nsPrefs', { v: 2, mode, shown: [...shown], layers: [...layersOn] });
let total = 0, pendingFocus = 0;
let sky = null, mode = null, drawnFor = null, view = { x: 0, y: 0, w: SIZE }, selected = null, focused = null;
let bodies = [], unit = 1;                                 // the Moon and planets on the chart; screen px per chart unit
let here = null, when = null, night = null, lst = 0, sinLat = 0, cosLat = 1, years = 0;   // tonight: observer, chosen time, local sidereal time

const loadSky = () => sky || (sky = fetch('data/sky.json').then((r) => r.json()));

// Local sidereal time (degrees) for a moment and longitude.
function siderealDeg(date, lon) {
  const jd = date.getTime() / 864e5 + 2440587.5;
  return (((280.46061837 + 360.98564736629 * (jd - 2451545) + lon) % 360) + 360) % 360;
}

// RA and dec in degrees → [x, y] on the chart, or null if it isn't on this chart.
// Altitude and azimuth (radians) above the observer, for J2000 RA/dec. `par` is a horizontal
// parallax in degrees (only the Moon's is large enough to matter: up to a degree lower than from Earth's center).
function horizontal(ra, dec, par = 0) {
  // Catalog positions are for the year 2000; precess them to tonight (about 0.4° by now).
  const a0 = ra * rad, t0 = Math.tan(Math.min(89.5, Math.abs(dec)) * rad) * Math.sign(dec);
  ra += years * (46.124 + 20.043 * Math.sin(a0) * t0) / 3600;
  dec += years * 20.043 * Math.cos(a0) / 3600;
  const H = (lst - ra) * rad, d = dec * rad;
  let alt = Math.asin(Math.max(-1, Math.min(1, sinLat * Math.sin(d) + cosLat * Math.cos(d) * Math.cos(H))));
  alt -= par * rad * Math.cos(alt);
  const az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * cosLat - Math.cos(d) * Math.cos(H) * sinLat);
  return { alt, az: (az + 2 * Math.PI) % (2 * Math.PI) };
}
const DIRS = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
// "high in the southeast", for something above the horizon in the Above me view
function wherePhrase(ra, dec, par) {
  const { alt, az } = horizontal(ra, dec, par), a = alt / rad, dir = DIRS[Math.round(az / rad / 45) % 8];
  if (a < 0) return 'below the horizon';
  return a >= 75 ? 'nearly overhead' : a >= 40 ? `high in the ${dir}` : a >= 15 ? `partway up in the ${dir}` : `low in the ${dir}`;
}

function project(ra, dec, par = 0) {
  if (mode === 'T') {
    const { alt, az } = horizontal(ra, dec, par);
    if (alt < -0.002) return null;                     // below the horizon
    const r = 2 * Math.tan((Math.PI / 2 - alt) / 2) * KT;
    return [C - r * Math.sin(az), C - r * Math.cos(az)];   // north up, east left, as when lying back looking up
  }
  const fromPole = mode === 'N' ? 90 - dec : 90 + dec;
  if (fromPole > 90 + EDGE + 0.01) return null;
  const r = 2 * Math.tan(fromPole / 2 * rad) * K, a = ra * rad;
  // Looking up at the north pole RA runs anticlockwise; at the south pole, clockwise. 0h at the top.
  return mode === 'N' ? [C - r * Math.sin(a), C - r * Math.cos(a)] : [C + r * Math.sin(a), C - r * Math.cos(a)];
}
const P = ([lon, lat]) => project(lon < 0 ? lon + 360 : lon, lat);
const onChart = (e) => Number.isFinite(e.ra) && project(e.ra, e.dec) !== null;

function path(line) {
  let d = '', pen = false;
  for (const q of line) {
    const s = P(q);
    if (!s) { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${s[0].toFixed(1)} ${s[1].toFixed(1)}`; pen = true;
  }
  return d;
}

function photos() { return INDEX.filter(onChart); }

const timeLabel = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

async function draw({ keepView = false } = {}) {
  const data = await loadSky();
  const at = mode === 'T' && when ? when : new Date();
  if (mode === 'T') {
    if (!here) here = await whereAmI();
    const t = when || new Date();
    years = (t.getTime() / 864e5 + 2440587.5 - 2451545) / 365.25;   // since J2000, for precession
    lst = siderealDeg(t, here.lon); sinLat = Math.sin(here.lat * rad); cosLat = Math.cos(here.lat * rad);
  }
  const key = mode === 'T' ? `T${Math.round(lst * 4)}:${Math.round(at / 6e4)}` : `${mode}${Math.floor(at / 36e5)}`;
  if (drawnFor === key) return;
  drawnFor = key;
  const rim = mode === 'T' ? 2 * KT : RMAX * K;
  let svg = `<defs>${SYMBOLS}<radialGradient id="nsSkyFill" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#11285a"/><stop offset=".6" stop-color="#0a1a3f"/><stop offset="1" stop-color="#050e26"/></radialGradient><clipPath id="nsClip"><circle cx="${C}" cy="${C}" r="${rim.toFixed(1)}"/></clipPath></defs>`;
  if (mode === 'T') {
    // Dusk along the horizon: a faint warm glow just outside the rim and a band of fading sunset light
    // inside it, a little stronger toward the west, where the Sun went down.
    svg += `<defs><radialGradient id="nsDusk" cx="50%" cy="50%" r="50%"><stop offset=".74" stop-color="#ff9a62" stop-opacity="0.0"/><stop offset=".9" stop-color="#f08a64" stop-opacity="0.042"/><stop offset="1" stop-color="#ffb07a" stop-opacity="0.156"/></radialGradient>` +
      `<radialGradient id="nsWest" cx="100%" cy="50%" r="62%"><stop offset="0" stop-color="#ff9c66" stop-opacity="0.12"/><stop offset=".55" stop-color="#d77a6a" stop-opacity="0.03"/><stop offset="1" stop-color="#d77a6a" stop-opacity="0.0"/></radialGradient>` +
      `<radialGradient id="nsHalo" gradientUnits="userSpaceOnUse" cx="${C}" cy="${C}" r="${(rim + 22).toFixed(1)}"><stop offset="${((rim - 6) / (rim + 22)).toFixed(3)}" stop-color="#ffa876" stop-opacity="0"/><stop offset="${(rim / (rim + 22)).toFixed(3)}" stop-color="#ffa876" stop-opacity=".16"/><stop offset="1" stop-color="#ffa876" stop-opacity="0"/></radialGradient></defs>` +
      `<circle class="ns-dusk-halo" cx="${C}" cy="${C}" r="${(rim + 22).toFixed(1)}"/>`;
  }
  svg += `<circle class="ns-disc" cx="${C}" cy="${C}" r="${rim.toFixed(1)}"/><g clip-path="url(#nsClip)">`;
  if (mode === 'T') svg += `<circle cx="${C}" cy="${C}" r="${rim.toFixed(1)}" fill="url(#nsWest)" class="ns-dusk"/><circle cx="${C}" cy="${C}" r="${rim.toFixed(1)}" fill="url(#nsDusk)" class="ns-dusk"/>`;
  // Each constellation's area is clickable: tap anywhere inside it to explore it.
  for (const [k, c] of Object.entries(data.con)) { const d = path([...c.b, c.b[0]]); if (d) svg += `<path class="ns-area" data-con="${k}" d="${d}Z"/>`; }
  for (const [lon, lat, mag] of data.stars) {
    const s = P([lon, lat]);
    if (s) svg += `<circle class="ns-star${mag > 3.5 ? ' faint' : ''}" cx="${s[0].toFixed(1)}" cy="${s[1].toFixed(1)}" r="${Math.max(0.7, 3.4 - mag * 0.55).toFixed(2)}"/>`;
  }
  for (const [k, c] of Object.entries(data.con)) { const d = (c.l || []).map(path).join(''); if (d) svg += `<path class="ns-line" data-con="${k}" d="${d}"/>`; }
  // Constellations with photographs in the collection get a brighter name and a small count, so taps pay off.
  const perCon = {};
  for (const e of INDEX) if (e.con) perCon[e.con] = (perCon[e.con] || 0) + 1;
  svg += '<g class="ns-names">';
  for (const [k, c] of Object.entries(data.con)) {
    const s = P(c.c), n = perCon[k] || 0, name = CON_NAMES[k] || c.n;
    if (s) svg += `<text class="ns-con${MAJOR.has(k.slice(0, 3)) ? '' : ' minor'}${n ? ' has' : ''}" data-con="${k}" x="${s[0].toFixed(1)}" y="${s[1].toFixed(1)}" tabindex="0" role="button" aria-label="${esc(name)}, ${n ? `${n} photograph${n === 1 ? '' : 's'}` : 'no photographs yet'}">${esc(name)}${n ? `<tspan class="ns-count" dx=".35em">${n}</tspan>` : ''}</text>`;
  }
  svg += `</g><g class="ns-dots" id="nsDots"></g><g class="ns-bodies">${drawBodies(at)}</g></g>`;   // dots: filled in when a constellation is chosen
  const list = photos();
  if (mode === 'T') {
    // compass around the horizon (east is on the left when you look up)
    for (const [t, ang] of [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270], ['NW', 315]]) {
      const r = rim + 17, a = ang * rad;
      svg += `<text class="ns-hour${t.length === 1 ? ' ns-cardinal' : ''}" x="${(C - r * Math.sin(a)).toFixed(1)}" y="${(C - r * Math.cos(a) + 5).toFixed(1)}">${t}</text>`;
    }
    svg += `<text class="ns-pole" x="${C}" y="${C + 4}">overhead</text>`;
  } else {
    for (let h = 0; h < 24; h += 2) {
      const r = RMAX * K + 17, a = h * 15 * rad;
      const x = mode === 'N' ? C - r * Math.sin(a) : C + r * Math.sin(a), y = C - r * Math.cos(a);
      svg += `<text class="ns-hour" x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}">${h}h</text>`;
    }
    svg += `<text class="ns-pole" x="${C}" y="${C + 4}">${mode === 'N' ? 'north celestial pole' : 'south celestial pole'}</text>`;
  }
  const what = mode === 'T' ? 'the sky above you' : `the ${mode === 'N' ? 'northern' : 'southern'} sky`;
  $('#nsChart').innerHTML = `<svg class="mode-${mode}" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="Star chart of ${what}. Choose a constellation to see the photographs taken there">${svg}</svg>`;
  sizeStrokes();

  const counts = {};
  for (const e of list) counts[e.cat] = (counts[e.cat] || 0) + 1;
  // The legend doubles as the filter: each category toggles on and off.
  total = list.length;
  $('#nsLegend').innerHTML = Object.keys(COLORS)
    .map((c) => `<button type="button" data-cat="${c}" aria-pressed="${shown.has(c)}"><span class="ns-check" style="--c:${COLORS[c]}" aria-hidden="true"></span>${symbolSvg(c, COLORS[c])}${PLURAL[c]}<b>${counts[c] || 0}</b></button>`).join('');
  $('#nsFoot').textContent = mode === 'T'
    ? `The sky above ${here.guessed ? 'roughly where you are' : 'your area'}${when ? ` at ${whenLabel(when)}` : ' right now'}, with the horizon as the outer ring. Brighter names have photographs, and the number says how many`
    : 'Hours around the edge are right ascension. Brighter names have photographs, and the number says how many';
  $$('.ns-hemi button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.hemi === mode)));
  $('#nsTimeRow').hidden = mode !== 'T';
  if (!keepView) view = { x: 0, y: 0, w: SIZE };
  buildList(data);
  applyFilter();
  applyView();
  if (!keepView) { hideTip(); unfocus(); } else if (focused) focusCon(focused, false);
}

// Zoom and pan by moving the viewBox; labels and dots keep their on-screen size.
function applyView() {
  const svg = $('#nsChart svg');
  if (!svg) return;
  svg.setAttribute('viewBox', `${view.x.toFixed(1)} ${view.y.toFixed(1)} ${view.w.toFixed(1)} ${view.w.toFixed(1)}`);
  const z = view.w / SIZE;
  // Only the labels need restyling as the zoom changes (strokes don't scale; see --u)
  for (const g of svg.querySelectorAll('.ns-names, .ns-pole')) g.style.setProperty('--z', z);
  // Markers keep roughly the same size on screen, a little larger on small screens so they stay tappable.
  const k = (5.2 * Math.max(z, 0.35) * Math.max(1, 0.6 / unit)).toFixed(2);
  for (const d of svg.querySelectorAll('.ns-dot, .ns-body')) d.setAttribute('transform', `translate(${d.dataset.x} ${d.dataset.y}) scale(${k})${d.dataset.rot ? ` rotate(${d.dataset.rot})` : ''}`);
  svg.classList.toggle('zoomed', z < 0.7);
  svg.classList.toggle('sparse', z > 0.55 && svg.getBoundingClientRect().width < 640);   // small screen, whole sky: major names only
  $('#nsChart').classList.toggle('pannable', z < 0.999);
  $('#nsChart').parentElement.classList.toggle('zoomed', z < 0.999);
}
// Zooming glides: each wheel tick, button press or double-click moves a goal, and the view eases
// toward it every frame, so quick scrolls add up into one smooth movement. Pinch follows the fingers directly.
let goal = null;
function zoomAt(px, py, f, instant = false) {
  const base = goal || { ...view };
  // (px, py) is where the pointer is on screen now; keep that same screen spot fixed in the goal view
  const fx = (px - view.x) / view.w, fy = (py - view.y) / view.w;
  px = base.x + fx * base.w; py = base.y + fy * base.w;
  const w = Math.min(SIZE, Math.max(80, base.w / f));
  const next = { x: px - (px - base.x) * (w / base.w), y: py - (py - base.y) * (w / base.w), w };
  clampView(next);
  glideTo(next, instant);
}
function glideTo(next, instant = false) {
  anim++;                                                // stop any fly-to in progress
  if (instant || matchMedia('(prefers-reduced-motion: reduce)').matches) { goal = null; view = next; applyView(); return; }
  const running = goal !== null;
  goal = next;
  if (running) return;
  let last = performance.now();
  const step = (now) => {
    if (!goal) return;
    const k = 1 - Math.exp(-(now - last) / 85); last = now;    // same feel at any frame rate
    view = { x: view.x + (goal.x - view.x) * k, y: view.y + (goal.y - view.y) * k, w: view.w + (goal.w - view.w) * k };
    if (Math.abs(goal.w - view.w) < 0.3 && Math.abs(goal.x - view.x) < 0.3 && Math.abs(goal.y - view.y) < 0.3) { view = goal; goal = null; }
    applyView();
    if (goal) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const stopGlide = () => { goal = null; };
function clampView(v = view) {
  v.x = Math.min(Math.max(v.x, 0), SIZE - v.w); v.y = Math.min(Math.max(v.y, 0), SIZE - v.w);
}
// Chart units → screen pixels, for strokes that keep a constant on-screen width.
function sizeStrokes() {
  const svg = $('#nsChart svg');
  if (!svg) return;
  const u = svg.getBoundingClientRect().width / SIZE;
  if (u > 0) unit = u;
  svg.style.setProperty('--u', unit.toFixed(4));
}
new ResizeObserver(sizeStrokes).observe(document.getElementById('nsChart'));

const toChart = (e) => {
  const r = $('#nsChart svg').getBoundingClientRect();
  return [view.x + (e.clientX - r.left) / r.width * view.w, view.y + (e.clientY - r.top) / r.height * view.w];
};

function showTip(el) {
  const e = INDEX_BY_ID[el.dataset.id];
  if (!e) return;
  selected = e.id;
  const tip = $('#nsTip');
  tip.innerHTML = `<span class="ns-tip-cat">${esc(CAT[e.cat] || '')}${e.con ? ` · ${esc(CON_NAMES[e.con] || '')}` : ''}</span>` +
    `<strong>${esc(e.title)}</strong><button type="button" id="nsOpen">Open photograph →</button>`;
  const wrap = $('#nsChart').getBoundingClientRect(), r = el.getBoundingClientRect();
  tip.hidden = false;
  const left = Math.min(Math.max(r.left - wrap.left + r.width / 2 - tip.offsetWidth / 2, 6), wrap.width - tip.offsetWidth - 6);
  const above = r.top - wrap.top - tip.offsetHeight - 12;
  tip.style.left = `${left}px`;
  tip.style.top = `${above > 6 ? above : r.bottom - wrap.top + 12}px`;
  $$('#nsChart .ns-dot.on').forEach((d) => d.classList.remove('on'));
  el.classList.add('on');
}
function nearestDot(x, y, within) {
  let best = null, bd = within;
  for (const d of document.querySelectorAll('#nsChart .ns-dot')) {
    if (!shown.has(d.dataset.cat) || d.classList.contains('off')) continue;
    const r = d.getBoundingClientRect(), dd = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
    if (dd < bd) { bd = dd; best = d; }
  }
  return best;
}
const filtered = () => shown.size < Object.keys(COLORS).length;
const visible = (e) => shown.has(e.cat);
function applyFilter() {
  const svg = $('#nsChart svg');
  if (svg) {
    for (const c of Object.keys(COLORS)) svg.classList.toggle(`hide-${c}`, !shown.has(c));
      for (const l of Object.keys(LAYERS)) svg.classList.toggle(`no-${l}`, !layersOn.has(l));
      svg.classList.add('no-bounds');
      svg.classList.toggle('no-faint', touch);
  }
  // Say what's on the chart, and offer one way back to everything.
  const n = INDEX.filter((e) => onChart(e) && visible(e)).length;
  $('#nsStatus').innerHTML = !focused && filtered()
    ? `Filters on: <b>${n.toLocaleString('en')}</b> of ${total.toLocaleString('en')} photographs. <button type="button" id="nsClear">Show everything</button>`
    : '';
  $('#nsStatus').hidden = !$('#nsStatus').innerHTML;
  $$('.ns-console button[data-layer]').forEach((b) => b.setAttribute('aria-pressed', String(layersOn.has(b.dataset.layer))));
  $$('#nsLegend button').forEach((b) => b.setAttribute('aria-pressed', String(shown.has(b.dataset.cat))));
  if (selected && !visible(INDEX_BY_ID[selected] || {})) hideTip();
  if (focused) focusCon(focused, false);
}
function hideTip() { $('#nsTip').hidden = true; selected = null; $$('#nsChart .ns-dot.on, #nsChart .ns-body.on').forEach((d) => d.classList.remove('on')); }
// Explore one constellation: highlight it, zoom to it and list the photographs inside it.
async function focusCon(k, fly = true) {
  const data = await loadSky(), c = data.con[k];
  if (!c) return;
  const changed = focused !== k;
  focused = k;
  $$('#nsChart [data-con]').forEach((el) => el.classList.toggle('focus', el.dataset.con === k));
  if (changed || !$('#nsDots')?.childElementCount) drawDots(k);
  $('#nsStatus').innerHTML = '';                            // the panel says what's here instead
  $('#nsChart svg').classList.add('focusing');
  const pts = c.b.map(P).filter(Boolean);
  if (fly && pts.length) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const w = Math.min(SIZE, Math.max(220, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 1.35);
    animateTo({ x: (Math.min(...xs) + Math.max(...xs)) / 2 - w / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 - w / 2, w });
  }
  const inside = INDEX.filter((e) => e.con === k && visible(e));
  const name = CON_NAMES[k] || c.n;
  const panel = $('#nsPanel');
  panel.innerHTML = `<button type="button" class="ns-p-close" id="nsPClose" aria-label="Close and show the whole sky"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg></button><div class="ns-p-head"><p class="ns-p-k">Constellation</p><h3>${esc(name)}</h3>
    <p class="ns-p-n">${inside.length ? `${inside.length} ${filtered() ? 'matching ' : ''}photograph${inside.length === 1 ? '' : 's'} in the collection` : filtered() ? 'Nothing matching your filters here' : 'Nothing from here in the collection yet'}</p></div>
    <div class="grid small" id="nsPGrid"></div>
    <p class="ns-p-actions">${inside.length > 8 ? `<button type="button" id="nsAll">See all ${inside.length} in the archive →</button>` : ''}
    <button type="button" id="nsWhole">← Whole sky</button></p>`;
  const grid = $('#nsPGrid');
  for (const e of inside.slice(0, 8)) grid.appendChild(tile({ id: e.id, title: e.title, cat: e.cat, thumb: e.thumb, sub: e.y, onOpen: () => preview(e.id) }));
  panel.hidden = false;
  $('#sky').classList.add('has-panel');
  if (fly) hideTip();
  // On phones the photographs open in a sheet over the lower half of the screen: bring the map up above it.
  if (fly && matchMedia('(max-width: 760px)').matches) {
    const top = $('#nsChart').getBoundingClientRect().top + scrollY - 8;
    scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}
// Mark the photographs inside one constellation (and nothing else).
function drawDots(k) {
  const g = $('#nsDots');
  if (!g) return;
  let out = '';
  for (const e of INDEX) {
    if (e.con !== k || !Number.isFinite(e.ra)) continue;
    const s = project(e.ra, e.dec);
    if (s) out += `<g class="ns-dot" data-id="${esc(e.id)}" data-cat="${e.cat}" data-org="${e.org}" data-x="${s[0].toFixed(1)}" data-y="${s[1].toFixed(1)}" style="color:${COLORS[e.cat] || '#ddd'}" tabindex="0" role="button" aria-label="${esc(e.title)}"><use href="#nsSym-${e.cat}"/></g>`;
  }
  g.innerHTML = out;
  applyView();
}
function unfocus() {
  const was = focused;
  focused = null;
  const g = $('#nsDots'); if (g) g.innerHTML = '';
  if (was) applyFilter();
  $$('#nsChart .focus').forEach((el) => el.classList.remove('focus'));
  $('#nsChart svg')?.classList.remove('focusing');
  $('#nsPanel').hidden = true;
  $('#sky').classList.remove('has-panel');
}

// Smoothly move the view (respecting reduced motion).
let anim = 0;
function animateTo(t) {
  t.w = Math.min(SIZE, t.w); t.x = Math.min(Math.max(t.x, 0), SIZE - t.w); t.y = Math.min(Math.max(t.y, 0), SIZE - t.w);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { view = t; applyView(); return; }
  stopGlide();
  const from = { ...view }, t0 = performance.now(), id = ++anim;
  const step = (now) => {
    if (id !== anim) return;
    const k = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - k, 3);
    view = { x: from.x + (t.x - from.x) * e, y: from.y + (t.y - from.y) * e, w: from.w + (t.w - from.w) * e };
    applyView();
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function open(id) { show(id, { mode: 'sky' }); scrollToFeature(); }

// Quick look: a popup with the photograph and a few lines about it, without leaving the sky.
// "See full details" goes on to the photograph's own page.
const dlg = $('#nsPreview');
let previewing = null;
async function preview(id) {
  const e = INDEX_BY_ID[id];
  if (!e) return;
  previewing = id;
  hideTip();
  const img = $('#nspImg');
  img.classList.remove('loaded');
  img.src = e.thumb; img.alt = '';
  $('#nspKicker').textContent = [CAT[e.cat], e.con && CON_NAMES[e.con], e.y].filter(Boolean).join(' · ');
  $('#nspTitle').textContent = e.title;
  $('#nspText').textContent = ''; $('#nspCredit').textContent = '';
  if (!dlg.open) dlg.showModal();
  try {
    const r = await getPhoto(id);
    if (previewing !== id) return;
    const big = new Image();
    big.onload = () => { if (previewing === id) { img.src = big.src; img.classList.add('loaded'); } };
    big.src = r.img.screen || r.img.large || r.img.pub;
    img.alt = r.alt || e.title;
    // first sentence (a full stop after a lowercase letter or digit, so "Nicholas U. Mayall" isn't cut short)
    const first = (r.story?.[0] || '').match(/^.*?[a-z0-9)”'"][.!?](?=\s+[A-Z“"']|\s*$)/);
    $('#nspText').textContent = first ? first[0].trim() : (r.caption || '');
    $('#nspCredit').textContent = r.credit ? `Credit: ${r.credit}` : '';
  } catch { /* the summary is optional; the popup still shows the title and thumbnail */ }
}
$('#nspFull').addEventListener('click', () => { const id = previewing; dlg.close(); if (id) open(id); });
$('#nspClose').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });   // click outside the card
dlg.addEventListener('close', () => { previewing = null; });

const chart = $('#nsChart');
chart.addEventListener('wheel', (e) => { if (!$('#nsChart svg')) return; e.preventDefault(); const [x, y] = toChart(e); zoomAt(x, y, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
const ptrs = new Map(); let drag = null, pinch = null, moved = 0, frame = 0;
// Drag and pinch update at most once per screen refresh.
const paint = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; applyView(); }); };
chart.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = 0;
  stopGlide(); anim++;
  if (ptrs.size === 1) drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), w: view.w }; }
});
chart.addEventListener('pointermove', (e) => {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  const r = chart.getBoundingClientRect();
  if (ptrs.size === 2 && pinch) {
    const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const [x, y] = toChart({ clientX: (a[0] + b[0]) / 2, clientY: (a[1] + b[1]) / 2 });
    const f = view.w / (pinch.w * pinch.d / d);
    const w = Math.min(SIZE, Math.max(80, view.w / f));
    view = { x: x - (x - view.x) * (w / view.w), y: y - (y - view.y) * (w / view.w), w }; clampView(); paint(); moved = 99;
  } else if (drag && view.w < SIZE) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    moved = Math.max(moved, Math.hypot(dx, dy));
    if (moved > 4) { chart.setPointerCapture(e.pointerId); view.x = drag.vx - dx / r.width * view.w; view.y = drag.vy - dy / r.height * view.w; clampView(); paint(); hideTip(); }
  }
});
const end = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; if (!ptrs.size) drag = null; };
chart.addEventListener('pointerup', end);
chart.addEventListener('pointercancel', end);
chart.addEventListener('click', (e) => {
  if (moved > 4) return;
  const body = e.target.closest('.ns-body');
  if (body) { showBodyTip(body); return; }
  // Dots are small, so a tap within a finger's width of one counts as hitting it.
  const dot = e.target.closest('.ns-dot') || nearestDot(e.clientX, e.clientY, matchMedia('(pointer: coarse)').matches ? 22 : 9);
  if (dot) { if (touch || selected === dot.dataset.id) preview(dot.dataset.id); else showTip(dot); return; }
  const area = e.target.closest('.ns-con, .ns-area, .ns-line');
  if (area) {
    // wait a beat so a double-click can zoom instead of flying to the constellation
    const k = area.dataset.con;
    clearTimeout(pendingFocus);
    const go = () => (focused === k ? hideTip() : focusCon(k));
    if (touch) go();                                      // phones pinch to zoom, so there's no double-tap to wait for
    else if (e.detail === 1) pendingFocus = setTimeout(go, 240);
    return;
  }
  hideTip();
  if (focused) leave();   // a tap off the sky leaves the constellation
});
chart.addEventListener('mouseover', (e) => {
  if (!matchMedia('(pointer: fine)').matches) return;
  const dot = e.target.closest('.ns-dot'), body = e.target.closest('.ns-body');
  if (dot) showTip(dot); else if (body) showBodyTip(body);
});
chart.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const dot = e.target.closest('.ns-dot'), con = e.target.closest('.ns-con'), body = e.target.closest('.ns-body');
  if (body) { e.preventDefault(); showBodyTip(body); }
  if (dot) { e.preventDefault(); selected === dot.dataset.id ? preview(selected) : showTip(dot); }
  if (con) { e.preventDefault(); focusCon(con.dataset.con); }
});
$('#nsTip').addEventListener('click', (e) => { if (e.target.id === 'nsOpen' && selected) preview(selected); });
// Double-click (or double-tap) zooms in where you point; arrow keys and + / − work once the chart has focus.
chart.addEventListener('dblclick', (e) => { if (touch) return; clearTimeout(pendingFocus); e.preventDefault(); const [x, y] = toChart(e); zoomAt(x, y, 1.8); });
chart.tabIndex = 0;
chart.setAttribute('aria-label', 'Star chart. Use + and − to zoom and the arrow keys to move around.');
chart.addEventListener('keydown', (e) => {
  if (e.target !== chart) return;
  const step = view.w * 0.12, moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
  if (moves[e.key]) { e.preventDefault(); const b = goal || { ...view }, n = { x: b.x + moves[e.key][0], y: b.y + moves[e.key][1], w: b.w }; clampView(n); glideTo(n); }
  else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomCenter(1.4); }
  else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomCenter(1 / 1.4); }
  else if (e.key === '0') { e.preventDefault(); animateTo({ x: 0, y: 0, w: SIZE }); }
});
$('#nsPanel').addEventListener('click', (e) => {
  if (e.target.id === 'nsAll' && focused) browseConstellation(focused);
  if (e.target.id === 'nsWhole' || e.target.closest('#nsPClose')) leave();
});
const zoomCenter = (f) => zoomAt(view.x + view.w / 2, view.y + view.w / 2, f);
$('#nsIn').addEventListener('click', () => zoomCenter(1.6));
$('#nsOut').addEventListener('click', () => zoomCenter(1 / 1.6));
// Leave a constellation: clear its markers and pull back to the whole sky.
function leave() { hideTip(); unfocus(); animateTo({ x: 0, y: 0, w: SIZE }); }
$('#nsReset').addEventListener('click', leave);
$('#nsLegend').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-cat]');
  if (!b) return;
  const c = b.dataset.cat;
  if (shown.has(c)) { if (shown.size > 1) shown.delete(c); } else shown.add(c);   // always keep one on
  applyFilter(); savePrefs();
});
const layerButtons = (set) => Object.entries(set).map(([k, v]) => `<button type="button" data-layer="${k}" aria-pressed="${layersOn.has(k)}">${v}</button>`).join('');
$('#nsLayers').innerHTML = layerButtons(LAYERS);
document.querySelector('.ns-console').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-layer]');
  if (!b) return;
  layersOn.has(b.dataset.layer) ? layersOn.delete(b.dataset.layer) : layersOn.add(b.dataset.layer);
  applyFilter(); savePrefs();
});
$('#nsStatus').addEventListener('click', (e) => {
  if (e.target.id !== 'nsClear') return;
  Object.keys(COLORS).forEach((c) => shown.add(c)); applyFilter(); savePrefs();
});
// The how-to hint fades once someone has started exploring.
// It shows on the first visit only.
if (store.get('nsHintSeen')) $('#nsHint').hidden = true;
const quiet = () => { $('#nsHint').classList.add('gone'); store.set('nsHintSeen', true); };
['wheel', 'pointerdown', 'keydown'].forEach((t) => chart.addEventListener(t, quiet, { once: true, passive: true }));
$$('.ns-hemi button').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.hemi; savePrefs(); draw(); }));

// Tonight's time: "now", or any time from 6 pm tonight to 6 am tomorrow with the slider.
// "Tonight" runs from 6 pm to 6 am. In the daytime the slider looks ahead to the coming night
// (opening on 9 pm) instead of pinning itself to one end; "Right now" still shows the daytime sky.
// A date picker looks ahead (or back) to any night: the slider then runs 6 pm to 6 am on that night.
const isNight = (d) => d.getHours() >= 18 || d.getHours() < 6;
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function eveningStart(now = new Date()) {
  if (night) { const [y, m, dd] = night.split('-').map(Number); return new Date(y, m - 1, dd, 18); }
  const d = new Date(now); d.setHours(18, 0, 0, 0);
  if (now.getHours() < 6) d.setDate(d.getDate() - 1);    // after midnight, tonight began yesterday evening
  return d;
}
const whenLabel = (d) => night
  ? `${timeLabel(d)} on ${eveningStart().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}${d.getDate() !== eveningStart().getDate() ? ' (after midnight)' : ''}`
  : `${timeLabel(d)} tonight`;
function syncTime() {
  const now = new Date(), start = eveningStart(now), slider = $('#nsTime');
  const dark = isNight(now);
  if (when) slider.value = Math.round((when - start) / 6e4);
  else if (dark) slider.value = Math.round((now - start) / 6e4);
  $('#nsTimeRow').classList.toggle('daylight', !when && !dark);
  $('#nsTimeLabel').textContent = when ? (night ? `${timeLabel(when)}${when.getDate() !== eveningStart().getDate() ? ', after midnight' : ''}` : `${timeLabel(when)} tonight`) : dark ? `Now, ${timeLabel(now)}` : `Now, ${timeLabel(now)} (daylight)`;
  $('#nsDate').value = ymd(eveningStart(now));
  $('#nsNow').textContent = dark ? 'Back to now' : 'Right now';
  $('#nsNow').hidden = !when;
}
let timeFrame = 0;
$('#nsTime').addEventListener('input', (e) => {
  when = new Date(eveningStart().getTime() + Number(e.target.value) * 6e4);
  syncTime();
  cancelAnimationFrame(timeFrame);
  timeFrame = requestAnimationFrame(() => draw({ keepView: true }));
});
$('#nsNow').addEventListener('click', () => { when = null; night = null; syncTime(); draw({ keepView: true }); });
$('#nsDate').addEventListener('change', (e) => {
  const v = e.target.value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
  const now = new Date();
  night = v === ymd(eveningStart(now)) ? null : v;
  if (!night && isNight(now)) when = null;                     // tonight, and it's dark: back to now
  else when = new Date(eveningStart(now).getTime() + (Number($('#nsTime').value) || 180) * 6e4);
  syncTime();
  draw({ keepView: true });
});
// In "now" mode the sky keeps turning: redraw every minute while the page is open.
setInterval(() => { if (mode === 'T' && !when && !night && location.hash === '#sky' && !document.hidden) { syncTime(); draw({ keepView: true }); } }, 60000);

// ---------------------------------------------------------------------------------------------
// The Moon and planets. Drawn with the chart (positions from planets.js) and kept a constant size on screen.
function unitVec(ra, dec) { return [Math.cos(dec * rad) * Math.cos(ra * rad), Math.cos(dec * rad) * Math.sin(ra * rad), Math.sin(dec * rad)]; }
function drawBodies(at) {
  const moon = moonAt(at);
  bodies = [...planetsAt(at), moon];
  let out = '';
  for (const b of bodies) {
    const par = b.id === 'moon' ? b.parallax : 0;
    const s = project(b.ra, b.dec, par);
    b.xy = s;
    if (!s) continue;
    const pos = `data-x="${s[0].toFixed(1)}" data-y="${s[1].toFixed(1)}"`;
    if (b.id === 'moon') {
      // The lit side faces the Sun: step a little from the Moon toward the Sun to find that direction on the chart.
      const m = unitVec(b.ra, b.dec), u = unitVec(b.sun.ra, b.sun.dec), d = m.reduce((a, v, i) => a + v * u[i], 0);
      const q = m.map((v, i) => v + 0.03 * (u[i] - d * v)), n = Math.hypot(...q);
      const p2 = project((Math.atan2(q[1], q[0]) / rad + 360) % 360, Math.asin(q[2] / n) / rad, par);
      const rot = p2 ? Math.atan2(p2[1] - s[1], p2[0] - s[0]) / rad : 0;
      const R = 1.7, f = b.lit, rx = (R * Math.abs(1 - 2 * f)).toFixed(3);
      const lit = f > 0.97 ? `<circle class="m-lit" r="${R}"/>` : f < 0.03 ? ''
        : `<path class="m-lit" d="M0 ${-R}A${R} ${R} 0 0 1 0 ${R}A${rx} ${R} 0 0 ${f > 0.5 ? 1 : 0} 0 ${-R}Z"/>`;
      out += `<g class="ns-body ns-moon" data-body="moon" ${pos} data-rot="${rot.toFixed(1)}" tabindex="0" role="button" aria-label="The Moon, ${esc(b.phase.toLowerCase())}"><circle class="m-halo" r="2.7"/><circle class="m-dark" r="${R}"/>${lit}</g>`;
    } else {
      const glare = b.elong < 12 ? ' glare' : '';
      out += `<g class="ns-body ns-planet${glare}" data-body="${b.id}" ${pos} style="color:${b.color}" tabindex="0" role="button" aria-label="${b.name}"><circle class="p-hit" r="2.2"/><circle class="p-dot" r="${b.size}"/><text class="ns-bname" x="${(b.size + 0.75).toFixed(2)}" y=".55">${b.name}</text></g>`;
    }
  }
  return out;
}
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
function placeTip(el) {
  const tip = $('#nsTip'), wrap = $('#nsChart').getBoundingClientRect(), r = el.getBoundingClientRect();
  tip.hidden = false;
  const left = Math.min(Math.max(r.left - wrap.left + r.width / 2 - tip.offsetWidth / 2, 6), wrap.width - tip.offsetWidth - 6);
  const above = r.top - wrap.top - tip.offsetHeight - 12;
  tip.style.left = `${left}px`;
  tip.style.top = `${above > 6 ? above : r.bottom - wrap.top + 12}px`;
}
function showBodyTip(el) {
  const b = bodies.find((x) => x.id === el.dataset.body);
  if (!b) return;
  hideTip();
  const where = mode === 'T' ? cap(wherePhrase(b.ra, b.dec, b.parallax || 0)) : '';
  const line = b.id === 'moon' ? [`${Math.round(b.lit * 100)}% lit`, where] : [b.elong < 12 ? 'Lost in the Sun’s glare' : '', where];
  $('#nsTip').innerHTML = `<span class="ns-tip-cat">${b.id === 'moon' ? 'The Moon' : 'Planet'}</span><strong>${esc(b.id === 'moon' ? b.phase : b.name)}</strong>` +
    `<span class="ns-tip-line">${line.filter(Boolean).join(' · ')}</span>`;
  el.classList.add('on');
  placeTip(el);
}
function flyToBody(id) {
  const b = bodies.find((x) => x.id === id);
  if (!b?.xy) return;
  if (focused) unfocus();
  hideTip();
  const w = 280;
  animateTo({ x: b.xy[0] - w / 2, y: b.xy[1] - w / 2, w });
  setTimeout(() => { const el = $(`#nsChart .ns-body[data-body="${id}"]`); if (el) showBodyTip(el); }, 720);
}
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function bringChartIntoView() {
  const r = $('#nsChart').getBoundingClientRect();
  if (r.top < 0 || r.bottom > innerHeight) $('#nsChart').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
}

// ---------------------------------------------------------------------------------------------
// The chart in words: what's up, where to look, each one a button that flies there.
const conVisible = (c) => Boolean(P(c.c)) || c.b.some((q) => P(q));
function buildList(data) {
  const up = bodies.filter((b) => b.xy);
  let cons = Object.entries(data.con).filter(([, c]) => conVisible(c)).map(([k, c]) => ({ k, name: CON_NAMES[k] || c.n, c }));
  if (mode === 'T') {
    cons = cons.map((x) => ({ ...x, alt: horizontal(x.c.c[0] < 0 ? x.c.c[0] + 360 : x.c.c[0], x.c.c[1]).alt })).filter((x) => x.alt > 3 * rad).sort((a, b) => b.alt - a.alt);
  } else cons.sort((a, b) => a.name.localeCompare(b.name));
  const where = (ra, dec, par) => (mode === 'T' ? `<span class="nl-where">${wherePhrase(ra, dec, par)}</span>` : '');
  const item = (go, name, extra) => `<li><button type="button" data-go="${go}"><span class="nl-name">${esc(name)}</span>${extra}</button></li>`;
  const bodyItems = up.map((b) => item(`body:${b.id}`, b.id === 'moon' ? `The Moon (${b.phase.toLowerCase()})` : b.name,
    where(b.ra, b.dec, b.parallax || 0) + (b.id !== 'moon' && b.elong < 12 ? '<span class="nl-where">lost in the Sun’s glare</span>' : ''))).join('');
  const perCon = {};
  for (const e of INDEX) if (e.con) perCon[e.con] = (perCon[e.con] || 0) + 1;
  const count = (k) => (perCon[k] ? `<span class="nl-n">${perCon[k]} photograph${perCon[k] === 1 ? '' : 's'}</span>` : '');
  const conItems = cons.map((x) => item(`con:${x.k}`, x.name, (mode === 'T' ? where(x.c.c[0] < 0 ? x.c.c[0] + 360 : x.c.c[0], x.c.c[1]) : '') + count(x.k))).join('');
  $('#nsList').innerHTML =
    `<div class="nl-col"><h4 class="nc-k">Moon and planets</h4>${bodyItems ? `<ul>${bodyItems}</ul>` : `<p class="nl-none">None ${mode === 'T' ? 'above the horizon' : 'on this chart'} ${when ? 'then' : 'right now'}</p>`}</div>` +
    `<div class="nl-col nl-cons"><h4 class="nc-k">Constellations · ${cons.length}</h4><ul>${conItems}</ul></div>`;
  $('#nsListSum').textContent = mode === 'T' ? 'Everything above the horizon' : 'Everything on this chart';
  const line = tonightLine();
  $('#nsTonight').textContent = line;
  $('#nsTonight').hidden = !line;
}
// One sentence on what to look for: the Moon and the planets that are up, brightest first.
function tonightLine() {
  if (mode !== 'T') return '';
  const lead = !when ? 'Right now' : night
    ? `On ${eveningStart().toLocaleDateString([], { month: 'long', day: 'numeric' })} at ${timeLabel(when)}`
    : `At ${timeLabel(when)} tonight`;
  const moon = bodies.find((b) => b.id === 'moon');
  if (moon && horizontal(moon.sun.ra, moon.sun.dec).alt > -6 * rad) return `${lead}, the Sun is up. Slide the time into the evening to see the night sky`;
  const parts = [];
  if (moon?.xy && moon.lit >= 0.03) {
    const phase = moon.phase.toLowerCase().replace(' moon', '').replace(' quarter', '-quarter');
    parts.push(`a ${phase} Moon ${wherePhrase(moon.ra, moon.dec, moon.parallax)}`);
  }
  for (const id of ['venus', 'jupiter', 'mars', 'saturn', 'mercury']) {
    const b = bodies.find((x) => x.id === id);
    if (b?.xy && b.elong >= 12) parts.push(`${b.name} ${wherePhrase(b.ra, b.dec)}`);
  }
  if (!parts.length) return `${lead}: no Moon or planets above the horizon, so the sky is at its darkest`;
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
  return `${lead}: ${list}`;
}
// "In words" and "Refine" share one row of tabs; the open tab closes again on a second click.
const tabs = $$('.nc-tabs [role="tab"]');
function openTab(tab) {
  for (const t of tabs) {
    const on = t === tab && t.getAttribute('aria-selected') !== 'true';
    t.setAttribute('aria-selected', String(on));
    t.setAttribute('aria-expanded', String(on));
    t.tabIndex = on || (!tab && t === tabs[0]) ? 0 : -1;
    $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
  }
  if (!tabs.some((t) => t.getAttribute('aria-selected') === 'true')) tabs.forEach((t, i) => { t.tabIndex = i ? -1 : 0; });
}
tabs.forEach((t) => t.addEventListener('click', () => openTab(t)));
$('.nc-tabs').addEventListener('keydown', (e) => {
  const i = tabs.indexOf(document.activeElement);
  if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  e.preventDefault();
  tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].focus();
});
$('#nsList').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-go]');
  if (!b) return;
  const [kind, id] = b.dataset.go.split(':');
  bringChartIntoView();
  if (kind === 'con') focusCon(id); else flyToBody(id);
});

// ---------------------------------------------------------------------------------------------
// Find: a constellation, a planet or the Moon by name.
const norm = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^the\s+/, '').trim();
let findReady = false;
function buildFind(data) {
  if (findReady) return;
  findReady = true;
  const names = [...Object.entries(data.con).map(([k, c]) => CON_NAMES[k] || c.n), 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].sort((a, b) => a.localeCompare(b));
  $('#nsFindList').innerHTML = names.map((n) => `<option value="${esc(n)}"></option>`).join('');
}
async function find(q) {
  const n = norm(q), msg = $('#nsFindMsg');
  if (!n) { msg.textContent = ''; return; }
  const data = await loadSky();
  const off = (name) => (mode === 'T' ? `${name} is below the horizon ${when ? 'then' : 'right now'}`
    : `${name} isn’t in this half of the sky. Try the Whole ${mode === 'N' ? 'southern' : 'northern'} view`);
  const body = bodies.find((b) => norm(b.name) === n);
  if (body) {
    msg.textContent = body.xy ? '' : off(body.id === 'moon' ? 'The Moon' : body.name);
    if (body.xy) { bringChartIntoView(); flyToBody(body.id); }
    return;
  }
  const entries = Object.entries(data.con).map(([k, c]) => [k, CON_NAMES[k] || c.n]);
  const hit = entries.find(([, name]) => norm(name) === n) || entries.find(([, name]) => norm(name).startsWith(n));
  if (!hit) { msg.textContent = `Nothing called “${q.trim()}” here. Try a constellation, a planet or the Moon`; return; }
  const [k, name] = hit;
  if (!conVisible(data.con[k])) { msg.textContent = off(name); return; }
  msg.textContent = '';
  bringChartIntoView();
  focusCon(k);
}
$('#nsFindForm').addEventListener('submit', (e) => { e.preventDefault(); find($('#nsFind').value); });
// picking a suggestion from the list goes straight there
$('#nsFind').addEventListener('input', (e) => {
  const v = norm(e.target.value);
  if ([...$('#nsFindList').options].some((o) => norm(o.value) === v) && e.inputType !== 'insertText') find(e.target.value);
});

// ---------------------------------------------------------------------------------------------
// Share this view: a link with the view, night, time and constellation in it.
function shareUrl() {
  const q = new URLSearchParams({ v: mode });
  if (mode === 'T' && when) { q.set('d', ymd(eveningStart())); q.set('t', $('#nsTime').value); }
  if (focused) q.set('c', focused);
  return `${location.origin}${location.pathname}?${q}#sky`;
}
$('#nsShare').addEventListener('click', async () => {
  const label = $('#nsShare .nc-act-label'), url = shareUrl();
  try {
    if (navigator.share && touch) { await navigator.share({ title: 'Tonight’s sky · A Moment in the Cosmos', url }); return; }
    await navigator.clipboard.writeText(url);
    label.textContent = 'Link copied';
  } catch (err) {
    if (err?.name === 'AbortError') return;
    label.textContent = 'Couldn’t copy the link';
  }
  setTimeout(() => { label.textContent = 'Share this view'; }, 2200);
});
let pendingCon = null;
// Read a shared link once, then tidy the address bar.
function readLink() {
  const q = new URLSearchParams(location.search);
  if (!['v', 'd', 't', 'c'].some((k) => q.has(k))) return false;
  if (['T', 'N', 'S'].includes(q.get('v'))) mode = q.get('v');
  const d = q.get('d');
  if (mode === 'T' && /^\d{4}-\d{2}-\d{2}$/.test(d || '')) {
    const now = new Date();
    night = d === ymd(eveningStart(now)) ? null : d;
    const t = Math.min(720, Math.max(0, Number(q.get('t')) || 180));
    when = new Date(eveningStart(now).getTime() + t * 6e4);
  }
  if (q.get('c')) pendingCon = q.get('c');
  history.replaceState(null, '', `${location.pathname}#sky`);
  return true;
}

// ---------------------------------------------------------------------------------------------
// Night vision: tints the page red, which doesn't spoil eyes adjusted to the dark. Only on this page.
const nvLayer = document.createElement('div');
nvLayer.className = 'nv-overlay';
nvLayer.setAttribute('aria-hidden', 'true');
document.body.append(nvLayer);
let nightVision = Boolean(store.get('nsNight'));
function applyNight() {
  document.documentElement.classList.toggle('nv', nightVision && location.hash === '#sky');
  $('#nsNight').setAttribute('aria-pressed', String(nightVision));
}
$('#nsNight').addEventListener('click', () => { nightVision = !nightVision; store.set('nsNight', nightVision); applyNight(); });
window.addEventListener('hashchange', applyNight);
applyNight();

// Draw the first time the page is opened: tonight's sky above the visitor.
async function maybeDraw() {
  if (location.hash !== '#sky') return;
  if (!mode) {
    mode = ['T', 'N', 'S'].includes(saved.mode) ? saved.mode : 'T';
    const linked = readLink();
    const now = new Date();
    if (!when && !(linked && night) && !isNight(now)) when = new Date(eveningStart(now).getTime() + 180 * 6e4);   // daytime: open on 9 pm tonight
  }
  syncTime();
  await draw();
  buildFind(await loadSky());
  if (pendingCon) { const k = pendingCon; pendingCon = null; focusCon(k); }
}
// Called once the full collection index has loaded, so a page opened straight at #sky gets every dot.
export function refreshSky() { drawnFor = null; maybeDraw(); }
window.addEventListener('hashchange', maybeDraw);
window.addEventListener('popstate', maybeDraw);
maybeDraw();
