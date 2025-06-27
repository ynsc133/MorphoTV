/**
 * MorphoTV 代理服务器 - Pages Router 轻量级版本
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

import { Buffer } from 'buffer'

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
function validateTargetUrl(url) {
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
async function handleProxyRequest(req, res, targetUrl) {
  try {
    // 验证目标 URL
    const validation = validateTargetUrl(targetUrl)
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid target URL',
        message: validation.error,
        timestamp: new Date().toISOString()
      })
    }

    // 创建代理请求头
    const proxyHeaders = {}
    
    // 复制必要的请求头
    const allowedHeaders = [
      'accept', 'accept-language', 'authorization', 'content-type',
      'user-agent', 'referer', 'origin', 'x-requested-with'
    ]
    
    for (const [key, value] of Object.entries(req.headers)) {
      const lowerKey = key.toLowerCase()
      if (allowedHeaders.includes(lowerKey)) {
        proxyHeaders[key] = value
      }
    }

    // 设置默认 User-Agent
    if (!proxyHeaders['user-agent']) {
      proxyHeaders['User-Agent'] = 'MorphoTV-Proxy-Pages/1.0'
    }

    // 构建代理请求配置
    const fetchOptions = {
      method: req.method,
      headers: proxyHeaders,
    }

    // 处理请求体
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body)
    }

    // 发送代理请求
    const response = await fetch(targetUrl, fetchOptions)
    
    // 设置 CORS 头
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
    
    // 复制重要的响应头
    const importantHeaders = [
      'content-type', 'cache-control', 'expires', 'last-modified',
      'etag', 'location'
    ]
    
    for (const [key, value] of response.headers.entries()) {
      const lowerKey = key.toLowerCase()
      if (importantHeaders.includes(lowerKey)) {
        res.setHeader(key, value)
      }
    }
    
    // 设置状态码
    res.status(response.status)
    
    // 处理响应体
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      const data = await response.json()
      res.json(data)
    } else if (contentType.includes('text/')) {
      const text = await response.text()
      res.send(text)
    } else {
      const buffer = await response.arrayBuffer()
      res.send(Buffer.from(buffer))
    }

  } catch (error) {
    console.error('Proxy request failed:', error)
    
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message || 'Unknown error',
      targetUrl: targetUrl,
      timestamp: new Date().toISOString()
    })
  }
}

// 主处理函数
export default async function handler(req, res) {
  // 设置 CORS 头
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  // 处理 OPTIONS 请求（CORS 预检）
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // 获取目标 URL
  const { url: targetUrl } = req.query
  
  if (!targetUrl) {
    // 返回状态页面 JSON
    return res.status(200).json({
      service: 'MorphoTV Proxy Server',
      status: 'running',
      version: '2.0.0-pages',
      platform: 'Vercel Edge Functions (Pages Router)',
      usage: {
        endpoint: `${req.headers.host ? `https://${req.headers.host}` : 'https://your-app.vercel.app'}/api/proxy`,
        format: '/api/proxy?url={完整URL}',
        example: '/api/proxy?url=https://httpbin.org/get'
      },
      features: [
        '轻量级架构',
        '快速冷启动',
        '支持 CORS 跨域请求',
        '智能请求头转发',
        '支持所有 HTTP 方法',
        '安全性增强'
      ],
      security: [
        'SSRF 攻击防护',
        '内网地址访问限制',
        '域名白名单支持',
        'URL 格式验证'
      ]
    })
  }

  // 验证 URL 格式
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    return res.status(400).json({
      error: 'Invalid target URL',
      message: 'Target URL must start with http:// or https://',
      usage: 'Use /api/proxy?url={完整URL} format',
      example: '/api/proxy?url=https://api.example.com/data'
    })
  }

  return handleProxyRequest(req, res, targetUrl)
}

// 使用默认的 Node.js 运行时
