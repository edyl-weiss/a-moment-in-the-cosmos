// Builds dist/ from src/: validates the data, inlines HTML partials and CSS
// imports, and copies the JS modules and data files as they are. No dependencies.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
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

console.log(`built ${OUT}/ — ${counts.photos} photographs, ${counts.tours} tours, ${counts.comparisons} comparisons`);
