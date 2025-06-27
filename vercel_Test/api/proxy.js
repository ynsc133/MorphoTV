// /api/proxy.js
import fetch from 'node-fetch';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    setCorsHeaders(res);
    return res.status(405).json({ error: 'Method Not Allowed', message: 'This proxy only accepts POST requests.' });
  }

  try {
    const { url: targetUrl } = req.body;
    if (!targetUrl) {
      throw new Error('Missing "url" in request body.');
    }
    
    new URL(targetUrl); // Validate URL format

    console.log(`[PROXY START] Forwarding to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET', // We are fetching the target as GET
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://movie.douban.com/', // Crucial for some sites
      }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PROXY TARGET ERROR] Status: ${response.status}, URL: ${targetUrl}, Response: ${errorText}`);
        setCorsHeaders(res);
        return res.status(response.status).send(errorText);
    }
    
    console.log(`[PROXY SUCCESS] Status: ${response.status} from ${targetUrl}`);
    
    setCorsHeaders(res);
    res.status(response.status);
    response.headers.forEach((value, key) => {
        if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            res.setHeader(key, value);
        }
    });

    const buffer = await response.buffer();
    res.send(buffer);

  } catch (error) {
    console.error(`[PROXY FATAL ERROR] ${error.message}`);
    setCorsHeaders(res);
    res.status(500).json({ error: 'Proxy Internal Error', message: error.message });
  }
}
