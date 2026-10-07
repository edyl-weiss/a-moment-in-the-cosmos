// "Understand the image": filter/color table, eye-vs-camera note, and verified overlay labels.
import { $, esc } from './util.js';

const SWATCH = { purple: '#9b6bff', blue: '#4f7dff', cyan: '#39d0e0', green: '#4fd06a', yellow: '#ffd84a', orange: '#ff9a3c', red: '#ff4d4d' };

function table(filters) {
  if (!filters.length) return '';
  const rows = filters.map(([w, c]) =>
    `<tr><td>${esc(w)}</td><td>${SWATCH[c] ? `<span class="sw" style="background:${SWATCH[c]}"></span>` : ''}${esc(c)}</td></tr>`).join('');
  return `<table class="filters"><thead><tr><th scope="col">Wavelength / filter</th><th scope="col">Shown as</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// Sentences that only say a detail wasn't published add nothing for a reader; leave them out.
const NOT_SAID = /isn['’]t published|is not published|are not published|does not name|doesn['’]t (?:list|name|say)|not specified/i;
const plain = (t) => (t || '').split(/(?<=\.)\s+/).filter((s) => !NOT_SAID.test(s)).join(' ');

document.addEventListener('photo:change', ({ detail: { item } }) => {
  const u = { ...item.understand, summary: plain(item.understand.summary), eye: plain(item.understand.eye) };
  const marked = item.labels.length
    ? `<p>${item.labels.map((l) => esc(l.text)).join('; ')}.</p>`
    : '';
  const more = [
    u.filters.length && `<details><summary>How the colors were made</summary>${table(u.filters)}</details>`,
    u.eye && `<details><summary>What your eye would see</summary><p>${esc(u.eye)}</p></details>`,
    marked && `<details><summary>What’s marked on the photograph</summary>${marked}</details>`,
  ].filter(Boolean).join('');
  $('#understandBody').innerHTML = (u.summary ? `<p class="lede">${esc(u.summary)}</p>` : '') + more;
  $('#labels').innerHTML = item.labels.map((l) =>
    `<span class="lbl${l.x > 62 ? ' flip' : ''}" style="left:${l.x}%;top:${l.y}%"><i></i><b>${esc(l.text)}</b></span>`).join('');
});

$('#understandBtn').addEventListener('click', (e) => {
  const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
  e.currentTarget.setAttribute('aria-pressed', String(on));
  $('#understandPanel').hidden = !on;
  $('#frame').classList.toggle('annotated', on);
});
