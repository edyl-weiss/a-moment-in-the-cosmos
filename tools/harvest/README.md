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
