// Which hemisphere (and roughly what latitude) the visitor is in, for the sky chart.
// 1. The site's own /api/geo function, which reads Vercel's IP-geolocation header and returns only
//    a whole-degree latitude (nothing is stored, and no third party is asked).
// 2. Failing that (local preview, blocked request), a guess from the browser's time zone, ±35°.
// 3. The visitor can flip the chart themselves; that choice is remembered in this browser.
import { store } from './util.js';

const SOUTH_TZ = /^(Australia|Antarctica)\/|^Pacific\/(Auckland|Chatham|Fiji|Tongatapu|Apia|Noumea|Efate|Port_Moresby|Guadalcanal)|^America\/(Argentina|Santiago|Sao_Paulo|Montevideo|Asuncion|La_Paz|Lima|Punta_Arenas|Recife|Bahia|Fortaleza|Belem|Maceio|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Rio_Branco|Araguaina|Noronha)|^Africa\/(Johannesburg|Maputo|Harare|Lusaka|Windhoek|Gaborone|Maseru|Mbabane|Blantyre|Lubumbashi|Luanda|Dar_es_Salaam|Antananarivo)|^Indian\/(Mauritius|Reunion|Antananarivo)|^Atlantic\/(Stanley|South_Georgia|St_Helena)/;

let found = null;

async function locate() {
  const chosen = store.get('hemisphere');
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 1500);
    const r = await fetch('/api/geo', { signal: ctl.signal });
    clearTimeout(t);
    if (r.ok) {
      const { lat } = await r.json();
      if (Number.isFinite(lat)) return applyChoice({ lat, guessed: false }, chosen);
    }
  } catch { /* no geo function here: fall through to the time zone */ }
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* ignore */ }
  return applyChoice({ lat: SOUTH_TZ.test(tz) ? -35 : 35, guessed: true }, chosen);
}

// A hemisphere the visitor picked overrides the detected one (keeping the detected latitude's size).
function applyChoice(o, chosen) {
  if (chosen === 'S' && o.lat >= 0) return { lat: -Math.max(Math.abs(o.lat), 1) || -35, guessed: true };
  if (chosen === 'N' && o.lat < 0) return { lat: Math.abs(o.lat) || 35, guessed: true };
  return o;
}

export const observer = () => found || (found = locate());

// Flip to the other hemisphere and remember it.
export function setHemisphere() {
  const prev = found;
  found = prev.then((o) => {
    const next = { lat: -o.lat || -35, guessed: true };
    store.set('hemisphere', next.lat < 0 ? 'S' : 'N');
    return next;
  });
}
