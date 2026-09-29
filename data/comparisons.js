/* Hubble-vs-Webb pairs, keyed by the catalog photograph they accompany.
   Each pair is ESA/Webb's own aligned comparison (same pixel dimensions,
   same framing), taken from its "Slider Tool" pages, so nothing is re-registered here.
   Dimensions are the publication JPEGs, measured 29 September 2026. */
import { WEBB } from './catalog.js';

const pub = (id) => WEBB + 'publicationjpg/' + id + '.jpg';

export const COMPARISONS = {
  weic2216b: {
    source: 'https://esawebb.org/images/comparisons/weic2216/',
    w: 3835, h: 4000,
    left: {
      label: 'Hubble · visible light', img: pub('weic2216f'),
      title: 'Hubble’s View of the Pillars of Creation',
      credit: 'NASA, ESA/Hubble and the Hubble Heritage Team'
    },
    right: {
      label: 'Webb · near-infrared', img: pub('weic2216e'),
      title: 'Webb’s New View of the Pillars of Creation (2022)',
      credit: 'NASA, ESA, CSA, STScI; J. DePasquale, A. Koekemoer, A. Pagan (STScI).'
    },
    note: 'In visible light the pillars look dark and nearly opaque, and dust hides many stars. Webb’s near-infrared view sees through more of that dust: the pillars turn translucent and many more red, still-forming stars appear.'
  },
  heic0515a: {
    source: 'https://esawebb.org/images/comparisons/weic2326a/',
    w: 4000, h: 3483,
    left: {
      label: 'Hubble · visible light (2005)', img: pub('weic2326d'),
      title: 'Hubble’s view of the Crab Nebula (2005 image)',
      credit: 'NASA, ESA, A. Loll/J. Hester (Arizona State University)'
    },
    right: {
      label: 'Webb · near- & mid-infrared', img: pub('weic2326e'),
      title: 'Webb’s new view of the Crab Nebula',
      credit: 'NASA, ESA, CSA, STScI, T. Temim (Princeton University)'
    },
    note: 'Webb’s NIRCam and MIRI show a crisp cage of red-orange filaments and knots of dust, and make the synchrotron emission from the nebula’s interior stand out as a milky, smoke-like glow.'
  },
  heic1509a: {
    source: 'https://esawebb.org/images/comparisons/potm2512/',
    w: 3952, h: 4000,
    left: {
      label: 'Webb · near- & mid-infrared', img: pub('potm2512a'),
      title: 'Dwarf stars in a glittering sky',
      credit: 'ESA/Webb, NASA & CSA, V. Almendros-Abad, M. Guarcello, K. Monsch, and the EWOCS team.'
    },
    right: {
      label: 'Hubble · 25th-anniversary image', img: pub('potm2512b'),
      title: 'Westerlund 2 (HST image)',
      credit: 'NASA, ESA, the Hubble Heritage Team (STScI/AURA), A. Nota (ESA/STScI), and the Westerlund 2 Science Team'
    },
    note: 'Both frames show the same central part of Westerlund 2. The Webb view combines NIRCam and MIRI data; the Hubble view is a portion of Hubble’s 2015 anniversary image. ESA/Webb notes the cluster measures between 6 and 13 light-years across.'
  },
  weic2301a: {
    source: 'https://esawebb.org/images/comparisons/weic2301/',
    w: 3367, h: 4000,
    left: {
      label: 'Hubble', img: pub('weic2301c'),
      title: 'NGC 346 (Hubble)',
      credit: 'NASA, ESA, A. James (STScI)'
    },
    right: {
      label: 'Webb · near-infrared', img: pub('weic2301d'),
      title: 'NGC 346 (Webb)',
      credit: 'NASA, ESA, CSA, STScI, A. Pagan (STScI)'
    },
    note: 'The same field of NGC 346 seen by the two telescopes. Webb’s infrared view brings out the glowing ribbons of gas and dust that feed the region’s young stars.'
  }
};
