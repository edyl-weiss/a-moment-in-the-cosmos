// The photo collection: the 16 hand-curated records in data/catalog.js plus the larger
// collection in data/collection/ (a small index loaded at start, one JSON file per photo
// fetched only when that photo is shown).
import { CATALOG } from '../data/catalog.js';

const CURATED = Object.fromEntries(CATALOG.map((c) => [c.id, c]));
const cache = new Map();
const entry = (c) => ({ id: c.id, cat: c.cat, org: c.org, title: c.title, thumb: c.img.thumb });

export let INDEX = CATALOG.map(entry);
export let INDEX_BY_ID = Object.fromEntries(INDEX.map((e) => [e.id, e]));

export async function loadIndex() {
  try {
    const r = await fetch('data/collection/index.json');
    if (!r.ok) throw new Error(r.status);
    const more = (await r.json()).filter((e) => !CURATED[e.id]);
    INDEX = INDEX.concat(more);
    INDEX_BY_ID = Object.fromEntries(INDEX.map((e) => [e.id, e]));
  } catch (err) {
    console.warn('[cosmos] collection index unavailable; showing the curated photographs only', err);
  }
}

export async function getPhoto(id) {
  if (CURATED[id]) return CURATED[id];
  if (!cache.has(id)) {
    cache.set(id, fetch(`data/collection/photos/${encodeURIComponent(id)}.json`).then((r) => {
      if (!r.ok) throw new Error('its record could not be loaded');
      return r.json();
    }));
    cache.get(id).catch(() => cache.delete(id));
  }
  return cache.get(id);
}
