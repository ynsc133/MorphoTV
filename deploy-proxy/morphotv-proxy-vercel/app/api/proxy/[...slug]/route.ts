/**
 * MorphoTV 代理服务器 - Vercel Edge Functions 版本
 *
 * 部署步骤：
 * 1. 创建 app/api/proxy/[...slug]/route.ts 文件（App Router）
 *    或 pages/api/proxy/[...slug].ts 文件（Pages Router）
 * 2. 复制此代码到该文件
 * 3. 部署到 Vercel
 * 4. 使用 https://your-app.vercel.app/api/proxy/ 作为代理地址
 *
 * 注意：此代码同时兼容 App Router 和 Pages Router
 */

import { NextRequest, NextResponse } from 'next/server';

// 启用 CORS 的响应处理函数
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

// 处理代理请求
async function handleProxyRequest(request: NextRequest, targetUrl: string) {
  try {
    // 创建新的请求头
    const proxyHeaders = new Headers();
    
    // 复制原始请求头，排除一些不需要的头
    for (const [key, value] of request.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (!['host', 'x-forwarded-for', 'x-forwarded-proto', 'x-vercel-id'].includes(lowerKey)) {
        proxyHeaders.set(key, value);
      }
    }

    // 设置必要的请求头
    proxyHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 构建代理请求配置
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: proxyHeaders,
    };

    // 如果不是 GET 或 HEAD 请求，添加请求体
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = await request.arrayBuffer();
    }

    // 发送代理请求
    const response = await fetch(targetUrl, fetchOptions);
    
    // 创建响应
    const responseBody = await response.arrayBuffer();
    
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        ...corsHeaders(),
      },
    });

  } catch (error) {
    console.error('Proxy request failed:', error);
    
    return NextResponse.json({
      error: 'Proxy request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      targetUrl: targetUrl,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

// 主处理函数
export default async function handler(request: NextRequest) {
  const url = new URL(request.url);
  
  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // 从路径中提取目标 URL
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  // 移除 'api' 和 'proxy' 段
  const targetSegments = pathSegments.slice(2);
  
  if (targetSegments.length === 0) {
    // 返回状态页面
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MorphoTV 代理服务器 - Vercel Edge Functions</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: linear-gradient(135deg, #000000 0%, #434343 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .status { 
            color: #00ff88; 
            font-weight: bold; 
            font-size: 18px;
        }
        .endpoint { 
            background: rgba(0, 0, 0, 0.3); 
            padding: 15px; 
            border-radius: 8px; 
            font-family: 'Monaco', 'Menlo', monospace;
            border-left: 4px solid #00ff88;
            margin: 15px 0;
            word-break: break-all;
        }
        .feature {
            margin: 10px 0;
            padding: 8px 0;
        }
        .feature::before {
            content: "▲ ";
            margin-right: 8px;
            color: #00ff88;
        }
        h1 { color: #00ff88; }
        h2 { color: #e5e7eb; margin-top: 30px; }
        .badge {
            background: #00ff88;
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
        <span class="badge">Vercel Edge Functions</span>
        <p class="status">▲ 服务器运行正常</p>
        
        <h2>使用方法</h2>
        <p>在 MorphoTV 初始化界面输入以下代理地址：</p>
        <div class="endpoint">${url.origin}/api/proxy/</div>
        
        <h2>功能特性</h2>
        <div class="feature">全球边缘网络</div>
        <div class="feature">支持 CORS 跨域请求</div>
        <div class="feature">自动转发请求头</div>
        <div class="feature">支持所有 HTTP 方法</div>
        <div class="feature">零冷启动延迟</div>
        <div class="feature">自动扩缩容</div>
        
        <h2>测试接口</h2>
        <p>访问 <code>/api/proxy/https/httpbin.org/get</code> 来测试代理功能</p>
        
        <p style="margin-top: 30px; color: #d1d5db; font-size: 14px;">
            <small>Powered by Vercel Edge Functions | 全球边缘计算</small>
        </p>
    </div>
</body>
</html>`;
    
    return new NextResponse(html, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        ...corsHeaders()
      },
    });
  }

  // 重构目标 URL
  const targetUrl = targetSegments.join('/');
  
  if (!targetUrl) {
    return NextResponse.json({
      error: 'Target URL is required',
      usage: 'Use /api/proxy/{protocol}/{domain}/{path} format',
      example: '/api/proxy/https/api.example.com/data'
    }, {
      status: 400,
      headers: corsHeaders(),
    });
  }

  return handleProxyRequest(request, targetUrl);
}

// 配置运行时
export const config = {
  runtime: 'edge',
};

// 导出处理函数
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as OPTIONS };
