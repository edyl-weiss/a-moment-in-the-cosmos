import json,re,collections
L=json.load(open('list2.json'))
otd=json.load(open('/home/claude/cosmos-v2/src/data/onthisday.json'))
cnt=collections.Counter({k:len(v['published']) for k,v in otd.items()})
SOLAR=re.compile(r'jupiter|saturn|uranus|neptune|pluto|mars\b|venus|mercury|\bmoon\b|moons|europa|\bio\b|titan|ganymede|callisto|enceladus|comet|asteroid|kuiper|trans-neptunian|ceres|vesta|\bsun\b|solar system|aurora|interstellar object|oumuamua|borisov|charon|triton|eris\b|makemake|haumea|dart\b|dimorphos|didymos|earth',re.I)
BADT=re.compile(r'inset|collage|compar|hubble and webb|webb and hubble|zoom|panel|\bkey\b|labeled|annotat|wide-field|ground-based|\bdss\b|digitized sky|location|finder|in context|context image|pull-?out|sequence|over time|progression|three views|multiple|multi-band|images of|views of|before|after|field of view|pointing|footprint|outline|crop|close-up|detail|cutout|graphic|\bmap\b|chart|scale|compass|kitt peak|chandra|spitzer|x-ray|composite of|slime|illustrat|arrow|circled|marked',re.I)
def cat(x):
    s=(x['t']+' '+x['cap']).lower()
    if re.search(r'nebula|remnant|pillar|bubble|star-forming region|star forming region|molecular cloud|outflow|herbig|jets?\b',s[:300]): return 'nebula'
    if re.search(r'globular|open cluster|star cluster|stellar nursery',s[:300]) : return 'star'
    if re.search(r'galax|quasar|deep field|lens',s): return 'galaxy'
    if re.search(r'cluster|\bstar\b|stars\b|nova\b|binary|protostar|dwarf',s): return 'star'
    return None
C=[]
for x in L:
    if x['dup'] or x.get('dup2') or SOLAR.search(x['t']+' '+x['cap'][:200]) or BADT.search(x['t']) or BADT.search(x['cap'][:200]): continue
    c=cat(x)
    if not c: continue
    x['cat']=c; x['have']=cnt.get(x['day'],0); C.append(x)
thin={k for k,v in cnt.items() if v<3}|{'12-26'}
C.sort(key=lambda x:(0 if x['day'] in thin else 1, x['have'], -(x['src']=='webb'), -x['year']))
seen=set(); R=[]
for x in C:
    stem=re.sub(r'\(.*?\)|nircam|miri|image|hubble|webb|nasa|’s|\'s|[^a-z0-9 ]','',x['t'].lower()).strip()[:28]
    if stem in seen: continue
    seen.add(stem); R.append(x)
print(len(C),len(R), collections.Counter(x['cat'] for x in R))
R2=R[280:]; R=R[:280]; json.dump(R2,open("review2.json","w"),ensure_ascii=False)
json.dump(R,open('review.json','w'),ensure_ascii=False)
print(len(R), 'thin', sum(x['day'] in thin for x in R), collections.Counter(x['have'] for x in R))
