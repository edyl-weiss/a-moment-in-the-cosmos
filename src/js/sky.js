// Decorative background: seeded stars plus four unnamed star patterns near the margins.
import { $ } from './util.js';

export function paintSky() {
  let seed = 20260929;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const W = 1600, H = 1000;
  let s = '';
  for (let i = 0; i < 170; i++) {
    const x = rnd() * W, y = rnd() * H, r = rnd() < 0.08 ? 1.3 : 0.4 + rnd() * 0.6, o = 0.25 + rnd() * 0.5;
    const tw = rnd() < 0.18 ? ` class="tw" style="animation-delay:${(rnd() * 6).toFixed(2)}s"` : '';
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f4ecd6" opacity="${o.toFixed(2)}"${tw}/>`;
  }
  const patterns = [
    [[60, 120], [140, 90], [210, 150], [190, 240], [110, 260]],
    [[1400, 110], [1470, 170], [1540, 140], [1510, 250]],
    [[80, 760], [170, 720], [230, 800], [320, 780], [380, 850]],
    [[1380, 720], [1450, 800], [1530, 760], [1560, 870], [1470, 900]]
  ];
  for (const p of patterns) {
    s += `<polyline points="${p.map((q) => q.join(',')).join(' ')}" fill="none" stroke="#e9e4d8" stroke-opacity=".16" stroke-width=".8"/>`;
    for (const [x, y] of p) s += `<circle cx="${x}" cy="${y}" r="1.6" fill="#f4ecd6" opacity=".55"/>`;
  }
  $('#sky').innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" focusable="false">${s}</svg>`;
}
