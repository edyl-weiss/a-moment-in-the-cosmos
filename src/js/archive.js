// Collection search, at the top of the home page under "Travel to another random".
// Typing a word or choosing a filter searches the whole collection: titles, object names, constellations
// and captions, by category, source and telescope. Nicknames work too ("seven sisters", "big dipper").
// With nothing typed and no filters, the results area stays closed.
import { $, esc, CAT } from './util.js';
import { show, SOURCE } from './feature.js';
import { INDEX, INDEX_BY_ID } from './collection.js';
import { tile, scrollToFeature } from './tiles.js';
import { CON_NAMES, onConstellationClick } from './skymap.js';
import { aliasMatch } from './skysearch.js';

export const TELESCOPES = {
  hubble: 'Hubble', webb: 'Webb', vlt: 'Very Large Telescope', vista: 'VISTA', vst: 'VLT Survey Telescope',
  alma: 'ALMA', apex: 'APEX', wfi: 'MPG/ESO 2.2-meter', lasilla: 'La Silla (NTT, 3.6-meter)', gemini: 'Gemini',
  blanco: 'Blanco (DECam)', kittpeak: 'Kitt Peak', soar: 'SOAR', rubin: 'Rubin', camera: 'Camera (night sky)', other: 'Other'
};
const PAGE = 48;
const BLANK = { q: '', cat: 'all', org: 'all', tel: 'all', con: 'all' };
const F = { ...BLANK, shown: PAGE };

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '');
// "M 31", "M31" and "Messier 31" all find Messier 31.
const expand = (q) => norm(q).replace(/\bmessier\s*(\d+)/g, 'm$1').replace(/\bm\s+(\d+)\b/g, 'm$1').replace(/\b(ngc|ic)\s+(\d+)/g, '$1$2');
const haystack = (e) => e._h || (e._h = expand(`${e.title} ${e.q || ''}`));

const searching = () => F.q.trim() || F.cat !== 'all' || F.org !== 'all' || F.tel !== 'all' || F.con !== 'all';

export function matches(e, q = F.q) {
  if (F.cat !== 'all' && e.cat !== F.cat) return false;
  if (F.org !== 'all' && e.org !== F.org) return false;
  if (F.tel !== 'all' && !(e.tel || []).includes(F.tel)) return false;
  if (F.con !== 'all' && e.con !== F.con) return false;
  const words = expand(q).split(/\s+/).filter(Boolean);
  const h = haystack(e);
  if (words.every((w) => h.includes(w))) return true;
  const alias = aliasFor(q);
  return alias ? alias(e) : false;
}
let aliasQ = null, aliasFn = null;
const aliasFor = (q) => (q === aliasQ ? aliasFn : (aliasFn = aliasMatch((aliasQ = q))));

// How many photographs a search for `q` alone (no filters) would return. Used by "On this day".
export const countFor = (q) => {
  const words = expand(q).split(/\s+/).filter(Boolean);
  return words.length ? INDEX.filter((e) => words.every((w) => haystack(e).includes(w))).length : 0;
};

function renderResults(grid) {
  const hits = INDEX.filter((e) => matches(e));
  const only = F.con !== 'all' && !F.q.trim() && F.cat === 'all' && F.org === 'all' && F.tel === 'all';
  const n = `${hits.length.toLocaleString('en')} photograph${hits.length === 1 ? '' : 's'}`;
  $('#archiveNote').textContent = !hits.length ? 'No matches. Try fewer words, or clear a filter'
    : only ? `${n} in ${CON_NAMES[F.con] || 'this constellation'}` : `${n} ${hits.length === 1 ? 'matches' : 'match'}`;
  for (const it of hits.slice(0, F.shown)) {
    grid.appendChild(tile({
      id: it.id, title: it.title, cat: it.cat, thumb: it.thumb,
      sub: [it.y, SOURCE[it.org]].filter(Boolean).join(' · '),
      onOpen: () => { show(it.id, { mode: 'search' }); scrollToFeature(); }
    }));
  }
  const more = $('#archiveMore');
  more.hidden = hits.length <= F.shown;
  more.textContent = `Show more (${(hits.length - F.shown).toLocaleString('en')} left)`;
}

export function renderArchive() {
  const grid = $('#archiveGrid');
  grid.innerHTML = '';
  $('#archiveMore').hidden = true;
  $('#archiveClear').hidden = !searching();
  $('#archiveResults').hidden = !searching();
  const filters = ['cat', 'org', 'tel', 'con'].filter((k) => F[k] !== 'all').length;
  $('#archiveFilterCount').hidden = !filters;
  $('#archiveFilterCount').textContent = filters;
  if (searching()) renderResults(grid);
}

// Used by "On this day": fill the search box, run it and bring the results into view.
export function searchFor(q) {
  Object.assign(F, BLANK, { q, shown: PAGE });
  syncControls();
  renderArchive();
  location.hash = 'archive';   // goes to the search, at the top of the home page
}

// Constellation collections: everything the collection holds in one constellation.
export function browseConstellation(con) {
  Object.assign(F, BLANK, { con, shown: PAGE });
  syncControls();
  openFilters(con !== 'all');
  renderArchive();
  if (location.hash === '#archive') document.getElementById('archive').scrollIntoView({ behavior: 'smooth' });
  else location.hash = 'archive';
}

function syncControls() {
  $('#archiveQ').value = F.q;
  $('#archiveCat').value = F.cat;
  $('#archiveOrg').value = F.org;
  $('#archiveTel').value = F.tel;
  $('#archiveCon').value = F.con;
}
function openFilters(open) {
  $('#archiveFilters').hidden = !open;
  $('#archiveFiltersBtn').setAttribute('aria-expanded', String(open));
}

export function initArchiveSearch() {
  onConstellationClick(browseConstellation);
  const present = new Set(INDEX.flatMap((e) => e.tel || []));
  $('#archiveTel').innerHTML = '<option value="all">Any telescope</option>' +
    Object.entries(TELESCOPES).filter(([k]) => present.has(k)).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  const orgs = new Set(INDEX.map((e) => e.org));
  $('#archiveOrg').innerHTML = '<option value="all">Any source</option>' +
    Object.entries(SOURCE).filter(([k]) => orgs.has(k)).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  $('#archiveCat').innerHTML = '<option value="all">Any category</option>' +
    Object.entries(CAT).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');

  // Constellations: a menu of all of them, with how many photographs each holds.
  const count = {};
  for (const e of INDEX) if (e.con) count[e.con] = (count[e.con] || 0) + 1;
  const byName = Object.keys(count).sort((a, b) => CON_NAMES[a].localeCompare(CON_NAMES[b]));
  $('#archiveCon').innerHTML = '<option value="all">Any constellation</option>' +
    byName.map((k) => `<option value="${k}">${esc(CON_NAMES[k])} (${count[k]})</option>`).join('');
  $('#archiveFiltersBtn').addEventListener('click', () => openFilters($('#archiveFilters').hidden));

  let t;
  $('#archiveQ').addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => { F.q = e.target.value; F.shown = PAGE; renderArchive(); }, 180);
  });
  $('#archiveForm').addEventListener('submit', (e) => { e.preventDefault(); F.q = $('#archiveQ').value; F.shown = PAGE; renderArchive(); });
  for (const [sel, key] of [['#archiveCat', 'cat'], ['#archiveOrg', 'org'], ['#archiveTel', 'tel'], ['#archiveCon', 'con']]) {
    $(sel).addEventListener('change', (e) => { F[key] = e.target.value; F.shown = PAGE; renderArchive(); });
  }
  $('#archiveMore').addEventListener('click', () => { F.shown += PAGE; renderArchive(); });
  $('#archiveClear').addEventListener('click', () => { Object.assign(F, BLANK, { shown: PAGE }); syncControls(); openFilters(false); renderArchive(); $('#archiveQ').focus(); });
}

