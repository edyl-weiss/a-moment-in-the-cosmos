"""Sky map data. Run from the repo root after the collection changes:  python3 tools/sky/build_sky.py

1. Writes src/data/sky.json: the 88 constellations (stick figure, boundary, centre) and the stars
   down to magnitude 5, from d3-celestial (BSD licence, Olaf Frohn; see LICENSE-d3-celestial).
2. Adds a "sky" field to each photo record: {"con": "Ori", "ra": deg, "dec": deg} where the source
   archive published a position, or just {"con": ...} where it only named the constellation.
   Positions come from the crawl files in tools/harvest (the archives' own "Position (RA/Dec)").
3. Adds "con" to index.json entries so the archive can browse by constellation.
Idempotent: re-running rewrites the same fields.
"""
import json, glob, re, os
HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, '..', '..')
COL = os.path.join(ROOT, 'src/data/collection')
def load(n):
    # Serpens comes in two pieces that share the id "Ser"; call them Ser1 (Caput) and Ser2 (Cauda).
    fs = json.load(open(os.path.join(HERE, n), encoding='utf-8'))['features']; seen = 0
    for f in fs:
        if f['id'] == 'Ser': seen += 1; f['id'] = f'Ser{seen}'
    return fs

R = lambda v: round(v, 2)
def pts(c): return [[R(x), R(y)] for x, y in c]

cons, abbr_by_name = {}, {}
for f in load('constellations.json'):
    p = f['properties']; a = f['id']
    cons[a] = {'n': p['name'], 'c': [R(v) for v in f['geometry']['coordinates']]}
    abbr_by_name[p['name'].lower()] = a
abbr_by_name['serpens'] = 'Ser1'; abbr_by_name['bootes'] = abbr_by_name['boötes']
for f in load('constellations.lines.json'): cons[f['id']]['l'] = [pts(s) for s in f['geometry']['coordinates']]
bounds = {}
for f in load('constellations.bounds.json'):
    ring = f['geometry']['coordinates'][0]; bounds[f['id']] = ring; cons[f['id']]['b'] = pts(ring)
stars = [[R(*f['geometry']['coordinates'][:1]), R(f['geometry']['coordinates'][1]), f['properties']['mag']]
         for f in load('stars.6.json') if f['properties']['mag'] <= 5.0]
json.dump({'con': cons, 'stars': stars}, open(os.path.join(ROOT, 'src/data/sky.json'), 'w'), separators=(',', ':'), ensure_ascii=False)

def lon(ra_deg): return ra_deg - 360 if ra_deg > 180 else ra_deg
def inside(x, y, ring):
    # unwrap the ring so consecutive vertices never jump across ±180, then ray-cast from x, x±360
    xs = [ring[0][0]]
    for px, _ in ring[1:]:
        d = ((px - xs[-1] + 180) % 360) - 180; xs.append(xs[-1] + d)
    ys = [py for _, py in ring]
    for xx in (x, x + 360, x - 360):
        hit = False
        for i in range(len(ring)):
            x1, y1, x2, y2 = xs[i - 1], ys[i - 1], xs[i], ys[i]
            if (y1 > y) != (y2 > y) and xx < x1 + (y - y1) * (x2 - x1) / (y2 - y1): hit = not hit
        if hit: return True
    return False
def con_at(ra, dec):
    for a, ring in bounds.items():
        if inside(lon(ra), dec, ring): return a
    return None

def parse_ra(s):
    h, m, sec = (float(v) for v in re.findall(r'[-\d.]+', s)[:3]); return (h + m / 60 + sec / 3600) * 15
def parse_dec(s):
    v = re.findall(r'[\d.]+', s)[:3]; d, m, sec = (float(x) for x in v)
    return (-1 if s.strip().startswith('-') else 1) * (d + m / 60 + sec / 3600)

pos = {}
def walk(o):
    if isinstance(o, dict):
        ra, dec, i = o.get('Position (RA)'), o.get('Position (Dec)'), o.get('Id') or o.get('id')
        if ra and dec and i: pos.setdefault(str(i), (ra, dec))
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
for f in glob.glob(os.path.join(ROOT, 'tools/harvest/**/*.json'), recursive=True):
    try: walk(json.load(open(f, encoding='utf-8')))
    except Exception: pass
for k, v in json.load(open(os.path.join(HERE, 'positions_extra.json'))).items(): pos[k] = tuple(v)

idx = json.load(open(os.path.join(COL, 'index.json'), encoding='utf-8'))
stats = {'position': 0, 'constellation only': 0, 'none': 0}
for e in idx:
    path = os.path.join(COL, 'photos', e['id'] + '.json'); r = json.load(open(path, encoding='utf-8'))
    named = re.search(r'constellation ([^·]+)', r.get('celestial') or '')
    con = abbr_by_name.get(named.group(1).strip().lower()) if named else None
    p = pos.get(e['id']) or pos.get(re.sub(r'^[hewn]-', '', e['id']))
    sky = None
    if p and r['cat'] != 'night':
        try:
            ra, dec = parse_ra(p[0]), parse_dec(p[1])
            at = con_at(ra, dec)
            # ESA/Hubble and ESO both use "potwNNNNa" ids, so a bare-id position can belong to the other
            # archive's photo: keep a position only when it lands in the constellation the record names
            # (or, with none named, only for ids that are unique to one archive).
            same = con is None or at == con or (con.startswith('Ser') and at and at.startswith('Ser'))
            unique = e['id'] in pos or not re.match(r'^[he]-potw', e['id'])
            if at and same and (con or unique): sky = {'con': at, 'ra': round(ra, 3), 'dec': round(dec, 3)}
        except Exception: pass
    if not sky and con: sky = {'con': con}
    stats['position' if sky and 'ra' in sky else 'constellation only' if sky else 'none'] += 1
    if sky: r['sky'] = sky
    else: r.pop('sky', None)
    json.dump(r, open(path, 'w', encoding='utf-8'), ensure_ascii=False)
    if sky: e['con'] = sky['con']
    else: e.pop('con', None)
json.dump(idx, open(os.path.join(COL, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(stats)

# Constellation names for the archive menu (small, so it ships with the page rather than with sky.json).
with open(os.path.join(ROOT, 'src/data/constellations.js'), 'w', encoding='utf-8') as fh:
    fh.write('// Generated by tools/sky/build_sky.py. IAU abbreviation (d3-celestial ids) → name.\n')
    fh.write('export const CON_NAMES = ' + json.dumps({k: v['n'] for k, v in sorted(cons.items())}, ensure_ascii=False) + ';\n')

# The curated photographs in src/data/catalog.js get their sky positions here too.
cat_src = open(os.path.join(ROOT, 'src/data/catalog.js'), encoding='utf-8').read()
cat_sky = {}
for cid, cat_, celestial in re.findall(r"id: '([^']+)', cat: '(\w+)'.*?celestial: '([^']*)'", cat_src, re.S):
    if cat_ == 'night': continue
    named = re.search(r'constellation ([A-Z][a-z]+(?: [A-Z][a-z]+)?)', celestial)
    con = abbr_by_name.get(named.group(1).lower()) if named else None
    if con == 'Ser1' and 'Cauda' in celestial: con = 'Ser2'
    p = pos.get(cid)
    if p:
        ra, dec = parse_ra(p[0]), parse_dec(p[1]); at = con_at(ra, dec)
        if at and (con is None or at == con): cat_sky[cid] = {'con': at, 'ra': round(ra, 3), 'dec': round(dec, 3)}; continue
    if con: cat_sky[cid] = {'con': con}
with open(os.path.join(ROOT, 'src/data/constellations.js'), 'a', encoding='utf-8') as fh:
    fh.write('// Sky positions for the curated photographs in catalog.js (same shape as a record\'s "sky" field).\n')
    fh.write('export const CATALOG_SKY = ' + json.dumps(cat_sky, ensure_ascii=False) + ';\n')
print('catalog:', {k: ('ra' in v) for k, v in cat_sky.items()})
