// The visitor's approximate latitude, from Vercel's IP-geolocation header, rounded to a whole degree.
// Used only to draw the sky chart for the right hemisphere. Nothing is logged or stored.
export default function handler(req, res) {
  const lat = Number(req.headers['x-vercel-ip-latitude']);
  res.setHeader('Cache-Control', 'private, no-store');
  if (!Number.isFinite(lat)) return res.status(204).end();
  res.status(200).json({ lat: Math.round(lat) });
}
