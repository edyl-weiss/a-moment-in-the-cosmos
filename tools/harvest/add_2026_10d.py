"""Euclid, Chandra and Spitzer, October 2026: 29 photographs from three telescopes new to the collection.
Run from the repo root:
    python3 tools/harvest/add_2026_10d.py
then tools/harvest/reschedule.py. Same record format and checks as add_2026_10b.py.

Images come from AstroPix (astropix.org), which mirrors each observatory's releases at a fixed ladder of
sizes: thumb is the smallest file whose short side is at least 225 px, screen the 1280 px file, pub the
3000 px file (or the largest JPEG, if smaller), and large the largest JPEG beyond that. Nothing is resized here.
Facts come from each image's AstroPix page and the observatory page linked in `sources`. Where the
observatory's caption and AstroPix's metadata disagree (a distance, a color), the caption wins.

Organizations: Euclid is ESA's (org "esa", CC BY-SA 3.0 IGO); Chandra's composites keep org "chandra",
since NASA claims no copyright but other observatories' data in them keep their own terms; Spitzer is
NASA/JPL-Caltech (org "nasa").

Considered and left out: Euclid's Abell 2390 (its caption repeats text from Abell 2764), the Cat's Eye
(a small nebula in a wide deep-field crop), the galactic bulge survey (no position given, and an edge-
effect mosaic); Chandra's Cygnus OB2 (the release's scale contradicts itself) and the Christmas Tree
Cluster (rotated and recolored to look like a tree); M51's 2021 Chandra image (an individual's credit).
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from add_2026_10b import behind   # noqa: E402
import add_2026_10b as base       # noqa: E402

AP = 'https://www.astropix.org/archive'
BAND = 'source lists band only'

def img(coll, aid, sizes):
    """sizes: (label, w, h) for every JPEG AstroPix lists, smallest first. Label is the file suffix."""
    url = lambda lab: f'{AP}/{coll}/{aid}/{coll}_{aid}_{lab}.jpg'
    thumb = next(s for s in sizes if min(s[1], s[2]) >= 225)
    screen = next((s for s in sizes if max(s[1], s[2]) >= 1280), sizes[-1])
    pub = next((s for s in sizes if max(s[1], s[2]) >= 3000), sizes[-1])
    big = sizes[-1]
    out = {'pub': url(pub[0]), 'pubW': pub[1], 'pubH': pub[2], 'origW': big[1], 'origH': big[2],
           'thumb': url(thumb[0]), 'screen': url(screen[0])}
    if big is not pub: out['large'] = url(big[0])
    return out

def span(ly):
    """A rounded figure: the field of view and distance are approximate, so two significant figures at most."""
    if ly >= 1e6: return f'{ly / 1e6:.1f} million'.replace('.0 ', ' ')
    if ly >= 1000: return f'{float(f"{ly:.2g}"):,.0f}'
    if ly >= 10: return f'{ly:.0f}'
    return f'{ly:.1f}'.rstrip('0').rstrip('.')

def scale(fw, fh, dist, whose='the source’s'):
    """The frame's width and height in light-years, from the listed field of view (arcminutes) and distance."""
    k = math.pi / (180 * 60) * dist
    years = f'{dist / 1e6:g} million' if dist >= 1e6 else f'{dist:,}'
    return (f"Using the source’s listed field of view ({fw:g} × {fh:g} arcminutes) and {whose} distance of about {years} light-years, "
            f"the frame spans roughly {span(fw * k)} × {span(fh * k)} light-years. Its light set out about {years} years before reaching the telescope.")

def stated(text, dist):
    years = f'{dist / 1e6:g} million' if dist >= 1e6 else f'{dist:,}'
    return f'{text} Its light set out about {years} years before reaching the telescope.'

# ---------- Euclid (ESA) ----------
EUCLID_CREDIT = 'ESA/Euclid/Euclid Consortium/NASA, image processing by J.-C. Cuillandre (CEA Paris-Saclay), G. Anselmi'
SQ8 = [('320', 320, 320), ('500', 500, 500), ('1024', 1024, 1024), ('1280', 1280, 1280), ('1600', 1600, 1600), ('3000', 3000, 3000), ('6000', 6000, 6000)]
EU_FILTERS = [['0.7 μm · Optical (Euclid VIS)', 'blue'], ['1.1 μm · Infrared Y band (Euclid NISP)', 'green'], ['1.7 μm · Infrared H band (Euclid NISP)', 'red']]
EU_SUMMARY = ("Euclid combined its visible-light camera (VIS) with near-infrared measurements in the Y and H bands from its NISP instrument. "
              "Blue shows light at about 0.7 microns, green about 1.1 microns and red about 1.7 microns.")
EU_EYE = "Two of the three colors are near-infrared light, invisible to the eye, and the mapping was chosen for looks: hot stars read white-blue and dusty regions red."
EU_ARTIFACTS = ("The six spikes on bright stars come from diffraction in Euclid’s optics, and a few faint, fuzzy blue circles are “optical ghosts,” "
                "ordinary artifacts of a complex optical system that don’t affect the science.")

def euclid(aid, slug, **r):
    r.setdefault('credit', EUCLID_CREDIT)
    r.setdefault('understand', {'summary': EU_SUMMARY, 'filters': EU_FILTERS, 'eye': EU_EYE})
    r.setdefault('behind', behind('Euclid space telescope, VIS and NISP', r['credit']))
    page = f'https://euclid.caltech.edu/image/{aid}-{slug}'
    r.setdefault('sources', [['Euclid image page, NASA/IPAC (' + aid + ')', page], ['AstroPix record (' + aid + ')', f'https://www.astropix.org/image/ensci/{aid}']])
    if r.get('esa'): r['sources'].append(['ESA image page', r.pop('esa')])
    return {'id': f'esa-{aid}', 'org': 'esa', 'tel': ['euclid'], 'source': page,
            'img': img('ensci', aid, r.pop('sizes', SQ8)), **r}

EUCLID = [
  euclid('euclid20231107c', 'euclid-s-view-of-the-horsehead-nebula', cat='nebula',
    title='Euclid’s view of the Horsehead Nebula',
    caption='The Horsehead Nebula, imaged by ESA’s Euclid space telescope',
    releaseDate='7 November 2023',
    celestial='Horsehead Nebula, Barnard 33 · constellation Orion · about 1,375 light-years away (source figure)',
    sizes=SQ8 + [('original', 8200, 8200)],
    recognition={'kind': 'editorial', 'text': 'One of Euclid’s first five full-color images (an editorial selection, not an audience score).'},
    story=[
      'The dark, horse-head-shaped cloud of the Horsehead Nebula stands out in this wide, crisp view from ESA’s Euclid space telescope. Also called Barnard 33, it lies about 1,375 light-years away in Orion, just south of Alnitak, the easternmost of the three stars in Orion’s Belt.',
      'The Horsehead is part of the vast Orion molecular cloud, and its neighborhood is the closest giant star-forming region to Earth. Plenty of telescopes have photographed it, but none has caught it this sharply across such a wide field in a single observation.',
      'Euclid needed only about an hour. That speed is the point: the mission was built to sweep up large stretches of sky in fine detail, and this was one of its first demonstrations. In its palette, hot stars look white-blue, glowing hydrogen appears blue, and regions rich in dust and molecular gas turn red, while very distant galaxies in the background look deep red.'
    ],
    scale=scale(41.0, 41.0, 1375),
    explore=['Euclid’s two instruments together cover four wavelength ranges; three were chosen for this color image. ' + EU_ARTIFACTS],
    alt='The dark, horse-head-shaped Horsehead Nebula against reddish clouds of dust and gas, in a wide field full of stars.',
    sky={'con': 'Ori', 'ra': 85.165, 'dec': -2.531}),

  euclid('euclid20231107a', 'euclids-view-of-spiral-galaxy-ic-342', cat='galaxy',
    title='Euclid’s view of spiral galaxy IC 342',
    caption='The spiral galaxy IC 342, imaged by ESA’s Euclid space telescope',
    releaseDate='7 November 2023',
    celestial='IC 342, Caldwell 5, the “Hidden Galaxy” · constellation Camelopardalis · about 10.7 million light-years away (source figure)',
    sizes=SQ8 + [('original', 8200, 8200)],
    recognition={'kind': 'editorial', 'text': 'One of Euclid’s first five full-color images (an editorial selection, not an audience score).'},
    story=[
      'A spiral galaxy spreads across this Euclid image, seen through a curtain of foreground stars. This is IC 342, also known as Caldwell 5, about 10.7 million light-years away in Camelopardalis, the Giraffe.',
      'It is nicknamed the “Hidden Galaxy” because it sits behind the busy disc of our own Milky Way, where dust, gas and stars get in the way. That makes it hard to study in visible light. Euclid’s near-infrared instrument could see through much of the dust and measure the light of the galaxy’s many cooler, low-mass stars, which make up most of its mass.',
      'The image took about an hour of observing. Over its lifetime Euclid will photograph billions of galaxies to reveal the unseen influence of dark matter and dark energy on them, so a galaxy hidden behind our own was a fitting early target.'
    ],
    scale=scale(41.0, 41.0, 10_700_000),
    explore=['In Euclid’s colors, hot stars appear white-blue, glowing hydrogen blue, and dusty, gas-rich regions red. ' + EU_ARTIFACTS],
    alt='A large spiral galaxy, partly veiled by many foreground stars.',
    sky={'con': 'Cam', 'ra': 56.699, 'dec': 68.098}),

  euclid('euclid20240523c', 'messier-78', cat='nebula',
    title='Euclid’s view of Messier 78',
    caption='The star-forming region Messier 78, imaged by ESA’s Euclid space telescope',
    releaseDate='23 May 2024', esa='https://www.esa.int/ESA_Multimedia/Images/2024/05/Euclid_s_new_image_of_star-forming_region_Messier_78',
    celestial='Messier 78 · constellation Orion · about 1,300 light-years away (source figure)',
    recognition={'kind': 'editorial', 'text': 'Part of Euclid’s Early Release Observations, May 2024 (an editorial selection, not an audience score).'},
    story=[
      'A bright stellar nursery glows at the center of this Euclid view, wrapped in dust and laced with filaments of gas. This is Messier 78, a young star-forming region about 1,300 light-years away in Orion. Near the top shines the bright nebula NGC 2071.',
      'Dark clouds normally hide much of what forms here. Looking in infrared, Euclid saw through them and, for the first time, picked out the smallest sub-stellar objects in Messier 78, some just a few times the mass of Jupiter. Its two cameras found more than 300,000 new objects in this one field.',
      'Counting stars and these lightweight objects, and comparing the two, helps explain how populations of stars form and change. Near the bottom, one filament nicknamed the “traffic light” is a dark nebula forming lower-mass stars along its length. The whole view took about an hour to collect.'
    ],
    scale=scale(41.0, 41.0, 1300),
    explore=['Brown dwarfs and free-floating “rogue” planets have been suggested as part of the Milky Way’s dark matter. Current knowledge suggests there are too few of them, but the question is open, and Euclid aims to settle it by surveying a large part of the galaxy. ' + EU_ARTIFACTS],
    alt='A glowing star-forming region at center, surrounded by dark dust and wispy filaments, with a second bright nebula near the top.',
    sky={'con': 'Ori', 'ra': 86.691, 'dec': 0.002}),

  euclid('euclid20240523e', 'galaxy-ngc-6744', cat='galaxy',
    title='Euclid’s view of spiral galaxy NGC 6744',
    caption='The spiral galaxy NGC 6744, imaged by ESA’s Euclid space telescope',
    releaseDate='23 May 2024', esa='https://www.esa.int/ESA_Multimedia/Images/2024/05/Euclid_s_new_image_of_spiral_galaxy_NGC_6744',
    celestial='NGC 6744 · constellation Pavo · about 30 million light-years away (source figure)',
    recognition={'kind': 'editorial', 'text': 'Part of Euclid’s Early Release Observations, May 2024 (an editorial selection, not an audience score).'},
    story=[
      'The whole of the spiral galaxy NGC 6744 fits inside this single Euclid frame, from its broad arms down to fine lanes of dust. Feathery “spurs” of dust branch off the spiral arms. The galaxy lies about 30 million light-years away in Pavo, the Peacock.',
      'NGC 6744 is one of the largest spiral galaxies beyond our local neighborhood, and a textbook example of the kind of galaxy that forms most of the stars in the nearby universe. Spiral arms compress gas as they move, so most new stars form along them, yet exactly how spirals drive star formation is still not fully understood.',
      'Spurs like these can only form in a strong enough spiral, which makes them useful clues. With this data, astronomers can count individual stars, map stars and dust, look for globular clusters, and search for dwarf galaxies. Euclid has already found a new dwarf satellite of NGC 6744, despite how closely it has been studied.'
    ],
    scale=scale(41.0, 41.0, 30_000_000),
    explore=['The image comes from about an hour of observing. ' + EU_ARTIFACTS],
    alt='A large spiral galaxy with long arms trailing feathery dust lanes.',
    sky={'con': 'Pav', 'ra': 287.44, 'dec': -63.857}),

  euclid('euclid20231107e', 'euclid-s-view-of-the-perseus-cluster-of-galaxies', cat='galaxy',
    title='Euclid’s view of the Perseus cluster of galaxies',
    caption='The Perseus Cluster of galaxies, imaged by ESA’s Euclid space telescope',
    releaseDate='7 November 2023',
    celestial='Perseus Cluster · constellation Perseus · about 240 million light-years away (source figure)',
    sizes=SQ8 + [('original', 8800, 8800)],
    recognition={'kind': 'editorial', 'text': 'One of Euclid’s first five full-color images (an editorial selection, not an audience score).'},
    story=[
      'Look closely and nearly every smudge here is a galaxy. Euclid’s view holds about 1,000 galaxies belonging to the Perseus Cluster, and more than 100,000 others farther in the background, each containing up to hundreds of billions of stars.',
      'Many of those faint background galaxies had never been seen before, and the light from some of them traveled 10 billion years to reach us. The Perseus Cluster itself is “only” about 240 million light-years away. It is one of the most massive structures known, with thousands of galaxies bathed in a vast cloud of hot gas.',
      'Astronomers have shown that clusters like this one could only have formed if dark matter exists. By mapping where galaxies sit and how their shapes are subtly distorted, Euclid will help work out how dark matter shaped the universe. The observations behind this picture took just five hours.'
    ],
    scale=scale(44.0, 44.0, 240_000_000),
    explore=['This was the first time a single image captured so many of the cluster’s galaxies in such fine detail. ' + EU_ARTIFACTS],
    alt='A field crowded with galaxies of many sizes, with countless tiny red galaxies farther behind and a few bright foreground stars.',
    sky={'con': 'Per', 'ra': 49.681, 'dec': 41.615}),

  euclid('euclid20251002a', 'euclid-image-of-a-bright-einstein-ring-around-galaxy-ngc-6505', cat='galaxy',
    title='An Einstein ring around galaxy NGC 6505',
    caption='The Einstein ring around the galaxy NGC 6505, imaged by ESA’s Euclid space telescope',
    releaseDate='10 February 2025', esa='https://www.esa.int/ESA_Multimedia/Images/2025/02/Euclid_image_of_a_bright_Einstein_ring_around_galaxy_NGC_6505',
    credit='ESA/Euclid/Euclid Consortium/NASA, image processing by J.-C. Cuillandre, G. Anselmi, T. Li',
    celestial='NGC 6505 · constellation Draco · about 186 million light-years away (source figure)',
    sizes=[('320', 319, 320), ('500', 500, 500), ('1024', 1024, 1024), ('1280', 1279, 1280), ('1600', 1600, 1600), ('3000', 3000, 3000)],
    recognition={'kind': 'editorial', 'text': 'Released by ESA’s Euclid mission, February 2025 (an editorial selection, not an audience score).'},
    story=[
      'A thin ring of light circles the bright center of the galaxy NGC 6505 in this Euclid image. It is an Einstein ring, and a strikingly clear one. NGC 6505 is an elliptical galaxy about 186 million light-years away in Draco, the Dragon.',
      'The ring is not part of NGC 6505 at all. It is the light of a much more distant galaxy sitting almost exactly behind it. The nearer galaxy’s gravity bends and magnifies that light as it passes, acting as a lens. Because the two line up so precisely, the background galaxy is stretched into a full circle.',
      'Albert Einstein predicted this kind of effect in his general theory of relativity, and alignments this close are rare. Around the ring, Euclid’s wide view also shows the galaxy’s extended halo of stars, bright stars in the foreground, and other galaxies far in the background.'
    ],
    scale=scale(4.1, 4.1, 186_000_000),
    explore=['An Einstein ring forms only when the lens and the source are almost perfectly aligned from our point of view; a slight offset breaks the ring into arcs or separate images. Studying how a ring is bent lets astronomers weigh the lensing galaxy, including matter they can’t see.'],
    alt='A glowing elliptical galaxy with a faint, thin ring of light circling its bright core, against a dark field with scattered stars and small galaxies.',
    sky={'con': 'Dra', 'ra': 267.78, 'dec': 65.531}),

  euclid('euclid20251105a', 'euclid-peers-through-a-dark-cloud-s-dusty-veil', cat='nebula',
    title='Euclid peers through the dark cloud LDN 1641',
    caption='Part of the dark cloud LDN 1641, imaged in near-infrared light by ESA’s Euclid space telescope',
    releaseDate='5 November 2025', esa='https://www.esa.int/ESA_Multimedia/Images/2025/11/Euclid_peers_through_a_dark_cloud_s_dusty_veil',
    credit='ESA/Euclid/Euclid Consortium/NASA, image processing by M. Schirmer (MPIA, Heidelberg)',
    celestial='LDN 1641 · constellation Orion · about 1,300 light-years away (source figure)',
    sizes=[('320', 285, 320), ('500', 446, 500), ('1024', 914, 1024), ('1280', 1143, 1280), ('1600', 1429, 1600), ('3000', 2679, 3000), ('6000', 5358, 6000), ('12000', 10717, 12000)],
    understand={'summary': "Euclid's near-infrared instrument, NISP, in the Y, J and H bands, shown as blue, green and red.",
                'filters': [['Y band · Infrared (Euclid NISP)', 'blue'], ['J band · Infrared (Euclid NISP)', 'green'], ['H band · Infrared (Euclid NISP)', 'red']],
                'eye': 'All three bands are near-infrared light, which the eye can’t see. In visible light this region looks nearly empty.'},
    recognition={'kind': 'editorial', 'text': 'Released by ESA’s Euclid mission, November 2025 (an editorial selection, not an audience score).'},
    story=[
      'Stars glitter through swirls of gas and dust in this near-infrared view of part of LDN 1641, a dark cloud about 1,300 light-years away. It sits in a large, dusty star-forming complex in Orion. In visible light the same patch looks mostly dark, with a few stars against a seemingly empty background.',
      'Dust grains block visible light very well but dim near-infrared light far less, so Euclid could see the stars shining through. The cloud is full of very young stars, and some are still blowing out material, a sign that stars are still forming; close up, those outflows show as magenta spots and coils. Toward the upper left the dust thins, opening a view to distant galaxies.',
      'Euclid took these pictures in September 2023 to fine-tune its pointing, which needed a field with few visible stars. The tests worked.'
    ],
    scale=scale(46.8, 52.4, 1300),
    explore=['The data cover about 0.64 square degrees, more than three times the area of the full Moon, and were collected in just under five hours. The ragged edge comes from the gaps between NISP’s sixteen detectors and small shifts between exposures, common in wide-field images.'],
    alt='Clouds of dust and gas with many stars shining through, thinning at the upper left into a dark field of distant galaxies; the image edge is jagged.',
    sky={'con': 'Ori', 'ra': 85.751, 'dec': -8.39}),

  euclid('euclid20231107d', 'euclid-s-view-of-globular-cluster-ngc-6397', cat='star',
    title='Euclid’s view of globular cluster NGC 6397',
    caption='The globular cluster NGC 6397, imaged by ESA’s Euclid space telescope',
    releaseDate='31 October 2023', esa='https://www.esa.int/ESA_Multimedia/Images/2023/11/Euclid_s_view_of_globular_cluster_NGC_6397',
    celestial='NGC 6397 · constellation Ara · about 7,800 light-years away (source figure)',
    sizes=SQ8 + [('original', 8200, 8200)],
    recognition={'kind': 'editorial', 'text': 'One of Euclid’s first five full-color images (an editorial selection, not an audience score).'},
    story=[
      'A dense ball of stars sparkles at the center of this Euclid image, thinning into a wide halo at its edges. This is NGC 6397, a globular cluster about 7,800 light-years away in Ara, the Altar. It is the second-closest globular cluster to Earth.',
      'Globular clusters are swarms of hundreds of thousands of stars bound together by gravity. They are among the oldest objects in the universe, so they hold clues to how galaxies like the Milky Way formed. NGC 6397 orbits our galaxy along with other globulars, around the disc where most of its stars live.',
      'Capturing a whole globular cluster in one observation is usually difficult. The crowded core is so bright that its brightest stars drown out fainter ones, while the outskirts spread far and are made mostly of faint, low-mass stars. Those faint outer stars can reveal past run-ins with the Milky Way. Euclid caught both in about an hour.'
    ],
    scale=scale(41.0, 41.0, 7800),
    explore=['In Euclid’s colors, hot stars look white-blue and distant galaxies in the background very red. ' + EU_ARTIFACTS],
    alt='A dense, glittering ball of stars at center, spreading into thinner and thinner stars toward the edges of a dark field.',
    sky={'con': 'Ara', 'ra': 265.175, 'dec': -53.675}),

  euclid('euclid20231107b', 'ngc-6822', cat='galaxy',
    title='Euclid’s view of irregular galaxy NGC 6822',
    caption='The irregular dwarf galaxy NGC 6822, imaged by ESA’s Euclid space telescope',
    releaseDate='7 November 2023', esa='https://www.esa.int/ESA_Multimedia/Images/2023/11/Euclid_s_view_of_irregular_galaxy_NGC_6822',
    celestial='NGC 6822 · constellation Sagittarius · about 1.6 million light-years away (source figure)',
    sizes=SQ8 + [('original', 8200, 8200)],
    recognition={'kind': 'editorial', 'text': 'One of Euclid’s first five full-color images (an editorial selection, not an audience score).'},
    story=[
      'A loose, shapeless crowd of stars fills the middle of this Euclid image. It is NGC 6822, an irregular dwarf galaxy just 1.6 million light-years from Earth in Sagittarius, a near neighbor by cosmic standards. It was the first irregular dwarf galaxy Euclid observed.',
      'Galaxies in the early universe mostly weren’t the tidy spirals of textbook pictures. They tended to be small and irregular, and they were the building blocks of larger galaxies like our own. A few of these small galaxies survive nearby, which makes NGC 6822 a window into how galaxies grew.',
      'To build its 3D map of the universe, Euclid will observe light from galaxies out to 10 billion light-years away. This view took about an hour. In its colors, hot stars look white-blue, glowing hydrogen appears blue, and dusty, gas-rich regions turn red.'
    ],
    scale=scale(41.0, 41.0, 1_600_000),
    explore=[EU_ARTIFACTS + ' Distant galaxies far behind NGC 6822 show up as small red smudges.'],
    alt='A loose, irregular cloud of faint stars among bright foreground stars with six-pointed spikes.',
    sky={'con': 'Sgr', 'ra': 296.236, 'dec': -14.788}),

  euclid('euclid20240523b', 'dorado-group-of-galaxies', cat='galaxy',
    title='Euclid’s view of the Dorado group of galaxies',
    caption='The Dorado group of galaxies, imaged by ESA’s Euclid space telescope',
    releaseDate='23 May 2024',
    celestial='Dorado group, NGC 1549, NGC 1553 · constellation Dorado · about 62 million light-years away (source figure)',
    recognition={'kind': 'editorial', 'text': 'Part of Euclid’s Early Release Observations, May 2024 (an editorial selection, not an audience score).'},
    story=[
      'Galaxies are caught in the act of interacting in this Euclid view, trailing tidal tails and shells of stars. They belong to the Dorado group, one of the richest groups of galaxies in the southern sky, about 62 million light-years away in the constellation Dorado.',
      'Dorado is much younger than big clusters such as Fornax. Some of its galaxies are still forming stars, while others seem to have merged fairly recently. In size it falls between large galaxy clusters and small groups, which makes it a useful test of how galaxies grow and collide inside halos of dark matter.',
      'The image spans galaxies from very bright to very faint. Euclid’s wide, sharp view lets one instrument study features as small as star clusters, the centers of galaxies, and long merger tails all at once. Astronomers are using it to catalog globular clusters around the galaxies and to hunt for new dwarf galaxies.'
    ],
    scale=scale(41.0, 41.0, 62_000_000),
    explore=['The image comes from about an hour of observing. ' + EU_ARTIFACTS],
    alt='Several bright galaxies with faint shells and tidal tails, spread across a dark field of stars and tiny distant galaxies.',
    sky={'con': 'Dor', 'ra': 64.014, 'dec': -55.78}),

  euclid('euclid20241015c', 'euclid-sees-spiral-galaxy-ngc-2188-and-galaxy-cluster-abell-3381', cat='galaxy',
    title='Spiral galaxy NGC 2188 and galaxy cluster Abell 3381',
    caption='The edge-on spiral galaxy NGC 2188 and the galaxy cluster Abell 3381, imaged by ESA’s Euclid space telescope',
    releaseDate='15 October 2024', esa='https://www.esa.int/ESA_Multimedia/Images/2024/10/Euclid_sees_spiral_galaxy_NGC_2188_and_galaxy_cluster_Abell_3381',
    credit='ESA/Euclid/Euclid Consortium/NASA, CEA Paris-Saclay',
    celestial='NGC 2188, Abell 3381 · constellation Columba · NGC 2188 about 25 million light-years away (source figure)',
    sizes=[('320', 320, 180), ('500', 500, 281), ('1024', 1024, 576), ('1280', 1280, 720), ('1600', 1600, 900), ('3000', 3000, 1687)],
    recognition={'kind': 'editorial', 'text': 'A close-up from the first piece of Euclid’s great map of the sky, October 2024 (an editorial selection, not an audience score).'},
    story=[
      'Toward the middle left of this Euclid view, the spiral galaxy NGC 2188 is seen edge-on, a thin streak of stars and dust about 25 million light-years away. In the upper right, far beyond it, the galaxy cluster Abell 3381 stands out clearly at about 678 million light-years.',
      'The picture is a cutout from a much larger mosaic that ESA released on 15 October 2024, enlarged twelve times compared with the full view. That mosaic is one early piece of the map Euclid is building, a survey of galaxies near and very far.',
      'Two galaxies in one frame, more than 650 million light-years apart, show how much depth a single patch of sky holds. Euclid’s colors combine its visible-light camera with two near-infrared bands, and its optics give bright stars six diffraction spikes.'
    ],
    scale=scale(78, 42, 25_000_000, 'NGC 2188’s'),
    explore=['An edge-on galaxy shows its disc as a thin line, with dust lanes running along its length; face-on, the same galaxy would show its spiral arms.'],
    alt='A thin, edge-on spiral galaxy at middle left and a cluster of galaxies at upper right, on a dark field with stars and small galaxies.',
    sky={'con': 'Col', 'ra': 92.505, 'dec': -33.826}),
]

# ---------- Chandra (NASA) ----------
def chandra(aid, page, **r):
    r.setdefault('sources', [['Chandra release page', page], ['AstroPix record (' + aid + ')', f'https://www.astropix.org/image/chandra/{aid}']])
    return {'id': f'chandra-{aid}', 'org': 'chandra', 'source': page, 'img': img('chandra', aid, r.pop('sizes')), **r}

C25 = 'https://chandra.harvard.edu/photo/2024/25th/'
C25_REC = {'kind': 'editorial', 'text': 'One of 25 images NASA released for Chandra’s 25th anniversary in space, July 2024 (an editorial selection, not an audience score).'}
X_EYE = 'X-rays never reach the ground and the eye can’t see them; every X-ray color here is assigned to show energy or to tell telescopes apart.'

CHANDRA = [
  chandra('555', 'https://chandra.harvard.edu/photo/2013/casa/', cat='nebula', tel=['chandra'],
    title='Cassiopeia A in X-rays',
    caption='The supernova remnant Cassiopeia A, imaged in X-rays by NASA’s Chandra X-ray Observatory',
    releaseDate='15 November 2013', credit='NASA/CXC/SAO',
    celestial='Cassiopeia A, Cas A · constellation Cassiopeia · about 11,000 light-years away (source figure)',
    sizes=[('320', 320, 271), ('500', 500, 424), ('1024', 1024, 868), ('1280', 1280, 1086), ('1600', 1600, 1357), ('3000', 3000, 2545), ('original', 3600, 3055)],
    recognition={'kind': 'editorial', 'text': 'Released by NASA’s Chandra X-ray Observatory (an editorial selection, not an audience score).'},
    story=[
      'A tangled shell of glowing debris fills this X-ray image, all that remains of a massive star that blew itself apart. This is Cassiopeia A, or Cas A, about 11,000 light-years away in Cassiopeia. Light from the explosion would have reached Earth more than 300 years ago.',
      'The colors sort the remnant’s X-rays by energy. Red is the lowest-energy light Chandra recorded here, green the middle range, and blue the highest. Reading those layers helps astronomers piece together the supernova itself: how big the star was, what it was made of, and how the blast unfolded.',
      'Making the picture took patience. It combines 16 separate Chandra observations between January 2000 and November 2010, about 353 hours of exposure in all, reprocessed to bring out the different energy bands. The image and a 3D model of the explosion were featured in a 3D project at the Smithsonian Institution.'
    ],
    scale=stated('The image is about 8.9 arcminutes across, about 29 light-years at the remnant’s distance, according to the Chandra release.', 11000),
    understand={'summary': "Chandra's ACIS camera in three X-ray energy bands: low (0.5–1.5 keV) in red, medium (1.5–2.5 keV) in green and high (4.0–6.0 keV) in blue.",
                'filters': [['0.5–1.5 keV · X-ray (Chandra ACIS)', 'red'], ['1.5–2.5 keV · X-ray (Chandra ACIS)', 'green'], ['4.0–6.0 keV · X-ray (Chandra ACIS)', 'blue']],
                'eye': X_EYE},
    behind={**behind('Chandra X-ray Observatory, ACIS', 'NASA/CXC/SAO'), 'exposure': 'About 353 hours, from 16 observations between January 2000 and November 2010 (source figures).', 'technique': 'Stack of 16 observations.'},
    explore=['A supernova remnant like Cas A is a cloud of stellar debris still racing outward and heated to millions of degrees, hot enough to glow in X-rays. The elements forged inside the star are scattered into space, where they can end up in new stars and planets.'],
    alt='A roughly circular, tangled shell of red, green and blue glowing filaments on a black background.',
    sky={'con': 'Cas', 'ra': 350.861, 'dec': 58.818}),

  chandra('838a', C25, cat='nebula', tel=['chandra', 'hubble'],
    title='The Crab Nebula in X-rays and visible light',
    caption='The Crab Nebula, imaged by NASA’s Chandra X-ray Observatory and IXPE, with the Hubble Space Telescope',
    releaseDate='22 July 2024',
    credit='X-ray: (Chandra) NASA/CXC/SAO, (IXPE) NASA/MSFC; Optical: NASA/ESA/STScI; Image Processing: NASA/CXC/SAO/J. Schmidt, K. Arcand, and L. Frattare',
    celestial='Crab Nebula, Messier 1 · constellation Taurus · about 6,500 light-years away (source figure)',
    sizes=[('320', 320, 288), ('500', 500, 450), ('1024', 1024, 922), ('1280', 1280, 1153), ('1600', 1600, 1442), ('3000', 3000, 2703)],
    recognition=C25_REC,
    story=[
      'Rings and jets of X-ray light flare from the heart of the Crab Nebula in this composite, set inside the filaments seen by Hubble. The Crab is what remains of a bright supernova that Chinese and other astronomers recorded in the year 1054. It lies about 6,500 light-years away in Taurus.',
      'At the center spins a pulsar, the collapsed core of the star that exploded. Chandra’s view shows the rings around it and the jets it shoots into space. Chandra’s X-rays appear in blue and white, X-rays from NASA’s IXPE mission in purple, and Hubble’s visible light in red, green and blue.',
      'The picture was one of 25 that NASA released on 22 July 2024 to mark Chandra’s 25 years in space. The telescope launched aboard the Space Shuttle Columbia on 23 July 1999, and has since observed thousands of objects, from black holes to exploded stars.'
    ],
    scale=stated('The image is about 6.4 arcminutes across, about 12 light-years at the nebula’s distance, according to the Chandra release.', 6500),
    understand={'summary': "Chandra X-rays (blue and white) and X-rays from NASA's IXPE (purple), combined with visible light from the Hubble Space Telescope (red, green and blue).",
                'filters': [['X-ray (Chandra ACIS)', 'blue, white'], ['X-ray (IXPE)', 'purple'], ['Optical (Hubble ACS)', 'red, green, blue']],
                'eye': 'The filaments are visible light, but the X-ray glow of the rings and jets is invisible to the eye; its colors are assigned.'},
    behind={**behind('Chandra X-ray Observatory, ACIS; IXPE; Hubble Space Telescope', 'NASA/CXC/SAO, NASA/MSFC, NASA/ESA/STScI'), 'exposure': 'Chandra: about 25 hours, from 48 observations between March 2000 and November 2013 (source figures).', 'technique': 'Composite of three telescopes’ data.'},
    explore=['IXPE, the Imaging X-ray Polarimetry Explorer, measures which way X-rays are polarized, which tells astronomers about the magnetic fields around objects like the Crab’s pulsar.'],
    alt='A cloud of reddish and greenish filaments with a bright blue-white center of rings and jets, tinged with purple.',
    sky={'con': 'Tau', 'ra': 83.633, 'dec': 22.014}),

  chandra('793', 'https://chandra.harvard.edu/photo/2023/30dor/', cat='nebula', tel=['chandra', 'webb'],
    title='30 Doradus in X-rays and infrared',
    caption='The Tarantula Nebula, 30 Doradus, imaged by NASA’s Chandra X-ray Observatory and the James Webb Space Telescope',
    releaseDate='9 January 2023',
    credit='X-ray (Chandra): NASA/CXC/Penn State Univ./L. Townsley et al.; IR (JWST): NASA/ESA/CSA/STScI/JWST ERO Production Team',
    celestial='30 Doradus, Tarantula Nebula · Large Magellanic Cloud · constellation Dorado · about 170,000 light-years away (source figure)',
    sizes=[('320', 320, 185), ('500', 500, 289), ('1024', 1024, 592), ('1280', 1280, 740), ('1600', 1600, 925), ('3000', 3000, 1734), ('6000', 6000, 3469)],
    recognition={'kind': 'editorial', 'text': 'Released by NASA’s Chandra X-ray Observatory, January 2023 (an editorial selection, not an audience score).'},
    story=[
      'Royal blue and purple X-rays wash over the infrared glow of the Tarantula Nebula in this composite. Also known as 30 Doradus, it is the largest and brightest star-forming region in the Local Group, the family of galaxies that includes the Milky Way. It lies in the Large Magellanic Cloud, about 170,000 light-years away.',
      'The X-rays come from gas heated to millions of degrees by shock waves, rather like sonic booms, driven by winds from massive stars. Chandra also picks out supernova remnants that will one day spread elements like oxygen and carbon into future stars. Webb’s infrared, in red, orange, green and light blue, shows cooler gas and newborn protostars.',
      'The Tarantula’s chemical makeup resembles conditions in our galaxy several billion years ago, when stars formed much faster. Chandra observed it many times, often under astronomer Leisa Townsley, who died in 2022.'
    ],
    scale=stated('The image is about 7.2 arcminutes across, about 360 light-years at the nebula’s distance, according to the Chandra release.', 170000),
    understand={'summary': "Chandra X-rays in royal blue and purple, combined with near-infrared light from the James Webb Space Telescope in red, orange, green and light blue.",
                'filters': [['X-ray (Chandra ACIS)', 'royal blue, purple'], ['Infrared (Webb)', 'red, orange, green, light blue']],
                'eye': 'Neither X-rays nor this infrared light can be seen by the eye, so every color here is assigned.'},
    behind={**behind('Chandra X-ray Observatory, ACIS; James Webb Space Telescope', 'NASA/CXC/Penn State Univ./L. Townsley et al.; NASA/ESA/CSA/STScI'), 'exposure': 'Chandra: about 572 hours, from 54 observations between January 2007 and January 2016 (source figures).', 'technique': 'Composite of two telescopes’ data.'},
    explore=['Because 30 Doradus is relatively close and bright, it gives astronomers a nearby stand-in for star formation in the young universe. Its Webb image was released in fall 2022; the Chandra data were added for this composite.'],
    alt='A wide nebula of orange and red infrared clouds and stars, overlaid with diffuse royal blue and purple X-ray glow.',
    sky={'con': 'Dor', 'ra': 84.675, 'dec': -69.101}),

  chandra('570', 'https://chandra.harvard.edu/photo/2014/m51/', cat='galaxy', tel=['chandra', 'hubble'],
    title='The Whirlpool Galaxy sparkling in X-rays',
    caption='The Whirlpool Galaxy, M51, imaged by NASA’s Chandra X-ray Observatory and the Hubble Space Telescope',
    releaseDate='3 June 2014', credit='X-ray: NASA/CXC/Wesleyan Univ./R.Kilgard, et al; Optical: NASA/STScI',
    celestial='Whirlpool Galaxy, Messier 51, NGC 5194 · constellation Canes Venatici · about 30 million light-years away (source figure)',
    sizes=[('320', 211, 320), ('500', 331, 500), ('1024', 678, 1024), ('1280', 847, 1280), ('1600', 1059, 1600), ('3000', 1986, 3000), ('original', 2384, 3600)],
    recognition={'kind': 'editorial', 'text': 'Released by NASA’s Chandra X-ray Observatory, June 2014 (an editorial selection, not an audience score).'},
    story=[
      'Purple points of X-ray light are scattered across the arms of the Whirlpool Galaxy in this view, which pairs Chandra with Hubble. The Whirlpool, also called M51, is a spiral much like the Milky Way, about 30 million light-years away and turned face-on toward us.',
      'Chandra found nearly 500 X-ray sources here, about 400 of them thought to be in M51 itself. Most are X-ray binaries, where a neutron star or a black hole pulls material off a companion star; the gas heats to millions of degrees and glows. At least ten are bright enough to hold black holes.',
      'A smaller galaxy at upper left is merging with M51, and scientists think it is setting off waves of star formation. The most massive new stars will become neutron stars or black holes within a few million years. Much of the diffuse X-ray glow comes from gas heated by supernovae.'
    ],
    scale=stated('The image is about 6 × 10 arcminutes, roughly 52,000 × 87,000 light-years at the galaxy’s distance, according to the Chandra release.', 30_000_000),
    understand={'summary': "Chandra X-rays in purple, combined with visible light from the Hubble Space Telescope in red, green and blue (including hydrogen-alpha in red).",
                'filters': [['X-ray (Chandra ACIS)', 'purple'], ['435 nm · Optical B (Hubble ACS)', 'blue'], ['555 nm · Optical V (Hubble ACS)', 'green'], ['658 nm · Optical H-alpha (Hubble ACS)', 'red']],
                'eye': 'The spiral is visible light; the purple X-ray sources would be invisible to the eye.'},
    behind={**behind('Chandra X-ray Observatory, ACIS; Hubble Space Telescope, ACS', 'NASA/CXC/Wesleyan Univ./R. Kilgard et al.; NASA/STScI'), 'exposure': 'Chandra: about 232 hours, from 11 observations between March 2000 and October 2012 (source figures).', 'technique': 'Composite of two telescopes’ data.'},
    explore=['Chandra watched M51 for about a decade. The black holes with massive companions stayed steadily bright the whole time, which suggests strong winds from those companions feed them a steady supply of material. Earlier Chandra studies had found just over 100 X-ray sources.'],
    alt='A face-on spiral galaxy with a smaller companion at upper left, its arms dotted with purple points of X-ray light.',
    sky={'con': 'CVn', 'ra': 202.468, 'dec': 47.213}),

  chandra('849b', 'https://chandra.harvard.edu/photo/2024/ngc602/', cat='star', tel=['chandra', 'webb'],
    title='NGC 602, a cosmic wreath',
    caption='The young star cluster NGC 602, imaged by NASA’s Chandra X-ray Observatory and the James Webb Space Telescope',
    releaseDate='17 December 2024',
    credit='X-ray: NASA/CXC; Infrared: ESA/Webb, NASA & CSA, P. Zeilder, E. Sabbi, A. Nota, M. Zamani; Image Processing: NASA/CXC/SAO/L. Frattare and K. Arcand',
    celestial='NGC 602 · Small Magellanic Cloud · constellation Hydrus · about 200,000 light-years away (source figure)',
    sizes=[('320', 320, 277), ('500', 500, 433), ('1024', 1024, 887), ('1280', 1280, 1109), ('1600', 1600, 1386), ('3000', 3000, 2600)],
    recognition={'kind': 'editorial', 'text': 'Released by NASA’s Chandra X-ray Observatory, December 2024 (an editorial selection, not an audience score).'},
    story=[
      'A dark ring of dusty clouds circles a cluster of young stars here, lit up like a holiday wreath. This is NGC 602, a star cluster on the edge of the Small Magellanic Cloud, one of the Milky Way’s nearest neighboring galaxies, about 200,000 light-years away.',
      'Chandra’s X-rays, shown in red, come from young, massive stars that light up the wreath and send high-energy light into space, powered by winds blowing off them. The diffuse X-ray cloud is likely the combined glow of thousands of young, low-mass stars. Webb’s infrared view appears in orange, yellow, green and blue.',
      'The cluster’s stars contain fewer heavy elements than the Sun, so conditions there are a lot like those billions of years ago, when the universe was much younger. That makes NGC 602 a good place to study how stars are born, live and die, a fitting theme for a wreath.'
    ],
    scale=stated('The image is about 3 arcminutes across, about 175 light-years at the cluster’s distance, according to the Chandra release.', 200000),
    understand={'summary': "Chandra X-rays in red, combined with an infrared image from the James Webb Space Telescope in orange, yellow, green and blue.",
                'filters': [['X-ray (Chandra ACIS)', 'red'], ['Infrared (Webb NIRCam, MIRI)', 'orange, yellow, green, blue']],
                'eye': 'Neither X-rays nor this infrared light can be seen by the eye, so every color here is assigned.'},
    behind={**behind('Chandra X-ray Observatory, ACIS; James Webb Space Telescope', 'NASA/CXC; ESA/Webb, NASA & CSA'), 'exposure': 'Chandra: about 81 hours, from 11 observations between 31 March and 29 April 2010 (source figures).', 'technique': 'Composite of two telescopes’ data.'},
    explore=['Heavy elements, which astronomers call metals, build up over cosmic time as each generation of stars forges them and spreads them into space. A cluster poor in them is a little like a time capsule from an earlier universe.'],
    alt='A ring of dark, dusty clouds rimmed in orange and yellow, around a cluster of bright young stars and a diffuse red glow.',
    sky={'con': 'Hyi', 'ra': 22.37, 'dec': -73.561}),

  chandra('838l', C25, cat='galaxy', tel=['chandra', 'wfi'],
    title='Centaurus A and its black hole’s jets',
    caption='The galaxy Centaurus A, imaged by NASA’s Chandra X-ray Observatory and IXPE, with the MPG/ESO 2.2-meter telescope',
    releaseDate='22 July 2024',
    credit='X-ray: (Chandra) NASA/CXC/SAO, (IXPE) NASA/MSFC; Optical: ESO; Image Processing: NASA/CXC/SAO/K. Arcand, J. Major, and J. Schmidt',
    celestial='Centaurus A, NGC 5128 · constellation Centaurus · about 12 million light-years away (source figure)',
    sizes=[('320', 320, 315), ('500', 500, 492), ('1024', 1024, 1008), ('1280', 1280, 1261), ('1600', 1600, 1576)],
    recognition=C25_REC,
    story=[
      'Jets of X-ray light shoot out from the center of the galaxy Centaurus A. They are launched by a supermassive black hole at the galaxy’s heart and reach far out into space. Centaurus A is about 12 million light-years away in the constellation Centaurus.',
      'This composite combines X-rays from Chandra and from NASA’s IXPE mission with visible light from the MPG/ESO 2.2-meter telescope. The Chandra data alone come from 21 observations between December 1999 and August 2012, nearly 230 hours of looking.',
      'It is one of 25 images NASA released on 22 July 2024 for Chandra’s 25th anniversary in space. Some of the set add new Chandra data to earlier releases or combine it with other telescopes; others showed Chandra data for the first time. Chandra launched aboard the Space Shuttle Columbia on 23 July 1999.'
    ],
    scale=stated('The image is about 25 arcminutes across, about 87,000 light-years at the galaxy’s distance, according to the Chandra release.', 12_000_000),
    understand={'summary': "X-rays from Chandra and NASA's IXPE, combined with visible light from the MPG/ESO 2.2-meter telescope, each shown in red, green and blue.",
                'filters': [['X-ray (Chandra ACIS)', 'red, green, blue'], ['X-ray (IXPE)', 'red, green, blue'], ['Optical B, V, I (MPG/ESO 2.2-meter)', 'red, green, blue']],
                'eye': 'The galaxy’s starlight is visible light; the jets’ X-ray glow would be invisible to the eye.'},
    behind={**behind('Chandra X-ray Observatory, ACIS; IXPE; MPG/ESO 2.2-meter telescope', 'NASA/CXC/SAO, NASA/MSFC, ESO'), 'exposure': 'Chandra: about 230 hours, from 21 observations between December 1999 and August 2012 (source figures).', 'technique': 'Composite of three telescopes’ data.'},
    explore=['A supermassive black hole doesn’t shine on its own. The jets form as matter swirling toward it is heated and some of it is flung outward along the black hole’s magnetic field at a large fraction of the speed of light.'],
    alt='A round, glowing galaxy with long jets of X-ray light extending from its center.',
    sky={'con': 'Cen', 'ra': 201.365, 'dec': -43.019}),

  chandra('838r', C25, cat='nebula', tel=['chandra', 'webb'],
    title='The Cosmic Cliffs, NGC 3324, in X-rays and infrared',
    caption='The Cosmic Cliffs in NGC 3324, imaged by NASA’s Chandra X-ray Observatory and the James Webb Space Telescope',
    releaseDate='22 July 2024',
    credit='X-ray: NASA/CXC/Ludwig Maximilian Univ./T. Preibisch et al.; Infrared: NASA/ESA/CSA/STScI; Image processing: NASA/CXC/SAO/N. Wolk',
    celestial='NGC 3324, the Cosmic Cliffs · Carina Nebula · constellation Carina · about 7,600 light-years away (source figure)',
    sizes=[('320', 320, 243), ('500', 500, 380), ('1024', 1024, 778), ('1280', 1280, 973), ('1600', 1600, 1216), ('3000', 3000, 2281)],
    recognition=C25_REC,
    story=[
      'Purple points of X-ray light sit above the ridge of glowing gas and dust that astronomers nicknamed the “Cosmic Cliffs,” in this blend of Chandra and Webb. The cliffs are part of NGC 3324, a star-forming region on the edge of the Carina Nebula, about 7,600 light-years away.',
      'Chandra detects the X-rays of young stars in two clusters here. Young stars are often very active, flaring far more strongly than the Sun, which makes them stand out in X-rays even when dust hides them. Webb’s infrared view, in red, orange, yellow, green, cyan and blue, shows the cliffs themselves.',
      'This composite is one of 25 that NASA released on 22 July 2024 for Chandra’s 25th anniversary. The Chandra part comes from a single 19-hour observation made on 8 October 2012.'
    ],
    scale=stated('The image is about 23.6 arcminutes across, about 52 light-years at the region’s distance, according to the Chandra release.', 7600),
    understand={'summary': "Chandra X-rays in purple, combined with the James Webb Space Telescope's near-infrared image in red, orange, yellow, green, cyan and blue.",
                'filters': [['X-ray (Chandra ACIS)', 'purple'], ['Infrared (Webb NIRCam)', 'red, orange, yellow, green, cyan, blue']],
                'eye': 'Neither X-rays nor this infrared light can be seen by the eye, so every color here is assigned.'},
    behind={**behind('Chandra X-ray Observatory, ACIS; James Webb Space Telescope', 'NASA/CXC/Ludwig Maximilian Univ./T. Preibisch et al.; NASA/ESA/CSA/STScI'), 'exposure': 'Chandra: about 19 hours, one observation on 8 October 2012 (source figures).', 'technique': 'Composite of two telescopes’ data.'},
    explore=['The Cosmic Cliffs also starred in one of the James Webb Space Telescope’s first full-color images. Here the same view gains Chandra’s X-ray stars, a reminder that the young stars inside the clouds are far more active than the Sun.'],
    alt='A rugged ridge of glowing gas and dust, with purple points of X-ray light scattered above it.',
    sky={'con': 'Car', 'ra': 159.365, 'dec': -58.628}),

  chandra('838b', C25, cat='nebula', tel=['chandra', 'webb'],
    title='The Orion Nebula in X-rays and infrared',
    caption='The heart of the Orion Nebula, imaged by NASA’s Chandra X-ray Observatory and the James Webb Space Telescope',
    releaseDate='22 July 2024',
    credit='X-ray: NASA/CXC/SAO; Infrared: NASA/ESA/CSA/STScI/M. Mccaughrean, S. Pearson; Image Processing: NASA/CXC/SAO/K. Arcand and J. Major',
    celestial='Orion Nebula, Messier 42 · constellation Orion · about 1,310 light-years away (source figure)',
    sizes=[('320', 250, 320), ('500', 391, 500), ('1024', 801, 1024), ('1280', 1001, 1280), ('1600', 1252, 1600), ('3000', 2347, 3000)],
    recognition=C25_REC,
    story=[
      'Magenta specks of X-ray light are newly formed stars in the heart of the Orion Nebula, set against Webb’s infrared view of the glowing gas around them. Orion is one of the nearest star-forming regions to Earth, about 1,310 light-years away.',
      'Young stars give off far more X-rays than older ones like the Sun, so Chandra can pick them out even where they are deeply embedded in the cloud. The Chandra data come from six observations between 8 and 21 January 2003, nearly 233 hours in all. Webb’s infrared light is shown in red, green and blue.',
      'This composite is one of 25 that NASA released on 22 July 2024 for Chandra’s 25th anniversary. The telescope has observed thousands of objects since its launch in 1999, some of them many times, from black holes to exploded stars.'
    ],
    scale=stated('The image is about 3.25 arcminutes across, about 1.3 light-years at the nebula’s distance, according to the Chandra release.', 1310),
    understand={'summary': "Chandra X-rays in magenta, combined with the James Webb Space Telescope's infrared image in red, green and blue.",
                'filters': [['X-ray (Chandra ACIS)', 'magenta'], ['Infrared (Webb NIRCam)', 'red, green, blue']],
                'eye': 'Neither X-rays nor this infrared light can be seen by the eye, so every color here is assigned.'},
    behind={**behind('Chandra X-ray Observatory, ACIS; James Webb Space Telescope', 'NASA/CXC/SAO; NASA/ESA/CSA/STScI/M. McCaughrean, S. Pearson'), 'exposure': 'Chandra: about 233 hours, from 6 observations between 8 and 21 January 2003 (source figures).', 'technique': 'Composite of two telescopes’ data.'},
    explore=['The Orion Nebula can be seen with the unaided eye as a fuzzy patch in Orion’s sword. This view is a tiny piece of it, about 1.3 light-years across, around its brightest young stars.'],
    alt='A tall view of glowing clouds of gas, dotted with many magenta points of light.',
    sky={'con': 'Ori', 'ra': 83.81, 'dec': -5.394}),
]

# ---------- Spitzer (NASA/JPL-Caltech) ----------
def spitzer(aid, page, **r):
    r.setdefault('sources', [['Spitzer image page, NASA/JPL-Caltech', page], ['AstroPix record (' + aid + ')', f'https://www.astropix.org/image/spitzer/{aid}']])
    r.setdefault('behind', behind('Spitzer Space Telescope, ' + r.pop('instruments', 'IRAC'), r['credit']))
    return {'id': f'spitzer-{aid}', 'org': 'nasa', 'tel': ['spitzer'], 'source': page, 'img': img('spitzer', aid, r.pop('sizes')), **r}

SWEET16 = {'kind': 'editorial', 'text': 'One of NASA’s “Sixteen Images for Spitzer’s Sweet 16,” chosen in 2019 (an editorial selection, not an audience score).'}
SP_REC = lambda when: {'kind': 'editorial', 'text': f'Released by NASA’s Spitzer Space Telescope, {when} (an editorial selection, not an audience score).'}
IR_EYE = 'All of this is infrared light, invisible to the eye; the colors stand for different infrared wavelengths. Infrared passes through dust that hides these regions in visible light.'
f = lambda um, inst, color: [f'{um} μm · Infrared (Spitzer {inst})', color]

SPITZER = [
  spitzer('ssc2018-14a', 'https://www.spitzer.caltech.edu/image/ssc2018-14a-the-cats-paw-nebula-mips-irac', cat='nebula', instruments='IRAC and MIPS',
    title='The Cat’s Paw Nebula in infrared',
    caption='The Cat’s Paw Nebula, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='23 October 2018', credit='NASA/JPL-Caltech',
    celestial='Cat’s Paw Nebula, NGC 6334 · constellation Scorpius · about 4,200 to 5,500 light-years away (source figure)',
    sizes=[('320', 320, 118), ('500', 500, 184), ('1024', 1024, 378), ('1280', 1280, 473), ('1600', 1600, 591), ('3000', 3000, 1109), ('6000', 6000, 2218)],
    recognition=SP_REC('October 2018'),
    story=[
      'A broad band of glowing gas and dust runs across this infrared view of the Cat’s Paw Nebula, a star-forming region in our own galaxy. It lies an estimated 4,200 to 5,500 light-years away in Scorpius. Dark filaments threading through it are especially dense knots of gas and dust.',
      'New stars heat the gas around them, and the pressure can inflate rounded bubbles, which appear red here. Some bubbles are lopsided and may have burst open, leaving U-shaped features behind. The green glow comes from large molecules and small dust grains called polycyclic aromatic hydrocarbons, made to fluoresce by radiation from hot stars.',
      'The gas and dust in the band may one day collapse into new stars. The whole region is thought to span 80 to 90 light-years. Spitzer combined two of its instruments for this view.'
    ],
    scale=stated('The star-forming region is thought to span 80 to 90 light-years, according to the Spitzer release.', 5500),
    understand={'summary': "Spitzer's Infrared Array Camera (IRAC) and its Multiband Imaging Photometer (MIPS): 3.6 microns in blue, 4.5 microns in cyan, 8 microns in green and 24 microns in red.",
                'filters': [f('3.6', 'IRAC', 'blue'), f('4.5', 'IRAC', 'cyan'), f('8.0', 'IRAC', 'green'), f('24', 'MIPS', 'red')], 'eye': IR_EYE},
    explore=['Spitzer’s 24-micron light picks out warm dust, which is why the heated bubbles stand out in red, while the 8-micron light traces those glowing carbon molecules at the bubbles’ edges.'],
    alt='A wide band of glowing green clouds threaded with dark filaments and dotted with round red bubbles, across a field of stars.',
    sky={'con': 'Sco', 'ra': 259.822, 'dec': -36.066}),

  spitzer('ssc2008-03a1', 'https://www.spitzer.caltech.edu/image/ssc2008-03a-young-stars-in-their-baby-blanket-of-dust-rho-ophiuchi', cat='nebula', instruments='IRAC and MIPS',
    title='Rho Ophiuchi, young stars in a blanket of dust',
    caption='The Rho Ophiuchi dark cloud, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='11 February 2008', credit='NASA/JPL-Caltech/Harvard-Smithsonian CfA',
    celestial='Rho Ophiuchi cloud, Lynds 1688 · constellation Ophiuchus · about 407 light-years away (source figure)',
    sizes=[('320', 320, 154), ('500', 500, 241), ('1024', 1024, 494), ('1280', 1280, 617), ('1600', 1600, 772), ('3000', 3000, 1447), ('6000', 6000, 2895)],
    recognition=SWEET16,
    story=[
      'Newborn stars are breaking out of their dusty cradle in this infrared view of the Rho Ophiuchi dark cloud, which astronomers call “Rho Oph.” About 407 light-years away, near Scorpius and Ophiuchus, it is one of the closest star-forming regions to our solar system.',
      'This is the main cloud, Lynds 1688, a large core of molecular hydrogen with long streamers trailing off from it. X-ray and infrared studies suggest more than 300 young stellar objects lie inside, with a median age of only about 300,000 years, compared with more than 12 billion years for some of the oldest stars.',
      'The colors are a rough guide to age and temperature. The youngest stars, still wrapped in the dusty discs where they and perhaps planets are forming, appear red. Older stars that have shed their birth material look blue. Some young stars sit in small nebulae of their own.'
    ],
    scale=scale(126, 60, 407),
    understand={'summary': "Spitzer's Infrared Array Camera (finest detail) at 3.6 microns in blue and 8 microns in green, with its Multiband Imaging Photometer (better for cooler material) at 24 microns in red.",
                'filters': [f('3.6', 'IRAC', 'blue'), f('8.0', 'IRAC', 'green'), f('24', 'MIPS', 'red')], 'eye': IR_EYE},
    explore=['Molecular hydrogen is the raw material of new stars: cold clouds of it collapse under their own gravity. Rho Oph is close and young, so it has become a favorite place to watch that process in detail.'],
    alt='A wide, cloudy region of glowing dust in green and red, scattered with red and blue stars.',
    sky={'con': 'Oph', 'ra': 246.841, 'dec': -24.374}),

  spitzer('sig07-016', 'https://www.spitzer.caltech.edu/image/sig07-016-spitzer-celebrates-fourth-anniversary-with-celestial-fireworks', cat='nebula',
    title='The Helix Nebula in infrared',
    caption='The Helix Nebula, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='24 August 2007', credit='NASA/JPL-Caltech/ J. Hora (Harvard-Smithsonian CfA)',
    celestial='Helix Nebula, NGC 7293 · constellation Aquarius · about 650 light-years away (source figure)',
    sizes=[('320', 320, 298), ('500', 500, 465), ('1024', 1024, 953), ('1280', 1280, 1192), ('1600', 1600, 1490), ('3000', 3000, 2794), ('original', 4370, 4070)],
    recognition=SWEET16,
    story=[
      'A dying star is coming apart and drifting off into space in this infrared portrait of the Helix Nebula, released to mark four years since Spitzer’s launch. The Helix, about 650 light-years away in Aquarius, is a favorite of amateur and professional astronomers alike.',
      'Spitzer mapped the nebula’s broad outer structure, which spans six light-years. Near the middle sits the remnant of the star itself, and there the telescope found what appears to be a planetary system that survived the star’s violent death throes.',
      'A planetary nebula like the Helix forms when a Sun-like star, at the end of its life, sheds its outer layers. The exposed core is so hot that its light makes the expelled gas and dust glow. In this view, blue and green are near-infrared light and red is mid-infrared, all recorded by Spitzer’s Infrared Array Camera.'
    ],
    scale=stated('The nebula’s outer structure spans six light-years, according to the Spitzer release.', 650),
    understand={'summary': "Spitzer's Infrared Array Camera (IRAC): 3.6 microns in blue, 4.5 microns in green and 8.0 microns in red.",
                'filters': [f('3.6', 'IRAC', 'blue'), f('4.5', 'IRAC', 'green'), f('8.0', 'IRAC', 'red')], 'eye': IR_EYE},
    explore=['Planetary nebulae have nothing to do with planets; the name dates to early telescopes, in which they looked like the round discs of planets.'],
    alt='A round, layered nebula of red and green glowing gas with a hollow center, among scattered stars.',
    sky={'con': 'Aqr', 'ra': 337.419, 'dec': -20.83}),

  spitzer('ssc2024-02a', 'https://www.spitzer.caltech.edu/image/ssc2024-02a-the-infrared-face-of-the-andromeda-galaxy', cat='galaxy', instruments='IRAC and MIPS',
    title='The infrared face of the Andromeda Galaxy',
    caption='The Andromeda Galaxy, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='9 May 2024', credit='NASA/JPL-Caltech',
    celestial='Andromeda Galaxy, Messier 31 · constellation Andromeda · about 2.5 million light-years away (source figure)',
    sizes=[('320', 320, 138), ('500', 500, 215), ('1024', 1024, 441), ('1280', 1280, 552), ('1600', 1600, 690), ('3000', 3000, 1294), ('6000', 6000, 2589)],
    recognition=SP_REC('May 2024'),
    story=[
      'A ring of glowing dust runs through the thin, pancake-shaped disc of the Andromeda Galaxy in this reprocessed infrared view from NASA’s now-retired Spitzer Space Telescope. Andromeda is the Milky Way’s largest neighbor, and the frame spans about 3.8 degrees of sky, roughly eight full Moons side by side.',
      'In visible light, dust shows up only where it blocks the stars behind it. At longer infrared wavelengths the dust glows on its own. Many spots along Andromeda’s dusty ring are forming new stars, and arcs of dust near the center may hold a clue about the supermassive black hole there.',
      'Starlight appears in blue and cyan. Red traces dust rich in carbon molecules that glow when nearby stars light them, and green adds the warm glow of dust. Where green and red blend, the hottest dust clouds, tied to newborn stars, turn orange-yellow.'
    ],
    scale=scale(234, 102, 2_500_000),
    understand={'summary': "Spitzer's Infrared Array Camera at 3.6 and 4.5 microns (starlight, in blue and cyan) and 8 microns (dust, in red), with its Multiband Imaging Photometer at 24 microns (warm dust, in green). Data from NASA's WISE fill areas Spitzer didn't map.",
                'filters': [f('3.6', 'IRAC', 'blue'), f('4.5', 'IRAC', 'cyan'), f('8.0', 'IRAC', 'red'), f('24', 'MIPS', 'green')], 'eye': IR_EYE},
    explore=['Infrared views like this help astronomers understand how galaxies like Andromeda form stars. The areas Spitzer didn’t map, mostly holding foreground stars in our own Milky Way, were filled in with data from NASA’s Wide-field Infrared Survey Explorer (WISE).'],
    alt='A large galaxy seen at an angle, its disc traced by a ring of glowing red and orange dust around its core.',
    sky={'con': 'And', 'ra': 10.685, 'dec': 41.269}),

  spitzer('sig12-014', 'https://www.spitzer.caltech.edu/image/sig12-014-massive-star-makes-waves', cat='star', instruments='IRAC and MIPS',
    title='Zeta Ophiuchi makes waves',
    caption='The runaway star Zeta Ophiuchi and its bow shock, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='18 December 2012', credit='NASA/JPL-Caltech',
    celestial='Zeta Ophiuchi · constellation Ophiuchus · about 370 light-years away (source figure)',
    sizes=[('320', 320, 289), ('500', 500, 452), ('1024', 1024, 927), ('1280', 1280, 1159), ('1600', 1600, 1449), ('3000', 3000, 2717), ('original', 4015, 3637)],
    recognition=SWEET16,
    story=[
      'A giant star is plowing through space in this infrared view, rippling the dust ahead of it into a glowing bow shock on the left. The star is Zeta Ophiuchi, about 370 light-years away. It is roughly six times hotter, eight times wider and 20 times more massive than the Sun, and about 80,000 times brighter.',
      'It races along at about 24 kilometers per second, faster than sound travels through the thin gas around it. Like the wave at a ship’s bow or the boom of a supersonic jet, its wind piles the material up into a shock, which glows in red. Fine filaments of dust appear in green.',
      'Dense dust in front of the star hides it from view; otherwise it would be one of the brightest stars in our sky. The shock forms about half a light-year out, nearly 800 times the distance from the Sun to Pluto.'
    ],
    scale=scale(40.2, 36.4, 370, 'the release’s'),
    understand={'summary': "Spitzer's Infrared Array Camera at 3.6 and 4.5 microns in blue and 8.0 microns in green, with its Multiband Imaging Photometer at 24 microns in red.",
                'filters': [f('3.6', 'IRAC', 'blue'), f('4.5', 'IRAC', 'blue'), f('8.0', 'IRAC', 'green'), f('24', 'MIPS', 'red')],
                'eye': 'All of this is infrared light, invisible to the eye. A shock this bright would probably show in visible light too, but dust blocks the view.'},
    explore=['Our Sun, with its weaker wind and slower motion, may not make a bow shock at all. The Voyager spacecraft, now about three times farther out than Pluto, were then expected to cross into interstellar space within a few years, a far gentler transition.'],
    alt='A bright star near center with a curved arc of glowing red dust ahead of it on the left, amid wispy green filaments.',
    sky={'con': 'Oph', 'ra': 249.311, 'dec': -10.516}),

  spitzer('ssc2006-16a1', 'https://www.spitzer.caltech.edu/image/ssc2006-16a1-orion-in-the-infrared', cat='nebula',
    title='Orion in the infrared',
    caption='The Orion Nebula and its surroundings, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='14 August 2006', credit='NASA/JPL-Caltech/T. Megeath (University of Toledo, Ohio)',
    celestial='Orion Nebula, Messier 42 · constellation Orion · about 1,450 light-years away (source figure)',
    sizes=[('320', 171, 320), ('500', 268, 500), ('1024', 549, 1024), ('1280', 686, 1280), ('1600', 858, 1600), ('3000', 1610, 3000), ('original', 3220, 6000)],
    recognition=SP_REC('August 2006'),
    story=[
      'The Orion Nebula fills the lower half of this tall infrared view, ringed by dust. To the unaided eye it looks like a fuzzy star in the sword of Orion, the hunter. It is a nearby hub of massive star formation, about 1,450 light-years from Earth.',
      'The nebula formed inside a cold cloud of gas and dust and holds about 1,000 young stars. Their light illuminates the cloud and creates the glowing, swirling clouds seen here. Red and orange mainly show dust warmed by starlight, green shows hot gas and dust, and blue is mostly starlight.',
      'Higher in the frame, massive stars haven’t yet cleared away the dark dust. Infrared light passes straight through it, revealing bright, swirling clouds and many developing stars that have shot out jets of gas, shown in green.'
    ],
    scale=scale(48, 84, 1450),
    understand={'summary': "Spitzer's Infrared Array Camera (IRAC): 3.6 microns in blue, 4.5 microns in green, 5.8 microns in orange and 8 microns in red.",
                'filters': [f('3.6', 'IRAC', 'blue'), f('4.5', 'IRAC', 'green'), f('5.8', 'IRAC', 'orange'), f('8.0', 'IRAC', 'red')], 'eye': IR_EYE},
    explore=['In visible light, Hubble and ground telescopes show the Orion Nebula as a glowing cave of gas. In infrared, the dust that walls it in becomes bright instead of dark, and the stars still forming inside it come into view.'],
    alt='A tall view of a glowing nebula ringed by red and orange dust at the bottom, with swirling clouds and green jets above.',
    sky={'con': 'Ori', 'ra': 83.818, 'dec': -6.014}),

  spitzer('ssc2011-03a2', 'https://www.spitzer.caltech.edu/image/ssc2011-03a2-the-case-of-the-disappearing-continent', cat='nebula',
    title='The North America Nebula in infrared',
    caption='The North America Nebula, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='10 February 2011', credit='NASA/JPL-Caltech/L. Rebull (SSC/Caltech)',
    celestial='North America Nebula, NGC 7000; Pelican Nebula · constellation Cygnus · about 2,000 light-years away (source figure)',
    sizes=[('320', 320, 320), ('500', 500, 500), ('1024', 1023, 1024), ('1280', 1280, 1280), ('1600', 1600, 1600), ('3000', 3000, 3000), ('6000', 6000, 6000)],
    recognition=SP_REC('February 2011'),
    story=[
      'A swirling field of stars and glowing dust fills this infrared view of the North America Nebula. In visible light the region is shaped like the continent, but here that outline vanishes. Infrared light passes through the dust that blocks visible light, so clouds that look dark and solid in optical photos turn see-through.',
      'Spitzer also picks up the heat of the dusty cocoons around newborn stars. Groups of young stars about a million years old are found throughout the frame. Slightly older ones, three to five million years old, are spread across the complex, especially near the “head” of the Pelican Nebula at the upper right.',
      'Some patches are so thick with dust that they stay dark even to Spitzer. A dark lane at lower left of center, the “Gulf of Mexico,” likely holds the youngest stars of all, less than a million years old.'
    ],
    scale=scale(138, 138, 2000),
    understand={'summary': "Spitzer's Infrared Array Camera (IRAC): 3.6 microns in blue, 4.5 microns in green, and 5.8 and 8.0 microns in red, as the release describes.",
                'filters': [f('3.6', 'IRAC', 'blue'), f('4.5', 'IRAC', 'green'), f('5.8', 'IRAC', 'red'), f('8.0', 'IRAC', 'red')], 'eye': IR_EYE},
    explore=['The North America and Pelican Nebulae are two parts of one big cloud, about 2,000 light-years away in Cygnus, the Swan.'],
    alt='A dense field of stars over swirls of red and orange glowing dust, with a darker lane at lower left.',
    sky={'con': 'Cyg', 'ra': 313.891, 'dec': 44.131}),

  spitzer('ssc2005-11a3', 'https://www.spitzer.caltech.edu/image/ssc2005-11a-spitzer-spies-spectacular-sombrero', cat='galaxy',
    title='The Sombrero Galaxy in infrared',
    caption='The Sombrero Galaxy, Messier 104, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='4 May 2005', credit='NASA/JPL-Caltech/R. Kennicutt (University of Arizona) and the SINGS Team',
    celestial='Sombrero Galaxy, Messier 104 · constellation Virgo · about 28 million light-years away (source figure)',
    sizes=[('320', 320, 179), ('500', 500, 280), ('1024', 1024, 573), ('1280', 1280, 717), ('1600', 1600, 896), ('original', 3000, 1681)],
    recognition=SWEET16,
    story=[
      'In infrared light the Sombrero Galaxy looks less like a hat and more like a bullseye. A smooth, glowing ring of dust, shown in red, circles a central bulge of stars in this Spitzer view of Messier 104, about 28 million light-years away.',
      'Visible-light pictures show only the near edge of that dust as a dark silhouette. Spitzer sees the dust glowing all the way around, along with starlight shining through it and a disc of stars otherwise hidden inside the ring. The disc is warped, often a sign of a close encounter with another galaxy.',
      'Clumps along the far edges of the ring suggest young star-forming regions. Spitzer also detected infrared light from the core, where a black hole thought to weigh about a billion Suns sits. We see the galaxy from about six degrees south of its equatorial plane.'
    ],
    scale=scale(9.6, 5.4, 28_000_000),
    understand={'summary': "Spitzer's Infrared Array Camera (IRAC): 3.6 microns in blue, 4.5 microns in green, 5.8 microns in orange and 8.0 microns in red. Starlight was subtracted from the 5.8- and 8-micron images to bring out the dust.",
                'filters': [f('3.6', 'IRAC', 'blue'), f('4.5', 'IRAC', 'green'), f('5.8', 'IRAC', 'orange'), f('8.0', 'IRAC', 'red')],
                'eye': 'All of this is infrared light, invisible to the eye. The dust that looks dark in visible-light photos glows here.'},
    explore=['The Sombrero is one of the most famous galaxies in the sky. Its nickname comes from its look in visible light: a bright bulge with a dark dust lane, like a broad-brimmed hat.'],
    alt='A tilted galaxy with a bright bluish core inside a smooth red ring of dust, against a dark background.',
    sky={'con': 'Vir', 'ra': 189.941, 'dec': -11.587}),

  spitzer('ssc2019-15a', 'https://www.spitzer.caltech.edu/image/ssc2019-15a-galaxy-m81-in-infrared-revisited', cat='galaxy',
    title='Galaxy M81 in infrared, revisited',
    caption='The spiral galaxy Messier 81, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='27 August 2019', credit='NASA/JPL-Caltech',
    celestial='Messier 81 · constellation Ursa Major · about 12 million light-years away (source figure)',
    sizes=[('320', 320, 320), ('500', 500, 500), ('1024', 1024, 1024), ('1280', 1280, 1280), ('1600', 1600, 1600), ('3000', 3000, 3000)],
    recognition=SP_REC('August 2019'),
    story=[
      'Dusty spiral arms glow in infrared around the bluish-white center of Messier 81 in this Spitzer view. M81 lies about 12 million light-years away in Ursa Major, home of the Big Dipper, and can be seen with binoculars or a small telescope.',
      'It was among the first sets of data Spitzer released after its launch in August 2003. For the telescope’s 16th anniversary, this image revisited it with longer observations and better processing. Near the core, older stars dominate and there is little dust. Farther out, the arms shine mostly with infrared light from dust warmed by nearby stars.',
      'Clumpy, bright knots along the arms are giant clouds of ionized hydrogen where massive stars are being born. Comparing where they sit with the galaxy’s mass and gas should help show what sets star formation off.'
    ],
    scale=scale(24, 24, 12_000_000, 'the release’s'),
    understand={'summary': "Spitzer's Infrared Array Camera (IRAC): 3.6 microns in blue, 4.5 microns in green and 8.0 microns in red. The 8-micron light traces areas of active star formation.",
                'filters': [f('3.6', 'IRAC', 'blue'), f('4.5', 'IRAC', 'green'), f('8.0', 'IRAC', 'red')],
                'eye': 'All of this is infrared light, invisible to the eye. Cold dust doesn’t block it the way it blocks visible light, which makes the galaxy’s structure easier to read.'},
    explore=['The dust grains are made of silicates, chemically similar to beach sand, and carbon-rich molecules. Mixed with gas, they are the raw material for future stars.'],
    alt='A spiral galaxy with a bluish-white core and red, clumpy spiral arms of glowing dust.',
    sky={'con': 'UMa', 'ra': 148.888, 'dec': 69.065}),

  spitzer('ssc2007-07a1', 'https://www.spitzer.caltech.edu/image/ssc2007-07a1-the-seven-sisters-pleiades-pose-for-spitzer-and-for-you', cat='star', instruments='IRAC and MIPS',
    title='The Pleiades in infrared',
    caption='The Pleiades star cluster, imaged in infrared by NASA’s Spitzer Space Telescope',
    releaseDate='12 April 2007', credit='NASA/JPL-Caltech/J. Stauffer (SSC-Caltech)',
    celestial='Pleiades, the Seven Sisters, Messier 45 · constellation Taurus · more than 400 light-years away (source figure)',
    sizes=[('320', 320, 320), ('500', 500, 500), ('1024', 1024, 1024), ('1280', 1280, 1280), ('1600', 1600, 1600)],
    recognition=SWEET16,
    story=[
      'The Seven Sisters seem to float on a soft bed of feathers in this infrared view of the Pleiades star cluster. A web of dust filaments drifts around the stars, yellow and red where the cloud is densest and green in its thinner outer parts. The cluster lies more than 400 light-years away in Taurus.',
      'In the 1800s the poet Alfred Lord Tennyson compared the stars to fireflies tangled in a silver braid, and this view shows that braid. The dust belongs to a cloud the cluster happens to be passing through. Atlas sits at the bottom, and six of the sisters line the top.',
      'The Pleiades formed about 100 million years ago, when dinosaurs still roamed Earth, so they are far younger than our 5-billion-year-old Sun. Besides the bright stars, thousands of fainter members live here, many like the Sun.'
    ],
    scale=scale(58.1, 58.1, 430, 'AstroPix’s'),
    understand={'summary': "Spitzer's Infrared Array Camera at 4.5 microns in blue and 8.0 microns in green, with its Multiband Imaging Photometer at 24 microns in red.",
                'filters': [f('4.5', 'IRAC', 'blue'), f('8.0', 'IRAC', 'green'), f('24', 'MIPS', 'red')], 'eye': IR_EYE},
    explore=['The brightest stars are named for the mythical parents Atlas and Pleione and their seven daughters: Alcyone, Electra, Maia, Merope, Taygeta, Celaeno and Asterope. Some scientists think our Sun formed in a crowded region like this before moving to its quieter home.'],
    alt='Bright stars scattered across a soft, feathery web of green, yellow and red dust.',
    sky={'con': 'Tau', 'ra': 56.738, 'dec': 24.171}),
]

if __name__ == '__main__':
    base.RECORDS = EUCLID + CHANDRA + SPITZER
    base.main()
