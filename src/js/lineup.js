// Which photographs each day shows. Pure: takes the schedule (data/schedule.js), so tests can pass in a small one.
// tools/harvest/reschedule.py follows exactly the same rules; change both together.
//
// Before trioFrom: one photograph a day, rotating through categoryOrder (day i shows
// order[categoryOrder[i % 4]][floor(i / 4)]).
// From trioFrom: one photograph per slot in trioSlots (a galaxy; a nebula or a star on alternate days; a night sky).
// For each slot, the first of these that has a photograph wins:
//   1. a photograph of the slot's category never shown before, in the category's order;
//   2. one of the slot's category last shown at least RECYCLE_AFTER days ago (the longest-rested first);
//   3. a never-shown photograph borrowed from another category: one not already in the day's lineup if
//      possible, and of those the category with the most left;
//   4. a rested photograph from another category, the longest-rested first;
//   5. whichever photograph has rested longest (only if the collection were tiny).
// So nothing repeats until a category's new photographs run out, and a photograph only comes back after six months.
//
// Days already shown are recorded in schedule.shown (reschedule.py writes them before it changes any list),
// so adding photographs later can never change a day that has passed; the rules continue from there.
export const RECYCLE_AFTER = 183;   // days: about six months

export function makeLineup(S) {
  const T = S.trioFrom ?? Infinity, cats = S.categoryOrder, shown = S.shown || {};
  const catOf = new Map();
  for (const [c, ids] of Object.entries(S.order)) for (const id of ids) catOf.set(id, c);
  const one = (i) => { const c = cats[i % cats.length]; return S.order[c][Math.floor(i / cats.length) % S.order[c].length]; };

  // Replay every day up to the last recorded one: when each photograph was last shown.
  const last = new Map(), ptr = Object.fromEntries(Object.keys(S.order).map((c) => [c, 0]));
  const recorded = Object.keys(shown).map(Number).filter((d) => d >= T).sort((a, b) => a - b);
  const start = recorded.length ? recorded[recorded.length - 1] + 1 : T;
  for (let d = 0; d < Math.min(T, start); d++) last.set(one(d), d);
  for (const d of recorded) for (const id of shown[d]) last.set(id, d);

  const fresh = (c) => {   // the next never-shown photograph of category c, or undefined
    const list = S.order[c];
    while (ptr[c] < list.length && last.has(list[ptr[c]])) ptr[c]++;
    return list[ptr[c]];
  };
  const freshLeft = (c) => { let n = 0; for (let i = ptr[c]; i < S.order[c].length; i++) if (!last.has(S.order[c][i])) n++; return n; };
  const rested = (ids, d, taken) => {   // the longest-rested of ids, rested at least RECYCLE_AFTER days
    let best;
    for (const id of ids) {
      const l = last.get(id);
      if (l === undefined || d - l < RECYCLE_AFTER || taken.has(id)) continue;
      if (best === undefined || l < last.get(best)) best = id;
    }
    return best;
  };

  const days = [];   // days[d - start] = that day's ids, filled in order as needed
  function next() {
    const d = start + days.length, k = d - T, ids = [], cs = [], taken = new Set();
    for (const slot of S.trioSlots) {
      const c = slot[k % slot.length], others = Object.keys(S.order).filter((x) => x !== c);
      let id = fresh(c) ?? rested(S.order[c], d, taken);
      if (id === undefined) {
        const spare = others.filter((x) => fresh(x) !== undefined);
        const pool = spare.filter((x) => !cs.includes(x)).length ? spare.filter((x) => !cs.includes(x)) : spare;
        if (pool.length) id = fresh(pool.reduce((a, b) => (freshLeft(b) > freshLeft(a) ? b : a)));
      }
      if (id === undefined) id = rested(others.flatMap((x) => S.order[x]), d, taken);
      if (id === undefined) id = [...last.keys()].filter((x) => catOf.has(x) && !taken.has(x)).sort((a, b) => last.get(a) - last.get(b))[0];
      ids.push(id); cs.push(catOf.get(id)); taken.add(id);
      last.set(id, d);
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
