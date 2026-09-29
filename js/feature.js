// The featured photograph: loading with size verification, fallback, and the
// header of the photo (context line, image, credit, title, caption).
// Other modules react to the 'photo:change' event instead of being called from here.
import { RIGHTS } from '../data/catalog.js';
import { INDEX, getPhoto } from './collection.js';
import { $, esc, CAT, fmtDate, dateOf, meetsMinimum, say, loadImage } from './util.js';

export const state = { item: null, ctx: null, dims: null, history: [], recent: [], failed: new Set() };
const SOURCE = { hubble: 'ESA/Hubble', webb: 'ESA/Webb', eso: 'ESO', noirlab: 'NSF NOIRLab' };
let token = 0;

const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

async function verified(item) {
  const im = await loadImage(item.img.pub);
  const w = im.naturalWidth, h = im.naturalHeight;
  if (!meetsMinimum(w, h)) throw new Error(`it is below the minimum resolution (${w} × ${h})`);
  return { w, h };
}

function fallbackFor(cat) {
  const ok = INDEX.filter((c) => !state.failed.has(c.id));
  return (ok.find((c) => c.cat === cat) || ok[0])?.id;
}

export async function show(id, ctx, { push = true, notice = '' } = {}) {
  const mine = ++token;
  const known = INDEX.find((e) => e.id === id);
  let item = null;
  $('#stage').classList.add('loading');
  emit('photo:busy', true);
  try {
    item = await getPhoto(id);
    const dims = await verified(item);
    if (mine !== token) return;
    if (push && state.item) state.history.push({ id: state.item.id, ctx: state.ctx });
    Object.assign(state, { item, ctx, dims });
    state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 8);
    render(item, ctx, dims);
    setNotice(notice);
    emit('photo:change', { item, ctx, dims });
    say(`Now showing: ${item.title}`);
  } catch (err) {
    if (mine !== token) return;
    state.failed.add(id);
    console.warn('[cosmos]', id, err.message);
    const title = item?.title || known?.title || 'This photograph';
    const org = item?.org || known?.org;
    const alt = fallbackFor(item?.cat || known?.cat);
    if (alt) {
      return show(alt, { ...ctx, standIn: title }, {
        push,
        notice: `“${title}” could not be shown — ${err.message}${org ? ` (${SOURCE[org]})` : ''}. Showing a previously verified photograph from the collection instead.`
      });
    }
    $('#stage').classList.remove('loading');
    $('#photoTitle').textContent = 'Photographs are unavailable right now';
    setNotice('Photographs can’t be loaded from ESA/Hubble, ESA/Webb, ESO or NOIRLab right now — please check your connection and try again. No substitute images are shown.');
  } finally {
    if (mine === token) emit('photo:busy', false);
  }
}

export function back() {
  const prev = state.history.pop();
  if (prev) show(prev.id, prev.ctx, { push: false });
}

export const altText = (item) => item.alt || `${item.title}: ${item.story[0].split('. ')[0]}.`;

function setNotice(text) {
  const n = $('#notice');
  n.textContent = text;
  n.hidden = !text;
}

function contextLine(item, ctx) {
  if (ctx.standIn) return `Standing in for “${ctx.standIn}”`;
  if (ctx.mode === 'daily') return `Today’s photograph · ${fmtDate(dateOf(ctx.day))}`;
  if (ctx.mode === 'archive') return `Archive · featured ${fmtDate(dateOf(ctx.day))}`;
  if (ctx.mode === 'favorite') return 'From your favorites';
  return `Random discovery · ${CAT[item.cat]}`;
}

function render(item, ctx, dims) {
  const img = $('#photo');
  img.src = item.img.pub;
  img.alt = altText(item);
  $('#dims').textContent = `${dims.w} × ${dims.h}`;
  fitFrame();

  const chip = $('#catChip');
  chip.dataset.cat = item.cat;
  chip.textContent = CAT[item.cat];
  $('#whenLabel').textContent = contextLine(item, ctx);
  $('#backToday').hidden = ctx.mode === 'daily' && !ctx.standIn;

  $('#photoTitle').textContent = item.title;
  $('#caption').innerHTML = item.captureShort
    ? `${esc(item.caption)}, <span class="date">${esc(item.captureShort)}</span>. Released ${esc(item.releaseDate)}.`
    : `${esc(item.caption)}. <span class="date">Capture date unavailable</span> · Released ${esc(item.releaseDate)}.`;
  $('#creditLine').innerHTML = `<strong>Credit:</strong> ${esc(item.credit)} · <a href="${esc(item.source)}" target="_blank" rel="noopener">Source</a> · CC BY 4.0`;
  $('#sourceLink').href = item.source;
  $('#rights').innerHTML = `<a href="${esc(RIGHTS[item.org].url)}" target="_blank" rel="noopener">${esc(RIGHTS[item.org].label)}</a>. The full credit line must stay visible with the image.`;
  requestAnimationFrame(() => $('#stage').classList.remove('loading'));
}

// Keep the frame exactly the size of the displayed image so overlay labels stay aligned.
export function fitFrame() {
  if (!state.dims) return;
  const stage = $('#stage'), frame = $('#frame'), { w, h } = state.dims;
  const s = Math.min(stage.clientWidth / w, stage.clientHeight / h);
  frame.style.width = Math.floor(w * s) + 'px';
  frame.style.height = Math.floor(h * s) + 'px';
}
