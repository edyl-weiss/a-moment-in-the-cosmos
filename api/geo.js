// The visitor's approximate position, from Vercel's IP-geolocation headers, rounded to whole degrees
// (city-region precision at best). Used only to draw the sky for the right place. Nothing is logged or stored.
export default function handler(req, res) {
  const lat = Number(req.headers['x-vercel-ip-latitude']);
  const lon = Number(req.headers['x-vercel-ip-longitude']);
  res.setHeader('Cache-Control', 'private, no-store');
  if (!Number.isFinite(lat)) return res.status(204).end();
  res.status(200).json({ lat: Math.round(lat), lon: Number.isFinite(lon) ? Math.round(lon) : null });
}
