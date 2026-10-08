// Minimal Upstash Redis REST client (no dependency).
// Vercel's Upstash integration names its variables differently depending on how it was connected:
// KV_REST_API_URL / KV_REST_API_TOKEN, UPSTASH_REDIS_REST_URL / _TOKEN, either one with a custom
// prefix (e.g. STORAGE_KV_REST_API_URL), or only a connection string REDIS_URL / KV_URL.
// All of those are accepted here.
function find(re) {
  const k = Object.keys(process.env).find((name) => re.test(name) && !/READ_ONLY/.test(name) && process.env[name]);
  return k ? [k, process.env[k]] : [null, null];
}

export function credentials() {
  const [urlVar, url] = find(/(KV_REST_API_URL|REDIS_REST_URL)$/);
  const [tokenVar, token] = find(/(KV_REST_API_TOKEN|REDIS_REST_TOKEN)$/);
  if (url && token) return { url: url.replace(/\/$/, ''), token, from: [urlVar, tokenVar] };
  // Fall back to a connection string: rediss://default:<token>@<host>:6379 → https://<host>
  const [connVar, conn] = find(/(^|_)(REDIS_URL|KV_URL)$/);
  if (conn) {
    try {
      const u = new URL(conn);
      if (u.password && /upstash\.io$/.test(u.hostname)) return { url: `https://${u.hostname}`, token: decodeURIComponent(u.password), from: [connVar] };
    } catch { /* not a URL */ }
  }
  return null;
}

export const configured = () => Boolean(credentials());

// Run several commands in one round trip; returns their results in order.
export async function pipeline(commands, fetchImpl = fetch) {
  const c = credentials();
  if (!c) throw new Error('not configured');
  const r = await fetchImpl(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  const out = await r.json();
  const bad = out.find((x) => x && x.error);
  if (bad) throw new Error(`redis: ${bad.error}`);
  return out.map((x) => x.result);
}
