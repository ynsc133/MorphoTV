/**
 * MorphoTV 代理服务器 - Vercel 版本 (最终修复版)
 * 使用 POST 请求和 JSON Body，并增加详细的错误日志
 */
import fetch from 'node-fetch';

// 设置 CORS 响应头
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  // 1. 预检请求直接通过
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  // 2. 只接受 POST 请求
  if (req.method !== 'POST') {
    setCorsHeaders(res);
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are accepted.' });
  }

  // 3. 从请求体中获取目标 URL
  let targetUrl;
  try {
    // Vercel 会自动解析 JSON body
    if (typeof req.body === 'string' && req.body) {
        req.body = JSON.parse(req.body);
    }
    targetUrl = req.body.url;
    
    if (!targetUrl) {
      throw new Error('Missing "url" in request body.');
    }
    // 验证 URL
    const urlObj = new URL(targetUrl);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol in target URL.');
    }
  } catch (error) {
    setCorsHeaders(res);
    return res.status(400).json({ error: 'Bad Request', message: error.message });
  }

  console.log(`[PROXY START] Forwarding request to: ${targetUrl}`);

  try {
    // 4. 构建并发送代理请求
    const proxyHeaders = { ...req.headers };
    // 删除 Vercel/Next.js 添加的或不应转发的头
    const excludedHeaders = [
      'host', 'connection', 'content-length', 'content-type',
      'x-vercel-id', 'x-real-ip', 'x-forwarded-for', 
      'x-forwarded-proto', 'x-forwarded-host'
    ];
    excludedHeaders.forEach(h => delete proxyHeaders[h]);

    // **关键：伪造一个真实的浏览器请求头，特别是 Referer**
    proxyHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    proxyHeaders['Referer'] = 'https://movie.douban.com/'; // 豆瓣可能会检查这个
    proxyHeaders['Accept'] = 'application/json, text/plain, */*';
    
    const response = await fetch(targetUrl, {
      method: 'GET', // 假设目标请求总是 GET
      headers: proxyHeaders,
      timeout: 15000, // 15秒超时
    });

    // 5. 关键的错误调试：如果目标服务器返回错误，记录错误内容
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[PROXY TARGET ERROR] Status: ${response.status}, URL: ${targetUrl}, Body: ${errorBody.substring(0, 500)}`);
      setCorsHeaders(res);
      // 将目标服务器的错误状态码和内容转发给客户端
      res.status(response.status).send(errorBody);
      return;
    }
    
    console.log(`[PROXY SUCCESS] Status: ${response.status} from ${targetUrl}`);

    // 6. 成功，转发响应
    setCorsHeaders(res);
    res.status(response.status);
    response.headers.forEach((value, key) => {
        // 过滤掉一些不需要的响应头
        if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            res.setHeader(key, value);
        }
    });

    const buffer = await response.buffer();
    res.send(buffer);

  } catch (error) {
    console.error(`[PROXY FATAL ERROR] URL: ${targetUrl}, Error: ${error.message}`, error);
    setCorsHeaders(res);
    res.status(502).json({ error: 'Bad Gateway', message: error.message });
  }
}

// 注意：这里不再需要 bodyParser: false，让 Vercel 自动处理
export const config = {
  api: {
    responseLimit: '10mb',
  },
};
