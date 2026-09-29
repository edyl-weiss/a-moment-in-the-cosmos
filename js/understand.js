// "Understand the image": filter/colour table, eye-vs-camera note, and verified overlay labels.
import { $, esc } from './util.js';

const SWATCH = { purple: '#9b6bff', blue: '#4f7dff', cyan: '#39d0e0', green: '#4fd06a', yellow: '#ffd84a', orange: '#ff9a3c', red: '#ff4d4d' };

function table(filters) {
  if (!filters.length) return '';
  const rows = filters.map(([w, c]) =>
    `<tr><td>${esc(w)}</td><td>${SWATCH[c] ? `<span class="sw" style="background:${SWATCH[c]}"></span>` : ''}${esc(c)}</td></tr>`).join('');
  return `<table class="filters"><thead><tr><th scope="col">Wavelength / filter</th><th scope="col">Shown as</th></tr></thead><tbody>${rows}</tbody></table>`;
}

document.addEventListener('photo:change', ({ detail: { item } }) => {
  const u = item.understand;
  const marked = item.labels.length
    ? `<p><strong>Marked on the photograph:</strong> ${item.labels.map((l) => esc(l.text)).join('; ')}. Positions come from the source’s own description.</p>`
    : '<p class="missing">No verified positional data is available for an overlay on this photograph, so the explanation is given in text only.</p>';
  $('#understandBody').innerHTML = `<p>${esc(u.summary)}</p>${table(u.filters)}<p>${esc(u.eye)}</p>${marked}`;
  $('#labels').innerHTML = item.labels.map((l) =>
    `<span class="lbl${l.x > 62 ? ' flip' : ''}" style="left:${l.x}%;top:${l.y}%"><i></i><b>${esc(l.text)}</b></span>`).join('');
});

$('#understandBtn').addEventListener('click', (e) => {
  const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
  e.currentTarget.setAttribute('aria-pressed', String(on));
  $('#understandPanel').hidden = !on;
  $('#frame').classList.toggle('annotated', on);
});
