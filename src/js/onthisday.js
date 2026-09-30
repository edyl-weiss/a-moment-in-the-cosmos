// "On this day": researched astronomy events for a calendar date, and the photographs the sources
// published on that date in any year. Data: data/onthisday.json, keyed "MM-DD" (built by the exporter).
import { $, esc, say } from './util.js';
import { show } from './feature.js';
import { INDEX_BY_ID } from './collection.js';
import { tile, scrollToFeature } from './tiles.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];            // 29 February is a real day here
const ORG = { hubble: 'ESA/Hubble', webb: 'ESA/Webb', eso: 'ESO', noirlab: 'NSF NOIRLab' };
const RELATION = { object: 'shows this object', telescope: 'taken with this telescope', site: 'taken at this site' };

let DAYS = null, month = 0, day = 1;
const key = (m, d) => `${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const label = (m, d) => `${d} ${MONTHS[m]}`;
const year = (y) => (y < 0 ? `${-y} BC` : String(y));

function open(id, m, d) {
  show(id, { mode: 'onthisday', label: label(m, d) });
  scrollToFeature();
}

function eventHtml(e, i) {
  const photos = e.photos.filter(([id]) => INDEX_BY_ID[id]);
  const links = photos.length
    ? `<p class="ev-photos">${photos.map(([id, rel], j) =>
        `<button type="button" data-ev="${i}" data-photo="${j}">${esc(INDEX_BY_ID[id].title)}</button> <span class="rel">(${RELATION[rel]})</span>`).join('<br>')}</p>`
    : '';
  return `<li><span class="yr">${year(e.year)}</span><div><p>${esc(e.text)}</p>` +
    `<p class="ev-src"><a href="${esc(e.source[1])}" target="_blank" rel="noopener">${esc(e.source[0])}</a></p>${links}</div></li>`;
}

function render() {
  const k = key(month, day), entry = DAYS[k] || { events: [], published: [] };
  $('#otdMonth').value = String(month);
  fillDays();
  $('#otdDay').value = String(day);
  $('#otdDateText').textContent = label(month, day);

  const events = $('#otdEvents');
  events.innerHTML = entry.events.length
    ? entry.events.map(eventHtml).join('')
    : `<li class="none"><p class="empty">No event for ${esc(label(month, day))} could be confirmed against a source, so none is shown.</p></li>`;
  events.querySelectorAll('button[data-ev]').forEach((b) => b.addEventListener('click', () => {
    const [id] = entry.events[b.dataset.ev].photos.filter(([x]) => INDEX_BY_ID[x])[b.dataset.photo];
    open(id, month, day);
  }));

  const grid = $('#otdPublished');
  grid.innerHTML = '';
  const pub = entry.published.filter(([, id]) => INDEX_BY_ID[id]);
  $('#otdPubHead').textContent = `Published on ${label(month, day)}`;
  for (const [y, id] of pub) {
    const it = INDEX_BY_ID[id];
    grid.appendChild(tile({ id, title: it.title, cat: it.cat, thumb: it.thumb, sub: `${y} · ${ORG[it.org]}`, onOpen: () => open(id, month, day) }));
  }
  $('#otdPubHead').hidden = grid.hidden = !pub.length;   // on a date with none, the note below says so
  renderNear(pub.length);
}

// Few photographs were ever published on some dates (26 December, for one). Rather than leave the
// panel thin, show the nearest days' photographs, each labelled with its real publication date.
const MIN_SHOWN = 3;
const ALL_DAYS = MONTHS.flatMap((_, m) => Array.from({ length: LENGTH[m] }, (_, d) => [m, d + 1]));

function renderNear(have) {
  const block = $('#otdNearBlock'), grid = $('#otdNear');
  grid.innerHTML = '';
  block.hidden = have >= MIN_SHOWN;
  if (block.hidden) return;
  const here = ALL_DAYS.findIndex(([m, d]) => m === month && d === day), n = ALL_DAYS.length;
  const picks = [];
  for (let step = 1; step <= n / 2 && have + picks.length < MIN_SHOWN; step++) {
    for (const i of [here - step, here + step]) {            // the day before, then the day after
      const [m, d] = ALL_DAYS[(i + n) % n];
      for (const [y, id] of (DAYS[key(m, d)]?.published || [])) if (INDEX_BY_ID[id]) picks.push([m, d, y, id]);
    }
  }
  $('#otdNearNote').textContent = have
    ? `Only ${have === 1 ? 'one photograph in the collection was' : `${have} photographs in the collection were`} published on ${label(month, day)}, so photographs from the nearest dates follow.`
    : `No photograph in the collection was published on ${label(month, day)}, so these come from the nearest dates.`;
  for (const [m, d, y, id] of picks) {
    const it = INDEX_BY_ID[id];
    grid.appendChild(tile({ id, title: it.title, cat: it.cat, thumb: it.thumb, sub: `${label(m, d)} ${y} · ${ORG[it.org]}`, onOpen: () => open(id, m, d) }));
  }
}

function fillDays() {
  const sel = $('#otdDay'), n = LENGTH[month];
  if (sel.options.length === n) return;
  sel.innerHTML = Array.from({ length: n }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
  day = Math.min(day, n);
}

function go(m, d) {
  month = m; day = d;
  render();
  say(`On this day: ${label(month, day)}`);
}

function step(delta) {
  let m = month, d = day + delta;
  if (d < 1) { m = (m + 11) % 12; d = LENGTH[m]; }
  if (d > LENGTH[m]) { m = (m + 1) % 12; d = 1; }
  go(m, d);
}

const today = () => { const t = new Date(); return [t.getMonth(), t.getDate()]; };   // the visitor's own calendar date

export async function initOnThisDay() {
  $('#otdMonth').innerHTML = MONTHS.map((n, i) => `<option value="${i}">${n}</option>`).join('');
  try {
    const r = await fetch('data/onthisday.json');
    if (!r.ok) throw new Error(r.status);
    DAYS = await r.json();
  } catch (err) {
    console.warn('[cosmos] on-this-day data unavailable', err);
    $('#onthisday').hidden = true;
    return;
  }
  [month, day] = today();
  render();
  $('#otdMonth').addEventListener('change', (e) => go(Number(e.target.value), Math.min(day, LENGTH[Number(e.target.value)])));
  $('#otdDay').addEventListener('change', (e) => go(month, Number(e.target.value)));
  $('#otdPrev').addEventListener('click', () => step(-1));
  $('#otdNext').addEventListener('click', () => step(1));
  $('#otdToday').addEventListener('click', () => go(...today()));
}
