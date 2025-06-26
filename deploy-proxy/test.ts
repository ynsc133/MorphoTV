import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

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
    // 配置请求选项
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: new Headers(req.headers),
    };

    // 删除不必要的头信息
    fetchOptions.headers.delete("host");
    fetchOptions.headers.delete("connection");

    // 添加必要的 User-Agent 头
    fetchOptions.headers.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    );

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

// 创建 Deno HTTP 服务器
const port = Number(Deno.env.get("PORT")) || 8080;

serve(req => {
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
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .status { color: #28a745; font-weight: bold; }
          .endpoint { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>🎬 MorphoTV 代理服务器</h1>
        <p class="status">✅ 服务器运行正常</p>
        <h2>使用方法</h2>
        <p>在 MorphoTV 初始化界面输入以下代理地址：</p>
        <div class="endpoint">${req.url}proxy/</div>
        <div class="endpoint">{
  "PROXY_BASE_URL": "${req.url}proxy/"
}</div>
        <h2>功能特性</h2>
        <ul>
          <li>✅ 支持 CORS 跨域请求</li>
          <li>✅ 自动转发请求头</li>
          <li>✅ 支持所有 HTTP 方法</li>
          <li>✅ 错误处理和日志记录</li>
        </ul>
        <p><small>Powered by Deno Deploy</small></p>
      </body>
      </html>
    `;
    return enableCors(new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }));
  } else {
    return enableCors(
      new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain" } }),
    );
  }
}, { port });

console.log(`🚀 MorphoTV 代理服务器运行在端口 ${port}`);
