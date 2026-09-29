#!/usr/bin/env python3
"""Turn harvested records + fact-checked stories into the site's collection data.

Inputs (this folder): records.json, final2.json (raw metadata), stories/batchNN.json
Output: <site>/src/data/collection/index.json, photos/<id>.json, and <site>/src/data/schedule.js
Only records with a complete, unflagged story are exported."""
import json, re, glob, sys, collections, os

SITE = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/cosmos-v2'
OUT = os.path.join(SITE, 'src/data/collection')
PFX = {'hubble': 'h-', 'webb': 'w-', 'eso': 'e-', 'noirlab': 'n-'}
EXTRA = [f for f in ['noirlab_final.json'] if os.path.exists(f)]   # later harvests, same raw shape
RAW = json.load(open('final2.json')) + [o for f in EXTRA for o in json.load(open(f))]
recs = {r['id']: r for f in ['records.json', 'records_noirlab.json'] if os.path.exists(f) for r in json.load(open(f))}
raw = {PFX[o['org']] + o['id']: o for o in RAW}
stories = {}
for f in sorted(glob.glob('stories/batch*.json')):
    for s in json.load(open(f)):
        stories[s['id']] = s

ORGN = {'hubble': 'ESA/Hubble', 'webb': 'ESA/Webb', 'eso': 'ESO', 'noirlab': 'NSF NOIRLab'}
NEWS = {'hubble': 'https://esahubble.org/news/{}/', 'webb': 'https://esawebb.org/news/{}/', 'eso': 'https://www.eso.org/public/news/{}/',
        'noirlab': 'https://noirlab.edu/public/news/{}/'}
PREFIX = re.compile(r'^(Optical|Infrared|Ultraviolet|Radio|X-ray|Millimeter|Submillimeter|Gamma-ray)(.*)$', re.I)
words = lambda t: len(re.findall(r"[A-Za-z0-9’'\-]+", t))


WAVE = re.compile(r'\d\s*(nm|µm|μm|mm|cm|GHz|MHz|keV|Å|micron)', re.I)


def glue(t):
    # the crawl joined table cells without a space: "Very Large TelescopeFORS2"
    return re.sub(r'([Tt]elescope|Array|Observatory|Camera)(?=[A-Z0-9])', r'\1 ', t or '').strip()


def norm_filters(fs):
    # ESO tables with no wavelength column put telescope+instrument in the wavelength slot
    out = []
    for f in fs:
        f = dict(f)
        if f['wavelength'] and not WAVE.search(f['wavelength']) and not f['instrument']:
            f['instrument'], f['wavelength'] = f['wavelength'], ''
        f['instrument'] = glue(f['instrument'])
        out.append(f)
    return out


def filt_label(f):
    band = f['band']
    m = PREFIX.match(band)
    if m:
        kind, rest = m.group(1), m.group(2).strip()
        band = f'{kind} {rest}'.strip() if rest else kind
    inst = f['instrument'].replace('Hubble Space Telescope', 'Hubble').replace('James Webb Space Telescope', 'Webb')
    return ' · '.join(x for x in [f['wavelength'], band] if x) + (f' ({inst})' if inst else '')


def celestial(r):
    if r['cat'] == 'night':
        return f"Photograph taken {'in' if r['org'] == 'noirlab' else 'at'} {r['site']}" if r['site'] else 'Landscape photograph; the source does not name the site'
    bits = [b for b in [r['objectName'], f"constellation {r['constellation']}" if r['constellation'] else '',
                        f"about {r['distance'].replace('light years', 'light-years')} away (source figure)" if r['distance'] else ''] if b]
    return ' · '.join(bits) or 'Location not published by the source'


def sources(r):
    out = [[f"{ORGN[r['org']]} image page ({r['srcId']})", r['source']]]
    rel = (raw[r['id']]['info'].get('Related releases') or '').split(',')[0].strip()
    if re.match(r'^(heic|weic|eso|noirlab)\d{4}', rel):
        out.append([f"{ORGN[r['org']]} release {rel}", NEWS[r['org']].format(rel)])
    return out


# Story flags from the writers/checkers. Hard ones mean "not a clean, correctly captioned sky photo".
HARD = re.compile(r'illustration|annotated|overlay|not a sky photo|not a night-sky|caption mismatch|image not related|'
                  r'duplicate|same caption|same object|comparison|instrument mismatch|site mismatch|not hubble|is a hubble photo|'
                  r'description mismatch|supernova name|date inconsistency|also describes', re.I)
SOFT = re.compile(r'caption too thin|distance|constellation|object ?name|multi-telescope composite|telescope not named|'
                  r'time-lapse|typo|misspell|omitted|two distances|filter list differs|names .* both|credit names', re.I)

exported, skipped = [], collections.Counter()
os.makedirs(os.path.join(OUT, 'photos'), exist_ok=True)
for rid, r in recs.items():
    s = stories.get(rid)
    if not s: skipped['no story'] += 1; continue
    flags = [f.strip() for f in s.get('flags', []) if f.strip()]
    hard = [f for f in flags if HARD.search(f) or not SOFT.search(f)]
    if hard: skipped['flagged: ' + hard[0][:40]] += 1; continue
    # where the source disagrees with itself, show neither figure (the story already follows the caption)
    if any(re.search(r'distance|two distances', f) for f in flags): r = {**r, 'distance': '', 'scale': None}
    if any(re.search(r'constellation', f) for f in flags): r = {**r, 'constellation': ''}
    if any(re.search(r'object ?name', f, re.I) for f in flags): r = {**r, 'objectName': ''}
    if not s.get('story') or not 110 <= words(' '.join(s['story'])) <= 190: skipped['bad length'] += 1; continue
    scale = (r['scale'] or {}).get('text') or s.get('scaleExtra')
    fs = norm_filters(r['filters'])
    filters = [[filt_label(f), f['colour'] or 'source lists band only'] for f in fs]
    telescopes = sorted({glue(t) for t in r['telescopes']} | {f['instrument'] for f in fs if f['instrument']})
    tels = ', '.join(telescopes) if telescopes else ('Camera photograph' if r['cat'] == 'night' else 'Not listed on the source page')
    photo = {
        'id': rid, 'cat': r['cat'], 'org': r['org'], 'title': re.sub(r'\s*;\s*', ', ', re.sub(r'\s+[—–]\s+', ': ', r['title'])),
        'caption': s['caption'].rstrip('.'),
        'captureDate': s.get('captureDate'), 'captureShort': s.get('captureDate'),
        'releaseDate': r['releaseDate'] or 'not listed',
        'celestial': celestial(r),
        'img': {k: v for k, v in r['img'].items() if v is not None},
        'credit': r['credit'], 'source': r['source'],
        'recognition': {'kind': 'editorial', 'text': r['recognition']},
        'story': s['story'], 'scale': scale,
        'understand': {'summary': s['understand']['summary'], 'filters': filters, 'eye': s['understand']['eye']},
        'labels': [],
        'behind': {
            'observatory': tels if r['cat'] != 'night' else (r['site'] or 'Not named by the source'),
            'instrument': tels, 'people': f"See full credit: {r['credit']}",
            'exposure': 'Not published on the source page.',
            'technique': 'Not stated by the source (single frame, stack, mosaic or panorama unknown).',
            'processing': 'Colours assigned by filter, as listed.' if any(f['colour'] for f in fs) else 'Not published.',
        },
        'explore': s.get('explore', []), 'sources': sources(r), 'alt': s.get('alt'),
    }
    json.dump(photo, open(os.path.join(OUT, 'photos', rid + '.json'), 'w'), ensure_ascii=False)
    exported.append(photo)

index = [{'id': p['id'], 'cat': p['cat'], 'org': p['org'], 'title': p['title'], 'thumb': p['img']['thumb']} for p in exported]
json.dump(index, open(os.path.join(OUT, 'index.json'), 'w'), ensure_ascii=False)

# Schedule: curated order first (keeps the archive's recorded days fixed), then new photos by rank.
curated = {'nebula': ['weic2216b', 'heic0515a', 'weic2205a', 'heic1307a'], 'galaxy': ['weic2208a', 'heic0506a', 'weic2426a', 'heic0602a'],
           'night': ['potw1222a', 'uhd_img4255pc_bt_cc', 'potw1217a', 'ann13016a'], 'star': ['heic1509a', 'weic2316a', 'heic0715a', 'weic2301a']}
rank = {PFX[o['org']] + o['id']: o.get('score', 0) for o in RAW}
prev = {}
sched_path = os.path.join(SITE, 'src/data/schedule.js')
if os.path.exists(sched_path):
    txt = open(sched_path).read()
    prev = json.loads(txt[txt.index('{'):txt.rindex('}') + 1]).get('order', {}) if 'order' in txt and txt.strip().startswith('/*') and '"order"' in txt else {}
order = {}
for c in curated:
    base = prev.get(c) or curated[c]
    new_ids = [p['id'] for p in sorted((p for p in exported if p['cat'] == c), key=lambda p: -rank.get(p['id'], 0)) if p['id'] not in base]
    order[c] = base + new_ids   # append-only: existing positions never move
js = ('/* Daily schedule: category rotation + per-category order.\n'
      '   APPEND-ONLY. Day i shows order[cat][floor(i/4) % length]; appending never changes a day\n'
      '   that has already happened as long as the lists are extended before they wrap.\n'
      '   Generated by tools/harvest/export_collection.py — edit there, not here. */\n'
      'export const SCHEDULE = ' + json.dumps({'launch': '2026-09-29', 'categoryOrder': ['nebula', 'galaxy', 'night', 'star'], 'order': order}, indent=2) + ';\n')
open(os.path.join(SITE, 'src/data/schedule.js'), 'w').write(js)
print('exported', len(exported), collections.Counter(p['cat'] for p in exported), 'skipped', dict(skipped))
