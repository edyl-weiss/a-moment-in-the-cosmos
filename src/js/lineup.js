// Which photographs each day shows. Pure: takes the schedule (data/schedule.js), so tests can pass in a small one.
// tools/harvest/reschedule.py follows exactly the same rules; change both together.
//
// Before trioFrom: one photograph a day, rotating through categoryOrder (day i shows
// order[categoryOrder[i % 4]][floor(i / 4)]).
// From trioFrom: one photograph per slot in trioSlots (a galaxy; a nebula or a star on alternate days; a night sky).
// Each category walks its own list in order, so nothing repeats while a list lasts. When a slot's category
// has run out of photographs not yet shown, the slot borrows from another category that still has some:
// one not already in that day's lineup if possible, and of those the one with the most left. Only when every
// category has run out do lists start over from the top.
//
// Days already shown are recorded in schedule.shown (reschedule.py writes them before it changes any list),
// so adding photographs later can never change a day that has passed; the rules continue from there.
export function makeLineup(S) {
  const T = S.trioFrom ?? Infinity, cats = S.categoryOrder, shown = S.shown || {};
  const catOf = new Map();
  for (const [c, ids] of Object.entries(S.order)) for (const id of ids) catOf.set(id, c);
  const one = (i) => { const c = cats[i % cats.length]; return S.order[c][Math.floor(i / cats.length) % S.order[c].length]; };

  // The state just after the last recorded day: how far each category's list has been used.
  const recorded = Object.keys(shown).map(Number).filter((d) => d >= T).sort((a, b) => a - b);
  const start = recorded.length ? recorded[recorded.length - 1] + 1 : T;
  const used = Object.fromEntries(Object.keys(S.order).map((c) => [c, 0]));
  for (let d = 0; d < Math.min(T, start); d++) used[cats[d % cats.length]]++;
  for (const d of recorded) for (const id of shown[d]) if (catOf.has(id)) used[catOf.get(id)]++;
  const days = [];   // days[d - start] = that day's ids, filled in order as needed

  function next() {
    const k = start + days.length - T, ids = [], picked = new Set();
    for (const slot of S.trioSlots) {
      let c = slot[k % slot.length];
      const left = (x) => S.order[x].length - used[x];
      if (left(c) <= 0) {
        const spare = Object.keys(S.order).filter((x) => left(x) > 0);
        const fresh = spare.filter((x) => !picked.has(x));
        const pool = fresh.length ? fresh : spare;
        if (pool.length) c = pool.reduce((a, b) => (left(b) > left(a) ? b : a));
      }
      const list = S.order[c];
      ids.push(list[used[c] % list.length]);
      used[c]++;
      picked.add(c);
    }
    days.push(ids);
  }

  return function ids(i) {
    if (i < T) return [one(i)];
    if (shown[i]) return shown[i];
    if (i < start) return [];   // a gap in the record can't happen; never invent a past day
    while (days.length <= i - start) next();
    return days[i - start];
  };
}
