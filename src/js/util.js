// Small shared helpers: DOM lookup, escaping, dates, storage, announcements.
import { SCHEDULE } from '../data/schedule.js';
import { makeLineup } from './lineup.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const CAT = { galaxy: 'Galaxy', nebula: 'Nebula', star: 'Star', night: 'Night Sky' };
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const DAY = 86400000;
const LAUNCH = Date.parse(SCHEDULE.launch + 'T00:00:00Z');
export const todayIndex = () => Math.max(0, Math.floor((Date.now() - LAUNCH) / DAY));
export const dateOf = (i) => new Date(LAUNCH + i * DAY);
export const nextRollover = () => LAUNCH + (todayIndex() + 1) * DAY;
export const fmtDate = (d) => d.toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

// The daily lineup (the rules are in lineup.js).
const TRIO_FROM = SCHEDULE.trioFrom ?? Infinity;
export const trioDay = (i) => i >= TRIO_FROM;
export const dailyIds = makeLineup(SCHEDULE);
export const dailyId = (i, slot = 0) => dailyIds(i)[slot] ?? dailyIds(i)[0];
// Where a photograph sits in day i's lineup, or -1.
export const slotOf = (i, id) => dailyIds(i).indexOf(id);
// One step back or forward through every daily photograph in order (day by day, slot by slot), never past today.
export function stepDaily(day, slot, dir) {
  const n = dailyIds(day).length;
  let d = day, s = (slot || 0) + dir;
  if (s < 0) { d--; if (d < 0) return null; s = dailyIds(d).length - 1; }
  else if (s >= n) { d++; s = 0; }
  return d > todayIndex() ? null : { day: d, slot: s };
}

// Yesterday's winner is only announced (on the site and in the email) once at least this many people voted.
export const WINNER_MIN_VOTES = 2;

// Whole-number percentages that add up to 100 (largest remainder), so three shares never show 99% or 101%.
export function shares(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return counts.map(() => 0);
  const raw = counts.map((c) => (c * 100) / total), out = raw.map(Math.floor);
  let left = 100 - out.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - out[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left-- > 0) out[i]++; });
  return out;
}

// Minimum size for any photograph the page features.
export function meetsMinimum(w, h) {
  const long = Math.max(w, h), short = Math.min(w, h);
  if (long / short <= 1.05) return short >= 1440;   // square, within 5%
  return long >= 1920 && short >= 1080;
}

// localStorage can be missing or throw (private modes, blocked site data).
export const store = {
  ok: (() => { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; } catch { return false; } })(),
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }
};

export function say(msg) {
  const live = $('#live');
  live.textContent = '';
  setTimeout(() => { live.textContent = msg; }, 50);
}

export const loadImage = (src) => new Promise((resolve, reject) => {
  const im = new Image();
  im.decoding = 'async';
  im.onload = () => resolve(im);
  im.onerror = () => reject(new Error('the image could not be loaded from its source'));
  im.src = src;
});
