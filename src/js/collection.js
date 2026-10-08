// The photo collection: the 16 hand-curated records in data/catalog.js plus the larger
// collection in data/collection/ (a small index loaded at start, one JSON file per photo
// fetched only when that photo is shown).
import { CATALOG_SKY } from '../data/constellations.js';
import { CATALOG } from '../data/catalog.js';

const CURATED = Object.fromEntries(CATALOG.map((c) => [c.id, c]));
const cache = new Map();
// Telescope families for the archive filter. The exporter applies the same rules to the
// collection (tools/harvest/export_collection.py, TEL); these cover the curated photographs.
const TEL = [['webb', /webb|jwst|nircam|miri/i], ['hubble', /hubble|wfc3|acs\b|wfpc/i], ['vista', /vista/i],
  ['vst', /\bvst\b|survey telescope|omegacam/i], ['vlt', /very large telescope|\bvlt\b|fors|muse|hawk-i|sphere|naco|isaac|kmos|vimos|uves/i],
  ['alma', /alma/i], ['apex', /apex/i], ['wfi', /2\.2-met(?:re|er)|wide field imager|\bwfi\b/i], ['camera', /^camera/i]];
export const telescopes = (text) => { const t = TEL.filter(([, re]) => re.test(text)).map(([k]) => k); return t.length ? t : ['other']; };
const entry = (c) => ({
  id: c.id, cat: c.cat, org: c.org, title: c.title, thumb: c.img.thumb,
  y: (c.releaseDate.match(/\d{4}/) || [])[0],
  q: `${c.celestial} ${c.caption}`,
  tel: c.cat === 'night' ? ['camera'] : telescopes(`${c.behind.observatory} ${c.behind.instrument}`),
  con: CATALOG_SKY[c.id]?.con
});

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
