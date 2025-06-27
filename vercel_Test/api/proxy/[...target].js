
// 文件路径: api/proxy/[...target].js
// 使用 CommonJS 语法来修复 ERR_REQUIRE_ESM 错误

const fetch = require('node-fetch'); // <--- 已修改

// 设置CORS响应头
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');
}

// 使用 module.exports 导出函数 <--- 已修改
module.exports = async (req, res) => {
  // 预检请求直接通过
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    setCorsHeaders(res);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. 从请求参数中重建目标 URL
    const { target } = req.query;
    if (!target || target.length === 0) {
      throw new Error('Target URL is missing in the path.');
    }

    let targetUrl = target.join('/');
    if (targetUrl.startsWith('https:/')) {
      targetUrl = targetUrl.replace('https:/', 'https://');
    } else if (targetUrl.startsWith('http:/')) {
      targetUrl = targetUrl.replace('http:/', 'http://');
    }
    
    const originalQueryString = req.url.split('?')[1];
    if (originalQueryString && !targetUrl.includes('?')) {
        targetUrl += '?' + originalQueryString;
    }

    new URL(targetUrl);
    
    console.log(`[PROXY GET] Reconstructed URL: ${targetUrl}`);

    // 2. 发送代理请求
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://movie.douban.com/',
      },
    });

    // 3. 转发响应
    console.log(`[PROXY SUCCESS] Status ${response.status} from ${targetUrl}`);
    setCorsHeaders(res);
    
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status);
    const buffer = await response.buffer();
    res.send(buffer);

  } catch (error) {
    console.error(`[PROXY FATAL ERROR] ${error.message}`);
    setCorsHeaders(res);
    res.status(500).json({ error: 'Internal Proxy Error', message: error.message });
  }
};
