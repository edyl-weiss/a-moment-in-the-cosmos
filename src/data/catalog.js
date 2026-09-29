/* ------------------------------------------------------------------
   A Moment in the Cosmos: curated, validated image catalog
   Every record below was checked on 29 September 2026 against the
   source's own image page:
     • asset dimensions measured by loading the actual JPEG (pubW/pubH)
     • credit line copied verbatim from the source page
     • licence: CC BY 4.0 (ESA/Hubble, ESA/Webb and ESO usage terms)
   The catalog is APPEND-ONLY: the daily schedule is derived from the
   order lists in SCHEDULE, so editing past entries would rewrite history.
------------------------------------------------------------------- */
export const HUB = 'https://cdn.esahubble.org/archives/images/';
export const WEBB = 'https://cdn.esawebb.org/archives/images/';
export const ESO = 'https://cdn.eso.org/images/';

export const RIGHTS = {
  hubble: { label: 'CC BY 4.0, ESA/Hubble usage terms', url: 'https://esahubble.org/copyright/' },
  webb:   { label: 'CC BY 4.0, ESA/Webb usage terms',   url: 'https://esawebb.org/copyright/' },
  eso:    { label: 'CC BY 4.0, ESO usage terms',        url: 'https://www.eso.org/public/outreach/copyright/' },
  noirlab: { label: 'CC BY 4.0, NOIRLab usage terms',   url: 'https://noirlab.edu/public/copyright/' }
};

function assets(base, id, opts = {}) {
  const pubPath = opts.noPub ? 'large/' : 'publicationjpg/';
  return {
    pub: base + pubPath + id + '.jpg',
    screen: base + 'screen/' + id + '.jpg',
    thumb: base + 'thumb300y/' + id + '.jpg',
    large: opts.noLarge ? null : base + 'large/' + id + '.jpg'
  };
}

export const CATALOG = [
/* ============================== NEBULA ============================== */
{
  id: 'weic2216b', cat: 'nebula', org: 'webb',
  title: 'The Pillars of Creation',
  caption: 'The Pillars of Creation in the Eagle Nebula (M16), imaged by the James Webb Space Telescope',
  captureDate: null,
  releaseDate: '19 October 2022',
  celestial: 'Eagle Nebula (Messier 16), constellation Serpens Cauda · about 6,500 light-years away',
  img: { ...assets(WEBB, 'weic2216b'), pubW: 2309, pubH: 4000, origW: 8423, origH: 14589, largeMB: 30.3 },
  credit: 'NASA, ESA, CSA, STScI; J. DePasquale, A. Koekemoer, A. Pagan (STScI).',
  source: 'https://esawebb.org/images/weic2216b/',
  recognition: { kind: 'editorial', text: 'Official ESA/Webb release image (weic2216). No published audience rating.' },
  story: [
    'Three towering columns rise from the lower left, their edges glowing in rust and gold against a field crowded with stars. Look at the pillars’ tips and edges: small crimson points, some with eight-pointed diffraction spikes, are protostars: young stars that have only recently begun to break free of their dusty cocoons.',
    'Wavy, lava-like lines along the pillar edges trace material ejected by stars still forming. When those jets strike the surrounding gas they can raise bow shocks, like the wake of a boat. ESA/Webb estimates these stars are only a few hundred thousand years old, and they will keep forming for millions of years.',
    'Hubble photographed this corner of the Eagle Nebula in 1995 and again in 2014. Webb’s near-infrared view lets astronomers count the young stars and measure the gas and dust more precisely, sharpening models of how stars emerge from clouds like these.'
  ],
  scale: 'The whole frame spans roughly 8 × 14 light-years. That comes from ESA/Webb’s listed field of view (4.21 × 7.30 arcminutes) at a distance of 6,500 light-years, so it carries that distance estimate’s uncertainty.',
  understand: {
    summary: 'Near-infrared light from Webb’s NIRCam, recorded through six filters and assigned visible colours, with shorter wavelengths bluer, longer wavelengths redder. None of these wavelengths is visible to the human eye.',
    filters: [['900 nm (z)', 'purple'], ['1.87 µm (Paschen-alpha)', 'blue'], ['2.0 µm', 'cyan'], ['3.35 µm (PAH)', 'yellow'], ['4.44 µm', 'orange'], ['4.7 µm (molecular hydrogen)', 'red']],
    eye: 'Infrared passes through more of the dust than visible light, so many more stars appear. Even so, the translucent gas acts like a drawn curtain: no distant background galaxies are visible in this view.'
  },
  labels: [],
  behind: {
    observatory: 'James Webb Space Telescope (NASA/ESA/CSA)',
    instrument: 'NIRCam (Near-Infrared Camera)',
    people: 'Image processing credited to J. DePasquale, A. Koekemoer and A. Pagan (STScI)',
    exposure: 'Not published on the source page.',
    technique: 'Multi-filter composite of six NIRCam filters. This is the full-view version; ESA/Webb also released a tighter crop (weic2216a) and an annotated version (weic2216c).',
    processing: 'Colours assigned by filter, as listed above.'
  },
  explore: [
    'Although near-infrared light seems to “pierce” the region, the interstellar medium still blocks the deeper universe. Dust lit by the crowd of young stars glows like a lit room’s reflection on a window, hiding what lies beyond.',
    'The Pillars are only a small part of the much larger Eagle Nebula. Comparing Webb’s view with Hubble’s 1995 and 2014 images shows how different wavelengths reveal different layers of the same structure.'
  ],
  sources: [
    ['ESA/Webb image page (weic2216b)', 'https://esawebb.org/images/weic2216b/'],
    ['ESA/Webb release weic2216', 'https://esawebb.org/news/weic2216/'],
    ['Annotated version (weic2216c)', 'https://esawebb.org/images/weic2216c/']
  ]
},
{
  id: 'heic0515a', cat: 'nebula', org: 'hubble',
  title: 'The Crab Nebula',
  caption: 'The Crab Nebula (Messier 1), imaged by the Hubble Space Telescope',
  captureShort: 'October 1999 – December 2000',
  captureDate: 'Hubble exposures from October 1999, January 2000 and December 2000',
  releaseDate: '1 December 2005',
  celestial: 'Crab Nebula (Messier 1), constellation Taurus · about 6,500 light-years away',
  img: { ...assets(HUB, 'heic0515a', { noPub: true, noLarge: true }), pubW: 3864, pubH: 3864, origW: 3864, origH: 3864 },
  credit: 'NASA, ESA and Allison Loll/Jeff Hester (Arizona State University). Acknowledgement: Davide De Martin (ESA/Hubble)',
  source: 'https://esahubble.org/images/heic0515a/',
  recognition: { kind: 'editorial', text: 'Ranked #17 on ESA/Hubble’s published “Top 100 Images” list (an institutional selection, not an audience score).' },
  story: [
    'A tangled cage of orange and red filaments surrounds a softer, bluish interior. This is the Crab Nebula: the expanding debris of a star whose explosion Chinese and Japanese astronomers recorded in 1054.',
    'The filaments are the tattered remains of the star, made mostly of hydrogen. Near the centre, barely visible here, spins a neutron star, the crushed, ultra-dense core of the original star. Like a lighthouse it sweeps twin beams of radiation past us, appearing to pulse 30 times a second, and it powers the nebula’s eerie inner glow: light from electrons whirling at nearly the speed of light around its magnetic field lines.',
    'The name comes from a drawing made by Lord Rosse in 1844. This mosaic of 24 exposures was, at its release, the largest image ever taken with Hubble’s WFPC2 camera and the most detailed view of the entire nebula.'
  ],
  scale: 'The nebula is about six light-years wide. At roughly 6,500 light-years away, the explosion seen from Earth in 1054 had really happened thousands of years earlier; its light was still in transit.',
  understand: {
    summary: 'A visible-light mosaic from Hubble’s WFPC2 camera, taken through narrow filters that isolate light from specific elements expelled in the explosion.',
    filters: [['502 nm (doubly ionised oxygen, [O III])', 'red'], ['631 nm (neutral oxygen, [O I])', 'blue'], ['673 nm (singly ionised sulphur, [S II])', 'green']],
    eye: 'Colour mapping per the ESA/Hubble release: blue = neutral oxygen, green = singly ionised sulphur, red = doubly ionised oxygen. These are chemical “tracers”, not the colours your eye would see through a telescope.'
  },
  labels: [],
  behind: {
    observatory: 'Hubble Space Telescope (NASA/ESA)',
    instrument: 'WFPC2 (Wide Field and Planetary Camera 2)',
    people: 'Allison Loll and Jeff Hester (Arizona State University); acknowledgement Davide De Martin (ESA/Hubble)',
    exposure: 'Assembled from 24 individual exposures; exposure lengths not published on the source page.',
    technique: 'Mosaic/composite. The Hubble data were superimposed onto images taken with ESO’s Very Large Telescope.',
    processing: 'Narrow-band colour composite (see mapping).'
  },
  explore: [
    'The pulsar at the heart of the Crab is one of the most studied objects in astronomy; its steady energy output keeps the surrounding cloud glowing long after the explosion.',
    'Because this image combines exposures from 1999–2000, it is a snapshot of an expanding structure: later images of the Crab show the filaments have moved outward.'
  ],
  sources: [
    ['ESA/Hubble image page (heic0515a)', 'https://esahubble.org/images/heic0515a/'],
    ['ESA/Hubble release heic0515', 'https://esahubble.org/news/heic0515/'],
    ['ESA/Hubble Top 100 Images', 'https://esahubble.org/images/archive/top100/']
  ]
},
{
  id: 'weic2205a', cat: 'nebula', org: 'webb',
  title: 'The “Cosmic Cliffs” of Carina',
  caption: 'The Cosmic Cliffs at the edge of NGC 3324 in the Carina Nebula, imaged by the James Webb Space Telescope',
  captureDate: null,
  releaseDate: '12 July 2022',
  celestial: 'NGC 3324, northwest corner of the Carina Nebula (NGC 3372), constellation Carina · about 7,600 light-years away',
  img: { ...assets(WEBB, 'weic2205a'), pubW: 4000, pubH: 2317, origW: 14575, origH: 8441, largeMB: 17.0 },
  credit: 'NASA, ESA, CSA, and STScI',
  source: 'https://esawebb.org/images/weic2205a/',
  recognition: { kind: 'editorial', text: 'One of Webb’s first full-colour images, released 12 July 2022. No published audience rating.' },
  story: [
    'A rugged, golden-brown ridge fills the lower part of the frame beneath a glowing expanse speckled with stars. It looks like a mountain range on a moonlit evening, but it is the edge of a gigantic, gas-filled cavity in NGC 3324, a young star-forming region in the Carina Nebula.',
    'The sculptors are out of frame: extremely massive, hot young stars at the centre of the bubble, above this view. Their ultraviolet radiation and stellar winds are slowly eroding the cavity’s wall.',
    'Webb’s Near-Infrared Camera unveiled hundreds of previously hidden stars here, and even numerous background galaxies. It also caught signs of very early star formation, a phase that, for an individual star, lasts only about 50,000 to 100,000 years, which makes it hard to catch in the act.'
  ],
  scale: 'The frame spans roughly 16 × 9 light-years, calculated from ESA/Webb’s listed field of view (7.29 × 4.22 arcminutes) at about 7,600 light-years.',
  understand: {
    summary: 'Near-infrared light from NIRCam through six filters, assigned visible colours for display.',
    filters: [['900 nm', 'blue'], ['1.87 µm (Paschen-alpha)', 'cyan'], ['2.0 µm', 'green'], ['3.35 µm (PAH)', 'orange'], ['4.44 µm', 'red'], ['4.7 µm (molecular hydrogen)', 'yellow']],
    eye: 'Your eyes cannot see any of these wavelengths. Infrared lets Webb see through dust that hides young stars in visible-light images.'
  },
  labels: [],
  behind: {
    observatory: 'James Webb Space Telescope (NASA/ESA/CSA)',
    instrument: 'NIRCam (Near-Infrared Camera)',
    people: 'Credited to NASA, ESA, CSA and STScI',
    exposure: 'Not published on the source page.',
    technique: 'Multi-filter composite.',
    processing: 'Colours assigned by filter, as listed.'
  },
  explore: [
    'NGC 3324 was first catalogued by James Dunlop in 1826. The wider Carina Nebula also hosts the Keyhole Nebula and the unstable supergiant star Eta Carinae.',
    'This image was part of the set that introduced Webb’s science capabilities to the public in July 2022.'
  ],
  sources: [
    ['ESA/Webb image page (weic2205a)', 'https://esawebb.org/images/weic2205a/'],
    ['ESA/Webb release weic2205', 'https://esawebb.org/news/weic2205/']
  ]
},
{
  id: 'heic1307a', cat: 'nebula', org: 'hubble',
  title: 'The Horsehead Nebula in Infrared',
  caption: 'The Horsehead Nebula (Barnard 33), imaged in infrared by the Hubble Space Telescope',
  captureDate: null,
  releaseDate: '19 April 2013',
  celestial: 'Horsehead Nebula (Barnard 33), constellation Orion · about 1,300 light-years away',
  img: { ...assets(HUB, 'heic1307a', { noPub: true, noLarge: true }), pubW: 2704, pubH: 2826, origW: 2704, origH: 2826 },
  credit: 'NASA, ESA, and the Hubble Heritage Team (AURA/STScI)',
  source: 'https://esahubble.org/images/heic1307a/',
  recognition: { kind: 'editorial', text: 'Hubble 23rd-anniversary image; ranked #10 on ESA/Hubble’s published “Top 100 Images” list (an institutional selection, not an audience score).' },
  story: [
    'A pale, translucent column rises like a seahorse from rolling waves of gas and dust. This is the Horsehead Nebula, also catalogued as Barnard 33, in Orion.',
    'Most pictures show the Horsehead as a dark silhouette against glowing gas. This view uses infrared light, whose longer wavelengths pass through much of the obscuring dust and reveal the nebula’s delicate inner folds. It formed from a collapsing interstellar cloud and glows because a nearby hot star illuminates it.',
    'The clouds around it have already dissipated, but the pillar is made of thicker clumps that resist erosion. Astronomers estimate it has about five million years left before it, too, disintegrates. Hubble released this view to mark its 23rd year in orbit, using Wide Field Camera 3, fitted in 2009.'
  ],
  scale: 'The frame covers a patch about 2.2 light-years across (roughly 140,000 times the Earth–Sun distance), based on ESA/Hubble’s field of view (5.78 × 6.04 arcminutes) and its 1,300-light-year distance figure.',
  understand: {
    summary: 'Near-infrared light from Hubble’s Wide Field Camera 3 (installed in 2009), through two filters.',
    filters: [['1.1 µm (J band)', 'not specified by source'], ['1.6 µm (H band)', 'not specified by source']],
    eye: 'ESA/Hubble does not publish which display colour each filter received, so no mapping is shown here. In visible light the Horsehead looks like a dark, opaque cloud; this infrared view is very different from what your eye would see.'
  },
  labels: [],
  behind: {
    observatory: 'Hubble Space Telescope (NASA/ESA)',
    instrument: 'WFC3 (Wide Field Camera 3), infrared channel',
    people: 'Hubble Heritage Team (AURA/STScI)',
    exposure: 'Not published on the source page.',
    technique: 'Two-filter infrared composite.',
    processing: 'Filter-to-colour assignment not published.'
  },
  explore: [
    'Hubble also imaged the Horsehead for its 11th anniversary in 2001 (heic0105), in visible light, a useful comparison for seeing what infrared reveals.',
    'Pillars like this survive because dense clumps shield the material behind them from erosion, the same process at work in the Pillars of Creation.'
  ],
  sources: [
    ['ESA/Hubble image page (heic1307a)', 'https://esahubble.org/images/heic1307a/'],
    ['ESA/Hubble release heic1307', 'https://esahubble.org/news/heic1307/'],
    ['ESA/Hubble Top 100 Images', 'https://esahubble.org/images/archive/top100/']
  ]
},

/* ============================== GALAXY ============================== */
{
  id: 'weic2208a', cat: 'galaxy', org: 'webb',
  title: 'Stephan’s Quintet',
  caption: 'Stephan’s Quintet (Hickson Compact Group 92), imaged by the James Webb Space Telescope',
  captureDate: null,
  releaseDate: '12 July 2022',
  celestial: 'Stephan’s Quintet (HCG 92), constellation Pegasus · NGC 7320 about 40 million light-years away; the other four about 290 million',
  img: { ...assets(WEBB, 'weic2208a'), pubW: 4000, pubH: 3835, origW: 12654, origH: 12132, largeMB: 23.0 },
  credit: 'NASA, ESA, CSA, and STScI',
  source: 'https://esawebb.org/images/weic2208a/',
  recognition: { kind: 'editorial', text: 'One of Webb’s first full-colour images, released 12 July 2022. No published audience rating.' },
  story: [
    'Five galaxies crowd the frame: sweeping tails of gas and stars, sparkling clusters of young stars, and a glowing band of red and gold near the central pair. This is Stephan’s Quintet, also known as Hickson Compact Group 92.',
    'Only four of the five are truly neighbours. The leftmost galaxy, NGC 7320, sits well in the foreground, about 40 million light-years away, while NGC 7317, NGC 7318A, NGC 7318B and NGC 7319 lie roughly 290 million light-years away, caught up in a gravitational dance. Webb’s mid-infrared instrument captures huge shock waves as NGC 7318B smashes through the group.',
    'At release this was Webb’s largest image: a mosaic of over 150 million pixels built from almost 1,000 image files, covering about one-fifth of the Moon’s diameter. Tight groups like this may have been more common in the early Universe, so a nearby example helps astronomers read distant ones.'
  ],
  scale: 'Light from NGC 7320 has travelled about 40 million years to reach us; light from its four apparent companions has travelled about 290 million years, roughly seven times longer, though they share the same patch of sky.',
  understand: {
    summary: 'A composite of near-infrared (NIRCam) and mid-infrared (MIRI) light. MIRI data were given yellow and orange to highlight hot dust and shocked gas; stars at NIRCam wavelengths appear blue and white.',
    filters: [['900 nm (NIRCam)', 'blue'], ['1.5 µm (NIRCam)', 'blue'], ['2.0 µm (NIRCam)', 'green'], ['2.77 µm (NIRCam)', 'yellow'], ['3.56 µm (NIRCam)', 'red'], ['4.44 µm (NIRCam)', 'red'], ['7.7 µm (MIRI)', 'yellow'], ['10 µm (MIRI)', 'orange']],
    eye: 'Every wavelength here is invisible to the eye. The red-and-gold regions around the central pair mark shock waves, per ESA/Webb.'
  },
  labels: [
    { x: 30, y: 41, text: 'NGC 7320 · foreground (~40 million ly)' },
    { x: 63, y: 43, text: 'Shock region around the central pair' }
  ],
  behind: {
    observatory: 'James Webb Space Telescope (NASA/ESA/CSA)',
    instrument: 'NIRCam and MIRI',
    people: 'Image processing by specialists at the Space Telescope Science Institute (per ESA/Webb)',
    exposure: 'Not published on the source page.',
    technique: 'Mosaic built from almost 1,000 separate image files; over 150 million pixels.',
    processing: 'Two of MIRI’s filters used to differentiate hot dust and shocks from starlight.'
  },
  explore: [
    'Webb data also trace an outflow driven by a black hole in the group, showing how interacting galaxies disturb each other’s gas.',
    'Studying a relatively nearby group lets astronomers see mergers and interactions in detail that would be impossible for galaxies billions of light-years away.'
  ],
  sources: [
    ['ESA/Webb image page (weic2208a)', 'https://esawebb.org/images/weic2208a/'],
    ['ESA/Webb release weic2208', 'https://esawebb.org/news/weic2208/']
  ]
},
{
  id: 'heic0506a', cat: 'galaxy', org: 'hubble',
  title: 'The Whirlpool Galaxy',
  caption: 'The Whirlpool Galaxy (M51) and companion NGC 5195, imaged by the Hubble Space Telescope',
  captureShort: 'January 2005',
  captureDate: 'January 2005',
  releaseDate: '25 April 2005',
  celestial: 'Messier 51 (NGC 5194) and NGC 5195, constellation Canes Venatici · about 25 million light-years away',
  img: { ...assets(HUB, 'heic0506a'), pubW: 4000, pubH: 2776, origW: 11477, origH: 7965, largeMB: 37.8 },
  credit: 'NASA, ESA, S. Beckwith (STScI), and The Hubble Heritage Team (STScI/AURA)',
  source: 'https://esahubble.org/images/heic0506a/',
  recognition: { kind: 'editorial', text: 'Ranked #23 on ESA/Hubble’s published “Top 100 Images” list (an institutional selection, not an audience score).' },
  story: [
    'Two sweeping arms curl out from a yellowish core, laced with dark dust and studded with pink and blue knots. At the tip of one arm glows a smaller, yellowish galaxy. This is the Whirlpool Galaxy, M51, a classic “grand-design” spiral, with its companion NGC 5195.',
    'The arms are star-formation factories. The assembly line runs from dark clouds of gas on the arms’ inner edges, to pink star-forming regions, to brilliant blue clusters of young stars along the outer edges.',
    'NGC 5195 looks as if it is tugging on the arm, but Hubble’s view shows it passing behind the Whirlpool, as it has for hundreds of millions of years. Some astronomers think its gravity raises waves in the larger galaxy’s disc that squeeze gas and trigger that star birth. That is an interpretation, not a settled fact.'
  ],
  scale: 'The light in this image left the Whirlpool about 25 million years ago. The frame’s long side spans roughly 70,000 light-years, calculated from the 9.56-arcminute field of view at that distance.',
  understand: {
    summary: 'Visible and near-infrared light from Hubble’s Advanced Camera for Surveys, including a filter that isolates the red glow of hydrogen (with nitrogen).',
    filters: [['435 nm (B)', 'source lists band only'], ['555 nm (V)', 'source lists band only'], ['658 nm (H-alpha + [N II])', 'source lists band only'], ['814 nm (I, near-infrared)', 'source lists band only']],
    eye: 'Broad filters approximate natural colour; the hydrogen-alpha filter emphasises the pink star-forming regions far more than the eye would see.'
  },
  labels: [
    { x: 37, y: 47, text: 'M51 (NGC 5194)' },
    { x: 82, y: 32, text: 'NGC 5195 · companion' }
  ],
  behind: {
    observatory: 'Hubble Space Telescope (NASA/ESA)',
    instrument: 'ACS (Advanced Camera for Surveys)',
    people: 'S. Beckwith (STScI) and the Hubble Heritage Team (STScI/AURA)',
    exposure: 'Not published on the source page.',
    technique: 'Multi-filter composite.',
    processing: 'Four-filter colour composite.'
  },
  explore: [
    'Grand-design spirals have two prominent, well-defined arms; many spirals have looser, patchier arms instead. The Whirlpool’s nearby, face-on view makes it a favourite for studying how spiral structure and star formation connect.',
    'The largest stars eventually clear away their dusty cocoons with radiation, stellar winds and supernova shock waves, leaving bright blue clusters strung along the arms.'
  ],
  sources: [
    ['ESA/Hubble image page (heic0506a)', 'https://esahubble.org/images/heic0506a/'],
    ['ESA/Hubble release heic0506', 'https://esahubble.org/news/heic0506/'],
    ['ESA/Hubble Top 100 Images', 'https://esahubble.org/images/archive/top100/']
  ]
},
{
  id: 'weic2426a', cat: 'galaxy', org: 'webb',
  title: 'IC 2163 and NGC 2207',
  caption: 'Interacting galaxies IC 2163 and NGC 2207, imaged by the James Webb and Hubble space telescopes',
  captureDate: null,
  releaseDate: '31 October 2024',
  celestial: 'IC 2163 and NGC 2207, constellation Canis Major · about 120 million light-years away',
  img: { ...assets(WEBB, 'weic2426a'), pubW: 4000, pubH: 1878, origW: 6353, origH: 2983, largeMB: 6.5 },
  credit: 'NASA, ESA, CSA, STScI',
  source: 'https://esawebb.org/images/weic2426a/',
  recognition: { kind: 'editorial', text: 'Official ESA/Webb release image (weic2426). No published audience rating.' },
  story: [
    'Two spiral galaxies overlap, their arms glowing in deep reds and pinks with bright blue knots. The smaller, more compact spiral on the left is IC 2163; the larger one on the right is NGC 2207. The pair grazed each other millions of years ago, with IC 2163 passing behind its neighbour.',
    'Look for brighter red lines, including the “eyelids” around IC 2163: these may be shock fronts where material from the two galaxies slammed together. The encounter may also have pulled out tidal extensions, and tendrils seem to hang between the two cores.',
    'Both galaxies are forming stars briskly: together, the equivalent of about two dozen Sun-sized stars each year, and they have hosted seven known supernovae in recent decades. The bluest regions, seen by Hubble, and the pink and white areas mapped by Webb mark where new stars are forming.'
  ],
  scale: 'Together these galaxies form the equivalent of about 24 Sun-sized stars a year; our Milky Way manages roughly two or three. Their light has travelled about 120 million years to reach us.',
  understand: {
    summary: 'A combination of Webb mid-infrared light (MIRI) and Hubble visible light (WFPC2). The ESA/Webb release describes the Hubble contribution as visible and ultraviolet light.',
    filters: [['439 nm (Hubble, B)', 'blue'], ['555 nm (Hubble, V)', 'green'], ['814 nm (Hubble, I)', 'red'], ['7.7 µm (Webb MIRI, PAH)', 'red'], ['11 µm (Webb MIRI, PAH)', 'red'], ['15 µm (Webb MIRI)', 'red']],
    eye: 'The red tones come mainly from Webb’s mid-infrared data, which traces warm dust and complex carbon molecules, invisible to the eye.'
  },
  labels: [
    { x: 37, y: 47, text: 'IC 2163' },
    { x: 65, y: 48, text: 'NGC 2207' }
  ],
  behind: {
    observatory: 'James Webb Space Telescope and Hubble Space Telescope',
    instrument: 'Webb MIRI; Hubble WFPC2',
    people: 'Credited to NASA, ESA, CSA and STScI',
    exposure: 'Not published on the source page.',
    technique: 'Multi-observatory composite (Webb + Hubble).',
    processing: 'Colours assigned by filter, as listed.'
  },
  explore: [
    'Supernovae may clear space in the galaxies’ arms, rearranging gas and dust that later cools and forms new stars. Larger bright areas are super star clusters; other bright spots are mini-starbursts where many stars form in quick succession.'
  ],
  sources: [
    ['ESA/Webb image page (weic2426a)', 'https://esawebb.org/images/weic2426a/'],
    ['ESA/Webb release weic2426', 'https://esawebb.org/news/weic2426/']
  ]
},
{
  id: 'heic0602a', cat: 'galaxy', org: 'hubble',
  title: 'The Pinwheel Galaxy',
  caption: 'The Pinwheel Galaxy (M101), imaged by the Hubble Space Telescope with ground-based data',
  captureShort: 'March 1994 – January 2003 (multiple dates)',
  captureDate: 'Hubble exposures from March 1994, September 1994, June 1999, November 2002 and January 2003',
  releaseDate: '28 February 2006',
  celestial: 'Messier 101, constellation Ursa Major · an estimated 23–25 million light-years away (ESA/Hubble figures)',
  img: { ...assets(HUB, 'heic0602a'), pubW: 4000, pubH: 3127, origW: 15852, origH: 12392, largeMB: 88.3 },
  credit: 'Image: European Space Agency & NASA. Acknowledgements: Project Investigators for the original Hubble data: K.D. Kuntz (GSFC), F. Bresolin (University of Hawaii), J. Trauger (JPL), J. Mould (NOAO), and Y.-H. Chu (University of Illinois, Urbana). Image processing: Davide De Martin (ESA/Hubble). CFHT image: Canada-France-Hawaii Telescope/J.-C. Cuillandre/Coelum. NOAO image: George Jacoby, Bruce Bohannan, Mark Hanna/NOAO/AURA/NSF',
  source: 'https://esahubble.org/images/heic0602a/',
  recognition: { kind: 'editorial', text: 'Ranked #47 on ESA/Hubble’s published “Top 100 Images” list (an institutional selection, not an audience score).' },
  story: [
    'A vast, nearly face-on spiral fills the frame, its lopsided arms sprinkled with pink nebulae and bright blue clusters of newborn stars. This is the Pinwheel Galaxy, M101, one of the best-known “grand-design” spirals.',
    'When it was released in 2006, this was the largest and most detailed Hubble image of a spiral galaxy beyond the Milky Way ever made public: about 16,000 × 12,000 pixels, assembled from 51 Hubble exposures plus ground-based photographs. Hubble’s resolution picks out millions of individual stars, and the disc is thin enough that more distant galaxies show through it.',
    'A team led by K.D. Kuntz catalogued nearly 3,000 previously undetected star clusters in this image. The galaxy is estimated to hold at least a trillion stars.'
  ],
  scale: 'ESA/Hubble describes the disc as about 170,000 light-years across, nearly twice the diameter of our Milky Way. Both galaxies’ sizes are estimates, and published values vary.',
  understand: {
    summary: 'Visible and near-infrared Hubble data superimposed on ground-based images. Per the release, exposures through a blue filter are shown blue, green filter green, and red filter red, so the colour is broadly natural.',
    filters: [['435 nm (B)', 'blue'], ['555 nm (V)', 'green'], ['814 nm (I, near-infrared)', 'red']],
    eye: 'The outer edges of the frame come from ground-based telescopes (CFHT and Kitt Peak’s 0.9-metre), where Hubble data did not reach.'
  },
  labels: [],
  behind: {
    observatory: 'Hubble Space Telescope, Canada-France-Hawaii Telescope, and the 0.9-metre telescope at Kitt Peak National Observatory',
    instrument: 'Hubble ACS and WFPC2; ground-based cameras',
    people: 'Processing by Davide De Martin (ESA/Hubble); see full credit',
    exposure: '51 individual Hubble exposures; exposure lengths not published on the source page.',
    technique: 'Mosaic and composite: archival Hubble data from several research programmes, superimposed onto ground-based images.',
    processing: 'Three-filter colour composite.'
  },
  explore: [
    'The Hubble data came from projects measuring the Universe’s expansion rate, studying star clusters in giant star-birth regions, finding sources of intense X-rays and discovering blue supergiant stars.',
    'ESA/Hubble notes that the galaxy covers an area of sky about one-fifth that of the full Moon.'
  ],
  sources: [
    ['ESA/Hubble image page (heic0602a)', 'https://esahubble.org/images/heic0602a/'],
    ['ESA/Hubble release heic0602', 'https://esahubble.org/news/heic0602/'],
    ['ESA/Hubble Top 100 Images', 'https://esahubble.org/images/archive/top100/']
  ]
},

/* =============================== STAR =============================== */
{
  id: 'heic1509a', cat: 'star', org: 'hubble',
  title: 'Westerlund 2',
  caption: 'Star cluster Westerlund 2 in the nursery Gum 29, imaged by the Hubble Space Telescope',
  captureDate: null,
  releaseDate: '23 April 2015',
  celestial: 'Westerlund 2 in Gum 29 (RCW 49), constellation Carina · about 20,000 light-years away',
  img: { ...assets(HUB, 'heic1509a'), pubW: 4000, pubH: 2997, origW: 8919, origH: 6683, largeMB: 17.8 },
  credit: 'NASA, ESA, the Hubble Heritage Team (STScI/AURA), A. Nota (ESA/STScI), and the Westerlund 2 Science Team',
  source: 'https://esahubble.org/images/heic1509a/',
  recognition: { kind: 'editorial', text: 'Hubble 25th-anniversary image; ranked #3 on ESA/Hubble’s published “Top 100 Images” list (an institutional selection, not an audience score).' },
  story: [
    'A dense knot of glittering stars bursts from the heart of the image, surrounded by billowing clouds and pillars that point back toward it, like a firework shell caught mid-explosion. This is Westerlund 2, a giant cluster of about 3,000 stars in the stellar nursery Gum 29.',
    'Only about two million years old, the cluster holds some of the brightest, hottest and most massive stars known. Their ultraviolet light and stellar winds carve cavities into the surrounding hydrogen cloud and sculpt the pillars: dense, few-light-year-tall columns that resist erosion.',
    'Where winds hit walls of gas, shocks can trigger a new generation of stars. The red dots scattered across the scene are stars still forming inside their cocoons; the brilliant blue stars are mostly in the foreground. Hubble released this view to celebrate 25 years in orbit.'
  ],
  scale: 'The central cluster, holding the concentration of about 3,000 stars, measures only about 10 light-years across, and it lies some 20,000 light-years from Earth.',
  understand: {
    summary: 'The central cluster blends visible light (ACS) with near-infrared light (WFC3); the surroundings use visible light only. Near-infrared let Hubble see through the dust around the cluster.',
    filters: [['555 nm (V, ACS)', 'source lists band only'], ['814 nm (I, ACS)', 'source lists band only'], ['1.25 µm (J, WFC3)', 'source lists band only']],
    eye: 'The source does not publish the colour assigned to each filter. The near-infrared data reveals stars the eye could not see through the dust.'
  },
  labels: [],
  behind: {
    observatory: 'Hubble Space Telescope (NASA/ESA)',
    instrument: 'ACS and WFC3',
    people: 'Westerlund 2 science team (led by Antonella Nota) and the Hubble Heritage Team (see source for full list)',
    exposure: 'Not published on the source page.',
    technique: 'Composite of visible and near-infrared observations.',
    processing: 'Filter-to-colour assignment not published.'
  },
  explore: [
    'Westerlund 2 is named after Swedish astronomer Bengt Westerlund, who discovered the grouping in the 1960s.',
    'Hubble releases a new anniversary image every year; Westerlund 2 marked 25 years since its launch on 24 April 1990.'
  ],
  sources: [
    ['ESA/Hubble image page (heic1509a)', 'https://esahubble.org/images/heic1509a/'],
    ['ESA/Hubble release heic1509', 'https://esahubble.org/news/heic1509/'],
    ['ESA/Hubble Top 100 Images', 'https://esahubble.org/images/archive/top100/']
  ]
},
{
  id: 'weic2316a', cat: 'star', org: 'webb',
  title: 'Rho Ophiuchi',
  caption: 'Star-forming region in the Rho Ophiuchi cloud complex, imaged by the James Webb Space Telescope',
  captureDate: null,
  releaseDate: '12 July 2023',
  celestial: 'Rho Ophiuchi cloud complex, constellation Ophiuchus · about 390 light-years away',
  img: { ...assets(WEBB, 'weic2316a'), pubW: 4000, pubH: 3746, origW: 12778, origH: 11968, largeMB: 15.8 },
  credit: 'NASA, ESA, CSA, STScI, K. Pontoppidan (STScI), A. Pagan (STScI)',
  source: 'https://esawebb.org/images/weic2316a/',
  recognition: { kind: 'editorial', text: 'Webb’s first-anniversary image, released 12 July 2023. No published audience rating.' },
  story: [
    'Red jets streak across the upper part of the frame and down its right side, while a glowing, pale-yellow cave of dust opens in the lower half around a single bright star. This is a small part of the Rho Ophiuchi cloud complex, the closest star-forming region to Earth.',
    'About 50 young stars live here, all similar in mass to the Sun or smaller. The darkest patches are the densest, where thick dust still cocoons forming protostars. The red bipolar jets, glowing molecular hydrogen, appear when a young star first bursts through its natal envelope and fires a pair of opposing jets into space.',
    'The bright star in the cave is S1, the only star here significantly more massive than the Sun; the lighter gas around it is rich in polycyclic aromatic hydrocarbons, carbon-based molecules common in space. Some stars cast shadows revealing protoplanetary discs, possible planetary systems in the making.'
  ],
  scale: 'At about 390 light-years, this is our nearest stellar nursery, close enough that there are no foreground stars between us and it. The light Webb recorded left these young stars roughly four centuries earlier.',
  understand: {
    summary: 'Near-infrared light from NIRCam through five filters.',
    filters: [['1.87 µm (Paschen-alpha)', 'blue'], ['2.0 µm', 'cyan'], ['3.35 µm (PAH)', 'cyan'], ['4.44 µm', 'yellow'], ['4.7 µm (molecular hydrogen)', 'red']],
    eye: 'The red jets are glowing molecular hydrogen at 4.7 µm, a wavelength your eye cannot see. Visible-light views of this region are dominated by dark dust.'
  },
  labels: [],
  behind: {
    observatory: 'James Webb Space Telescope (NASA/ESA/CSA)',
    instrument: 'NIRCam (Near-Infrared Camera)',
    people: 'K. Pontoppidan (STScI), A. Pagan (STScI)',
    exposure: 'Not published on the source page.',
    technique: 'Multi-filter composite.',
    processing: 'Colours assigned by filter, as listed.'
  },
  explore: [
    'Webb’s first year of science produced far more than pictures: its spectra confirmed distances to very distant galaxies and revealed the chemistry of stellar nurseries and protoplanetary discs, including water and carbon-containing molecules.'
  ],
  sources: [
    ['ESA/Webb image page (weic2316a)', 'https://esawebb.org/images/weic2316a/'],
    ['ESA/Webb release weic2316', 'https://esawebb.org/news/weic2316/']
  ]
},
{
  id: 'heic0715a', cat: 'star', org: 'hubble',
  title: 'NGC 3603',
  caption: 'The massive young star cluster in NGC 3603, imaged by the Hubble Space Telescope',
  captureDate: null,
  releaseDate: '2 October 2007',
  celestial: 'NGC 3603, in the Carina spiral arm of the Milky Way, constellation Carina · about 20,000 light-years away',
  img: { ...assets(HUB, 'heic0715a', { noPub: true, noLarge: true }), pubW: 3885, pubH: 3904, origW: 3885, origH: 3904 },
  credit: 'NASA, ESA and the Hubble Heritage (STScI/AURA)-ESA/Hubble Collaboration',
  source: 'https://esahubble.org/images/heic0715a/',
  recognition: { kind: 'editorial', text: 'Ranked #7 on ESA/Hubble’s published “Top 100 Images” list (an institutional selection, not an audience score).' },
  story: [
    'A compact cluster of hot blue stars sits beside a great hollow in glowing gas and dust. This is NGC 3603, a giant star-forming region hosting one of the most prominent massive young clusters in the Milky Way. John Herschel discovered it in 1834.',
    'The cluster formed in a rush of star birth thought to have occurred around a million years ago. Its hottest stars have blown out the enormous cavity with ultraviolet radiation and violent winds. Near the top-right corner, dark cocoon-like knots called Bok globules (dense clouds of about ten to fifty solar masses) are collapsing toward new stars.',
    'Because the cluster’s stars share a similar age but differ in mass, astronomers use it to compare how stars of different weights evolve. Its three brightest central “stars” may each be two or more massive stars blended together.'
  ],
  scale: 'The swirling nebula around the cluster contains about 400,000 times the mass of our Sun in gas.',
  understand: {
    summary: 'Visible and near-infrared light from Hubble’s Advanced Camera for Surveys through three broad filters.',
    filters: [['435 nm (B)', 'source lists band only'], ['550 nm (V)', 'source lists band only'], ['850 nm (I, near-infrared)', 'source lists band only']],
    eye: 'Broad filters give a broadly natural-colour impression, though the source does not publish the exact colour assignments.'
  },
  labels: [],
  behind: {
    observatory: 'Hubble Space Telescope (NASA/ESA)',
    instrument: 'ACS (Advanced Camera for Surveys)',
    people: 'Hubble Heritage (STScI/AURA)-ESA/Hubble Collaboration',
    exposure: 'Not published on the source page.',
    technique: 'Multi-filter composite.',
    processing: 'Filter-to-colour assignment not published.'
  },
  explore: [
    'NGC 3603 harbours a blue supergiant called Sher 25, above and to the left of the densest part of the cluster, thought to be nearing a supernova explosion.',
    'Separate measurements with ESO’s Very Large Telescope and Hubble found the largest individual stellar mass among the bright central systems to be roughly 115 solar masses.'
  ],
  sources: [
    ['ESA/Hubble image page (heic0715a)', 'https://esahubble.org/images/heic0715a/'],
    ['ESA/Hubble release heic0715', 'https://esahubble.org/news/heic0715/'],
    ['ESA/Hubble Top 100 Images', 'https://esahubble.org/images/archive/top100/']
  ]
},
{
  id: 'weic2301a', cat: 'star', org: 'webb',
  title: 'NGC 346',
  caption: 'Star-forming region NGC 346 in the Small Magellanic Cloud, imaged by the James Webb Space Telescope',
  captureDate: null,
  releaseDate: '11 January 2023',
  celestial: 'NGC 346, Small Magellanic Cloud, constellation Tucana · about 210,000 light-years away',
  img: { ...assets(WEBB, 'weic2301a'), pubW: 2754, pubH: 4000, origW: 7884, origH: 11451, largeMB: 14.7 },
  credit: 'NASA, ESA, CSA, STScI, A. Pagan (STScI)',
  source: 'https://esawebb.org/images/weic2301a/',
  recognition: { kind: 'editorial', text: 'Official ESA/Webb release image (weic2301). No published audience rating.' },
  story: [
    'Arcs and ribbons of glowing pink and orange gas curl through a star-filled field around a sparkling concentration of stars. This is NGC 346, one of the most dynamic star-forming regions in the nearby galaxies, in the Small Magellanic Cloud, a dwarf galaxy close to our Milky Way.',
    'The Small Magellanic Cloud has lower concentrations of elements heavier than hydrogen and helium than our galaxy, much like galaxies two to three billion years after the Big Bang, during “cosmic noon”, when star formation peaked. Because dust is made mostly of these heavier elements, astronomers expected little of it here. Webb found the opposite.',
    'Webb can detect protostars down to about a tenth of the Sun’s mass, and for the first time revealed dust, not only gas, in the discs feeding young stars in NGC 346. The ribbon-like structures trace material being gathered from the surrounding cloud.'
  ],
  scale: 'Using ESA/Webb’s field of view (4.11 × 5.96 arcminutes) and 210,000-light-year distance, the frame spans roughly 250 × 360 light-years.',
  understand: {
    summary: 'Near-infrared light from NIRCam through four filters.',
    filters: [['2.0 µm', 'blue'], ['2.77 µm', 'cyan'], ['3.35 µm (PAH)', 'orange'], ['4.44 µm', 'red']],
    eye: 'All four wavelengths are invisible to the eye; the orange-pink ribbons correspond to wavelengths associated with dust and carbon-rich molecules (PAH).'
  },
  labels: [],
  behind: {
    observatory: 'James Webb Space Telescope (NASA/ESA/CSA)',
    instrument: 'NIRCam (Near-Infrared Camera)',
    people: 'A. Pagan (STScI)',
    exposure: 'Not published on the source page.',
    technique: 'Multi-filter composite.',
    processing: 'Colours assigned by filter, as listed.'
  },
  explore: [
    'A galaxy during cosmic noon would have had thousands of regions like NGC 346, according to principal investigator Margaret Meixner, which is why this single nearby example is so valuable.'
  ],
  sources: [
    ['ESA/Webb image page (weic2301a)', 'https://esawebb.org/images/weic2301a/'],
    ['ESA/Webb release weic2301', 'https://esawebb.org/news/weic2301/']
  ]
},

/* ============================ NIGHT SKY ============================ */
{
  id: 'potw1222a', cat: 'night', org: 'eso',
  title: 'The Southern Milky Way above ALMA',
  caption: 'ALMA antennas beneath the southern Milky Way, Chajnantor plateau, Atacama region, Chile',
  captureDate: null,
  releaseDate: '28 May 2012',
  celestial: 'Sky: constellations Carina and Vela, including the Carina Nebula (about 7,500 light-years away) · Ground: Chajnantor plateau, about 5,000 m, Chile',
  img: { ...assets(ESO, 'potw1222a'), pubW: 4000, pubH: 2667, origW: 5315, origH: 3544, largeMB: 6.5 },
  credit: 'ESO/B. Tafreshi (twanight.org)',
  source: 'https://www.eso.org/public/images/potw1222a/',
  recognition: { kind: 'editorial', text: 'Ranked #27 on ESO’s published “Top 100 Images” list; ESO Picture of the Week (a curated selection, not an audience score).' },
  story: [
    'Huge dish antennas loom in the foreground, small green lights glowing on their bases, while the Milky Way pours across a sky crowded with stars. ESO Photo Ambassador Babak Tafreshi made this photograph of the Atacama Large Millimeter/submillimeter Array (ALMA) on the Chajnantor plateau, about 5,000 metres up in Chile’s Atacama region.',
    'The sky shows the constellations Carina (the Keel) and Vela (the Sails). Dark, wispy dust clouds of the Milky Way run diagonally from the top left toward the bottom right. The bright orange star at upper left is Suhail, in Vela; the similar orange star at upper middle is Avior, in Carina. Almost exactly in the centre, below them, glows the pink Carina Nebula.',
    'The two antennas closest to the camera carry the markings DA-43 and DA-41, two of the European antennas ESO provided for the array.'
  ],
  scale: 'The antennas are a few metres from the camera; the pink glow of the Carina Nebula at the centre is about 7,500 light-years away (ESA/Hubble’s distance figure).',
  understand: {
    summary: 'A landscape photograph of the night sky, as recorded by a camera, not a telescope image with assigned colours.',
    filters: [],
    eye: 'Cameras gather light over time, so faint colours like the nebula’s pink show more strongly than to the naked eye. Positions of the named stars and nebula follow ESO’s caption; only the Carina Nebula, stated to be almost exactly central, is marked.'
  },
  labels: [
    { x: 50, y: 47, text: 'Carina Nebula (per ESO: almost exactly central)' }
  ],
  behind: {
    observatory: 'Photograph taken at ALMA, Chajnantor plateau, Chile',
    instrument: 'Camera and lens not published on the source page',
    people: 'Babak Tafreshi, ESO Photo Ambassador and founder of The World At Night',
    exposure: 'Not published on the source page.',
    technique: 'Not stated by ESO (single frame, stack or panorama unknown).',
    processing: 'Not published.'
  },
  explore: [
    'ALMA is an international partnership of Europe, North America and East Asia in cooperation with the Republic of Chile. It studies the Universe in millimetre and submillimetre light, which requires the extremely high, dry conditions of Chajnantor.',
    'The World At Night, founded by Tafreshi, collects photographs of beautiful and historic sites set against the night sky.'
  ],
  sources: [
    ['ESO image page (potw1222a)', 'https://www.eso.org/public/images/potw1222a/'],
    ['ESO Top 100 Images', 'https://www.eso.org/public/images/archive/top100/'],
    ['Carina Nebula distance (ESA/Hubble heic0707a)', 'https://esahubble.org/images/heic0707a/']
  ]
},
{
  id: 'uhd_img4255pc_bt_cc', cat: 'night', org: 'eso',
  title: 'Radiance of the Milky Way over La Silla',
  caption: 'The Milky Way over ESO’s 3.6-metre telescope, La Silla Observatory, Chile',
  captureDate: null,
  releaseDate: '24 August 2016',
  celestial: 'Sky: the Milky Way · Ground: La Silla Observatory, 2,400 m, on the outskirts of the Atacama Desert, Chile',
  img: { ...assets(ESO, 'uhd_img4255pc_bt_cc'), pubW: 4000, pubH: 4000, origW: 5646, origH: 5646, largeMB: 9.8 },
  credit: 'ESO/B. Tafreshi (twanight.org)',
  source: 'https://www.eso.org/public/images/uhd_img4255pc_bt_cc/',
  recognition: { kind: 'editorial', text: 'Ranked #78 on ESO’s published “Top 100 Images” list (a curated selection, not an audience score).' },
  story: [
    'A river of stars and dark dust lanes sweeps diagonally across the sky, glowing in soft gold and rose above a dark ridge. At lower right, a pale observatory dome catches the starlight. This is our own galaxy, the Milky Way, over ESO’s La Silla Observatory in Chile, photographed by Babak Tafreshi.',
    'The dome belongs to the ESO 3.6-metre telescope, now home to HARPS (the High Accuracy Radial velocity Planet Searcher), which ESO describes as the world’s foremost extrasolar-planet hunter. HARPS detects planets by measuring the tiny back-and-forth wobble they induce in their stars’ motion.',
    'La Silla sits on the outskirts of the Atacama Desert, about 600 kilometres north of Santiago, at an altitude of 2,400 metres. It has been an ESO stronghold since the 1960s, and dark, dry skies like these are why.'
  ],
  scale: null,
  understand: {
    summary: 'A landscape photograph of the night sky, as recorded by a camera.',
    filters: [],
    eye: 'The dark lanes are clouds of interstellar dust blocking starlight behind them. ESO’s caption does not identify individual stars or nebulae, so none are labelled here.'
  },
  labels: [
    { x: 74, y: 80, text: 'ESO 3.6-metre telescope' }
  ],
  behind: {
    observatory: 'Photograph taken at La Silla Observatory, Chile',
    instrument: 'Camera and lens not published on the source page',
    people: 'Babak Tafreshi',
    exposure: 'Not published on the source page.',
    technique: 'Not stated by ESO (single frame, stack or panorama unknown).',
    processing: 'Not published.'
  },
  explore: [
    'Radial-velocity instruments such as HARPS split starlight into a spectrum and track minute shifts in it as a star is tugged by orbiting planets.'
  ],
  sources: [
    ['ESO image page (uhd_img4255pc_bt_cc)', 'https://www.eso.org/public/images/uhd_img4255pc_bt_cc/'],
    ['La Silla Observatory (ESO)', 'https://www.eso.org/public/teles-instr/lasilla/'],
    ['ESO Top 100 Images', 'https://www.eso.org/public/images/archive/top100/']
  ]
},
{
  id: 'potw1217a', cat: 'night', org: 'eso',
  title: 'The Moon and the Arc of the Milky Way',
  caption: 'Panorama of the Milky Way and Moon over ALMA, Chajnantor plateau, Chilean Andes',
  captureDate: null,
  releaseDate: '12 May 2022 (as listed by ESO)',
  celestial: 'Sky: the Milky Way, the Moon and the Magellanic Clouds · Ground: Chajnantor plateau, about 5,000 m, Chile',
  img: { ...assets(ESO, 'potw1217a'), pubW: 4000, pubH: 1122, origW: 8214, origH: 2305, largeMB: 6.4 },
  credit: 'ESO/S. Guisard (www.eso.org/~sguisard)',
  source: 'https://www.eso.org/public/images/potw1217a/',
  recognition: { kind: 'editorial', text: 'Ranked #39 on ESO’s published “Top 100 Images” list (a curated selection, not an audience score).' },
  story: [
    'An arc of the Milky Way spans this wide panorama above a field of giant dish antennas washed in moonlight. ESO Photo Ambassador Stéphane Guisard captured it at ALMA, on the 5,000-metre-high, extremely dry Chajnantor plateau in the Chilean Andes.',
    'When the panorama was taken, the Moon lay close to the centre of the Milky Way in the sky, and its light bathes the antennas in a soft glow. On the left, according to ESO, the Large and Small Magellanic Clouds, the biggest of the Milky Way’s dwarf satellite galaxies, appear as two luminous smudges, and a particularly bright meteor gleams near the Small Magellanic Cloud.',
    'To the right stand some of ALMA’s smaller 7-metre antennas, then the lights of the Array Operations Site Technical Building, and behind it the dark peak of Cerro Chajnantor.'
  ],
  scale: 'The Moon is about 384,400 km away; its light takes about 1.3 seconds to reach us. The Small Magellanic Cloud, on the same frame, is roughly 210,000 light-years away.',
  understand: {
    summary: 'A wide panorama photograph covering about 210° × 65° of sky and landscape, per ESO.',
    filters: [],
    eye: 'Panoramas stitch several frames into one, which curves straight features such as the horizon and the arc of the Milky Way. Only the Moon and Cerro Chajnantor are labelled; the Magellanic Clouds’ exact positions are not specified by ESO.'
  },
  labels: [
    { x: 48, y: 54, text: 'The Moon' },
    { x: 95, y: 86, text: 'Cerro Chajnantor' }
  ],
  behind: {
    observatory: 'Photograph taken at ALMA, Chajnantor plateau, Chile',
    instrument: 'Camera and lens not published on the source page',
    people: 'Stéphane Guisard, ESO Photo Ambassador',
    exposure: 'Not published on the source page.',
    technique: 'Panorama (ESO lists a 210° × 65° field of view).',
    processing: 'Not published.'
  },
  explore: [
    'ALMA’s main array uses 12-metre dishes; the smaller 7-metre antennas form part of the Atacama Compact Array.'
  ],
  sources: [
    ['ESO image page (potw1217a)', 'https://www.eso.org/public/images/potw1217a/'],
    ['Moon distance (NASA)', 'https://science.nasa.gov/moon/facts/'],
    ['SMC distance via NGC 346 (ESA/Webb)', 'https://esawebb.org/images/weic2301a/'],
    ['ESO Top 100 Images', 'https://www.eso.org/public/images/archive/top100/']
  ]
},
{
  id: 'ann13016a', cat: 'night', org: 'eso',
  title: 'ALMA under the Magellanic Clouds',
  caption: 'ALMA antennas under the Magellanic Clouds, Chajnantor plateau, Chilean Andes',
  captureDate: null,
  releaseDate: '1 March 2013',
  celestial: 'Sky: the Large and Small Magellanic Clouds · Ground: Chajnantor plateau, Chile',
  img: { ...assets(ESO, 'ann13016a'), pubW: 4000, pubH: 2662, origW: 4256, origH: 2832, largeMB: 3.5 },
  credit: 'ESO/C. Malin (christophmalin.com)',
  source: 'https://www.eso.org/public/images/ann13016a/',
  recognition: { kind: 'editorial', text: 'Ranked #25 on ESO’s published “Top 100 Images” list (a curated selection, not an audience score).' },
  story: [
    'White antennas tilt toward a deep blue night sky filled with fine stars, standing on a pale concrete platform. High above them hang faint, cloud-like smudges. These are the Large and Small Magellanic Clouds, two companion galaxies of our Milky Way, seen from the Chajnantor plateau in the Chilean Andes.',
    'The photograph, by Christoph Malin, shows antennas of the Atacama Large Millimeter/submillimeter Array (ALMA), which observes the Universe in millimetre and submillimetre light. The plateau’s great altitude and extreme dryness make it one of the best sites on Earth for this kind of astronomy.',
    'Although they look like wisps of cloud, each smudge is a galaxy of its own. The Small Magellanic Cloud hosts NGC 346, one of the star-forming regions in this collection, where Webb found surprisingly dusty discs around young stars.'
  ],
  scale: 'ESA/Hubble pages place the Large Magellanic Cloud about 150,000–170,000 light-years away; ESA/Webb gives about 210,000 light-years for NGC 346 in the Small Magellanic Cloud. Published distances vary.',
  understand: {
    summary: 'A landscape photograph of the night sky, as recorded by a camera.',
    filters: [],
    eye: 'ESO’s caption identifies the Magellanic Clouds but does not give their exact positions, so the image is not annotated.'
  },
  labels: [],
  behind: {
    observatory: 'Photograph taken at ALMA, Chajnantor plateau, Chile',
    instrument: 'Camera and lens not published on the source page',
    people: 'Christoph Malin',
    exposure: 'Not published on the source page.',
    technique: 'Not stated by ESO (single frame, stack or panorama unknown).',
    processing: 'Not published.'
  },
  explore: [
    'ALMA is an international partnership of Europe, North America and East Asia in cooperation with the Republic of Chile.'
  ],
  sources: [
    ['ESO image page (ann13016a)', 'https://www.eso.org/public/images/ann13016a/'],
    ['LMC distance (ESA/Hubble heic1402a)', 'https://esahubble.org/images/heic1402a/'],
    ['LMC distance (ESA/Hubble heic1105a)', 'https://esahubble.org/images/heic1105a/'],
    ['SMC distance via NGC 346 (ESA/Webb)', 'https://esawebb.org/images/weic2301a/'],
    ['ESO Top 100 Images', 'https://www.eso.org/public/images/archive/top100/']
  ]
}
];
