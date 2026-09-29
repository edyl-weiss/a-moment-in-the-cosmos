// Random discovery by category, Surprise Me, Back to today and Previous image.
import { $, $$, CAT, todayIndex, dailyId } from './util.js';
import { state, show, back } from './feature.js';
import { INDEX } from './collection.js';
import { scrollToFeature } from './tiles.js';

function randomIn(cat) {
  const pool = INDEX.filter((c) => c.cat === cat && !state.failed.has(c.id));
  const notCurrent = pool.filter((c) => c.id !== state.item?.id);
  const fresh = notCurrent.filter((c) => !state.recent.includes(c.id));
  const choices = fresh.length ? fresh : notCurrent.length ? notCurrent : pool;
  return choices[Math.floor(Math.random() * choices.length)]?.id;
}

export function showToday() {
  const d = todayIndex();
  return show(dailyId(d), { mode: 'daily', day: d });
}

$$('[data-random]').forEach((b) => b.addEventListener('click', () => {
  const cats = Object.keys(CAT);
  const cat = b.dataset.random === 'surprise' ? cats[Math.floor(Math.random() * cats.length)] : b.dataset.random;
  const id = randomIn(cat);
  if (id) { show(id, { mode: 'random' }); scrollToFeature(); }
}));
// The bar sits below the story, so bring the new photograph into view.
$('#backToday').addEventListener('click', () => { showToday(); scrollToFeature(); });
$('#prevBtn').addEventListener('click', () => { back(); scrollToFeature(); });

document.addEventListener('photo:busy', ({ detail: busy }) => {
  $$('[data-random], #backToday').forEach((x) => { x.disabled = busy; });
  $('#prevBtn').disabled = busy || !state.history.length;
  $('#stage').setAttribute('aria-busy', String(busy));
});
