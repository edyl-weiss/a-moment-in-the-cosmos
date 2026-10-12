"""Put the name people know first.  Run from the repo root:  python3 tools/names/common_names.py [--write]

For every photograph in the collection (and the curated catalog), the object names in its "celestial" line
are reordered so the familiar name leads ("Orion Nebula, Messier 42, Messier 43" rather than
"Messier 42, Messier 43, Orion Nebula"), and a well-known nickname is added when the record only gives a
catalog number (M45 gains "Pleiades", NGC 7293 gains "Helix Nebula").

Titles that are only a catalog label ("NGC 6543", "M45 Pleiades") become "Familiar name (catalog label)".
Editorial titles ("Hubble's sharpest view of the Orion Nebula") are left alone.
Without --write it only prints what would change. Idempotent.
"""
import json, re, sys, os, glob

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
COL = os.path.join(ROOT, 'src', 'data', 'collection')

# Familiar names for well-known catalog objects (Messier, NGC, IC and a few others).
KNOWN = {
    'm1': 'Crab Nebula', 'm8': 'Lagoon Nebula', 'm13': 'Hercules Cluster', 'm16': 'Eagle Nebula', 'm17': 'Omega Nebula',
    'm20': 'Trifid Nebula', 'm27': 'Dumbbell Nebula', 'm31': 'Andromeda Galaxy', 'm33': 'Triangulum Galaxy',
    'm42': 'Orion Nebula', 'm43': "De Mairan's Nebula", 'm44': 'Beehive Cluster', 'm45': 'Pleiades', 'm51': 'Whirlpool Galaxy',
    'm57': 'Ring Nebula', 'm63': 'Sunflower Galaxy', 'm64': 'Black Eye Galaxy', 'm74': 'Phantom Galaxy', 'm76': 'Little Dumbbell Nebula',
    'm81': "Bode's Galaxy", 'm82': 'Cigar Galaxy', 'm83': 'Southern Pinwheel Galaxy', 'm87': 'Virgo A', 'm97': 'Owl Nebula',
    'm101': 'Pinwheel Galaxy', 'm104': 'Sombrero Galaxy',
    'ngc224': 'Andromeda Galaxy', 'ngc253': 'Sculptor Galaxy', 'ngc598': 'Triangulum Galaxy', 'ngc1952': 'Crab Nebula',
    'ngc1976': 'Orion Nebula', 'ngc2024': 'Flame Nebula', 'ngc2070': 'Tarantula Nebula', 'ngc2237': 'Rosette Nebula',
    'ngc2264': 'Cone Nebula', 'ngc2359': "Thor's Helmet", 'ngc2392': 'Eskimo Nebula', 'ngc2632': 'Beehive Cluster',
    'ngc3132': 'Southern Ring Nebula', 'ngc3242': 'Ghost of Jupiter', 'ngc3372': 'Carina Nebula', 'ngc4038': 'Antennae Galaxies',
    'ngc4039': 'Antennae Galaxies', 'ngc4594': 'Sombrero Galaxy', 'ngc4676': 'Mice Galaxies', 'ngc4755': 'Jewel Box',
    'ngc4826': 'Black Eye Galaxy', 'ngc5128': 'Centaurus A', 'ngc5139': 'Omega Centauri', 'ngc5194': 'Whirlpool Galaxy',
    'ngc5457': 'Pinwheel Galaxy', 'ngc6302': 'Butterfly Nebula', 'ngc6334': "Cat's Paw Nebula", 'ngc6357': 'Lobster Nebula',
    'ngc6514': 'Trifid Nebula', 'ngc6523': 'Lagoon Nebula', 'ngc6543': "Cat's Eye Nebula", 'ngc6611': 'Eagle Nebula',
    'ngc6618': 'Omega Nebula', 'ngc6720': 'Ring Nebula', 'ngc6853': 'Dumbbell Nebula', 'ngc6888': 'Crescent Nebula',
    'ngc6960': 'Veil Nebula', 'ngc6992': 'Veil Nebula', 'ngc7000': 'North America Nebula', 'ngc7009': 'Saturn Nebula',
    'ngc7293': 'Helix Nebula', 'ngc7317': "Stephan's Quintet", 'ngc7318': "Stephan's Quintet", 'ngc7319': "Stephan's Quintet",
    'ngc7320': "Stephan's Quintet", 'ngc7635': 'Bubble Nebula', 'ngc104': '47 Tucanae', 'ngc292': 'Small Magellanic Cloud',
    'ic434': 'Horsehead Nebula', 'b33': 'Horsehead Nebula', 'barnard33': 'Horsehead Nebula', 'ic1805': 'Heart Nebula',
    'ic1848': 'Soul Nebula', 'ic2177': 'Seagull Nebula', 'ic2944': 'Running Chicken Nebula', 'ic5070': 'Pelican Nebula',
    'ic4406': 'Retina Nebula', 'hickson92': "Stephan's Quintet", '30doradus': 'Tarantula Nebula', 'eso350-40': 'Cartwheel Galaxy',
}
CATALOG = re.compile(r"^(m|messier|ngc|ic|ugc|pgc|eso|hd|hh|herbig.haro|sh ?2|sharpless|lbn|ldn|barnard|b|abell|arp|hickson|iras|2mass|sdss|macs|rcw|gum|vdb|westerlund|mrk|markarian|collinder|melotte|trumpler|leda|afgl|sn|n|dem|lha|wise|pn|ngp|zw|i zw|rx|xmm|psz|spt|act|plck|cl|j|ckv|ck|ps|g|gn|jades|ceers|hst|hudf|xdf|udf|dr|mcg|2dfgrs|esp|lrg|wl|whl|redmapper|sgr|sagittarius [a-z]\*?|[a-z]{1,4})[ .+-]?\d", re.I)
DESCRIPTIVE = re.compile(r"\b(nebula|nebulae|galaxy|galaxies|cluster|cloud|clouds|quintet|field|loop|remnant|pillars|centre|center|bar|bubble|ring|helmet|jupiter|box|cliffs|mountain|veil|arc|lens|eye|tucanae|centauri|carinae)\b", re.I)

def key(name):
    n = name.lower().replace('messier', 'm').replace('barnard', 'b')
    return re.sub(r'[^a-z0-9-]', '', n)

GENERIC = re.compile(r"^(the )?(young |old |open |globular |star |stellar |galaxy |spiral |barred spiral |elliptical |dwarf |irregular |planetary |reflection |emission |dark |star-forming )*(cluster|nebula|galaxy|galaxies|cloud|group|supernova|star|stars)$", re.I)
# Host galaxies and regions: where the object is, not what it is, so they follow its own names
HOST = re.compile(r"^((large|small) magellanic cloud|lmc|smc)$", re.I)
def same(a, b): return flat(a) == flat(b)
def flat(t): return re.sub(r'[^a-z0-9]', '', t.lower().replace('’', "'").replace('“', '"').replace('”', '"').replace('messier', 'm'))

def rank(name):
    if GENERIC.match(name.strip()): return 4                               # "Star cluster": not a name at all
    if DESCRIPTIVE.search(name) and not CATALOG.match(name): return 0      # "Orion Nebula", "Omega Centauri"
    if not re.search(r'\d', name) and not CATALOG.match(name): return 1    # other proper names: "Cassiopeia A" has none
    return 2                                                               # catalog labels

def split_celestial(cel):
    marker = ' · constellation' if ' · constellation' in cel else ' · about'
    head, sep, rest = cel.partition(marker)
    if head.startswith('constellation') or not head.strip(): return None, cel
    names = [x.strip() for x in re.split(r'\s*[·;]\s*|,\s+', head) if x.strip()]
    return names, (sep + rest)

def reorder(names):
    names = [n for n in names if not re.match(r'about [\d,]+ (light|million|billion)', n, re.I)]
    have = {n.lower() for n in names}
    extra = []
    for n in names:
        common = KNOWN.get(key(n))
        if common and common.lower() not in have and common.lower() not in {x.lower() for x in extra}:
            extra.append(common)
    allnames = names + extra
    # the best-known name for any of its labels leads ("Omega Nebula" before "Swan Nebula" for M17)
    canon = {flat(KNOWN[key(n)]) for n in allnames if key(n) in KNOWN}
    hosts = len(allnames) > 1
    def order(n):
        r = rank(n)
        if hosts and HOST.match(n.strip()) and any(not HOST.match(x.strip()) and rank(x) < 4 for x in allnames): r = 3
        return (r, 0 if flat(n) in canon else 1, allnames.index(n))
    return sorted(allnames, key=order), extra

# A title that is nothing but labels for its object (plus maybe an instrument note) gets the familiar name first.
NOTE = re.compile(r'\s*(\([^)]*\))\s*$')
def retitle(title, names):
    common = next((n for n in names if rank(n) == 0), None)
    if not common: return title
    m = NOTE.search(title)
    note = m.group(1)[1:-1].strip() if m else ''
    core = NOTE.sub('', title).strip()
    known = {flat(n) for n in names}
    # "M31 (Andromeda Galaxy)": the note is itself a name for the object
    common_flat = flat(common)
    if note and (flat(note) in known or common_flat.startswith(flat(note))):
        core, note = f'{core}, {note}', ''
    # already leads with a familiar name: leave it
    if any(flat(core).startswith(flat(n)) or flat(n).startswith(flat(core)) for n in names if rank(n) < 2): return title
    pieces = [p for p in re.split(r'\s*(?:,|\band\b|&|/)\s*', core, flags=re.I) if p]
    if not pieces or not all(flat(p) in known or common_flat.startswith(flat(p)) for p in pieces): return title
    commons = [p for p in pieces if rank(p) < 2]
    head = next((n for n in names if rank(n) == 0 and any(same(n, c) for c in commons)), common)
    labels = [p for p in pieces if rank(p) == 2]
    new = f'{head} ({", ".join(labels)})' if labels else head
    return f'{new}, {note}' if note else new

def main(write):
    idx_path = os.path.join(COL, 'index.json')
    idx = json.load(open(idx_path, encoding='utf-8'))
    by_id = {e['id']: e for e in idx}
    changed_titles, changed_names = [], 0
    for f in sorted(glob.glob(os.path.join(COL, 'photos', '*.json'))):
        r = json.load(open(f, encoding='utf-8'))
        if r.get('cat') == 'night': continue
        names, tail = split_celestial(r.get('celestial') or '')
        if not names: continue
        ordered, extra = reorder(names)
        cel = ', '.join(ordered) + tail
        title = retitle(r['title'], ordered)
        if cel == r['celestial'] and title == r['title']: continue
        if title != r['title']: changed_titles.append((r['id'], r['title'], title))
        if cel != r['celestial']: changed_names += 1
        old_cel = r['celestial']
        r['celestial'], r['title'] = cel, title
        e = by_id.get(r['id'])
        if e:
            e['title'] = title
            e['q'] = e['q'].replace(old_cel.split(' · about')[0], cel.split(' · about')[0], 1)
        if write: json.dump(r, open(f, 'w', encoding='utf-8'), ensure_ascii=False)
    if write: json.dump(idx, open(idx_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'{changed_names} name lines reordered or given a familiar name; {len(changed_titles)} titles changed')
    for i, a, b in changed_titles: print(f'  {i}: {a}  →  {b}')

if __name__ == '__main__':
    main('--write' in sys.argv)
