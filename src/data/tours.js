/* Guided "look closer" tours, keyed by catalog id.
   x / y are percentages of the image width / height; zoom is relative to the
   fitted view (1 = whole image). Every stop points at a feature the source's
   own caption locates ("leftmost galaxy", "lower half", "top-right corner"...);
   coordinates were then read off the published image. Photographs whose
   sources give no positional detail have no tour. */
export const TOURS = {
  weic2216b: [
    { x: 21, y: 74, zoom: 4, title: 'A protostar breaking free',
      text: 'Bright red orbs like this one are protostars: knots of gas that collapsed under their own gravity, heated up and began to shine. ESA/Webb estimates stars here are only a few hundred thousand years old.' },
    { x: 77, y: 30, zoom: 3.2, title: 'Pillar tips and edges',
      text: 'Along the pillars’ edges, wavy lava-like lines trace material ejected by stars still forming. Where those jets hit the surrounding gas they can raise bow shocks, like the wake of a boat.' },
    { x: 78, y: 62, zoom: 2.4, title: 'A curtain, not a window',
      text: 'Infrared light passes through much of the dust, yet no distant galaxies appear. The translucent interstellar gas, lit by the crowd of young stars, blocks the deeper universe like a drawn curtain.' }
  ],
  weic2205a: [
    { x: 50, y: 12, zoom: 2.2, title: 'Inside the cavity',
      text: 'The glowing upper part of the frame is the inside of a vast cavity. The massive, hot young stars that carved it sit above this view, out of frame.' },
    { x: 45, y: 40, zoom: 3, title: 'The eroding wall',
      text: 'This ridge is the cavity’s wall. Ultraviolet radiation and stellar winds from those out-of-frame stars are slowly eating it away.' },
    { x: 40, y: 75, zoom: 2.6, title: 'Hidden stars',
      text: 'In the dusty cliffs, NIRCam revealed hundreds of previously hidden stars and signs of very early star formation — a phase that lasts only about 50,000 to 100,000 years for an individual star.' }
  ],
  heic0515a: [
    { x: 22, y: 60, zoom: 3, title: 'The tattered filaments',
      text: 'These orange and red strands are the shredded outer layers of the star that exploded, made mostly of hydrogen. Their colours trace different elements, per the ESA/Hubble release.' },
    { x: 50, y: 50, zoom: 2.6, title: 'The engine at the centre',
      text: 'Embedded near the centre, barely visible at this resolution, is a neutron star spinning about 30 times a second. It powers the nebula’s eerie inner glow.' }
  ],
  heic1307a: [
    { x: 42, y: 22, zoom: 2.6, title: 'The crest of the head',
      text: 'The Horsehead survives because it is made of thick clumps that resist erosion better than the clouds that once surrounded it. Astronomers estimate it has about five million years left.' },
    { x: 50, y: 85, zoom: 2.2, title: 'Waves of gas and dust',
      text: 'The pillar rises from turbulent waves of gas and dust. Most visible-light images show the Horsehead as a dark silhouette; infrared light reveals the delicate folds inside.' }
  ],
  weic2208a: [
    { x: 30, y: 41, zoom: 3, title: 'The odd one out: NGC 7320',
      text: 'The leftmost galaxy is a foreground galaxy, about 40 million light-years away. It only lines up with the others by chance.' },
    { x: 63, y: 43, zoom: 3, title: 'A galaxy smashing through',
      text: 'The red and gold glow around the central pair marks huge shock waves, captured by Webb’s MIRI instrument, as NGC 7318B smashes through the group.' },
    { x: 55, y: 30, zoom: 2.4, title: 'Four true neighbours',
      text: 'The other four galaxies lie about 290 million light-years away and are caught in a gravitational dance, pulling tails of gas, dust and stars from one another.' }
  ],
  heic0506a: [
    { x: 37, y: 47, zoom: 3, title: 'The yellowish core',
      text: 'The Whirlpool’s central core is home to older stars, per the ESA/Hubble caption.' },
    { x: 22, y: 62, zoom: 3.2, title: 'A star-forming assembly line',
      text: 'Across an arm, the sequence runs from dark dust clouds on the inner edge, to pink star-forming regions, to brilliant blue clusters of young stars on the outer edge.' },
    { x: 82, y: 32, zoom: 3, title: 'NGC 5195, passing behind',
      text: 'The small companion looks as if it tugs on the arm, but Hubble’s view shows it is passing behind the Whirlpool.' }
  ],
  weic2426a: [
    { x: 37, y: 47, zoom: 3, title: 'IC 2163 and its “eyelids”',
      text: 'The smaller spiral on the left. The bright arcs above and below its core are filled with newer star formation, and may mark where material from the two galaxies collided.' },
    { x: 65, y: 48, zoom: 2.6, title: 'NGC 2207',
      text: 'The larger spiral on the right. IC 2163 grazed past behind it millions of years ago.' },
    { x: 45, y: 18, zoom: 2.8, title: 'Super star clusters',
      text: 'The top-most arm wraps above the larger galaxy and points left. ESA/Webb highlights the super star clusters along it.' }
  ],
  heic1509a: [
    { x: 57, y: 36, zoom: 3, title: 'The cluster',
      text: 'About 3,000 stars packed into a region roughly 10 light-years across, including some of the brightest, hottest and most massive stars known.' },
    { x: 18, y: 50, zoom: 2.8, title: 'Pillars pointing home',
      text: 'Dense pillars of gas and dust, a few light-years tall, resist the cluster’s radiation and winds — and point back toward it.' }
  ],
  heic0715a: [
    { x: 47, y: 45, zoom: 3, title: 'A massive young cluster',
      text: 'One of the most impressive massive young clusters in the Milky Way, formed in a burst of star birth thought to have happened around a million years ago.' },
    { x: 66, y: 38, zoom: 2.6, title: 'The cavity',
      text: 'The hot blue stars at the core have blown out a huge cavity in the gas, seen to the right of the cluster.' },
    { x: 88, y: 10, zoom: 3, title: 'Bok globules',
      text: 'ESA/Hubble points to Bok globules near the top-right corner: dark, dense clouds of about ten to fifty solar masses, collapsing toward new stars.' }
  ],
  weic2316a: [
    { x: 30, y: 18, zoom: 2.6, title: 'Jets across the top',
      text: 'Huge red bipolar jets of molecular hydrogen run across the upper third. They appear when a young star first bursts through its dusty envelope.' },
    { x: 54, y: 17, zoom: 3.2, title: 'A shadow of a disc',
      text: 'At the top centre, a star shows a pinched dark shadow — the telltale sign of a circumstellar disc, a possible planetary system in the making.' },
    { x: 84, y: 70, zoom: 2.6, title: 'Jets down the right side',
      text: 'More jets run vertically down the right-hand side, where they strike the surrounding interstellar gas.' },
    { x: 52, y: 62, zoom: 2.6, title: 'S1 and its glowing cave',
      text: 'The only star here significantly more massive than the Sun, S1, is carving out this cave with its stellar winds. The pale gas around it is rich in polycyclic aromatic hydrocarbons.' }
  ],
  weic2301a: [
    { x: 45, y: 27, zoom: 3, title: 'A crowd of young stars',
      text: 'NGC 346 is the one massive cluster furiously forming stars in its whole galaxy, the Small Magellanic Cloud.' },
    { x: 55, y: 50, zoom: 2.8, title: 'Ribbons of gas and dust',
      text: 'As stars form they gather gas and dust from the surrounding cloud, which can look like ribbons in Webb’s imagery. Webb detected dust in the discs feeding these young stars for the first time.' }
  ],
  potw1222a: [
    { x: 27, y: 12, zoom: 3, title: 'Suhail, in Vela',
      text: 'ESO’s caption identifies the bright orange star at upper left as Suhail, in the constellation Vela (the Sails).' },
    { x: 52, y: 52, zoom: 3, title: 'The Carina Nebula',
      text: 'Almost exactly in the centre glows the pink Carina Nebula, about 7,500 light-years away.' },
    { x: 50, y: 72, zoom: 1.8, title: 'The nearest antennas',
      text: 'The two antennas closest to the camera carry the markings DA-43 and DA-41 — European antennas that ESO provided for ALMA.' }
  ],
  potw1217a: [
    { x: 48, y: 54, zoom: 3, title: 'The Moon',
      text: 'When the panorama was taken, the Moon lay close to the centre of the Milky Way in the sky, lighting the antennas below.' },
    { x: 78, y: 86, zoom: 3, title: 'Smaller antennas',
      text: 'On the right stand some of ALMA’s smaller 7-metre antennas, part of the Atacama Compact Array.' },
    { x: 94, y: 86, zoom: 3.4, title: 'Cerro Chajnantor',
      text: 'Behind the Array Operations Site Technical Building rises the dark peak of Cerro Chajnantor.' }
  ],
  uhd_img4255pc_bt_cc: [
    { x: 25, y: 45, zoom: 2.4, title: 'Dark lanes of dust',
      text: 'The dark streaks across the Milky Way are clouds of interstellar dust blocking the starlight behind them.' },
    { x: 74, y: 80, zoom: 3, title: 'The ESO 3.6-metre telescope',
      text: 'Home to HARPS, the High Accuracy Radial velocity Planet Searcher, which ESO describes as the world’s foremost extrasolar-planet hunter.' }
  ],

  // Tours for photographs in the larger collection: stops follow positions stated in each photo’s own
  // ESA or NASA caption (read off the published image), texts paraphrase that caption.
  "h-heic0601a": [
    {"x": 30, "y": 20, "zoom": 2.6, "title": "M43", "text": "The bright glow at upper left is M43, a smaller region being shaped by the ultraviolet light of one massive, young star."},
    {"x": 24, "y": 24, "zoom": 3, "title": "Pillars pointing inward", "text": "Beside M43, dense dark pillars of dust and gas point toward the Trapezium. They survive because they resist erosion by the Trapezium’s intense ultraviolet light."},
    {"x": 45, "y": 46, "zoom": 3.2, "title": "The Trapezium", "text": "At the heart of the nebula sit the Trapezium stars, named for their trapezoid arrangement. Some stars nearby are young enough to still have discs of material around them."},
    {"x": 82, "y": 50, "zoom": 2.4, "title": "Arcs and bubbles", "text": "On the right, arcs and bubbles mark where streams of charged particles blown off the Trapezium stars collide with surrounding material."},
    {"x": 50, "y": 90, "zoom": 2.8, "title": "Brown dwarfs", "text": "The faint red stars near the bottom are brown dwarfs, objects too small to sustain fusion like the Sun. Hubble was the first to spot them in this nebula in visible light."}
  ],
  "h-heic0910i": [
    {"x": 30, "y": 30, "zoom": 2, "title": "NGC 7320", "text": "The bluish galaxy at upper left, NGC 7320, is not part of the group at all. It sits in the foreground, about seven times closer to Earth than the others."},
    {"x": 72, "y": 27, "zoom": 2.4, "title": "NGC 7319", "text": "At top right, NGC 7319 is a barred spiral whose arms curl nearly 180 degrees back to the bar. Its blue specks and red dots are clusters of many thousands of stars."},
    {"x": 60, "y": 57, "zoom": 2.4, "title": "Two galaxies, not one", "text": "The galaxy that seems to have two cores is really two galaxies, NGC 7318A and NGC 7318B."},
    {"x": 82, "y": 52, "zoom": 2.6, "title": "Stars between galaxies", "text": "Out to the right, away from the galaxies themselves, star clusters are forming in a patch of intergalactic space."},
    {"x": 28, "y": 84, "zoom": 2.4, "title": "NGC 7317", "text": "At bottom left, the elliptical NGC 7317 looks normal and has been less affected by the group’s interactions."}
  ],
  "nasa-galaxy-triplet-arp-274": [
    {"x": 42, "y": 45, "zoom": 2, "title": "The largest galaxy", "text": "The largest of the three galaxies sits in the middle."},
    {"x": 73, "y": 61, "zoom": 2.2, "title": "Knots of new stars", "text": "Bright blue knots of star formation are strung along the arms of the galaxy on the right."},
    {"x": 11, "y": 68, "zoom": 3, "title": "The compact one", "text": "The third galaxy, at far left, is more compact but also shows signs of star formation."},
    {"x": 76, "y": 38, "zoom": 3, "title": "Foreground stars", "text": "The two bright points at upper right are stars inside our own Milky Way, far in front of the galaxies."}
  ],
  "nasa-arp-143": [
    {"x": 31, "y": 46, "zoom": 2.2, "title": "NGC 2444", "text": "On the left is NGC 2444, the less showy partner, which still holds its companion in its gravitational grip."},
    {"x": 60, "y": 40, "zoom": 2.2, "title": "NGC 2445", "text": "On the right, the distorted spiral NGC 2445 is ablaze with star formation. Astronomers suggest the two galaxies passed through each other, setting off this triangular burst of new stars."}
  ],
  "nasa-pillars-of-creation-miri-image": [
    {"x": 45, "y": 8, "zoom": 2.2, "title": "A V of cooler dust", "text": "The red, V-shaped region toward the top is where dust is both diffuse and cooler."},
    {"x": 78, "y": 15, "zoom": 2.6, "title": "The first pillar", "text": "The top pillar points toward the upper right. Lower down it has darker knots of dust, many with red stars."},
    {"x": 84, "y": 50, "zoom": 2.4, "title": "Two smaller pillars", "text": "Below it lie two slightly smaller pillars, both ending in dark gray-blue regions."},
    {"x": 12, "y": 85, "zoom": 2.2, "title": "Densest dust", "text": "The scene seems to clear toward the bottom left, but the darkest gray areas there are where the densest, coolest dust lies."}
  ],
  "nasa-the-omega-nebula-hotbed-of-star-formation": [
    {"x": 89, "y": 37, "zoom": 3, "title": "A rose of gas", "text": "The rose-like feature glows in the red light given off by hydrogen and sulfur."},
    {"x": 5, "y": 45, "zoom": 3, "title": "A horsehead look-alike", "text": "Dense pockets of gas form this feature jutting in from the left edge, which resembles the Horsehead Nebula in Orion. Pockets like this may contain developing stars."}
  ],
  "w-weic2415a": [
    {"x": 18, "y": 20, "zoom": 2.6, "title": "Aligned outflows", "text": "In the top left corner, astronomers found a group of protostellar outflows all pointing the same way."},
    {"x": 59, "y": 55, "zoom": 2.6, "title": "The Bat Shadow", "text": "At the centre is the Bat Shadow, named after Hubble data from 2020 showed it flap, or shift."}
  ],
  "w-weic2207b": [
    {"x": 50, "y": 47, "zoom": 2.4, "title": "The bright central star", "text": "The bright star at the centre plays a supporting role. A second, fainter star nearby is the source of the nebula."},
    {"x": 14, "y": 38, "zoom": 4, "title": "An edge-on galaxy", "text": "The bright angled line at upper left is a galaxy seen edge-on, far in the background."}
  ],
  "w-weic2219a": [
    {"x": 50, "y": 51, "zoom": 3, "title": "The hidden protostar", "text": "The protostar L1527 lies within this cloud of material, which is feeding its growth."},
    {"x": 48, "y": 35, "zoom": 2.2, "title": "Bubbles above", "text": "Above the neck, bubble-like shapes come from sporadic ejections, or stellar burps."},
    {"x": 60, "y": 82, "zoom": 2.2, "title": "Blue below", "text": "The lower region looks blue because there is less dust between it and Webb than in the orange regions above."}
  ],
  "nasa-trifid-nebula-wide-field-camera-3-image": [
    {"x": 22, "y": 27, "zoom": 3.2, "title": "A jet from a young star", "text": "The thin streak on the left horn is Herbig-Haro 399, a jet of plasma thrown out over centuries by a young protostar buried in the head."},
    {"x": 12, "y": 40, "zoom": 3.4, "title": "A water bear", "text": "Just left of the head stands a small, faint pillar that resembles a water bear. Most of its gas and dust has been blown away, but the densest material at the top remains."},
    {"x": 12, "y": 8, "zoom": 2, "title": "The least dust", "text": "The bright blue top left is where there is the least dust."},
    {"x": 82, "y": 75, "zoom": 2, "title": "The densest dust", "text": "The nearly black far-right corner is where the dust is densest."}
  ],
  "nasa-the-eagle-has-risen-stellar-spire-in-the-eagle-nebula": [
    {"x": 25, "y": 12, "zoom": 3, "title": "A shock front", "text": "The bright rim at top left may be a shock front, where starlight from beyond the top of the image heats the gas."},
    {"x": 45, "y": 45, "zoom": 2.4, "title": "Stellar nurseries", "text": "The bumps and fingers in the middle of the tower are places where stars are being born."},
    {"x": 55, "y": 90, "zoom": 2.4, "title": "Glowing hydrogen", "text": "The red colour in the lower part comes from glowing hydrogen, while the blue at the top is glowing oxygen."}
  ]
};
