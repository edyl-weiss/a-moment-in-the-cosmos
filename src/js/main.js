// Entry point. Importing a module wires up its own listeners; boot order is below.
import { $, todayIndex, dailyId, dateOf } from './util.js';
import { show, fitFrame } from './feature.js';
import { loadIndex, INDEX } from './collection.js';
import './story.js';
import './understand.js';
import './compare.js';
import './tour.js';
import './viewer.js';
import { renderGrid } from './favorites.js';
import { renderArchive } from './archive.js';
import './discover.js';
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
renderArchive();
renderGrid();
show(dailyId(issue), { mode: 'daily', day: issue }, { push: false });
