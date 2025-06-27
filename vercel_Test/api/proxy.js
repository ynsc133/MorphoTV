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
    // 获取目标URL
    const { url: targetUrl } = req.query;
    
    if (!targetUrl) {
      return res.status(400).json({
        error: '缺少目标URL',
        usage: '使用方法: /api/proxy?url=https://example.com',
        example: '/api/proxy?url=https%3A//movie.douban.com/j/search_subjects%3Ftype%3Dmovie'
      });
    }

    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(targetUrl);
      new URL(decodedUrl); // 验证URL格式
    } catch (error) {
      return res.status(400).json({
        error: '无效的URL格式',
        message: error.message
      });
    }

    console.log(`🎯 代理请求: ${decodedUrl}`);

    // 检查缓存
    const cacheKey = `${req.method}:${decodedUrl}`;
    const now = Date.now();
    
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now < cached.expires) {
        console.log(`⚡ 缓存命中: ${decodedUrl} (${now - startTime}ms)`);
        res.setHeader('X-Cache-Status', 'HIT');
        res.setHeader('X-Response-Time', `${now - startTime}ms`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(cached.data);
      } else {
        cache.delete(cacheKey);
      }
    }

    // 清理缓存
    cleanCache();

    // 设置请求头
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    };

    // 豆瓣特殊处理
    if (decodedUrl.includes('douban.com')) {
      headers['Referer'] = 'https://movie.douban.com/';
      headers['Origin'] = 'https://movie.douban.com';
    }

    // 发送请求
    const response = await fetch(decodedUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    const responseTime = Date.now() - startTime;
    console.log(`✅ 代理成功: ${response.status} (${responseTime}ms)`);

    // 读取响应数据
    const data = await response.json();

    // 缓存响应（只缓存成功的GET请求）
    if (req.method === 'GET' && response.ok) {
      cache.set(cacheKey, {
        data: data,
        created: now,
        expires: now + CACHE_TTL
      });
      console.log(`💾 已缓存: ${decodedUrl}`);
    }

    // 返回响应
    res.setHeader('X-Cache-Status', 'MISS');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Proxy-Server', 'Vercel');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).json(data);

  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ 代理失败 (${errorTime}ms):`, error.message);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({
      error: '代理请求失败',
      message: error.message,
      responseTime: errorTime,
      timestamp: new Date().toISOString()
    });
  }
}
