// Unit tests that need nothing but Node: the daily lineup, vote shares, and the vote API against an
// in-memory stand-in for Redis.   npm test
import assert from 'node:assert/strict';
// A fixed "now", a few days into the daily three, so the tests don't depend on when they run.
const NOW = Date.parse('2026-10-25T15:00:00Z');
Date.now = () => NOW;
import { dailyIds, dailyId, trioDay, stepDaily, shares } from '../src/js/util.js';
import { SCHEDULE } from '../src/data/schedule.js';
import { makeLineup } from '../src/js/lineup.js';

let failed = 0;
const test = async (name, fn) => { try { await fn(); console.log(`ok   ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}\n     ${e.message}`); } };

// ---------- the lineup ----------
// Days already shown must never change: this is the archive. (Extend the list as days pass; never edit it.)
const SHOWN = ['weic2216b', 'weic2208a', 'potw1222a', 'heic1509a', 'heic0515a', 'heic0506a', 'uhd_img4255pc_bt_cc', 'weic2316a',
  'weic2205a', 'weic2426a', 'potw1217a', 'heic0715a', 'heic1307a', 'heic0602a', 'n-baobabs', 'w-weic2617a', 'w-weic2616a',
  'w-weic2612a', 'e-potw2626a', 'w-weic2611a', 'w-potm2607a', 'w-weic2615a'];
await test('days already shown keep their photographs', () => SHOWN.forEach((id, d) => assert.deepEqual(dailyIds(d), [id], `day ${d}`)));
await test('one photograph a day before trioFrom, three after', () => {
  assert.equal(dailyIds(SCHEDULE.trioFrom - 1).length, 1);
  assert.equal(dailyIds(SCHEDULE.trioFrom).length, 3);
  assert.ok(!trioDay(SCHEDULE.trioFrom - 1) && trioDay(SCHEDULE.trioFrom));
});
await test('each slot shows its own kind: galaxy, nebula or star, night sky', async () => {
  const cat = Object.fromEntries(Object.entries(SCHEDULE.order).flatMap(([c, ids]) => ids.map((id) => [id, c])));
  for (let d = SCHEDULE.trioFrom; d < SCHEDULE.trioFrom + 60; d++) {
    const [g, m, n] = dailyIds(d).map((id) => cat[id]);
    assert.equal(g, 'galaxy'); assert.equal(n, 'night');
    assert.equal(m, (d - SCHEDULE.trioFrom) % 2 ? 'star' : 'nebula', `day ${d}`);
  }
});
await test('no photograph repeats within the first year', () => {
  const seen = new Map();
  for (let d = 0; d < 365; d++) for (const id of dailyIds(d)) { assert.ok(!seen.has(id), `${id} on day ${seen.get(id)} and ${d}`); seen.set(id, d); }
});
// A small made-up schedule, so running out of photographs can be tested.
const TINY = { trioFrom: 2, categoryOrder: ['nebula', 'galaxy', 'night', 'star'], trioSlots: [['galaxy'], ['nebula', 'star'], ['night']],
  order: { nebula: ['n1', 'n2', 'n3', 'n4'], galaxy: ['g1', 'g2', 'g3', 'g4', 'g5'], night: ['s1', 's2'], star: ['x1', 'x2', 'x3'] } };
await test('a category that runs out borrows from one that has photographs left', () => {
  const ids = makeLineup(TINY), all = [];
  for (let d = 0; d < 6; d++) all.push(...ids(d));
  // day 0 n1, day 1 g1; then three a day. Night has only two, so from day 3 its slot borrows.
  assert.deepEqual(ids(2), ['g2', 'n2', 's1']);
  assert.deepEqual(ids(3), ['g3', 'x1', 's2']);
  assert.deepEqual(ids(4), ['g4', 'n3', 'x2']);   // night is out: borrows star, the category with most left not already in the lineup
  assert.equal(new Set(all).size, all.length, `a photograph repeated before every list ran out: ${all}`);
});
await test('lists start over only when every category has run out', () => {
  const ids = makeLineup(TINY), seen = [];
  let d = 0;
  for (; seen.length < 14; d++) seen.push(...ids(d));
  assert.equal(new Set(seen.slice(0, 14)).size, 14, 'all 14 photographs appear once before any repeats');
});
await test('recorded days never change when photographs are added later', () => {
  const before = makeLineup(TINY);
  const shown = Object.fromEntries([2, 3, 4].map((d) => [d, before(d)]));
  const grown = { ...TINY, shown, order: { ...TINY.order, night: ['s1', 's2', 's3', 's4'] } };
  const after = makeLineup(grown);
  for (const d of [2, 3, 4]) assert.deepEqual(after(d), before(d), `day ${d}`);
  assert.deepEqual(after(5)[2], 's3', 'from the next day on, the new night photographs are used');
});
await test('Previous and Next walk every daily photograph in order', () => {
  const T = SCHEDULE.trioFrom;
  assert.deepEqual(stepDaily(T, 0, -1), { day: T - 1, slot: 0 });
  assert.deepEqual(stepDaily(T - 1, 0, 1), { day: T, slot: 0 });
  assert.deepEqual(stepDaily(T, 2, 1), { day: T + 1, slot: 0 });
  assert.equal(stepDaily(0, 0, -1), null);
  assert.equal(dailyId(T, 2), dailyIds(T)[2]);
});
await test('vote shares are whole numbers that add up to 100', () => {
  for (const c of [[1, 1, 1], [5, 9, 3], [0, 0, 0], [87, 41, 22], [1, 0, 0], [333, 333, 334]]) {
    const s = shares(c);
    assert.equal(s.reduce((a, b) => a + b, 0), c.some(Boolean) ? 100 : 0, String(c));
    s.forEach((p, i) => assert.ok(Math.abs(p - (100 * c[i]) / (c.reduce((a, b) => a + b, 0) || 1)) < 1, `${c} → ${s}`));
  }
});

// ---------- the vote API, with Redis replaced by a small in-memory version ----------
const db = new Map();
const hash = (k) => db.get(k) || (db.set(k, new Map()), db.get(k));
const flat = (k) => [...hash(k)].flat().map(String);
const run = ([cmd, ...a]) => {
  switch (cmd) {
    case 'HGET': return hash(a[0]).has(a[1]) ? String(hash(a[0]).get(a[1])) : null;
    case 'HGETALL': return flat(a[0]);
    case 'INCR': { const v = (Number(db.get(a[0])) || 0) + 1; db.set(a[0], v); return v; }
    case 'EXPIRE': return 1;
    case 'EVAL': {   // the vote script in api/_votes.js: same steps, run as one
      const [, , voters, tally, who, slot] = a;
      const before = hash(voters).has(who) ? String(hash(voters).get(who)) : null;
      hash(voters).set(who, slot);
      if (before !== slot) {
        if (before !== null) hash(tally).set(before, (Number(hash(tally).get(before)) || 0) - 1);
        hash(tally).set(slot, (Number(hash(tally).get(slot)) || 0) + 1);
      }
      return flat(tally);
    }
    default: throw new Error(`fake redis: ${cmd}`);
  }
};
globalThis.fetch = async (url, opts) => ({ ok: true, json: async () => JSON.parse(opts.body).map((c) => ({ result: run(c) })) });
process.env.KV_REST_API_URL = 'https://fake.upstash.io'; process.env.KV_REST_API_TOKEN = 'x';
const { default: vote } = await import('../api/vote.js');
const { todayIndex } = await import('../src/js/util.js');
const call = async (method, data, ip = '1.1.1.1') => {
  let status = 200, json;
  const res = { setHeader() {}, status(s) { status = s; return this; }, json(j) { json = j; return this; } };
  await vote({ method, body: method === 'POST' ? data : undefined, query: method === 'GET' ? data : {}, headers: { 'x-forwarded-for': ip } }, res);
  return { status, json };
};
const today = todayIndex();
{
  await test('vote API: counts are hidden until you vote, and a switched vote moves, not doubles', async () => {
    db.clear();
    let r = await call('GET', { day: today, v: 'visitor-aaaa' });
    assert.equal(r.json.counts, null);
    r = await call('POST', { day: today, slot: 1, v: 'visitor-aaaa' });
    assert.deepEqual(r.json.counts, [0, 1, 0]);
    r = await call('POST', { day: today, slot: 2, v: 'visitor-aaaa' });
    assert.deepEqual(r.json.counts, [0, 0, 1]);
    r = await call('GET', { day: today, v: 'visitor-aaaa' });
    assert.equal(r.json.mine, 2);
  });
  await test('vote API: refuses other days, bad slots, and the ninth new vote from one network', async () => {
    db.clear();
    assert.equal((await call('POST', { day: today - 1, slot: 0, v: 'visitor-aaaa' })).status, 400);
    assert.equal((await call('POST', { day: today, slot: 3, v: 'visitor-aaaa' })).status, 400);
    assert.equal((await call('POST', { day: today, slot: 0, v: 'x' })).status, 400);
    for (let i = 0; i < 8; i++) assert.equal((await call('POST', { day: today, slot: 0, v: `visitor-${i}xxxx` }, '9.9.9.9')).status, 200);
    assert.equal((await call('POST', { day: today, slot: 0, v: 'visitor-9xxxx' }, '9.9.9.9')).status, 429);
    assert.equal((await call('POST', { day: today, slot: 1, v: 'visitor-0xxxx' }, '9.9.9.9')).status, 200, 'switching is not a new vote');
  });
}

if (failed) { console.log(`\n${failed} failed`); process.exit(1); }
console.log('\nall passed');
