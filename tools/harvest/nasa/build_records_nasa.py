"""NASA (science.nasa.gov, formerly hubblesite.org / webbtelescope.org) picks -> raw_nasa.json + ../records_nasa.json.
Images come from NASA's image service, sized there: nothing is upscaled (requested sizes never exceed the original)."""
import json, re, html
P = json.load(open('picks.json')); D = json.load(open('parsed.json')); DET = json.load(open('detail.json')); FLD = json.load(open('fields.json'))
DROP = {'h458167', 'h456813', 'h464583', 'h449416', 'h468464', 'h461375'}   # artist's impressions, annotated, duplicates
CAT = {'h465566': None}
FIX = {'MCG11-002': 'galaxy', 'M87': 'galaxy', 'NGC 6791': 'star', 'Nearby Dust Clouds': 'nebula', 'Stellar Sculptors': 'nebula',
       'Closeup of Region of Andromeda': 'galaxy', 'M82 Hubble Mosaic': 'galaxy', 'NGC 7252': 'galaxy', 'Supernova 1987A': 'nebula',
       'Protoplanetary Disks in NGC 346': 'nebula'}
MONTHS = 'January February March April May June July August September October November December'.split()
key = lambda x: x['src'][0] + str(x['id'])
DYN = 'https://assets.science.nasa.gov/dynamicimage/'

def clean_release(t):
    t = re.split(r'\s(?:Media Contacts?|Contact Media|Related Terms|Keep Exploring|Share Details|Science Contacts?)\b', t)[0]
    t = re.split(r'\sCredits?:\s|\sImage:\s|\sText:\s|\sIllustrations?:\s', t)[0] if len(t) > 2500 else t
    return t.strip()

def paras(t, n=3):
    s = re.split(r'(?<=[.!?”"])\s+(?=[A-Z“"])', t)
    return [' '.join(s[i:i + n]) for i in range(0, len(s), n)]

def rdate(s):
    m = re.match(r'([A-Z][a-z]+) (\d{1,2}), (\d{4})', s)
    return f"{int(m.group(2))} {m.group(1)} {m.group(3)}"

raw, recs, seen = [], [], set()
for x in P:
    k = key(x)
    if k in DROP: continue
    d = D[k]; det = DET[k]
    title = html.unescape(x['t']).replace('&#8216;', '‘').replace('&#8217;', '’')
    cat = next((v for frag, v in FIX.items() if frag in title), x['cat'])
    slug = x['u'].rstrip('/').split('/')[-1]
    rid = 'nasa-' + slug
    assert rid not in seen, rid; seen.add(rid)
    W, H, ext, size = d['orig']
    base = x['img'].replace(DYN, DYN)          # dynamicimage path of the original file
    s = min(1, 4000 / max(W, H)); pw, ph = round(W * s), round(H * s)
    pub = f"{base}?w={pw}&h={ph}&fit=clip"
    large = f"{base}?w={W}&h={H}&fit=clip" if max(W, H) > 4000 else None
    ss = min(1, 1280 / max(W, H))
    f = FLD[k]
    inst_txt = f.get('Instrument', '') + ' ' + title
    if re.search(r'NIRCam|MIRI|NIRSpec|NIRISS', inst_txt) or (not re.search(r'ACS|WFC3|WFPC|NICMOS|STIS|Hubble', inst_txt) and '/asset/webb/' in x['u']):
        mission, tel = 'webb', 'James Webb Space Telescope'
    else:
        mission, tel = 'hubble', 'Hubble Space Telescope'
    insts = sorted({i for i in ['NIRCam', 'MIRI', 'NIRSpec', 'WFC3', 'ACS', 'WFPC2', 'NICMOS', 'STIS'] if re.search(r'\b' + i, f.get('Instrument', '') + ' ' + title)})
    COL = {'red': 'red', 'orange': 'orange', 'yellow': 'yellow', 'green': 'green', 'cyan': 'cyan', 'blue': 'blue', 'purple': 'purple', 'violet': 'purple', 'magenta': 'purple'}
    filters = []
    for col, flt in re.findall(r'\b(Red|Orange|Yellow|Green|Cyan|Blue|Purple|Violet|Magenta):\s*([A-Z][\w\s+/.-]*?)(?=,|\.|$|\s(?:and\s)?(?:Red|Orange|Yellow|Green|Cyan|Blue|Purple|Violet|Magenta):)', f.get('Color Info', '')):
        for one in re.split(r'\s*\+\s*|\s+and\s+', flt.strip()):
            filters.append({'band': one.strip(), 'wavelength': '', 'instrument': ' '.join(insts) if len(insts) == 1 else '', 'colour': COL[col.lower()]})
    dm = re.search(r'((?:[Aa]bout |[Rr]oughly |[Nn]early )?[\d.,]+(?:\s*(?:thousand|million|billion))? light[ -]years?)', f.get('Distance', ''))
    dist = dm.group(1).replace('light-years', 'light years').replace('light-year', 'light year') if dm else ''
    dim = f.get('Dimensions', '')
    m = re.search(r'about ([\d.,]+ (?:arcminutes|arcseconds|degrees))(?: across)?\s*\(([^)]*light-years?)\)', dim)
    scale = {'text': f"NASA lists this view as about {m.group(1)} across, roughly {m.group(2)} at the object’s distance."} if m else None
    rel = clean_release(det['relText']) if det['relText'] else ''
    cap = re.split(r'About the Object', d['cap'])[0].strip()
    caption = [cap] + (paras(rel) if rel else [])
    rec = {
        'id': rid, 'srcId': slug, 'org': 'nasa', 'cat': cat, 'title': title,
        'objectName': f.get('Object Name', ''), 'objectType': f.get('Object Description', ''), 'distance': dist,
        'constellation': f.get('Constellation', ''), 'position': ' '.join(x for x in [f.get('R.A. Position', ''), f.get('Dec. Position', '')] if x),
        'fov': m.group(1) if m else '', 'exposureDates': f.get('Exposure Dates', ''), 'colorInfo': f.get('Color Info', ''),
        'releaseDate': rdate(d['rd']), 'site': None,
        'telescopes': [tel] + [f'{tel.split(" Space")[0].replace("James ", "")} {i}' for i in insts],
        'credit': d['credit'], 'source': x['u'],
        'img': {'pub': pub, 'pubW': pw, 'pubH': ph, 'origW': W, 'origH': H, 'large': large,
                'largeMB': None, 'thumb': f"{base}?w=400&h=400&fit=clip", 'screen': f"{base}?w={round(W * ss)}&h={round(H * ss)}&fit=clip"},
        'filters': filters, 'recognition': f"NASA {'Webb' if mission == 'webb' else 'Hubble'} image release (STScI). No published audience rating.",
        'scale': scale, 'sourceCaption': caption, 'imageDescription': html.unescape(x.get('alt') or ''),
        'release': det['rel'], 'releaseTitle': re.sub(r'Read the release$', '', FLD[k].get('Science Release', '')).strip(), 'mission': mission,
    }
    recs.append(rec)
    raw.append({'id': rid, 'org': 'nasa', 'info': {'Related releases': ''}, 'title': title, 'release': det['rel']})
json.dump(recs, open('../records_nasa.json', 'w'), ensure_ascii=False)
json.dump(raw, open('../raw_nasa.json', 'w'), ensure_ascii=False)
import collections
print(len(recs), collections.Counter(r['cat'] for r in recs), sum(1 for r in recs if len(' '.join(r['sourceCaption'])) < 600), 'thin')
