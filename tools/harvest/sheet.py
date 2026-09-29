import json,base64,re,sys
t=json.load(open(sys.argv[1]))[0]['text']
m=re.search(r'SHEET:([A-Za-z0-9+/=]+):END',t)
open(sys.argv[2],'wb').write(base64.b64decode(m.group(1))); print(sys.argv[2])
