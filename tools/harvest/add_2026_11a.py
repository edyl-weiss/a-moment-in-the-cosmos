"""November 2026: 27 photographs. 15 night skies (the category that runs out first) and 12 recent space images.
Run from the repo root:
    python3 tools/harvest/add_2026_11a.py
then tools/harvest/reschedule.py. Facts come from each source page (linked in `sources`); stories follow
WRITING_GUIDE.md.

Image sizes: the pages list each image's full size. ESO, ESA/Hubble, ESA/Webb and NOIRLab all make a
"publication" JPEG at most 4,000 pixels on its long side; where the full size is larger, that file is the
display copy (`pub`) and its size is the full size scaled to 4,000 on the long side. Where the full size is
4,000 or smaller (or no publication JPEG is offered), the full-size "large" JPEG is the display copy.
The mirror script (tools/images/mirror.mjs) downloads every file, so a wrong guess shows up there as a failure.

Left out: Webb's Red Spider Nebula and dwarf-galaxy pair (already in the collection), Hubble's 2026 Trifid
(the same release as the NASA Trifid image already here), and night shots taken at sunset or twilight.
"""
import json, math, os

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
COL = os.path.join(ROOT, 'src', 'data', 'collection')
BAND = 'source lists band only'
BASES = {'eso': 'https://cdn.eso.org/images', 'hubble': 'https://cdn.esahubble.org/archives/images',
         'webb': 'https://cdn.esawebb.org/archives/images', 'noirlab': 'https://storage.noirlab.edu/media/archives/images'}
PREFIX = {'eso': 'e-', 'hubble': 'h-', 'webb': 'w-', 'noirlab': 'n-'}
TEL = {'eso': 'vlt', 'hubble': 'hubble', 'webb': 'webb', 'noirlab': 'kittpeak'}

def img(org, iid, w, h, pubjpg=True):
    b = BASES[org]
    out = {'origW': w, 'origH': h, 'thumb': f'{b}/thumb300y/{iid}.jpg', 'screen': f'{b}/screen/{iid}.jpg'}
    if max(w, h) > 4000 and pubjpg:
        k = 4000 / max(w, h)
        out.update(pub=f'{b}/publicationjpg/{iid}.jpg', pubW=round(w * k), pubH=round(h * k), large=f'{b}/large/{iid}.jpg')
    else:
        out.update(pub=f'{b}/large/{iid}.jpg', pubW=w, pubH=h)
    return out

def behind(obs, inst, credit, processing='Not published.', technique='Not stated by the source (single frame, stack, mosaic or panorama unknown).'):
    return {'observatory': obs, 'instrument': inst, 'people': f'See full credit: {credit}',
            'exposure': 'Not published on the source page.', 'technique': technique, 'processing': processing}

def scale(fw, fh, dist):
    k = math.pi / (180 * 60) * dist
    f = lambda x: f'{x:.0f}' if x >= 10 else f'{x:.1f}'
    years = f'{dist / 1e6:g} million' if dist >= 1e6 else f'{dist:,}'
    return (f"Using the source’s listed field of view ({fw} × {fh} arcminutes) and its distance of about {years} light-years, "
            f"the frame spans roughly {f(fw * k)} × {f(fh * k)} light-years. Its light set out about {years} years before reaching the telescope.")

def ra_dec(ra, dec):
    h, m, s = (float(x) for x in ra.split())
    sign = -1 if dec.strip().startswith('-') else 1
    d, mi, se = (float(x) for x in dec.replace('-', '').replace('°', ' ').replace("'", ' ').replace('"', ' ').split())
    return round((h + m / 60 + s / 3600) * 15, 3), round(sign * (d + mi / 60 + se / 3600), 3)

POTW = {'eso': 'ESO Picture of the Week', 'noirlab': 'NOIRLab Image of the Week'}
def night(org, iid, w, h, title, date, credit, site, story, alt, explore, caption, eye, pubjpg=True, technique=None):
    page = f'https://www.eso.org/public/images/{iid}/' if org == 'eso' else f'https://noirlab.edu/public/images/{iid}/'
    return {'id': PREFIX[org] + iid, 'cat': 'night', 'org': org, 'tel': ['camera'], 'title': title, 'caption': caption,
            'releaseDate': date, 'celestial': f'Photograph taken at {site}', 'img': img(org, iid, w, h, pubjpg),
            'credit': credit, 'source': page,
            'recognition': {'kind': 'editorial', 'text': f'{POTW[org]} (an editorial selection, not an audience score).'},
            'story': story, 'scale': None,
            'understand': {'summary': f'A ground-based landscape photograph credited to {credit}. The source does not publish camera, exposure or color-processing details.', 'filters': [], 'eye': eye},
            'behind': behind(site, 'Camera photograph', credit, technique=technique or 'Not stated by the source (single frame, stack, mosaic or panorama unknown).'),
            'explore': explore, 'sources': [[f'{POTW[org].split(" Picture")[0].split(" Image")[0]} image page ({iid})', page]], 'alt': alt, 'sky': None}

LONG = 'A camera can gather light for longer than the eye, so the Milky Way looks brighter and more detailed here than it would to someone standing on site.'

NIGHT = [
  night('eso', 'potw2641a', 4110, 2740, 'Massive antenna, silent mirror', '12 October 2026', 'J. Rodrigues/ESO',
    'La Silla Observatory, Chile',
    ['The great dish of the Swedish-ESO Submillimetre Telescope, SEST, mirrors the starry sky in this night view of ESO’s La Silla Observatory in Chile’s Atacama Desert. Its reflective surface is 15 meters across, and here it is tinted by airglow, a faint natural light given off by atoms high in the atmosphere.',
     'When SEST saw first light in 1987, it was the only large submillimeter telescope in the Southern Hemisphere. It picked up light at wavelengths longer than visible light, which comes from the cold clouds of gas and dust where stars form. Signals that faint need a big collecting area to catch and sharpen, which is why telescopes like this are so large.',
     'José Rodrigues, a visiting astronomer and photographer, took the picture. He knew the dish was 15 meters wide before he arrived, but its size still amazed him. SEST is retired now, yet it still reflects one of the darkest night skies on Earth.'],
    'A huge telescope dish under a starry night sky, its surface reflecting a faint glow, with a person standing nearby for scale.',
    ['Airglow happens every night, everywhere on Earth: atoms in the upper atmosphere slowly release energy they absorbed from sunlight during the day. It is usually too faint to notice except at very dark sites like La Silla.'],
    'The retired Swedish-ESO Submillimetre Telescope under the night sky, La Silla Observatory, Chile', LONG),

  night('eso', 'potw2630a', 3936, 2624, 'Watching our cosmic neighborhood', '27 July 2026', 'ESO/N. Schafer',
    'Paranal Observatory, Chile',
    ['Three of the Auxiliary Telescopes at ESO’s Paranal Observatory stand beneath the band of the Milky Way and both Magellanic Clouds in this view from Chile’s Atacama Desert. The sky here is so dark that all of these can be seen with the unaided eye.',
     'The Large and Small Magellanic Clouds are irregular dwarf galaxies held by our galaxy’s gravity, about 160,000 and 200,000 light-years away. In this photograph, the Small Magellanic Cloud and the lower Milky Way are bathed in a green glow called airglow, very faint light given off by oxygen atoms high in the atmosphere.',
     'Four of these 1.8-meter telescopes feed light into the Very Large Telescope Interferometer, and each can roll along tracks to any of 30 observing stations. Working together, they act like one “virtual” telescope as big as the distance between them. Among their feats: the first close-up image of a star outside our galaxy, WOH G64, a red supergiant in the Large Magellanic Cloud.'],
    'Three small dome-shaped telescopes on a desert platform beneath the Milky Way, with two hazy patches of light, the Magellanic Clouds, and a green glow low in the sky.',
    ['Changing the spacing between the Auxiliary Telescopes changes how much detail the combined instrument can see, a little like adjusting the size of one enormous mirror.'],
    'The Milky Way and the Magellanic Clouds above three Auxiliary Telescopes, Paranal Observatory, Chile', LONG),

  night('noirlab', 'iotw2524a', 9765, 5312, 'Arcs and angles at Kitt Peak', '11 June 2025', 'KPNO/NOIRLab/NSF/AURA/P. Horálek (Institute of Physics in Opava)',
    'Kitt Peak National Observatory, Arizona',
    ['The graceful arc of the Milky Way meets the sharp angles of the McMath-Pierce Solar Telescope in this night view of Kitt Peak National Observatory, near Tucson, Arizona. The telescope stands 33 meters tall, and its 60-meter angled shaft continues on underground.',
     'The McMath-Pierce was once the largest solar telescope in the world. It worked with mirrors: the angled section sent sunlight down to a primary mirror 1.6 meters across. Now retired, it is being turned into an astronomy education center, Windows on the Universe, where visitors can explore research from Kitt Peak and observatories around the world, from optical and radio telescopes to gravitational-wave detectors.',
     'The photographer, Petr Horálek, is one of NOIRLab’s Audiovisual Ambassadors, and his picture captures the old telescope at a turning point, still pointed at the sky it spent decades studying.'],
    'The curving band of the Milky Way rising over a tall, angular white telescope structure on a mountaintop.',
    ['NOIRLab, the US National Science Foundation’s center for ground-based optical astronomy, runs Kitt Peak along with observatories in Chile and Hawai‘i. Its guiding motto is “Discovering Our Universe Together.”'],
    'The Milky Way arcing over the McMath-Pierce Solar Telescope, Kitt Peak National Observatory, Arizona', LONG),

  night('eso', 'potw2536a', 18448, 18448, 'Do look up!', '8 September 2025', 'M. Lefranc/ESO',
    'Paranal Observatory (Very Large Telescope), Chile',
    ['Glowing laser beams shoot up into the night from ESO’s Very Large Telescope in this fish-eye view of Cerro Paranal, deep in Chile’s Atacama Desert. French astrophotographer Martin Lefranc, who came with a group of astrophotographers in search of the darkest skies, said the sky above Paranal was “like a fever dream.”',
     'To capture the whole scene, he took 24 separate images and combined them into one round panorama, with the telescopes standing all around its edge.',
     'The lasers are not for show. One of the VLT’s Unit Telescopes fires them upward to make artificial stars about 90 kilometers above the ground. Watching how those “fake stars” twinkle tells the telescope how the air is churning, and a special deformable mirror then bends to cancel out the blur in real time. The technique, called adaptive optics, is crucial for sharp images from the ground, even if it makes the observatory look like a science-fiction set.'],
    'A round fish-eye view of the night sky ringed by large telescope domes, with orange laser beams reaching up from one of them toward the Milky Way.',
    ['Air turbulence is what makes stars twinkle. For a big telescope, that same twinkling blurs every image, so measuring it hundreds of times a second and correcting for it brings the view much closer to what a telescope in space would see.'],
    'A fish-eye panorama of the Very Large Telescope and its laser guide stars, Paranal Observatory, Chile', LONG,
    technique='A panorama combined from 24 images (source figure).'),

  night('noirlab', 'iotw2521a', 24076, 12074, 'A peaceful panorama on Maunakea', '21 May 2025', 'International Gemini Observatory/NOIRLab/NSF/AURA/P. Horálek (Institute of Physics in Opava)',
    'Maunakea, Hawai‘i',
    ['The glowing arch of the Milky Way spans this wide panorama from Maunakea in Hawai‘i, with Gemini North at the far right and the United Kingdom Infrared Telescope on the left. In the middle, the last pastel light of sunset fades on the horizon.',
     'Rising from the horizon and seeming to cut through the Milky Way is the zodiacal light, a faint glow of sunlight scattered off dust between the planets. The Milky Way is really a flat disk, and across a small patch of sky it looks straight; it only bends into an arch here because the picture covers so much of the sky at once.',
     'Gemini North is one half of the International Gemini Observatory, operated by NOIRLab. The photograph was taken during NOIRLab’s 2022 expedition to all of its observing sites, by Petr Horálek, one of its Audiovisual Ambassadors.'],
    'A wide panorama of a mountaintop at night, with telescope domes at both ends, the Milky Way arching across the sky and a faint cone of light rising from the horizon.',
    ['The zodiacal light is easiest to see from very dark sites after evening twilight or before dawn, rising along the path the Sun and planets follow across the sky.'],
    'The Milky Way and the zodiacal light over Gemini North and UKIRT, Maunakea, Hawai‘i', LONG),

  night('noirlab', 'iotw2514a', 5985, 3990, 'Cascading meteors over Kitt Peak', '2 April 2025', 'KPNO/NOIRLab/NSF/AURA/R. Sparks',
    'Kitt Peak National Observatory, Arizona',
    ['Bright streaks of the Geminid meteor shower rain down over the McMath-Pierce Solar Telescope at Kitt Peak National Observatory, with the Milky Way rising high overhead.',
     'The Geminids come every December, when Earth passes through a trail of debris left by the asteroid 3200 Phaethon. As the bits of debris hit the atmosphere, they burn up in bright flashes. Most major meteor showers come from comets, and the Geminids are one of only two that don’t.',
     'Asteroids are a theme on this mountain. Two of Kitt Peak’s telescopes, the University of Arizona’s 0.9-meter and 1.8-meter Spacewatch telescopes, are used to study them, tracking small Solar System bodies to learn how the Solar System has changed over time. The photographer, Rob Sparks, is one of NOIRLab’s Audiovisual Ambassadors.'],
    'Many bright meteor streaks across a starry sky above a tall, angular white telescope, with the Milky Way rising behind.',
    ['A meteor shower seems to come from one point in the sky, called its radiant. For the Geminids that point is in the constellation Gemini, which is how the shower got its name.'],
    'Geminid meteors and the Milky Way above the McMath-Pierce Solar Telescope, Kitt Peak, Arizona',
    'A camera can gather light for longer than the eye, and this picture likely gathers meteors that flashed at different moments; the source doesn’t say how it was made.'),

  night('eso', 'potw2443a', 5472, 3648, 'Comet Tsuchinshan-ATLAS meets the ESO Supernova', '21 October 2024', 'ESO/J. C. Muñoz-Mateos',
    'the ESO Supernova Planetarium & Visitor Centre, Garching bei München, Germany',
    ['A comet hangs in the evening sky above the ESO Supernova Planetarium & Visitor Centre at ESO’s headquarters near Munich, its tail streaming upward. This is Comet C/2023 A3 (Tsuchinshan-ATLAS), photographed in October 2024.',
     'The comet came from the Oort Cloud, a vast reservoir of icy bodies surrounding the Solar System. As it neared the Sun it warmed up and grew tails of dust and gas. It was first spotted in early 2023 by two observatories working independently, the Tsuchinshan observatory in China and an ATLAS telescope in South Africa, which is how it got its double name.',
     'It passed closest to the Sun in September 2024 and was brightest in early October, among the brightest comets of the past two decades. It could be seen with the unaided eye, though this image stacks several exposures to bring out its faint tail.'],
    'A comet with a long, faint tail rising from the horizon above a curved, modern building in a deep blue evening sky.',
    ['After its pass by the Sun, the comet began the long journey back out to the edge of the Solar System. Comets from the Oort Cloud can take thousands of years or more to return, if they return at all.'],
    'Comet C/2023 A3 (Tsuchinshan-ATLAS) above the ESO Supernova Planetarium, Garching, Germany',
    'The comet was visible to the unaided eye, but stacking several exposures brings out more of its faint tail than the eye would see.',
    technique='Several exposures stacked (source).'),

  night('eso', 'potw2510b', 20239, 19616, 'A planetary party portrait above Paranal', '10 March 2025', 'B. Haeussler/ESO',
    'Paranal Observatory, Chile',
    ['Planets parade across the sky above ESO’s Paranal Observatory in this fish-eye view from early February 2025. Along with the Moon, the Milky Way and comet C/2024 G3 (ATLAS), the picture holds Saturn, Venus, Jupiter and Mars, and even Neptune and Uranus, too faint to pick out easily.',
     'When several planets are up at once, you can often imagine a line through them. That is because the planets orbit the Sun in roughly the same flat plane, the ecliptic. In space they aren’t lined up at all, but now and then, every few years, many of them can be seen in the sky at the same time.',
     'The planets sit outside the band of the Milky Way, and the line through them crosses it at an angle. The ecliptic is tilted by about 60 degrees to the plane of our galaxy: if the Milky Way were laid flat on a table, the Solar System would stick out like a pin poked in at an odd angle.'],
    'A round fish-eye view of the night sky over an observatory, with the Milky Way, the Moon and several bright planets strung across it.',
    ['This is the version without labels; ESO also published one that names each planet. Moonlight brightens part of the horizon.'],
    'Planets, the Moon and the Milky Way above Paranal Observatory, Chile', LONG),

  night('noirlab', 'iotw2510a', 10846, 10576, 'Renewal and discovery at Kitt Peak', '5 March 2025', 'CTIO/NOIRLab/NSF/AURA/P. Horálek (Institute of Physics in Opava)',
    'Kitt Peak National Observatory, Arizona',
    ['The Milky Way rises over Kitt Peak National Observatory in Arizona, where few clouds, high altitude and strict limits on light pollution make the night sky ideal for stargazing. The 0.9-meter SARA Kitt Peak Telescope stands on the right, and the WIYN 3.5-meter Telescope can be seen in the distance on the left.',
     'Kitt Peak hosts the largest collection of optical telescopes in the Northern Hemisphere and is one of the leading sites for astronomical research. This view is a close-up from a wider panorama that shows more of the observatory’s telescopes, and it doubles as an image for planetarium domes.',
     'It was taken during NOIRLab’s 2022 expedition to all of its observing sites by Petr Horálek, one of NOIRLab’s Audiovisual Ambassadors, who has spent years photographing observatories under their skies.'],
    'The Milky Way rising over a small white telescope dome on the right, with a larger telescope building on a distant ridge at left.',
    ['Arizona’s dark-sky rules, which limit and shield outdoor lighting around the observatories, are part of why the Milky Way still looks like this from Kitt Peak, about an hour’s drive from Tucson.'],
    'The Milky Way above the SARA and WIYN telescopes, Kitt Peak National Observatory, Arizona', LONG),

  night('eso', 'potw2431a', 4240, 2832, 'A spectacle of cosmic dust from Paranal', '29 July 2024', 'D. Gasparri/ESO',
    'Paranal Observatory, Chile',
    ['A faint, bluish band of light climbs from the horizon beside one of the Very Large Telescope’s Unit Telescopes at ESO’s Paranal Observatory. This is the zodiacal light, sometimes called “false dawn” when it appears before sunrise.',
     'It lines up with the ecliptic, the plane in which Earth orbits the Sun. That plane is full of tiny grains of dust that scatter sunlight, and the scattered light makes the glow. The other planets orbit in nearly the same plane, so they often show up inside it: Venus is the brightest point here, and Mars is a faint reddish dot up and to its right.',
     'Many people have never seen the zodiacal light, because light pollution or even moonlight can wash it out. Fittingly, the telescope basking in this display of sunlight is named Antu, which means “the Sun” in Mapudungun, a language spoken in central-southern Chile.'],
    'A faint cone of bluish light rising from the horizon into a starry sky beside a large telescope building, with a bright point of light, Venus, inside the glow.',
    ['The Atacama Desert still has skies dark enough for sights like this, a heritage ESO describes as worth protecting.'],
    'The zodiacal light, Venus and Mars beside the Antu telescope, Paranal Observatory, Chile',
    'The zodiacal light is real and visible from very dark sites, but faint; a long exposure makes it much more obvious than it looks to the eye.'),

  night('noirlab', 'iotw2526a', 5330, 3553, 'A triangle of satellite flares near Gemini North', '25 June 2025', 'International Gemini Observatory/NOIRLab/NSF/AURA/J. Pollard',
    'Gemini North, Maunakea, Hawai‘i',
    ['Three bright flares of light form a triangle to the right of Gemini North in this view from near the summit of Maunakea in Hawai‘i, with the Milky Way behind. The flares are sunlight glinting off satellites.',
     'Observatories like Gemini North are built in remote places to escape light pollution, the glow of city and suburban lights. Here the telescope sits above layers of cloud that block the lights of the towns below. But satellite constellations are a different kind of artificial light, and remoteness can’t hide a telescope from them.',
     'This long-exposure photograph seems to show a clear sky, yet telescopes are typically about a billion times more sensitive than the human eye. Satellites that people never notice show up to them as bright streaks or a general brightening of the sky.'],
    'A large telescope dome at night with the Milky Way behind it and three bright points of light forming a triangle to its right.',
    ['Gemini North is one half of the International Gemini Observatory, operated by NOIRLab. NOIRLab works with satellite operators and other observatories on ways to protect dark skies.'],
    'Satellite flares and the Milky Way beside Gemini North, Maunakea, Hawai‘i', LONG),

  night('noirlab', 'iotw2442a', 19200, 8976, 'Time-domain astronomy at Cerro Tololo', '16 October 2024', 'CTIO/NOIRLab/NSF/AURA/P. Horálek (Institute of Physics in Opava), M. Kosari',
    'Cerro Tololo Inter-American Observatory, Chile',
    ['The Milky Way stretches across the sky above Cerro Tololo Inter-American Observatory in Chile in this wide panorama. Besides its biggest and best-known telescopes, Cerro Tololo hosts around 40 telescopes run by 11 tenant observatories and research projects.',
     'This view features several of them. On the left are three 1-meter telescopes of the Las Cumbres Observatory, with the “igloo” in the center housing one of its spectrographs, and on the right is the Planetary Defense 1.3-meter Telescope.',
     'Las Cumbres runs a network of telescopes spread around the globe, so it can keep watch on an object around the clock as Earth turns. That is essential for time-domain astronomy, the study of things in the sky that change over seconds, days or weeks rather than millions of years, such as supernovae and gamma-ray bursts.'],
    'A wide panorama of a mountaintop with several small white telescope domes under the arching Milky Way.',
    ['The photograph comes from NOIRLab’s 2022 expedition to all of its observing sites. Versions made for planetarium domes and 360-degree viewing are also available from NOIRLab.'],
    'The Milky Way above Las Cumbres Observatory telescopes, Cerro Tololo, Chile', LONG),

  night('noirlab', 'iotw2436a', 32000, 13835, 'SARA South at Cerro Tololo', '4 September 2024', 'CTIO/NOIRLab/NSF/AURA/P. Horálek (Institute of Physics in Opava)',
    'Cerro Tololo Inter-American Observatory, Chile',
    ['The Milky Way rises from the horizon and stretches across the sky above Cerro Tololo in Chile, while yellow, green and red airglow seems to fill what would otherwise be a black sky.',
     'The picture highlights one of the mountain’s roughly 40 telescopes: the SARA Cerro Tololo Telescope, run by the Southeastern Association for Research in Astronomy, a group of American universities. SARA also has telescopes in the Canary Islands and at Kitt Peak in Arizona, which give students and faculty at its member schools valuable time at the eyepiece.',
     'Only the Chilean site can see the southern sky, though. This telescope fills that gap, letting SARA’s observers and trainees explore the whole night sky.'],
    'A very wide panorama of a mountain observatory at night, the Milky Way rising from the horizon through colorful bands of yellow, green and red airglow.',
    ['Airglow’s colors come from different atoms and molecules high in the atmosphere, such as oxygen, which can glow green or red at different heights.'],
    'The Milky Way and airglow above the SARA telescope, Cerro Tololo, Chile', LONG),

  night('noirlab', 'iotw2444a', 15636, 15500, 'A stargazer’s view from Kitt Peak', '30 October 2024', 'KPNO/NOIRLab/NSF/AURA/P. Horálek (Institute of Physics in Opava)',
    'Kitt Peak National Observatory, Arizona',
    ['Most pictures of the Milky Way aim at its brightest, densest part, toward Sagittarius. For this one, the photographer turned the other way, toward Orion and its three-star belt, to capture a different stretch of our galaxy: the Orion-Cygnus Arm.',
     'The stars, clusters and nebulae in this arm, such as the red giant Aldebaran at center and the Orion Nebula at center right, have mattered to cultures all over the world, and they are rich places to study how stars live. Our own Solar System lies in this part of the Milky Way.',
     'Below this patch of sky sits the Visitor Center Roll Off Roof Observatory at Kitt Peak National Observatory. While most of Kitt Peak’s telescopes are devoted to research, this one is used only for outreach, so educators and the public can observe the sky from this excellent site.'],
    'A starry winter sky with Orion’s three-star belt and a faint band of the Milky Way above a small observatory building with a roll-off roof.',
    ['The photograph comes from NOIRLab’s 2022 expedition to all of its observing sites, by Petr Horálek, one of NOIRLab’s Audiovisual Ambassadors.'],
    'Orion and the Orion-Cygnus Arm of the Milky Way above the Visitor Center observatory, Kitt Peak, Arizona', LONG),

  night('eso', 'potw2642a', 3332, 4998, 'Observing the unpredictable', '19 October 2026', 'J. Rodrigues/ESO',
    'La Silla Observatory, Chile',
    ['An unusual-looking telescope stands under a star-filled sky with the Milky Way in this view from ESO’s La Silla Observatory in Chile. It is BlackGEM, one of three telescopes ESO hosts at La Silla, a joint project of research institutes in the Netherlands and Belgium that can be operated remotely from Radboud University.',
     'Violent events, such as mergers of neutron stars and black holes, send out ripples in space-time called gravitational waves. Detectors like LIGO and Virgo can sense them but struggle to tell exactly where in the sky they came from. BlackGEM is built to find the visible light from such events, quickly.',
     'Two black holes merging are “almost invisible.” But if at least one of the pair is a neutron star, some of its material escapes being swallowed, heats up and glows faintly. Once BlackGEM spots that glow, larger telescopes such as ESO’s Very Large Telescope can follow up in detail.'],
    'A compact, unusually shaped telescope under a starry sky with the Milky Way rising above it.',
    ['BlackGEM’s name comes from its job: hunting the visible “counterparts” of gravitational-wave events, often caused by black holes. Its telescopes are designed for fast, wide searches of the sky.'],
    'The BlackGEM telescopes under the Milky Way, La Silla Observatory, Chile', LONG),
]

def space(org, iid, cat, w, h, title, caption, date, credit, celestial, story, alt, explore, understand, obs, sky, sc, rec, pubjpg=True):
    base = {'webb': 'https://esawebb.org/images', 'hubble': 'https://esahubble.org/images', 'eso': 'https://www.eso.org/public/images'}[org]
    page = f'{base}/{iid}/'
    return {'id': PREFIX[org] + iid, 'cat': cat, 'org': org, 'tel': [TEL[org] if org != 'eso' else 'vista'], 'title': title, 'caption': caption,
            'releaseDate': date, 'celestial': celestial, 'img': img(org, iid, w, h, pubjpg), 'credit': credit, 'source': page,
            'recognition': {'kind': 'editorial', 'text': rec}, 'story': story, 'scale': sc, 'understand': understand,
            'behind': behind(obs, obs, credit, 'Colors assigned by filter, as listed.' if understand['filters'] and understand['filters'][0][1] != BAND else 'Not published.'),
            'explore': explore, 'sources': [[f'Image page ({iid})', page]], 'alt': alt, 'sky': sky}

HUB_UNDER = lambda bands, extra='': {'summary': f"Hubble’s cameras through {bands}. The color assigned to each filter isn’t published.{extra}", 'eye': 'Ultraviolet and near-infrared light are invisible to the eye, and the colors are assigned, so the eye would not see this palette.'}
PM = lambda kind, when: f'ESA/{kind} Picture of the Month, {when} (an editorial selection, not an audience score).'
PW = lambda when: f'ESA/Hubble Picture of the Week, {when} (an editorial selection, not an audience score).'
CLUSTER_UF = [['275 nm · Ultraviolet (Hubble WFC3)', BAND], ['336 nm · Optical U (Hubble WFC3)', BAND], ['438 nm · Optical B (Hubble WFC3)', BAND], ['606 nm · Optical V (Hubble ACS)', BAND], ['814 nm · Optical I (Hubble ACS)', BAND]]

SPACE = [
  space('webb', 'potm2610a', 'nebula', 9694, 6463, 'Stars brewing in N159', 'The star-forming region N159 in the Large Magellanic Cloud, imaged by the James Webb Space Telescope',
    '22 October 2026', 'ESA/Webb, NASA & CSA, E. Sabbi, M. Zamani (ESA/Webb); Acknowledgement: M. H. Özsaraç',
    'N159, LHA 120-N 159, Papillon Nebula · Large Magellanic Cloud · constellation Dorado · about 161,000 light-years away (source figure)',
    ['Smoky orange clouds, pale blue bubbles and dark red filaments fill this Webb view of N159, a turbulent star-forming region about 161,000 light-years away in the Large Magellanic Cloud, a small galaxy that orbits our own. At under three million years old, it is one of the youngest star-forming regions there.',
     'Cold clouds of molecular hydrogen are collapsing under gravity to make stars, and many of the newborns are massive and hot. Their ultraviolet light energizes the gas around them, which glows in the pale blue patches, while their winds carve ridges and hollow out cavities. The orange comes from carbon-based molecules. The dark red filaments are cool molecular hydrogen, the densest part of the nebula, which for now shields the newest stars from the harsh light around them.',
     'Zoom in and stars appear inside those filaments and inside orange pillars reaching into the blue bubbles. The bright spot on the left is the Papillon Nebula, a compact knot of glowing hydrogen.'],
    'Thick orange clouds and dark red filaments around pale blue cavities of glowing gas, scattered with bright stars, and a bright compact spot at left.',
    ['Webb found very faint stars here, under a tenth of the Sun’s mass, and could tell fully formed stars apart from young ones still wrapped in their birth clouds. The western part holds more of these young objects, packed more tightly, which suggests it is at an earlier stage of collapse.'],
    {'summary': "Webb's NIRCam in ten near-infrared filters, from 1.15 to 4.7 microns. Shorter wavelengths are shown in blue and cyan, glowing molecular hydrogen in green, carbon-based molecules in orange and the longest wavelengths in red.",
     'filters': [['1.15 μm · Infrared (Webb NIRCam)', 'blue'], ['1.4 μm · Infrared (Webb NIRCam)', 'blue'], ['1.87 μm · Infrared Paschen-alpha (Webb NIRCam)', 'cyan'], ['2.1 μm · Infrared (Webb NIRCam)', 'cyan'], ['2.12 μm · Infrared H₂ (Webb NIRCam)', 'green'], ['3.0 μm · Infrared (Webb NIRCam)', 'green'], ['3.35 μm · Infrared PAH (Webb NIRCam)', 'orange'], ['3.6 μm · Infrared (Webb NIRCam)', 'orange'], ['4.6 μm · Infrared CO (Webb NIRCam)', 'red'], ['4.7 μm · Infrared H₂ (Webb NIRCam)', 'red']],
     'eye': 'All of this is near-infrared light, which the eye can’t see, so every color here is assigned.'},
    'James Webb Space Telescope, NIRCam', dict(zip(('con', 'ra', 'dec'), ('Dor', *ra_dec('5 39 52.94', '-69 45 16.45')))),
    'The frame spans roughly 230 light-years, according to the release. Its light set out about 161,000 years before reaching the telescope.', PM('Webb', 'October 2026')),

  space('webb', 'potm2512a', 'star', 4125, 4175, 'Westerlund 2 through Webb’s eyes', 'The star cluster Westerlund 2 in the star-forming region Gum 29, imaged by the James Webb Space Telescope',
    '19 December 2025', 'ESA/Webb, NASA & CSA, V. Almendros-Abad, M. Guarcello, K. Monsch, and the EWOCS team',
    'Westerlund 2, Gum 29 · constellation Carina · about 20,000 light-years away (source figure)',
    ['Thousands of stars glitter above walls of glowing orange and red gas in this festive-looking Webb view. At the top shines Westerlund 2, a young cluster about 20,000 light-years away in Carina, the Keel, inside the star-forming region Gum 29.',
     'The cluster holds some of the hottest, brightest and most massive stars in the Milky Way, and their strong light shapes everything around them. Below and around them, the gas forms carved walls and knotted clouds, eroded and lit by the cluster’s radiation. Small, newly igniting stars are scattered throughout, some still wrapped in the gas and dust they formed from, while soft blue and pink tones mark thinner material between the denser clouds.',
     'For the first time, Webb has revealed the full population of brown dwarfs in this very massive young cluster, down to about 10 times the mass of Jupiter. It is also helping astronomers find several hundred stars with discs at different stages, clues to how planets form.'],
    'A bright cluster of young stars at top above sculpted orange and red clouds of gas, scattered with many small stars and soft blue and pink wisps.',
    ['Westerlund 2 also starred in Hubble’s 25th-anniversary image in 2015. Webb sees it in infrared light, which passes through much of the dust that hides young stars in visible light. The data come from Webb’s EWOCS survey of the Westerlund 1 and 2 clusters.'],
    {'summary': "Webb's NIRCam and MIRI in eleven infrared filters from 1.15 to 11 microns, shown from blue (shortest) through cyan, green and orange to red (longest).",
     'filters': [['1.15 μm · Infrared (Webb NIRCam)', 'blue'], ['1.5 μm · Infrared (Webb NIRCam)', 'blue'], ['1.62 μm · Infrared (Webb NIRCam)', 'cyan'], ['1.82 μm · Infrared (Webb NIRCam)', 'cyan'], ['2.0 μm · Infrared (Webb NIRCam)', 'green'], ['2.5 μm · Infrared (Webb NIRCam)', 'green'], ['2.77 μm · Infrared (Webb NIRCam)', 'green'], ['3.0 μm · Infrared (Webb NIRCam)', 'orange'], ['3.35 μm · Infrared PAH (Webb NIRCam)', 'red'], ['4.1 μm · Infrared (Webb NIRCam)', 'red'], ['11 μm · Infrared PAH (Webb MIRI)', 'red']],
     'eye': 'All of this is infrared light, which the eye can’t see, so every color here is assigned.'},
    'James Webb Space Telescope, NIRCam and MIRI', dict(zip(('con', 'ra', 'dec'), ('Car', *ra_dec('10 23 58.60', '-57 44 40.62')))),
    'The cluster itself spans roughly 6 to 13 light-years, according to the release. Its light set out about 20,000 years before reaching the telescope.', PM('Webb', 'December 2025')),

  space('hubble', 'potm2606a', 'star', 5121, 5147, 'The Chandelier Cluster, NGC 6723', 'The globular cluster NGC 6723, imaged by the Hubble Space Telescope',
    '26 June 2026', 'ESA/Hubble & NASA, A. Sarajedini, G. Piotto',
    'NGC 6723, the Chandelier Cluster · constellation Sagittarius · about 27,000 light-years away (source figure)',
    ['Like a chandelier, this ball of stars is full of lights, and each little bulb is a star. NGC 6723, sometimes nicknamed the Chandelier Cluster, is a globular cluster about 27,000 light-years away in Sagittarius, the Archer.',
     'Globular clusters are dense groups of tens of thousands to millions of stars held together by gravity, and astronomers know of more than 150 in the Milky Way. They hold some of our galaxy’s oldest stars, often more than 10 billion years old, and may be among its first structures, formed long before the thin disc where the Sun orbits.',
     'Astronomers once thought all of a cluster’s stars were born together. Hubble showed it is more complicated. Studying NGC 6723 in ultraviolet light, a team found signs of two bursts of star formation, the second within 634 million years of the first. For a cluster over 10 billion years old, that is a short gap.'],
    'A dense, round swarm of thousands of stars in white, blue and gold, thinning toward the edges of a dark field.',
    ['Hubble first imaged NGC 6723 in a survey of 65 Milky Way globular clusters, which has inspired several hundred research papers. A later program revisited many of them in ultraviolet light to pick out small chemical differences between stars.'],
    {**HUB_UNDER('five filters, from ultraviolet (275 nm) to near-infrared (814 nm)'), 'filters': CLUSTER_UF},
    'Hubble Space Telescope, WFC3 and ACS', dict(zip(('con', 'ra', 'dec'), ('Sgr', *ra_dec('18 59 33.45', '-36 37 55.67')))),
    scale(3.38, 3.40, 27000), PM('Hubble', 'June 2026'), pubjpg=False),

  space('hubble', 'potm2610a', 'star', 3887, 3427, 'Messier 30, a stellar instructor', 'The globular cluster Messier 30, imaged by the Hubble Space Telescope',
    '5 November 2026', 'ESA/Hubble & NASA, M. Libralato, G. Piotto, A. Sarajedini',
    'Messier 30, NGC 7099 · constellation Capricornus · about 27,500 light-years away (source figure)',
    ['A bright, crowded ball of stars fills this Hubble view of Messier 30, a globular cluster about 27,500 light-years away in Capricornus. Charles Messier cataloged it among the fuzzy objects that could be mistaken for comets.',
     'Globular clusters usually circle in a galaxy’s thin outer halo, much like insects around a light bulb. The Milky Way has at least 150, an estimated 11.5 to 13.5 billion years old. More than a century ago, Harlow Shapley used them to show that the Sun is not at our galaxy’s center, although his distances were off and he overestimated its size by about a factor of two.',
     'Because they are so old, clusters born in the Milky Way are time capsules of the young galaxy. But not all of them were born here. M30 and many others move against the galaxy’s rotation, which may mean they were captured long ago.'],
    'A dense, glittering cluster of stars, brightest at its core, with scattered blue, white and red stars around it.',
    ['Hubble has watched M30 for a long time. Its latest program measured how the cluster’s stars moved over 15 years, something only possible because of the telescope’s long life and sharp vision.'],
    {**HUB_UNDER('five filters, from ultraviolet (275 nm) to near-infrared (814 nm)'), 'filters': CLUSTER_UF},
    'Hubble Space Telescope, WFC3 and ACS', dict(zip(('con', 'ra', 'dec'), ('Cap', *ra_dec('21 40 22.17', '-23 10 48.03')))),
    scale(2.57, 2.26, 27500), PM('Hubble', 'November 2026'), pubjpg=False),

  space('eso', 'potw2637a', 'galaxy', 28871, 13063, 'A starry night in another galaxy', 'Stars at the center of the Large Magellanic Cloud, imaged in infrared by ESO’s VISTA telescope',
    '14 September 2026', 'ESO/M.-R. Cioni et al.',
    'Large Magellanic Cloud, center · constellations Dorado and Mensa',
    ['Millions of stars crowd this infrared view, and almost none of them belong to the Milky Way. ESO’s VISTA telescope zoomed into the center of the Large Magellanic Cloud, one of our neighboring galaxies, to show a starry night from another galaxy.',
     'Galactic centers are hard to observe: dust partly hides them, and their stars are packed so tightly that they blur together. VISTA’s high-resolution infrared camera sees through much of the dust. Over several years, a team led by Maria-Rosa Cioni of the Leibniz Institute for Astrophysics in Potsdam observed the cores of the Magellanic Clouds about 40 times.',
     'All those visits let the team measure the tiny motions of the stars, which is key to finding the exact center of each galaxy. By following stars whose brightness changes regularly, a way to gauge distance, astronomers hope to rebuild the three-dimensional shape of these galactic cores.'],
    'A dense field of countless stars of many colors, with patches of faint dusty glow.',
    ['The data are now public, so other astronomers can explore them too. Most of the Large Magellanic Cloud’s light comes from stars like these, too far away to see one by one without a large telescope. The sky position here is the Large Magellanic Cloud’s center, from standard catalogs; the release gives none.'],
    {'summary': "ESO's VISTA telescope, in near-infrared light. The release doesn't publish the filters or color mapping.", 'filters': [],
     'eye': 'This is near-infrared light, invisible to the eye, so the colors are assigned. To the eye, the Large Magellanic Cloud looks like a faint, detached patch of the Milky Way.'},
    'ESO VISTA telescope', {'con': 'Dor', 'ra': 80.894, 'dec': -69.756},
    None, 'ESO Picture of the Week, September 2026 (an editorial selection, not an audience score).'),

  space('hubble', 'heic2505f', 'nebula', 4073, 3994, 'Inside the Rosette Nebula', 'Part of the Rosette Nebula, imaged by the Hubble Space Telescope',
    '23 April 2025', 'NASA, ESA, STScI',
    'Rosette Nebula · constellation Monoceros · about 5,200 light-years away (source figure)',
    ['Dark clouds of hydrogen gas mixed with dust stand in silhouette across this Hubble close-up of the Rosette Nebula. The Rosette is a large star-forming region about 100 light-years across, some 5,200 light-years away. Hubble’s view covers just a small piece of it, about 4 light-years wide, roughly the distance from the Sun to its neighbor Alpha Centauri.',
     'The dark clouds are being worn away and shaped by fierce radiation from the cluster of big stars at the center of the nebula, outside this frame.',
     'At the upper right, a young star buried at the tip of a dark cloud is launching jets of plasma. Where they slam into the cold gas around it, they make a shock wave, which glows red. The other colors come from hydrogen, oxygen and nitrogen in the nebula.'],
    'Dark, wispy clouds of dust silhouetted against glowing gas, with a small red glow at upper right where a jet strikes the surrounding gas.',
    ['This picture was part of Hubble’s 35th-anniversary celebration in April 2025, which revisited favorite targets with new views.'],
    {**HUB_UNDER('six filters, including narrowband filters for oxygen, hydrogen and nitrogen', ' The caption says the colors come from hydrogen, oxygen and nitrogen.'),
     'filters': [['438 nm · Optical B (Hubble WFC3)', BAND], ['502 nm · Optical O III (Hubble WFC3)', BAND], ['555 nm · Optical V (Hubble WFC3)', BAND], ['656 nm · Optical H-alpha (Hubble WFC3)', BAND], ['658 nm · Optical N II (Hubble WFC3)', BAND], ['814 nm · Optical I (Hubble WFC3)', BAND]]},
    'Hubble Space Telescope, WFC3', dict(zip(('con', 'ra', 'dec'), ('Mon', *ra_dec('6 30 41.95', '4 59 52.27')))),
    'This view is about 4 light-years across, according to the release. Its light set out about 5,200 years before reaching the telescope.',
    'Released for Hubble’s 35th anniversary, April 2025 (an editorial selection, not an audience score).'),

  space('hubble', 'potm2607a', 'galaxy', 3984, 3826, 'A one-sided spiral, NGC 4654', 'The spiral galaxy NGC 4654, imaged by the Hubble Space Telescope',
    '24 July 2026', 'ESA/Hubble & NASA, D. Thilker, J. Lee and the PHANGS-HST Team',
    'NGC 4654 · Virgo Cluster · constellation Virgo · about 72 million light-years away (source figure)',
    ['One side of this spiral galaxy has a crisp, rounded edge, while its other side trails off. NGC 4654, about 72 million light-years away in Virgo, is being pushed and pulled by forces acting across whole galaxies.',
     'It lies in the Virgo Cluster, a crowded, massive cluster of galaxies filled with thin, hot gas. As NGC 4654 races through that gas, the pressure squeezes its leading edge and drags a long tail of its own gas out behind it, beyond the edge of this picture. Its stars are unevenly spread too: the leading arm is rich in stars and gas, while the opposite arm has noticeably few.',
     'That pressure alone probably isn’t enough to explain the lopsidedness. A fly-by of the neighboring galaxy NGC 4639 about 500 million years ago is thought to have stripped gas from one side too. Even so, NGC 4654 still forms nearly two Suns’ worth of stars each year, seen as bright pink bubbles.'],
    'A spiral galaxy with one sharp, rounded edge and a frayed opposite side, dotted with pink star-forming bubbles.',
    ['NGC 4654 is an intermediate spiral, between barred and unbarred spirals, with a weak bar at its core. The data come from programs connecting galaxies’ gas with their star formation.'],
    {**HUB_UNDER('six filters, from ultraviolet to near-infrared, including one for glowing hydrogen'),
     'filters': [['275 nm · Ultraviolet (Hubble WFC3)', BAND], ['336 nm · Optical U (Hubble WFC3)', BAND], ['438 nm · Optical B (Hubble WFC3)', BAND], ['555 nm · Optical V (Hubble WFC3)', BAND], ['657 nm · Optical H-alpha + N II (Hubble WFC3)', BAND], ['814 nm · Optical I (Hubble WFC3)', BAND]]},
    'Hubble Space Telescope, WFC3', dict(zip(('con', 'ra', 'dec'), ('Vir', *ra_dec('12 43 55.94', '13 7 49.24')))),
    scale(2.63, 2.53, 72_000_000), PM('Hubble', 'July 2026')),

  space('hubble', 'potw2516a', 'star', 4870, 4917, 'Messier 72 shines again', 'The globular cluster Messier 72, imaged by the Hubble Space Telescope',
    '21 April 2025', 'ESA/Hubble & NASA, A. Sarajedini, G. Piotto, M. Libralato',
    'Messier 72, NGC 6981 · constellation Aquarius · about 50,000 light-years away (source figure)',
    ['A round, tightly packed cluster of stars glitters in this new Hubble view of Messier 72, a globular cluster about 50,000 light-years away in Aquarius. The strong gravity binding its stars gives it a regular, round shape.',
     'M72 holds a special place in Hubble history: it was the very first ESA/Hubble Picture of the Week, released on 22 April 2010. Fifteen years and close to 800 pictures later, the team returned to it with new data and processing.',
     'The new colors come from adding ultraviolet observations to the earlier visible-light ones, and they pick out different groups of stars. Blue stars began more massive and now burn hotter after using up much of their hydrogen. The bright red ones are lower-mass stars that have swollen into red giants. Telling these groups apart helps show how globular clusters, and their galaxies, came together.'],
    'A dense, round cluster of white, blue and red stars on a dark background.',
    ['Pierre Méchain, a French astronomer who worked with Charles Messier, discovered M72 in 1780, the first of five clusters he found while helping Messier. It is one of the most distant clusters in Messier’s catalog. The 2010 version is also in this collection.'],
    {**HUB_UNDER('five filters, from ultraviolet (275 nm) to near-infrared (814 nm)'), 'filters': CLUSTER_UF},
    'Hubble Space Telescope, WFC3 and ACS', dict(zip(('con', 'ra', 'dec'), ('Aqr', *ra_dec('20 53 27.99', '-12 32 11.41')))),
    scale(3.24, 3.27, 50000), PW('April 2025'), pubjpg=False),

  space('hubble', 'potw2549a', 'galaxy', 4895, 4842, 'Markarian 178, marked by massive stars', 'The blue compact dwarf galaxy Markarian 178, imaged by the Hubble Space Telescope',
    '8 December 2025', 'ESA/Hubble & NASA, F. Annibali, S. Hong',
    'Markarian 178 · constellation Ursa Major · about 13 million light-years away (source figure)',
    ['A small blue galaxy with a reddish bright spot near its edge fills this Hubble view. Markarian 178 is a blue compact dwarf galaxy, much smaller than the Milky Way, about 13 million light-years away in Ursa Major, the Great Bear.',
     'Most of it looks blue because it is full of young, hot stars with little dust around them. The reddish region near its edge holds many rare Wolf-Rayet stars: massive stars shedding their outer layers in fierce winds, a phase that comes just before they become black holes or neutron stars and lasts only a few million years.',
     'So many Wolf-Rayet stars mean something set off a burst of star formation recently. The trigger isn’t obvious, because no nearby galaxy could have stirred up the gas. Astronomers think a smaller satellite galaxy did it, hinted at by faint features around Markarian 178 in deep images from the Large Binocular Telescope.'],
    'A small, irregular blue galaxy with a bright reddish knot near one edge, against a dark field with distant galaxies.',
    ['Markarian 178 is one of more than 1,500 Markarian galaxies, named for the Armenian astrophysicist Benjamin Markarian, who listed galaxies that were unexpectedly bright in ultraviolet light.'],
    {**HUB_UNDER('seven filters, including narrowband filters for hydrogen, oxygen and sulfur', ' The caption says glowing hydrogen and oxygen appear red.'),
     'filters': [['487 nm · Optical H-beta (Hubble WFC3)', BAND], ['502 nm · Optical O III (Hubble WFC3)', BAND], ['547 nm · Optical Strömgren y (Hubble WFC3)', BAND], ['606 nm · Optical V (Hubble ACS)', BAND], ['657 nm · Optical H-alpha + N II (Hubble WFC3)', BAND], ['673 nm · Optical S II (Hubble WFC3)', BAND], ['814 nm · Optical I (Hubble ACS, WFC3)', BAND]]},
    'Hubble Space Telescope, WFC3 and ACS', dict(zip(('con', 'ra', 'dec'), ('UMa', *ra_dec('11 33 30.07', '49 14 13.76')))),
    scale(3.27, 3.23, 13_000_000), PW('December 2025')),

  space('hubble', 'potm2604a', 'galaxy', 4182, 3859, 'NGC 3137, a starry spiral', 'The spiral galaxy NGC 3137, imaged by the Hubble Space Telescope',
    '30 April 2026', 'ESA/Hubble & NASA, D. Thilker and the PHANGS-HST Team',
    'NGC 3137 · NGC 3175 group · constellation Antlia · about 53 million light-years away (source figure)',
    ['Loose, feathery spiral arms dotted with star clusters sweep around the dusty center of NGC 3137, a spiral galaxy about 53 million light-years away in Antlia, the Air Pump. We see it steeply tilted, which gives its arms their distinctive look.',
     'The clusters are the stars of the show: groups of bright blue stars and glowing red gas clouds, the red marking hot young stars still surrounded by the nebulae they were born in. At the center, ringed by fine dusty clouds, sits a black hole estimated at 60 million times the Sun’s mass.',
     'NGC 3137 travels with a group of galaxies thought to resemble our own Local Group. Like the Milky Way and Andromeda, the group has two large spirals, NGC 3137 and NGC 3175, plus smaller dwarf galaxies; researchers have found more than 500 candidates. Studying it may help explain our own neighborhood.'],
    'A tilted spiral galaxy with loose, feathery arms sprinkled with blue star clusters and red glowing clouds around a dusty core.',
    ['The image combines six color bands from a Hubble program studying star clusters in 55 nearby galaxies, part of the PHANGS project, which pairs Hubble with Webb and the ALMA radio telescopes.'],
    {**HUB_UNDER('six filters, from ultraviolet to near-infrared, including one for glowing hydrogen'),
     'filters': [['275 nm · Ultraviolet (Hubble WFC3)', BAND], ['336 nm · Optical U (Hubble WFC3)', BAND], ['438 nm · Optical B (Hubble WFC3)', BAND], ['555 nm · Optical V (Hubble WFC3)', BAND], ['657 nm · Optical H-alpha + N II (Hubble WFC3)', BAND], ['814 nm · Optical I (Hubble WFC3)', BAND]]},
    'Hubble Space Telescope, WFC3', dict(zip(('con', 'ra', 'dec'), ('Ant', *ra_dec('10 9 7.40', '-29 3 50.14')))),
    scale(2.76, 2.55, 53_000_000), PM('Hubble', 'April 2026')),

  space('hubble', 'potw2536a', 'star', 2831, 1735, 'A cloudy cluster in N11', 'A young star cluster and dusty clouds in the Large Magellanic Cloud, imaged by the Hubble Space Telescope',
    '8 September 2025', 'ESA/Hubble & NASA, C. Murray, J. Maíz Apellániz',
    'N11 · Large Magellanic Cloud · constellation Dorado · about 160,000 light-years away (source figure)',
    ['Bright young stars light up clouds of gas and sculpt clumps of dust in this Hubble view of part of N11, the second-largest star-forming region in the Large Magellanic Cloud. That galaxy lies about 160,000 light-years away and is the largest of the dozens of small galaxies orbiting the Milky Way, with 10 to 20 percent of its mass.',
     'The young stars’ powerful ultraviolet light shapes the clouds around them. In stellar nurseries like this one, gas clouds gather and collapse to form new stars.',
     'The image combines observations made about 20 years apart. The first, from 2002 and 2003, used the then newly installed Advanced Camera for Surveys to catalog every star in this young cluster, from a tenth of the Sun’s mass to 100 times it, something not done before. The second, from Wide Field Camera 3, focused on the dusty clouds for a new look at cosmic dust.'],
    'A cluster of bright young stars among glowing clouds of gas and dark clumps of dust.',
    ['The Large Magellanic Cloud’s biggest star factory is the Tarantula Nebula, a frequent Hubble target. Pairing data from two cameras two decades apart is possible because Hubble has been working for so long.'],
    {**HUB_UNDER('three filters: blue, green and near-infrared'), 'filters': [['435 nm · Optical B (Hubble ACS)', BAND], ['475 nm · Optical g (Hubble WFC3)', BAND], ['814 nm · Optical I (Hubble WFC3)', BAND]]},
    'Hubble Space Telescope, ACS and WFC3', dict(zip(('con', 'ra', 'dec'), ('Dor', *ra_dec('4 56 58.05', '-66 24 57.44')))),
    scale(2.22, 1.36, 160000), PW('September 2025'), pubjpg=False),

  space('hubble', 'potw2526a', 'nebula', 3644, 3880, 'The young stars of Taurus', 'The reflection nebula GN 04.32.8 in the Taurus Molecular Cloud, imaged by the Hubble Space Telescope',
    '30 June 2025', 'ESA/Hubble & NASA, G. Duchêne',
    'GN 04.32.8, HP Tau · Taurus Molecular Cloud · constellation Taurus · about 480 light-years away (source figure)',
    ['A soft blue cloud glows around three bright stars in this Hubble view. GN 04.32.8 is a reflection nebula: a cloud of dust that makes no light of its own, but scatters the light of nearby stars. Because of how that scattering works, many reflection nebulae, this one included, look blue.',
     'It is a small part of the Taurus Molecular Cloud, a stellar nursery about 480 light-years away and one of the best places to study stars as they form. The star at the very center, V1025 Tauri, does most of the lighting. Another of the three, HP Tauri, is a T Tauri star, a young, energetic, turbulent star early in its life. The trio is believed to be bound together as a triple system.',
     'Just left of center, below the clouds, sits a small, flattened orange spot crossed by a dark line. It is a newborn star hidden behind its disc, which we see edge-on.'],
    'A glowing blue cloud around three bright stars, with a small, flattened orange spot crossed by a dark line just left of center.',
    ['Edge-on discs like that one are excellent targets: astronomers are using Hubble to study it in detail, hoping to learn what kinds of planets could form in similar discs.'],
    {**HUB_UNDER('two filters, in visible and near-infrared light'), 'filters': [['606 nm · Optical V (Hubble WFC3)', BAND], ['814 nm · Optical I (Hubble WFC3)', BAND]]},
    'Hubble Space Telescope, WFC3', dict(zip(('con', 'ra', 'dec'), ('Tau', *ra_dec('4 35 54.77', '22 54 16.49')))),
    scale(2.41, 2.57, 480), PW('June 2025'), pubjpg=False),
]

def big_enough(w, h):
    long, short = max(w, h), min(w, h)
    return short >= 1440 if long / short <= 1.05 else long >= 1920 and short >= 1080

def main():
    idx_path = os.path.join(COL, 'index.json')
    idx = json.load(open(idx_path, encoding='utf-8'))
    by_id = {e['id']: i for i, e in enumerate(idx)}
    for r in NIGHT + SPACE:
        r = dict(r)
        assert big_enough(r['img']['pubW'], r['img']['pubH']), r['id']
        tel = r.pop('tel')
        words = sum(len(p.split()) for p in r['story'])
        assert 110 <= words <= 190, (r['id'], words)
        sky = r.pop('sky')
        rec = {'captureDate': None, 'captureShort': None, 'labels': [], **r}
        if sky: rec['sky'] = sky
        json.dump(rec, open(os.path.join(COL, 'photos', f"{rec['id']}.json"), 'w', encoding='utf-8'), ensure_ascii=False)
        entry = {'id': rec['id'], 'cat': rec['cat'], 'org': rec['org'], 'title': rec['title'], 'thumb': rec['img']['thumb'],
                 'y': rec['releaseDate'][-4:], 'q': f"{rec['celestial']} {rec['caption']}", 'tel': tel}
        if sky: entry.update(con=sky['con'], ra=sky['ra'], dec=sky['dec'])
        if entry['id'] in by_id: idx[by_id[entry['id']]] = entry
        else: idx.append(entry)
        print(f"{rec['id']}: {words} words, display {rec['img']['pubW']}×{rec['img']['pubH']}")
    json.dump(idx, open(idx_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

if __name__ == '__main__':
    main()
