/**
 * MorphoTV 代理服务器 - Vercel Edge Functions 版本
 * 
 * 使用方法：
 * 1. 部署到 Vercel
 * 2. 使用 https://your-app.vercel.app/api/proxy?url=目标URL 作为代理地址
 * 3. 代理格式：/api/proxy?url=https://api.example.com/data
 * 
 * 示例：
 * /api/proxy?url=https://api.example.com/data
 * /api/proxy?url=http://localhost:3000/api/test
 */

import { NextRequest, NextResponse } from 'next/server'

// 允许的域名白名单（通过环境变量配置）
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS?.split(',') || []

// CORS 响应头
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent',
    'Access-Control-Max-Age': '86400',
  }
}

// 验证目标 URL 的安全性
function validateTargetUrl(url: string): { isValid: boolean; error?: string } {
  try {
    const targetUrl = new URL(url)
    
    // 检查协议
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' }
    }
    
    // 防止 SSRF 攻击 - 禁止访问内网地址
    const hostname = targetUrl.hostname.toLowerCase()
    const forbiddenHosts = [
      'localhost', '127.0.0.1', '0.0.0.0',
      '10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.',
      '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.',
      '172.27.', '172.28.', '172.29.', '172.30.', '172.31.',
      '192.168.', '169.254.'
    ]
    
    if (forbiddenHosts.some(host => hostname.includes(host))) {
      return { isValid: false, error: 'Access to internal networks is not allowed' }
    }
    
    // 检查域名白名单（如果配置了）
    if (ALLOWED_DOMAINS.length > 0 && !ALLOWED_DOMAINS.some(domain => hostname.includes(domain))) {
      return { isValid: false, error: 'Domain not in allowed list' }
    }
    
    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

// 处理代理请求
async function handleProxyRequest(request: NextRequest, targetUrl: string) {
  try {
    // 验证目标 URL
    const validation = validateTargetUrl(targetUrl)
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Invalid target URL',
        message: validation.error,
        timestamp: new Date().toISOString()
      }, {
        status: 400,
        headers: corsHeaders(),
      })
    }

    // 创建代理请求头
    const proxyHeaders = new Headers()
    
    // 复制必要的请求头
    const allowedHeaders = [
      'accept', 'accept-language', 'authorization', 'content-type',
      'user-agent', 'referer', 'origin', 'x-requested-with'
    ]
    
    for (const [key, value] of request.headers.entries()) {
      const lowerKey = key.toLowerCase()
      if (allowedHeaders.includes(lowerKey)) {
        proxyHeaders.set(key, value)
      }
    }

    // 设置默认 User-Agent
    if (!proxyHeaders.has('user-agent')) {
      proxyHeaders.set('User-Agent', 'MorphoTV-Proxy/1.0')
    }

    // 构建代理请求配置
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: proxyHeaders,
    }

    // 处理请求体
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.arrayBuffer()
        if (body.byteLength > 0) {
          fetchOptions.body = body
        }
      } catch (error) {
        console.warn('Failed to read request body:', error)
      }
    }

    // 发送代理请求
    const response = await fetch(targetUrl, fetchOptions)
    
    // 创建响应头
    const responseHeaders = new Headers(corsHeaders())
    
    // 复制重要的响应头
    const importantHeaders = [
      'content-type', 'cache-control', 'expires', 'last-modified',
      'etag', 'location', 'set-cookie'
    ]
    
    for (const [key, value] of response.headers.entries()) {
      const lowerKey = key.toLowerCase()
      if (importantHeaders.includes(lowerKey)) {
        responseHeaders.set(key, value)
      }
    }
    
    // 流式处理响应体
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })

  } catch (error) {
    console.error('Proxy request failed:', error)
    
    return NextResponse.json({
      error: 'Proxy request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      targetUrl: targetUrl,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: corsHeaders(),
    })
  }
}

// GET 请求处理
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  
  // 从查询参数中获取目标 URL
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    // 返回状态页面 JSON
    return NextResponse.json({
      service: 'MorphoTV Proxy Server',
      status: 'running',
      version: '2.0.0',
      platform: 'Vercel Edge Functions',
      usage: {
        endpoint: `${url.origin}/api/proxy`,
        format: '/api/proxy?url={完整URL}',
        example: '/api/proxy?url=https://httpbin.org/get'
      },
      features: [
        '全球边缘网络',
        '支持 CORS 跨域请求',
        '智能请求头转发',
        '支持所有 HTTP 方法',
        '零冷启动延迟',
        '安全性增强',
        '流式响应处理'
      ],
      security: [
        'SSRF 攻击防护',
        '内网地址访问限制',
        '域名白名单支持',
        'URL 格式验证'
      ]
    }, {
      headers: corsHeaders(),
    })
  }

  // 验证 URL 格式
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    return NextResponse.json({
      error: 'Invalid target URL',
      message: 'Target URL must start with http:// or https://',
      usage: 'Use /api/proxy?url={完整URL} format',
      example: '/api/proxy?url=https://api.example.com/data'
    }, {
      status: 400,
      headers: corsHeaders(),
    })
  }

  return handleProxyRequest(request, targetUrl)
}

// POST 请求处理
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    return NextResponse.json({
      error: 'Missing target URL',
      message: 'Please provide target URL in query parameter',
      usage: 'Use /api/proxy?url={完整URL} format'
    }, {
      status: 400,
      headers: corsHeaders(),
    })
  }

  return handleProxyRequest(request, targetUrl)
}

// PUT 请求处理
export async function PUT(request: NextRequest) {
  return POST(request) // 复用 POST 的逻辑
}

// DELETE 请求处理
export async function DELETE(request: NextRequest) {
  return POST(request) // 复用 POST 的逻辑
}

// PATCH 请求处理
export async function PATCH(request: NextRequest) {
  return POST(request) // 复用 POST 的逻辑
}

// OPTIONS 请求处理（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

// 配置运行时
export const runtime = 'edge'
