// Everything below the photo that describes it: story, scale, sidebar, explore, behind-the-photograph.
import { RIGHTS } from '../data/catalog.js';
import { $, esc } from './util.js';

const list = (sources) => sources.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('');
const missing = (t) => `<span class="missing">${esc(t)}</span>`;
const orMissing = (t) => (/not published/i.test(t) ? missing(t) : esc(t));

function behind(item, dims) {
  const b = item.behind;
  const filters = item.understand.filters.length
    ? item.understand.filters.map((f) => esc(f[0])).join('; ')
    : missing('Not applicable / not published (camera photograph).');
  const rows = [
    ['Photographer / team', esc(b.people)],
    ['Observatory or site', esc(b.observatory)],
    ['Instrument', esc(b.instrument)],
    ['Capture date', item.captureDate ? esc(item.captureDate) : missing('Capture date unavailable')],
    ['Release date', esc(item.releaseDate)],
    ['Exposure', orMissing(b.exposure)],
    ['Filters / wavelengths', filters],
    ['Image type', esc(b.technique)],
    ['Processing', orMissing(b.processing)],
    ['Original dimensions', `${item.img.origW.toLocaleString('en')} × ${item.img.origH.toLocaleString('en')} px (per source)`],
    ['Shown on this page', `${dims.w} × ${dims.h} px (measured in your browser)`],
    ['Full credit', esc(item.credit)],
    ['Usage rights', `<a href="${esc(RIGHTS[item.org].url)}" target="_blank" rel="noopener">${esc(RIGHTS[item.org].label)}</a>`],
    ['Source page', `<a href="${esc(item.source)}" target="_blank" rel="noopener">${esc(item.source.replace(/^https:\/\//, ''))}</a>`]
  ];
  return rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

document.addEventListener('photo:change', ({ detail: { item, dims } }) => {
  $('#story').innerHTML = item.story.map((p) => `<p>${esc(p)}</p>`).join('');
  $('#scaleBox').hidden = !item.scale;
  $('#scaleText').textContent = item.scale || '';
  $('#celestial').textContent = item.celestial;
  $('#recognition').innerHTML = `${esc(item.recognition.text)} <span class="src">(Editorial or institutional recognition.)</span>`;
  $('#sourcesList').innerHTML = list(item.sources);
  $('#exploreBody').innerHTML = item.explore.map((p) => `<p>${esc(p)}</p>`).join('') +
    `<p><strong>Further reading</strong></p><ul>${list(item.sources)}</ul>`;
  $('#behindList').innerHTML = behind(item, dims);
  $('#exploreDetails').open = false;
  $('#behindDetails').open = false;
});
