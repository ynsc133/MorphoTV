/**
 * MorphoTV 代理服务器 - Vercel 版本 (查询参数方式)
 * 使用查询参数而不是路径参数
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
  const startTime = Date.now();
  
  try {
    const fetch = (await import('node-fetch')).default;

    console.log(`[PROXY] 开始处理请求: ${req.method} ${targetUrl}`);

    // 构建请求头
    const proxyHeaders = {};
    
    const excludedHeaders = [
      'host', 'x-forwarded-for', 'x-forwarded-proto', 
      'x-vercel-id', 'connection', 'content-length',
      'x-real-ip', 'x-forwarded-host'
    ];
    
    Object.keys(req.headers).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (!excludedHeaders.includes(lowerKey)) {
        proxyHeaders[key] = req.headers[key];
      }
    });

    proxyHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    proxyHeaders['Accept'] = '*/*';
    proxyHeaders['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';

    const fetchOptions = {
      method: req.method,
      headers: proxyHeaders,
      timeout: 30000,
    };

    // 处理请求体
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        fetchOptions.body = Buffer.concat(chunks);
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const duration = Date.now() - startTime;

    console.log(`[PROXY] 请求完成: ${response.status} (${duration}ms)`);

    res.status(response.status);

    const excludedResponseHeaders = [
      'content-encoding', 'transfer-encoding', 'connection',
      'content-length'
    ];

    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!excludedResponseHeaders.includes(lowerKey)) {
        res.setHeader(key, value);
      }
    });

    setCorsHeaders(res);

    const buffer = await response.buffer();
    res.end(buffer);

  } catch (error) {
    console.error(`[PROXY] 请求失败:`, error.message);
    setCorsHeaders(res);
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
      targetUrl: targetUrl,
      timestamp: new Date().toISOString()
    });
  }
}

export default async function handler(req, res) {
  console.log(`[REQUEST] ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  try {
    // 使用查询参数获取目标URL
    const { url: targetUrl } = req.query;
    
    if (!targetUrl) {
      setCorsHeaders(res);
      return res.status(400).json({
        error: 'Missing target URL',
        message: 'Please provide target URL as query parameter',
        usage: 'GET /api/proxy?url=https://example.com',
        example: '/api/proxy?url=https%3A//httpbin.org/get'
      });
    }

    // 解码URL
    const decodedUrl = decodeURIComponent(targetUrl);
    
    // 验证URL
    try {
      const urlObj = new URL(decodedUrl);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS are allowed');
      }
    } catch (urlError) {
      setCorsHeaders(res);
      return res.status(400).json({
        error: 'Invalid URL',
        message: urlError.message,
        provided: decodedUrl
      });
    }

    await handleProxyRequest(req, res, decodedUrl);

  } catch (error) {
    console.error('[ERROR]', error);
    setCorsHeaders(res);
    res.status(500).json({
      error: 'Internal error',
      message: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
}
