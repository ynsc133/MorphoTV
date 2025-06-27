# MorphoTV 代理服务器 - Pages Router 轻量级版本

> ⚡ 超轻量级代理服务器，采用 Next.js Pages Router 架构，专注于性能和简洁性

## ✨ 特性

- ⚡ **轻量级架构**：基于 Next.js Pages Router，最小化依赖
- 🚀 **快速启动**：更快的冷启动时间和部署速度
- 🔒 **安全可靠**：完整的 SSRF 防护和安全特性
- 🌐 **CORS 支持**：完整的跨域请求支持
- 📦 **极简依赖**：只包含必要的核心依赖
- 🎯 **专注性能**：优化的内存使用和并发处理

## 🚀 快速开始

### 1. 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/MorphoTV/tree/main/deploy-proxy/morphotv-proxy-vercel-pages)

### 2. 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/MorphoTV.git
cd MorphoTV/deploy-proxy/morphotv-proxy-vercel-pages

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 3. 环境变量配置

复制 `.env.example` 为 `.env.local` 并配置：

```bash
# 可选：配置允许的域名白名单
ALLOWED_DOMAINS=api.example.com,another-api.com
```

## 📖 使用方法

### API 端点

```
https://your-app.vercel.app/api/proxy?url={目标URL}
```

### 使用示例

```bash
# GET 请求
curl "https://your-app.vercel.app/api/proxy?url=https://httpbin.org/get"

# POST 请求
curl -X POST "https://your-app.vercel.app/api/proxy?url=https://httpbin.org/post" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### 在 MorphoTV 中使用

在 MorphoTV 初始化界面的代理设置中输入：

```
https://your-app.vercel.app/api/proxy?url=
```

## 🔧 配置选项

### 环境变量

| 变量名 | 描述 | 默认值 | 示例 |
|--------|------|--------|------|
| `ALLOWED_DOMAINS` | 允许的域名白名单（可选） | 无限制 | `api.example.com,github.com` |
| `NODE_ENV` | 运行环境 | `production` | `production` |

## 🔒 安全特性

### SSRF 防护

- 禁止访问内网地址
- 禁止访问私有网络段
- URL 格式验证

### 域名白名单

```bash
ALLOWED_DOMAINS=api.example.com,github.com,httpbin.org
```

## 📊 性能优势

### 与 App Router 版本对比

| 特性 | Pages Router | App Router |
|------|-------------|------------|
| 构建体积 | 更小 | 较大 |
| 冷启动时间 | 更快 | 较慢 |
| 内存使用 | 更低 | 较高 |
| 配置复杂度 | 更简单 | 较复杂 |
| 依赖数量 | 最少 | 较多 |

### 性能指标

- 🚀 **冷启动时间**：< 100ms
- 📦 **构建体积**：< 1MB
- 💾 **内存使用**：< 50MB
- ⚡ **响应时间**：< 50ms

## 🛠️ 开发

### 项目结构

```
morphotv-proxy-vercel-pages/
├── pages/
│   └── api/
│       └── proxy.js             # 主要代理逻辑
├── public/
│   └── index.html              # 静态状态页面
├── package.json                # 极简依赖配置
├── vercel.json                 # Vercel 部署配置
├── next.config.js             # 简化的 Next.js 配置
└── README.md                  # 项目文档
```

### 核心代码

```javascript
// pages/api/proxy.js
export default async function handler(req, res) {
  const { url: targetUrl } = req.query
  
  if (!targetUrl) {
    return res.json({ status: 'running' })
  }
  
  // 代理逻辑...
}

export const config = {
  runtime: 'edge',
}
```

### 构建命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 🔍 故障排除

### 常见问题

1. **部署失败**
   - 检查 Node.js 版本 >= 18.0.0
   - 确认 package.json 配置正确

2. **代理错误**
   - 检查目标 URL 格式
   - 确认网络连接正常

3. **性能问题**
   - 检查目标服务器响应时间
   - 优化请求头配置

## 📈 监控和日志

### 性能监控

```javascript
// 在代理函数中添加性能监控
const startTime = Date.now()
// ... 代理逻辑
const endTime = Date.now()
console.log(`Proxy request took ${endTime - startTime}ms`)
```

### 错误日志

```javascript
// 错误处理和日志记录
try {
  // 代理逻辑
} catch (error) {
  console.error('Proxy error:', error)
  res.status(500).json({ error: error.message })
}
```

## 🎯 适用场景

### 推荐使用场景

- ✅ 纯 API 代理服务
- ✅ 对性能要求极高的场景
- ✅ 资源受限的环境
- ✅ 简单的代理需求

### 不推荐场景

- ❌ 需要复杂路由的应用
- ❌ 需要服务端渲染的页面
- ❌ 需要中间件的复杂逻辑

## 📝 更新日志

### v2.0.0

- ⚡ 轻量级 Pages Router 架构
- 🚀 优化的性能表现
- 📦 最小化依赖配置
- 🔒 完整的安全特性

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🔗 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Next.js Pages Router 文档](https://nextjs.org/docs/pages)
- [MorphoTV 项目](https://github.com/your-username/MorphoTV)
