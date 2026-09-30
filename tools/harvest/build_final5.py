"""Third gap-fill round: explicit uid list -> final5.json (raw shape), then records via the builders."""
import json,sys
UIDS=json.load(open('today/chosen5.json'))
pool={o['uid']:o for o in json.load(open('today/pool.json'))}
E={o['id']:o for o in json.load(open('noirlab/eligible.json'))}
raw=json.load(open('noirlab/raw.json')); L={c['id']:c for c in raw['cand']}; D=dict(raw['D'])
D.update(json.load(open('today/det_extra.json')))
CAT=json.load(open('today/chosen5_cat.json'))
out=[]
for u in UIDS:
    i=u[2:]
    if u in pool: o=dict(pool[u])
    elif u.startswith('n-') and i in E: o=dict(E[i])
    else:
        d=D[i]; l=L.get(i,{})
        w,h=[int(x) for x in d['info']['Size'].replace(' px','').split(' x ')]
        pub=next((x for x in d['links'] if '/publicationjpg/' in x),None); large=next(x for x in d['links'] if '/large/' in x)
        if pub: s=4000/max(w,h) if max(w,h)>4000 else 1; disp,dw,dh=pub,round(w*s),round(h*s)
        else: disp,dw,dh=large,w,h
        o=dict(id=i,org='noirlab',title=d['title'],w=w,h=h,cats=l.get('cats',[]),info=d['info'],filters=d['filters'],credit=d['credit'],
               caption=[p for p in d['caption'].split('\n\n') if p and not p.startswith('Alt Text')],imgDesc='',pub=pub,large=large,cat=CAT[u],disp=disp,dw=dw,dh=dh,
               rel=(d['info'].get('Related releases') or '').split(',')[0].strip(),name=(d['info'].get('Name') or d['title']).split(',')[0].strip().lower(),score=3,site=None,
               thumb=f'https://storage.noirlab.edu/media/archives/images/thumb300y/{i}.jpg')
    if u in CAT: o['cat']=CAT[u]
    o.pop('day',None); o.pop('uid',None); o.setdefault('dupOf',None)
    out.append(o)
json.dump(out,open('final5.json','w'),ensure_ascii=False); print(len(out))
