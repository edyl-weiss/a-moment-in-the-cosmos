// Checks the data files before anything is built. Any problem fails the build
// with a readable list, so a typo can't reach the live site.
import { CATALOG } from '../src/data/catalog.js';
import { SCHEDULE } from '../src/data/schedule.js';
import { TOURS } from '../src/data/tours.js';
import { COMPARISONS } from '../src/data/comparisons.js';
import { readFileSync, existsSync } from 'node:fs';
// same rule as src/js/util.js meetsMinimum (the browser re-checks every image it loads)
const meetsMinimum = (w, h) => { const l = Math.max(w, h), s = Math.min(w, h); return l / s <= 1.05 ? s >= 1440 : l >= 1920 && s >= 1080; };

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
      else if (!meetsMinimum(c.img.pubW, c.img.pubH)) problems.push(`${at}: ${c.img.pubW} × ${c.img.pubH} is below the display minimum`);
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
  // On this day: every key is a real calendar date, every photo exists, every event cites a source.
  const OTD = JSON.parse(readFileSync(new URL('../src/data/onthisday.json', import.meta.url), 'utf8'));
  const LEN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (const [k, d] of Object.entries(OTD)) {
    const [m, day] = k.split('-').map(Number);
    if (!(m >= 1 && m <= 12 && day >= 1 && day <= LEN[m - 1])) problems.push(`onthisday: bad date key "${k}"`);
    for (const [, id] of d.published) if (!ids.has(id)) problems.push(`onthisday ${k}: unknown photo "${id}"`);
    for (const e of d.events) {
      if (!Number.isInteger(e.year) || !e.text || !/^https:\/\//.test(e.source?.[1] || '')) problems.push(`onthisday ${k}: event needs year, text and https source`);
      for (const [id, rel] of e.photos) if (!ids.has(id) || !['object', 'telescope', 'site'].includes(rel)) problems.push(`onthisday ${k}: bad event photo "${id}" (${rel})`);
    }
  }
  if (problems.length) throw new Error('Data problems:\n  - ' + problems.join('\n  - '));
  return { photos: CATALOG.length + collection, tours: Object.keys(TOURS).length, comparisons: Object.keys(COMPARISONS).length };
}

if (import.meta.url === `file://${process.argv[1]}`) console.log('data ok', validate());
