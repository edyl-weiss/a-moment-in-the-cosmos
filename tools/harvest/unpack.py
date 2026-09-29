import json,base64,gzip,sys,re
out=sys.argv[1]; files=sys.argv[2:]
b=''
for f in files:
    t=json.load(open(f))[0]['text']
    m=re.search(r'CHUNK\d+:([A-Za-z0-9+/=]+):END',t); assert m, f
    b+=m.group(1)
data=json.loads(gzip.decompress(base64.b64decode(b)))
json.dump(data,open(out,'w'))
print(out,len(data))
