"""Order the daily schedule newest first.  Run from the repo root after adding photographs:
    python3 tools/harvest/reschedule.py [--today YYYY-MM-DD]

Day i shows order[categoryOrder[i % 4]][floor(i / 4) % length]. Days that have already been shown (through
tomorrow, so today's email and tomorrow's photograph never change) keep their photographs. Everything after
that is re-sorted by a score measured in days: the release date (newer first), plus head starts for
  - a place on an observatory's published Top 100 list (up to about three years for #1),
  - a famous object (one with a well-known name: the Orion Nebula, the Pillars of Creation, the Whirlpool…),
  - a colorful image (narrowband filters that pick out glowing gases, or four or more assigned colors),
  - a headline release (press release or Picture of the Month) over an archive or weekly picture,
  - Webb data (a modest nudge, not a rule).
Any photograph in the collection that the schedule doesn't list yet is added. Idempotent for a given day.
"""
import json, os, re, sys, glob
from datetime import date, datetime, timezone

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
DATA = os.path.join(ROOT, 'src', 'data')
MONTHS = {m: i + 1 for i, m in enumerate(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])}
# Head starts, in days of release date
TOP100 = (300, 900)           # base + extra for #1, scaled down to #100
FAMOUS = 500
COLORFUL = 250
HEADLINE = 150
WEBB = 90                     # a nudge, not a rule
VARIETY = 900                 # a different observatory may jump ahead by up to this many days

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'names'))
from common_names import KNOWN, split_celestial, rank as name_rank   # noqa: E402
FAMOUS_NAMES = {n.lower() for n in KNOWN.values()} | {'pillars of creation', 'cosmic cliffs', 'pleiades', 'magellanic', 'milky way', 'carina nebula', 'tarantula nebula', 'orion nebula', 'horsehead nebula'}
NARROW = re.compile(r'h-?alpha|hα|o ?iii|s ?ii\b|n ?ii\b|h-?beta|\[o', re.I)   # glowing gases in visible light

def head_start(r, webb):
    days = 0
    m = re.search(r'Ranked #(\d+) on', r['recognition']['text'])
    if m: days += TOP100[0] + TOP100[1] * (100 - int(m.group(1))) / 99
    names, _ = split_celestial(r.get('celestial') or '')
    text = ' '.join(names or []).lower() + ' ' + r['title'].lower()
    if any(f in text for f in FAMOUS_NAMES): days += FAMOUS
    filters = (r.get('understand') or {}).get('filters', [])
    colors = {f[1] for f in filters if f[1] != 'source lists band only'}
    if any(NARROW.search(f[0]) for f in filters) or len(colors) >= 4: days += COLORFUL
    rec = r['recognition']['text']
    if re.search(r'press-release|Picture of the Month|science release|First Look|image release', rec): days += HEADLINE
    if webb: days += WEBB
    return days

def parse_date(s):
    m = re.search(r'(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})', s or '')
    if m and m.group(2) in MONTHS: return date(int(m.group(3)), MONTHS[m.group(2)], int(m.group(1)))
    y = re.search(r'\d{4}', s or '')
    return date(int(y.group(0)), 7, 1) if y else date(1990, 1, 1)

def load_schedule():
    txt = open(os.path.join(DATA, 'schedule.js'), encoding='utf-8').read()
    return json.loads(txt[txt.index('{'):txt.rindex('}') + 1])

def photos():
    """id -> (category, release date, is Webb) for every photograph, curated and collection."""
    out = {}
    idx = {e['id']: e for e in json.load(open(os.path.join(DATA, 'collection', 'index.json'), encoding='utf-8'))}
    for f in glob.glob(os.path.join(DATA, 'collection', 'photos', '*.json')):
        r = json.load(open(f, encoding='utf-8'))
        e = idx.get(r['id'], {})
        webb = r['org'] == 'webb' or 'webb' in (e.get('tel') or [])
        out[r['id']] = (r['cat'], parse_date(r['releaseDate']).toordinal() + head_start(r, webb), r['org'])
    cat_js = open(os.path.join(DATA, 'catalog.js'), encoding='utf-8').read()
    for block in re.split(r'\n\s*\{\s*\n', cat_js)[1:]:
        i = re.search(r"\bid: '([^']+)'", block); c = re.search(r"\bcat: '([^']+)'", block); d = re.search(r"releaseDate: '([^']+)'", block)
        # the hand-picked photographs are all famous, headline images
        if i and c and d: out[i.group(1)] = (c.group(1), parse_date(d.group(1)).toordinal() + FAMOUS + HEADLINE + (WEBB if i.group(1).startswith('weic') else 0),
                                             'webb' if i.group(1).startswith('weic') else 'hubble' if i.group(1).startswith('heic') else 'eso')
    return out

def varied(ranked, info, before):
    """Keep the score order, but don't let one observatory run three days in a row in a category when a
    photo from another source scores within VARIETY days of the leader."""
    out, rest, last = [], list(ranked), [info[i][2] for i in before[-2:] if i in info]
    while rest:
        pick = 0
        if len(last) >= 2 and last[-1] == last[-2] == info[rest[0]][2]:
            for k, i in enumerate(rest[1:], 1):
                if info[rest[0]][1] - info[i][1] > VARIETY: break
                if info[i][2] != last[-1]: pick = k; break
        i = rest.pop(pick)
        out.append(i); last = (last + [info[i][2]])[-2:]
    return out

def main():
    arg = next((a for a in sys.argv[1:] if re.match(r'\d{4}-\d{2}-\d{2}$', a)), None)
    today = date.fromisoformat(arg) if arg else datetime.now(timezone.utc).date()
    s = load_schedule()
    launch = date.fromisoformat(s['launch'])
    cats = s['categoryOrder']
    last_fixed_day = (today - launch).days + 1                     # through tomorrow
    keep = {c: 0 for c in cats}
    for i in range(0, max(0, last_fixed_day) + 1):
        c = cats[i % len(cats)]
        keep[c] = max(keep[c], i // len(cats) + 1)
    info = photos()
    order = {}
    for c in cats:
        fixed = s['order'][c][:keep[c]]
        pool = [i for i in s['order'][c][keep[c]:] if i in info] + [i for i, v in info.items() if v[0] == c and i not in s['order'][c]]
        pool = list(dict.fromkeys(pool))
        rank = {i: n for n, i in enumerate(pool)}
        order[c] = fixed + varied(sorted(pool, key=lambda i: (-info[i][1], rank[i])), info, fixed)
        print(f'{c}: {len(fixed)} kept, {len(pool)} ordered; next up: {order[c][keep[c]:keep[c] + 3]}')
    s['order'] = order
    js = ('/* Daily schedule: category rotation + per-category order.\n'
          '   Day i shows order[categoryOrder[i % 4]][floor(i/4) % length].\n'
          '   Days already shown keep their photographs; the rest runs by score: newest first, with head starts for\n'
          '   Top-100 images, famous objects, colorful images, headline releases and (slightly) Webb.\n'
          '   Generated by tools/harvest/reschedule.py (and export_collection.py, which appends) — edit there, not here. */\n'
          'export const SCHEDULE = ' + json.dumps(s, indent=2) + ';\n')
    open(os.path.join(DATA, 'schedule.js'), 'w', encoding='utf-8').write(js)

if __name__ == '__main__':
    main()
