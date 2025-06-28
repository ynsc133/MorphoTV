export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'healthy',
    platform: 'Vercel',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    region: process.env.VERCEL_REGION || 'unknown'
  });
}
