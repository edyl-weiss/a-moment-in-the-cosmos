# How the collection was built

Not part of the site build. These scripts record how `src/data/collection/` was produced so it can
be extended the same way.

1. **Crawl** (in a browser tab on each source site, same-origin fetch): list the ESA/Hubble, ESA/Webb
   and ESO image-archive categories, then parse each candidate's image page (credit, caption, type,
   distance, field of view, filters, download sizes). Output: `hubble.json`, `webb.json`, `eso.json`.
2. **Select** (`select.py`, `rank.py`): keep real observations and ESO night-sky photographs, drop
   illustrations/charts/collages/DSS images, require ≥1920×1080 (≥1440² square) for the displayed JPEG,
   rank by published Top-100 membership, release type, resolution and caption depth, balance categories,
   one image per release.
3. **Review by eye**: every candidate thumbnail was inspected on contact sheets; rejects are in
   `rejects.txt`, accepted backfills in `backfill_keep.txt` / `night2_keep.txt`.
4. **Records** (`build_records.py`): structured metadata; scale facts computed only from the source's own
   field of view × distance.
5. **Stories**: written from each source caption following `WRITING_GUIDE.md`, then independently
   fact-checked against the same caption; `check_batch.py` enforces length, no copied 9-word runs and no
   numbers absent from the source.
6. **Export** (`export_collection.py`): writes `src/data/collection/` and appends new photos to the end of
   `src/data/schedule.js` (append-only, so past days in the archive never change).

## Re-running the export

`data/` holds the structured records (`records.json`), the raw crawl fields the exporter still reads
(`final2.json`) and the fact-checked stories (`stories/`). From this folder:

    cd data && python3 ../export_collection.py ../../..

Export policy: a story is published only if it is 110–190 words and carries no hard flag. Soft flags
("caption too thin", minor caption/metadata distance or constellation disagreements, composite or
time-lapse frames) are kept; where the source disagrees with itself on distance or constellation, the
site shows neither figure and drops the computed scale fact. Hard flags (illustrations, annotated or
overlay images, duplicates, instrument/telescope/site mismatches, not a sky photograph) are excluded.

## NSF NOIRLab additions (256 photographs)

`noirlab/`: the same pipeline for noirlab.edu (CC BY 4.0). The archive sits behind a bot challenge, so pages
were read one at a time at a slow pace in a real browser rather than fetched in bulk. `select_noirlab.py`
filters the crawl, every candidate was checked by eye on contact sheets, `finalize.py` keeps one photo
per object with category caps, and `build_records_noirlab.py` writes `data/records_noirlab.json`.
Stories are `data/stories/batch10–12.json`, written and independently fact-checked like the rest.
Exporter ids are prefixed by source: `h-`, `w-`, `e-`, `n-`.

## "On this day" (researched events + gap-fill photographs)

`today/`: `events_01…12.json` hold 493 astronomy events for 357 calendar days, each checked against a
fetched source page (brief: `EVENTS_BRIEF.md`). The exporter merges them with every photograph's
release date into `src/data/onthisday.json`.

To give each calendar day at least three photographs, the full ESA/Hubble and ESA/Webb archives, the
ESO archive (13,292 image pages), ESO Pictures of the Week, NOIRLab Images of the Week, and NOIRLab
press releases and announcements were searched for images released on under-served dates. Candidates
were reviewed by eye on contact sheets (same rules as above: night photos must show a night or twilight
sky; no daytime scenes, interiors, people, fisheye or 360° frames, annotated or side-by-side images).
The picks are `chosen.json`, `chosen4.json` and `chosen5.json`; raw fields are in `data/final3–5.json`,
records in `data/records_extra*.json` / `data/records_noirlab2–3.json`, and stories in
`data/stories/batch13–17.json` (each batch written, then independently fact-checked).

Eleven dates still have fewer than three photographs published on them, because none of the four sources
released a usable photograph on those dates in any year (26 December has none at all). On those dates the
page adds the nearest days' photographs, each labelled with its real publication date.

## NASA (fifth source: Hubble and Webb releases on science.nasa.gov)

hubblesite.org and webbtelescope.org now redirect to science.nasa.gov. `nasa/` holds that harvest: the
Hubble and Webb image galleries were listed through the site's own content-list endpoint (5,351 entries),
filtered (no illustrations, diagrams, solar-system or annotated images; at least 1,920 × 1,080), checked
against the collection so joint NASA/ESA releases aren't duplicated, then reviewed by eye on contact sheets
(`rank.py`, `picks.json`). Each asset page and its release article were read for the caption, object metadata,
colour assignments and credit (`fields.json`, `parsed.json`), and `build_records_nasa.py` writes
`data/records_nasa.json`. Images are served by NASA's image service at sizes no larger than the original.
Stories are `data/stories/batch18–21.json`, written and independently fact-checked. NASA media are not under
US copyright; NASA asks to be credited as the source.

## Comparisons and tours

`compare/`: the 38 ESA/Webb "Slider Tool" pages were read for their two aligned images, sizes and credits;
26 photographs in the collection now open one (`new_comparisons.json`, merged into `src/data/comparisons.js`).
Tours for 11 more photographs were added by hand to `src/data/tours.js`: each stop is a position the photo's
own caption states, read off the published image on a 10% grid.
