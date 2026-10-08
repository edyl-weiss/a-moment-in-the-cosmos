// Night sky page. Three views of the same data:
//   Tonight  – the sky above the visitor right now (or at a time they pick tonight): an all-sky chart
//              centered overhead with the horizon as the rim, computed from their approximate location
//              and the current sidereal time. Only what is above the horizon is drawn.
//   Northern / Southern – the whole celestial hemisphere around the pole, out to 20° past the equator.
// Every photograph with a published position is a dot where it sits among the constellations.
import { $, $$, esc, CAT } from './util.js';
import { show, SOURCE } from './feature.js';
import { INDEX, INDEX_BY_ID } from './collection.js';
import { tile, scrollToFeature } from './tiles.js';
import { CON_NAMES } from '../data/constellations.js';
import { whereAmI } from './geo.js';
import { browseConstellation } from './archive.js';

const SIZE = 1000, C = SIZE / 2, EDGE = 20;              // degrees beyond the equator (pole views)
const rad = Math.PI / 180;
const RMAX = 2 * Math.tan((90 + EDGE) / 2 * rad);
const K = (C - 46) / RMAX;
const KT = (C - 46) / 2;                                 // tonight view: horizon (altitude 0) at radius 2
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

const shown = new Set(Object.keys(COLORS));
const LAYERS = { names: 'Constellation names', lines: 'Star figures', bounds: 'Constellation borders', faint: 'Faint stars', grid: 'Coordinate grid' };
const layersOn = new Set(['names', 'lines', 'faint']);   // borders and grid start off: less clutter
let orgFilter = 'all', total = 0, pendingFocus = 0;
let sky = null, mode = null, drawnFor = null, view = { x: 0, y: 0, w: SIZE }, selected = null, focused = null;
let here = null, when = null, lst = 0, sinLat = 0, cosLat = 1, years = 0;   // tonight: observer, chosen time, local sidereal time

const loadSky = () => sky || (sky = fetch('data/sky.json').then((r) => r.json()));

// Local sidereal time (degrees) for a moment and longitude.
function siderealDeg(date, lon) {
  const jd = date.getTime() / 864e5 + 2440587.5;
  return (((280.46061837 + 360.98564736629 * (jd - 2451545) + lon) % 360) + 360) % 360;
}

// RA and dec in degrees → [x, y] on the chart, or null if it isn't on this chart.
function project(ra, dec) {
  if (mode === 'T') {
    // Catalog positions are for the year 2000; precess them to tonight (about 0.4° by now).
    const a0 = ra * rad, t0 = Math.tan(Math.min(89.5, Math.abs(dec)) * rad) * Math.sign(dec);
    ra += years * (46.124 + 20.043 * Math.sin(a0) * t0) / 3600;
    dec += years * 20.043 * Math.cos(a0) / 3600;
    const H = (lst - ra) * rad, d = dec * rad;
    const sinAlt = sinLat * Math.sin(d) + cosLat * Math.cos(d) * Math.cos(H);
    if (sinAlt < -0.002) return null;                  // below the horizon
    const alt = Math.asin(Math.min(1, sinAlt));
    const az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * cosLat - Math.cos(d) * Math.cos(H) * sinLat);
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
  if (mode === 'T') {
    if (!here) here = await whereAmI();
    const t = when || new Date();
    years = (t.getTime() / 864e5 + 2440587.5 - 2451545) / 365.25;   // since J2000, for precession
    lst = siderealDeg(t, here.lon); sinLat = Math.sin(here.lat * rad); cosLat = Math.cos(here.lat * rad);
  }
  const key = mode === 'T' ? `T${Math.round(lst * 4)}` : mode;
  if (drawnFor === key) return;
  drawnFor = key;
  const rim = mode === 'T' ? 2 * KT : RMAX * K;
  let svg = `<defs>${SYMBOLS}<radialGradient id="nsSkyFill" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#11285a"/><stop offset=".6" stop-color="#0a1a3f"/><stop offset="1" stop-color="#050e26"/></radialGradient><clipPath id="nsClip"><circle cx="${C}" cy="${C}" r="${rim.toFixed(1)}"/></clipPath></defs>`;
  svg += `<circle class="ns-disc" cx="${C}" cy="${C}" r="${rim.toFixed(1)}"/><g clip-path="url(#nsClip)">`;
  if (mode === 'T') {
    // altitude rings at 30° and 60°
    for (const a of [30, 60]) svg += `<circle class="ns-grid" cx="${C}" cy="${C}" r="${(2 * Math.tan((90 - a) / 2 * rad) * KT).toFixed(1)}"/>`;
    const eq = []; for (let r = 0; r <= 360; r += 3) eq.push([r > 180 ? r - 360 : r, 0]);
    svg += `<path class="ns-grid ns-eq" d="${path(eq)}"/>`;
  } else {
    for (const d of [60, 30, 0]) {
      const r = 2 * Math.tan((90 - d) / 2 * rad) * K;
      svg += `<circle class="ns-grid${d === 0 ? ' ns-eq' : ''}" cx="${C}" cy="${C}" r="${r.toFixed(1)}"/>`;
    }
    for (let h = 0; h < 24; h += 2) {
      const e = project(h * 15, mode === 'N' ? -EDGE : EDGE);
      svg += `<line class="ns-grid" x1="${C}" y1="${C}" x2="${e[0].toFixed(1)}" y2="${e[1].toFixed(1)}"/>`;
    }
  }
  // Each constellation's area is clickable: tap anywhere inside it to explore it.
  for (const [k, c] of Object.entries(data.con)) { const d = path([...c.b, c.b[0]]); if (d) svg += `<path class="ns-area" data-con="${k}" d="${d}Z"/>`; }
  for (const [lon, lat, mag] of data.stars) {
    const s = P([lon, lat]);
    if (s) svg += `<circle class="ns-star${mag > 3.5 ? ' faint' : ''}" cx="${s[0].toFixed(1)}" cy="${s[1].toFixed(1)}" r="${Math.max(0.7, 3.4 - mag * 0.55).toFixed(2)}"/>`;
  }
  for (const [k, c] of Object.entries(data.con)) { const d = (c.l || []).map(path).join(''); if (d) svg += `<path class="ns-line" data-con="${k}" d="${d}"/>`; }
  svg += '<g class="ns-names">';
  for (const [k, c] of Object.entries(data.con)) {
    const s = P(c.c);
    if (s) svg += `<text class="ns-con" data-con="${k}" x="${s[0].toFixed(1)}" y="${s[1].toFixed(1)}" tabindex="0" role="button">${esc(CON_NAMES[k] || c.n)}</text>`;
  }
  svg += '</g><g class="ns-dots">';
  const list = photos();
  for (const e of list) {
    const s = project(e.ra, e.dec);
    if (s) svg += `<g class="ns-dot" data-id="${esc(e.id)}" data-cat="${e.cat}" data-org="${e.org}" data-x="${s[0].toFixed(1)}" data-y="${s[1].toFixed(1)}" style="color:${COLORS[e.cat] || '#ddd'}" tabindex="0" role="button" aria-label="${esc(e.title)}"><use href="#nsSym-${e.cat}"/></g>`;
  }
  svg += '</g></g>';
  if (mode === 'T') {
    // compass around the horizon (east is on the left when you look up)
    for (const [t, ang] of [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270], ['NW', 315]]) {
      const r = rim + 22, a = ang * rad;
      svg += `<text class="ns-hour${t.length === 1 ? ' ns-cardinal' : ''}" x="${(C - r * Math.sin(a)).toFixed(1)}" y="${(C - r * Math.cos(a) + 5).toFixed(1)}">${t}</text>`;
    }
    svg += `<text class="ns-pole" x="${C}" y="${C + 4}">overhead</text>`;
  } else {
    for (let h = 0; h < 24; h += 2) {
      const r = RMAX * K + 22, a = h * 15 * rad;
      const x = mode === 'N' ? C - r * Math.sin(a) : C + r * Math.sin(a), y = C - r * Math.cos(a);
      svg += `<text class="ns-hour" x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}">${h}h</text>`;
    }
    svg += `<text class="ns-pole" x="${C}" y="${C + 4}">${mode === 'N' ? 'north celestial pole' : 'south celestial pole'}</text>`;
  }
  const what = mode === 'T' ? 'the sky above you' : `the ${mode === 'N' ? 'northern' : 'southern'} sky`;
  $('#nsChart').innerHTML = `<svg viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="Star chart of ${what} with ${list.length} photographs marked">${svg}</svg>`;

  const counts = {};
  for (const e of list) counts[e.cat] = (counts[e.cat] || 0) + 1;
  // The legend doubles as the filter: each category toggles on and off.
  total = list.length;
  $('#nsLegend').innerHTML = Object.keys(COLORS)
    .map((c) => `<button type="button" data-cat="${c}" aria-pressed="${shown.has(c)}"><span class="ns-check" style="--c:${COLORS[c]}" aria-hidden="true"></span>${symbolSvg(c, COLORS[c])}${PLURAL[c]}<b>${counts[c] || 0}</b></button>`).join('');
  const orgs = [...new Set(INDEX.filter((e) => Number.isFinite(e.ra)).map((e) => e.org))];
  $('#nsOrg').innerHTML = '<option value="all">All observatories</option>' + orgs.map((o) => `<option value="${o}">${esc(SOURCE[o] || o)}</option>`).join('');
  $('#nsOrg').value = orgFilter;
  $('#nsFoot').textContent = mode === 'T'
    ? `The sky above ${here.guessed ? 'roughly where you are (estimated from your time zone)' : 'your approximate location'}${when ? ` at ${timeLabel(when)} tonight` : ' right now'}, with the horizon as the outer ring. ` +
      'Only what is above the horizon is shown. In daylight the stars are still there, just washed out by the Sun.'
    : `${list.length.toLocaleString('en')} photographs with a published position in this half of the sky. ` +
      'Night-sky landscapes and photographs without a published position aren’t shown. Hours around the edge are right ascension.';
  $$('.ns-hemi button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.hemi === mode)));
  $('#nsTimeRow').hidden = mode !== 'T';
  if (!keepView) view = { x: 0, y: 0, w: SIZE };
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
  svg.style.setProperty('--z', z);
  const k = (5.2 * Math.max(z, 0.35)).toFixed(2);
  for (const d of svg.querySelectorAll('.ns-dot')) d.setAttribute('transform', `translate(${d.dataset.x} ${d.dataset.y}) scale(${k})`);
  svg.classList.toggle('zoomed', z < 0.7);
  $('#nsChart').classList.toggle('pannable', z < 0.999);
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
const filtered = () => shown.size < Object.keys(COLORS).length || orgFilter !== 'all';
const visible = (e) => shown.has(e.cat) && (orgFilter === 'all' || e.org === orgFilter);
function applyFilter() {
  const svg = $('#nsChart svg');
  if (svg) {
    for (const c of Object.keys(COLORS)) svg.classList.toggle(`hide-${c}`, !shown.has(c));
    for (const l of Object.keys(LAYERS)) svg.classList.toggle(`no-${l}`, !layersOn.has(l));
    for (const d of svg.querySelectorAll('.ns-dot')) d.classList.toggle('off', orgFilter !== 'all' && d.dataset.org !== orgFilter);
  }
  $$('#nsLayers button').forEach((b) => b.setAttribute('aria-pressed', String(layersOn.has(b.dataset.layer))));
  // Say what's on the chart, and offer one way back to everything.
  const n = INDEX.filter((e) => onChart(e) && visible(e)).length;
  $('#nsStatus').innerHTML = filtered()
    ? `Showing <b>${n.toLocaleString('en')}</b> of ${total.toLocaleString('en')} photographs. <button type="button" id="nsClear">Show everything</button>`
    : `Showing all <b>${total.toLocaleString('en')}</b> photographs ${mode === 'T' ? 'above your horizon' : 'in this half of the sky'}.`;
  $$('#nsLegend button').forEach((b) => b.setAttribute('aria-pressed', String(shown.has(b.dataset.cat))));
  if (selected && !visible(INDEX_BY_ID[selected] || {})) hideTip();
  if (focused) focusCon(focused, false);
}
function hideTip() { $('#nsTip').hidden = true; selected = null; $$('#nsChart .ns-dot.on').forEach((d) => d.classList.remove('on')); }
// Explore one constellation: highlight it, zoom to it and list the photographs inside it.
async function focusCon(k, fly = true) {
  const data = await loadSky(), c = data.con[k];
  if (!c) return;
  focused = k;
  $$('#nsChart [data-con]').forEach((el) => el.classList.toggle('focus', el.dataset.con === k));
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
  panel.innerHTML = `<div class="ns-p-head"><p class="ns-p-k">Constellation</p><h3>${esc(name)}</h3>
    <p class="ns-p-n">${inside.length ? `${inside.length} ${filtered() ? 'matching ' : ''}photograph${inside.length === 1 ? '' : 's'} in the collection` : filtered() ? 'Nothing matching your filters here' : 'Nothing from here in the collection yet'}</p></div>
    <div class="grid small" id="nsPGrid"></div>
    <p class="ns-p-actions">${inside.length > 8 ? `<button type="button" id="nsAll">See all ${inside.length} in the archive →</button>` : ''}
    <button type="button" id="nsWhole">← Whole sky</button></p>`;
  const grid = $('#nsPGrid');
  for (const e of inside.slice(0, 8)) grid.appendChild(tile({ id: e.id, title: e.title, cat: e.cat, thumb: e.thumb, sub: e.y, onOpen: () => open(e.id) }));
  panel.hidden = false;
  $('#sky').classList.add('has-panel');
  if (fly) hideTip();
}
function unfocus() {
  focused = null;
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

const chart = $('#nsChart');
chart.addEventListener('wheel', (e) => { if (!$('#nsChart svg')) return; e.preventDefault(); const [x, y] = toChart(e); zoomAt(x, y, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
const ptrs = new Map(); let drag = null, pinch = null, moved = 0;
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
    zoomAt(x, y, view.w / (pinch.w * pinch.d / d), true); moved = 99;
  } else if (drag && view.w < SIZE) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    moved = Math.max(moved, Math.hypot(dx, dy));
    if (moved > 4) { chart.setPointerCapture(e.pointerId); view.x = drag.vx - dx / r.width * view.w; view.y = drag.vy - dy / r.height * view.w; clampView(); applyView(); hideTip(); }
  }
});
const end = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; if (!ptrs.size) drag = null; };
chart.addEventListener('pointerup', end);
chart.addEventListener('pointercancel', end);
chart.addEventListener('click', (e) => {
  if (moved > 4) return;
  // Dots are small, so a tap within a finger's width of one counts as hitting it.
  const dot = e.target.closest('.ns-dot') || nearestDot(e.clientX, e.clientY, matchMedia('(pointer: coarse)').matches ? 22 : 9);
  if (dot) { if (selected === dot.dataset.id && matchMedia('(pointer: fine)').matches) open(selected); else showTip(dot); return; }
  const area = e.target.closest('.ns-con, .ns-area, .ns-line');
  if (area) {
    // wait a beat so a double-click can zoom instead of flying to the constellation
    const k = area.dataset.con;
    clearTimeout(pendingFocus);
    if (e.detail === 1) pendingFocus = setTimeout(() => (focused === k ? hideTip() : focusCon(k)), 240);
    return;
  }
  hideTip();
});
chart.addEventListener('mouseover', (e) => { const dot = e.target.closest('.ns-dot'); if (dot && matchMedia('(pointer: fine)').matches) showTip(dot); });
chart.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const dot = e.target.closest('.ns-dot'), con = e.target.closest('.ns-con');
  if (dot) { e.preventDefault(); selected === dot.dataset.id ? open(selected) : showTip(dot); }
  if (con) { e.preventDefault(); focusCon(con.dataset.con); }
});
$('#nsTip').addEventListener('click', (e) => { if (e.target.id === 'nsOpen' && selected) open(selected); });
// Double-click (or double-tap) zooms in where you point; arrow keys and + / − work once the chart has focus.
chart.addEventListener('dblclick', (e) => { clearTimeout(pendingFocus); e.preventDefault(); const [x, y] = toChart(e); zoomAt(x, y, 1.8); });
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
  if (e.target.id === 'nsWhole') { unfocus(); animateTo({ x: 0, y: 0, w: SIZE }); }
});
const zoomCenter = (f) => zoomAt(view.x + view.w / 2, view.y + view.w / 2, f);
$('#nsIn').addEventListener('click', () => zoomCenter(1.6));
$('#nsOut').addEventListener('click', () => zoomCenter(1 / 1.6));
$('#nsReset').addEventListener('click', () => { unfocus(); animateTo({ x: 0, y: 0, w: SIZE }); hideTip(); });
$('#nsLegend').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-cat]');
  if (!b) return;
  const c = b.dataset.cat;
  if (shown.has(c)) { if (shown.size > 1) shown.delete(c); } else shown.add(c);   // always keep one on
  applyFilter();
});
$('#nsLayers').innerHTML = Object.entries(LAYERS).map(([k, v]) => `<button type="button" data-layer="${k}" aria-pressed="${layersOn.has(k)}">${v}</button>`).join('');
$('#nsLayers').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-layer]');
  if (!b) return;
  layersOn.has(b.dataset.layer) ? layersOn.delete(b.dataset.layer) : layersOn.add(b.dataset.layer);
  applyFilter();
});
$('#nsOrg').addEventListener('change', (e) => { orgFilter = e.target.value; applyFilter(); });
$('#nsStatus').addEventListener('click', (e) => {
  if (e.target.id !== 'nsClear') return;
  Object.keys(COLORS).forEach((c) => shown.add(c)); orgFilter = 'all'; $('#nsOrg').value = 'all'; applyFilter();
});
// The how-to hint fades once someone has started exploring.
const quiet = () => $('#nsHint').classList.add('gone');
['wheel', 'pointerdown', 'keydown'].forEach((t) => chart.addEventListener(t, quiet, { once: true, passive: true }));
$$('.ns-hemi button').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.hemi; draw(); }));

// Tonight's time: "now", or any time from 6 pm tonight to 6 am tomorrow with the slider.
function eveningStart(now = new Date()) {
  const d = new Date(now); d.setHours(18, 0, 0, 0);
  if (now.getHours() < 12) d.setDate(d.getDate() - 1);   // after midnight, "tonight" began yesterday evening
  return d;
}
function syncTime() {
  const now = new Date(), t = when || now, start = eveningStart(now);
  const mins = Math.round((t - start) / 6e4);
  const slider = $('#nsTime');
  slider.value = Math.min(720, Math.max(0, mins));
  $('#nsTimeLabel').textContent = when ? timeLabel(when) : `Now, ${timeLabel(now)}`;
  $('#nsNow').hidden = !when;
}
let timeFrame = 0;
$('#nsTime').addEventListener('input', (e) => {
  when = new Date(eveningStart().getTime() + Number(e.target.value) * 6e4);
  syncTime();
  cancelAnimationFrame(timeFrame);
  timeFrame = requestAnimationFrame(() => draw({ keepView: true }));
});
$('#nsNow').addEventListener('click', () => { when = null; syncTime(); draw({ keepView: true }); });
// In "now" mode the sky keeps turning: redraw every minute while the page is open.
setInterval(() => { if (mode === 'T' && !when && location.hash === '#sky' && !document.hidden) { syncTime(); draw({ keepView: true }); } }, 60000);

// Draw the first time the page is opened: tonight's sky above the visitor.
async function maybeDraw() {
  if (location.hash !== '#sky') return;
  if (!mode) mode = 'T';
  syncTime();
  draw();
}
// Called once the full collection index has loaded, so a page opened straight at #sky gets every dot.
export function refreshSky() { drawnFor = null; maybeDraw(); }
window.addEventListener('hashchange', maybeDraw);
window.addEventListener('popstate', maybeDraw);
maybeDraw();
