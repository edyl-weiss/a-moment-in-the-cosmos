import json,re,math,collections
recs=[]
for f in ['hubble.json','webb.json','eso.json']: recs+=json.load(open(f))
CUR={'weic2216b','heic0515a','weic2205a','heic1307a','weic2208a','heic0506a','weic2426a','heic0602a','heic1509a','weic2316a','heic0715a','weic2301a','potw1222a','uhd_img4255pc_bt_cc','potw1217a','ann13016a'}
BADT=re.compile(r'annotat|compass|artist|illustration|impression|comparison|side[- ]by[- ]side|collage|diagram|chart|infographic|montage|poster|animation|spectrum|spectra|simulation|rendering|mock-?up|zoom|pan video|slider|labelled|labeled|mosaic key|crop|close-up|detail|scale bar|filters|cutout|inset|before and after|versus|vs\.? ',re.I)
def mb(s):
    m=re.match(r'([\d.]+)\s*([KMG])B',s or '')
    if not m: return None
    v=float(m.group(1)); return v/1024 if m.group(2)=='K' else v*1024 if m.group(2)=='G' else v
def cat(r):
    t=r['info'].get('Type','')
    parts=[p.strip() for p in t.split('||')]
    img=parts[0]; obj=' '.join(parts[1:])
    if r['org']=='eso' and img=='Photographic':
        return 'night' if re.search(r'Night Sky|Milky Way',obj) else None
    if img!='Observation': return None
    if r['org']=='webb' and not obj:
        cs=r['info'].get('Category','')+' '+' '.join(r.get('cats') or [])
        if re.search(r'Solar System|Exoplanet|Spacecraft|Illustration|Graphics',cs) and not re.search(r'Galax|Nebula|Stars',cs): return None
        if re.search(r'Galax',cs,re.I): return 'galaxy'
        if re.search(r'Nebula',cs,re.I): return 'nebula'
        if re.search(r'Star',cs,re.I): return 'star'
        return None
    if re.search(r'Solar System|Planet|Exoplanet|Comet|Asteroid|Moon|Sun\b|Spacecraft|Technology',obj) and not re.search(r'Nebula|Galaxy|Cluster',obj): return None
    if 'Galaxy' in obj: return 'galaxy'
    if re.search(r'Star : Grouping|Cluster',obj): return 'star'
    if 'Nebula' in obj: return 'nebula'
    if 'Star' in obj: return 'star'
    return None
out=[]; why=collections.Counter()
for r in recs:
    if r['id'] in CUR: why['current']+=1; continue
    c=cat(r)
    if not c: why['type']+=1; continue
    if BADT.search(r['title']): why['title']+=1; continue
    cr=r['credit']
    if re.search(r'Digiti[sz]ed Sky Survey|\bDSS\b',cr): why['dss']+=1; continue
    if not r['caption'] or sum(len(p) for p in r['caption'])<200: why['nocap']+=1; continue
    w,h=r['w'],r['h']
    if max(w,h)/min(w,h)>4: why['aspect']+=1; continue
    if r['pub']: disp=r['pub']; s=4000/max(w,h) if max(w,h)>4000 else 1; dw,dh=round(w*s),round(h*s); dmb=mb(r['pubSize'])
    elif r['large'] and (mb(r['largeSize']) or 99)<=10: disp=r['large']; dw,dh=w,h; dmb=mb(r['largeSize'])
    else: why['heavy']+=1; continue
    L,S=max(dw,dh),min(dw,dh)
    if not ((L/S<=1.02 and S>=1440) or (L>=1920 and S>=1080)): why['smalldisp']+=1; continue
    rel=(r['info'].get('Related releases') or r['info'].get('Related announcements') or '').split(',')[0].strip() or re.sub(r'[a-z]$','',r['id'])
    name=(r['info'].get('Name') or r['title']).split(',')[0].strip().lower()
    out.append(dict(r,cat=c,disp=disp,dw=dw,dh=dh,dmb=dmb,rel=rel,name=name))
print(len(out), why)
print(collections.Counter((o['cat'],o['org']) for o in out))
json.dump(out,open('eligible.json','w'))
