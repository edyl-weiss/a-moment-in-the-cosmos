// Midnight-UTC rollover: label in the visitor's local time, and a timer that
// refreshes the archive (and the feature, if it is showing today's photograph).
import { $, nextRollover } from './util.js';
import { state } from './feature.js';
import { renderArchive } from './archive.js';
import { showToday } from './discover.js';

let timer;

export function scheduleRollover() {
  const next = nextRollover();
  const local = new Date(next).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  $('#rollover').textContent = `Next photograph at ${local} (00:00 UTC)`;
  clearTimeout(timer);
  timer = setTimeout(() => {
    renderArchive();
    scheduleRollover();
    if (state.ctx?.mode === 'daily') showToday();
  }, Math.min(next - Date.now() + 2000, 2 ** 31 - 1));
}
