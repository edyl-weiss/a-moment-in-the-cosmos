// Hubble-vs-Webb slider shown in place of the photo. The divider is a native
// range input stretched over the images, so it works with mouse, touch and keyboard.
import { COMPARISONS } from '../data/comparisons.js';
import { $, esc, say, loadImage, reducedMotion } from './util.js';
import { state } from './feature.js';

const btn = $('#compareBtn'), panel = $('#compare'), box = $('#cmpBox'), range = $('#cmpRange');
let token = 0, current = null;

function setSplit(v) {
  box.style.setProperty('--split', v + '%');   // .cmp-box declares --split itself, so set it there
  range.setAttribute('aria-valuetext', `${Math.round(v)}% ${current.left.label}, ${Math.round(100 - v)}% ${current.right.label}`);
}

function fit() {
  const c = current;
  if (!c || panel.hidden) return;
  const stage = $('#stage'), s = Math.min(stage.clientWidth / c.w, stage.clientHeight / c.h);
  box.style.width = Math.floor(c.w * s) + 'px';
  box.style.height = Math.floor(c.h * s) + 'px';
}
new ResizeObserver(fit).observe($('#stage'));

async function open() {
  const c = COMPARISONS[state.item.id], mine = ++token;
  current = c;
  btn.setAttribute('aria-pressed', 'true');
  btn.querySelector('span').textContent = 'Back to the photo';
  $('#stage').classList.add('comparing', 'loading');
  panel.hidden = false;
  $('#cmpLeftLabel').textContent = c.left.label;
  $('#cmpRightLabel').textContent = c.right.label;
  $('#cmpNote').innerHTML = `${esc(c.note)} <span class="src">Aligned pair from <a href="${esc(c.source)}" target="_blank" rel="noopener">ESA/Webb’s comparison page</a>.</span>`;
  $('#cmpCredit').innerHTML = `<strong>Left:</strong> ${esc(c.left.credit)} · <strong>Right:</strong> ${esc(c.right.credit)} · CC BY 4.0`;
  $('#cmpNote').hidden = $('#cmpCredit').hidden = false;
  $('#creditLine').hidden = true;
  fit();
  $('#stage').scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  try {
    await Promise.all([loadImage(c.left.img), loadImage(c.right.img)]);
    if (mine !== token) return;
    Object.assign($('#cmpLeft'), { src: c.left.img, alt: `${c.left.title}, ${c.left.label}` });
    Object.assign($('#cmpRight'), { src: c.right.img, alt: `${c.right.title}, ${c.right.label}` });
    range.value = 50;
    setSplit(50);
    say(`Comparison open: ${c.left.label} on the left, ${c.right.label} on the right. Use the slider to reveal each.`);
  } catch {
    if (mine !== token) return;
    $('#cmpNote').textContent = 'The comparison images could not be loaded from ESA/Webb right now.';
  } finally {
    if (mine === token) $('#stage').classList.remove('loading');
  }
}

function close() {
  token++;
  current = null;
  btn.setAttribute('aria-pressed', 'false');
  btn.querySelector('span').textContent = 'Hubble vs Webb';
  $('#stage').classList.remove('comparing', 'loading');
  panel.hidden = true;
  $('#cmpNote').hidden = $('#cmpCredit').hidden = true;
  $('#creditLine').hidden = false;
  $('#cmpLeft').removeAttribute('src');
  $('#cmpRight').removeAttribute('src');
}

range.addEventListener('input', () => setSplit(Number(range.value)));
btn.addEventListener('click', () => (btn.getAttribute('aria-pressed') === 'true' ? close() : open()));
document.addEventListener('photo:change', ({ detail: { item } }) => {
  close();
  btn.hidden = !COMPARISONS[item.id];
});
