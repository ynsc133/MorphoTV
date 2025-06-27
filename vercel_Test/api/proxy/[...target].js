/**
 * MorphoTV 代理服务器 - Vercel 版本 (修复版)
 * 处理 URL 编码和解码问题
 */

// 设置 CORS 响应头
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// 安全的 URL 解码函数
function safeDecodeURL(encodedUrl) {
  try {
    // 处理可能的双重编码
    let decoded = encodedUrl;
    
    // 如果包含 %25，说明可能是双重编码
    if (decoded.includes('%25')) {
      decoded = decodeURIComponent(decoded);
    }
    
    // 再次解码
    decoded = decodeURIComponent(decoded);
    
    // 验证是否为有效的 HTTP/HTTPS URL
    const url = new URL(decoded);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }
    
    return decoded;
  } catch (error) {
    throw new Error(`URL decode failed: ${error.message}`);
  }
}

// 处理代理请求
async function handleProxyRequest(req, res, targetUrl) {
  const startTime = Date.now();
  
  try {
    // 动态导入 fetch
    const fetch = (await import('node-fetch')).default;

    console.log(`[PROXY] 开始处理请求: ${req.method} ${targetUrl}`);

    // 构建请求头
    const proxyHeaders = {};
    
    // 安全地复制请求头
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

    // 设置标准请求头
    proxyHeaders['User-Agent'] = proxyHeaders['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    proxyHeaders['Accept'] = proxyHeaders['Accept'] || '*/*';
    proxyHeaders['Accept-Language'] = proxyHeaders['Accept-Language'] || 'zh-CN,zh;q=0.9,en;q=0.8';

    // 构建 fetch 选项
    const fetchOptions = {
      method: req.method,
      headers: proxyHeaders,
      timeout: 30000,
      follow: 10, // 允许重定向
    };

    // 处理请求体
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        if (chunks.length > 0) {
          fetchOptions.body = Buffer.concat(chunks);
        }
      } catch (bodyError) {
        console.error('[PROXY] 读取请求体失败:', bodyError);
      }
    }

    // 发送代理请求
    const response = await fetch(targetUrl, fetchOptions);
    const duration = Date.now() - startTime;

    console.log(`[PROXY] 请求完成: ${response.status} ${response.statusText} (${duration}ms)`);

    // 设置响应状态码
    res.status(response.status);

    // 安全地复制响应头
    const excludedResponseHeaders = [
      'content-encoding', 'transfer-encoding', 'connection',
      'content-length', 'server'
    ];

    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!excludedResponseHeaders.includes(lowerKey)) {
        try {
          res.setHeader(key, value);
        } catch (headerError) {
          console.warn(`[PROXY] 设置响应头失败 ${key}:`, headerError.message);
        }
      }
    });

    // 设置 CORS 头
    setCorsHeaders(res);

    // 设置缓存控制
    if (req.method === 'GET' && response.status === 200) {
      res.setHeader('Cache-Control', 'public, max-age=300');
    }

    // 获取并发送响应体
    const buffer = await response.buffer();
    res.end(buffer);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[PROXY] 请求失败 (${duration}ms):`, {
      url: targetUrl,
      error: error.message,
      code: error.code,
      type: error.type
    });

    setCorsHeaders(res);
    
    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    let errorType = 'PROXY_ERROR';
    
    if (error.code === 'ENOTFOUND') {
      statusCode = 404;
      errorType = 'HOST_NOT_FOUND';
    } else if (error.code === 'ECONNREFUSED') {
      statusCode = 502;
      errorType = 'CONNECTION_REFUSED';
    } else if (error.code === 'ETIMEDOUT' || error.type === 'request-timeout') {
      statusCode = 504;
      errorType = 'TIMEOUT';
    }

    res.status(statusCode).json({
      error: errorType,
      message: error.message,
      targetUrl: targetUrl,
      timestamp: new Date().toISOString(),
      platform: 'Vercel',
      requestId: req.headers['x-vercel-id'] || 'unknown'
    });
  }
}

// 主处理函数
export default async function handler(req, res) {
  // 记录请求开始
  console.log(`[REQUEST] ${req.method} ${req.url} from ${req.headers['x-forwarded-for'] || req.connection?.remoteAddress}`);

  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  try {
    // 获取路径参数
    const { target } = req.query;
    
    if (!target || target.length === 0) {
      setCorsHeaders(res);
      return res.status(400).json({
        error: 'MISSING_TARGET_URL',
        message: 'Target URL is required',
        usage: 'Use /api/proxy/{encoded-target-url} format',
        example: '/api/proxy/https%3A//api.example.com/data',
        received: {
          query: req.query,
          url: req.url
        }
      });
    }

    // 重建目标 URL
    const encodedUrl = Array.isArray(target) ? target.join('/') : target;
    console.log(`[URL] 原始编码URL: ${encodedUrl}`);

    // 安全解码 URL
    let targetUrl;
    try {
      targetUrl = safeDecodeURL(encodedUrl);
      console.log(`[URL] 解码后URL: ${targetUrl}`);
    } catch (urlError) {
      setCorsHeaders(res);
      return res.status(400).json({
        error: 'INVALID_URL',
        message: urlError.message,
        provided: encodedUrl,
        timestamp: new Date().toISOString()
      });
    }

    // 处理代理请求
    await handleProxyRequest(req, res, targetUrl);

  } catch (error) {
    console.error('[ERROR] 处理请求时发生错误:', error);
    setCorsHeaders(res);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-vercel-id'] || 'unknown'
    });
  }
}

// 导出配置
export const config = {
  api: {
    bodyParser: false, // 禁用默认的 body parser，手动处理
    responseLimit: '10mb', // 设置响应大小限制
  },
}
