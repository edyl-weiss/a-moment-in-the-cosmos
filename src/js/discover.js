// Random discovery by category, Surprise Me, Back to Today and Previous image.
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
// Previous: on a daily photograph (today or an archive day) it steps one day back each time.
// On anything else (a random pick, a search result, a shared link) it returns to the photograph
// viewed before it, or to yesterday when there is none.
const onDay = () => Number.isInteger(state.ctx?.day);
function prevDay() {
  const d = onDay() ? state.ctx.day : todayIndex();
  return d > 0 ? d - 1 : null;
}
$('#prevBtn').addEventListener('click', () => {
  if (!onDay() && state.history.length) back();
  else {
    const d = prevDay();
    if (d === null) return;
    show(dailyId(d), { mode: 'archive', day: d });
  }
  scrollToFeature();
});
// Next: one day forward through the daily archive, up to today's photograph.
function nextDay() {
  if (!onDay()) return null;
  const d = state.ctx.day + 1;
  return d <= todayIndex() ? d : null;
}
$('#nextBtn').addEventListener('click', () => {
  const d = nextDay();
  if (d === null) return;
  show(dailyId(d), d === todayIndex() ? { mode: 'daily', day: d } : { mode: 'archive', day: d });
  scrollToFeature();
});
const syncPrev = (busy = false) => {
  $('#nextBtn').hidden = onDay() && state.ctx.day >= todayIndex() - 1; $('#nextBtn').disabled = busy || nextDay() === null; $('#prevBtn').disabled = busy || (prevDay() === null && (onDay() || !state.history.length)); };
document.addEventListener('photo:change', () => syncPrev());

document.addEventListener('photo:busy', ({ detail: busy }) => {
  $$('[data-random], #backToday').forEach((x) => { x.disabled = busy; });
  syncPrev(busy);
  $('#stage').setAttribute('aria-busy', String(busy));
});
