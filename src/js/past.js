// The Archive page: every photograph the site has shown, day by day, from launch to today.
// Oldest first by default (the order they appeared); a toggle shows the newest first. Opening one shows it
// on the home page in its place in the archive, so Previous and Next carry on from there.
import { $, $$, esc, store, todayIndex, dailyIds, dateOf, fmtDate } from './util.js';
import { INDEX_BY_ID } from './collection.js';
import { show } from './feature.js';
import { tile, scrollToFeature } from './tiles.js';
import { currentView } from './router.js';

const KEY = 'archiveOrder';
let order = store.get(KEY, 'old') === 'new' ? 'new' : 'old';
let drawnFor = null;

function day(d, today) {
  const ids = dailyIds(d);
  const li = document.createElement('li');
  li.className = 'past-day';
  const label = d === today ? 'Today' : fmtDate(dateOf(d));
  li.innerHTML = `<h3 class="past-date"><span class="past-no">No. ${(d + 1).toLocaleString('en')}</span> ${esc(label)}</h3><div class="grid small past-grid"></div>`;
  const grid = li.querySelector('.past-grid');
  ids.forEach((id, slot) => {
    const e = INDEX_BY_ID[id];
    if (!e) return;
    grid.appendChild(tile({
      id, title: e.title, cat: e.cat, thumb: e.thumb, sub: e.y,
      onOpen: () => { show(id, { mode: d === today ? 'daily' : 'archive', day: d, slot }); scrollToFeature(); }
    }));
  });
  return li;
}

export function renderPast() {
  const today = todayIndex(), key = `${today}:${order}`;
  if (drawnFor === key) return;
  drawnFor = key;
  const list = $('#pastList');
  list.innerHTML = '';
  const days = Array.from({ length: today + 1 }, (_, i) => i);
  if (order === 'new') days.reverse();
  const frag = document.createDocumentFragment();
  for (const d of days) frag.appendChild(day(d, today));
  list.appendChild(frag);
  $$('.past-order button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.order === order)));
}

$$('.past-order button').forEach((b) => b.addEventListener('click', () => {
  order = b.dataset.order;
  store.set(KEY, order);
  renderPast();
}));
// Drawn the first time the page is opened (it holds a tile for every day), and kept up to date at midnight.
document.addEventListener('view:change', ({ detail }) => { if (detail === 'archive') renderPast(); });
// Called once the collection index has loaded (an earlier draw may have had only part of it).
export function initPast() { drawnFor = null; if (currentView() === 'archive') renderPast(); }
document.addEventListener('day:change', () => { if (drawnFor) { drawnFor = null; renderPast(); } });
