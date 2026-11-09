// The constellation background drifts up at a fraction of the scroll speed, so it feels far away.
// The tile repeats, so the offset wraps at its height (--sky-h in refine.css). Off when the reader prefers less motion.
const SPEED = 0.15;
const still = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
let tileH = 0, queued = false;

function place() {
  queued = false;
  if (still.matches) { root.style.removeProperty('--sky-y'); return; }
  tileH ||= parseFloat(getComputedStyle(root).getPropertyValue('--sky-h')) || 4050;
  root.style.setProperty('--sky-y', `${-((scrollY * SPEED) % tileH)}px`);
}
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(place); } }, { passive: true });
still.addEventListener('change', place);
place();
