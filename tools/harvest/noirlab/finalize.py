#!/usr/bin/env python3
"""reviewed*.json (eye-checked picks) -> selected.json: one photo per object, category caps, best first."""
import json, re, sys, collections, glob

CAPS = {'galaxy': 120, 'nebula': 80, 'star': 45, 'night': 40}
picks = [o for f in sorted(glob.glob('reviewed*.json')) for o in json.load(open(f))]
norm = lambda n: re.sub(r'^(messier |m)(\d+)$', r'm\2', re.sub(r'\s+', ' ', n.strip().lower()))
seen, out, why = set(), [], collections.Counter()
for o in sorted(picks, key=lambda o: (o['dupOf'] is not None, -o['score'])):   # objects new to the site first
    key = None if o['cat'] == 'night' else norm(o['name'])
    if key and key in seen: why['same object twice'] += 1; continue
    if sum(1 for x in out if x['cat'] == o['cat']) >= CAPS[o['cat']]: why[f"{o['cat']} cap"] += 1; continue
    if key: seen.add(key)
    out.append(o)
json.dump(out, open('selected.json', 'w'), ensure_ascii=False)
print(len(out), collections.Counter(o['cat'] for o in out), dict(why),
      'also in collection:', sum(1 for o in out if o['dupOf']))
