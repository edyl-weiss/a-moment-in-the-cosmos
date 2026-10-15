# Serving the photographs from your own site

The site links to each observatory's copy of a photograph by default. These steps copy every photograph into a
Cloudflare R2 bucket and serve them from `images.amomentinthecosmos.com` instead. Photographs that haven't been
copied yet keep loading from the observatory, so nothing breaks partway through.

## 1. Create the bucket (Cloudflare dashboard, once)

1. **R2 Object Storage → Create bucket.** Name it `cosmos-images`.
2. In the bucket: **Settings → Custom Domains → Connect Domain** → `images.amomentinthecosmos.com`.
3. **Settings → CORS policy → Add/Edit**, paste:

   ```json
   [{ "AllowedOrigins": ["https://amomentinthecosmos.com", "https://www.amomentinthecosmos.com", "http://localhost:4173"],
      "AllowedMethods": ["GET", "HEAD"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 86400 }]
   ```
   (The Download menu fetches images directly, which needs this.)
4. **R2 → Manage R2 API Tokens → Create API token**: permission *Object Read & Write*, limited to `cosmos-images`.
   Keep the page open for the next step.

## 2. Add your keys (your computer only)

Create `tools/images/.env` (it is git-ignored; never paste these anywhere else). On Windows, from the project
folder in PowerShell: `notepad tools\images\.env` (Notepad offers to create it). A file saved as `.env.txt` works too.

```
R2_ACCOUNT_ID=your account id (shown on the R2 overview page)
R2_ACCESS_KEY_ID=…
R2_SECRET_ACCESS_KEY=…
R2_BUCKET=cosmos-images
```

## 3. Copy the photographs

From the project folder:

```
node tools/images/mirror.mjs --limit=8      # quick trial: 8 files
node tools/images/mirror.mjs                # everything (~5,700 files, ~30 GB, roughly 1–3 hours)
```

Add `--skip-large` to leave the full-resolution files (used by Immersive view's "full resolution") at the
observatories: about 6 GB instead of 30 GB, which fits in R2's free 10 GB.

It's safe to stop and run again; finished files are skipped. Progress is saved to `tools/images/manifest.json`.
Downloads are cached in `tools/images/cache/` (git-ignored); delete that folder afterwards to free the space.

## 4. Switch the site over

1. Commit `tools/images/manifest.json`.
2. In Vercel → Project → Settings → Environment Variables, add `IMAGE_HOST` = `https://images.amomentinthecosmos.com`.
3. Redeploy. The build log ends with "… served from https://images.amomentinthecosmos.com".

When new photographs are added to the collection, run step 3 again and redeploy.

## Cost

R2 has no bandwidth charges. Storage is free up to 10 GB, then about $0.015 per GB a month
(roughly $0.30 a month for the full 30 GB).
