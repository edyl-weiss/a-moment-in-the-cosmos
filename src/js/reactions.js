// "Wow" reactions and the "Most loved this week" row. Both talk to /api/react; if that isn't
// available (local preview, storage not connected) they stay hidden and nothing else changes.
import { $, say, store } from './util.js';
import { state, show } from './feature.js';
import { INDEX_BY_ID } from './collection.js';
import { tile, scrollToFeature } from './tiles.js';

const MINE = 'wowed';
const btn = $('#wowBtn'), num = $('#wowCount');
let live = true, asked = null;

const mine = () => store.get(MINE, []);
const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

function paint(id, count) {
  if (state.item?.id !== id) return;
  const done = mine().includes(id);
  btn.setAttribute('aria-pressed', String(done));
  btn.title = done ? 'You said wow' : 'Say wow';
  num.textContent = count > 0 ? fmt(count) : '';
  btn.setAttribute('aria-label', `${done ? 'You said wow' : 'Say wow'}${count ? `, ${count} so far` : ''}`);
  btn.hidden = false;
}

async function api(path, opts) {
  const r = await fetch(path, opts);
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

document.addEventListener('photo:change', async ({ detail: { item } }) => {
  if (!live) return;
  const id = item.id; asked = id;
  paint(id, 0);
  try { const { count } = await api(`/api/react?id=${encodeURIComponent(id)}`); if (asked === id) paint(id, count); }
  catch { live = false; btn.hidden = true; }
});

btn.addEventListener('click', async () => {
  const id = state.item?.id;
  if (!id || mine().includes(id)) return;
  store.set(MINE, [...mine(), id].slice(-500));
  btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
  paint(id, (parseInt(num.textContent, 10) || 0) + 1);       // optimistic
  say('You said wow');
  try { const { count } = await api('/api/react', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); paint(id, count); }
  catch { /* keep the optimistic count; it will correct itself next visit */ }
});

// Most loved this week: shown once at least three photographs have reactions.
export async function renderLoved() {
  try {
    const { items } = await api('/api/react?top=week');
    const list = items.filter((x) => INDEX_BY_ID[x.id]).slice(0, 8);
    if (list.length < 3) return;
    const grid = $('#lovedGrid');
    grid.innerHTML = '';
    for (const x of list) {
      const it = INDEX_BY_ID[x.id];
      grid.appendChild(tile({
        id: it.id, title: it.title, cat: it.cat, thumb: it.thumb,
        sub: `${fmt(x.count)} wow${x.count === 1 ? '' : 's'}${x.lastWeek ? ' · last week' : ''}`,
        onOpen: () => { show(it.id, { mode: 'loved' }); scrollToFeature(); }
      }));
    }
    delete $('#loved').dataset.empty;
    $('#loved').hidden = location.hash === '#about';
  } catch { /* reactions not available */ }
}
