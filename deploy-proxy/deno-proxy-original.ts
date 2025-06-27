// MorphoTV 代理服务器 - 原始 Deno 版本
// 适用于本地 Deno 运行时

// 启用 CORS 支持的函数
function enableCors(response: Response): Response {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// 处理代理请求的函数
async function handleProxyRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // 提取目标 URL (去掉 `/proxy/` 前缀)
  const targetUrl = decodeURIComponent(url.pathname.replace("/proxy/", ""));

  if (!targetUrl) {
    return enableCors(
      new Response(JSON.stringify({ error: "Target URL is required!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }

  try {
    // 创建新的 Headers 对象
    const headers = new Headers();

    // 复制原始请求头，但排除一些不需要的头
    for (const [key, value] of req.headers.entries()) {
      if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }

    // 添加必要的 User-Agent 头
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    );

    // 配置请求选项
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: headers,
    };

    // 如果请求不是 GET 方法，传递请求 body
    if (req.method !== "GET") {
      const body = await req.text();
      fetchOptions.body = body;
    }

    // 转发请求到目标服务器
    const proxyResponse = await fetch(targetUrl, fetchOptions);

    // 转发响应
    const responseBody = await proxyResponse.text();
    const response = new Response(responseBody, {
      status: proxyResponse.status,
      headers: proxyResponse.headers,
    });

    return enableCors(response);
  } catch (error) {
    console.error("Proxy error:", error);

    const errorMessage = {
      error: "Proxy error",
      message: error instanceof Error ? error.message : "Unknown error",
    };

    return enableCors(
      new Response(JSON.stringify(errorMessage), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }
}

// 处理 HTTP 请求的主函数
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") {
    // 处理预检请求
    return enableCors(new Response(null, { status: 204 }));
  } else if (url.pathname.startsWith("/proxy/")) {
    return handleProxyRequest(req);
  } else if (url.pathname === "/") {
    // 为根路径返回一个简单的页面
    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MorphoTV 代理服务器</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px; 
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .status { color: #28a745; font-weight: bold; }
          .endpoint { 
            background: #f8f9fa; 
            padding: 10px; 
            border-radius: 5px; 
            font-family: monospace; 
            border-left: 4px solid #007bff;
            margin: 15px 0;
          }
          h1 { color: #007bff; }
          .badge {
            background: #6c757d;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎬 MorphoTV 代理服务器</h1>
          <span class="badge">Deno Runtime</span>
          <p class="status">✅ 服务器运行正常</p>
          <h2>使用方法</h2>
          <p>在 MorphoTV 初始化界面输入以下代理地址：</p>
          <div class="endpoint">${req.url}proxy/</div>
          <h2>功能特性</h2>
          <ul>
            <li>✅ 支持 CORS 跨域请求</li>
            <li>✅ 自动转发请求头</li>
            <li>✅ 支持所有 HTTP 方法</li>
            <li>✅ 错误处理和日志记录</li>
            <li>✅ TypeScript 原生支持</li>
          </ul>
          <h2>本地运行</h2>
          <p>使用以下命令启动服务器：</p>
          <div class="endpoint">deno run --allow-net --allow-env deno-proxy-original.ts</div>
          <p><small>Powered by Deno Runtime</small></p>
        </div>
      </body>
      </html>
    `;
    return enableCors(new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }));
  } else {
    return enableCors(
      new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain" } }),
    );
  }
}

// 本地 Deno 运行时启动服务器
if (import.meta.main) {
  const port = Number(Deno.env.get("PORT")) || 8080;
  
  console.log(`🦕 MorphoTV 代理服务器启动中...`);
  console.log(`📍 服务器地址: http://localhost:${port}`);
  console.log(`🔗 代理端点: http://localhost:${port}/proxy/`);
  
  Deno.serve({ port }, handler);
}

// 导出 handler 函数供 Deno Deploy 使用
export default handler;
