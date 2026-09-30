"""today/chosen4.json -> final4.json (raw shape, all orgs) for the second gap-fill round."""
import json,re
pool={o['uid']:o for o in json.load(open('today/pool.json'))}
E={o['id']:o for o in json.load(open('noirlab/eligible.json'))}
raw=json.load(open('noirlab/raw.json')); L={c['id']:c for c in raw['cand']}; D=raw['D']
SITE={'chile':'Chile','hawaii':'Hawaiʻi','arizona':'Arizona'}
out=[]
for c in json.load(open('today/chosen4.json')):
    if c['uid'] in pool: o=dict(pool[c['uid']])
    elif c['id'] in E: o=dict(E[c['id']])
    else:
        d,l=D[c['id']],L[c['id']]; large=next(x for x in d['links'] if '/large/' in x)
        cat='nebula' if 'nebulae' in l['cats'] else 'galaxy'
        o=dict(id=c['id'],org='noirlab',title=d['title'],w=l['width'],h=l['height'],cats=l['cats'],info=d['info'],filters=d['filters'],credit=d['credit'],
               caption=[p for p in d['caption'].split('\n\n') if p],imgDesc='',pub=None,large=large,cat=cat,disp=large,dw=l['width'],dh=l['height'],
               rel=(d['info'].get('Related releases') or '').split(',')[0].strip(),name=d['info'].get('Name',d['title']).split(',')[0].strip().lower(),score=3,site=None,thumb=l['src'])
    o.pop('day',None); o.pop('uid',None); o.setdefault('dupOf',None)
    out.append(o)
json.dump(out,open('final4.json','w'),ensure_ascii=False)
print(len(out))
