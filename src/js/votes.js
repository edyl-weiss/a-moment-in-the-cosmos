// Today's destinations (the three daily photographs) and Yesterday's winner. From SCHEDULE.trioFrom on, each day brings three photographs
// (a galaxy, a nebula or star, and a night sky); visitors vote for one, and see how everyone voted once
// they have. The next day, the photograph with the most votes is shown as Yesterday's winner.
// Talks to /api/vote. If that isn't available (local preview, storage not connected), the three still
// show and open as usual; only the voting rests.
import { $, esc, CAT, say, store, todayIndex, trioDay, dailyIds, dateOf, fmtDate, shares, WINNER_MIN_VOTES } from './util.js';
import { state, show } from './feature.js';
import { INDEX_BY_ID } from './collection.js';
import { showToday } from './discover.js';
import { reveal } from './router.js';
import { waxSeal } from './passport.js';

// The emblem pressed into the seals: a four-pointed star, on a 24 × 24 grid.
const STAR = '<path d="M12 2.6C12.7 8.2 15.8 11.3 21.4 12C15.8 12.7 12.7 15.8 12 21.4C11.3 15.8 8.2 12.7 2.6 12C8.2 11.3 11.3 8.2 12 2.6Z"/>';

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const toFeature = () => document.querySelector('#feature .dateline')?.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
const LOCAL = 'votes';            // { day: slot } — this browser's picks, so the cards look right before the server answers
const tally = { day: null, counts: null, total: 0, mine: null, live: true, busy: false, error: '' };

// A random id this browser keeps, so a vote can be changed later in the day. The server stores only its hash.
function visitor() {
  let v = store.get('visitor', '');
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(v)) {
    const a = new Uint8Array(12);
    crypto.getRandomValues(a);
    v = [...a].map((b) => b.toString(36).padStart(2, '0')).join('');
    store.set('visitor', v);
  }
  return v;
}

async function api(path, opts) {
  const r = await fetch(path, opts);
  if (!r.ok) throw Object.assign(new Error(String(r.status)), { status: r.status });
  return r.json();
}

const votesLabel = (n) => `${n.toLocaleString('en')} vote${n === 1 ? '' : 's'}`;

// ---------- Today's destinations ----------
const PLATE = ['I', 'II', 'III', 'IV'];   // numbered like the plates in an old almanac

// Percentages tick up to their new value instead of jumping.
function countTo(el, to) {
  const from = Number(el.dataset.v || 0);
  el.dataset.v = to;
  if (calm() || from === to) { el.textContent = `${to}%`; return; }
  const t0 = performance.now(), dur = 700;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - (1 - k) ** 3;
    el.textContent = `${Math.round(from + (to - from) * e)}%`;
    if (k < 1 && Number(el.dataset.v) === to) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// A few small stars scatter from the button when a vote is cast.
function sparkle(btn) {
  if (calm()) return;
  const r = btn.getBoundingClientRect();
  for (let i = 0; i < 7; i++) {
    const s = document.createElement('span');
    const a = (Math.PI * 2 * i) / 7 + Math.random() * 0.6, d = 26 + Math.random() * 22;
    s.className = 'vote-spark';
    s.textContent = '✦';
    s.style.cssText = `left:${r.left + 22}px;top:${r.top + r.height / 2}px;--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px;--s:${0.5 + Math.random() * 0.6};animation-delay:${i * 18}ms`;
    document.body.append(s);
    setTimeout(() => s.remove(), 900);
  }
}
function renderCards() {
  const day = tally.day, ids = dailyIds(day);
  $('#trioCards').innerHTML = ids.map((id, slot) => {
    const e = INDEX_BY_ID[id] || { title: 'A photograph', cat: '' };
    return `<li class="trio-card" data-slot="${slot}" data-cat="${esc(e.cat)}">
      <button class="trio-open" type="button" aria-label="Open ${esc(e.title)}">
        <span class="trio-thumb">${e.thumb ? `<img src="${esc(e.thumb)}" alt="" decoding="async">` : ''}<span class="trio-now" aria-hidden="true">Showing</span></span>
        <span class="trio-cat"><span class="trio-no" aria-hidden="true">${PLATE[slot] || ''}</span>${esc(CAT[e.cat] || '')}</span>
        <span class="trio-title">${esc(e.title)}</span>
      </button>
      <div class="trio-vote">
        <button class="trio-btn" type="button" aria-pressed="false"><span class="trio-star" aria-hidden="true">✦</span> <span class="trio-btn-t">Vote</span></button>
        <span class="trio-result" hidden><span class="trio-bar"><span></span></span><span class="trio-pct">0%</span><span class="trio-lead" aria-hidden="true">Leading</span></span>
      </div>
    </li>`;
  }).join('');
  $('#trioCards').querySelectorAll('.trio-card').forEach((li) => {
    const slot = Number(li.dataset.slot);
    li.querySelector('.trio-open').addEventListener('click', () => {
      showToday(slot);
      toFeature();
    });
    li.querySelector('.trio-btn').addEventListener('click', (ev) => { if (tally.mine !== slot && tally.live && !tally.busy) sparkle(ev.currentTarget); vote(slot); });
    li.querySelector('img')?.addEventListener('error', (e) => e.target.remove());
  });
  paint();
}

function paint() {
  const cards = [...$('#trioCards').querySelectorAll('.trio-card')];
  const voted = tally.mine !== null, pct = tally.counts ? shares(tally.counts) : null;
  const lead = tally.counts ? Math.max(...tally.counts) : 0;
  cards.forEach((li, slot) => {
    const mine = tally.mine === slot, btn = li.querySelector('.trio-btn');
    const title = li.querySelector('.trio-title').textContent;
    li.classList.toggle('is-mine', mine);
    const seal = li.querySelector('.trio-seal');
    if (mine && !seal) li.querySelector('.trio-thumb').insertAdjacentHTML('beforeend', `<span class="trio-seal" aria-hidden="true">${waxSeal(`pick-${tally.day}-${slot}`, '#a4282f', STAR)}</span>`);
    else if (!mine) seal?.remove();
    li.classList.toggle('is-lead', Boolean(pct && lead && tally.counts[slot] === lead));
    btn.setAttribute('aria-pressed', String(mine));
    btn.disabled = !tally.live || tally.busy;
    li.querySelector('.trio-btn-t').textContent = mine ? 'Your pick' : voted ? 'Switch' : 'Vote';
    btn.setAttribute('aria-label', mine ? `Your pick: ${title}` : voted ? `Switch your vote to ${title}` : `Vote for ${title}`);
    const res = li.querySelector('.trio-result');
    res.hidden = !pct;
    if (pct) {
      const bar = res.querySelector('.trio-bar span');
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = `${pct[slot]}%`; }));   // a frame after unhiding, so it fills from empty
      countTo(res.querySelector('.trio-pct'), pct[slot]);
      res.setAttribute('aria-label', `${pct[slot]} percent of ${votesLabel(tally.total)}`);
    }
  });
  markShowing();
  const note = $('#trioNote');
  note.textContent = tally.error || (!tally.live ? 'Voting is taking a short break. Today’s destinations are all here to enjoy in the meantime'
    : voted && tally.counts ? `${votesLabel(tally.total)} so far. You can change your pick until midnight UTC, and the winner goes up tomorrow`
    : 'Pick your favorite to see how everyone else voted');
  syncFeatureButton();
}

function markShowing() {
  const today = state.ctx?.mode === 'daily' && state.ctx.day === tally.day;
  $('#trioCards').querySelectorAll('.trio-card').forEach((li) => li.classList.toggle('is-showing', today && Number(li.dataset.slot) === state.ctx.slot));
}

// "Vote for this one" beside the photograph, when one of today's three is showing.
function syncFeatureButton() {
  const b = $('#voteBtn');
  const slot = state.ctx?.mode === 'daily' && state.ctx.day === tally.day && trioDay(tally.day) ? state.ctx.slot : null;
  b.hidden = slot == null || !tally.live;
  if (b.hidden) return;
  const mine = tally.mine === slot;
  b.setAttribute('aria-pressed', String(mine));
  b.disabled = tally.busy;
  $('#voteText').textContent = mine ? 'Your pick' : 'Vote for this one';
}

async function vote(slot) {
  if (!tally.live || tally.busy || tally.mine === slot) return;
  const before = { mine: tally.mine, counts: tally.counts && [...tally.counts], total: tally.total };
  if (tally.counts) {                     // optimiztic: move the vote now, correct it when the server answers
    if (tally.mine !== null) tally.counts[tally.mine]--;
    else tally.total++;
    tally.counts[slot]++;
  }
  tally.mine = slot; tally.busy = true; tally.error = '';
  paint();
  try {
    const r = await api('/api/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day: tally.day, slot, v: visitor() }) });
    Object.assign(tally, { counts: r.counts, total: r.total, mine: r.mine });
    store.set(LOCAL, { [tally.day]: slot });
    const title = INDEX_BY_ID[dailyIds(tally.day)[slot]]?.title || 'that photograph';
    say(`Vote counted for ${title}`);
  } catch (e) {
    Object.assign(tally, before);
    tally.error = e.status === 429 ? 'Lots of votes have come from your network today, so this one couldn’t be counted'
      : e.status === 400 ? '' : 'Your vote didn’t go through. Try again in a moment';
    if (e.status === 400) return initVotes();   // the day turned over while the page was open: load the new three
  } finally {
    tally.busy = false;
    paint();
  }
}

async function loadTrio() {
  const day = todayIndex();
  const box = $('#trio');
  box.hidden = !trioDay(day);
  if (!trioDay(day)) return;
  const local = store.get(LOCAL, {});
  Object.assign(tally, { day, counts: null, total: 0, mine: Number.isInteger(local[day]) ? local[day] : null, live: true, busy: false, error: '' });
  $('#trioDate').textContent = fmtDate(dateOf(day));
  renderCards();
  try {
    const r = await api(`/api/vote?day=${day}&v=${visitor()}`);
    if (tally.day !== day) return;
    Object.assign(tally, { counts: r.counts, total: r.total, mine: r.mine ?? null });
  } catch { tally.live = false; }
  paint();
}

// ---------- Yesterday's winner ----------
async function loadWinner() {
  const sec = $('#winner'), day = todayIndex() - 1;
  sec.dataset.empty = '';
  sec.hidden = true;
  if (day < 0 || !trioDay(day)) return;
  let r;
  try { r = await api(`/api/vote?day=${day}`); } catch { return; }
  if (!r.counts || r.total < WINNER_MIN_VOTES) return;
  const ids = dailyIds(day), pct = shares(r.counts), top = Math.max(...r.counts);
  const winners = ids.map((id, slot) => ({ id, slot, n: r.counts[slot], pct: pct[slot], e: INDEX_BY_ID[id] })).filter((x) => x.e);
  const won = winners.filter((x) => x.n === top), rest = winners.filter((x) => x.n !== top).sort((a, b) => b.n - a.n);
  const lead = won[0];
  if (!lead) return;
  const tie = won.length > 1;
  $('#winnerHead').textContent = tie ? 'Yesterday’s winners' : 'Yesterday’s winner';
  $('#winnerSub').textContent = tie ? `A tie! ${won.length === 3 ? 'All three' : 'Two photographs'} drew the same number of votes`
    : `${votesLabel(r.total)} cast on ${fmtDate(dateOf(day))}, and this one came out on top`;
  const card = (x, big) => `<button class="win-card${big ? ' big' : ''}" type="button" data-id="${esc(x.id)}" data-slot="${x.slot}" aria-label="Open ${esc(x.e.title)}, ${x.pct} percent of the vote">
      <span class="win-thumb">${x.e.thumb ? `<img src="${esc(x.e.thumb)}" alt="" loading="lazy" decoding="async">` : ''}${big ? `<span class="win-seal" aria-hidden="true">${waxSeal(`win-${day}-${x.slot}`, '#b8841f', STAR, { label: 'WINNER' })}</span>` : ''}</span>
      <span class="win-meta"><span class="win-cat">${esc(CAT[x.e.cat] || '')}</span><strong>${esc(x.e.title)}</strong>
      <span class="win-n"><span class="win-pct" data-to="${x.pct}">${x.pct}%</span> ${votesLabel(x.n)}</span></span></button>`;
  $('#winnerBody').innerHTML = `<div class="win-top${tie ? ' tie' : ''}">${won.map((x) => card(x, true)).join('')}</div>` +
    (rest.length ? `<div class="win-rest"><p class="win-rest-h">Also in the running</p>${rest.map((x) => card(x, false)).join('')}</div>` : '');
  $('#winnerBody').querySelectorAll('.win-card').forEach((b) => b.addEventListener('click', () => {
    show(b.dataset.id, { mode: 'winner', day, slot: Number(b.dataset.slot), won: won.some((x) => x.id === b.dataset.id) });
    toFeature();
  }));
  $('#winnerBody').querySelectorAll('img').forEach((im) => im.addEventListener('error', () => im.remove()));
  revealWinner();
  reveal(sec);
}

document.addEventListener('photo:change', () => { if (trioDay(todayIndex())) { markShowing(); syncFeatureButton(); } });
$('#voteBtn').addEventListener('click', (ev) => { if (state.ctx?.slot == null) return; if (tally.mine !== state.ctx.slot && tally.live) sparkle(ev.currentTarget); vote(state.ctx.slot); });
document.addEventListener('day:change', () => initVotes());

// The winner arrives when it scrolls into view: the seal presses down and the big share counts up.
let winIO;
function revealWinner() {
  const box = $('#winnerBody');
  if (calm() || !('IntersectionObserver' in window)) { box.classList.add('in'); return; }
  box.classList.remove('in');
  box.querySelectorAll('.win-card.big .win-pct').forEach((el) => { el.dataset.v = 0; el.textContent = '0%'; });
  winIO?.disconnect();
  winIO = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    winIO.disconnect();
    box.classList.add('in');
    box.querySelectorAll('.win-card.big .win-pct').forEach((el) => setTimeout(() => countTo(el, Number(el.dataset.to)), 250));
  }, { threshold: 0.35 });
  winIO.observe(box);
}

// A slight tilt toward the pointer on the cards' photographs, with a soft glare that follows it.
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cards = $('#trioCards');
  let frame = 0;
  cards.addEventListener('pointermove', (e) => {
    const th = e.target.closest?.('.trio-thumb');
    if (!th || calm() || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; });
    const r = th.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    th.style.setProperty('--rx', `${((0.5 - y) * 5).toFixed(2)}deg`);
    th.style.setProperty('--ry', `${((x - 0.5) * 6).toFixed(2)}deg`);
    th.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
    th.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    th.classList.add('tilt');
  });
  cards.addEventListener('pointerout', (e) => {
    const th = e.target.closest?.('.trio-thumb');
    if (th && !th.contains(e.relatedTarget)) { th.classList.remove('tilt'); th.style.removeProperty('--rx'); th.style.removeProperty('--ry'); }
  });
}

export function initVotes() {
  loadTrio();
  loadWinner();
}
