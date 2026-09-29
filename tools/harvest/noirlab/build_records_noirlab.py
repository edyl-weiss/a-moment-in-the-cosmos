#!/usr/bin/env python3
"""selected.json (reviewed NOIRLab picks, raw shape) -> ../records_noirlab.json (same shape as ../records.json)."""
import json, re, math

SRC = 'https://noirlab.edu/public/images/{}/'
ST = 'https://storage.noirlab.edu/media/archives/images/{}/{}.jpg'
COLOR = re.compile(r'\((Purple|Violet|Blue|Cyan|Green|Yellow|Orange|Red|Magenta|Pink|White)\)', re.I)


def num(s):
    m = re.match(r'\s*([\d.]+)\s*(thousand|million|billion)?', s.replace(',', ''), re.I)
    if not m: return None
    return float(m.group(1)) * {'thousand': 1e3, 'million': 1e6, 'billion': 1e9}.get((m.group(2) or '').lower(), 1)


def dist_ly(d):
    if not d or re.search(r'[-–]|to |or |:', d): return None
    m = re.match(r'\s*([\d.,]+)\s*(thousand|million|billion)?\s*light[ -]?years?', d, re.I)
    return num(m.group(1) + ' ' + (m.group(2) or '')) if m else None


def fov(f):
    m = re.match(r'\s*([\d.]+)\s*x\s*([\d.]+)\s*(arcminutes|arcseconds|degrees)', f or '', re.I)
    if not m: return None
    k = {'arcminutes': math.pi / 10800, 'arcseconds': math.pi / 648000, 'degrees': math.pi / 180}[m.group(3).lower()]
    return float(m.group(1)) * k, float(m.group(2)) * k, f.strip()


def fmt_ly(x):
    if x >= 1e6: return f"{x / 1e6:.2g} million" if x < 1e7 else f"{round(x / 1e6):,} million"
    if x >= 1000: return f"{round(x, -2) if x < 1e4 else round(x, -3):,.0f}"
    if x >= 10: return f"{round(x):,}"
    return f"{x:.1f}".rstrip('0').rstrip('.')


def release_date(s):
    # "Dec. 19, 2019, 3 a.m." -> "19 December 2019"
    m = re.match(r'([A-Z][a-z]+)\.?\s+(\d{1,2}),\s*(\d{4})', s or '')
    if not m: return ''
    months = 'January February March April May June July August September October November December'.split()
    mon = next((x for x in months if x.startswith(m.group(1)[:3])), m.group(1))
    return f"{int(m.group(2))} {mon} {m.group(3)}"


def credit(c):
    # the page puts each credit part on its own line; the crawl's textContent joined them ("AURAImage Processing")
    c = re.sub(r'\s*\n\s*', ' · ', c.strip())
    return re.sub(r'(\S)/?(Image [Pp]rocessing|Acknowledge?ments?|Data obtained)', r'\1. \2', c)


recs = []
for o in json.load(open('selected.json')):
    info, iid = o['info'], o['id']
    d, fv = dist_ly(info.get('Distance', '')), fov(info.get('Field of view', ''))
    scale = None
    if d and fv:
        w, h = 2 * d * math.tan(fv[0] / 2), 2 * d * math.tan(fv[1] / 2)
        scale = {'frameW': w, 'frameH': h, 'distance': d,
                 'text': f"Using the source's listed field of view ({fv[2]}) and distance ({info['Distance']}), the frame spans "
                         f"roughly {fmt_ly(w)} × {fmt_ly(h)} light-years. Its light set out about {fmt_ly(d)} years before reaching the telescope."}
    elif d:
        scale = {'distance': d, 'text': f"The source lists a distance of {info['Distance']}, so the light in this picture set out roughly {fmt_ly(d)} years ago."}
    filters = []
    for f in o['filters']:
        if len(f) < 2: continue
        m = COLOR.search(f[0])
        filters.append({'band': re.sub(r'\s*\(.*?\)', '', f[0]).strip(), 'wavelength': f[1],
                        'instrument': re.sub(r'([Tt]elescope|Array|Observatory|Camera)(?=[A-Z0-9])', r'\1 ', re.sub(r'\s+', ' ', f[2])).strip() if len(f) > 2 else '', 'colour': m.group(1).lower() if m else None})
    tels = sorted({x['instrument'] for x in filters if x['instrument']})
    if re.match(r'iotw', iid): recog = 'NOIRLab Image of the Week (an editorial selection, not an audience score).'
    elif re.match(r'(noirlab|gemini)\d', iid): recog = 'Official NSF NOIRLab / Gemini press-release image. No published audience rating.'
    elif re.match(r'ann', iid): recog = 'Image from an NSF NOIRLab announcement. No published audience rating.'
    else: recog = 'Published in the NSF NOIRLab image archive. No published rating.'
    recs.append({
        'id': 'n-' + iid, 'srcId': iid, 'org': 'noirlab', 'cat': o['cat'], 'title': o['title'],
        'objectName': info.get('Name', ''), 'objectType': '', 'distance': info.get('Distance', ''),
        'constellation': info.get('Constellation', ''),
        'position': ' '.join(x for x in [info.get('Position (RA)', ''), info.get('Position (Dec)', '')] if x),
        'fov': info.get('Field of view', ''), 'releaseDate': release_date(info.get('Release date')),
        'site': o.get('site') if o['cat'] == 'night' else None, 'telescopes': tels,
        'credit': credit(o['credit']), 'source': SRC.format(iid),
        'img': {'pub': o['disp'], 'pubW': o['dw'], 'pubH': o['dh'], 'origW': o['w'], 'origH': o['h'],
                'large': o['large'] if o['large'] != o['disp'] else None, 'largeMB': o.get('largeMB'),
                'thumb': o['thumb'], 'screen': ST.format('screen', iid)},
        'filters': filters, 'recognition': recog, 'scale': scale,
        'sourceCaption': o['caption'], 'imageDescription': '',
    })
json.dump(recs, open('../records_noirlab.json', 'w'), ensure_ascii=False)
print(len(recs), 'with scale', sum(1 for r in recs if r['scale']), 'with filters', sum(1 for r in recs if r['filters']))
