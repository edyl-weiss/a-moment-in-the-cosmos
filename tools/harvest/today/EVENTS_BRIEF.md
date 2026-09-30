# "Today in astronomy": research brief

The site shows one astronomy photograph a day. A new section, "Today in astronomy", shows what
happened in astronomy on the visitor's calendar date (any year), and links to photographs from our
collection that show the same object or were taken with the same telescope.

You are researching ONE month. For each day of that month, find 1 to 3 well-documented events.

## What counts as an event

- Discovery or first observation of a named astronomical object (a galaxy, nebula, cluster, comet,
  supernova, planet, moon, dwarf planet), with the date it was actually observed or discovered.
- Launch, first light, or end of a major telescope or observatory, space telescope or astronomy
  mission (Hubble, Webb, Chandra, Spitzer, Gaia, VLT units, ALMA, Rubin, Gemini, Kepler, etc.).
- Notable astronomical events: famous supernovae, eclipses of historical importance, great comets,
  first detections (gravitational waves, first exoplanet around a Sun-like star), landmark images.
- Birth or death of a major astronomer, only when widely documented (Herschel, Messier, Hubble,
  Leavitt, Payne-Gaposchkin, Galileo, Kepler, Cannon, Rubin…).
- Crewed spaceflight milestones only if astronomical in nature (skip general space history).

Prefer events that connect to deep-sky photography (galaxies, nebulae, star clusters, telescopes),
because those can link to our photographs. Prefer variety across a month (not 20 comet discoveries).

## Verification (hard rules)

- Every event must be verified by FETCHING a source page with WebFetch and confirming the exact day,
  month and year on that page. Search results alone are not verification.
- Preferred sources: NASA, ESA, ESO, NOIRLab, STScI, observatory or university pages, IAU, museum
  pages, Encyclopaedia Britannica. Wikipedia is acceptable when it states the date clearly.
- If sources disagree on the date, or the date is only a month/year, skip the event.
- Dates are the calendar date in the source (don't convert time zones). For historical dates before
  1582, only include if the source gives the date explicitly; don't convert calendars yourself.
- If you cannot verify anything for a day, leave that day out. Never guess to fill a day.

## Linking to our photographs

`/home/claude/harvest/today/objects.json` lists every photograph in the collection: `id`, `cat`,
`title`, `object` (object name and constellation) and `telescope` (instrument/credit text). Search it
(with Python) for matches. Link a photo only when one of these is literally true:

- `"object"`: the photo shows the event's object (e.g. the event is Herschel discovering NGC 7331
  and the photo's object is NGC 7331). Check names and catalogue numbers carefully (M31 = NGC 224 =
  Andromeda Galaxy). Include every matching photo id, best first, up to 4.
- `"telescope"`: the event is about a telescope/observatory/mission and the photo was taken with it
  (e.g. Hubble's launch and a Hubble photo). Pick up to 3 of the best-known matching photos.
- `"site"`: the event is about an observatory site and the photo is a landscape taken there.

No link is fine. Never link on theme alone ("a nebula photo for a nebula event").

## Writing

- `text`: one or two plain sentences in your own words, past tense, starting with the subject, not
  the date (the page shows the year separately). Example: "William Herschel discovered the spiral
  galaxy NGC 7331 while sweeping the sky in Pegasus."
- No em dashes or en dashes as punctuation, no semicolons, no colons for effect, no rhetorical
  questions, no hype words (striking, remarkable, stunning, dramatic, cosmic, vibrant, iconic,
  legendary, groundbreaking, pivotal, milestone). Plain newspaper style.
- Only facts stated on your source page.

## Output

Write `/home/claude/harvest/today/events_MM.json` (MM = two-digit month) as a JSON array:

```json
[
  {"date": "11-13", "year": 1781, "text": "…", "source": {"title": "NASA: …", "url": "https://…"},
   "photos": [{"id": "h-heic0000a", "relation": "object"}]}
]
```

Sort by date then year. Save progress as you go (load, append, dump), so work is never lost. Keep
helper scripts in /tmp/claude-0/ev-MM/. Do not edit any other file.

Before finishing, validate: every entry has date/year/text/source.url, every photo id exists in
objects.json, relation is one of object/telescope/site, and no text contains — – ; ? or the hype words.
Report: days covered out of the month's length, events written, photos linked, and any days you
could not verify.
