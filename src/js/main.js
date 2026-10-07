// Entry point. Importing a module wires up its own listeners; boot order is below.
import './router.js';
import { inject } from './vendor/vercel-analytics.js';
import { $, todayIndex, dailyId, dateOf } from './util.js';
import { show, fitFrame } from './feature.js';
import { loadIndex, INDEX } from './collection.js';
import './story.js';
import './understand.js';
import './compare.js';
import './tour.js';
import './viewer.js';
import { renderGrid } from './favorites.js';
import { renderArchive, initArchiveSearch } from './archive.js';
import { openFromHash } from './links.js';
import './download.js';
import { initOnThisDay } from './onthisday.js';
import './discover.js';
import './motion.js';
import { scheduleRollover } from './rollover.js';
import { SCHEDULE } from '../data/schedule.js';

const issue = todayIndex();
$('#issueNo').textContent = `No. ${(issue + 1).toLocaleString('en')}`;
$('#issueDate').textContent = dateOf(issue).toLocaleDateString('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
new ResizeObserver(fitFrame).observe($('#stage'));
$('#cycleLen').textContent = (SCHEDULE.categoryOrder.length * Math.min(...Object.values(SCHEDULE.order).map((a) => a.length))).toLocaleString('en');
await loadIndex();
$('#collectionCount').textContent = INDEX.length.toLocaleString('en');
scheduleRollover();
initArchiveSearch();
renderArchive();
renderGrid();
await initOnThisDay();
// A shared link (#photo-id or #on-MM-DD) opens that view; otherwise today's photograph.
const linkedPhoto = location.hash && openFromHash({ scroll: true });
if (!linkedPhoto || /^#on-/.test(location.hash)) show(dailyId(issue), { mode: 'daily', day: issue }, { push: false });

// Vercel Web Analytics: page views, counted only on the live site (the script is served by Vercel).
if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) inject();
