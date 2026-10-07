// Immersive viewer: fullscreen <dialog> with pan, zoom (wheel, pinch, keys, buttons),
// on-demand full-resolution file, and flyTo() for the guided tour.
import { $, reducedMotion } from './util.js';
import { state, altText, show } from './feature.js';
import { todayIndex, dailyId, dateOf, fmtDate, say } from './util.js';

const dlg = $('#viewer'), surf = $('#vsurface'), img = $('#vimg');
const V = { s: 1, x: 0, y: 0, fitW: 0, fitH: 0, maxS: 8, ptrs: new Map(), pinch: null, opener: null };

const size = () => [surf.clientWidth, surf.clientHeight];

function layout() {
  const { w, h } = state.dims, [vw, vh] = size(), f = Math.min(vw / w, vh / h);
  V.fitW = w * f; V.fitH = h * f; V.maxS = Math.max(2, (w / V.fitW) * 2);
  img.style.width = V.fitW + 'px';
  img.style.height = V.fitH + 'px';
  V.s = 1; apply();
}

function apply() {
  const [vw, vh] = size(), w = V.fitW * V.s, h = V.fitH * V.s;
  V.x = w <= vw ? (vw - w) / 2 : Math.min(0, Math.max(vw - w, V.x));
  V.y = h <= vh ? (vh - h) / 2 : Math.min(0, Math.max(vh - h, V.y));
  img.style.transform = `translate(${V.x}px, ${V.y}px) scale(${V.s})`;
  placeMark();
}

// Guided-tour marker: a thin ring drawn around the feature being described, kept in step with pan and zoom.
const mark = $('#tourMark');
let markAt = null;
export function setMark(x, y) { markAt = x == null ? null : [x, y]; mark.hidden = !markAt; placeMark(); }
function placeMark() {
  if (!markAt) return;
  mark.style.transform = `translate(${V.x + (markAt[0] / 100) * V.fitW * V.s}px, ${V.y + (markAt[1] / 100) * V.fitH * V.s}px)`;
  mark.classList.toggle('moving', img.classList.contains('flying'));
}

function zoomAt(px, py, s) {
  s = Math.min(V.maxS, Math.max(1, s));
  V.x = px - (px - V.x) * (s / V.s);
  V.y = py - (py - V.y) * (s / V.s);
  V.s = s;
  apply();
}
const zoomCenter = (factor) => { const [vw, vh] = size(); zoomAt(vw / 2, vh / 2, V.s * factor); };

// Center the point (xPct, yPct) of the image at the given zoom, animated unless reduced motion.
// `bottomInset` keeps the point clear of anything covering the bottom of the viewer (the tour card).
export function flyTo(xPct, yPct, zoom, bottomInset = 0) {
  const [vw, vh] = size();
  V.s = Math.min(V.maxS, Math.max(1, zoom));
  V.x = vw / 2 - (xPct / 100) * V.fitW * V.s;
  V.y = (vh - bottomInset) / 2 - (yPct / 100) * V.fitH * V.s;
  img.classList.toggle('flying', !reducedMotion());
  apply();
}
img.addEventListener('transitionend', () => { img.classList.remove('flying'); mark.classList.remove('moving'); });

export const isOpen = () => dlg.open;

export function openViewer(opener) {
  if (!state.item) return;
  V.opener = opener || document.activeElement;
  fill();
  dlg.showModal();
  layout();
  $('#vClose').focus();
}

// Fill the viewer from the photograph currently shown (also used when paging between days).
function fill() {
  const it = state.item;
  img.src = it.img.pub;
  img.alt = altText(it);
  $('#vCredit').textContent = `${it.title} · Credit: ${it.credit}`;
  $('#vStatus').textContent = `Showing ${state.dims.w} × ${state.dims.h}`;
  const full = $('#vFull');
  full.hidden = !it.img.large;
  full.disabled = false;
  if (it.img.large) {
    const size = it.img.largeMB ? ` · ${Math.round(it.img.largeMB * 10) / 10} MB` : '';
    full.textContent = `Full resolution${size}`;
    full.setAttribute('aria-label', `Load the full-resolution JPEG from the source${size}`);
  }
  pageButtons();
}

// Paging: step through the daily photographs like turning pages. A photograph opened from the
// archive keeps its day; anything else pages outward from today. Days after today are never shown.
const touring = () => !$('#tourCard').hidden;
function currentDay() { return Number.isInteger(state.ctx?.day) ? state.ctx.day : todayIndex(); }
export function pageButtons() {
  const d = currentDay(), t = touring();
  $('#vPrevDay').disabled = t || d <= 0;
  $('#vNextDay').disabled = t || d >= todayIndex() || !Number.isInteger(state.ctx?.day);
  $('#vPrevDay').closest('.vpage').hidden = t;
}
export function page(step) {
  if (touring()) return;
  const today = todayIndex(), d = currentDay() + step;
  if (d < 0 || d > today) return;
  surf.classList.add('turning');
  show(dailyId(d), d === today ? { mode: 'daily', day: d } : { mode: 'archive', day: d });
  say(`Showing the photograph for ${fmtDate(dateOf(d))}`);
}
document.addEventListener('photo:change', () => {
  if (!dlg.open) return;
  fill();
  layout();
  surf.classList.remove('turning');
});
$('#vPrevDay').addEventListener('click', () => page(-1));
$('#vNextDay').addEventListener('click', () => page(1));

function loadFull() {
  const it = state.item, btn = $('#vFull');
  btn.disabled = true;
  btn.textContent = 'Loading full resolution…';
  $('#vStatus').textContent = 'Downloading the full-resolution file from the source…';
  const im = new Image();
  im.onload = () => {
    if (!dlg.open) return;
    img.src = im.src;                      // same aspect ratio, so the current view is kept
    V.maxS = Math.max(2, (im.naturalWidth / V.fitW) * 1.5);
    btn.textContent = 'Full resolution loaded';
    $('#vStatus').textContent = `Showing ${im.naturalWidth} × ${im.naturalHeight} (full resolution)`;
  };
  im.onerror = () => {
    btn.disabled = false;
    btn.textContent = 'Retry full resolution';
    $('#vStatus').textContent = 'The full-resolution file wouldn’t load, so you’re still seeing the smaller one.';
  };
  im.src = it.img.large;
}

surf.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = surf.getBoundingClientRect();
  zoomAt(e.clientX - r.left, e.clientY - r.top, V.s * Math.exp(-e.deltaY * 0.0015));
}, { passive: false });

surf.addEventListener('pointerdown', (e) => {
  surf.setPointerCapture(e.pointerId);
  V.ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  V.swipe = V.ptrs.size === 1 ? [e.clientX, e.clientY] : null;
  surf.classList.add('dragging');
  if (V.ptrs.size === 2) {
    const [a, b] = [...V.ptrs.values()];
    V.pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: V.s };
  }
});
surf.addEventListener('pointermove', (e) => {
  const prev = V.ptrs.get(e.pointerId);
  if (!prev) return;
  V.ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (V.ptrs.size === 2 && V.pinch) {
    const [a, b] = [...V.ptrs.values()], r = surf.getBoundingClientRect();
    zoomAt((a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top, V.pinch.s * Math.hypot(a[0] - b[0], a[1] - b[1]) / V.pinch.d);
  } else if (V.ptrs.size === 1) {
    V.x += e.clientX - prev[0];
    V.y += e.clientY - prev[1];
    apply();
  }
});
const endPointer = (e) => {
  const start = V.swipe;
  if (start && V.ptrs.size === 1 && V.s <= 1.01 && e.type === 'pointerup') {
    const dx = e.clientX - start[0], dy = e.clientY - start[1];
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) page(dx < 0 ? 1 : -1);
  }
  V.swipe = null;
  V.ptrs.delete(e.pointerId);
  if (V.ptrs.size < 2) V.pinch = null;
  if (!V.ptrs.size) surf.classList.remove('dragging');
};
surf.addEventListener('pointerup', endPointer);
surf.addEventListener('pointercancel', endPointer);
surf.addEventListener('dblclick', (e) => {
  const r = surf.getBoundingClientRect();
  zoomAt(e.clientX - r.left, e.clientY - r.top, V.s > 1.5 ? 1 : 2.5);
});

$('#vZoomIn').addEventListener('click', () => zoomCenter(1.5));
$('#vZoomOut').addEventListener('click', () => zoomCenter(1 / 1.5));
$('#vReset').addEventListener('click', () => { V.s = 1; apply(); });
$('#vFull').addEventListener('click', loadFull);
$('#vClose').addEventListener('click', () => dlg.close());

const KEYS = {
  '+': () => zoomCenter(1.4), '=': () => zoomCenter(1.4), '-': () => zoomCenter(1 / 1.4), '_': () => zoomCenter(1 / 1.4),
  '0': () => { V.s = 1; apply(); },
  ArrowLeft: () => (V.s > 1.01 ? (V.x += 60, apply()) : page(-1)), ArrowRight: () => (V.s > 1.01 ? (V.x -= 60, apply()) : page(1)),
  ArrowUp: () => { V.y += 60; apply(); }, ArrowDown: () => { V.y -= 60; apply(); }
};
dlg.addEventListener('keydown', (e) => {
  const act = KEYS[e.key];
  if (!act) return;
  e.preventDefault();
  act();
});
dlg.addEventListener('close', () => {
  V.ptrs.clear();
  img.removeAttribute('src');
  document.dispatchEvent(new Event('viewer:close'));
  if (V.opener?.isConnected) V.opener.focus();
});
window.addEventListener('resize', () => { if (dlg.open) layout(); });

$('#immersiveBtn').addEventListener('click', (e) => openViewer(e.currentTarget));
$('#frame').addEventListener('click', (e) => openViewer(e.currentTarget));
$('#frame').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(e.currentTarget); }
});
