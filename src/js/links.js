// Shareable links. The address bar follows what is on screen:
//   #e-potw1052a   a photograph (any id in the collection)
//   #on-12-26      "On this day" open at a calendar date
// Section anchors (#archive, #about…) are left alone. Opening a link restores the view,
// and the browser's Back / Forward buttons walk through photographs opened on the page.
import { $, say, todayIndex, dailyId } from './util.js';
import { state, show } from './feature.js';
import { INDEX_BY_ID } from './collection.js';
import { scrollToFeature } from './tiles.js';

const DATE = /^on-(\d{2})-(\d{2})$/;
let handlers = { date: null };

export const photoLink = (id) => `${location.origin}${location.pathname}#${encodeURIComponent(id)}`;
export const dateLink = (k) => `${location.origin}${location.pathname}#on-${k}`;

// Called by "On this day" so a date link can be opened without an import cycle.
export function onDateLink(fn) { handlers.date = fn; }

function setHash(hash, push) {
  if (location.hash === hash) return;
  const url = `${location.pathname}${location.search}${hash}`;
  history[push ? 'pushState' : 'replaceState'](null, '', url);
}

export function setDateHash(k) { setHash(`#on-${k}`, false); }

// Read the hash and act on it. Returns true when it named a photograph or a date.
export function openFromHash({ scroll = true } = {}) {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return false;
  const d = h.match(DATE);
  if (d && handlers.date) {
    handlers.date(Number(d[1]) - 1, Number(d[2]));
    if (scroll) $('#onthisday').scrollIntoView();
    return true;
  }
  if (!INDEX_BY_ID[h]) return false;
  if (state.item?.id === h) return true;
  const today = todayIndex();
  const ctx = dailyId(today) === h ? { mode: 'daily', day: today } : { mode: 'link' };
  show(h, ctx, { push: false });
  if (scroll) scrollToFeature();
  return true;
}

// Keep the address bar in step with the photograph. Today's photograph gets no hash, so the bare
// address always means "today"; anything else gets its own link.
document.addEventListener('photo:change', ({ detail: { item, ctx } }) => {
  const daily = ctx.mode === 'daily' && !ctx.standIn;
  if (daily) { if (!DATE.test(location.hash.slice(1))) setHash('', false); }   // keep a date link in place
  else setHash(`#${encodeURIComponent(item.id)}`, ctx.mode !== 'link');
});

window.addEventListener('popstate', () => {
  if (!location.hash) {
    const today = todayIndex();
    if (state.item?.id !== dailyId(today)) show(dailyId(today), { mode: 'daily', day: today }, { push: false });
    return;
  }
  openFromHash();
});

// "Copy link": the system share sheet on phones, the clipboard elsewhere.
$('#shareBtn').addEventListener('click', async () => {
  const it = state.item;
  if (!it) return;
  const url = photoLink(it.id);
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ title: it.title, text: `${it.title} · A Moment in the Cosmos`, url }); return; } catch { /* closed or unsupported: fall through */ }
  }
  try {
    await navigator.clipboard.writeText(url);
    flash('#shareText', 'Link copied');
    say('Link to this photograph copied');
  } catch {
    prompt('Copy this link:', url);
  }
});

export function flash(sel, text, ms = 2200) {
  const el = $(sel), was = el.dataset.label || el.textContent;
  el.dataset.label = was;
  el.textContent = text;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = was; }, ms);
}

// Navigation: mark the section currently in view with a small dot.
{
  const links = [...document.querySelectorAll('.site-nav a')];
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) links.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${e.target.id}`)));
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a) => { const s = document.querySelector(a.hash); if (s) io.observe(s); });
}

// Immersive view: controls fade after a quiet moment, return on any movement or key.
{
  const v = document.getElementById('viewer');
  if (v) {
    let t;
    const wake = () => { v.classList.remove('idle'); clearTimeout(t); t = setTimeout(() => v.open && v.classList.add('idle'), 2600); };
    ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => v.addEventListener(ev, wake, { passive: true }));
    new MutationObserver(() => (v.open ? wake() : v.classList.remove('idle'))).observe(v, { attributes: true, attributeFilter: ['open'] });
  }
}
