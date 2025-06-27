/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基础配置
  reactStrictMode: false,
  
  // 构建优化
  swcMinify: true,
  compress: true,
  
  // 输出配置
  output: 'standalone',
  
  // 页面扩展名
  pageExtensions: ['js', 'jsx'],
  
  // 重写规则
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ]
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent',
          },
        ],
      },
    ]
  },
  
  // 环境变量
  env: {
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS,
  },
  
  // 实验性功能
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
