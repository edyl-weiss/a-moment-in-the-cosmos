// Random discovery by category, Surprise Me, Back to Today and Previous image.
import { $, $$, CAT, todayIndex, dailyId, stepDaily } from './util.js';
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

export function showToday(slot = 0) {
  const d = todayIndex();
  return show(dailyId(d, slot), { mode: 'daily', day: d, slot });
}
// Open one photograph from the daily lineup: today's are "daily", earlier days come from the archive.
export const showDaily = (day, slot) => show(dailyId(day, slot), { mode: day === todayIndex() ? 'daily' : 'archive', day, slot });

$$('[data-random]').forEach((b) => b.addEventListener('click', () => {
  const cats = Object.keys(CAT);
  const cat = b.dataset.random === 'surprise' ? cats[Math.floor(Math.random() * cats.length)] : b.dataset.random;
  if (b.dataset.random === 'surprise') document.dispatchEvent(new CustomEvent('seal:surprise'));
  else document.dispatchEvent(new CustomEvent('seal:warp', { detail: { cat } }));
  const id = randomIn(cat);
  if (id) { show(id, { mode: 'random' }); scrollToFeature(); }
}));
// The bar sits below the story, so bring the new photograph into view.
$('#backToday').addEventListener('click', () => { showToday(); scrollToFeature(); });
// Previous: on a daily photograph (today or an archive day) it steps back one photograph at a time,
// through each day's lineup and on into the days before. On anything else (a random pick, a search result,
// a shared link) it returns to the photograph viewed before it, or to the last one shown yesterday.
const onDay = () => Number.isInteger(state.ctx?.day);
const here = () => (onDay() ? { day: state.ctx.day, slot: state.ctx.slot || 0 } : { day: todayIndex(), slot: 0 });
const prevDay = () => stepDaily(here().day, here().slot, -1);
$('#prevBtn').addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('seal:prev'));
  if (!onDay() && state.history.length) back();
  else {
    const p = prevDay();
    if (!p) return;
    showDaily(p.day, p.slot);
  }
  scrollToFeature();
});
// Next: forward through the daily photographs, up to the last of today's.
const nextDay = () => (onDay() ? stepDaily(state.ctx.day, state.ctx.slot || 0, 1) : null);
$('#nextBtn').addEventListener('click', () => {
  const n = nextDay();
  if (!n) return;
  showDaily(n.day, n.slot);
  scrollToFeature();
});
const syncPrev = (busy = false) => {
  $('#nextBtn').hidden = !nextDay(); $('#nextBtn').disabled = busy || !nextDay(); $('#prevBtn').disabled = busy || (!prevDay() && (onDay() || !state.history.length)); };
document.addEventListener('photo:change', () => syncPrev());

document.addEventListener('photo:busy', ({ detail: busy }) => {
  $$('[data-random], #backToday').forEach((x) => { x.disabled = busy; });
  syncPrev(busy);
  $('#stage').setAttribute('aria-busy', String(busy));
});
