/** @type {import('next').NextConfig} */
const nextConfig = {
  // 优化构建配置
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // 输出配置
  output: 'standalone',

  // 压缩配置
  compress: true,

  // 优化配置
  swcMinify: true,

  // 实验性功能
  experimental: {
    serverComponentsExternalPackages: [],
    optimizeCss: true,
  },

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
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS,
  },
}

module.exports = nextConfig
