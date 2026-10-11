// The Moon and the naked-eye planets, computed in the browser for any moment.
// Planets: JPL's approximate Keplerian elements (Standish, valid 1800–2050; good to a few arcminutes).
// Moon: the Astronomical Almanac's low-precision series (about 0.3°), which is plenty for a sky chart.
// Positions come out as right ascension and declination for the J2000 equinox, the same frame as the
// star catalog, so the chart precesses and projects them exactly like the stars.

const rad = Math.PI / 180;
const EPS = 23.43928 * rad;                                // obliquity of the ecliptic, J2000

// [a, e, I, L, long. perihelion, long. node] and their rates per Julian century
const ELEMENTS = {
  mercury: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus: [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255], [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
  earth: [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0]],
  mars: [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  saturn: [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]]
};

export const PLANETS = [
  { id: 'mercury', name: 'Mercury', color: '#d6cdbd', size: 0.5 },
  { id: 'venus', name: 'Venus', color: '#fff4d6', size: 0.8 },
  { id: 'mars', name: 'Mars', color: '#ef8a66', size: 0.6 },
  { id: 'jupiter', name: 'Jupiter', color: '#f3dfb8', size: 0.72 },
  { id: 'saturn', name: 'Saturn', color: '#e8d194', size: 0.6 }
];

const centuries = (date) => (date.getTime() / 864e5 + 2440587.5 - 2451545) / 36525;

// Heliocentric ecliptic position (AU, J2000) of a planet.
function helio(id, T) {
  const [el, rate] = ELEMENTS[id];
  const [a, e, I, L, wbar, node] = el.map((v, i) => v + rate[i] * T);
  let M = ((L - wbar) % 360 + 540) % 360 - 180;           // mean anomaly, -180..180
  M *= rad;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 6; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const w = (wbar - node) * rad, O = node * rad, i = I * rad;
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O), ci = Math.cos(i), si = Math.sin(i);
  return [
    (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
    (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
    (sw * si) * xp + (cw * si) * yp
  ];
}

// Ecliptic vector → RA/Dec (degrees), plus the ecliptic longitude.
function toEquatorial([x, y, z]) {
  const ye = y * Math.cos(EPS) - z * Math.sin(EPS), ze = y * Math.sin(EPS) + z * Math.cos(EPS);
  const r = Math.hypot(x, ye, ze);
  return { ra: ((Math.atan2(ye, x) / rad) + 360) % 360, dec: Math.asin(ze / r) / rad, lon: ((Math.atan2(y, x) / rad) + 360) % 360, lat: Math.asin(z / r) / rad, dist: r };
}

// Angle between two ecliptic directions, degrees.
const sep = (l1, b1, l2, b2) => Math.acos(Math.min(1, Math.sin(b1 * rad) * Math.sin(b2 * rad) + Math.cos(b1 * rad) * Math.cos(b2 * rad) * Math.cos((l1 - l2) * rad))) / rad;

export function sunAt(date) {
  const ear = helio('earth', centuries(date));
  return toEquatorial(ear.map((v) => -v));
}

export function planetsAt(date) {
  const T = centuries(date), ear = helio('earth', T), sun = toEquatorial(ear.map((v) => -v));
  return PLANETS.map((p) => {
    const h = helio(p.id, T);
    const g = toEquatorial(h.map((v, i) => v - ear[i]));
    return { ...p, ...g, elong: sep(g.lon, g.lat, sun.lon, sun.lat) };
  });
}

export function moonAt(date) {
  const T = centuries(date), s = (d) => Math.sin(d * rad), c = (d) => Math.cos(d * rad);
  const lonDate = 218.32 + 481267.881 * T + 6.29 * s(135.0 + 477198.87 * T) - 1.27 * s(259.3 - 413335.36 * T) + 0.66 * s(235.7 + 890534.22 * T)
    + 0.21 * s(269.9 + 954397.74 * T) - 0.19 * s(357.5 + 35999.05 * T) - 0.11 * s(186.5 + 966404.03 * T);
  const lat = 5.13 * s(93.3 + 483202.02 * T) + 0.28 * s(228.2 + 960400.89 * T) - 0.28 * s(318.3 + 6003.15 * T) - 0.17 * s(217.6 - 407332.21 * T);
  const par = 0.9508 + 0.0518 * c(135.0 + 477198.87 * T) + 0.0095 * c(259.3 - 413335.36 * T) + 0.0078 * c(235.7 + 890534.22 * T) + 0.0028 * c(269.9 + 954397.74 * T);
  const lon = ((lonDate - 1.396971 * T) % 360 + 360) % 360;   // back from the equinox of date to J2000
  const v = [c(lat) * c(lon), c(lat) * s(lon), s(lat)];
  const eq = toEquatorial(v);
  const sun = sunAt(date);
  const elong = sep(lon, lat, sun.lon, sun.lat);
  const lit = (1 - Math.cos(elong * rad)) / 2;                 // fraction of the disc that is lit
  const waxing = ((lon - sun.lon) % 360 + 360) % 360 < 180;
  return { id: 'moon', name: 'Moon', ra: eq.ra, dec: eq.dec, parallax: par, lit, waxing, phase: phaseName(lit, waxing), sun };
}

function phaseName(lit, waxing) {
  if (lit < 0.03) return 'New moon';
  if (lit > 0.97) return 'Full moon';
  if (Math.abs(lit - 0.5) < 0.06) return waxing ? 'First quarter' : 'Last quarter';
  return `${waxing ? 'Waxing' : 'Waning'} ${lit < 0.5 ? 'crescent' : 'gibbous'}`;
}
