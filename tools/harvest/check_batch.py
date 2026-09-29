#!/usr/bin/env python3
"""Usage: python3 check_batch.py NN  -> checks stories/batchNN.json against packets/batchNN.json.
Reports: missing ids, bad JSON shape, story word count outside 120-180, copied runs of >=9 words from the source caption,
and numbers in the story that don't appear in the source packet."""
import json,re,sys
k=sys.argv[1]
P={r['id']:r for r in json.load(open(f'packets/batch{k}.json'))}
try: S=json.load(open(f'stories/batch{k}.json'))
except Exception as e: print('CANNOT READ stories file:',e); sys.exit(1)
S={s.get('id'):s for s in S}
words=lambda t:re.findall(r"[A-Za-z0-9’'\-]+",t.lower())
problems=0
for pid,p in P.items():
    s=S.get(pid)
    if not s: print(pid,'MISSING'); problems+=1; continue
    for key in ['caption','story','explore','understand','alt']:
        if key not in s: print(pid,'missing field',key); problems+=1
    story=' '.join(s.get('story',[]))
    n=len(words(story))
    if not 120<=n<=180: print(pid,f'word count {n} (need 120-180)'); problems+=1
    src=' '.join(p['sourceCaption'])+' '+p.get('imageDescription','')
    sw=words(src); tw=words(story+' '+' '.join(s.get('explore',[])))
    grams=set(tuple(sw[i:i+9]) for i in range(len(sw)-8))
    for i in range(len(tw)-8):
        if tuple(tw[i:i+9]) in grams: print(pid,'COPIED run:',' '.join(tw[i:i+9])); problems+=1; break
    srcnums=set(re.findall(r'\d[\d,.]*',json.dumps(p,ensure_ascii=False)))
    for num in re.findall(r'\d[\d,.]*',story+' '+' '.join(s.get('explore',[]))):
        num=num.rstrip('.,')
        if num and num not in srcnums and num.replace(',','') not in {x.replace(',','') for x in srcnums}:
            print(pid,'number not in source:',num); problems+=1
extra=set(S)-set(P)
if extra: print('unexpected ids',extra)
print('TOTAL problems:',problems,'records:',len(P),'stories:',len(S))
