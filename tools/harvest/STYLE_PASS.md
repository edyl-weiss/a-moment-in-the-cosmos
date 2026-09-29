# Style pass: remove AI-writing tropes from the photo descriptions

You are copy-editing finished, fact-checked astronomy captions. This is a STYLE pass only.
The facts are already verified. Do not add, remove or change any fact, number, name, hedge
("about", "thought to", "may") or source attribution ("according to ESO"). Keep each record's
meaning exactly. Keep British/US spelling as it is in each record.

Fields to edit in each record: `story` (list of paragraphs), `explore` (list), `understand.summary`,
`understand.eye`, `alt`, `scaleExtra`, `caption`. Do not touch `id`, `captureDate`, `flags`.

## Remove these tropes

1. **Dashes used as punctuation**: em dashes (—), spaced en dashes ( – ), double hyphens. Rewrite
   with a full stop, comma or parentheses. (Hyphens in compound words and number ranges like
   "6–13" are fine.)
2. **Semicolons** joining clauses. Split into two sentences or use "and"/"but". Aim for none.
3. **Colon reveals**: "X: Y" used for drama or to introduce a clause ("Look closer: the arms…",
   "The answer is simple: …"). Rewrite as plain sentences. A colon introducing a genuine list is
   fine but prefer a normal sentence.
4. **Rhetorical questions** ("Why is the galaxy so uneven?"). State it plainly.
5. **Stock phrases and inflated words**: "not just … but", "not only … but also", "In other words",
   "a reminder that", "testament to", "showcase", "vibrant", "striking(ly)", "dramatic(ally)",
   "remarkable/remarkably", "stunning", "breathtaking", "tapestry", "jewel", "dance/dancing",
   "symphony", "cosmic" as decoration, "serves as" (use "is"), "boasts", "nestled", "offers a
   glimpse/window", "a sense of", "truly", "quite literally".
6. **Formulaic openers and closers**: "Look at…", "Here,", "Imagine…", "Yet," to open a sentence,
   "It is worth noting", "Taken together", summary closers that restate the paragraph, and
   sentences that end with a moral or wow line.
7. **Reflexive triplets** ("gas, dust and stars" used as rhythm rather than content). Keep a
   list only when all three items are real content from the source.
8. **Overused frame references**: "in this view", "in this image", "seen here", "this picture
   shows". One per story at most; vary with the object's name.

Write the way a good science editor at a newspaper writes: plain, specific, varied sentence
length, active verbs, no flourish. Don't make it choppy. Merge short sentences where natural.

## Constraints (hard)

- `story` must stay 120–180 words in total. Keep 2–3 paragraphs.
- Do not introduce any number that isn't already in that record.
- Do not copy 9 or more consecutive words from the source caption (the packet's `sourceCaption`).
- Keep valid JSON and the same record order. Edit with a short Python script (load → modify → dump
  with `ensure_ascii=False, indent=1`). Never retype a whole file by hand.
- Only edit the files you were assigned. Put helper scripts in your own /tmp/claude-0/<your-tag>/
  folder; other agents are working in the same directory at the same time.

## Check

After editing each batch run `cd /home/claude/harvest && python3 check_batch.py NN` and fix any new
problems. A number the checker misses only because the source puts a full stop right after it was
already acceptable; don't chase those. Then run this trope counter on your file and get the counts
to zero (or explain any that must stay, e.g. an official name that contains a dash):

    python3 - <<'X'
    import json,re,sys
    f='stories/batchNN.json'
    pat=re.compile(r'—|\s–\s|--|;|\?|\b(not just|not only|In other words|a reminder|testament|showcas|vibrant|striking|dramatic|remarkabl|stunning|breathtak|tapestr|jewel|serves as|boasts|nestled|truly|literally)\b|^(Look|Here,|Imagine|Yet)\b',re.I|re.M)
    for s in json.load(open(f)):
        t='\n'.join(s['story']+s.get('explore',[])+[s['understand']['summary'],s['understand']['eye'],s.get('alt') or '',s.get('caption') or '',s.get('scaleExtra') or ''])
        hits=pat.findall(t)
        if hits: print(s['id'],len(hits))
    X
