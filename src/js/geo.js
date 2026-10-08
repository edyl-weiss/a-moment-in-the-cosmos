// Which hemisphere (and roughly what latitude) the visitor is in, for the sky chart.
// 1. The site's own /api/geo function, which reads Vercel's IP-geolocation headers and returns only a
//    whole-degree latitude and longitude (nothing is stored, and no third party is asked).
// 2. Failing that (local preview, blocked request), a guess from the browser's time zone, ±35°.
// 3. The visitor can flip the chart themselves; that choice is remembered in this browser.
import { store } from './util.js';

const SOUTH_TZ = /^(Australia|Antarctica)\/|^Pacific\/(Auckland|Chatham|Fiji|Tongatapu|Apia|Noumea|Efate|Port_Moresby|Guadalcanal)|^America\/(Argentina|Santiago|Sao_Paulo|Montevideo|Asuncion|La_Paz|Lima|Punta_Arenas|Recife|Bahia|Fortaleza|Belem|Maceio|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Rio_Branco|Araguaina|Noronha)|^Africa\/(Johannesburg|Maputo|Harare|Lusaka|Windhoek|Gaborone|Maseru|Mbabane|Blantyre|Lubumbashi|Luanda|Dar_es_Salaam|Antananarivo)|^Indian\/(Mauritius|Reunion|Antananarivo)|^Atlantic\/(Stanley|South_Georgia|St_Helena)/;

let found = null, raw = null;

// Longitude from the time zone offset, when nothing better is known (15° per hour).
const tzLon = () => -new Date().getTimezoneOffset() / 4;

async function detect() {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch('/api/geo', { signal: ctl.signal });
    clearTimeout(t);
    if (r.ok) {
      const { lat, lon } = await r.json();
      if (Number.isFinite(lat)) return { lat, lon: Number.isFinite(lon) ? lon : tzLon(), guessed: false };
    }
  } catch { /* no geo function here: fall through to the time zone */ }
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* ignore */ }
  return { lat: SOUTH_TZ.test(tz) ? -35 : 35, lon: tzLon(), guessed: true };
}

// Where the visitor actually is (for "Tonight's sky"), ignoring any hemisphere they picked for the small charts.
export const whereAmI = () => raw || (raw = detect());

async function locate() { return applyChoice({ ...(await whereAmI()) }, store.get('hemisphere')); }

// A hemisphere the visitor picked overrides the detected one (keeping the detected latitude's size).
function applyChoice(o, chosen) {
  if (chosen === 'S' && o.lat >= 0) return { ...o, lat: -Math.max(Math.abs(o.lat), 1) || -35, guessed: true };
  if (chosen === 'N' && o.lat < 0) return { ...o, lat: Math.abs(o.lat) || 35, guessed: true };
  return o;
}

export const observer = () => found || (found = locate());

// Flip to the other hemisphere and remember it.
export function setHemisphere() {
  const prev = found;
  found = prev.then((o) => {
    const next = { ...o, lat: -o.lat || -35, guessed: true };
    store.set('hemisphere', next.lat < 0 ? 'S' : 'N');
    return next;
  });
}
