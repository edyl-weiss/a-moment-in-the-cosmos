# Writing guide: A Moment in the Cosmos

You are writing the text that appears beside one astronomy photograph per day on a public website.
Visitors are curious non-specialists. Each record in your packet file is one photograph from
ESA/Hubble, ESA/Webb, ESO or NSF NOIRLab (Gemini, Kitt Peak, Cerro Tololo, Rubin and others). The packet gives the official source caption (`sourceCaption`),
an optional official image description (`imageDescription`), and metadata.

## Hard rules (a record that breaks one is wrong)

1. **Facts come only from the packet.** Every factual claim (names, distances, sizes, ages, dates,
   instruments, counts, what an object is doing) must be supported by the record's `sourceCaption`,
   `imageDescription` or metadata fields. You may add plain definitional context that is textbook-standard
   and number-free (e.g. "a globular cluster is a dense ball of old stars"), but **never add a number,
   date, name, record or superlative that is not in the packet.** If the caption is vague, be vague.
2. **Don't invent what the picture looks like.** Open with what the visitor can see, but only describe
   colours, shapes and positions that the caption or image description states. If they give no visual
   detail, describe the subject plainly ("This Hubble portrait shows the barred spiral galaxy NGC 1672…")
   rather than inventing appearance.
3. **Paraphrase; never copy.** No run of 9 or more consecutive words may match the source caption.
   Rewrite in your own sentences.
4. **Qualify uncertainty.** Keep "estimated", "about", "thought to", "may" wherever the source hedges.
   Don't turn a hypothesis into a fact.
5. **No clichés or hype.** Avoid "breathtaking", "mind-blowing", "cosmic ballet", "celestial dance",
   "tapestry", "jewel box", "stunning", exclamation marks. Warm, clear, specific.
6. **Night-sky photographs** (`cat: "night"`): these are landscape photos, usually at an observatory site. Name only
   sky features the caption names (e.g. "the Large Magellanic Cloud"). Don't identify stars or
   constellations yourself. Don't guess exposure settings or dates.

## Output: one JSON object per record

```json
{
  "id": "h-heic0601a",
  "caption": "The Orion Nebula, imaged by the Hubble Space Telescope",
  "captureDate": null,
  "story": ["paragraph 1", "paragraph 2", "paragraph 3 (optional)"],
  "explore": ["1–2 short paragraphs of extra context from the caption not used in the story"],
  "understand": {
    "summary": "1–2 sentences: which telescope/instrument and which kind of light (visible, infrared, etc.). If the packet's filters table lists colours, say what the colours represent; otherwise say the colour mapping isn't published.",
    "eye": "1 sentence: how this differs from what an eye would see — only claims supported by the packet or textbook-standard (infrared is invisible to the eye; long camera exposures gather more light than the eye)."
  },
  "scaleExtra": null,
  "alt": "One sentence describing the image for screen-reader users, using only visual details the caption states.",
  "flags": []
}
```

Field rules:
- `caption`: format `"[Object or scene], imaged by [telescope/observatory]"` for space objects, or
  `"[Scene], [site]"` for night-sky photos. Use the telescope named in the packet (`telescopes`,
  credit or caption). No dates here.
- `captureDate`: a string ONLY if the caption explicitly states when the observations/photo were taken
  (e.g. "taken in January 2005"). Otherwise `null`. A release date is NOT a capture date.
- `story`: **120–180 words total** across 2–3 paragraphs. Paragraph 1 starts with what the visitor sees,
  then what it is; later paragraphs say why it's interesting (structure, physics, what the instrument
  reveals). Count carefully.
- `explore`: 1–2 paragraphs, 30–90 words total, extra caption facts. Empty array if nothing left.
- `scaleExtra`: `null`, unless the packet has NO `distance` AND the caption states a physical size or
  distance — then one sentence restating that verified figure (e.g. "The nebula is about four light-years
  across, according to ESO."). Never compute new numbers.
- `flags`: add a short string if something looks wrong: `"illustration?"` (the caption suggests an
  artist's impression, simulation or diagram), `"annotated"`, `"not a sky photo"`, `"caption too thin"`.

## Example (a finished record, for tone)

"Two sweeping arms curl out from a yellowish core, laced with dark dust and studded with pink and blue
knots. At the tip of one arm glows a smaller, yellowish galaxy. This is the Whirlpool Galaxy, M51, a
classic grand-design spiral, with its companion NGC 5195.

The arms are star-formation factories. The assembly line runs from dark clouds of gas on the arms' inner
edges, to pink star-forming regions, to brilliant blue clusters of young stars along the outer edges.

NGC 5195 looks as if it is tugging on the arm, but Hubble's view shows it passing behind the Whirlpool,
as it has for hundreds of millions of years. Some astronomers think its gravity raises waves in the
larger galaxy's disc that squeeze gas and trigger that star birth — an interpretation, not a settled fact."

## Checking your work

Run `python3 check_batch.py NN` (NN = your two-digit batch number) from `/home/claude/harvest`.
It reports missing records, word counts outside 120–180, copied 9-word runs, and numbers not found
in the packet. Fix every reported problem and re-run until it reports `TOTAL problems: 0`
(a number flagged only because you spelled it differently from the source, e.g. "four" vs "4", is fine
to leave if the fact is correct — but prefer matching the source's form).
