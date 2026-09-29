import json,re,math,collections
final=json.load(open('final2.json'))
top={}
for org,s in json.load(open('top100.json')).items():
    for p in s.split(','):
        n,i=p.split(':'); top[(org,i)]=int(n)
ORGN={'hubble':'ESA/Hubble','webb':'ESA/Webb','eso':'ESO'}
SRC={'hubble':'https://esahubble.org/images/{}/','webb':'https://esawebb.org/images/{}/','eso':'https://www.eso.org/public/images/{}/'}
THUMB={'hubble':'https://cdn.esahubble.org/archives/images/thumb300y/{}.jpg','webb':'https://cdn.esawebb.org/archives/images/thumb300y/{}.jpg','eso':'https://cdn.eso.org/images/thumb300y/{}.jpg'}
SCREEN={'hubble':'https://cdn.esahubble.org/archives/images/screen/{}.jpg','webb':'https://cdn.esawebb.org/archives/images/screen/{}.jpg','eso':'https://cdn.eso.org/images/screen/{}.jpg'}
SITE={'paranal':'Paranal Observatory, Chile','lasilla':'La Silla Observatory, Chile','alma':'ALMA, Chajnantor plateau, Chile','apex':'APEX, Chajnantor plateau, Chile','elt':'the ELT site, Cerro Armazones, Chile','chile':'Chile','surveytelescopes':'Paranal Observatory, Chile'}
COLOR=re.compile(r'\((Purple|Violet|Blue|Cyan|Green|Yellow|Orange|Red|Magenta|Pink|White)\)',re.I)
def num(s):
    s=s.replace(',','')
    m=re.match(r'\s*([\d.]+)\s*(thousand|million|billion)?',s,re.I)
    if not m: return None
    v=float(m.group(1)); mult={'thousand':1e3,'million':1e6,'billion':1e9}.get((m.group(2) or '').lower(),1)
    return v*mult
def dist_ly(d):
    if not d or re.search(r'[-–]|to |or |:',d): return None
    m=re.match(r'\s*([\d.,]+)\s*(thousand|million|billion)?\s*light[ -]?years?',d,re.I)
    if not m: return None
    return num(m.group(1)+' '+(m.group(2) or ''))
def fov(f):
    m=re.match(r'\s*([\d.]+)\s*x\s*([\d.]+)\s*(arcminutes|arcseconds|degrees)',f or '',re.I)
    if not m: return None
    a,b=float(m.group(1)),float(m.group(2)); u=m.group(3).lower()
    k={'arcminutes':math.pi/10800,'arcseconds':math.pi/648000,'degrees':math.pi/180}[u]
    return a*k,b*k,f.strip()
def fmt_ly(x):
    if x>=1e6: return f"{x/1e6:.2g} million" if x<1e7 else f"{round(x/1e6):,} million"
    if x>=1000: return f"{round(x,-2) if x<1e4 else round(x,-3):,.0f}"
    if x>=10: return f"{round(x):,}"
    return f"{x:.1f}".rstrip('0').rstrip('.')
def clean(t): return re.sub(r'\*+$','',t or '').strip()
recs=[]
for o in final:
    org=o['org']; info=o['info']; iid=o['id']
    rid=('h-' if org=='hubble' else 'w-' if org=='webb' else 'e-')+iid
    parts=[p.strip() for p in info.get('Type','').split('||')]
    objtype=' | '.join(parts[1:])
    tels=sorted({re.sub(r'\s+',' ',f[2]).strip() for f in o['filters'] if len(f)>=3 and f[2]})
    rel=info.get('Release date','').split(',')[0].strip()
    d=dist_ly(info.get('Distance','')); fv=fov(info.get('Field of view',''))
    scale=None
    if d and fv:
        w=2*d*math.tan(fv[0]/2); h=2*d*math.tan(fv[1]/2)
        scale={'frameW':w,'frameH':h,'distance':d,'text':f"Using the source's listed field of view ({fv[2]}) and distance ({info.get('Distance')}), the frame spans roughly {fmt_ly(w)} × {fmt_ly(h)} light-years. Its light set out about {fmt_ly(d)} years before reaching the telescope."}
    elif d:
        scale={'distance':d,'text':f"The source lists a distance of {info.get('Distance')}, so the light in this picture set out roughly {fmt_ly(d)} years ago."}
    filters=[]
    for f in o['filters']:
        if len(f)<2: continue
        m=COLOR.search(f[0]); band=re.sub(r'\s*\(.*?\)','',f[0]).strip()
        filters.append({'band':band,'wavelength':f[1],'instrument':re.sub(r'\s+',' ',f[2]) if len(f)>2 else '','colour':m.group(1).lower() if m else None})
    if (org,iid) in top: recog=f"Ranked #{top[(org,iid)]} on {ORGN[org]}’s published “Top 100 Images” list (an institutional selection, not an audience score)."
    elif re.match(r'potw',iid): recog=f"{ORGN[org]} Picture of the Week (an editorial selection, not an audience score)."
    elif re.match(r'potm',iid): recog=f"{ORGN[org]} Picture of the Month (an editorial selection, not an audience score)."
    elif re.match(r'(heic|weic|eso)\d',iid): recog=f"Official {ORGN[org]} press-release image. No published audience rating."
    else: recog=f"Published in the {ORGN[org]} image archive. No published rating."
    site=None
    if o['cat']=='night':
        for c in (o.get('cats') or []):
            if c in SITE: site=SITE[c]; break
    recs.append({
      'id':rid,'srcId':iid,'org':org,'cat':o['cat'],'title':clean(o['title']),
      'objectName':info.get('Name',''),'objectType':objtype,'distance':info.get('Distance',''),'constellation':info.get('Constellation',''),
      'position':' '.join(x for x in [info.get('Position (RA)',''),info.get('Position (Dec)','')] if x),'fov':info.get('Field of view',''),
      'releaseDate':rel,'site':site,'telescopes':tels,
      'credit':o['credit'],'source':SRC[org].format(iid),
      'img':{'pub':o['disp'],'pubW':o['dw'],'pubH':o['dh'],'origW':o['w'],'origH':o['h'],'large':o.get('large') if o.get('large')!=o['disp'] else None,'largeMB':(lambda s:(float(re.match(r'([\d.]+)',s).group(1))/ (1024 if 'KB' in s else 1)) if s and re.match(r'([\d.]+)',s) else None)(o.get('largeSize')),'thumb':THUMB[org].format(iid),'screen':SCREEN[org].format(iid)},
      'filters':filters,'recognition':recog,'scale':scale,
      'sourceCaption':o['caption'],'imageDescription':o.get('imgDesc','')
    })
json.dump(recs,open('records.json','w'),ensure_ascii=False)
print(len(recs), sum(1 for r in recs if r['scale'] and 'frameW' in r['scale']), sum(1 for r in recs if r['scale']), sum(1 for r in recs if r['filters']))
print(json.dumps(recs[5],ensure_ascii=False)[:1500])
