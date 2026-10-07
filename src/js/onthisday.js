// "On this day": researched astronomy events for a calendar date, and the photographs the sources
// published on that date in any year. Data: data/onthisday.json, keyed "MM-DD" (built by the exporter).
import { $, esc, say } from './util.js';
import { show, SOURCE as ORG } from './feature.js';
import { INDEX_BY_ID } from './collection.js';
import { tile, scrollToFeature } from './tiles.js';
import { searchFor, countFor } from './archive.js';
import { onDateLink, setDateHash } from './links.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];            // 29 February is a real day here
const RELATION = { object: '', telescope: 'same telescope', site: 'same observatory' };

let DAYS = null, month = 0, day = 1;
const key = (m, d) => `${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const label = (m, d) => `${d} ${MONTHS[m]}`;
const year = (y) => (y < 0 ? `${-y} BC` : String(y));

function open(id, m, d) {
  show(id, { mode: 'onthisday', label: label(m, d) });
  scrollToFeature();
}

// The object an event is about, if the collection holds photographs of it: a catalog
// designation first (M 31, NGC 7331…), then a well-known name.
const DESIG = /\b(?:Messier|M|NGC|IC|Arp|Abell|Sh2|RCW|UGC|HH)[\s-]?\d+[A-Za-z]?\b/g;
const NAMED = /\b(?:Andromeda Galaxy|Orion Nebula|Crab Nebula|Eagle Nebula|Helix Nebula|Ring Nebula|Horsehead Nebula|Carina Nebula|Lagoon Nebula|Trifid Nebula|Tarantula Nebula|Whirlpool Galaxy|Sombrero Galaxy|Pinwheel Galaxy|Triangulum Galaxy|Large Magellanic Cloud|Small Magellanic Cloud|Omega Centauri|Pleiades|Centaurus A|Cat.s Eye Nebula|Butterfly Nebula|Rosette Nebula|Pillars of Creation|Stephan.s Quintet|Cartwheel Galaxy|Veil Nebula|Dumbbell Nebula|Eta Carinae|Supernova 1987A|SN 1987A|Cassiopeia A|Orion|Andromeda)\b/gi;
function objectOf(text) {
  for (const q of [...(text.match(DESIG) || []), ...(text.match(NAMED) || [])]) {
    const n = countFor(q);
    if (n) return [q.replace(/^Messier\s?/i, 'M'), n];
  }
  return null;
}

function eventHtml(e, i) {
  const photos = e.photos.filter(([id]) => INDEX_BY_ID[id]);
  const links = photos.length
    ? `<p class="ev-photos">${photos.map(([id, rel], j) =>
        `<button type="button" data-ev="${i}" data-photo="${j}">${esc(INDEX_BY_ID[id].title)}</button> ${RELATION[rel] ? `<span class="rel">${RELATION[rel]}</span>` : ''}`).join('<br>')}</p>`
    : '';
  const obj = objectOf(e.text);
  const find = obj ? `<p class="ev-find"><button type="button" data-find="${esc(obj[0])}">All photographs of ${esc(obj[0])}</button> <span class="rel">${obj[1]} photographs</span></p>` : '';
  return `<li><span class="yr">${year(e.year)}</span><div><p>${esc(e.text)}</p>` +
    `<p class="ev-src"><a href="${esc(e.source[1])}" target="_blank" rel="noopener">${esc(e.source[0])}</a></p>${links}${find}</div></li>`;
}

function render() {
  const k = key(month, day), entry = DAYS[k] || { events: [], published: [] };
  $('#otdMonth').value = String(month);
  fillDays();
  $('#otdDay').value = String(day);
  $('#otdDateText').textContent = label(month, day);
  $('#otdBig').textContent = label(month, day);

  const events = $('#otdEvents');
  events.innerHTML = entry.events.length
    ? entry.events.map(eventHtml).join('')
    : `<li class="none"><p class="empty">Nothing on record for ${esc(label(month, day))} yet.</p></li>`;
  events.querySelectorAll('button[data-ev]').forEach((b) => b.addEventListener('click', () => {
    const [id] = entry.events[b.dataset.ev].photos.filter(([x]) => INDEX_BY_ID[x])[b.dataset.photo];
    open(id, month, day);
  }));
  events.querySelectorAll('button[data-find]').forEach((b) => b.addEventListener('click', () => searchFor(b.dataset.find)));

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
// panel thin, show the nearest days' photographs, each labeled with its real publication date.
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
  $('#otdNearNote').textContent = `Not much was released on ${label(month, day)}, so here are a few from the days either side.`;
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

function go(m, d, { link = true } = {}) {
  month = m; day = Math.min(d, LENGTH[m]);
  render();
  if (link) setDateHash(key(month, day));
  say(`On this day: ${label(month, day)}`);
}

// "Any date": jump to a random calendar date that has at least one researched event.
function randomDate() {
  const withEvents = ALL_DAYS.filter(([m, d]) => DAYS[key(m, d)]?.events.length && !(m === month && d === day));
  const [m, d] = withEvents[Math.floor(Math.random() * withEvents.length)];
  go(m, d);
}

function step(delta) {
  let m = month, d = day + delta;
  if (d < 1) { m = (m + 11) % 12; d = LENGTH[m]; }
  if (d > LENGTH[m]) { m = (m + 1) % 12; d = 1; }
  go(m, d);
}

const today = () => { const t = new Date(); return [t.getMonth(), t.getDate()]; };   // the visitor's own calendar date

// A single line under today's photograph: one event from the visitor's own date, and a way in.
function teaser() {
  const [m, d] = today(), ev = DAYS[key(m, d)]?.events || [];
  const box = $('#otdTeaser');
  if (!ev.length) { box.hidden = true; return; }
  const e = ev.find((x) => x.photos.some(([id]) => INDEX_BY_ID[id])) || ev[0];
  let text = e.text;
  if (text.length > 150) text = text.slice(0, text.lastIndexOf(' ', 147)) + '…';
  box.innerHTML = `<span class="k">On this day in ${esc(year(e.year))}</span> ${esc(text)} ` +
    `<a href="#on-${key(m, d)}">${ev.length > 1 ? `${ev.length} moments from ${esc(label(m, d))}` : `More from ${esc(label(m, d))}`} <span aria-hidden="true">→</span></a>`;
  box.hidden = false;
}

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
  teaser();
  onDateLink((m, d) => go(m, d, { link: false }));
  $('#otdMonth').addEventListener('change', (e) => go(Number(e.target.value), Math.min(day, LENGTH[Number(e.target.value)])));
  $('#otdDay').addEventListener('change', (e) => go(month, Number(e.target.value)));
  $('#otdPrev').addEventListener('click', () => step(-1));
  $('#otdNext').addEventListener('click', () => step(1));
  $('#otdToday').addEventListener('click', () => go(...today()));
  $('#otdRandom').addEventListener('click', randomDate);
}
