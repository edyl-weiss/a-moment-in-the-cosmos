#!/usr/bin/env python3
"""Pick NOIRLab candidates from the crawl (raw.json: {cand: [...listing], D: {id: detail}}).

Output: eligible.json — one record per usable photograph, in the same raw shape as ../final2.json,
ranked by `score`, with `dupOf` set when the object is already in the collection."""
import json, re, collections

raw = json.load(open('raw.json'))
listing = {c['id']: c for c in raw['cand']}
D = raw['D']
have = collections.Counter()
for r in json.load(open('../records.json')):
    for n in re.split(r',\s*', r['objectName'] or ''):
        if n: have[re.sub(r'\s+', ' ', n.strip().lower())] += 1

BADT = re.compile(r'annotat|compass|artist|illustration|impression|comparison|side[- ]by[- ]side|collage|diagram|chart|'
                  r'infographic|montage|poster|animation|spectrum|simulation|rendering|mock-?up|zoom|labell?ed|'
                  r'crop|close-up|detail|cutout|inset|before and after|versus|vs\.? |finder|mosaic key', re.I)
SITE = {'chile': 'Chile', 'hawaii': 'Hawaiʻi', 'arizona': 'Arizona'}   # NOIRLab's regional categories; the exact spot comes from the caption
why = collections.Counter()


def mb(s):
    m = re.search(r'([\d.]+)\s*([KMG])B', s or '')
    if not m: return None
    v = float(m.group(1)); return v / 1024 if m.group(2) == 'K' else v * 1024 if m.group(2) == 'G' else v


def category(l, d):
    cats, typ = set(l['cats']), d['info'].get('Type', '')
    if cats & set(SITE):
        return 'night' if typ.startswith('Photographic') or typ.startswith('Observation') else None
    # 'Photographic' in an astronomy category = a camera/lens astrophotograph (e.g. the Magellanic Clouds)
    if not (typ.startswith('Observation') or typ.startswith('Photographic')): return None
    if 'nebulae' in cats: return 'nebula'
    if cats & {'galaxies', 'galaxyclusters'}:
        return 'star' if re.search(r'globular|star cluster|open cluster', d['title'], re.I) else 'galaxy'
    if cats & {'stars', 'starclusters'}: return 'star'
    return None


out = []
for iid, d in D.items():
    l = listing.get(iid)
    if not l: why['no listing'] += 1; continue
    c = category(l, d)
    if not c: why['type'] += 1; continue
    if BADT.search(d['title']): why['title'] += 1; continue
    if re.search(r'Digiti[sz]ed Sky Survey|\bDSS\b', d['credit']): why['dss'] += 1; continue
    if len(d['caption']) < 200: why['thin caption'] += 1; continue
    w, h = l['width'], l['height']
    if max(w, h) / min(w, h) > 4: why['aspect'] += 1; continue
    pub = next((x for x in d['links'] if '/publicationjpg/' in x), None)
    large = next((x for x in d['links'] if '/large/' in x), None)
    if pub:
        s = 4000 / max(w, h) if max(w, h) > 4000 else 1   # verified in the browser before use
        disp, dw, dh = pub, round(w * s), round(h * s)
    elif large and max(w, h) <= 6000:
        disp, dw, dh = large, w, h
    else:
        why['no display jpeg'] += 1; continue
    L, S = max(dw, dh), min(dw, dh)
    if not ((L / S <= 1.02 and S >= 1440) or (L >= 1920 and S >= 1080)): why['small'] += 1; continue
    names = [re.sub(r'\s+', ' ', n.strip().lower()) for n in re.split(r',\s*', d['info'].get('Name', '')) if n.strip()]
    dup = next((n for n in names if have[n]), None)
    rel = (d['info'].get('Related releases') or d['info'].get('Related announcements') or '').split(',')[0].strip()
    score = (6 if re.match(r'(noirlab|gemini)\d{4}a$', iid) else 4 if re.match(r'(noirlab|gemini)\d', iid)
             else 3.5 if iid.startswith('iotw') else 3 if iid.startswith('ann') else 2)
    score += min(len(d['caption']), 2000) / 1000 + (1 if d['filters'] else 0) - (3 if dup else 0)
    out.append(dict(id=iid, org='noirlab', title=d['title'], w=w, h=h, cats=l['cats'], info=d['info'],
                    filters=d['filters'], credit=d['credit'], caption=[p for p in d['caption'].split('\n\n') if p],
                    imgDesc='', pub=pub, large=large, cat=c, disp=disp, dw=dw, dh=dh, rel=rel,
                    name=(names[0] if names else d['title'].lower()), score=round(score, 2), dupOf=dup,
                    site=next((SITE[x] for x in l['cats'] if x in SITE), None), thumb=l['src']))
out.sort(key=lambda o: -o['score'])
json.dump(out, open('eligible.json', 'w'), ensure_ascii=False)
print(len(out), dict(why))
print(collections.Counter(o['cat'] for o in out), 'dups', sum(1 for o in out if o['dupOf']))
