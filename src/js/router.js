// Pages. Today's photograph, On this day, Archive, Favorites and About each show on their own;
// the address bar says which (#archive, #about…), so Back/Forward and shared links work.
// Each section belongs to a page; Today and On this day share one, as do Archive and Favorites.
const PAGE_OF = { feature: 'home', onthisday: 'home', archive: 'library', favorites: 'library', about: 'about' };
const VIEWS = Object.keys(PAGE_OF);
const sectionEls = Object.fromEntries(VIEWS.map((v) => [v, document.getElementById(v)]));
const links = [...document.querySelectorAll('.site-nav a')];
let current = null;

function viewFor(hash) {
  const h = hash.slice(1);
  if (VIEWS.includes(h)) return PAGE_OF[h];
  return 'home';   // photographs and #on-MM-DD dates live on the home page
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
    if (document.startViewTransition) return document.startViewTransition(() => apply(name)).updateCallbackDone;
    apply(name);
    const el = document.querySelector('main');
    el?.classList.remove('page-in'); void el?.offsetWidth; el?.classList.add('page-in');
    return;
  }
  apply(name);
}

function apply(name) {
  for (const [k, el] of Object.entries(sectionEls)) if (el) el.hidden = PAGE_OF[k] !== name;
  document.querySelectorAll('[data-home-only]').forEach((el) => { el.hidden = name !== 'home'; });
}

// The menu marks the section the address names, or the page's first section.
function mark() {
  const want = /^#on-\d{2}-\d{2}$/.test(location.hash) ? '#onthisday' : location.hash;
  const exact = links.find((a) => a.hash === want);
  const on = exact || links.find((a) => viewFor(a.hash) === current);
  links.forEach((a) => a.setAttribute('aria-current', String(a === on)));
}

// After a page change, land on the section the address names (top of the page otherwise).
function land(smooth) {
  const id = location.hash.slice(1);
  const el = VIEWS.includes(id) && PAGE_OF[id] === current && id !== 'feature' && id !== 'archive' ? sectionEls[id]
    : /^on-\d{2}-\d{2}$/.test(id) ? sectionEls.onthisday : null;
  if (el) el.scrollIntoView({ behavior: smooth && !calm() ? 'smooth' : 'auto' });
  else window.scrollTo({ top: 0, behavior: smooth && !calm() ? 'smooth' : 'auto' });
}
export const currentView = () => current;

async function route() {
  const page = viewFor(location.hash), changed = page !== current;
  await setView(page);
  mark();
  if (changed) land(false); else if (VIEWS.includes(location.hash.slice(1))) land(true);
}
window.addEventListener('hashchange', route);
window.addEventListener('popstate', route);
document.addEventListener('photo:change', () => setTimeout(mark));
// Clicking a link whose address is already showing still scrolls to its section.
links.forEach((a) => a.addEventListener('click', () => { if (a.hash === location.hash) land(true); }));
route();
