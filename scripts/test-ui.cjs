// Browser smoke test: every page loads without script errors, and the daily vote works end to end.
// The vote API and the observatories' images are stood in for, and the clock is fixed a few days into the
// daily three. Needs Playwright (npm i -D playwright, then npx playwright install chromium) and a build:
//   node build.mjs && node scripts/serve.mjs dist &   then   node scripts/test-ui.cjs [http://localhost:4173]
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const BASE = process.argv[2] || 'http://localhost:4173';
// a stand-in for every remote image, large enough to pass the site's minimum-size check
const IMAGE = '<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600"><rect width="100%" height="100%" fill="#123"/><circle cx="1200" cy="800" r="400" fill="#c46"/></svg>';

async function page(b, hash = '', width = 1280, yesterday = [41, 87, 22]) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.clock.setFixedTime(new Date('2026-10-25T15:00:00Z'));   // day 26; yesterday had three too
  const db = { 25: yesterday, 26: [5, 9, 3] }; let mine = null;
  await p.route('**/api/vote**', (r) => {
    if (r.request().method() === 'POST') {
      const { slot } = JSON.parse(r.request().postData());
      if (mine !== null) db[26][mine]--; db[26][slot]++; mine = slot;
      return r.fulfill({ json: { day: 26, counts: db[26], total: db[26].reduce((a, c) => a + c), mine } });
    }
    const d = Number(new URL(r.request().url()).searchParams.get('day'));
    return r.fulfill({ json: { day: d, counts: d < 26 || mine !== null ? db[d] : null, total: db[d].reduce((a, c) => a + c), mine: d === 26 ? mine : null } });
  });
  await p.route('**/api/react**', (r) => r.fulfill({ json: { week: 'x', count: 1, items: ['w-WR140a', 'e-wr124', 'e-eso1238a'].map((id) => ({ id, count: 3 })) } }));
  await p.route('**/api/{geo,guess,guess-tally}**', (r) => r.fulfill({ status: 503, body: '{}' }));
  await p.route((u) => !u.href.startsWith(BASE), (r) => r.fulfill({ body: IMAGE, contentType: 'image/svg+xml' }));
  await p.goto(BASE + '/' + hash, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  return { p, errors };
}

const checks = [];
const check = (name, fn) => checks.push([name, fn]);

for (const [hash, w] of [['', 1280], ['', 390], ['#sky', 1280], ['#passport', 1280], ['#about', 390], ['#on-03-14', 1280], ['#e-eso1838a', 1280]])
  check(`${hash || 'home'} at ${w}px loads without script errors`, async (b) => {
    const { p, errors } = await page(b, hash, w);
    assert.deepEqual(errors, []);
    await p.close();
  });

check('sections from the home page stay off other pages', async (b) => {
  const { p } = await page(b, '#passport');
  for (const id of ['loved', 'winner', 'feature']) assert.equal(await p.$eval(`#${id}`, (e) => e.hidden), true, `#${id} shows on #passport`);
  await p.close();
});

check('voting: results appear, the seal is pressed, and a vote can be switched', async (b) => {
  const { p, errors } = await page(b);
  assert.equal(await p.$$eval('.trio-card', (l) => l.length), 3);
  assert.equal(await p.isVisible('.trio-result'), false, 'results show before voting');
  await p.click('.trio-card[data-slot="1"] .trio-btn');
  await p.waitForTimeout(1500);   // the share counts up
  assert.equal(await p.textContent('.trio-card[data-slot="1"] .trio-btn-t'), 'Your pick');
  assert.equal(await p.$$eval('.trio-seal', (l) => l.length), 1);
  assert.equal(await p.textContent('.trio-card[data-slot="1"] .trio-pct'), '55%');   // 10 of 18: 5 · 9 · 3 plus this vote
  await p.click('.trio-card[data-slot="2"] .trio-btn');
  await p.waitForTimeout(900);
  assert.equal(await p.$eval('.trio-seal', (e) => e.closest('.trio-card').dataset.slot), '2');
  assert.match(await p.textContent('#trioNote'), /18 votes so far/);
  assert.deepEqual(errors, []);
  await p.close();
});

check('a card opens below, the feature offers the vote, and Previous steps through the three', async (b) => {
  const { p } = await page(b);
  await p.click('.trio-card[data-slot="2"] .trio-open');
  await p.waitForTimeout(1000);
  assert.equal(await p.textContent('#whenLabel'), 'Today’s night sky');
  assert.equal(await p.isVisible('#voteBtn'), true);
  await p.click('#prevBtn'); await p.waitForTimeout(800);
  assert.match(await p.textContent('#whenLabel'), /^Today’s (nebula|star)$/);
  await p.close();
});

check('Yesterday’s winner shows the photograph with the most votes', async (b) => {
  const { p } = await page(b);
  await p.$eval('#winner', (e) => e.scrollIntoView());
  await p.waitForTimeout(1600);
  assert.equal(await p.$eval('#winner', (e) => e.hidden), false);
  assert.equal(await p.$eval('.win-card.big', (e) => e.dataset.slot), '1');
  assert.equal(await p.textContent('.win-card.big .win-pct'), '58%');
  await p.close();
});

check('Yesterday’s winner stays hidden when only one person voted', async (b) => {
  const { p } = await page(b, '', 1280, [0, 1, 0]);
  assert.equal(await p.$eval('#winner', (e) => e.hidden), true);
  await p.close();
});

(async () => {
  const b = await chromium.launch();
  let failed = 0;
  for (const [name, fn] of checks) {
    try { await fn(b); console.log(`ok   ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n     ${e.message.split('\n').slice(0, 6).join(' ')}`); }
  }
  await b.close();
  console.log(failed ? `\n${failed} failed` : '\nall passed');
  process.exit(failed ? 1 : 0);
})();
