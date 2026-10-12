"""Five more additions, October 2026 (recent releases, 2025–2026). Run from the repo root:
    python3 tools/harvest/add_2026_10b.py
Writes photos/<id>.json and index.json entries (idempotent); scheduling is done by reschedule.py.
Facts come from each source page (linked in `sources`); stories follow WRITING_GUIDE.md.
Same record format as add_2026_10.py. The size check follows the README's selection rule
and the site's meetsMinimum (at least 1920 × 1080, or 1440 × 1440 for a frame square within 5%), so the
square AFGL 4106 frame qualifies. The Egg Nebula (heic2604a, 1668 × 1552) was considered but is neither.
Where a source page gives no constellation or position (AFGL 4106), `sky` is computed from the
object's IRAS designation (IRAS 10215-5916, B1950) precessed to J2000.
"""
import json, os

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
COL = os.path.join(ROOT, 'src', 'data', 'collection')

def behind(obs, credit, processing='Colors assigned by filter, as listed.'):
    return {'observatory': obs, 'instrument': obs, 'people': f'See full credit: {credit}',
            'exposure': 'Not published on the source page.',
            'technique': 'Not stated by the source (single frame, stack, mosaic or panorama unknown).',
            'processing': processing}

def scale(fov, dist, w, h, unit='light-years'):
    return (f"Using the source's listed field of view ({fov} arcminutes) and distance ({dist} light years), "
            f"the frame spans roughly {w} × {h} {unit}. Its light set out about {dist} years before reaching the telescope.")

W = 'https://cdn.esawebb.org/archives/images'
H = 'https://cdn.esahubble.org/archives/images'
E = 'https://cdn.eso.org/images'
BAND = 'source lists band only'

RECORDS = [
  {
    'id': 'h-potw2514a', 'cat': 'nebula', 'org': 'hubble', 'tel': ['hubble'],
    'title': 'Kohoutek 4-55, Hubble WFPC2’s final image',
    'caption': 'The planetary nebula Kohoutek 4-55, imaged by the Hubble Space Telescope',
    'releaseDate': '7 April 2025',
    'celestial': 'Kohoutek 4-55, PN K 4-55 · constellation Cygnus · about 4,600 light-years away (source figure)',
    'img': {'pub': f'{H}/large/potw2514a.jpg', 'pubW': 2943, 'pubH': 2791, 'origW': 2943, 'origH': 2791, 'largeMB': 2.3,
            'thumb': f'{H}/thumb300y/potw2514a.jpg', 'screen': f'{H}/screen/potw2514a.jpg'},
    'credit': 'ESA/Hubble & NASA, K. Noll',
    'source': 'https://esahubble.org/images/potw2514a/',
    'recognition': {'kind': 'editorial', 'text': 'ESA/Hubble Picture of the Week, April 2025 (an editorial selection, not an audience score).'},
    'story': [
      'Shells of colored gas nest one inside another in this Hubble view of Kohoutek 4-55, a planetary nebula in our own galaxy, about 4,600 light-years away in Cygnus, the Swan. Greenish clouds sit at the center inside a bright, ragged ring. Around them come silvery-blue gas, a fainter yellow ring and a billowing oval of orange and red.',
      'A planetary nebula marks the closing act of a giant star. When a red giant runs out of fuel and casts off its outer layers, its core shrinks, flares with one last burst of fusion and becomes extremely hot. Its ultraviolet light makes the expelled gas glow: here nitrogen shows as red and orange, hydrogen as green and oxygen as blue. After only some tens of thousands of years, just a white dwarf remains.',
      'The picture is also a farewell. It was the last taken with Hubble’s Wide Field and Planetary Camera 2, installed in 1993. The data were recorded ten days before the camera was removed in 2009, after 16 years of work, and have now been reprocessed.'
    ],
    'scale': scale('1.49 x 1.41', '4600', '2.0', '1.9'),
    'understand': {'summary': "Hubble's Wide Field and Planetary Camera 2 through three narrowband filters: oxygen (O III, 502 nm) in blue, hydrogen (H-alpha, 656 nm) in green and nitrogen (N II, 658 nm) in red and orange, as the caption describes.",
                   'filters': [['502 nm · Optical O III (Hubble WFPC2)', 'blue'], ['656 nm · Optical H-alpha (Hubble WFPC2)', 'green'],
                               ['658 nm · Optical N II (Hubble WFPC2)', 'red, orange']],
                   'eye': 'Each narrowband filter isolates the glow of one gas, and the colors are assigned to separate them, so the eye would not see this palette.'},
    'behind': behind('Hubble Space Telescope WFPC2', 'ESA/Hubble & NASA, K. Noll'),
    'explore': ['Kohoutek 4-55 has an unusual layered structure: a bright inner ring, a fainter layer of gas around it and a broad halo of glowing nitrogen. WFPC2, which replaced Hubble’s original Wide Field and Planetary Camera, produced many of the telescope’s best-known images before Wide Field Camera 3 took its place during the final servicing mission.'],
    'sources': [['ESA/Hubble image page (potw2514a)', 'https://esahubble.org/images/potw2514a/']],
    'alt': 'A layered planetary nebula: greenish clouds inside a jagged bright ring, wrapped in blue gas, a faint yellow ring and a wide orange and red oval.',
    'sky': {'con': 'Cyg', 'ra': 311.292, 'dec': 44.654}
  },
  {
    'id': 'h-potw2502a', 'cat': 'nebula', 'org': 'hubble', 'tel': ['hubble'],
    'title': 'Protostars HOPS 150 and HOPS 153 in the Orion Nebula',
    'caption': 'The protostars HOPS 150 and HOPS 153 and a protostellar jet, imaged by the Hubble Space Telescope',
    'releaseDate': '13 January 2025',
    'celestial': 'HOPS 150, HOPS 153 · constellation Orion · about 1,300 light-years away (source figure)',
    'img': {'pub': f'{H}/large/potw2502a.jpg', 'pubW': 3140, 'pubH': 3140, 'origW': 3140, 'origH': 3140, 'largeMB': 2.3,
            'thumb': f'{H}/thumb300y/potw2502a.jpg', 'screen': f'{H}/screen/potw2502a.jpg'},
    'credit': 'ESA/Hubble & NASA, T. Megeath',
    'source': 'https://esahubble.org/images/potw2502a/',
    'recognition': {'kind': 'editorial', 'text': 'ESA/Hubble Picture of the Week, January 2025 (an editorial selection, not an audience score).'},
    'story': [
      'A narrow, colorful jet streaks through this Hubble view of a dusty corner of the Orion Nebula, near a glow crossed by a dark band. The glow is HOPS 150, a pair of young protostars orbiting each other. The dark band is a cloud of gas and dust falling onto them, over 2,000 times wider than the Earth–Sun distance.',
      'The Orion Nebula, about 1,300 light-years away, is the nearest massive star-forming region to Earth and holds hundreds of newborn stars. It can be seen with the unaided eye below Orion’s Belt. Each protostar in HOPS 150 feeds from its own small, dusty disc, and its balance of infrared to other light suggests it is about halfway to maturity.',
      'The jet comes from HOPS 153, a much younger neighbor just outside the frame. It is still buried in cold, dense gas that Hubble cannot see through, but its jet shows up where it rams into surrounding dust and gas. In time its jets will carve bubbles and heat gas, which may slow star birth nearby and its own growth.'
    ],
    'scale': scale('2.07 x 2.07', '1300', '0.78', '0.78'),
    'understand': {'summary': "Hubble's Wide Field Camera 3 in near-infrared light, through filters for glowing iron (Fe II, 1.26 and 1.64 μm) and hydrogen (Paschen-beta, 1.28 μm) plus two nearby continuum bands. The color mapping isn't published.",
                   'filters': [['1.26 μm · Infrared Fe II (Hubble WFC3)', BAND], ['1.28 μm · Infrared Paschen-beta (Hubble WFC3)', BAND],
                               ['1.3 μm · Infrared Paschen-beta continuum (Hubble WFC3)', BAND], ['1.64 μm · Infrared Fe II (Hubble WFC3)', BAND],
                               ['1.67 μm · Infrared Fe II continuum (Hubble WFC3)', BAND]],
                   'eye': 'All of this light is near-infrared, which the eye cannot see, so every color here is assigned.'},
    'behind': behind('Hubble Space Telescope WFC3', 'ESA/Hubble & NASA, T. Megeath', 'Not published.'),
    'explore': ['Both protostars are named after the Herschel Orion Protostar Survey, carried out with ESA’s Herschel Space Observatory. As HOPS 153 matures, its jets will push material and energy out into space.'],
    'sources': [['ESA/Hubble image page (potw2502a)', 'https://esahubble.org/images/potw2502a/']],
    'alt': 'Dark, puffy dust clouds with a glowing region crossed by a dark band, a thin, wispy blue and pink jet, and a few bright stars.',
    'sky': {'con': 'Ori', 'ra': 84.54, 'dec': -7.154}
  },
  {
    'id': 'h-heic2505i', 'cat': 'galaxy', 'org': 'hubble', 'tel': ['hubble'],
    'title': 'Barred spiral galaxy NGC 5335 (Hubble 35th anniversary)',
    'caption': 'The barred spiral galaxy NGC 5335, imaged by the Hubble Space Telescope',
    'releaseDate': '23 April 2025',
    'celestial': 'NGC 5335 · constellation Virgo',
    'img': {'pub': f'{H}/publicationjpg/heic2505i.jpg', 'pubW': 4000, 'pubH': 3965, 'origW': 4076, 'origH': 4040,
            'large': f'{H}/large/heic2505i.jpg', 'largeMB': 4.7, 'thumb': f'{H}/thumb300y/heic2505i.jpg', 'screen': f'{H}/screen/heic2505i.jpg'},
    'credit': 'NASA, ESA, STScI',
    'source': 'https://esahubble.org/images/heic2505i/',
    'recognition': {'kind': 'editorial', 'text': 'One of Hubble’s 35th-anniversary images, released April 2025 (an editorial selection, not an audience score).'},
    'story': [
      'A milky yellow oval glows at the heart of this Hubble portrait of NGC 5335, a galaxy seen face-on in the constellation Virgo. A bar of stars runs across its bright core, ringed by a thick band of blue stars dotted with white patches. Fainter arms wind counterclockwise outward, laced with dark streaks of dust.',
      'Astronomers class NGC 5335 as a flocculent spiral. Instead of the long, well-defined arms seen in many galaxies, including the Milky Way, it forms stars in scattered, patchy streamers across its disk. The bar plays a key role: it channels gas toward the center, where that gas fuels the birth of new stars.',
      'Bars are common. They turn up in about 30 percent of the galaxies astronomers have observed, our own among them, and they may not last forever, perhaps forming and fading over spans of two billion years. Behind NGC 5335, thousands of far more distant galaxies in a range of colors speckle the dark background.'
    ],
    'scale': None,
    'understand': {'summary': "Hubble's Wide Field Camera 3 through visible-light g (475 nm) and r (625 nm) filters and a near-infrared I (814 nm) filter. The color mapping isn't published.",
                   'filters': [['475 nm · Optical g (Hubble WFC3)', BAND], ['625 nm · Optical r (Hubble WFC3)', BAND], ['814 nm · Optical I (Hubble WFC3)', BAND]],
                   'eye': 'Long exposures gather far more light than the eye can, revealing faint arms and background galaxies a small telescope would never show.'},
    'behind': behind('Hubble Space Telescope WFC3', 'NASA, ESA, STScI', 'Not published.'),
    'explore': ['NGC 5335 was released to mark Hubble’s 35th year in orbit, alongside new Hubble views of Mars, the planetary nebula NGC 2899 and part of the Rosette Nebula.'],
    'sources': [['ESA/Hubble image page (heic2505i)', 'https://esahubble.org/images/heic2505i/'], ['ESA/Hubble release heic2505', 'https://esahubble.org/news/heic2505/']],
    'alt': 'A face-on spiral galaxy with a yellow oval core crossed by a bar, a band of blue stars and faint dusty arms, with many small distant galaxies behind it.',
    'sky': {'con': 'Vir', 'ra': 208.236, 'dec': 2.812}
  },
  {
    'id': 'w-potm2606a', 'cat': 'galaxy', 'org': 'webb', 'tel': ['webb'],
    'title': 'Galaxy cluster MACS J0553.4-3342 (NIRCam image)',
    'caption': 'The merging galaxy cluster MACS J0553.4-3342, imaged by the James Webb Space Telescope',
    'releaseDate': '3 July 2026',
    'celestial': 'MACS J0553.4-3342 · constellation Columba · about 4 billion light-years away (source figure)',
    'img': {'pub': f'{W}/publicationjpg/potm2606a.jpg', 'pubW': 4000, 'pubH': 1977, 'origW': 8792, 'origH': 4346,
            'large': f'{W}/large/potm2606a.jpg', 'largeMB': 9.0, 'thumb': f'{W}/thumb300y/potm2606a.jpg', 'screen': f'{W}/screen/potm2606a.jpg'},
    'credit': 'ESA/Webb, NASA & CSA, S. Fujimoto',
    'source': 'https://esawebb.org/images/potm2606a/',
    'recognition': {'kind': 'editorial', 'text': 'ESA/Webb Picture of the Month, July 2026 (an editorial selection, not an audience score).'},
    'story': [
      'Two bright elliptical galaxies, each wrapped in a wide glowing halo, sit left and right of center in this Webb view of MACS J0553.4-3342, a galaxy cluster in the constellation Columba, the Dove. Smaller white ellipticals gather around them, and stretched orange arcs curve beside each of the two giants.',
      'The cluster is still being built. It is made of two sub-clusters of roughly equal mass that have already passed through each other and now lie more than one million light-years apart. They should fall back together again and again before they fully merge. Both are filled with extremely hot gas that shines in X-rays, and the light Webb collected left them about 4.4 billion years ago.',
      'The orange arcs are much more distant galaxies whose light the cluster’s gravity has bent and stretched, acting as a lens. On the left, three bright spots in one arc are three images of a single background galaxy. Some of the lensed galaxies are seen as they were less than a billion years after the Big Bang.'
    ],
    'scale': None,
    'understand': {'summary': "Webb's NIRCam from 0.9 to 4.44 μm: the shortest wavelengths in blue, 2.0 and 2.1 μm in cyan, 2.77 and 3.0 μm in green, 3.56 μm in yellow, and 4.1 and 4.44 μm in red.",
                   'filters': [['900 nm · Optical (Webb NIRCam)', 'blue'], ['1.15 μm · Infrared (Webb NIRCam)', 'blue'], ['1.5 μm · Infrared (Webb NIRCam)', 'blue'],
                               ['2.0 μm · Infrared (Webb NIRCam)', 'cyan'], ['2.1 μm · Infrared methane (Webb NIRCam)', 'cyan'],
                               ['2.77 μm · Infrared (Webb NIRCam)', 'green'], ['3.0 μm · Infrared water ice (Webb NIRCam)', 'green'],
                               ['3.56 μm · Infrared (Webb NIRCam)', 'yellow'], ['4.1 μm · Infrared (Webb NIRCam)', 'red'], ['4.44 μm · Infrared (Webb NIRCam)', 'red']],
                   'eye': 'Nearly all of this light is infrared, which the eye cannot see, and the colors are assigned by wavelength.'},
    'behind': behind('James Webb Space Telescope NIRCam', 'ESA/Webb, NASA & CSA, S. Fujimoto'),
    'explore': ['The image comes from VENUS, Webb program 6882, which takes deep infrared images of massive galaxy clusters to find lensed objects such as young galaxies, low-mass black holes, supernovae and even single stars. The spiral and dusty disc galaxies in the field lie in front of the cluster and are unrelated to it.'],
    'sources': [['ESA/Webb image page (potm2606a)', 'https://esawebb.org/images/potm2606a/']],
    'alt': 'A field of small white elliptical galaxies around two bright, haloed galaxies, with thin orange arcs and scattered foreground spirals and stars.',
    'sky': {'con': 'Col', 'ra': 88.346, 'dec': -33.708}
  },
  {
    'id': 'e-potw2608a', 'cat': 'star', 'org': 'eso', 'tel': ['vlt'],
    'title': 'AFGL 4106, a binary star in a dusty nebula (VLT/SPHERE image)',
    'caption': 'The binary star AFGL 4106 and its dusty nebula, imaged by ESO’s Very Large Telescope',
    'releaseDate': '23 February 2026',
    'celestial': 'AFGL 4106 (binary star system)',
    'img': {'pub': f'{E}/large/potw2608a.jpg', 'pubW': 1802, 'pubH': 1802, 'origW': 1802, 'origH': 1802, 'largeMB': 0.4,
            'thumb': f'{E}/thumb300y/potw2608a.jpg', 'screen': f'{E}/screen/potw2608a.jpg'},
    'credit': 'ESO/G. Tomassini et al.',
    'source': 'https://www.eso.org/public/images/potw2608a/',
    'recognition': {'kind': 'editorial', 'text': 'ESO Picture of the Week, February 2026 (an editorial selection, not an audience score).'},
    'story': [
      'A slightly egg-shaped orange cloud with a soft, billowing texture fills this view from ESO’s Very Large Telescope. It is denser and more yellow toward the middle and turns a darker, hazier orange at the edges. At its center sit two small black dots, the pair of stars called AFGL 4106, with faint diagonal streaks crossing the cloud on them.',
      'Both stars are massive and near the end of their lives. One has shed so much material that it is now wrapped in a dusty envelope, the nebula seen here. The two stars look black only because their light was bright enough to saturate the detector.',
      'Most stars form in pairs, so astronomers want to know how a partner changes the way a star dies. A team led by Gabriel Tomassini, a PhD student at Université Côte d’Azur in France, used the SPHERE instrument to map the debris and study the stars. SPHERE removes atmospheric blur and handles big contrasts in brightness. The nebula’s lopsided shape shows the companion pushing gas and dust out of a perfect sphere.'
    ],
    'scale': None,
    'understand': {'summary': "Taken with the SPHERE instrument on ESO's Very Large Telescope. The source lists no filters or color mapping; the nebula is shown in orange on black.",
                   'filters': [],
                   'eye': 'SPHERE corrects the blurring caused by Earth’s turbulent atmosphere, giving a much sharper view than the air would otherwise allow.'},
    'behind': behind('ESO Very Large Telescope, SPHERE', 'ESO/G. Tomassini et al.', 'Not published.'),
    'explore': ['ESO published this view as its Picture of the Week under the title “Two’s company.” The study appeared in the journal Astronomy & Astrophysics. The source page gives no distance, position or constellation; the sky position here comes from the system’s IRAS catalog designation.'],
    'sources': [['ESO image page (potw2608a)', 'https://www.eso.org/public/images/potw2608a/'],
                ['Tomassini et al., SPHERE/VLT study of AFGL 4106 (arXiv)', 'https://arxiv.org/abs/2512.01543']],
    'alt': 'An orange, slightly egg-shaped cloudy nebula on black, with two small black dots at its center and faint diagonal streaks crossing there.',
    'sky': {'con': 'Car', 'ra': 155.821, 'dec': -59.52}
  },
]

def big_enough(w, h):
    """Same rule as src/js/util.js meetsMinimum: square within 5% needs 1440, otherwise 1920 × 1080."""
    long, short = max(w, h), min(w, h)
    return short >= 1440 if long / short <= 1.05 else long >= 1920 and short >= 1080

def main():
    idx_path = os.path.join(COL, 'index.json')
    idx = json.load(open(idx_path, encoding='utf-8'))
    by_id = {e['id']: i for i, e in enumerate(idx)}
    for r in RECORDS:
        if not big_enough(r['img']['pubW'], r['img']['pubH']):
            print(f"{r['id']}: skipped, {r['img']['pubW']} × {r['img']['pubH']} is below the site's display minimum"); continue
        tel = r.pop('tel')
        rec = {'id': r['id'], 'cat': r['cat'], 'org': r['org'], 'title': r['title'], 'caption': r['caption'],
               'captureDate': None, 'captureShort': None, 'releaseDate': r['releaseDate'], 'celestial': r['celestial'],
               'img': r['img'], 'credit': r['credit'], 'source': r['source'], 'recognition': r['recognition'],
               'story': r['story'], 'scale': r['scale'], 'understand': r['understand'], 'labels': [],
               'behind': r['behind'], 'explore': r['explore'], 'sources': r['sources'], 'alt': r['alt'], 'sky': r['sky']}
        words = sum(len(p.split()) for p in rec['story'])
        assert 110 <= words <= 190, (rec['id'], words)
        json.dump(rec, open(os.path.join(COL, 'photos', f"{rec['id']}.json"), 'w', encoding='utf-8'), ensure_ascii=False)
        entry = {'id': rec['id'], 'cat': rec['cat'], 'org': rec['org'], 'title': rec['title'], 'thumb': rec['img']['thumb'],
                 'y': rec['releaseDate'][-4:], 'q': f"{rec['celestial']} {rec['caption']}", 'tel': tel,
                 'con': rec['sky']['con'], 'ra': rec['sky']['ra'], 'dec': rec['sky']['dec']}
        if entry['id'] in by_id: idx[by_id[entry['id']]] = entry
        else: idx.append(entry)
        print(f"{rec['id']}: {words} words")
    json.dump(idx, open(idx_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

if __name__ == '__main__':
    main()
