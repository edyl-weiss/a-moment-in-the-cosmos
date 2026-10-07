// Daily archive and collection search.
// With no search terms or filters the section lists every daily feature since launch, newest first.
// Typing a word or choosing a filter searches the whole collection instead: titles, object names,
// constellations and captions, by category, source and telescope.
import { $, $$, esc, CAT, todayIndex, dateOf, fmtDate, dailyId } from './util.js';
import { show, SOURCE } from './feature.js';
import { INDEX, INDEX_BY_ID } from './collection.js';
import { tile, scrollToFeature } from './tiles.js';

export const TELESCOPES = {
  hubble: 'Hubble', webb: 'Webb', vlt: 'Very Large Telescope', vista: 'VISTA', vst: 'VLT Survey Telescope',
  alma: 'ALMA', apex: 'APEX', wfi: 'MPG/ESO 2.2-meter', lasilla: 'La Silla (NTT, 3.6-meter)', gemini: 'Gemini',
  blanco: 'Blanco (DECam)', kittpeak: 'Kitt Peak', soar: 'SOAR', rubin: 'Rubin', camera: 'Camera (night sky)', other: 'Other'
};
const PAGE = 48;
const F = { q: '', cat: 'all', org: 'all', tel: 'all', shown: PAGE };

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '');
// "M 31", "M31" and "Messier 31" all find Messier 31.
const expand = (q) => norm(q).replace(/\bmessier\s*(\d+)/g, 'm$1').replace(/\bm\s+(\d+)\b/g, 'm$1').replace(/\b(ngc|ic)\s+(\d+)/g, '$1$2');
const haystack = (e) => e._h || (e._h = expand(`${e.title} ${e.q || ''}`));

const searching = () => F.q.trim() || F.cat !== 'all' || F.org !== 'all' || F.tel !== 'all';

export function matches(e, q = F.q) {
  if (F.cat !== 'all' && e.cat !== F.cat) return false;
  if (F.org !== 'all' && e.org !== F.org) return false;
  if (F.tel !== 'all' && !(e.tel || []).includes(F.tel)) return false;
  const words = expand(q).split(/\s+/).filter(Boolean);
  const h = haystack(e);
  return words.every((w) => h.includes(w));
}

// How many photographs a search for `q` alone (no filters) would return. Used by "On this day".
export const countFor = (q) => {
  const words = expand(q).split(/\s+/).filter(Boolean);
  return words.length ? INDEX.filter((e) => words.every((w) => haystack(e).includes(w))).length : 0;
};

function renderDaily(grid) {
  const today = todayIndex();
  $('#archiveNote').textContent = `Every day’s photograph since the site launched on ${fmtDate(dateOf(0))}. ` +
    'Search to browse the whole collection.';
  for (let i = today; i >= 0; i--) {
    const it = INDEX_BY_ID[dailyId(i)];
    if (!it) continue;
    grid.appendChild(tile({
      id: it.id, title: it.title, cat: it.cat, thumb: it.thumb,
      sub: i === today ? 'Today' : fmtDate(dateOf(i)),
      onOpen: () => { show(it.id, { mode: i === today ? 'daily' : 'archive', day: i }); scrollToFeature(); }
    }));
  }
}

function renderResults(grid) {
  const hits = INDEX.filter((e) => matches(e));
  $('#archiveHead').textContent = 'Search the collection';
  $('#archiveNote').textContent = hits.length
    ? `${hits.length.toLocaleString('en')} photograph${hits.length === 1 ? '' : 's'} match.`
    : 'No matches. Try fewer words, or clear a filter.';
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
  if (searching()) renderResults(grid);
  else { $('#archiveHead').textContent = 'Daily archive'; renderDaily(grid); }
}

// Used by "On this day": fill the search box, run it and bring the results into view.
export function searchFor(q) {
  Object.assign(F, { q, cat: 'all', org: 'all', tel: 'all', shown: PAGE });
  syncControls();
  renderArchive();
  location.hash = 'archive';   // opens the Archive page
}

function syncControls() {
  $('#archiveQ').value = F.q;
  $('#archiveCat').value = F.cat;
  $('#archiveOrg').value = F.org;
  $('#archiveTel').value = F.tel;
}

export function initArchiveSearch() {
  const present = new Set(INDEX.flatMap((e) => e.tel || []));
  $('#archiveTel').innerHTML = '<option value="all">Any telescope</option>' +
    Object.entries(TELESCOPES).filter(([k]) => present.has(k)).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  const orgs = new Set(INDEX.map((e) => e.org));
  $('#archiveOrg').innerHTML = '<option value="all">Any source</option>' +
    Object.entries(SOURCE).filter(([k]) => orgs.has(k)).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
  $('#archiveCat').innerHTML = '<option value="all">Any category</option>' +
    Object.entries(CAT).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');

  let t;
  $('#archiveQ').addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => { F.q = e.target.value; F.shown = PAGE; renderArchive(); }, 180);
  });
  $('#archiveForm').addEventListener('submit', (e) => { e.preventDefault(); F.q = $('#archiveQ').value; F.shown = PAGE; renderArchive(); });
  for (const [sel, key] of [['#archiveCat', 'cat'], ['#archiveOrg', 'org'], ['#archiveTel', 'tel']]) {
    $(sel).addEventListener('change', (e) => { F[key] = e.target.value; F.shown = PAGE; renderArchive(); });
  }
  $('#archiveMore').addEventListener('click', () => { F.shown += PAGE; renderArchive(); });
  $('#archiveClear').addEventListener('click', () => { Object.assign(F, { q: '', cat: 'all', org: 'all', tel: 'all', shown: PAGE }); syncControls(); renderArchive(); });
}

