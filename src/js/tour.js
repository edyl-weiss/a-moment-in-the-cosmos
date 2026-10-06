// Guided "look closer" tour: opens the immersive viewer and flies between the
// stops in data/tours.js, with a caption card and Previous / Next controls.
import { TOURS } from '../data/tours.js';
import { $, say } from './util.js';
import { state } from './feature.js';
import { openViewer, flyTo, setMark, pageButtons } from './viewer.js';

const card = $('#tourCard');
let stops = null, i = 0;

function go(n) {
  i = n;
  const s = stops[i];
  card.classList.remove('turn'); void card.offsetWidth; card.classList.add('turn');
  $('#tourStep').textContent = `Stop ${i + 1} of ${stops.length}`;
  $('#tourTitle').textContent = s.title;
  $('#tourText').textContent = s.text;
  $('#tourPrev').disabled = i === 0;
  $('#tourNext').textContent = i === stops.length - 1 ? 'Finish' : 'Next';
  flyTo(s.x, s.y, s.zoom, card.offsetHeight + 80);
  setMark(s.x, s.y);
  say(`Stop ${i + 1} of ${stops.length}: ${s.title}. ${s.text}`);
}

function end() {
  stops = null;
  card.hidden = true;
  setMark(null);
  pageButtons();
  flyTo(50, 50, 1);
}

export function startTour(opener) {
  stops = TOURS[state.item.id];
  if (!stops) return;
  openViewer(opener);
  card.hidden = false;
  pageButtons();
  go(0);
  $('#tourNext').focus();
}

$('#tourPrev').addEventListener('click', () => go(Math.max(0, i - 1)));
$('#tourNext').addEventListener('click', () => (i < stops.length - 1 ? go(i + 1) : end()));
$('#tourEnd').addEventListener('click', end);
window.addEventListener('keydown', (e) => {
  if (!stops || e.target.closest('input,select,textarea')) return;
  if (e.key === 'ArrowRight' && i < stops.length - 1) { e.preventDefault(); e.stopImmediatePropagation(); go(i + 1); }
  if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); e.stopImmediatePropagation(); go(i - 1); }
}, true);
$('#tourBtn').addEventListener('click', (e) => startTour(e.currentTarget));
document.addEventListener('viewer:close', () => { stops = null; card.hidden = true; setMark(null); });
document.addEventListener('photo:change', ({ detail: { item } }) => {
  const n = TOURS[item.id]?.length;
  $('#tourBtn').hidden = !n;
  $('#tourCount').textContent = n ? `${n} stops` : '';
});

// Checking aid: open the site with ?tourcheck and every tour stop is drawn on the photograph as a
// numbered ring, so stop positions can be checked against the real image at a glance.
if (new URLSearchParams(location.search).has('tourcheck')) {
  document.addEventListener('photo:change', ({ detail: { item } }) => {
    const s = TOURS[item.id] || [];
    $('#labels').insertAdjacentHTML('beforeend', s.map((p, n) =>
      `<span class="tc" style="left:${p.x}%;top:${p.y}%"><b>${n + 1}</b> ${p.title}</span>`).join(''));
    $('#frame').classList.toggle('annotated', s.length > 0);
  });
}
