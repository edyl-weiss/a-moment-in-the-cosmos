// Everything below the photo that describes it: story, scale, sidebar, explore, behind-the-photograph.
import { RIGHTS } from '../data/catalog.js';
import { $, esc } from './util.js';

const MIN_EXPLORE_WORDS = 20;   // under ~two sentences
const words = (paras) => paras.join(' ').split(/\s+/).filter(Boolean).length;
const list = (sources) => sources.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('');

// The scale lines were generated from catalog fields; say the result, not the working.
function plainScale(t) {
  return t
    .replace(/^Using the source's listed field of view \([^)]*\) and distance \([^)]*\), the frame spans roughly ([^.]+)\./, 'The frame is roughly $1 across.')
    .replace(/Its light set out about (.+?) years before reaching the telescope\./, 'Its light set out about $1 years ago.')
    .replace(/^The source lists a distance of [^,]+, so the light in this picture set out/, 'The light in this picture set out')
    .replace(/, according to the caption\./, '.');
}

function behind(item, dims) {
  const b = item.behind;
  const filters = item.understand.filters.length
    ? item.understand.filters.map((f) => esc(f[0])).join('; ')
    : '';
  const known = (v) => v && !/not published|unavailable|not applicable/i.test(v);
  const rows = [
    ['Photographer / team', esc(b.people)],
    ['Observatory or site', esc(b.observatory)],
    ['Instrument', esc(b.instrument)],
    ['Taken', item.captureDate ? esc(item.captureDate) : ''],
    ['Release date', esc(item.releaseDate)],
    ['Exposure', known(b.exposure) ? esc(b.exposure) : ''],
    ['Filters / wavelengths', filters],
    ['Image type', esc(b.technique)],
    ['Processing', known(b.processing) ? esc(b.processing) : ''],
    ['Original dimensions', `${item.img.origW.toLocaleString('en')} × ${item.img.origH.toLocaleString('en')} px`],
    ['Full credit', esc(item.credit)],
    ['Usage rights', `<a href="${esc(RIGHTS[item.org].url)}" target="_blank" rel="noopener">${esc(RIGHTS[item.org].label)}</a>`],
    ['Source page', `<a href="${esc(item.source)}" target="_blank" rel="noopener">${esc(item.source.replace(/^https:\/\//, ''))}</a>`]
  ];
  return rows.filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

document.addEventListener('photo:change', ({ detail: { item, dims } }) => {
  $('#story').innerHTML = item.story.map((p) => `<p>${esc(p)}</p>`).join('');
  $('#scaleBox').hidden = !item.scale;
  $('#scaleText').textContent = plainScale(item.scale || '');
  const where = item.celestial.replace(/ \(source figure\)/g, '');
  const unknownWhere = /not published|does not name/i.test(where);
  $('#celestial').textContent = unknownWhere ? '' : where;
  $('#celestial').hidden = $('#celestial').previousElementSibling.hidden = unknownWhere;
  // Keep the observatory's own honor; drop the boilerplate disclaimers after it.
  const rec = item.recognition.text.replace(/\s*\((?:an )?editorial selection[^)]*\)/gi, '').replace(/\s*No published (?:audience )?rating\.?/gi, '').trim();
  $('#recognition').textContent = rec;
  $('#recognition').hidden = $('#recognition').previousElementSibling.hidden = !rec;
  $('#sourcesList').innerHTML = list(item.sources);
  $('#exploreBody').innerHTML = item.explore.map((p) => `<p>${esc(p)}</p>`).join('') +
    `<p><strong>Further reading</strong></p><ul>${list(item.sources)}</ul>`;
  // A sentence or two isn't worth a panel; the sources are already listed beside the story.
  $('#exploreDetails').hidden = words(item.explore) < MIN_EXPLORE_WORDS;
  $('#behindList').innerHTML = behind(item, dims);
  $('#exploreDetails').open = false;
  $('#behindDetails').open = false;
});
