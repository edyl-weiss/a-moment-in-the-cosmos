import json,re,math,collections
el=json.load(open('eligible.json'))
top={}
for org,s in json.load(open('top100.json')).items():
    for p in s.split(','):
        n,i=p.split(':'); top[i]=(org,int(n))
def score(o):
    s=0
    if o['id'] in top: s+=8-top[o['id']][1]/25
    if re.match(r'(heic|weic|eso)\d',o['id']): s+=3
    elif re.match(r'(potw|potm|opo)',o['id']): s+=1
    s+=math.log2(o['dw']*o['dh']/2e6)*0.8
    s+=min(sum(len(p) for p in o['caption']),2000)/1000
    if o['info'].get('Distance'): s+=0.7
    if o['filters']: s+=0.3
    if o['info'].get('Field of view'): s+=0.3
    if re.search(r'[b-z]$',o['id']) and not re.search(r'eso',o['id']): s-=0.5
    return s
for o in el: o['score']=score(o)
el.sort(key=lambda o:-o['score'])
seenrel=set(); names=collections.Counter(); pick=collections.defaultdict(list)
TARGET={'galaxy':250,'nebula':250,'star':250,'night':250}
orgcap={'galaxy':{'hubble':160,'eso':80,'webb':80},'nebula':{'hubble':140,'eso':130,'webb':48},'star':{'hubble':140,'eso':130,'webb':29},'night':{'eso':250}}
orgn=collections.Counter()
for o in el:
    c=o['cat']
    if len(pick[c])>=TARGET[c]: continue
    rel=o['id'] if c=='night' else o['rel']
    if rel in seenrel: continue
    if c!='night' and (names[(c,o['name'])]>=2 or (o['name'] and names[('any',o['name'])]>=2)): continue
    if orgn[(c,o['org'])]>=orgcap[c].get(o['org'],0): continue
    seenrel.add(rel); names[(c,o['name'])]+=1; names[('any',o['name'])]+=1; orgn[(c,o['org'])]+=1
    pick[c].append(o)
for c in pick: print(c,len(pick[c]),collections.Counter(o['org'] for o in pick[c]))
sel=[o for c in pick for o in pick[c]]
json.dump(sel,open('selected.json','w'))
print(len(sel))
