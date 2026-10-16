"""Two Wolf-Rayet additions, October 2026. Run from the repo root:
    python3 tools/harvest/add_2026_10c.py
Same record format and checks as add_2026_10b.py; scheduling is done by reschedule.py.
Considered but below the site's display minimum: Webb's MIRI image of Apep (1021 × 773) and Hubble's
M1-67 (potw1533a, 1309 × 1321). Hubble's Crescent Nebula (opo0023a) is a collage with a ground-based
inset, so it was left out. Apep's distance isn't on ESO's page; the figure comes from NASA's 2025 Webb release.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from add_2026_10b import behind, big_enough, COL, BAND   # noqa: E402
import add_2026_10b as base                              # noqa: E402

E = 'https://cdn.eso.org/images'
N = 'https://storage.noirlab.edu/media/archives/images'

RECORDS = [
  {
    'id': 'e-eso1838a', 'cat': 'star', 'org': 'eso', 'tel': ['vlt'],
    'title': 'Coils of Apep',
    'caption': 'Dust plumes around the Wolf-Rayet system Apep, imaged by ESO’s Very Large Telescope',
    'releaseDate': '19 November 2018',
    'celestial': 'Apep, 2XMM J160050.7-514245 · constellation Norma · about 8,000 light-years away (NASA figure)',
    'img': {'pub': f'{E}/large/eso1838a.jpg', 'pubW': 1440, 'pubH': 1440, 'origW': 1440, 'origH': 1440, 'largeMB': 0.33,
            'thumb': f'{E}/thumb300y/eso1838a.jpg', 'screen': f'{E}/screen/eso1838a.jpg'},
    'credit': 'ESO/Callingham et al.',
    'source': 'https://www.eso.org/public/images/eso1838a/',
    'recognition': {'kind': 'editorial', 'text': 'Released with ESO press release eso1838 (an editorial selection, not an audience score).'},
    'story': [
      'Reddish plumes of dust coil outward from a few blue points of light in this Very Large Telescope image. The system is nicknamed Apep, after the giant serpent of chaos in ancient Egyptian myth, and it lies in our own galaxy, in the constellation Norma.',
      'The lower of the central lights is really two Wolf-Rayet stars, too close together to tell apart. Wolf-Rayet stars are hot, massive stars late in their short lives, and they blow off fierce winds. Where the two winds collide they make dust, and as the stars orbit each other that dust is flung out into a spiral.',
      'The winds were measured at about 12 million kilometers per hour, yet the dust drifts outward at under 2 million. Astronomers think one star may spin so fast it is close to tearing itself apart, sending fast and slow winds in different directions. When a star like that collapses, it may set off a long gamma-ray burst, which would make Apep the first such candidate found in the Milky Way.'
    ],
    'scale': ('Using the source’s listed field of view (0.26 × 0.26 arcminutes) and a distance of about 8,000 light-years '
              '(from NASA’s 2025 Webb release), the frame spans roughly 0.6 × 0.6 light-years. Its light set out about '
              '8,000 years before reaching the telescope.'),
    'understand': {'summary': "ESO's Very Large Telescope imaged the dust plumes with VISIR in mid-infrared light (8.9 μm), and the NACO adaptive-optics camera captured the central stars in near-infrared light (2.24 μm). The color mapping isn't published, though the caption describes the plumes as reddish and the central stars as blue.",
                   'filters': [['2.24 μm · Infrared IB (VLT NACO)', BAND], ['8.9 μm · Infrared Ar III (VLT VISIR)', BAND]],
                   'eye': 'Both wavelengths are infrared, which the eye cannot see, so the colors are assigned.'},
    'behind': behind('ESO Very Large Telescope, VISIR and NACO', 'ESO/Callingham et al.', 'Not published.'),
    'explore': ['The team, led by Joseph Callingham and Peter Tuthill, published the study in Nature Astronomy and also used the Anglo-Australian Telescope. In 2025 the James Webb Space Telescope found four nested dust shells around Apep, suggesting the two Wolf-Rayet stars swing close about every 190 years, and confirmed a third star, a supergiant, that carves holes in the shells.'],
    'sources': [['ESO image page (eso1838a)', 'https://www.eso.org/public/images/eso1838a/'],
                ['ESO press release eso1838', 'https://www.eso.org/public/news/eso1838/'],
                ['ESA/Webb image page (Wolf-Rayet Apep)', 'https://esawebb.org/images/wolf-rayet-apep/']],
    'alt': 'Reddish spiral plumes of dust coiling outward from a few blue points of light at the center, on a black background.',
    'sky': {'con': 'Nor', 'ra': 240.21, 'dec': -51.712}
  },
  {
    'id': 'n-noao-ic468', 'cat': 'nebula', 'org': 'noirlab', 'tel': ['kittpeak'],
    'title': 'Thor’s Helmet, NGC 2359, IC 468',
    'caption': 'The Wolf-Rayet bubble Thor’s Helmet, imaged by the 0.9-meter telescope at Kitt Peak National Observatory',
    'releaseDate': '30 June 2020',
    'celestial': 'Thor’s Helmet, NGC 2359, IC 468, HD 56925 · constellation Canis Major · about 15,000 light-years away (source figure)',
    'img': {'pub': f'{N}/large/noao-ic468.jpg', 'pubW': 2350, 'pubH': 2718, 'origW': 2350, 'origH': 2718,
            'thumb': f'{N}/thumb300y/noao-ic468.jpg', 'screen': f'{N}/screen/noao-ic468.jpg'},
    'credit': 'T.A. Rector (University of Alaska Anchorage) and NOIRLab/NSF/AURA',
    'source': 'https://noirlab.edu/public/images/noao-ic468/',
    'recognition': {'kind': 'editorial', 'text': 'Published in the NSF NOIRLab image archive. No published rating.'},
    'story': [
      'Orange, blue and violet gas traces the outline of Thor’s Helmet in this view from a 0.9-meter telescope at Kitt Peak National Observatory. The nebula, also cataloged as NGC 2359, lies about 15,000 light-years away in Canis Major, the Great Dog.',
      'Thor’s Helmet is a giant bubble blown by a single star, the Wolf-Rayet star HD 56925. Stars like this are extremely massive, hot and luminous, and their energy is so intense that it strips away their own outer layers, sending them streaming into space.',
      'That outflow does not expand into empty space. It pushes into the dust and gas that already surround the star, and the meeting gives the bubble its complex shape. Each color marks a different gas: hydrogen glows orange, oxygen blue and sulfur violet, so the picture also maps what the bubble is made of.'
    ],
    'scale': ('Using the source’s listed field of view (16.64 × 19.08 arcminutes) and NOIRLab’s distance of about 15,000 '
              'light-years, the frame spans roughly 73 × 83 light-years. Its light set out about 15,000 years before reaching the telescope.'),
    'understand': {'summary': 'The Mosaic camera on the 0.9-meter telescope at Kitt Peak used three narrowband filters: hydrogen-alpha (656 nm) in orange, oxygen [O III] (499 nm) in blue and sulfur [S II] (672 nm) in violet.',
                   'filters': [['499 nm · Optical [O III] (Kitt Peak 0.9-meter Mosaic)', 'blue'], ['656 nm · Optical H-alpha (Kitt Peak 0.9-meter Mosaic)', 'orange'],
                               ['672 nm · Optical [S II] (Kitt Peak 0.9-meter Mosaic)', 'violet']],
                   'eye': 'Narrow filters isolate the glow of single gases, and the colors are assigned to tell them apart, so the eye would not see this palette.'},
    'behind': behind('Kitt Peak 0.9-meter Telescope, Mosaic camera', 'T.A. Rector (University of Alaska Anchorage) and NOIRLab/NSF/AURA'),
    'explore': ['Thor’s Helmet also appears in this collection in a tighter Very Large Telescope view made for ESO’s 50th anniversary. In this frame north points to the left and east points down, so the nebula is turned from how it sits on the sky.'],
    'sources': [['NSF NOIRLab image page (noao-ic468)', 'https://noirlab.edu/public/images/noao-ic468/'],
                ['NSF NOIRLab image page (noaoann10014a), for the distance', 'https://noirlab.edu/public/images/noaoann10014a/']],
    'alt': 'A bubble-shaped nebula of glowing orange, blue and violet gas among scattered stars.',
    'sky': {'con': 'CMa', 'ra': 109.791, 'dec': -13.256}
  },
]

if __name__ == '__main__':
    base.RECORDS = RECORDS
    base.main()
