"""Convert British spellings to US English across the site's text.

Usage: python3 tools/us_spelling.py            (from the site root; edits src/ in place)
Re-run after a re-export, since tools/harvest/export_collection.py writes the original spellings.
Only prose is touched: source titles, credits, URLs, file names and search text are left alone."""
import json, re, glob, os, sys

SUF = r'(?:e|ed|es|ing|ation|ations|able|ably|er|ers)'
RULES = [
    (r'colour', 'color'), (r'centred', 'centered'), (r'centre', 'center'), (r'metre', 'meter'),
    (r'favourit', 'favorit'), (r'neighbour', 'neighbor'), (r'honour', 'honor'), (r'behaviour', 'behavior'),
    (r'vapour', 'vapor'), (r'humour', 'humor'), (r'harbour', 'harbor'), (r'savour', 'savor'), (r'endeavour', 'endeavor'),
    (r'\buncatalogued\b', 'uncataloged'), (r'\bcatalogued\b', 'cataloged'), (r'\bcatalogues\b', 'catalogs'), (r'\bcatalogue\b', 'catalog'),
    (r'\bgrey', 'gray'), (r'(?<![rRtT])ionis(?=' + SUF + r'\b)', 'ioniz'),
    (r'\benergis(?=' + SUF + r'\b)', 'energiz'), (r'organis(?=' + SUF + r'\b)', 'organiz'), (r'\brecognis(?=' + SUF + r'\b)', 'recogniz'),
    (r'\bcharacteris(?=' + SUF + r'\b)', 'characteriz'), (r'\brealis(?=' + SUF + r'\b)', 'realiz'), (r'\bemphasis(?=(?:e|ed|es|ing)\b)', 'emphasiz'),
    (r'\bsummaris', 'summariz'), (r'\bvisualis', 'visualiz'), (r'\bminimis', 'minimiz'), (r'\bmaximis', 'maximiz'), (r'\boptimis', 'optimiz'),
    (r'\bstabilis', 'stabiliz'), (r'\bcrystallis', 'crystalliz'), (r'\bmagnetis(?=(?:e|ed|es|ing|ation)\b)', 'magnetiz'), (r'\bpolaris(?=(?:e|ed|es|ing|ation)\b)', 'polariz'),
    (r'\bapologis', 'apologiz'), (r'\bprioritis', 'prioritiz'), (r'\bcategoris', 'categoriz'), (r'\bspecialis(?=(?:e|ed|es|ing|ation)\b)', 'specializ'),
    (r'\banalys(?=(?:e|ed|ing)\b)', 'analyz'),
    (r'\bprogramme', 'program'), (r'\btravell', 'travel'), (r'\blabell(?=(?:ed|ing)\b)', 'label'), (r'\bmodell(?=(?:ed|ing)\b)', 'model'),
    (r'\bcancell(?=(?:ed|ing)\b)', 'cancel'), (r'\bfuell(?=(?:ed|ing)\b)', 'fuel'), (r'\bsignall(?=(?:ed|ing)\b)', 'signal'),
    (r'sulphur', 'sulfur'), (r'\btowards\b', 'toward'), (r'\bamongst\b', 'among'), (r'\bwhilst\b', 'while'), (r'artefact', 'artifact'),
    (r'\bplough', 'plow'), (r'\bdefence', 'defense'), (r'\btheatre', 'theater'), (r'\bsombre\b', 'somber'), (r'\bfibre', 'fiber'),
    (r'\baluminium\b', 'aluminum'), (r'\bmould', 'mold'), (r'\bmanoeuvres\b', 'maneuvers'), (r'\bmanoeuvred\b', 'maneuvered'), (r'\bmanoeuvre\b', 'maneuver'), (r'\bmanoeuvring\b', 'maneuvering'), (r'\bglamour', 'glamor'),
]
RX = [(re.compile(p, re.I), r) for p, r in RULES]

def fix(text):
    def sub(rep):
        def f(m):
            s = m.group(0)
            out = rep
            if s.isupper(): return out.upper()
            if s[:1].isupper(): return out[:1].upper() + out[1:]
            return out
        return f
    for rx, rep in RX:
        text = rx.sub(sub(rep), text)
    return text

KEEP = {'credit', 'source', 'sources', 'img', 'q', 'id', 'org', 'cat', 'tel', 'thumb', 'srcId', 'url'}
def walk(v, key=None):
    if key in KEEP: return v
    if isinstance(v, str): return fix(v)
    if isinstance(v, list): return [walk(x) for x in v]
    if isinstance(v, dict): return {k: walk(x, k) for k, x in v.items()}
    return v

root = sys.argv[1] if len(sys.argv) > 1 else 'src'
changed = 0
for f in glob.glob(f'{root}/data/collection/photos/*.json') + [f'{root}/data/onthisday.json', f'{root}/data/collection/index.json']:
    d = json.load(open(f)); n = walk(d)
    if n != d: json.dump(n, open(f, 'w'), ensure_ascii=False); changed += 1
# Code and markup: prose only. Skip lines that are matching patterns against source data.
for f in glob.glob(f'{root}/**/*.js', recursive=True) + glob.glob(f'{root}/**/*.html', recursive=True) + glob.glob(f'{root}/css/*.css'):
    if '/collection/' in f: continue
    s = open(f).read()
    out = '\n'.join(l if ('RegExp' in l or re.search(r"\[\s*'\w+',\s*/", l) or 'labelledby' in l) else fix(l) for l in s.split('\n'))
    if out != s: open(f, 'w').write(out); changed += 1
print('files changed:', changed)
