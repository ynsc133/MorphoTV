// 简单内存缓存
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟
const MAX_CACHE_SIZE = 100;

// CORS 头
function addCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// 清理过期缓存
function cleanCache() {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expires) {
      cache.delete(key);
    }
  }
  
  // 如果缓存太大，删除最旧的
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].created - b[1].created);
    for (let i = 0; i < 20; i++) {
      cache.delete(entries[i][0]);
    }
  }
}

export default async function handler(req, res) {
  const startTime = Date.now();

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  try {
    // 从路径参数获取目标URL
    const { url: urlParts } = req.query;
    
    if (!urlParts || !Array.isArray(urlParts) || urlParts.length === 0) {
      return res.status(400).json({
        error: '缺少目标URL',
        usage: '使用方法: /api/proxy/https://example.com',
        example: '/api/proxy/https://movie.douban.com/j/search_subjects?type=movie'
      });
    }

    // 重构完整的目标URL
    const targetUrl = urlParts.join('/');
    
    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(targetUrl);
      new URL(decodedUrl); // 验证URL格式
    } catch (error) {
      return res.status(400).json({
        error: '无效的URL格式',
        message: error.message,
        receivedUrl: targetUrl
      });
    }

    // 检查缓存
    const cacheKey = `${req.method}:${decodedUrl}:${JSON.stringify(req.body || {})}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      return res.status(cached.status).json(cached.data);
    }

    // 清理缓存
    cleanCache();

    // 准备请求选项
    const fetchOptions = {
      method: req.method,
      headers: {
        'User-Agent': 'MorphoTV-Proxy/1.0',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      }
    };

    // 转发请求头（排除一些不需要的）
    const excludeHeaders = ['host', 'connection', 'content-length', 'x-forwarded-for', 'x-real-ip'];
    for (const [key, value] of Object.entries(req.headers)) {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        fetchOptions.headers[key] = value;
      }
    }

    // 处理请求体
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
      fetchOptions.headers['Content-Type'] = 'application/json';
    }

    console.log(`代理请求: ${req.method} ${decodedUrl}`);

    // 发起请求
    const response = await fetch(decodedUrl, fetchOptions);
    
    // 设置响应头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Proxy-Status', 'success');
    res.setHeader('X-Target-URL', decodedUrl);
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    res.setHeader('X-Cache', 'MISS');

    // 转发响应头
    for (const [key, value] of response.headers.entries()) {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // 处理响应
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json') || contentType.includes('text/')) {
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      // 缓存成功的响应
      if (response.ok && req.method === 'GET') {
        cache.set(cacheKey, {
          status: response.status,
          data: data,
          expires: Date.now() + CACHE_TTL,
          created: Date.now()
        });
      }

      res.status(response.status).json(data);
    } else {
      const buffer = await response.arrayBuffer();
      res.status(response.status).send(Buffer.from(buffer));
    }

  } catch (error) {
    console.error('代理错误:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Proxy-Status', 'error');
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    
    res.status(500).json({
      error: '代理请求失败',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
