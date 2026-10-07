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
      text: 'These orange and red strands are the shredded outer layers of the star that exploded, made mostly of hydrogen. Their colors trace different elements, per the ESA/Hubble release.' },
    { x: 50, y: 50, zoom: 2.6, title: 'The engine at the center',
      text: 'Embedded near the center, barely visible at this resolution, is a neutron star spinning about 30 times a second. It powers the nebula’s eerie inner glow.' }
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
    { x: 55, y: 30, zoom: 2.4, title: 'Four true neighbors',
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
      text: 'At the top center, a star shows a pinched dark shadow — the telltale sign of a circumstellar disc, a possible planetary system in the making.' },
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
      text: 'Almost exactly in the center glows the pink Carina Nebula, about 7,500 light-years away.' },
    { x: 50, y: 72, zoom: 1.8, title: 'The nearest antennas',
      text: 'The two antennas closest to the camera carry the markings DA-43 and DA-41 — European antennas that ESO provided for ALMA.' }
  ],
  potw1217a: [
    { x: 48, y: 54, zoom: 3, title: 'The Moon',
      text: 'When the panorama was taken, the Moon lay close to the center of the Milky Way in the sky, lighting the antennas below.' },
    { x: 78, y: 86, zoom: 3, title: 'Smaller antennas',
      text: 'On the right stand some of ALMA’s smaller 7-meter antennas, part of the Atacama Compact Array.' },
    { x: 94, y: 86, zoom: 3.4, title: 'Cerro Chajnantor',
      text: 'Behind the Array Operations Site Technical Building rises the dark peak of Cerro Chajnantor.' }
  ],
  uhd_img4255pc_bt_cc: [
    { x: 25, y: 45, zoom: 2.4, title: 'Dark lanes of dust',
      text: 'The dark streaks across the Milky Way are clouds of interstellar dust blocking the starlight behind them.' },
    { x: 74, y: 80, zoom: 3, title: 'The ESO 3.6-meter telescope',
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
    {"x": 77, "y": 36, "zoom": 3, "title": "Foreground stars", "text": "The two bright points at upper right are stars inside our own Milky Way, far in front of the galaxies."}
  ],
  "nasa-arp-143": [
    {"x": 31, "y": 46, "zoom": 2.2, "title": "NGC 2444", "text": "On the left is NGC 2444, the less showy partner, which still holds its companion in its gravitational grip."},
    {"x": 64, "y": 45, "zoom": 2.2, "title": "NGC 2445", "text": "On the right, the distorted spiral NGC 2445 is ablaze with star formation. Astronomers suggest the two galaxies passed through each other, setting off this triangular burst of new stars."}
  ],
  "nasa-pillars-of-creation-miri-image": [
    {"x": 45, "y": 8, "zoom": 2.2, "title": "A V of cooler dust", "text": "The red, V-shaped region toward the top is where dust is both diffuse and cooler."},
    {"x": 78, "y": 15, "zoom": 2.6, "title": "The first pillar", "text": "The top pillar points toward the upper right. Lower down it has darker knots of dust, many with red stars."},
    {"x": 84, "y": 50, "zoom": 2.4, "title": "Two smaller pillars", "text": "Below it lie two slightly smaller pillars, both ending in dark gray-blue regions."},
    {"x": 12, "y": 85, "zoom": 2.2, "title": "Densest dust", "text": "The scene seems to clear toward the bottom left, but the darkest gray areas there are where the densest, coolest dust lies."}
  ],
  "nasa-the-omega-nebula-hotbed-of-star-formation": [
    {"x": 89, "y": 37, "zoom": 3, "title": "A rose of gas", "text": "The rose-like feature glows in the red light given off by hydrogen and sulfur."},
    {"x": 3, "y": 44, "zoom": 3, "title": "A horsehead look-alike", "text": "Dense pockets of gas form this feature jutting in from the left edge, which resembles the Horsehead Nebula in Orion. Pockets like this may contain developing stars."}
  ],
  "w-weic2415a": [
    {"x": 18, "y": 20, "zoom": 2.6, "title": "Aligned outflows", "text": "In the top left corner, astronomers found a group of protostellar outflows all pointing the same way."},
    {"x": 59, "y": 55, "zoom": 2.6, "title": "The Bat Shadow", "text": "At the center is the Bat Shadow, named after Hubble data from 2020 showed it flap, or shift."}
  ],
  "w-weic2207b": [
    {"x": 50, "y": 47, "zoom": 2.4, "title": "The bright central star", "text": "The bright star at the center plays a supporting role. A second, fainter star nearby is the source of the nebula."},
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
    {"x": 55, "y": 90, "zoom": 2.4, "title": "Glowing hydrogen", "text": "The red color in the lower part comes from glowing hydrogen, while the blue at the top is glowing oxygen."}
  ],
  "nasa-hickson-compact-group-40": [{"x": 23, "y": 31, "zoom": 2.6, "title": "A tilted spiral", "text": "This spiral galaxy is tipped at an angle, so it looks oblique. Reddish-brown dust trails wind around its glowing yellow center."}, {"x": 56, "y": 35, "zoom": 2.4, "title": "The big elliptical", "text": "A large elliptical galaxy with a round yellow core. Its fuzzy halo fades gently the farther you look from the center."}, {"x": 74, "y": 53, "zoom": 2.6, "title": "Spiral seen edge-on", "text": "The biggest of three touching galaxies is a spiral we see from the side, standing almost upright."}, {"x": 57, "y": 64, "zoom": 3, "title": "A smaller sideways spiral", "text": "Lying flat beside the edge-on galaxy, this smaller spiral is dotted with blue stars. One of its arms seems to touch its neighbor."}, {"x": 72, "y": 76, "zoom": 3, "title": "A face-on lenticular", "text": "This lenticular galaxy has a glowing core inside a hazy yellow disk, seen almost face-on."}],
  "e-potw1150a": [{"x": 63, "y": 48, "zoom": 2.2, "title": "ALMA at work", "text": "These 12-meter dishes work together as one giant telescope. Here they were busy with the observatory’s first round of science."}, {"x": 5, "y": 86, "zoom": 3, "title": "The compact array", "text": "A lit-up cluster of smaller 7-meter antennas. They make up ALMA’s compact array."}, {"x": 30, "y": 36, "zoom": 3, "title": "Not a star: Jupiter", "text": "The brightest “star” in this sky is really the planet Jupiter. Only the Moon and Venus outshine it at night."}, {"x": 6, "y": 50, "zoom": 3.4, "title": "The Andromeda galaxy", "text": "That faint, stretched smudge is the Andromeda galaxy."}, {"x": 88, "y": 57, "zoom": 3, "title": "Large Magellanic Cloud", "text": "This puff of smoke, just above the last antenna, is the Large Magellanic Cloud."}],
  "nasa-hubble-interacting-galaxy-ngc-5754": [{"x": 48, "y": 30, "zoom": 2.2, "title": "Spiral NGC 5754", "text": "The large spiral on the right is NGC 5754, one half of an interacting pair."}, {"x": 24, "y": 83, "zoom": 3, "title": "Little NGC 5752", "text": "Its smaller companion, NGC 5752, sits down in the corner."}],
  "e-east_side_lasilla": [{"x": 51, "y": 77, "zoom": 2.4, "title": "The 2.2-meter telescope", "text": "Up front is the MPG/ESO 2.2-meter telescope. Behind it stand the NTT and the ESO 3.6-meter telescope."}, {"x": 95, "y": 75, "zoom": 3, "title": "SEST in the distance", "text": "Far off on the right stands SEST, another of the telescopes on La Silla."}, {"x": 12, "y": 15, "zoom": 2, "title": "The celestial equator", "text": "The celestial equator runs from this corner down to the ground."}],
  "w-potm2311a": [{"x": 30, "y": 66, "zoom": 2.2, "title": "Outflow HH 797", "text": "This jet of gas, HH 797, fills the lower half of the view. It lies near the young star cluster IC 348."}, {"x": 63, "y": 77, "zoom": 3.2, "title": "A hidden double star", "text": "The jet’s source sits in this small dark patch. It turns out to be not one star but two."}, {"x": 42, "y": 17, "zoom": 2.6, "title": "More young stars", "text": "The bright infrared spots up here are thought to hold two more protostars."}, {"x": 53, "y": 21, "zoom": 3, "title": "Another outflow", "text": "A second protostar here drives its own outflow, lighting up the walls of the cavity it has carved."}],
  "nasa-crucible-of-creation-panoramic-image-of-center-of-the-orion-nebula": [{"x": 41, "y": 54, "zoom": 2.6, "title": "The Trapezium", "text": "Four hot, massive stars light up the whole nebula. Their ultraviolet light heats the glowing clouds around them."}, {"x": 21, "y": 76, "zoom": 3, "title": "Loops of shock waves", "text": "Thin curved loops here are shock waves, some tipped with bright knots. The clearest examples sit near this bright star."}],
  "h-potw1138a": [{"x": 80, "y": 44, "zoom": 2.4, "title": "Giant NGC 4874", "text": "The brightest object here is a giant elliptical galaxy, about ten times larger than the Milky Way. It sits at the heart of the Coma Cluster."}, {"x": 85, "y": 71, "zoom": 2.6, "title": "Flying saucers", "text": "A few other galaxies of the Coma Cluster are visible too, looking like flying saucers dancing around NGC 4874."}],
  "e-eso0542b": [{"x": 55, "y": 70, "zoom": 2.2, "title": "Docking stations below", "text": "These are docking stations for the Auxiliary Telescopes of the Very Large Telescope Interferometer."}, {"x": 43, "y": 43, "zoom": 3, "title": "Alpha Centauri", "text": "Near the center sits Alpha Centauri, the lower of the two Pointers to the Southern Cross. Just below it lies the dark Coal Sack."}, {"x": 96, "y": 19, "zoom": 2.4, "title": "The Magellanic Clouds", "text": "Off to the right glow the Magellanic Clouds, alongside the sweep of the Milky Way."}, {"x": 90, "y": 12, "zoom": 3, "title": "A shooting star", "text": "The camera also caught a shooting star streaking across this corner of the sky."}],
  "h-potw1432a": [{"x": 34, "y": 34, "zoom": 2.8, "title": "The blue companion", "text": "This blue-tinted galaxy is a bit closer to us than its partner below. Together they form a pair called Zw I 136."}, {"x": 32, "y": 56, "zoom": 2.8, "title": "Its interacting partner", "text": "The two are close enough to interact, which may explain their disturbed shapes and soft, extended halos."}, {"x": 78, "y": 57, "zoom": 2.6, "title": "A spiral seen edge-on", "text": "Unlike the pair, this third bright galaxy looks more typical: a spiral seen from the side."}],
  "e-potw1823a": [{"x": 10, "y": 45, "zoom": 2.2, "title": "ESO 3.6-meter telescope", "text": "On the left stands the ESO 3.6-meter telescope, one end of the Milky Way's bridge."}, {"x": 56, "y": 42, "zoom": 2.6, "title": "The Gum Nebula", "text": "The bright splash of red in the middle is the Gum Nebula."}, {"x": 61, "y": 15, "zoom": 2.8, "title": "Two neighbor galaxies", "text": "The Large and Small Magellanic Clouds, a pair of nearby galaxies, sit above the plane of the Milky Way."}, {"x": 83, "y": 18, "zoom": 2.2, "title": "A submillimeter dish", "text": "On the right is the Swedish-ESO Submillimeter Telescope, the other end of the bridge."}, {"x": 37, "y": 92, "zoom": 3, "title": "Planet Jupiter", "text": "That especially bright dot isn't a star. It's the planet Jupiter."}],
  "n-gemini-ngc7232-final": [{"x": 17, "y": 37, "zoom": 2.6, "title": "NGC 7232B", "text": "Bright spots of young, blue stars dot this galaxy's weak spiral arms."}, {"x": 42, "y": 48, "zoom": 2.4, "title": "Stars in the way", "text": "These two bright objects aren't part of the group. They're foreground stars in our own Milky Way."}, {"x": 73, "y": 28, "zoom": 2.8, "title": "NGC 7232", "text": "Look for dark lanes of dusty material crossing this galaxy."}, {"x": 62, "y": 61, "zoom": 2.8, "title": "NGC 7233", "text": "This galaxy has dusty lanes too. A close encounter likely flung a huge amount of gas out of it."}],
  "e-lombardi-vlt": [{"x": 77, "y": 61, "zoom": 3, "title": "A crescent Moon", "text": "The bright object on the right is the crescent Moon."}, {"x": 88, "y": 72, "zoom": 2.4, "title": "Zodiacal light", "text": "This glow is sunlight reflected by dust in the plane of the solar system, stretching toward the Moon."}, {"x": 40, "y": 5, "zoom": 2.4, "title": "Our galaxy's bulge", "text": "At the top edge, the central bulge of the Milky Way is partly visible. Its dark lanes are vast clouds of dust."}, {"x": 8, "y": 68, "zoom": 3, "title": "Southern Cross and Coal Sack", "text": "Above and left of the nearest telescope, Yepun, you can spot the Southern Cross and the dark Coal Sack nebula."}],
  "n-iotw2523a": [{"x": 45, "y": 55, "zoom": 2.4, "title": "SMARTS 0.9-meter", "text": "On the left is the SMARTS–GSU 0.9-meter Telescope, run by the Georgia State University Research Foundation."}, {"x": 49, "y": 53, "zoom": 2.4, "title": "SMARTS 1.5-meter", "text": "In the center, the rising Moon looms over the SMARTS–GSU 1.5-meter Telescope."}, {"x": 55, "y": 50, "zoom": 2.4, "title": "The Blanco telescope", "text": "On the right stands the Víctor M. Blanco 4-meter Telescope."}],
  "h-opo1008a": [{"x": 25, "y": 40, "zoom": 2.8, "title": "Two dwarfs colliding", "text": "This bright, distorted object is actually two dwarf galaxies in a head-on collision, sparking countless new star clusters."}, {"x": 26, "y": 15, "zoom": 2.8, "title": "The cigar-shaped member", "text": "Above the colliding pair sits a third group member, linked to them by a bridge of star clusters."}, {"x": 48, "y": 54, "zoom": 3, "title": "Not a galaxy", "text": "The bright object in the center is a foreground star."}, {"x": 93, "y": 64, "zoom": 2.6, "title": "The fourth member", "text": "A long rope of bright star clusters points down to the group's fourth galaxy."}],
  "n-noao-ngc5364": [{"x": 22, "y": 31, "zoom": 2.8, "title": "Elliptical NGC 5363", "text": "This is the elliptical galaxy NGC 5363."}, {"x": 72, "y": 60, "zoom": 2.4, "title": "Spiral NGC 5364", "text": "The spiral NGC 5364 and its neighbor are likely in the early stages of a gravitational interaction."}],
  "n-noirlab2112a": [{"x": 50, "y": 48, "zoom": 2.6, "title": "The heart of M106", "text": "At the center, glowing spiral arms, wisps of gas and dust lanes wrap the core of Messier 106."}, {"x": 91, "y": 85, "zoom": 3, "title": "Dwarf galaxy NGC 4248", "text": "This small companion is a dwarf galaxy, NGC 4248."}, {"x": 8, "y": 85, "zoom": 3, "title": "Dwarf galaxy UGC 7358", "text": "Another dwarf galaxy, UGC 7358, also shares the view."}],
  "e-potw1912a": [{"x": 27, "y": 67, "zoom": 2.6, "title": "New Technology Telescope", "text": "On the left sits ESO’s 3.58-meter New Technology Telescope. The road leading to it looks bent because the photo was projected to show as much sky as possible."}, {"x": 77, "y": 65, "zoom": 2.6, "title": "The 3.6-meter telescope", "text": "On the right stands ESO’s 3.6-meter telescope. Its road is distorted by the same wide projection."}, {"x": 6, "y": 58, "zoom": 2.2, "title": "A column of zodiacal light", "text": "This pale, whitish column rising from the horizon is zodiacal light. It is sunlight scattering off dust particles in our Solar System."}, {"x": 50, "y": 68, "zoom": 2.4, "title": "Green airglow", "text": "The green glow at the center is airglow. High in Earth’s atmosphere, a variety of processes create this ghostly colored light."}],
  "e-eso0142a": [{"x": 55, "y": 54, "zoom": 2.8, "title": "The Pillars of Creation", "text": "At the center stand the famous Pillars of Creation. In infrared, this wide view shows them alongside several other pillars in the same star-forming region."}, {"x": 85, "y": 20, "zoom": 2.4, "title": "Young cluster NGC 6611", "text": "The massive blue stars of the young NGC 6611 cluster gather in the upper right. They formed from the same molecular clouds that fill this nebula."}],
  "nasa-interacting-spiral-galaxies-ngc-2207-and-ic-2163": [{"x": 34, "y": 50, "zoom": 2.2, "title": "NGC 2207", "text": "The larger, more massive galaxy on the left is NGC 2207. Its strong tidal forces are reshaping its smaller neighbor."}, {"x": 63, "y": 55, "zoom": 2.6, "title": "IC 2163", "text": "The smaller spiral on the right is IC 2163. NGC 2207’s pull has distorted its shape."}, {"x": 86, "y": 58, "zoom": 2.4, "title": "Flung-out streamers", "text": "Stars and gas torn from IC 2163 stretch toward the right edge in long streamers. They reach out a hundred thousand light-years."}],
  "nasa-the-stingray-nebula-the-youngest-known-planetary-nebula-hen-1357": [{"x": 49.5, "y": 50, "zoom": 3, "title": "The central star", "text": "The bright star in the middle of the green ring is the dying central star. Its wind has blown open holes in the ends of the surrounding bubbles."}, {"x": 44, "y": 46, "zoom": 3.4, "title": "A companion star", "text": "Diagonally above at 10 o’clock sits a companion star. A faint green spur of gas forms a bridge toward it."}, {"x": 40, "y": 72, "zoom": 2.6, "title": "Lower-left bubble", "text": "A bubble of gas extends to the lower left of the ring. Red curves mark gas heated where the star’s wind hits the bubble walls."}, {"x": 72, "y": 38, "zoom": 2.6, "title": "Upper-right bubble", "text": "Its twin bubble extends to the upper right. Gas escapes through holes the wind has blown in its end."}],
  "h-opo1008b": [{"x": 19, "y": 48, "zoom": 2.4, "title": "Two colliding dwarfs", "text": "This bright, distorted object is actually two dwarf galaxies colliding head-on. Myriad star clusters have formed in their debris."}, {"x": 23, "y": 15, "zoom": 2.6, "title": "A cigar-shaped member", "text": "Above the colliding pair is another group member. A bridge of star clusters links all three."}, {"x": 44, "y": 65, "zoom": 3, "title": "A foreground star", "text": "The bright object at the center isn’t part of the group at all. It is a star in our own galaxy, much closer to us."}, {"x": 92, "y": 78, "zoom": 2.4, "title": "The fourth member", "text": "A long rope of bright star clusters points to the group’s fourth galaxy here at lower right."}],
  "e-eso0912c": [{"x": 47, "y": 42, "zoom": 2.2, "title": "The SEST dish", "text": "At the center is the 15-meter dish of the Swedish-ESO Submillimeter Telescope, backlit by the Moon. Its polished surface reflects an upside-down sky behind the photographer."}, {"x": 65, "y": 69, "zoom": 2.6, "title": "The 3.6-meter dome", "text": "Farther away on the right is the dome of ESO’s 3.6-meter telescope. It sits at the highest point of the mountain."}, {"x": 88, "y": 19, "zoom": 3, "title": "The Pleiades", "text": "Just to the right of the dish, at about 2 o’clock, glows the Pleiades star cluster."}],
  "h-potw1517a": [{"x": 50, "y": 48, "zoom": 2.6, "title": "Galaxy UGC 5797", "text": "The smudge of stars at the center is UGC 5797. It is actively forming massive, bright blue stars that keep refreshing its population."}, {"x": 4, "y": 62, "zoom": 3, "title": "Spirals seen edge-on", "text": "These two background spirals are seen edge-on, so they look like plain streaks. Seen face-on, their spiral arms would show."}],
  "e-potw1418a": [{"x": 33, "y": 30, "zoom": 3, "title": "Venus", "text": "The bright planet at the center of the trio is Venus. Three planets lined up like this is called a syzygy."}, {"x": 39, "y": 24, "zoom": 3.2, "title": "Mercury", "text": "At the top right of the trio is Mercury. The close grouping lasted only a week or so."}, {"x": 27, "y": 37, "zoom": 3.2, "title": "Jupiter in the glow", "text": "At the bottom left of the trio, Jupiter is almost lost in the orange sunset."}],
  "e-potw2022a": [{"x": 46, "y": 45, "zoom": 2.6, "title": "Alpha Centauri", "text": "Two bright stars sit above the center antenna; the brighter is the triple system Alpha Centauri. One of its stars, Proxima Centauri, hosts Proxima b, the closest known exoplanet."}, {"x": 64, "y": 11, "zoom": 2.8, "title": "Antares", "text": "Of the two reddish lights at the top, the left one is Antares, a red giant star in Scorpius."}, {"x": 71, "y": 6, "zoom": 2.8, "title": "Saturn", "text": "The reddish light on the right is the ringed planet Saturn, a world much closer to home."}],
  "w-weic2315d": [{"x": 73, "y": 54, "zoom": 2.6, "title": "Theta-2 Orionis stars", "text": "The two large stars in the bottom right belong to a cluster called θ² Orionis."}, {"x": 85, "y": 62, "zoom": 2.2, "title": "The Orion Bar", "text": "A wall of brighter purple material crosses the bottom right. Beyond it, the gas grows wispier and more sparse."}],
  "e-potw1246a": [{"x": 53, "y": 24, "zoom": 2.4, "title": "The Carina Nebula", "text": "Glowing red in the middle is the Carina Nebula, the brightest nebula in the sky. It lies about 7,500 light-years away."}, {"x": 45, "y": 72, "zoom": 2, "title": "Auxiliary Telescopes", "text": "In the foreground are three of the VLT Interferometer’s four Auxiliary Telescopes. Working together, they see finer details than any one alone."}],
  "e-eso0544b": [{"x": 45, "y": 48, "zoom": 2.4, "title": "Cluster Haffner 18", "text": "At the center is Haffner 18, a group of mature stars that have already cleared away their birth nebulae. It holds about 50 stars."}, {"x": 27, "y": 68, "zoom": 3.2, "title": "A star still in its cocoon", "text": "Just to the bottom left of the cluster, a very young star is still wrapped in its birth cocoon of gas. Its shell is about 2.5 light-years wide."}, {"x": 88, "y": 80, "zoom": 2.2, "title": "Future stellar nurseries", "text": "The dust clouds toward the right corner are active stellar nurseries. They will produce new stars in the future."}],
  "n-iotw2421b": [{"x": 54, "y": 57, "zoom": 3, "title": "NGC 4411b", "text": "The left galaxy of the pair sits about 50 million light-years away, right beside its companion."}, {"x": 65, "y": 59, "zoom": 3, "title": "Arms that circle twice", "text": "NGC 4411a's symmetrical spiral arms swirl more than 360 degrees around its core. No distorted arms here, so no sign of interaction."}, {"x": 64, "y": 22, "zoom": 2.6, "title": "A real collision above", "text": "NGC 4410 shows what interaction looks like: four galaxies linked by tidal bridges, pulled by each other's gravity."}],
  "n-iotw2429a": [{"x": 70, "y": 40, "zoom": 2.4, "title": "The southern pole star", "text": "Faint Sigma Octantis sits in the middle of the vortex, the point the stars seem to circle as Earth turns."}, {"x": 88, "y": 82, "zoom": 2.4, "title": "Red flashlight squiggles", "text": "Someone walking with a red flashlight left these marks. Red light helps observers keep their night vision."}],
  "e-potw2340a": [{"x": 45, "y": 46, "zoom": 2, "title": "A rosy star nursery", "text": "IC 1284 glows red as hydrogen, energized by young stars, releases light at a specific color."}, {"x": 82, "y": 69, "zoom": 3, "title": "Blue reflection nebulae", "text": "NGC 6589 and NGC 6590 glow blue because their dust scatters bluer starlight, the same reason the sky is blue."}],
  "e-potw2237a": [{"x": 20, "y": 40, "zoom": 2.4, "title": "Barnard 93", "text": "This dark nebula looks black because its dense gas and dust block the light behind it."}, {"x": 53, "y": 56, "zoom": 2.4, "title": "Barnard 92", "text": "Like its neighbor, Barnard 92 is a stellar nursery where new stars form from collapsing gas and dust."}],
  "e-potw1448a": [{"x": 49, "y": 49, "zoom": 2.4, "title": "An orange smudge", "text": "This dusty cloud, IRAS 16562-3959, is a breeding ground for new stars."}, {"x": 8, "y": 86, "zoom": 2.6, "title": "HD 153220", "text": "The bright star in the bottom left corner is HD 153220."}],
  "e-eso9924b": [{"x": 53, "y": 37, "zoom": 3, "title": "The smaller companion", "text": "IC 4970 is the smaller galaxy interacting with the giant barred spiral NGC 6872."}, {"x": 18, "y": 24, "zoom": 2.6, "title": "A disturbed arm", "text": "This spiral arm is full of bluish star-forming regions, possibly stirred up when IC 4970 passed through it."}, {"x": 60, "y": 62, "zoom": 2.6, "title": "A foreground star", "text": "This bright object is a Milky Way star, so overexposed it shows reflections inside the telescope."}],
  "e-eso1036a": [{"x": 46, "y": 46, "zoom": 2.2, "title": "A superwind galaxy", "text": "NGC 4666 is forming stars so intensely that exploding stars and stellar winds drive a vast outflow of gas."}, {"x": 9, "y": 85, "zoom": 3, "title": "A neighbor's pull", "text": "NGC 4668 is one of the neighbors whose gravity is thought to have sparked the starburst."}],
  "e-eso1114a": [{"x": 38, "y": 44, "zoom": 2.6, "title": "A warped spiral", "text": "NGC 3169's spiral shape has been warped by the gravitational tug of war with its neighbor."}, {"x": 72, "y": 56, "zoom": 2.6, "title": "Broken dust lanes", "text": "In NGC 3166, the same tug of war has fragmented the dust lanes."}, {"x": 89, "y": 71, "zoom": 3, "title": "A third galaxy", "text": "Below and right of the pair sits a third galaxy, NGC 3165."}],
  "e-eso0926a": [{"x": 46, "y": 64, "zoom": 3, "title": "Pillars of Creation", "text": "The famous pillars stand at the center of this wide view of the Eagle Nebula."}, {"x": 60, "y": 48, "zoom": 2.4, "title": "The stars behind the glow", "text": "NGC 6611 is home to the massive, hot stars that light up the pillars."}, {"x": 36, "y": 49, "zoom": 2.8, "title": "The Spire", "text": "Another large pillar, the Spire, rises in the same star-forming region."}],
  "e-eso0803b": [{"x": 36, "y": 61, "zoom": 2.4, "title": "The Cone Nebula region", "text": "Left of center lies the rich, colorful Cone Nebula region, part of the NGC 2247 star-forming complex."}, {"x": 83, "y": 30, "zoom": 2.4, "title": "The Rosette Nebula", "text": "At the top right sits the Rosette Nebula. Like the Cone, it lies in Monoceros, right next to Orion."}, {"x": 24, "y": 32, "zoom": 2.8, "title": "MWC 147 by a dark cloud", "text": "Up in the top left, the star MWC 147 sits close to a dark nebula. It belongs to a group of massive stars called Monoceros OB1."}],
  "e-potw2049a": [{"x": 43.7, "y": 65.4, "zoom": 2.4, "title": "The Moon", "text": "The bright object at the center of the frame is the Moon."}, {"x": 40.9, "y": 60.5, "zoom": 3.2, "title": "Ringed Saturn", "text": "Just to the Moon's upper left is Saturn, shining despite the moonlight."}, {"x": 35.2, "y": 70.4, "zoom": 3.2, "title": "Rocky Mercury", "text": "Mercury sits to the Moon's lower left. Saturn and Mercury in conjunction can be hard to spot with the naked eye."}],
  "e-potw2639a": [{"x": 44, "y": 68, "zoom": 3, "title": "The Trifid Nebula", "text": "The left nebula between the telescopes is the Trifid. Its red comes from glowing hydrogen, and dust reflecting starlight adds a blue tint."}, {"x": 49, "y": 66, "zoom": 3, "title": "The Lagoon Nebula", "text": "On the right glows the Lagoon Nebula, reddened by hydrogen that young stars have ionized."}, {"x": 20, "y": 70, "zoom": 2.2, "title": "New Technology Telescope", "text": "The telescope on the left is ESO's NTT, a pioneer of active optics that keeps the mirror in shape during observations."}, {"x": 78, "y": 62, "zoom": 2.2, "title": "The 3.6-meter telescope", "text": "On the right is the ESO 3.6-meter telescope, home to the exoplanet hunters HARPS and NIRPS."}],
  "e-potw2105a": [{"x": 17, "y": 72, "zoom": 3, "title": "Two fellow photographers", "text": "At the bottom left, astrophotographers Yuri Beletsky and Babak Tafreshi stand beside an Auxiliary Telescope."}, {"x": 65, "y": 8, "zoom": 2.2, "title": "The red Gum Nebula", "text": "Glowing red at the top of the frame is the Gum Nebula."}, {"x": 74, "y": 41, "zoom": 2.6, "title": "Large Magellanic Cloud", "text": "The bright blotch at center right is the Large Magellanic Cloud, a satellite galaxy of the Milky Way. Just above it shines Canopus, the brightest star in view."}, {"x": 85, "y": 69, "zoom": 2, "title": "Airglow at the horizon", "text": "The green and reddish shimmer rising from the horizon is airglow, faint light given off by Earth's atmosphere."}],
  "e-potw2543a": [{"x": 49, "y": 68, "zoom": 2.2, "title": "Three Unit Telescopes", "text": "Three of the four VLT Unit Telescopes sit centered under the Milky Way."}, {"x": 88, "y": 82, "zoom": 3, "title": "The VLT Survey Telescope", "text": "The smaller telescope in the background on the right is the VLT Survey Telescope."}, {"x": 8, "y": 60, "zoom": 2, "title": "Green airglow", "text": "A greenish haze fills the left side of the sky. This airglow comes from chemical processes high in Earth's atmosphere."}, {"x": 90, "y": 55, "zoom": 2, "title": "Red airglow", "text": "On the right the glow turns reddish, since different excited atoms and molecules shine in different colors."}],
  "e-potw1123a": [{"x": 8, "y": 75, "zoom": 2.2, "title": "A sea of clouds", "text": "What looks like rippling ocean on the left is actually the cloud layer below the 2,600-meter mountaintop."}, {"x": 11, "y": 58, "zoom": 2.8, "title": "The setting Moon", "text": "The bright orb above the cloud blanket is the Moon, lighting up both the telescopes and the sky."}],
  "e-scpstartrails2": [{"x": 79, "y": 10, "zoom": 2.6, "title": "The south celestial pole", "text": "On the right, above the telescope dome, the trails circle the south celestial pole."}, {"x": 12, "y": 40, "zoom": 2.2, "title": "The Magellanic Clouds", "text": "The lighter area on the left is the diffuse glow of the Large and Small Magellanic Clouds, two neighbor galaxies of the Milky Way."}],
  "e-armazones_20100726": [{"x": 52, "y": 43, "zoom": 2.6, "title": "The south celestial pole", "text": "Near the center, the star trails wheel around the south celestial pole."}, {"x": 82, "y": 50, "zoom": 2.8, "title": "The seeing monitor", "text": "On the right is the DIMM, an instrument that measures atmospheric seeing."}, {"x": 66, "y": 55, "zoom": 2.8, "title": "Weather station tower", "text": "The white and red tower left of the DIMM is the weather station."}],
  "e-eso0802a": [{"x": 54, "y": 61, "zoom": 2.6, "title": "NGC 7173", "text": "At the top is NGC 7173, an elliptical galaxy."}, {"x": 45, "y": 80, "zoom": 2.6, "title": "Twisted NGC 7174", "text": "At bottom right, the spiral NGC 7174 shows disturbed dust lanes and a long, twisted tail."}, {"x": 37, "y": 79, "zoom": 2.6, "title": "NGC 7176", "text": "At bottom left is the elliptical NGC 7176. It seems to be interacting with NGC 7174, and astronomers suggest all three may merge."}]
};
