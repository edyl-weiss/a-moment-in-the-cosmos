// Play: the daily Cosmic guess and "Your birthday in the cosmos".
//
// Cosmic guess: a close-up of a famous object (see guess-core.js). Three looks, each wider; four names to
// choose from. Results, streaks and stats live in this browser, and for email subscribers (who arrive with a
// signed token from the daily email) they're also kept on the server, so the record follows them anywhere.
//
// Birthday: a photograph released on your birthday, an astronomy event from that date, the Moon's phase the
// night you were born and a link to the sky that night. The date stays in this browser.
import { $, esc, CAT, store, todayIndex, nextRollover } from './util.js';
import { show } from './feature.js';
import { INDEX, INDEX_BY_ID, getPhoto } from './collection.js';
import { scrollToFeature } from './tiles.js';
import { puzzleFor, cropUrl, TRIES } from './guess-core.js';
import { moonAt } from './planets.js';
import { openSkyOn } from './nightsky.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SITE = () => `${location.origin}${location.pathname}`;

async function share(title, text, url, button) {
  const label = button.textContent;
  try {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) { await navigator.share({ title, text, url }); return; }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    button.textContent = 'Copied';
  } catch (err) {
    if (err?.name === 'AbortError') return;
    button.textContent = 'Couldn’t copy';
  }
  setTimeout(() => { button.textContent = label; }, 2000);
}

// ---------------------------------------------------------------------------------------------
// Cosmic guess

const KEY = 'guess.v1';
let book = store.get(KEY, { days: {} });
let token = store.get('guess.t', '');
let puzzle = null, photo = null;
const save = () => store.set(KEY, book);
const today = () => todayIndex();
const record = () => book.days[puzzle.day] || (book.days[puzzle.day] = { picks: [], won: false, done: false, cat: puzzle.cat });

// Everything the record says: played, solved, streaks, how many looks it took, by kind of object.
export function stats(days = book.days) {
  const done = Object.entries(days).filter(([, r]) => r.done).map(([d, r]) => [Number(d), r]).sort((a, b) => a[0] - b[0]);
  const won = done.filter(([, r]) => r.won);
  const dist = [0, 0, 0, 0];                       // first look, second, third, missed
  for (const [, r] of done) dist[r.won ? r.picks.length - 1 : 3]++;
  let best = 0, run = 0, prev = null;
  for (const [d, r] of done) { run = r.won && (prev === null || d === prev + 1) ? run + 1 : r.won ? 1 : 0; prev = d; best = Math.max(best, run); }
  let streak = 0;
  for (let d = (days[today()]?.done ? today() : today() - 1); days[d]?.done && days[d].won; d--) streak++;
  const kinds = {};
  for (const [, r] of done) { const k = kinds[r.cat] || (kinds[r.cat] = [0, 0]); k[1]++; if (r.won) k[0]++; }
  const looks = won.reduce((a, [, r]) => a + r.picks.length, 0);
  return { played: done.length, won: won.length, rate: done.length ? Math.round(100 * won.length / done.length) : 0, streak, best, dist, kinds, avg: won.length ? looks / won.length : 0 };
}

function renderStats() {
  const s = stats();
  const max = Math.max(1, ...s.dist);
  const bar = (label, n, cls = '') => `<div class="gs-bar ${cls}"><span>${label}</span><i style="--w:${Math.max(n ? 8 : 0, (n / max) * 100)}%"><b>${n}</b></i></div>`;
  const kinds = Object.entries(s.kinds).map(([k, [w, n]]) => `<li><span>${esc(CAT[k] || k)}</span><b>${Math.round(100 * w / n)}%</b><em>${w} of ${n}</em></li>`).join('');
  $('#guessStats').innerHTML = `
    <p class="gs-head">Your record</p>
    <div class="gs-nums">
      <div><b>${s.played}</b><span>Played</span></div>
      <div><b>${s.rate}%</b><span>Solved</span></div>
      <div><b>${s.streak}</b><span>Streak</span></div>
      <div><b>${s.best}</b><span>Best</span></div>
    </div>
    <div class="gs-dist" aria-label="How many looks each solve took">
      ${bar('1st look', s.dist[0])}${bar('2nd look', s.dist[1])}${bar('3rd look', s.dist[2])}${bar('Missed', s.dist[3], 'miss')}
    </div>
    ${kinds ? `<ul class="gs-kinds" aria-label="Solved by kind of object">${kinds}</ul>` : ''}
    <p class="gs-sync">${token ? 'Your record is linked to your email subscription, so it follows you to any device' : 'Kept in this browser. Subscribe to the daily email and your record follows you to any device'}</p>`;
}

function verdict(r) {
  if (!r.won) return 'Not this time. It was';
  return ['First look. Sharp eyes', 'Got it on the second look', 'Got it on the third look'][r.picks.length - 1];
}
const shareLine = (r) => r.picks.map((p) => (p === puzzle.answer ? '✦' : '✕')).join(' ');

function renderGuess() {
  const r = book.days[puzzle.day] || { picks: [], done: false };
  const look = Math.min(r.picks.length, TRIES - 1);
  $('#guessNo').textContent = `No. ${puzzle.no.toLocaleString('en')}`;
  const img = $('#guessImg');
  const src = r.done ? (photo.img.screen || photo.img.pub) : cropUrl(photo, puzzle, look);
  if (img.dataset.src !== src) {
    const pre = new Image();
    pre.onload = () => { img.style.backgroundImage = `url("${src}")`; img.dataset.src = src; img.classList.add('in'); $('#guessLoading').hidden = true; };
    pre.onerror = () => { $('#guessLoading').textContent = 'The telescope can’t reach this one right now'; };
    img.classList.remove('in');
    pre.src = src;
  }
  $('#guessView').classList.toggle('revealed', r.done);
  $('#guessView').setAttribute('aria-label', r.done ? `${puzzle.name}, the full photograph` : `Look ${look + 1} of ${TRIES}: a close-up of today's mystery object`);
  // the next, wider look loads in the background so the change is instant
  if (!r.done && look + 1 < TRIES) new Image().src = cropUrl(photo, puzzle, look + 1);

  $('#guessPlay').hidden = r.done;
  $('#guessDone').hidden = !r.done;
  if (!r.done) {
    $('#guessOpts').innerHTML = puzzle.options.map((n, i) => {
      const tried = r.picks.includes(i);
      return `<button type="button" class="guess-opt${tried ? ' wrong' : ''}" data-i="${i}" ${tried ? 'disabled aria-disabled="true"' : ''}><span class="go-k">${'ABCD'[i]}</span>${esc(n)}</button>`;
    }).join('');
    const left = TRIES - r.picks.length;
    $('#guessTries').innerHTML = `<span class="gt-dots" aria-hidden="true">${Array.from({ length: TRIES }, (_, i) => `<i class="${i < r.picks.length ? 'used' : ''}"></i>`).join('')}</span>` +
      (r.picks.length ? `Not quite. ${left} ${left === 1 ? 'look' : 'looks'} left, a little wider` : `${TRIES} looks, each a little wider`);
  } else {
    $('#guessVerdict').textContent = verdict(r);
    $('#guessName').textContent = puzzle.name;
    renderStats();
    tick();
    everyone();
  }
}

// ---------- Everyone today: how all players answered (anonymous counts, shown once you've finished and more than ten have played) ----------
async function tally(r) {
  if (store.get('guess.tallied', -1) === puzzle.day) return;
  try {
    const res = await fetch('/api/guess-tally', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day: puzzle.day, picks: r.picks, won: r.won }) });
    if (res.ok) store.set('guess.tallied', puzzle.day);
  } catch { /* counts are a nice extra */ }
}
let everyoneTimer = 0;
async function everyone() {
  clearTimeout(everyoneTimer);
  const box = $('#guessEveryone');
  let t;
  try {
    const res = await fetch(`/api/guess-tally?day=${puzzle.day}`);
    if (!res.ok) { box.hidden = true; return; }
    t = await res.json();
  } catch { box.hidden = true; return; }
  const mine = book.days[puzzle.day]?.picks?.[0];
  const total = Math.max(1, t.first.reduce((a, b) => a + b, 0));
  const pct = (n) => Math.round((100 * n) / total);
  const rows = puzzle.options.map((name, i) => {
    const right = i === puzzle.answer, p = pct(t.first[i]);
    return `<div class="ge-row${right ? ' right' : ''}"><span class="ge-name">${right ? '<b aria-label="correct answer">✦</b> ' : ''}${esc(name)}${i === mine ? ' <em>you</em>' : ''}</span>` +
      `<span class="ge-track"><i style="--w:${p}%"></i></span><span class="ge-pct">${p}%</span></div>`;
  }).join('');
  const lt = Math.max(1, t.looks.reduce((a, b) => a + b, 0));
  const lp = (n) => `${Math.round((100 * n) / lt)}%`;
  // Shown only once more than ten people have played, so the percentages mean something
  if (t.players <= 10) { box.hidden = true; everyoneTimer = setTimeout(everyone, 120000); return; }
  box.innerHTML = t.players
    ? `<p class="ge-h"><span>Everyone today</span><span>${t.players.toLocaleString('en')} ${t.players === 1 ? 'player' : 'players'}</span></p>
       <p class="ge-sub">First guesses</p>${rows}
       <p class="ge-looks">Solved on the first look <b>${lp(t.looks[0])}</b> · second <b>${lp(t.looks[1])}</b> · third <b>${lp(t.looks[2])}</b> · missed <b>${lp(t.looks[3])}</b></p>`
    : '<p class="ge-h"><span>Everyone today</span></p><p class="ge-looks">You’re among the first to play today. Check back later to see how everyone did</p>';
  box.hidden = false;
  everyoneTimer = setTimeout(everyone, 120000);                 // keep it fresh while the page is open
}

function tick() {
  if ($('#guessDone').hidden) return;
  const ms = nextRollover() - Date.now();
  const h = Math.floor(ms / 36e5), m = Math.max(1, Math.round((ms % 36e5) / 6e4));
  $('#guessNext').textContent = `Next puzzle in ${h ? `${h} h ` : ''}${m} min`;
}
setInterval(tick, 60000);

// when today's puzzle first came into view, for the "Quick draw" seal
let seenAt = 0;
new IntersectionObserver((es, o) => { if (es.some((x) => x.isIntersecting)) { seenAt = performance.now(); o.disconnect(); } }, { threshold: 0.15 }).observe($('#guessView'));
function pick(i) {
  const r = record();
  if (r.done || r.picks.includes(i) || i < 0 || i > 3) return;
  r.picks.push(i);
  if (i === puzzle.answer) { r.won = true; r.done = true; } else if (r.picks.length >= TRIES) r.done = true;
  save();
  if (r.done) { sync(r); tally(r).finally(everyone); document.dispatchEvent(new CustomEvent('guess:done', { detail: { ...r, id: puzzle.id, secs: (performance.now() - (seenAt || 0)) / 1000 } })); }
  else $('#guessView').classList.add('nudge');
  setTimeout(() => $('#guessView').classList.remove('nudge'), 500);
  renderGuess();
}

async function sync(r) {
  if (!token) return;
  try { await fetch('/api/guess', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: token, day: puzzle.day, picks: r.picks, won: r.won, cat: r.cat }) }); }
  catch { /* the browser copy is enough until next time */ }
}
// Pull the subscriber's record from the server (answers given on another device count here too), and push
// any results this browser has that the server doesn't.
async function pull() {
  if (!token) return;
  try {
    const r = await fetch(`/api/guess?t=${encodeURIComponent(token)}`);
    if (r.status === 401) { token = ''; store.set('guess.t', ''); return; }
    if (!r.ok) return;
    const { results } = await r.json();
    for (const [d, x] of Object.entries(results || {})) if (!book.days[d]?.done) book.days[d] = { ...x, done: true };
    save();
    for (const [d, x] of Object.entries(book.days)) {
      if (x.done && !(d in (results || {}))) fetch('/api/guess', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: token, day: Number(d), picks: x.picks, won: x.won, cat: x.cat }) }).catch(() => {});
    }
  } catch { /* offline: local record only */ }
}

async function initGuess(params) {
  puzzle = puzzleFor(today(), INDEX);
  if (!puzzle) { $('#guess').hidden = true; return; }
  if (params.get('t')) { token = params.get('t'); store.set('guess.t', token); }
  await pull();
  try { photo = await getPhoto(puzzle.id); } catch { $('#guessLoading').textContent = 'The telescope can’t reach this one right now'; return; }
  // an answer chosen in the daily email
  const g = Number(params.get('g')), a = Number(params.get('a'));
  renderGuess();
  if (params.has('g') && params.has('a')) {
    if (g === puzzle.day) pick(a);
    else $('#guessTries').textContent = 'That puzzle has closed. Here’s today’s';
  }
  $('#guessOpts').addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) pick(Number(b.dataset.i)); });
  $('#guessOpen').addEventListener('click', () => { show(puzzle.id, { mode: 'guess' }); scrollToFeature(); });
  $('#guessShare').addEventListener('click', (e) => {
    const r = record();
    share('Cosmic guess', `A Moment in the Cosmos · Cosmic guess No. ${puzzle.no}\n${shareLine(r)}  ${r.won ? `${r.picks.length}/${TRIES}` : `X/${TRIES}`}`, `${SITE()}#play`, e.currentTarget);
  });
}

// ---------------------------------------------------------------------------------------------
// Your birthday in the cosmos

let DAYS = null;
const loadDays = () => DAYS || (DAYS = fetch('data/onthisday.json').then((r) => r.json()));
const pad = (n) => String(n).padStart(2, '0');

// A small drawing of the Moon's phase: the lit side on the right while waxing, the left while waning.
function moonSvg(lit, waxing) {
  const R = 18, f = lit, rx = (R * Math.abs(1 - 2 * f)).toFixed(2);
  const side = waxing ? 1 : 0;
  const litPath = f > 0.97 ? `<circle r="${R}" class="ml"/>` : f < 0.03 ? ''
    : `<path class="ml" d="M0 ${-R}A${R} ${R} 0 0 ${side} 0 ${R}A${rx} ${R} 0 0 ${f > 0.5 ? side : 1 - side} 0 ${-R}Z"/>`;
  return `<svg class="bday-moon-svg" viewBox="-22 -22 44 44" aria-hidden="true"><circle r="${R}" class="md"/>${litPath}</svg>`;
}

async function showBirthday(m, d, y = null, shared = false) {
  const days = await loadDays();
  const out = $('#bdayOut');
  const label = `${d} ${MONTHS[m - 1]}`;
  $('#bdayTitle').textContent = shared ? `The universe on ${label}` : `The universe on your birthday, ${label}`;
  // a photograph released on that date, or the nearest day either side
  let found = null;
  for (const off of [0, 1, -1, 2, -2, 3, -3]) {
    const dt = new Date(Date.UTC(2024, m - 1, d + off));
    const k = `${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
    const list = (days[k]?.published || []).filter(([, id]) => INDEX_BY_ID[id]);
    const best = list.find(([, id]) => INDEX_BY_ID[id].cat !== 'night') || list[0];
    if (best) { found = { year: best[0], id: best[1], off, day: dt.getUTCDate(), month: dt.getUTCMonth() }; break; }
  }
  if (found) {
    const e = INDEX_BY_ID[found.id];
    const when = found.off === 0 ? `Released on ${shared ? 'this day' : 'your birthday'} in ${found.year}`
      : `Released ${Math.abs(found.off)} ${Math.abs(found.off) === 1 ? 'day' : 'days'} ${found.off > 0 ? 'after' : 'before'}, on ${found.day} ${MONTHS[found.month]} ${found.year}`;
    $('#bdayPhoto').innerHTML = `<button type="button" class="bday-tile" data-id="${esc(e.id)}"><span class="bt-img"><img src="${esc(e.thumb)}" alt="" loading="lazy"></span>
      <span class="bt-text"><span class="bt-k">${esc(when)}</span><strong>${esc(e.title)}</strong><span class="bt-cat">${esc(CAT[e.cat] || '')} · Open the photograph →</span></span></button>`;
    $('#bdayPhoto img').addEventListener('error', (ev) => ev.target.closest('.bt-img').classList.add('none'));
  } else $('#bdayPhoto').innerHTML = '';
  // an event from that date: the one nearest the birth year when there's a choice
  const evs = days[`${pad(m)}-${pad(d)}`]?.events || [];
  const ev = y ? [...evs].sort((a, b) => Math.abs(a.year - y) - Math.abs(b.year - y))[0] : evs[0];
  const yr = (v) => (v < 0 ? `${-v} BC` : v);
  $('#bdayEvent').innerHTML = ev ? `<span class="br-k">On ${esc(label)}, ${yr(ev.year)}</span><p>${esc(ev.text)}</p>` : '';
  $('#bdayEvent').hidden = !ev;
  // the Moon the night you were born
  const canMoon = y && y >= 1800 && y <= 2100;
  if (canMoon) {
    const mo = moonAt(new Date(y, m - 1, d, 21, 0));
    $('#bdayMoon').innerHTML = `${moonSvg(mo.lit, mo.waxing)}<div><span class="br-k">The night you were born</span><p>The Moon was ${mo.phase === 'New moon' || mo.phase === 'Full moon' ? `a ${mo.phase.toLowerCase()}` : `a ${mo.phase.toLowerCase()} moon`}, ${Math.round(mo.lit * 100)}% lit</p></div>`;
  }
  $('#bdayMoon').hidden = !canMoon;
  $('#bdaySky').hidden = !canMoon;
  $('#bdaySky').dataset.date = canMoon ? `${y}-${pad(m)}-${pad(d)}` : '';
  $('#bdayForget').hidden = shared;
  $('#bdayShare').dataset.md = `${pad(m)}-${pad(d)}`;
  if (!shared) document.dispatchEvent(new CustomEvent('birthday:shown'));
  out.hidden = false;
}

function initBirthday(params) {
  const saved = store.get('bday', '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(saved)) { $('#bdayDate').value = saved; const [y, m, d] = saved.split('-').map(Number); showBirthday(m, d, y); }
  const shared = params.get('bday');
  if (/^\d{2}-\d{2}$/.test(shared || '')) { const [m, d] = shared.split('-').map(Number); if (m >= 1 && m <= 12 && d >= 1 && d <= 31) showBirthday(m, d, null, true); }
  $('#bdayForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#bdayDate').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    store.set('bday', v);
    const [y, m, d] = v.split('-').map(Number);
    showBirthday(m, d, y);
  });
  $('#bdayPhoto').addEventListener('click', (e) => {
    const b = e.target.closest('[data-id]');
    if (b) { show(b.dataset.id, { mode: 'birthday', label: $('#bdayTitle').textContent.replace(/^The universe on (your birthday, )?/, '') }); scrollToFeature(); }
  });
  $('#bdaySky').addEventListener('click', (e) => { if (e.currentTarget.dataset.date) openSkyOn(e.currentTarget.dataset.date, 180); });
  $('#bdayShare').addEventListener('click', (e) => share('The universe on my birthday', 'The universe on my birthday, from A Moment in the Cosmos', `${SITE()}?bday=${e.currentTarget.dataset.md}#play`, e.currentTarget));
  $('#bdayForget').addEventListener('click', () => { store.set('bday', ''); $('#bdayDate').value = ''; $('#bdayOut').hidden = true; });
}

// Called once the collection index has loaded.
export async function initPlay() {
  const params = new URLSearchParams(location.search);
  const arrived = ['g', 'a', 't', 'bday'].some((k) => params.has(k));
  if (arrived) history.replaceState(null, '', `${location.pathname}${location.hash || '#play'}`);
  initBirthday(params);
  await initGuess(params);
  if (arrived && location.hash === '#play') document.getElementById('play').scrollIntoView();
}
