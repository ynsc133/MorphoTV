# MorphoTV 代理服务器 - App Router 版本

> 🎬 专为 Vercel 平台优化的高性能代理服务器，采用 Next.js App Router 架构

## ✨ 特性

- 🚀 **现代化架构**：基于 Next.js 15.1.0 App Router
- ⚡ **Edge Runtime**：全球边缘网络，零冷启动延迟
- 🔒 **安全增强**：SSRF 防护、内网访问限制、域名白名单
- 🌐 **CORS 支持**：完整的跨域请求支持
- 📦 **精简依赖**：移除不必要的 React 组件，优化构建体积
- 🔄 **流式处理**：支持大文件的流式响应

## 🚀 快速开始

### 1. 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/MorphoTV/tree/main/deploy-proxy/morphotv-proxy-vercel)

### 2. 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/MorphoTV.git
cd MorphoTV/deploy-proxy/morphotv-proxy-vercel

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

# 带认证的请求
curl "https://your-app.vercel.app/api/proxy?url=https://api.github.com/user" \
  -H "Authorization: token YOUR_TOKEN"
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

### Vercel 配置

项目包含优化的 `vercel.json` 配置：

- Edge Runtime 配置
- CORS 头部设置
- 安全头部配置
- 路由重写规则

## 🔒 安全特性

### SSRF 防护

- 禁止访问内网地址（localhost, 127.0.0.1, 192.168.x.x 等）
- 禁止访问私有网络段
- URL 格式验证

### 域名白名单

通过 `ALLOWED_DOMAINS` 环境变量限制可访问的域名：

```bash
ALLOWED_DOMAINS=api.example.com,github.com,httpbin.org
```

### 请求头过滤

只转发必要的请求头，过滤敏感信息：

- `accept`, `accept-language`
- `authorization`, `content-type`
- `user-agent`, `referer`
- `origin`, `x-requested-with`

## 📊 性能优化

### 构建优化

- 移除 React 和 React-DOM 依赖
- 使用静态 HTML 状态页面
- 启用 SWC 压缩
- 优化的 TypeScript 配置

### 运行时优化

- Edge Runtime 全球分发
- 流式响应处理
- 智能请求头转发
- 优化的错误处理

## 🛠️ 开发

### 项目结构

```
morphotv-proxy-vercel/
├── app/
│   └── api/
│       └── proxy/
│           └── route.ts          # 主要代理逻辑
├── public/
│   └── index.html               # 静态状态页面
├── package.json                 # 精简的依赖配置
├── vercel.json                  # Vercel 部署配置
├── next.config.js              # Next.js 配置
└── README.md                   # 项目文档
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

# 类型检查
npm run type-check
```

## 🔍 故障排除

### 常见问题

1. **CORS 错误**
   - 检查目标 API 是否支持跨域请求
   - 确认请求头设置正确

2. **代理失败**
   - 检查目标 URL 格式是否正确
   - 确认目标服务器可访问

3. **域名限制**
   - 检查 `ALLOWED_DOMAINS` 配置
   - 确认目标域名在白名单中

### 调试

启用详细日志：

```bash
# 本地开发时查看控制台输出
npm run dev
```

## 📝 更新日志

### v2.0.0

- ✨ 简化 API 路由结构
- 🔒 增强安全性防护
- ⚡ 优化性能表现
- 📦 精简项目依赖
- 🎨 改进用户界面

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🔗 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [MorphoTV 项目](https://github.com/your-username/MorphoTV)
