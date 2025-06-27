/**
 * MorphoTV 代理服务器 - Vercel 版本
 * 动态路由处理所有代理请求
 */

// 设置 CORS 响应头
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// 处理代理请求
async function handleProxyRequest(req, res, targetUrl) {
  try {
    // 动态导入 fetch
    const fetch = (await import('node-fetch')).default;

    // 构建请求头
    const proxyHeaders = {};
    
    // 复制原始请求头，排除一些特定的头
    Object.keys(req.headers).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (!['host', 'x-forwarded-for', 'x-forwarded-proto', 'x-vercel-id', 'connection'].includes(lowerKey)) {
        proxyHeaders[key] = req.headers[key];
      }
    });

    // 设置优化的请求头
    proxyHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    proxyHeaders['Accept'] = '*/*';
    proxyHeaders['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
    proxyHeaders['Cache-Control'] = 'no-cache';

    // 构建 fetch 选项
    const fetchOptions = {
      method: req.method,
      headers: proxyHeaders,
      timeout: 30000, // 30秒超时
    };

    // 处理请求体
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // 读取请求体
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        fetchOptions.body = Buffer.concat(chunks);
      }
    }

    console.log(`代理请求: ${req.method} ${targetUrl}`);

    // 发送代理请求
    const response = await fetch(targetUrl, fetchOptions);

    // 设置响应状态码
    res.status(response.status);

    // 复制响应头
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // 排除一些可能导致问题的头
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(lowerKey)) {
        res.setHeader(key, value);
      }
    });

    // 设置 CORS 头
    setCorsHeaders(res);

    // 添加缓存控制
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5分钟缓存
    }

    // 获取响应体
    const buffer = await response.buffer();
    
    // 发送响应
    res.end(buffer);

  } catch (error) {
    console.error('代理请求失败:', error);

    // 设置错误响应
    setCorsHeaders(res);
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message || 'Unknown error',
      targetUrl: targetUrl,
      timestamp: new Date().toISOString(),
      platform: 'Vercel',
      userAgent: req.headers['user-agent']
    });
  }
}

// 主处理函数
export default async function handler(req, res) {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  try {
    // 获取目标 URL
    const { path } = req.query;
    
    if (!path || path.length === 0) {
      setCorsHeaders(res);
      return res.status(400).json({
        error: 'Target URL is required',
        usage: 'Use /api/proxy/{encoded-target-url} format',
        example: '/api/proxy/https%3A//api.example.com/data'
      });
    }

    // 重建完整的目标 URL
    const targetUrl = decodeURIComponent(path.join('/'));

    // 验证 URL 格式
    try {
      new URL(targetUrl);
    } catch (urlError) {
      setCorsHeaders(res);
      return res.status(400).json({
        error: 'Invalid target URL',
        message: 'Target URL must be a valid HTTP/HTTPS URL',
        provided: targetUrl
      });
    }

    // 处理代理请求
    await handleProxyRequest(req, res, targetUrl);

  } catch (error) {
    console.error('处理请求时发生错误:', error);
    setCorsHeaders(res);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
