// Interaction motion. Every effect here answers something the visitor did, and all of it is
// skipped when the visitor has asked their system for reduced motion.
import { $, $$, reducedMotion } from './util.js';

const calm = reducedMotion;

// 1 · Iris: a new photograph opens like an aperture, from wherever the visitor clicked.
let origin = null, first = true;
document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('[data-random], #prevBtn, #nextBtn, #backToday, .tile, .grid button, .grid a, .events button, #vPrevDay, #vNextDay')) {
    origin = [e.clientX, e.clientY];
  }
}, true);
document.addEventListener('photo:change', () => {
  const stage = $('#stage'), title = $('#photoTitle'), cap = $('#caption');
  if (first) { first = false; return; }               // the first photograph simply develops
  if (calm()) return;
  const r = stage.getBoundingClientRect();
  const [x, y] = origin && origin[1] > r.top && origin[1] < r.bottom ? [origin[0] - r.left, origin[1] - r.top] : [r.width / 2, r.height / 2];
  stage.style.setProperty('--ix', x + 'px');
  stage.style.setProperty('--iy', y + 'px');
  restart(stage, 'iris');
  restart(title, 'rise-in');
  restart(cap, 'rise-in-late');
  origin = null;
});

// 2 · Saving a favorite: a small burst of light around the button.
$('#favBtn')?.addEventListener('click', (e) => {
  if (calm() || e.currentTarget.getAttribute('aria-pressed') !== 'true') return;
  const b = e.currentTarget, burst = document.createElement('span');
  burst.className = 'burst';
  burst.innerHTML = Array.from({ length: 8 }, (_, i) => `<i style="--a:${i * 45}deg"></i>`).join('');
  b.appendChild(burst);
  setTimeout(() => burst.remove(), 900);
});

// 3 · Copy link: the label settles in with a small check.
$('#shareBtn')?.addEventListener('click', () => { if (!calm()) setTimeout(() => restart($('#shareText'), 'pop'), 30); });

// 4 · Navigation: one dot that glides to the section in view.
{
  const ul = $('.site-nav ul');
  if (ul) {
    const dot = document.createElement('span');
    dot.className = 'nav-dot';
    dot.setAttribute('aria-hidden', 'true');
    ul.appendChild(dot);
    const place = () => {
      const a = $('.site-nav a[aria-current="true"]');
      dot.style.opacity = a ? 1 : 0;
      if (a) dot.style.transform = `translateX(${a.offsetLeft + a.offsetWidth / 2 - 2}px)`;
    };
    new MutationObserver(place).observe(ul, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
    addEventListener('resize', place);
  }
}

// 5 · Arriving sections: headings and opening paragraphs lift gently into place, once.
if ('IntersectionObserver' in window && !calm()) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.section-head, .story-main > *, .notes, .about-part').forEach((el) => { el.classList.add('lift'); io.observe(el); });
}

// 6 · On this day: the big date turns like a page when the visitor changes it.
{
  const big = $('#otdBig');
  let seen = false;
  if (big) new MutationObserver(() => { if (seen && !calm()) restart(big, 'turn-page'); seen = true; })
    .observe(big, { childList: true, characterData: true, subtree: true });
}

function restart(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}

// 7 · On this day: its constellations draw themselves in the first time the section is seen.
{
  const sky = $('.otd-sky');
  if (sky && 'IntersectionObserver' in window && !calm()) {
    sky.classList.add('draw');
    sky.style.animationPlayState = 'paused';
    sky.querySelectorAll('line, circle').forEach((el) => { el.style.animationPlayState = 'paused'; });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      sky.querySelectorAll('line, circle').forEach((el) => { el.style.animationPlayState = 'running'; });
      io.disconnect();
    }, { threshold: .2 });
    io.observe(sky.parentElement);
  }
}
