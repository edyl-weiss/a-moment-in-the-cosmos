// Copies every photograph the site shows into your own Cloudflare R2 bucket, so the site can serve them
// from images.amomentinthecosmos.com instead of linking to each observatory. Run it on your own computer,
// from the project folder:
//
//     node tools/images/mirror.mjs              download, then upload
//     node tools/images/mirror.mjs --download   download only (no R2 keys needed)
//     node tools/images/mirror.mjs --limit=8    a quick trial with the first 8 files
//     node tools/images/mirror.mjs --skip-large leave the full-resolution files at the observatories
//
// R2 keys are read from tools/images/.env (never committed; see tools/images/README.md):
//     R2_ACCOUNT_ID=…  R2_ACCESS_KEY_ID=…  R2_SECRET_ACCESS_KEY=…  R2_BUCKET=cosmos-images
//
// Safe to stop and run again: files already downloaded or uploaded are skipped. Every upload is recorded in
// tools/images/manifest.json, which the build reads to point the site at the copies. No dependencies.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash, createHmac } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const CACHE = join(HERE, 'cache');
const MANIFEST = join(HERE, 'manifest.json');
// --skip-large leaves the biggest files (Immersive view's full resolution) at the observatories: ~6 GB instead of ~30 GB
const VARIANTS = process.argv.includes('--skip-large') ? ['thumb', 'screen', 'pub'] : ['thumb', 'screen', 'pub', 'large'];
const DOWNLOAD_ONLY = process.argv.includes('--download');
const LIMIT = Number((process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || Infinity;   // try a few first: --limit=8
const WORKERS = 6;

// ---------- settings ----------
const env = { ...process.env };
// Windows Notepad often saves ".env" as ".env.txt" (with extensions hidden) and sometimes as UTF-16, so accept those too.
const envFile = ['.env', '.env.txt', 'env', 'env.txt'].map((n) => join(HERE, n)).find((f) => existsSync(f));
if (envFile) {
  const raw = readFileSync(envFile);
  const text = (raw[0] === 0xff && raw[1] === 0xfe) || raw.includes(0) ? raw.toString('utf16le') : raw.toString('utf8');
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !env[m[1].toUpperCase()]) env[m[1].toUpperCase()] = m[2].replace(/^["']|["']$/g, '');
  }
}
if (env.R2_ACCOUNT_ID && !/^[0-9a-f]{32}$/i.test(env.R2_ACCOUNT_ID)) console.warn('Note: R2_ACCOUNT_ID should be 32 letters and numbers (the Account ID from the R2 overview page), not an API token.');
const R2 = { account: env.R2_ACCOUNT_ID, key: env.R2_ACCESS_KEY_ID, secret: env.R2_SECRET_ACCESS_KEY, bucket: env.R2_BUCKET || 'cosmos-images' };
if (!DOWNLOAD_ONLY && !(R2.account && R2.key && R2.secret)) {
  const missing = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'].filter((k) => !env[k]);
  console.error(envFile ? `Read ${envFile}, but it's missing: ${missing.join(', ')}.` : `No key file found in ${HERE} (looked for .env and .env.txt).`);
  console.error('See tools/images/README.md, or run with --download to only download.');
  process.exit(1);
}

// ---------- what to copy ----------
const jobs = [];   // { id, variant, url }
const photosDir = join(ROOT, 'src/data/collection/photos');
for (const f of readdirSync(photosDir)) {
  const p = JSON.parse(readFileSync(join(photosDir, f), 'utf8'));
  for (const v of VARIANTS) if (p.img?.[v]) jobs.push({ id: p.id, variant: v, url: p.img[v] });
}
const { CATALOG } = await import(pathToFileURL(join(ROOT, 'src/data/catalog.js')).href);   // a file:// URL, so it also works on Windows
for (const p of CATALOG) for (const v of VARIANTS) if (p.img?.[v]) jobs.push({ id: p.id, variant: v, url: p.img[v] });

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const saveManifest = () => writeFileSync(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 0).replace(/\],/g, '],\n') + '\n');
const fileFor = (j) => join(CACHE, j.id, `${j.variant}.jpg`);
const keyFor = (j) => `${j.id}/${j.variant}.jpg`;

// ---------- download ----------
async function download(j) {
  const file = fileFor(j);
  if (existsSync(file) && statSync(file).size > 1000) return 'kept';
  mkdirSync(dirname(file), { recursive: true });
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(j.url, { headers: { 'User-Agent': 'amomentinthecosmos.com image mirror (personal, credited use)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 1000) throw new Error('file too small');
      writeFileSync(file, buf);
      return 'got';
    } catch (e) {
      if (attempt === 4) throw new Error(`${j.url}: ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 1500 * attempt));
    }
  }
}

// ---------- upload (S3-compatible API, signed with AWS Signature V4) ----------
const sha = (b) => createHash('sha256').update(b).digest('hex');
const hmac = (k, s) => createHmac('sha256', k).update(s).digest();
async function put(key, body) {
  const host = `${R2.account}.r2.cloudflarestorage.com`;
  const path = `/${R2.bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  const now = new Date(), amz = now.toISOString().replace(/[-:]|\.\d{3}/g, ''), day = amz.slice(0, 8);
  const hash = sha(body);
  const headers = { host, 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=31536000, immutable', 'x-amz-content-sha256': hash, 'x-amz-date': amz };
  const names = Object.keys(headers).sort();
  const canonical = ['PUT', path, '', ...names.map((n) => `${n}:${headers[n]}`), '', names.join(';'), hash].join('\n');
  const scope = `${day}/auto/s3/aws4_request`;
  const toSign = ['AWS4-HMAC-SHA256', amz, scope, sha(canonical)].join('\n');
  const kSign = ['auto', 's3', 'aws4_request'].reduce((k, s) => hmac(k, s), hmac(`AWS4${R2.secret}`, day));
  const auth = `AWS4-HMAC-SHA256 Credential=${R2.key}/${scope}, SignedHeaders=${names.join(';')}, Signature=${createHmac('sha256', kSign).update(toSign).digest('hex')}`;
  const { host: _, ...send } = headers;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const r = await fetch(`https://${host}${path}`, { method: 'PUT', headers: { ...send, Authorization: auth }, body });
    if (r.ok) return;
    if (attempt === 4 || r.status === 403) throw new Error(`upload ${key}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
    await new Promise((ok) => setTimeout(ok, 1500 * attempt));
  }
}
async function upload(j) {
  if (manifest[j.id]?.includes(j.variant)) return 'kept';
  await put(keyFor(j), readFileSync(fileFor(j)));
  (manifest[j.id] ||= []).push(j.variant);
  return 'sent';
}

// ---------- run ----------
let done = 0, failed = [];
const started = Date.now();
async function worker(queue) {
  for (let j; (j = queue.shift());) {
    try {
      await download(j);
      if (!DOWNLOAD_ONLY) await upload(j);
    } catch (e) { failed.push(e.message); }
    if (++done % 50 === 0 || !queue.length) {
      const mins = ((Date.now() - started) / 60000).toFixed(1);
      process.stdout.write(`\r${done} of ${Math.min(jobs.length, LIMIT)} files · ${mins} min · ${failed.length} failed   `);
      if (!DOWNLOAD_ONLY) saveManifest();
    }
  }
}
console.log(`${jobs.length} image files for ${new Set(jobs.map((j) => j.id)).size} photographs${DOWNLOAD_ONLY ? ' (download only)' : ''}`);
const queue = jobs.slice(0, LIMIT);
await Promise.all(Array.from({ length: WORKERS }, () => worker(queue)));
if (!DOWNLOAD_ONLY) saveManifest();
console.log(`\nDone. ${failed.length} failed${failed.length ? ' (run again to retry them):' : '.'}`);
failed.slice(0, 20).forEach((f) => console.log('  ' + f));
