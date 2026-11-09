// Thumbnail tile shared by the archive and favorites grids.
import { esc, CAT, reducedMotion } from './util.js';
import { INDEX_BY_ID } from './collection.js';
import { setView, currentView } from './router.js';

export function tile({ id, title, cat, thumb, sub, onOpen, onRemove }) {
  const available = Boolean(INDEX_BY_ID[id]);
  const el = document.createElement('article');
  el.className = 'tile';
  const body = `
    <div class="thumb"><img loading="lazy" decoding="async" width="300" height="225" alt="" src="${esc(thumb)}"></div>
    <div class="meta"><span>${esc(CAT[cat] || '')}${sub ? ' · ' + esc(sub) : ''}</span><strong>${esc(title)}</strong>
    ${available ? '' : '<span>This photograph is no longer available in the collection.</span>'}</div>`;
  el.innerHTML = (available
    ? `<button class="open" type="button" aria-label="Open ${esc(title)}${sub ? ', ' + esc(sub) : ''}">${body}</button>`
    : `<div>${body}</div>`) +
    (onRemove ? `<button class="remove" type="button" aria-label="Remove ${esc(title)} from favorites">Remove</button>` : '');

  const img = el.querySelector('img');
  img.addEventListener('error', () => img.replaceWith(Object.assign(document.createElement('span'), { className: 'missing', textContent: 'No preview' })));
  if (available) el.querySelector('.open').addEventListener('click', onOpen);
  if (onRemove) el.querySelector('.remove').addEventListener('click', onRemove);
  return el;
}

// Bring the photograph into view. If it is already in the upper half of the screen, nothing moves. A long way
// off (past a page of search results, say), the page jumps most of the distance at once and glides the rest,
// rather than flinging past everything in between.
export async function scrollToFeature() {
  const away = currentView() !== 'home';
  if (away) await setView('home');   // opened from another page: switch to the photograph first
  const trio = document.getElementById('trio');
  if (trio?.classList.contains('away')) {   // finish folding the destinations now, so the target doesn't move mid-scroll
    trio.classList.add('snap');
    setTimeout(() => trio.classList.remove('snap'), 60);
  }
  const target = document.querySelector('#feature .dateline') || document.getElementById('feature');
  const top = target.getBoundingClientRect().top, dest = scrollY + top;
  const title = document.getElementById('photoTitle');
  title.tabIndex = -1;
  title.focus({ preventScroll: true });
  if (away || reducedMotion()) return scrollTo({ top: dest, behavior: 'auto' });
  if (top >= 0 && top < innerHeight * 0.5) return;
  if (Math.abs(top) > innerHeight * 1.2) scrollTo({ top: dest - Math.sign(top) * innerHeight * 0.6, behavior: 'auto' });
  scrollTo({ top: dest, behavior: 'smooth' });
}
