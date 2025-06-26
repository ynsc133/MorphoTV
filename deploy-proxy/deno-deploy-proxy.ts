/**
 * MorphoTV 代理服务器 - Deno Deploy 最佳优化版本
 * 
 * 特性：
 * - 修复 ISOLATE_INTERNAL_FAILURE 错误
 * - 优化性能和内存使用
 * - 完整的错误处理
 * - 支持所有 HTTP 方法
 * - 智能请求头处理
 */

// CORS 配置
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Accept-Language, Cache-Control",
  "Access-Control-Max-Age": "86400",
};

// 不需要转发的请求头
const EXCLUDED_HEADERS = new Set([
  "host", "connection", "content-length", "transfer-encoding",
  "cf-ray", "cf-connecting-ip", "cf-visitor", "cf-ipcountry",
  "x-forwarded-for", "x-forwarded-proto", "x-real-ip"
]);

// 重要的响应头
const IMPORTANT_RESPONSE_HEADERS = new Set([
  "content-type", "content-encoding", "cache-control", 
  "etag", "last-modified", "expires", "vary"
]);

/**
 * 创建带 CORS 的响应
 */
function createResponse(body: string | ArrayBuffer | null, options: {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
} = {}): Response {
  const headers = new Headers();
  
  // 添加 CORS 头
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // 添加自定义头
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }
  
  return new Response(body, {
    status: options.status || 200,
    statusText: options.statusText,
    headers,
  });
}

/**
 * 处理代理请求
 */
async function handleProxyRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // 提取目标 URL
  const targetUrl = decodeURIComponent(url.pathname.replace("/proxy/", ""));
  
  if (!targetUrl) {
    return createResponse(JSON.stringify({
      error: "Target URL is required",
      usage: "Use /proxy/{encoded-target-url} format",
      example: "/proxy/https%3A//api.example.com/data"
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // 验证目标 URL
  try {
    new URL(targetUrl);
  } catch {
    return createResponse(JSON.stringify({
      error: "Invalid target URL",
      targetUrl: targetUrl
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    // 构建代理请求头
    const proxyHeaders = new Headers();
    
    // 复制允许的请求头
    for (const [key, value] of request.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (!EXCLUDED_HEADERS.has(lowerKey)) {
        proxyHeaders.set(key, value);
      }
    }
    
    // 设置必要的请求头
    proxyHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    
    // 构建代理请求
    const proxyRequestInit: RequestInit = {
      method: request.method,
      headers: proxyHeaders,
    };
    
    // 处理请求体
    if (request.method !== "GET" && request.method !== "HEAD") {
      proxyRequestInit.body = request.body;
    }
    
    // 发送代理请求
    const proxyResponse = await fetch(targetUrl, proxyRequestInit);
    
    // 读取响应内容 - 使用 arrayBuffer 避免流处理问题
    const responseData = await proxyResponse.arrayBuffer();
    
    // 构建响应头
    const responseHeaders: Record<string, string> = {};
    
    // 复制重要的响应头
    for (const [key, value] of proxyResponse.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (IMPORTANT_RESPONSE_HEADERS.has(lowerKey)) {
        responseHeaders[key] = value;
      }
    }
    
    // 返回代理响应
    return createResponse(responseData, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error("Proxy request failed:", error);
    
    return createResponse(JSON.stringify({
      error: "Proxy request failed",
      message: error instanceof Error ? error.message : "Unknown error",
      targetUrl: targetUrl,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * 生成状态页面
 */
function generateStatusPage(request: Request): Response {
  const url = new URL(request.url);
  
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MorphoTV 代理服务器</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; text-align: center; }
        .status { 
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid #4caf50;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
        }
        .endpoint {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 15px;
            margin: 15px 0;
            font-family: 'Monaco', 'Menlo', monospace;
            word-break: break-all;
            border-left: 4px solid #4caf50;
        }
        .feature {
            display: flex;
            align-items: center;
            margin: 10px 0;
            padding: 8px 0;
        }
        .feature::before {
            content: "✅";
            margin-right: 12px;
            font-size: 1.2em;
        }
        .section { margin: 30px 0; }
        .badge {
            background: #4caf50;
            color: #000;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .test-link {
            color: #4caf50;
            text-decoration: none;
            font-weight: bold;
        }
        .test-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 MorphoTV 代理服务器</h1>
        <div class="badge">Deno Deploy 优化版</div>
        
        <div class="status">
            🚀 服务器运行正常
        </div>
        
        <div class="section">
            <h2>📍 代理地址</h2>
            <div class="endpoint">${url.origin}/proxy/</div>
        </div>
        
        <div class="section">
            <h2>✨ 功能特性</h2>
            <div class="feature">支持所有 HTTP 方法</div>
            <div class="feature">智能 CORS 处理</div>
            <div class="feature">优化的性能和内存使用</div>
            <div class="feature">完整的错误处理</div>
            <div class="feature">全球 CDN 加速</div>
        </div>
        
        <div class="section">
            <h2>🧪 测试接口</h2>
            <p>点击测试: <a href="/proxy/https://httpbin.org/get" class="test-link" target="_blank">测试代理功能</a></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; opacity: 0.8; font-size: 0.9em;">
            Powered by Deno Deploy | 版本 2.0 优化版
        </div>
    </div>
</body>
</html>`;
  
  return createResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

/**
 * 主请求处理函数
 */
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // 处理 CORS 预检请求
  if (request.method === "OPTIONS") {
    return createResponse(null, { status: 204 });
  }
  
  // 路由处理
  if (url.pathname === "/") {
    return generateStatusPage(request);
  }
  
  if (url.pathname === "/health") {
    return createResponse(JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "2.0-optimized"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  if (url.pathname.startsWith("/proxy/")) {
    return handleProxyRequest(request);
  }
  
  // 404 处理
  return createResponse(JSON.stringify({
    error: "Not Found",
    message: "Available endpoints: / (status), /proxy/{url} (proxy), /health (health check)"
  }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}

// 导出默认处理函数
export default handleRequest;
