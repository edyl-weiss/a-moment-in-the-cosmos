"""POTW crawl -> raw records in the same shape as ../eligible.json, filtered with the same rules as ../select.py."""
import json,re,collections,sys
sys.argv=['x']
src=open('../select.py').read()
import os; _cwd=os.getcwd(); os.chdir('..'); exec(src[:src.index('out=[]')]); os.chdir(_cwd)          # BADT, mb(), cat() exactly as used for the main collection
def conv(o):
    m=re.match(r'(\d+) x (\d+)',o['info'].get('Size',''))
    w,h=(int(m.group(1)),int(m.group(2))) if m else (0,0)
    dl=o['dl']; fix=lambda u:u if not u or u.startswith('http') else ({'hubble':'https://esahubble.org','webb':'https://esawebb.org'}.get(o['org'],'https://www.eso.org')+u)
    return dict(o,w=w,h=h,cats=[],pub=fix((dl.get('publicationjpg') or {}).get('url')),pubSize=(dl.get('publicationjpg') or {}).get('size',''),
                large=fix((dl.get('large') or {}).get('url')),largeSize=(dl.get('large') or {}).get('size',''))
out=[];why=collections.Counter();seen=set()
for f in ['potw_hubble.json','potw_eso.json','full_hubble_short.json','full_webb.json','rel_eso.json','full_eso_short.json']:
    for o in map(conv,json.load(open(f))):
        if (o['org'],o['id']) in seen: continue
        seen.add((o['org'],o['id']))
        c=cat(o)
        if not c and o['org']=='eso' and o['info'].get('Type','').startswith('Photographic') and re.search(r'Observatory|Telescope|Sky Phenomenon',o['info'].get('Type','')) and not re.search(r'People',o['info'].get('Type','')):
            c='night'   # observatory photographs: kept only if the eye review sees a night sky
        if not c: why['type']+=1; continue
        if BADT.search(o['title']): why['title']+=1; continue
        if re.search(r'Digiti[sz]ed Sky Survey|\bDSS\b',o['credit']): why['dss']+=1; continue
        if not o['caption'] or sum(len(p) for p in o['caption'])<200: why['nocap']+=1; continue
        w,h=o['w'],o['h']
        if not w or max(w,h)/min(w,h)>4: why['aspect']+=1; continue
        if o['pub']: disp=o['pub']; s=4000/max(w,h) if max(w,h)>4000 else 1; dw,dh=round(w*s),round(h*s); dmb=mb(o['pubSize'])
        elif o['large'] and (mb(o['largeSize']) or 99)<=10: disp=o['large']; dw,dh=w,h; dmb=mb(o['largeSize'])
        else: why['heavy']+=1; continue
        L,S=max(dw,dh),min(dw,dh)
        if not ((L/S<=1.02 and S>=1440) or (L>=1920 and S>=1080)): why['smalldisp']+=1; continue
        rel=(o['info'].get('Related releases') or '').split(',')[0].strip() or re.sub(r'[a-z]$','',o['id'])
        name=(o['info'].get('Name') or o['title']).split(',')[0].strip().lower()
        out.append(dict(o,cat=c,disp=disp,dw=dw,dh=dh,dmb=dmb,rel=rel,name=name))
json.dump(out,open('eligible_new.json','w'),ensure_ascii=False)
print(len(out),dict(why),collections.Counter((o['org'],o['cat']) for o in out))
