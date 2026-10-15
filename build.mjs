// Builds dist/ from src/: validates the data, inlines HTML partials and CSS
// imports, and copies the JS modules and data files as they are. No dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { validate } from './scripts/validate-data.mjs';

const SRC = 'src', OUT = 'dist';
const read = (p) => readFileSync(join(SRC, p), 'utf8');

function write(p, text) {
  mkdirSync(dirname(join(OUT, p)), { recursive: true });
  writeFileSync(join(OUT, p), text);
}

const counts = validate();
rmSync(OUT, { recursive: true, force: true });

// A partial must close every container it opens, so no partial can leak markup into the next.
function partial(p) {
  const text = read(p);
  for (const tag of ['div', 'section', 'details', 'aside', 'dialog', 'header', 'footer', 'nav', 'main', 'ul', 'dl', 'table']) {
    const open = (text.match(new RegExp(`<${tag}\\b`, 'g')) || []).length;
    const close = (text.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open !== close) throw new Error(`${p}: ${open} <${tag}> opened, ${close} closed`);
  }
  return text;
}

const html = read('index.html').replace(/<!-- @include (\S+) -->\n?/g, (_, p) => partial(p));
if (/@include/.test(html)) throw new Error('unresolved include in index.html');
write('index.html', html);

const css = read('css/main.css').replace(/@import "([^"]+)";\n?/g, (_, p) => read(join('css', p)) + '\n');
write('css/site.css', css.replace(/^\/\* Import list[^\n]*\n/, ''));

cpSync(join(SRC, 'js'), join(OUT, 'js'), { recursive: true });
cpSync(join(SRC, 'data'), join(OUT, 'data'), { recursive: true });
cpSync(join(SRC, 'email'), join(OUT, 'email'), { recursive: true });   // images used by the emails

// Self-hosted images: when IMAGE_HOST is set (e.g. https://images.amomentinthecosmos.com) and
// tools/images/manifest.json lists what has been copied there, point those photographs at the copies.
// Anything not yet copied keeps loading from its observatory.
const HOST = (process.env.IMAGE_HOST || '').replace(/\/$/, '');
let mirrored = 0;
if (HOST && existsSync('tools/images/manifest.json')) {
  const have = JSON.parse(readFileSync('tools/images/manifest.json', 'utf8'));
  const url = (id, v) => `${HOST}/${id}/${v}.jpg`;
  const dir = join(OUT, 'data/collection/photos');
  for (const f of readdirSync(dir)) {
    const p = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const vs = (have[p.id] || []).filter((v) => p.img?.[v]);
    if (!vs.length) continue;
    for (const v of vs) p.img[v] = url(p.id, v);
    writeFileSync(join(dir, f), JSON.stringify(p));
    mirrored++;
  }
  const indexFile = join(OUT, 'data/collection/index.json');
  const index = JSON.parse(readFileSync(indexFile, 'utf8'));
  for (const e of index) if (have[e.id]?.includes('thumb')) e.thumb = url(e.id, 'thumb');
  writeFileSync(indexFile, JSON.stringify(index));
  write('data/mirror.js', `// Written by build.mjs\nexport const IMAGE_HOST = ${JSON.stringify(HOST)};\nexport const MIRRORED = ${JSON.stringify(have)};\n`);
}
// Vercel Web Analytics (npm i @vercel/analytics): its browser build is self-contained, so it's copied as is.
cpSync('node_modules/@vercel/analytics/dist/index.mjs', join(OUT, 'js/vendor/vercel-analytics.js'));

console.log(`built ${OUT}/ — ${counts.photos} photographs, ${counts.tours} tours, ${counts.comparisons} comparisons${HOST ? ` · ${mirrored} served from ${HOST}` : ''}`);
