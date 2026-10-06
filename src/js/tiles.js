// Thumbnail tile shared by the archive and favorites grids.
import { esc, CAT, reducedMotion } from './util.js';
import { INDEX_BY_ID } from './collection.js';

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

export function scrollToFeature() {
  document.getElementById('feature').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  const title = document.getElementById('photoTitle');
  title.tabIndex = -1;
  title.focus({ preventScroll: true });
}
