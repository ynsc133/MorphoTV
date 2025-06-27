/**
 * 健康检查接口
 */

export default function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  res.status(200).json({
    status: 'healthy',
    platform: 'Vercel',
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION || 'unknown',
    nodeVersion: process.version,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
}
