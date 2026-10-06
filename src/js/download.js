// Download menu: the displayed file, the full-resolution file where the source offers one, and
// desktop / phone wallpapers cut from the displayed file with the credit line printed in a corner.
// Every option also copies the credit line, because reuse requires it.
import { $, esc, say } from './util.js';
import { state } from './feature.js';
import { RIGHTS } from '../data/catalog.js';

const btn = $('#downloadBtn'), menu = $('#downloadMenu');
const WALL = { desktop: [2560, 1440], phone: [1170, 2532] };

const creditText = (it) => `${it.title}. Credit: ${it.credit}. ${RIGHTS[it.org].short}. Source: ${it.source}`;
const fileName = (it, suffix = '') => `${it.id}${suffix}.jpg`;

async function copyCredit(it) {
  try { await navigator.clipboard.writeText(creditText(it)); return true; } catch { return false; }
}

function note(text) {
  const n = $('#downloadNote');
  n.textContent = text;
  n.hidden = !text;
}

// Save a blob under a sensible name. Cross-origin files can't be named by a plain link,
// so fetch them first; NOIRLab's server doesn't allow that, so its files open in a new tab.
function saveBlob(blob, name) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

async function fetchBlob(url) {
  const r = await fetch(url, { mode: 'cors' });
  if (!r.ok) throw new Error(r.status);
  return r.blob();
}

async function saveFile(url, name) {
  try { saveBlob(await fetchBlob(url), name); return 'saved'; } catch { window.open(url, '_blank', 'noopener'); return 'opened'; }
}

// Cover-crop the displayed image to the wallpaper size and print the credit in the lower corner.
async function wallpaper(it, kind) {
  const [W, H] = WALL[kind];
  const bmp = await createImageBitmap(await fetchBlob(it.img.pub));
  const c = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = c.getContext('2d');
  const s = Math.max(W / bmp.width, H / bmp.height);
  g.drawImage(bmp, (W - bmp.width * s) / 2, (H - bmp.height * s) / 2, bmp.width * s, bmp.height * s);
  const size = Math.round(Math.min(W, H) * 0.014);
  g.font = `${size}px "IBM Plex Mono", monospace`;
  const text = `${it.title} · ${it.credit}`;
  const maxW = W - size * 4;
  const line = g.measureText(text).width > maxW ? text.slice(0, Math.floor(text.length * maxW / g.measureText(text).width) - 1) + '…' : text;
  g.fillStyle = 'rgba(0,0,0,.55)';
  g.fillRect(0, H - size * 2.6, W, size * 2.6);
  g.fillStyle = 'rgba(233,228,216,.9)';
  g.fillText(line, size * 2, H - size * 0.95);
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92));
  saveBlob(blob, fileName(it, `-${kind}-wallpaper`));
}

function open() {
  const it = state.item;
  const big = it.img.large;
  menu.innerHTML = `
    <button type="button" data-dl="pub">Image · ${state.dims.w.toLocaleString('en')} × ${state.dims.h.toLocaleString('en')} JPEG</button>
    ${big ? `<button type="button" data-dl="large">Full resolution${it.img.largeMB ? ` · ${Math.round(it.img.largeMB * 10) / 10} MB` : ''}</button>` : ''}
    <button type="button" data-dl="desktop">Desktop wallpaper · 2560 × 1440</button>
    <button type="button" data-dl="phone">Phone wallpaper · 1170 × 2532</button>
    <button type="button" data-dl="credit">Copy the credit line</button>
    <p class="dl-terms">${esc(RIGHTS[it.org].label)}. Keep the credit with the image wherever you use it.</p>`;
  menu.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
  note('');
  menu.querySelector('button').focus();
}

function close() {
  menu.hidden = true;
  btn.setAttribute('aria-expanded', 'false');
}

btn.addEventListener('click', () => (menu.hidden ? open() : close()));
menu.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-dl]');
  if (!b) return;
  const it = state.item, kind = b.dataset.dl;
  b.disabled = true;
  const copied = await copyCredit(it);
  const credit = copied ? ' The credit line is on your clipboard.' : ` Credit: ${it.credit}.`;
  try {
    if (kind === 'credit') {
      note(copied ? 'Credit line copied.' : creditText(it));
    } else if (kind === 'pub' || kind === 'large') {
      const how = await saveFile(kind === 'pub' ? it.img.pub : it.img.large, fileName(it, kind === 'large' ? '-full' : ''));
      note((how === 'saved' ? 'Download started.' : 'The file opened in a new tab; save it from there.') + credit);
    } else {
      note('Making the wallpaper…');
      await wallpaper(it, kind);
      note('Wallpaper saved, with the credit printed in the corner.' + credit);
    }
    say('Download ready');
  } catch {
    note('This source doesn’t allow wallpapers to be made in the browser. Use “Image” instead and crop it yourself.' + credit);
  } finally {
    b.disabled = false;
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); } });
document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) close(); });
document.addEventListener('photo:change', () => { close(); note(''); });
