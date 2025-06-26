/**
 * MorphoTV 代理服务器 - Cloudflare Workers 版本
 * 
 * 部署步骤：
 * 1. 访问 https://dash.cloudflare.com/
 * 2. 进入 Workers & Pages
 * 3. 创建新的 Worker
 * 4. 复制此代码到编辑器
 * 5. 点击 "Save and Deploy"
 */

// 启用 CORS 的响应处理函数
function corsResponse(response, origin = '*') {
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  // 如果是简单的字符串响应
  if (typeof response === 'string') {
    return new Response(response, {
      headers: {
        'Content-Type': 'text/plain',
        ...corsHeaders,
      },
    });
  }

  // 如果是 Response 对象
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// 处理代理请求
async function handleProxyRequest(request, targetUrl) {
  try {
    // 创建新的请求头
    const proxyHeaders = new Headers();
    
    // 复制原始请求头，排除一些不需要的头
    for (const [key, value] of request.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (!['host', 'cf-ray', 'cf-connecting-ip', 'cf-visitor', 'x-forwarded-proto', 'x-real-ip'].includes(lowerKey)) {
        proxyHeaders.set(key, value);
      }
    }

    // 设置必要的请求头
    proxyHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 构建代理请求
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });

    // 发送代理请求
    const response = await fetch(proxyRequest);
    
    // 返回带 CORS 的响应
    return corsResponse(response);

  } catch (error) {
    console.error('Proxy request failed:', error);
    
    return corsResponse(JSON.stringify({
      error: 'Proxy request failed',
      message: error.message || 'Unknown error',
      targetUrl: targetUrl,
      timestamp: new Date().toISOString()
    }), '*');
  }
}

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 处理代理请求
    if (url.pathname.startsWith('/proxy/')) {
      const targetUrl = decodeURIComponent(url.pathname.replace('/proxy/', ''));
      
      if (!targetUrl) {
        return corsResponse(JSON.stringify({
          error: 'Target URL is required',
          usage: 'Use /proxy/{encoded-target-url} format',
          example: '/proxy/https%3A//api.example.com/data'
        }));
      }

      return handleProxyRequest(request, targetUrl);
    }

    // 处理根路径 - 返回状态页面
    if (url.pathname === '/') {
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MorphoTV 代理服务器 - Cloudflare Workers</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .status { 
            color: #4ade80; 
            font-weight: bold; 
            font-size: 18px;
        }
        .endpoint { 
            background: rgba(0, 0, 0, 0.2); 
            padding: 15px; 
            border-radius: 8px; 
            font-family: 'Monaco', 'Menlo', monospace;
            border-left: 4px solid #4ade80;
            margin: 15px 0;
            word-break: break-all;
        }
        .feature {
            margin: 10px 0;
            padding: 8px 0;
        }
        .feature::before {
            content: "✅ ";
            margin-right: 8px;
        }
        h1 { color: #fbbf24; }
        h2 { color: #e5e7eb; margin-top: 30px; }
        .badge {
            background: #4ade80;
            color: #000;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 MorphoTV 代理服务器</h1>
        <span class="badge">Cloudflare Workers</span>
        <p class="status">✅ 服务器运行正常</p>
        
        <h2>使用方法</h2>
        <p>在 MorphoTV 初始化界面输入以下代理地址：</p>
        <div class="endpoint">${url.origin}/proxy/</div>
        
        <h2>功能特性</h2>
        <div class="feature">全球 CDN 加速</div>
        <div class="feature">支持 CORS 跨域请求</div>
        <div class="feature">自动转发请求头</div>
        <div class="feature">支持所有 HTTP 方法</div>
        <div class="feature">高可用性和稳定性</div>
        <div class="feature">零配置部署</div>
        
        <h2>测试接口</h2>
        <p>访问 <code>/proxy/https://httpbin.org/get</code> 来测试代理功能</p>
        
        <p style="margin-top: 30px; color: #d1d5db; font-size: 14px;">
            <small>Powered by Cloudflare Workers | 全球边缘计算</small>
        </p>
    </div>
</body>
</html>`;
      
      return new Response(html, {
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    // 处理健康检查
    if (url.pathname === '/health') {
      return corsResponse(JSON.stringify({
        status: 'healthy',
        platform: 'Cloudflare Workers',
        timestamp: new Date().toISOString(),
        region: request.cf?.colo || 'unknown'
      }));
    }

    // 处理其他路径
    return corsResponse(JSON.stringify({
      error: 'Not Found',
      message: 'Available endpoints: / (status), /proxy/{url} (proxy), /health (health check)'
    }));
  },
};
