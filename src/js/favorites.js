// Favorites: ids plus light metadata in localStorage, never image data.
import { $, store, say } from './util.js';
import { state, show } from './feature.js';
import { tile, scrollToFeature } from './tiles.js';

const KEY = 'amitc.favorites.v1';
const all = () => store.get(KEY, []);
const has = (id) => all().some((f) => f.id === id);

function syncButton() {
  const on = Boolean(state.item && has(state.item.id));
  $('#favBtn').setAttribute('aria-pressed', String(on));
  $('#favText').textContent = on ? 'Saved to favorites' : 'Save to favorites';
}

function remove(f) {
  store.set(KEY, all().filter((x) => x.id !== f.id));
  renderGrid();
  syncButton();
  say(`Removed ${f.title} from favorites`);
}

export function renderGrid() {
  const grid = $('#favGrid');
  grid.innerHTML = '';
  if (!store.ok) {
    grid.innerHTML = '<p class="empty">This browser isn’t letting the site store anything (private mode can do this), so favorites won’t stick.</p>';
    return;
  }
  const list = all();
  if (!list.length) {
    grid.innerHTML = '<p class="empty-state">Nothing saved yet. Hit “Save to favorites” under any photograph and it’ll turn up here.</p>';
    return;
  }
  for (const f of list) {
    const saved = new Date(f.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    grid.appendChild(tile({
      ...f, sub: 'saved ' + saved,
      onOpen: () => { show(f.id, { mode: 'favorite' }); scrollToFeature(); },
      onRemove: () => remove(f)
    }));
  }
}

$('#favBtn').addEventListener('click', () => {
  const it = state.item;
  if (!it) return;
  if (!store.ok) { say('Your browser is blocking local storage, so favorites can’t be saved here.'); return; }
  if (has(it.id)) {
    store.set(KEY, all().filter((f) => f.id !== it.id));
    say(`Removed ${it.title} from favorites`);
  } else {
    store.set(KEY, [{ id: it.id, title: it.title, cat: it.cat, thumb: it.img.thumb, savedAt: new Date().toISOString() }, ...all()]);
    say(`Saved ${it.title} to favorites`);
  }
  syncButton();
  renderGrid();
});

document.addEventListener('photo:change', syncButton);
window.addEventListener('storage', (e) => { if (e.key === KEY) { renderGrid(); syncButton(); } });
