// Checks the data files before anything is built. Any problem fails the build
// with a readable list, so a typo can't reach the live site.
import { CATALOG } from '../src/data/catalog.js';
import { SCHEDULE } from '../src/data/schedule.js';
import { TOURS } from '../src/data/tours.js';
import { COMPARISONS } from '../src/data/comparisons.js';
import { readFileSync, existsSync } from 'node:fs';

const REQUIRED = ['id', 'cat', 'org', 'title', 'caption', 'releaseDate', 'celestial', 'credit', 'source', 'story', 'understand', 'behind', 'sources'];
const CATS = new Set(['galaxy', 'nebula', 'star', 'night']);
const pct = (v) => typeof v === 'number' && v >= 0 && v <= 100;

export function validate() {
  const problems = [], ids = new Set();
  for (const c of CATALOG) {
    const at = `catalog "${c.id || c.title}"`;
    for (const k of REQUIRED) if (!c[k]) problems.push(`${at}: missing "${k}"`);
    if (ids.has(c.id)) problems.push(`${at}: duplicate id`);
    ids.add(c.id);
    if (!CATS.has(c.cat)) problems.push(`${at}: unknown category "${c.cat}"`);
    if (!/^https:\/\//.test(c.source)) problems.push(`${at}: source must be an https link`);
    if (!(c.img?.pubW && c.img?.pubH && c.img?.origW && c.img?.origH)) problems.push(`${at}: image dimensions missing`);
    for (const l of c.labels || []) if (!pct(l.x) || !pct(l.y) || !l.text) problems.push(`${at}: bad label ${JSON.stringify(l)}`);
  }
  // Larger collection: an index plus one record per photo.
  const dir = new URL('../src/data/collection/', import.meta.url);
  let collection = 0;
  if (existsSync(new URL('index.json', dir))) {
    for (const e of JSON.parse(readFileSync(new URL('index.json', dir), 'utf8'))) {
      const at = `collection "${e.id}"`;
      if (ids.has(e.id)) { problems.push(`${at}: duplicate id`); continue; }
      if (!CATS.has(e.cat)) problems.push(`${at}: unknown category`);
      const file = new URL(`photos/${e.id}.json`, dir);
      if (!existsSync(file)) { problems.push(`${at}: record file missing`); continue; }
      const c = JSON.parse(readFileSync(file, 'utf8'));
      for (const k of REQUIRED) if (!c[k]) problems.push(`${at}: missing "${k}"`);
      if (!/^https:\/\//.test(c.source || '')) problems.push(`${at}: source must be an https link`);
      if (!(c.img?.pub && c.img?.pubW && c.img?.pubH)) problems.push(`${at}: image fields missing`);
      const words = (c.story || []).join(' ').split(/\s+/).filter(Boolean).length;
      if (words < 110 || words > 190) problems.push(`${at}: story is ${words} words`);
      ids.add(e.id); collection++;
    }
  }
  for (const [cat, list] of Object.entries(SCHEDULE.order)) {
    if (!SCHEDULE.categoryOrder.includes(cat)) problems.push(`schedule: "${cat}" is not in categoryOrder`);
    for (const id of list) if (!ids.has(id)) problems.push(`schedule ${cat}: unknown id "${id}"`);
  }
  for (const [id, stops] of Object.entries(TOURS)) {
    if (!ids.has(id)) problems.push(`tours: unknown id "${id}"`);
    stops.forEach((s, i) => {
      if (!pct(s.x) || !pct(s.y)) problems.push(`tours ${id} stop ${i + 1}: x/y must be 0–100`);
      if (!(s.zoom >= 1 && s.zoom <= 6)) problems.push(`tours ${id} stop ${i + 1}: zoom must be 1–6`);
      if (!s.title || !s.text) problems.push(`tours ${id} stop ${i + 1}: needs a title and text`);
    });
  }
  for (const [id, c] of Object.entries(COMPARISONS)) {
    if (!ids.has(id)) problems.push(`comparisons: unknown id "${id}"`);
    if (!(c.w && c.h && c.source)) problems.push(`comparisons ${id}: needs w, h and source`);
    for (const side of ['left', 'right']) {
      const s = c[side];
      if (!(s?.label && s.img && s.credit)) problems.push(`comparisons ${id}.${side}: needs label, img and credit`);
    }
  }
  if (problems.length) throw new Error('Data problems:\n  - ' + problems.join('\n  - '));
  return { photos: CATALOG.length + collection, tours: Object.keys(TOURS).length, comparisons: Object.keys(COMPARISONS).length };
}

if (import.meta.url === `file://${process.argv[1]}`) console.log('data ok', validate());
