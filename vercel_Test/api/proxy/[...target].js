// 文件路径: api/proxy/[...target].js

/**
 * MorphoTV 代理服务器 - Vercel 版本 (GET 路径参数最终修复版)
 * 专门处理 /api/proxy/https://... 格式的请求
 */
import fetch from 'node-fetch';

// 设置CORS响应头
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');
}

export default async function handler(req, res) {
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
    // 1. 从请求参数中重建目标 URL (最关键的一步)
    const { target } = req.query;
    if (!target || target.length === 0) {
      throw new Error('Target URL is missing in the path.');
    }

    // 将数组拼接成 URL，并修复协议部分的冒号
    let targetUrl = target.join('/');
    if (targetUrl.startsWith('https:/')) {
      targetUrl = targetUrl.replace('https:/', 'https://');
    } else if (targetUrl.startsWith('http:/')) {
      targetUrl = targetUrl.replace('http:/', 'http://');
    }
    
    // 如果原始请求有查询参数，附加到目标 URL 后面
    const originalQueryString = req.url.split('?')[1];
    if (originalQueryString) {
        if (!targetUrl.includes('?')) {
            targetUrl += '?' + originalQueryString;
        }
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
}
