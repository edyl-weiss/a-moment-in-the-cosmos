"""Collect CHUNKn:...:END tool outputs saved after a given timestamp into one JSON object file."""
import json,re,glob,sys
T='/root/.claude/projects/-home-claude/b515d94d-4a02-50e0-a375-b15d8e8a1444/tool-results'
out,lo,hi=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]) if len(sys.argv)>3 else 10**14
parts={}
for f in glob.glob(T+'/mcp-remote-devices-Claude_Browser__javascript_tool-*.txt'):
    ts=int(f.rsplit('-',1)[1][:-4])
    if not lo<=ts<=hi: continue
    t=json.load(open(f))[0]['text']
    m=re.match(r'"?CHUNK(\d+):(.*):END',t,re.S)
    if m: parts[int(m.group(1))]=m.group(2)
raw=''.join(parts[i] for i in range(len(parts)))
try: d=json.loads(raw)
except Exception: d=json.loads(json.loads('"'+raw+'"'))
json.dump(d,open(out,'w')); print(out,len(d),sorted(parts))
