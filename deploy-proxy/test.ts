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
    // 为根路径返回一个优化的页面
    const proxyUrl = `${req.url}proxy/`;
    const jsonConfig = `{
  "PROXY_BASE_URL": "${proxyUrl}"
}`;
    const testUrl = `${req.url}proxy/https://httpbin.org/get`;

    const html = `
      <!DOCTYPE html>
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
            padding: 20px;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            max-width: 700px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-align: center;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .status {
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid #4caf50;
            border-radius: 12px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
            font-size: 1.1em;
          }
          .section { margin: 30px 0; }
          .section h2 {
            margin-bottom: 15px;
            color: #f0f0f0;
            font-size: 1.4em;
          }
          .copy-container {
            position: relative;
            margin: 15px 0;
          }
          .endpoint {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 15px 60px 15px 15px;
            font-family: 'Monaco', 'Menlo', monospace;
            word-break: break-all;
            border-left: 4px solid #4caf50;
            font-size: 0.9em;
            line-height: 1.4;
            position: relative;
          }
          .copy-btn {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: #4caf50;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 0.8em;
            font-weight: bold;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
            min-width: 70px;
            justify-content: center;
          }
          .copy-btn:hover {
            background: #45a049;
            transform: translateY(-50%) scale(1.05);
          }
          .copy-btn:active {
            transform: translateY(-50%) scale(0.95);
          }
          .copy-btn.copied {
            background: #2196f3;
            animation: pulse 0.6s ease-in-out;
          }
          @keyframes pulse {
            0% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-50%) scale(1.1); }
            100% { transform: translateY(-50%) scale(1); }
          }
          .feature {
            display: flex;
            align-items: center;
            margin: 12px 0;
            padding: 8px 0;
            font-size: 1.05em;
          }
          .feature::before {
            content: "✅";
            margin-right: 12px;
            font-size: 1.2em;
          }
          .test-section {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
          }
          .test-link {
            color: #4caf50;
            text-decoration: none;
            font-weight: bold;
            padding: 8px 16px;
            background: rgba(76, 175, 80, 0.2);
            border-radius: 8px;
            display: inline-block;
            transition: all 0.3s ease;
            border: 1px solid rgba(76, 175, 80, 0.3);
          }
          .test-link:hover {
            background: rgba(76, 175, 80, 0.3);
            transform: translateY(-2px);
          }
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
          .footer {
            text-align: center;
            margin-top: 30px;
            opacity: 0.8;
            font-size: 0.9em;
          }
          .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          .toast.show {
            transform: translateX(0);
          }
          @media (max-width: 768px) {
            .container { padding: 20px; margin: 10px; }
            h1 { font-size: 2em; }
            .endpoint { padding: 12px 50px 12px 12px; font-size: 0.8em; }
            .copy-btn { padding: 6px 8px; font-size: 0.7em; min-width: 60px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎬 MorphoTV 代理服务器</h1>
          <div class="badge">Deno Deploy</div>

          <div class="status">
            🚀 服务器运行正常
          </div>

          <div class="section">
            <h2>📍 代理地址</h2>
            <p style="margin-bottom: 10px; opacity: 0.9;">在 MorphoTV 初始化界面输入以下代理地址：</p>
            <div class="copy-container">
              <div class="endpoint" id="proxy-url">${proxyUrl}</div>
              <button class="copy-btn" onclick="copyToClipboard('proxy-url', this)">
                <span>📋</span>
                <span class="btn-text">复制</span>
              </button>
            </div>
          </div>

          <div class="section">
            <h2>⚙️ JSON 配置</h2>
            <p style="margin-bottom: 10px; opacity: 0.9;">或者复制以下 JSON 配置：</p>
            <div class="copy-container">
              <div class="endpoint" id="json-config">${jsonConfig}</div>
              <button class="copy-btn" onclick="copyToClipboard('json-config', this)">
                <span>📋</span>
                <span class="btn-text">复制</span>
              </button>
            </div>
          </div>

          <div class="section">
            <h2>✨ 功能特性</h2>
            <div class="feature">支持 CORS 跨域请求</div>
            <div class="feature">自动转发请求头</div>
            <div class="feature">支持所有 HTTP 方法</div>
            <div class="feature">错误处理和日志记录</div>
            <div class="feature">一键复制配置</div>
          </div>

          <div class="test-section">
            <h2>🧪 测试代理功能</h2>
            <p style="margin-bottom: 15px; opacity: 0.9;">点击下方链接测试代理是否正常工作：</p>
            <div class="copy-container">
              <a href="${testUrl}" target="_blank" class="test-link">🔗 测试代理功能</a>
              <button class="copy-btn" onclick="copyToClipboard('test-url', this)" style="position: relative; right: auto; top: auto; transform: none; margin-left: 10px;">
                <span>📋</span>
                <span class="btn-text">复制</span>
              </button>
              <div id="test-url" style="display: none;">${testUrl}</div>
            </div>
          </div>

          <div class="footer">
            Powered by Deno Deploy | 版本 2.0 优化版
          </div>
        </div>

        <div id="toast" class="toast"></div>

        <script>
          async function copyToClipboard(elementId, button) {
            try {
              const element = document.getElementById(elementId);
              const text = element.textContent.trim();

              // 使用现代 Clipboard API
              if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
              } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
              }

              // 更新按钮状态
              const btnText = button.querySelector('.btn-text');
              const originalText = btnText.textContent;

              button.classList.add('copied');
              btnText.textContent = '已复制';

              // 显示提示消息
              showToast('✅ 已复制到剪贴板');

              // 恢复按钮状态
              setTimeout(() => {
                button.classList.remove('copied');
                btnText.textContent = originalText;
              }, 2000);

            } catch (err) {
              console.error('复制失败:', err);
              showToast('❌ 复制失败，请手动复制', 'error');
            }
          }

          function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.style.background = type === 'error' ? '#f44336' : '#4caf50';
            toast.classList.add('show');

            setTimeout(() => {
              toast.classList.remove('show');
            }, 3000);
          }

          // 页面加载完成后的初始化
          document.addEventListener('DOMContentLoaded', function() {
            // 检查剪贴板 API 支持
            if (!navigator.clipboard) {
              console.warn('Clipboard API not supported, using fallback method');
            }
          });
        </script>
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
