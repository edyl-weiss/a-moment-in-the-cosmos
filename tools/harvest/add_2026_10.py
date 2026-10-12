"""Five additions, October 2026 (newer, well-received images). Run from the repo root:
    python3 tools/harvest/add_2026_10.py
Writes photos/<id>.json and index.json entries (idempotent); scheduling is done by reschedule.py.
Facts come from each source page (linked in `sources`); stories follow WRITING_GUIDE.md.
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
N = 'https://storage.noirlab.edu/media/archives/images'

RECORDS = [
  {
    'id': 'n-noirlab2521b', 'cat': 'nebula', 'org': 'noirlab', 'tel': ['rubin'],
    'title': 'Trifid and Lagoon Nebulae (Rubin Observatory First Look)',
    'caption': 'The Trifid and Lagoon Nebulae, imaged by the NSF–DOE Vera C. Rubin Observatory',
    'releaseDate': '23 June 2025',
    'celestial': 'Trifid Nebula, Lagoon Nebula, Messier 20, Messier 8 · constellation Sagittarius',
    'img': {'pub': f'{N}/publicationjpg/noirlab2521b.jpg', 'pubW': 4000, 'pubH': 2452, 'origW': 84000, 'origH': 51500,
            'thumb': f'{N}/thumb300y/noirlab2521b.jpg', 'screen': f'{N}/screen/noirlab2521b.jpg'},
    'credit': 'RubinObs/NOIRLab/SLAC/NSF/DOE/AURA',
    'source': 'https://noirlab.edu/public/images/noirlab2521b/',
    'recognition': {'kind': 'editorial', 'text': 'One of the NSF–DOE Vera C. Rubin Observatory’s First Look images, released June 2025. No published audience rating.'},
    'story': [
      'Two of the sky’s best-known stellar nurseries share one frame in this view from the NSF–DOE Vera C. Rubin Observatory. The Trifid Nebula sits at the top right, a pink cloud of glowing gas beside a blue patch of reflected starlight, crossed by dark lanes of dust. Below it spreads the larger Lagoon Nebula, another cloud where stars are being born.',
      'The picture combines 678 separate exposures gathered in a little over seven hours of observing. Stacking so many frames brings out faint gas and dust that any single shot would miss. The finished image measures about 84,000 by 51,500 pixels, roughly five gigapixels.',
      'It was among the first pictures Rubin shared, in June 2025, to show what its Simonyi Survey Telescope and LSST Camera can do. Rubin says no other observatory can cover so wide an area this quickly and this deeply. The Trifid lies about 5,000 light-years away and the Lagoon about 4,000.'
    ],
    'scale': None,
    'understand': {'summary': "Taken with the LSST Camera on Rubin's Simonyi Survey Telescope through the u, g, r and i filters, from near-ultraviolet to the edge of the infrared. The color mapping isn't published.",
                   'filters': [['372 nm · Ultraviolet u (LSSTCam)', 'source lists band only'], ['480 nm · Optical g (LSSTCam)', 'source lists band only'],
                               ['622 nm · Optical r (LSSTCam)', 'source lists band only'], ['755 nm · Optical i (LSSTCam)', 'source lists band only']],
                   'eye': 'Hours of stacked exposures gather far more light than the eye can, so faint gas appears that a small telescope would never show.'},
    'behind': behind('Simonyi Survey Telescope, LSST Camera (LSSTCam)', 'RubinObs/NOIRLab/SLAC/NSF/DOE/AURA', 'Not published.'),
    'explore': ['Rubin released a zoomable version of this roughly five-gigapixel picture, which lets you travel from the whole field down to single stars, along with a version labeled with the objects in the frame.'],
    'sources': [['NSF NOIRLab image page (noirlab2521b)', 'https://noirlab.edu/public/images/noirlab2521b/'], ['NSF NOIRLab release noirlab2521', 'https://noirlab.edu/public/news/noirlab2521/']],
    'alt': 'A wide star field with a pink and blue nebula at upper right and a larger glowing nebula below it.',
    'sky': {'con': 'Sgr', 'ra': 271.632, 'dec': -23.762}
  },
  {
    'id': 'w-wolf-rayet-apep', 'cat': 'star', 'org': 'webb', 'tel': ['webb'],
    'title': 'Apep, a Wolf-Rayet star system (MIRI image)',
    'caption': 'The Wolf-Rayet star system Apep, imaged by the James Webb Space Telescope',
    'releaseDate': '19 November 2025',
    'celestial': 'Apep, 2XMM J160050.7–514245 · constellation Norma · about 8,000 light-years away (source figure)',
    'img': {'pub': f'{W}/large/wolf-rayet-apep.jpg', 'pubW': 1021, 'pubH': 773, 'origW': 1021, 'origH': 773,
            'large': f'{W}/large/wolf-rayet-apep.jpg', 'thumb': f'{W}/thumb300y/wolf-rayet-apep.jpg', 'screen': f'{W}/screen/wolf-rayet-apep.jpg'},
    'credit': 'NASA, ESA, CSA, STScI, Y. Han (Caltech), R. White (Macquarie University), A. Pagan (STScI)',
    'source': 'https://esawebb.org/images/wolf-rayet-apep/',
    'recognition': {'kind': 'editorial', 'text': 'ESA/Webb image release, featured in Scientific American’s ten best space images of 2025 (an editorial selection, not an audience score).'},
    'story': [
      'Coiled shells of dust spiral outward from a single point of light in this mid-infrared view from Webb. The point is Apep, a system of three stars in the southern constellation Norma, and the shells are dust the stars have made. Earlier telescopes had shown one shell. Webb found four.',
      'Two of the stars are Wolf-Rayet stars, massive stars late in their lives that shed powerful winds. Together with observations from ESO’s Very Large Telescope, the Webb data show that the pair swing past each other about every 190 years. For roughly 25 years around each close approach, the encounter produces carbon-rich dust, which streams away to form a new shell.',
      'Webb also confirmed that a third star, a massive supergiant, is bound to the system. Its own wind carves holes into the dust shells. From this far away, all three stars blur together into the one bright point at the center.'
    ],
    'scale': None,
    'understand': {'summary': "Webb's MIRI camera in mid-infrared light. The 7.7-micron filter, which picks up PAH molecules, is shown in blue and green, 15 microns in green and 25 microns in red.",
                   'filters': [['7.7 μm · Infrared PAH (Webb MIRI)', 'blue, green'], ['15 μm · Infrared (Webb MIRI)', 'green'], ['25 μm · Infrared (Webb MIRI)', 'red']],
                   'eye': 'Mid-infrared light is invisible to the eye. It shows warm dust rather than starlight.'},
    'behind': behind('James Webb Space Telescope MIRI', 'NASA, ESA, CSA, STScI, Y. Han (Caltech), R. White (Macquarie University), A. Pagan (STScI)'),
    'explore': ['Apep is named after an ancient Egyptian deity who embodied chaos and darkness. The system was first described in 2018. Webb’s MIRI images are smaller than its near-infrared ones, so this picture is lower in resolution than most in the collection.'],
    'sources': [['ESA/Webb image page (wolf-rayet-apep)', 'https://esawebb.org/images/wolf-rayet-apep/'],
                ['NASA: Wolf-Rayet Apep (MIRI compass image)', 'https://science.nasa.gov/asset/webb/wolf-rayet-apep-miri-compass-image/'],
                ['EarthSky: Webb image of Apep', 'https://earthsky.org/space/webb-image-apep-swirling-nebula-2-dying-stars/']],
    'alt': 'Several faint, evenly spaced spiral shells of dust around a bright central point.',
    'sky': {'con': 'Nor', 'ra': 240.21, 'dec': -51.712}
  },
  {
    'id': 'w-potm2508a', 'cat': 'star', 'org': 'webb', 'tel': ['webb', 'hubble'],
    'title': 'The Butterfly Star, IRAS 04302+2247 (Webb and Hubble image)',
    'caption': 'The young star IRAS 04302+2247 and its edge-on disc, imaged by the James Webb and Hubble Space Telescopes',
    'releaseDate': '29 August 2025',
    'celestial': 'Butterfly Star, IRAS 04302+2247 · constellation Taurus · about 525 light-years away (source figure)',
    'img': {'pub': f'{W}/publicationjpg/potm2508a.jpg', 'pubW': 3427, 'pubH': 1991, 'origW': 3427, 'origH': 1991,
            'large': f'{W}/large/potm2508a.jpg', 'thumb': f'{W}/thumb300y/potm2508a.jpg', 'screen': f'{W}/screen/potm2508a.jpg'},
    'credit': 'ESA/Webb, NASA & CSA, M. Villenave et al.',
    'source': 'https://esawebb.org/images/potm2508a/',
    'recognition': {'kind': 'editorial', 'text': 'ESA/Webb Picture of the Month, August 2025; Live Science listed it among the best space photos of 2025 (editorial selections, not audience scores).'},
    'story': [
      'A dark band of dust cuts across the middle of this picture, with a glowing lobe of light on either side. The band is a planet-forming disc around a young star called IRAS 04302+2247, seen exactly edge-on from Earth. The two lobes are reflection nebulae lit by the hidden star, and they give it its nickname, the Butterfly Star.',
      'The system lies about 525 light-years away in the Taurus star-forming region. Because we look at the disc side-on, its dust blocks the star’s own light, which lets astronomers study the disc without the glare. Webb’s infrared cameras traced fine structure in the dust and faint reflected light, while Hubble’s visible-light data showed the dust lane and outflowing jets.',
      'The observations come from a Webb program that studies how dust changes inside edge-on discs like this one, the places where planets are thought to grow as grains of dust clump together.'
    ],
    'scale': scale('1.78 x 1.04', '525', '0.27', '0.16'),
    'understand': {'summary': "Combines Hubble's WFPC2 in visible light (814 nm, blue) with Webb's NIRCam in near-infrared (2.0 μm blue, 4.44 μm cyan) and MIRI in mid-infrared (7.7 μm green, 12 μm orange, 21 μm red).",
                   'filters': [['814 nm · Optical I (Hubble WFPC2)', 'blue'], ['2.0 μm · Infrared (Webb NIRCam)', 'blue'], ['4.44 μm · Infrared (Webb NIRCam)', 'cyan'],
                               ['7.7 μm · Infrared PAH (Webb MIRI)', 'green'], ['12 μm · Infrared (Webb MIRI)', 'orange'], ['21 μm · Infrared (Webb MIRI)', 'red']],
                   'eye': 'Most of this light is infrared and invisible to the eye. Only the blue Hubble component is visible light.'},
    'behind': behind('Hubble Space Telescope WFPC2, James Webb Space Telescope NIRCam and MIRI', 'ESA/Webb, NASA & CSA, M. Villenave et al.'),
    'explore': ['ESA/Webb published the picture as its Picture of the Month for August 2025, under the title “Dusty wisps round a dusty disc.” The data come from Webb program 2562.'],
    'sources': [['ESA/Webb image page (potm2508a)', 'https://esawebb.org/images/potm2508a/'], ['ESA: Dusty wisps round a dusty disc', 'https://www.esa.int/Science_Exploration/Space_Science/Webb/Dusty_wisps_round_a_dusty_disc']],
    'alt': 'A dark horizontal band of dust between two glowing, wing-like lobes of light.',
    'sky': {'con': 'Tau', 'ra': 68.324, 'dec': 22.891}
  },
  {
    'id': 'w-weic2620a', 'cat': 'nebula', 'org': 'webb', 'tel': ['webb'],
    'title': 'NGC 7129 (NIRCam image)',
    'caption': 'The stellar nursery NGC 7129, imaged by the James Webb Space Telescope',
    'releaseDate': '6 October 2026',
    'celestial': 'NGC 7129 · constellation Cepheus · about 3,300 light-years away (source figure)',
    'img': {'pub': f'{W}/publicationjpg/weic2620a.jpg', 'pubW': 4000, 'pubH': 3732, 'origW': 11958, 'origH': 11156,
            'large': f'{W}/large/weic2620a.jpg', 'thumb': f'{W}/thumb300y/weic2620a.jpg', 'screen': f'{W}/screen/weic2620a.jpg'},
    'credit': 'NASA, ESA, CSA, STScI; Image Processing: A. Pagan (STScI)',
    'source': 'https://esawebb.org/images/weic2620a/',
    'recognition': {'kind': 'editorial', 'text': 'ESA/Webb science release, October 2026 (an editorial selection, not an audience score).'},
    'story': [
      'Golden and red clouds fill this Webb view of NGC 7129, a stellar nursery about 3,300 light-years away. The brightest star, the one with the longest spikes of light, is LkHα 234, a young star of roughly five to eight times the Sun’s mass. It has mostly finished gathering material and is shrinking and heating up on its way to fusing hydrogen.',
      'To its left, a gold cavity about 3.5 light-years across glows where outflows from the star’s earlier years carved into the hydrogen cloud. Young stars inside it push their winds into the gas, raising curved bow shocks, and a sharp ridge along the top marks where starlight is breaking hydrogen molecules apart.',
      'To the right, red, clumpy gas hides even younger protostars. Their hot outflows slam into the dense gray material around them, and where several overlap, the scene turns chaotic. The gray patches are the coldest, densest gas, where no protostars have formed yet.'
    ],
    'scale': scale('6.26 x 5.84', '3300', '6.0', '5.6'),
    'understand': {'summary': "Webb's NIRCam in near-infrared light: 1.15 μm and Paschen-alpha hydrogen at 1.87 μm in blue, 2.0 μm in cyan, PAH emission at 3.35 μm in yellow, and 4.44 μm and molecular hydrogen at 4.7 μm in red.",
                   'filters': [['1.15 μm · Infrared (Webb NIRCam)', 'blue'], ['1.87 μm · Infrared P-alpha (Webb NIRCam)', 'blue'], ['2.0 μm · Infrared (Webb NIRCam)', 'cyan'],
                               ['3.35 μm · Infrared PAH (Webb NIRCam)', 'yellow'], ['4.44 μm · Infrared (Webb NIRCam)', 'red'], ['4.7 μm · Infrared H2 (Webb NIRCam)', 'red']],
                   'eye': 'Near-infrared light is invisible to the eye, and it passes through dust that hides these young stars in visible light.'},
    'behind': behind('James Webb Space Telescope NIRCam', 'NASA, ESA, CSA, STScI; Image Processing: A. Pagan (STScI)'),
    'explore': ['Near the upper left, a protostar inside a blue nebula is ringed by a donut-shaped disc that throws a shadow across the nebula, which the Webb team compares to the “Bat Shadow” Hubble saw elsewhere. ESA/Webb released this image on 6 October 2026.'],
    'sources': [['ESA/Webb image page (weic2620a)', 'https://esawebb.org/images/weic2620a/'], ['ESA/Webb release weic2620', 'https://esawebb.org/news/weic2620/']],
    'alt': 'A nebula with a golden cavity on the left, red clumpy gas on the right and a bright star with long diffraction spikes between them.',
    'sky': {'con': 'Cep', 'ra': 325.771, 'dec': 66.113}
  },
  {
    'id': 'h-potm2608a', 'cat': 'nebula', 'org': 'hubble', 'tel': ['hubble'],
    'title': 'N44 Superbubble (LHA 120-N44)',
    'caption': 'The N44 superbubble in the Large Magellanic Cloud, imaged by the Hubble Space Telescope',
    'releaseDate': '3 September 2026',
    'celestial': 'N44 Superbubble, LHA 120-N44, Large Magellanic Cloud · constellation Dorado · about 160,000 light-years away (source figure)',
    'img': {'pub': f'{H}/publicationjpg/potm2608a.jpg', 'pubW': 4000, 'pubH': 3183, 'origW': 14416, 'origH': 11473,
            'large': f'{H}/large/potm2608a.jpg', 'thumb': f'{H}/thumb700x/potm2608a.jpg', 'screen': f'{H}/screen/potm2608a.jpg'},
    'credit': 'ESA/Hubble & NASA, D. Gouliermis',
    'source': 'https://esahubble.org/images/potm2608a/',
    'recognition': {'kind': 'editorial', 'text': 'ESA/Hubble Picture of the Month, September 2026 (an editorial selection, not an audience score).'},
    'story': [
      'A vast, nearly empty hole sits at the heart of this Hubble view of N44, a star-forming nebula in the Large Magellanic Cloud, a small galaxy that orbits our own about 160,000 light-years away. The hole is a superbubble, roughly 210 by 140 light-years across.',
      'The stars at its center made it. Their winds, and the supernovae of the most massive among them, pushed gas outward into the dense, dusty shell that now rings the void. That shell is where new stars are forming, and ultraviolet light from massive stars makes it glow. Near the upper right, a smaller bubble called N44F has been blown by a single hot, massive star.',
      'The picture comes from a Hubble survey that catalogued nearly half a million stars here, nearly 30,000 of them not yet fusing hydrogen, to learn how long star formation takes and how massive newborn stars usually are.'
    ],
    'scale': scale('9.63 x 7.66', '160,000', '450', '360'),
    'understand': {'summary': "Hubble's Wide Field Camera 3 through a visible (V, 555 nm) and a near-infrared (I, 814 nm) filter. The color mapping isn't published.",
                   'filters': [['555 nm · Optical V (WFC3)', 'source lists band only'], ['814 nm · Optical I (WFC3)', 'source lists band only']],
                   'eye': 'Long exposures gather far more light than the eye can, and the I filter reaches just past red, into light the eye cannot see.'},
    'behind': behind('Hubble Space Telescope, WFC3', 'ESA/Hubble & NASA, D. Gouliermis', 'Not published.'),
    'explore': ['ESA/Hubble published the picture as its Picture of the Month for September 2026, titled “A superbubble scene,” and NASA released it the same day. The data come from Hubble observing program 14689.'],
    'sources': [['ESA/Hubble image page (potm2608a)', 'https://esahubble.org/images/potm2608a/'], ['NASA: Hubble Spies Superbubble Scene', 'https://science.nasa.gov/missions/hubble/nasas-hubble-spies-superbubble-scene/']],
    'alt': 'A glowing shell of gas around a dark, nearly empty central cavity, scattered with stars.',
    'sky': {'con': 'Dor', 'ra': 80.578, 'dec': -67.937}
  },
]

def main():
    idx_path = os.path.join(COL, 'index.json')
    idx = json.load(open(idx_path, encoding='utf-8'))
    by_id = {e['id']: i for i, e in enumerate(idx)}
    for r in RECORDS:
        if r['img']['origW'] < 1920 and r['img']['origH'] < 1920:
            print(f"{r['id']}: skipped, {r['img']['origW']} × {r['img']['origH']} is below the site's display minimum"); continue
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
