// The featured photograph: loading with size verification, fallback, and the
// header of the photo (context line, image, credit, title, caption).
// Other modules react to the 'photo:change' event instead of being called from here.
import { RIGHTS } from '../data/catalog.js';
import { INDEX, getPhoto } from './collection.js';
import { $, esc, CAT, fmtDate, dateOf, meetsMinimum, say, loadImage, todayIndex, dailyId } from './util.js';

export const state = { item: null, ctx: null, dims: null, history: [], recent: [], failed: new Set() };
export const SOURCE = { hubble: 'ESA/Hubble', webb: 'ESA/Webb', eso: 'ESO', noirlab: 'NSF NOIRLab', nasa: 'NASA' };
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
    if (mine !== token) return;
    preview(item);
    const dims = await verified(item);
    if (mine !== token) return;
    if (push && state.item) state.history.push({ id: state.item.id, ctx: state.ctx });
    Object.assign(state, { item, ctx, dims });
    state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 8);
    pending = null;
    render(item, ctx, dims);
    setNotice(notice);
    if (ctx.mode === 'daily') prefetchTomorrow();
    emit('photo:change', { item, ctx, dims });
    say(`Now showing: ${item.title}`);
  } catch (err) {
    if (mine !== token) return;
    pending = null;
    $('#stage').classList.remove('sharpening');
    state.failed.add(id);
    console.warn('[cosmos]', id, err.message);
    const title = item?.title || known?.title || 'This photograph';
    const org = item?.org || known?.org;
    const alt = fallbackFor(item?.cat || known?.cat);
    if (alt) {
      return show(alt, { ...ctx, standIn: title }, {
        push,
        notice: `“${title}” wouldn’t load${org ? ` from ${SOURCE[org]}` : ''}, so here’s another photograph instead.`
      });
    }
    $('#stage').classList.remove('loading');
    $('#photoTitle').textContent = 'The photographs aren’t loading';
    setNotice('None of the observatories’ image servers are answering right now. Check your connection and try again in a bit.');
  } finally {
    if (mine === token) emit('photo:busy', false);
  }
}

// Show the small "screen" rendition straight away (it is a fraction of the size), with the
// photograph's real proportions, while the full display file downloads and is size-checked.
// render() then swaps in the full file, which is already in the cache by then.
function preview(item) {
  const src = item.img.screen;
  if (!src || !item.img.pubW) return;
  const img = $('#photo'), blur = $('#photoBlur'), frame = $('#frame');
  // Develop in place: the tiny thumbnail (a few KB, often cached from the archive) shows first,
  // blurred, and the real photograph fades in over it as soon as it decodes.
  const thumb = item.img.thumb || INDEX.find((e) => e.id === item.id)?.thumb;
  if (thumb) { blur.src = thumb; frame.classList.add('has-blur'); } else frame.classList.remove('has-blur');
  frame.classList.add('developing');
  img.onload = () => frame.classList.remove('developing');
  img.src = src;
  img.alt = altText(item);
  $('#photoTitle').textContent = item.title;
  pending = { w: item.img.pubW, h: item.img.pubH };
  fitFrame();
  $('#stage').classList.add('sharpening');
  img.decode?.().then(() => $('#stage').classList.remove('loading')).catch(() => {});
}
let pending = null;

// After today's photograph is up, quietly fetch tomorrow's record and small image so the
// midnight change (or a visit tomorrow) starts instantly. Nothing large is downloaded.
let prefetched = false;
function prefetchTomorrow() {
  if (prefetched) return;
  prefetched = true;
  const go = () => getPhoto(dailyId(todayIndex() + 1)).then((it) => { if (it.img.screen) new Image().src = it.img.screen; }).catch(() => {});
  ('requestIdleCallback' in window ? requestIdleCallback : (f) => setTimeout(f, 3000))(go);
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
  if (ctx.standIn) return `In place of “${ctx.standIn}”`;
  if (ctx.mode === 'daily') return 'Today’s photograph';
  if (ctx.mode === 'archive') return `From the archive, ${fmtDate(dateOf(ctx.day))}`;
  if (ctx.mode === 'favorite') return 'From your favorites';
  if (ctx.mode === 'onthisday') return `On this day, ${ctx.label}`;
  if (ctx.mode === 'link') return 'Shared photograph';
  if (ctx.mode === 'search') return 'From the collection';
  if (ctx.mode === 'loved') return 'Most loved this week';
  return 'A random pick';
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
    : `${esc(item.caption)}. Released ${esc(item.releaseDate)}.`;
  $('#creditLine').innerHTML = `<strong>Credit:</strong> ${esc(item.credit)} · <a href="${esc(item.source)}" target="_blank" rel="noopener">Source</a> · ${esc(RIGHTS[item.org].short)}`;
  $('#sourceLink').href = item.source;
  $('#rights').innerHTML = `<a href="${esc(RIGHTS[item.org].url)}" target="_blank" rel="noopener">${esc(RIGHTS[item.org].label)}</a>. If you use it, keep the credit with it.`;
  requestAnimationFrame(() => $('#stage').classList.remove('loading', 'sharpening'));
}

// Keep the frame exactly the size of the displayed image so overlay labels stay aligned.
export function fitFrame() {
  const dims = pending || state.dims;
  if (!dims) return;
  const stage = $('#stage'), frame = $('#frame'), { w, h } = dims;
  // On wide screens, size the stage to the photograph so a landscape image runs edge to edge
  // instead of sitting between black bars. Portraits and very tall crops keep the normal stage.
  const vw = document.documentElement.clientWidth, fullH = vw * h / w;
  const bleed = vw >= 1000 && fullH <= innerHeight * 0.92 && fullH >= innerHeight * 0.45;
  const want = bleed ? Math.round(fullH) + 'px' : '';
  if (stage.style.height !== want) stage.style.height = want;
  stage.classList.toggle('bleed', bleed);
  const s = Math.min(stage.clientWidth / w, stage.clientHeight / h);
  frame.style.width = Math.floor(w * s) + 'px';
  frame.style.height = Math.floor(h * s) + 'px';
}
