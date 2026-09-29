// Immersive viewer: fullscreen <dialog> with pan, zoom (wheel, pinch, keys, buttons),
// on-demand full-resolution file, and flyTo() for the guided tour.
import { $, reducedMotion } from './util.js';
import { state, altText } from './feature.js';

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
}

function zoomAt(px, py, s) {
  s = Math.min(V.maxS, Math.max(1, s));
  V.x = px - (px - V.x) * (s / V.s);
  V.y = py - (py - V.y) * (s / V.s);
  V.s = s;
  apply();
}
const zoomCentre = (factor) => { const [vw, vh] = size(); zoomAt(vw / 2, vh / 2, V.s * factor); };

// Centre the point (xPct, yPct) of the image at the given zoom, animated unless reduced motion.
// `bottomInset` keeps the point clear of anything covering the bottom of the viewer (the tour card).
export function flyTo(xPct, yPct, zoom, bottomInset = 0) {
  const [vw, vh] = size();
  V.s = Math.min(V.maxS, Math.max(1, zoom));
  V.x = vw / 2 - (xPct / 100) * V.fitW * V.s;
  V.y = (vh - bottomInset) / 2 - (yPct / 100) * V.fitH * V.s;
  img.classList.toggle('flying', !reducedMotion());
  apply();
}
img.addEventListener('transitionend', () => img.classList.remove('flying'));

export const isOpen = () => dlg.open;

export function openViewer(opener) {
  const it = state.item;
  if (!it) return;
  V.opener = opener || document.activeElement;
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
  dlg.showModal();
  layout();
  $('#vClose').focus();
}

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
    $('#vStatus').textContent = 'The full-resolution file could not be loaded; the smaller version is still shown.';
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

$('#vZoomIn').addEventListener('click', () => zoomCentre(1.5));
$('#vZoomOut').addEventListener('click', () => zoomCentre(1 / 1.5));
$('#vReset').addEventListener('click', () => { V.s = 1; apply(); });
$('#vFull').addEventListener('click', loadFull);
$('#vClose').addEventListener('click', () => dlg.close());

const KEYS = {
  '+': () => zoomCentre(1.4), '=': () => zoomCentre(1.4), '-': () => zoomCentre(1 / 1.4), '_': () => zoomCentre(1 / 1.4),
  '0': () => { V.s = 1; apply(); },
  ArrowLeft: () => { V.x += 60; apply(); }, ArrowRight: () => { V.x -= 60; apply(); },
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
