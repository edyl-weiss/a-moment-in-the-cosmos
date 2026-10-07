// Pages. Today's photograph, On this day, Archive, Favorites and About each show on their own;
// the address bar says which (#archive, #about…), so Back/Forward and shared links work.
const VIEWS = ['onthisday', 'archive', 'favorites', 'about'];
const sections = { home: document.getElementById('feature') };
VIEWS.forEach((v) => { sections[v] = document.getElementById(v); });
const links = [...document.querySelectorAll('.site-nav a')];
let current = null;

function viewFor(hash) {
  const h = hash.slice(1);
  if (VIEWS.includes(h)) return h;
  if (/^on-\d{2}-\d{2}$/.test(h)) return 'onthisday';
  return 'home';
}

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// A brief drift of stars across the screen while the page changes.
function starfall() {
  const sky = document.createElement('div');
  sky.className = 'warp';
  sky.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('i');
    const r = Math.random();
    s.style.cssText = `left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 100).toFixed(1)}%;` +
      `--d:${(r * 90 + 30).toFixed(0)}px;--s:${(1 + r * 1.6).toFixed(1)}px;animation-delay:${(Math.random() * 160).toFixed(0)}ms`;
    sky.append(s);
  }
  document.body.append(sky);
  setTimeout(() => sky.remove(), 1100);
}

export function setView(name) {
  if (name === current) return;
  const first = current === null;
  current = name;
  if (!first && !calm()) {
    starfall();
    if (document.startViewTransition) { document.startViewTransition(() => apply(name)); return; }
    apply(name);
    const el = sections[name];
    el?.classList.remove('page-in'); void el?.offsetWidth; el?.classList.add('page-in');
    return;
  }
  apply(name);
}

function apply(name) {
  for (const [k, el] of Object.entries(sections)) if (el) el.hidden = k !== name;
  document.querySelectorAll('[data-home-only]').forEach((el) => { el.hidden = name !== 'home'; });
  links.forEach((a) => a.setAttribute('aria-current', String(viewFor(a.hash) === name)));
  window.scrollTo(0, 0);
}
export const currentView = () => current;

const route = () => setView(viewFor(location.hash));
window.addEventListener('hashchange', route);
window.addEventListener('popstate', route);
// Clicking the link for the page already showing just returns to its top.
links.forEach((a) => a.addEventListener('click', () => { if (viewFor(a.hash) === current) window.scrollTo({ top: 0, behavior: 'smooth' }); }));
route();
