"""Candidates for filling calendar days: eligible, not in the collection, not rejected by eye."""
import json,re,collections,glob,math
M='January February March April May June July August September October November December'.split()
def md(s):
    s=(s or '').strip()
    m=re.match(r'(\d{1,2}) (\w+) (\d{4})',s)
    if m and m.group(2) in M: return (M.index(m.group(2))+1,int(m.group(1)),int(m.group(3)))
    m=re.match(r'([A-Z][a-z]+)\.? (\d{1,2}), (\d{4})',s)
    if m:
        mon=next((i+1 for i,x in enumerate(M) if x.startswith(m.group(1)[:3])),None)
        if mon: return (mon,int(m.group(2)),int(m.group(3)))
    return None
PFX={'hubble':'h-','webb':'w-','eso':'e-','noirlab':'n-'}
incoll={e['id'] for e in json.load(open('/home/claude/cosmos-v2/src/data/collection/index.json'))}
cur={c['id'] for c in json.load(open('/tmp/claude-0/curated.json'))}
rej=set(open('rejects.txt').read().split())
pool=[]
for o in json.load(open('eligible.json')):
    uid=PFX[o['org']]+o['id']
    if uid in incoll or o['id'] in cur or o['id'] in rej: continue
    pool.append(dict(o,uid=uid))
# NOIRLab: eligible but never looked at by eye (reviewed ones either made it or were rejected)
rev=set(json.load(open('noirlab/review_order.json')))|set(json.load(open('noirlab/review_order2.json')))
for o in json.load(open('noirlab/eligible.json')):
    uid='n-'+o['id']
    if uid in incoll or o['id'] in rev: continue
    pool.append(dict(o,uid=uid))
# score
top={}
for org,s in json.load(open('top100.json')).items():
    for p in s.split(','): n,i=p.split(':'); top[i]=int(n)
def score(o):
    s=0
    if o['id'] in top: s+=8-top[o['id']]/25
    if re.match(r'(heic|weic|eso|noirlab|gemini)\d',o['id']): s+=3
    elif re.match(r'(potw|potm|opo|iotw)',o['id']): s+=1
    s+=math.log2(max(o['dw']*o['dh'],1)/2e6)*0.8
    cap=o['caption']; s+=min(sum(len(p) for p in cap) if isinstance(cap,list) else len(cap),2000)/1000
    if o['info'].get('Distance'): s+=0.7
    return s
for o in pool:
    o['score']=score(o); o['day']=md(o['info'].get('Release date','').split(', ')[0] if re.match(r'\d',o['info'].get('Release date','')) else o['info'].get('Release date',''))
json.dump(pool,open('today/pool.json','w'),ensure_ascii=False)
print('pool',len(pool),'dated',sum(1 for o in pool if o['day']))
