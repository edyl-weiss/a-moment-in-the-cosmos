// Daily archive: every scheduled feature from launch day to today, newest first.
import { $, $$, esc, CAT, todayIndex, dateOf, fmtDate, dailyId } from './util.js';
import { show } from './feature.js';
import { INDEX_BY_ID } from './collection.js';
import { tile, scrollToFeature } from './tiles.js';

let filter = 'all';

export function renderArchive() {
  const today = todayIndex(), grid = $('#archiveGrid');
  grid.innerHTML = '';
  $('#archiveNote').textContent = `Every daily feature since this page launched on ${fmtDate(dateOf(0))}. ` +
    (today === 0 ? 'Today is the first day, so the archive will grow from here.' : `${today + 1} days recorded.`);
  for (let i = today; i >= 0; i--) {
    const it = INDEX_BY_ID[dailyId(i)];
    if (!it || (filter !== 'all' && it.cat !== filter)) continue;
    grid.appendChild(tile({
      id: it.id, title: it.title, cat: it.cat, thumb: it.thumb,
      sub: i === today ? 'Today' : fmtDate(dateOf(i)),
      onOpen: () => { show(it.id, { mode: i === today ? 'daily' : 'archive', day: i }); scrollToFeature(); }
    }));
  }
  if (!grid.children.length) grid.innerHTML = `<p class="empty">No ${esc(CAT[filter])} photographs have been featured yet.</p>`;
}

$$('[data-afilter]').forEach((b) => b.addEventListener('click', () => {
  filter = b.dataset.afilter;
  $$('[data-afilter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  renderArchive();
}));
