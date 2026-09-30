import json,re,collections,math,os
exec(open('today/pool.py').read().split('pool=[]')[0])
pool=json.load(open('today/pool.json'))
seen={o['uid'] for o in pool}
top={}
for org,s in json.load(open('top100.json')).items():
    for p in s.split(','): n,i=p.split(':'); top[i]=int(n)
def score(o):
    s=0
    if o['id'] in top: s+=8-top[o['id']]/25
    if re.match(r'(heic|weic|eso|noirlab|gemini)\d',o['id']): s+=3
    elif re.match(r'(potw|potm|opo|iotw)',o['id']): s+=1
    s+=math.log2(max(o['dw']*o['dh'],1)/2e6)*0.8
    s+=min(sum(len(p) for p in o['caption']),2000)/1000
    if o['info'].get('Distance'): s+=0.7
    return s
added=0
for o in json.load(open('today/eligible_new.json')):
    uid=PFX[o['org']]+o['id']
    if uid in incoll or uid in seen or o['id'] in rej: continue
    seen.add(uid)
    o=dict(o,uid=uid,score=score(o),day=md(o['info'].get('Release date','').split(',')[0]))
    if o['day']: pool.append(o); added+=1
json.dump(pool,open('today/pool.json','w'),ensure_ascii=False)
have=json.load(open('today/have.json'))['have']
avail=collections.defaultdict(list)
for o in pool: avail[f"{o['day'][0]:02d}-{o['day'][1]:02d}"].append(o)
need={k:3-v for k,v in have.items() if v<3}
print('added',added,'pool',len(pool))
print('need',sum(need.values()),'fillable',sum(min(n,len(avail[k])) for k,n in need.items()))
print('still short:',[(k,n,len(avail[k])) for k,n in need.items() if len(avail[k])<n])
