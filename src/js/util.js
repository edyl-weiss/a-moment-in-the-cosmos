// Small shared helpers: DOM lookup, escaping, dates, storage, announcements.
import { SCHEDULE } from '../data/schedule.js';

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

export function dailyId(i) {
  const cats = SCHEDULE.categoryOrder;
  const list = SCHEDULE.order[cats[i % cats.length]];
  return list[Math.floor(i / cats.length) % list.length];
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
