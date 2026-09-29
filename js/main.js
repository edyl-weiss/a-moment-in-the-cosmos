// Entry point. Importing a module wires up its own listeners; boot order is below.
import { $, todayIndex, dailyId } from './util.js';
import { paintSky } from './sky.js';
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

paintSky();
new ResizeObserver(fitFrame).observe($('#stage'));
$('#cycleLen').textContent = (SCHEDULE.categoryOrder.length * Math.min(...Object.values(SCHEDULE.order).map((a) => a.length))).toLocaleString('en');
await loadIndex();
$('#collectionCount').textContent = INDEX.length.toLocaleString('en');
scheduleRollover();
renderArchive();
renderGrid();
const day = todayIndex();
show(dailyId(day), { mode: 'daily', day }, { push: false });
