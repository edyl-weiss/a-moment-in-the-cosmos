// "Where it is in the sky": a small star chart of the photograph's constellation, with the
// object marked when the source archive published its position. The chart is drawn the way the
// sky looks from the visitor's hemisphere (north up in the north, turned over in the south), and a
// line underneath says when and how high it can be seen from roughly where they are.
import { $, esc } from './util.js';
import { CON_NAMES, CATALOG_SKY } from '../data/constellations.js';
import { observer, setHemisphere } from './geo.js';

export { CON_NAMES };

const W = 320, H = 240, PAD = 18;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const rad = Math.PI / 180;
let sky = null, current = null, browse = null;

// The archive registers this so a click on the constellation opens its collection without an import cycle.
export const onConstellationClick = (fn) => { browse = fn; };

const loadSky = () => sky || (sky = fetch('data/sky.json').then((r) => r.json()));

// Stereographic projection centred on (lon0, lat0). East is to the left, as on any sky chart.
function projector(lon0, lat0) {
  const s0 = Math.sin(lat0 * rad), c0 = Math.cos(lat0 * rad);
  return ([lon, lat]) => {
    const dl = (lon - lon0) * rad, s = Math.sin(lat * rad), c = Math.cos(lat * rad);
    const cosc = s0 * s + c0 * c * Math.cos(dl);
    if (cosc < -0.3) return null;                       // the far side of the sky
    const k = 2 / (1 + cosc);
    return [-k * c * Math.sin(dl), k * (c0 * s - s0 * c * Math.cos(dl))];
  };
}

const lonOf = (ra) => (ra > 180 ? ra - 360 : ra);

// Plain-language visibility for an observer at `lat` (a guess of ±35° when we only know the hemisphere).
function visibility(dec, ra, lat, guessed) {
  const where = guessed ? `From mid-${lat >= 0 ? 'northern' : 'southern'} latitudes` : 'From around where you are';
  const maxAlt = 90 - Math.abs(lat - dec);
  if (maxAlt <= 0) return `${where} it never rises: you’d need to go farther ${lat >= 0 ? 'south' : 'north'} to see this part of the sky.`;
  if ((lat >= 0 && dec >= 90 - lat) || (lat < 0 && dec <= -90 - lat)) return `${where} it never sets. It circles the ${lat >= 0 ? 'north' : 'south'} celestial pole all night, all year.`;
  const month = MONTHS[Math.floor(ra / 30 + 8.5) % 12];
  const dir = dec < lat ? 'south' : 'north';
  if (maxAlt < 20) return `${where} it stays low, never more than about ${Math.round(maxAlt)}° above the ${dir}ern horizon. It’s highest around midnight in ${month}.`;
  return `${where} it climbs to about ${Math.round(maxAlt)}° above the ${dir}ern horizon, highest around midnight in ${month}.`;
}

async function draw(item) {
  const fig = $('#skyFig');
  const at = item?.sky || CATALOG_SKY[item?.id];
  if (!at || !at.con) { fig.hidden = true; return; }
  const data = await loadSky();
  if (current !== item) return;                         // another photograph arrived while loading
  const con = data.con[at.con];
  if (!con) { fig.hidden = true; return; }
  const obs = await observer();
  if (current !== item) return;
  const south = obs.lat < 0;

  // Centre on the constellation (or between it and the object), and fit its boundary in the frame.
  const marked = Number.isFinite(at.ra);
  const centre = con.c;
  const P = projector(centre[0], centre[1]);
  const pts = con.b.map(P).filter(Boolean);
  if (marked) { const m = P([lonOf(at.ra), at.dec]); if (m) pts.push(m); }
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min((W - 2 * PAD) / (x1 - x0 || 1), (H - 2 * PAD) / (y1 - y0 || 1));
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const flip = south ? -1 : 1;                          // southern skies: turn the chart over
  const S = (p) => (p ? [W / 2 + flip * (p[0] - mx) * scale, H / 2 - flip * (p[1] - my) * scale] : null);
  const inView = ([x, y]) => x > -40 && x < W + 40 && y > -40 && y < H + 40;
  const path = (line) => {
    let d = '', pen = false;
    for (const q of line) {
      const s = S(P(q));
      if (!s || !inView(s)) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${s[0].toFixed(1)} ${s[1].toFixed(1)}`; pen = true;
    }
    return d;
  };

  let svg = '';
  for (const [k, c] of Object.entries(data.con)) {     // neighbours, faint
    if (k === at.con) continue;
    const d = (c.l || []).map(path).join('');
    if (d) svg += `<path class="sk-nb" d="${d}"/>`;
  }
  svg += `<path class="sk-bound" d="${path([...con.b, con.b[0]])}"/>`;
  for (const [lon, lat, mag] of data.stars) {
    const s = S(P([lon, lat]));
    if (s && inView(s)) svg += `<circle class="sk-star" cx="${s[0].toFixed(1)}" cy="${s[1].toFixed(1)}" r="${Math.max(0.6, 3.1 - mag * 0.5).toFixed(2)}"/>`;
  }
  svg += `<path class="sk-line" d="${(con.l || []).map(path).join('')}"/>`;
  if (marked) {
    const m = S(P([lonOf(at.ra), at.dec]));
    if (m) svg += `<g class="sk-mark" transform="translate(${m[0].toFixed(1)} ${m[1].toFixed(1)})"><circle class="sk-pulse" r="9"/><circle r="9"/><circle class="sk-dot" r="2.2"/></g>`;
  }
  const name = CON_NAMES[at.con] || con.n;
  const ns = south ? ['S', 'N'] : ['N', 'S'], ew = south ? ['W', 'E'] : ['E', 'W'];
  svg += `<g class="sk-compass"><text x="${W / 2}" y="11">${ns[0]}</text><text x="6" y="${H / 2 + 4}">${ew[0]}</text></g>`;

  $('#skyChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Star chart of ${esc(name)}${marked ? ', with this object marked' : ''}">${svg}</svg>`;
  $('#skyCon').textContent = name;
  $('#skyCon').dataset.con = at.con;
  const other = south ? 'Northern' : 'Southern';
  $('#skyView').innerHTML = `Drawn as seen from the ${south ? 'Southern' : 'Northern'} Hemisphere. <button type="button" id="skyFlip">Show the ${other} view</button>`;
  $('#skyWhen').textContent = marked ? visibility(at.dec, at.ra, obs.lat, obs.guessed)
    : 'The source gives the constellation but not an exact position, so only the constellation is shown.';
  fig.hidden = false;
}

document.addEventListener('photo:change', ({ detail: { item } }) => { current = item; draw(item); });
document.addEventListener('click', (e) => {
  if (e.target.id === 'skyFlip') { setHemisphere(); draw(current); }
  const b = e.target.closest('#skyCon');
  if (b && browse) browse(b.dataset.con);
});
