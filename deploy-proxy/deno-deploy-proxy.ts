// MorphoTV 代理服务器 - Deno Deploy 版本
// 专为 Deno Deploy 平台优化

// 启用 CORS 支持的函数
function enableCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

// 处理代理请求的函数
async function handleProxyRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // 提取目标 URL (去掉 `/proxy/` 前缀)
  const targetUrl = decodeURIComponent(url.pathname.replace("/proxy/", ""));
  
  if (!targetUrl) {
    return new Response(JSON.stringify({ 
      error: "Target URL is required!",
      usage: "Use /proxy/{encoded-target-url} format"
    }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });
  }

  try {
    // 创建新的 Headers 对象
    const proxyHeaders = new Headers();
    
    // 复制原始请求头，但排除一些不需要的头
    for (const [key, value] of req.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (!["host", "connection", "content-length", "cf-ray", "cf-connecting-ip"].includes(lowerKey)) {
        proxyHeaders.set(key, value);
      }
    }

    // 设置必要的请求头
    proxyHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    
    // 配置请求选项
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: proxyHeaders,
    };

    // 如果请求不是 GET 或 HEAD 方法，传递请求 body
    if (req.method !== "GET" && req.method !== "HEAD") {
      fetchOptions.body = await req.arrayBuffer();
    }

    // 转发请求到目标服务器
    const proxyResponse = await fetch(targetUrl, fetchOptions);
    
    // 创建响应并启用 CORS
    return enableCors(proxyResponse);
    
  } catch (error) {
    console.error("Proxy error:", error);

    const errorResponse = new Response(JSON.stringify({
      error: "Proxy request failed",
      message: error instanceof Error ? error.message : "Unknown error",
      targetUrl: targetUrl
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });
    
    return errorResponse;
  }
}

// 主请求处理函数
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // 处理 CORS 预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  
  // 处理代理请求
  if (url.pathname.startsWith("/proxy/")) {
    return handleProxyRequest(req);
  }
  
  // 处理根路径 - 返回状态页面
  if (url.pathname === "/") {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MorphoTV 代理服务器 - Deno Deploy</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
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
            content: "🦕 ";
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
        <span class="badge">Deno Deploy</span>
        <p class="status">🦕 服务器运行正常</p>
        
        <h2>使用方法</h2>
        <p>在 MorphoTV 初始化界面输入以下代理地址：</p>
        <div class="endpoint">${url.origin}/proxy/</div>
        
        <h2>功能特性</h2>
        <div class="feature">支持 CORS 跨域请求</div>
        <div class="feature">自动转发请求头</div>
        <div class="feature">支持所有 HTTP 方法</div>
        <div class="feature">错误处理和日志记录</div>
        <div class="feature">优化的性能和稳定性</div>
        <div class="feature">TypeScript 原生支持</div>
        
        <h2>测试接口</h2>
        <p>访问 <code>/proxy/https://httpbin.org/get</code> 来测试代理功能</p>
        
        <p style="margin-top: 30px; color: #d1d5db; font-size: 14px;">
            <small>Powered by Deno Deploy | 现代 JavaScript 运行时</small>
        </p>
    </div>
</body>
</html>`;
    
    return new Response(html, {
      status: 200,
      headers: { 
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      },
    });
  }
  
  // 处理其他路径
  return new Response(JSON.stringify({
    error: "Not Found",
    message: "Available endpoints: / (status), /proxy/{url} (proxy)"
  }), {
    status: 404,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
  });
}

// 导出默认处理函数供 Deno Deploy 使用
export default handler;
