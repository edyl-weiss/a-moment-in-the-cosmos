"""Cross-check every photograph's sky position against an independent catalog.

For each photo whose title or search names mention catalogd objects (Messier, NGC, IC), compare the
position we use with the catalog position of the nearest-named object (d3-celestial's deep-sky
catalog, dsos.14.json, and its Messier list). Prints the photos that disagree by more than the
tolerance, and those that name a catalogd object but have no position yet.
Run from the repo root:  python3 tools/sky/check_positions.py [--json out.json]
"""
import json, math, os, re, sys
HERE = os.path.dirname(__file__); ROOT = os.path.join(HERE, '..', '..')
cat = {}
def norm(k): return re.sub(r'\s+', ' ', k.strip().upper())
for f in ('dsos.14.json', 'messier.json'):
    for ft in json.load(open(os.path.join(HERE, f)))['features']:
        lon, lat = ft['geometry']['coordinates']; ra = lon % 360
        p = ft['properties']
        for name in {ft['id'], p.get('desig') or '', p.get('name') or ''}:
            for part in re.split(r'[,;/]', name):
                m = re.match(r'^\s*(M|NGC|IC)\s*0*(\d+)\s*$', part, re.I)
                if m: cat.setdefault(f'{m.group(1).upper()} {int(m.group(2))}', (ra, lat))

def sep(a, b):
    ra1, d1, ra2, d2 = (math.radians(v) for v in (*a, *b))
    c = math.sin(d1) * math.sin(d2) + math.cos(d1) * math.cos(d2) * math.cos(ra1 - ra2)
    return math.degrees(math.acos(max(-1, min(1, c))))

NAME = re.compile(r'\b(?:(Messier|M)\s?(\d{1,3})(?![-\d])|(NGC|IC)\s?(\d{1,4}))\b', re.I)
def names(text):
    out = []
    for m in NAME.finditer(text):
        if m.group(1):
            if m.group(1) == 'M' and not re.search(r'\bM\s?\d', m.group(0)): continue
            n = int(m.group(2))
            if 1 <= n <= 110: out.append(f'M {n}')
        else: out.append(f'{m.group(3).upper()} {int(m.group(4))}')
    return list(dict.fromkeys(out))

idx = json.load(open(os.path.join(ROOT, 'src/data/collection/index.json'), encoding='utf-8'))
from importlib import util as _u
cs = re.search(r'CATALOG_SKY = (\{.*\});', open(os.path.join(ROOT, 'src/data/constellations.js'), encoding='utf-8').read()).group(1)
cat_sky = json.loads(cs)
catalog_src = open(os.path.join(ROOT, 'src/data/catalog.js'), encoding='utf-8').read()
rows = [dict(e) for e in idx]
for cid, title, celestial in re.findall(r"id: '([^']+)'.*?title: '([^']*)'.*?celestial: '([^']*)'", catalog_src, re.S):
    s = cat_sky.get(cid, {})
    rows.append({'id': cid, 'title': title, 'q': celestial, 'ra': s.get('ra'), 'dec': s.get('dec'), 'cat': 'curated'})

TOL = 1.0   # degrees: wide fields and mosaics can be centered off the catalog point
checked = ok = 0; bad = []; fillable = []
for e in rows:
    text = f"{e['title']} {e.get('q', '')}"
    ns = [n for n in names(text) if n in cat]
    if not ns: continue
    if e.get('ra') is None:
        if len(ns) == 1 and e.get('cat') != 'night': fillable.append((e['id'], ns[0], cat[ns[0]]))
        continue
    checked += 1
    d, n = min((sep((e['ra'], e['dec']), cat[n]), n) for n in ns)
    if d <= TOL: ok += 1
    else: bad.append((round(d, 2), e['id'], n, e['title'][:60], (e['ra'], e['dec']), tuple(round(v, 3) for v in cat[n])))
bad.sort(reverse=True)
print(f'catalog objects: {len(cat)}')
print(f'checked {checked} photos against the catalog: {ok} within {TOL}°, {len(bad)} further away')
for b in bad: print('  OFF', b)
print(f'{len(fillable)} photos name exactly one catalogd object but have no position yet')
if '--json' in sys.argv:
    json.dump({'bad': bad, 'fillable': fillable}, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=1)
