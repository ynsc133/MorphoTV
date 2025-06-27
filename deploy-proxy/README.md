# MorphoTV 云端代理服务器部署方案

> ☁️ 为 MorphoTV 项目提供的云端代理服务器解决方案，解决跨域请求问题

## 📋 方案概览

本文件夹包含了 **4 种云端代理服务器部署方案**，每种方案都有其独特的优势和适用场景：

| 方案 | 平台 | 难度 | 性能 | 成本 | 推荐指数 |
|------|------|------|------|------|----------|
| [Deno Deploy](#1-deno-deploy) | 云端 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| [Cloudflare Workers](#2-cloudflare-workers) | 云端 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| [Vercel Edge Functions](#3-vercel-edge-functions) | 云端 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| [Deno 本地运行](#4-deno-本地运行) | 本地 | ⭐ | ⭐⭐⭐ | 免费 | ⭐⭐⭐ |

> 🏠 **本地部署**: 如需本地 Express 服务器部署，请查看 [`../server/`](../server/) 文件夹

## 🚀 快速开始

### 推荐方案选择

- **☁️ 云端部署**: Deno Deploy (最简单)
- **🌐 全球加速**: Cloudflare Workers
- **⚡ 零配置**: Vercel Edge Functions
- **🦕 本地 Deno**: Deno 本地运行

---

## 1. Deno Deploy

### 📁 文件
- `deno-deploy-proxy.ts` - Deno Deploy 优化版本

### ✨ 特点
- ✅ 零配置部署
- ✅ 全球 CDN 加速
- ✅ TypeScript 原生支持
- ✅ 自动扩缩容
- ✅ 免费额度充足

### 🛠️ 部署步骤

1. **访问 Deno Deploy**
   ```
   https://dash.deno.com/
   ```

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from local file"

3. **上传文件**
   - 上传 `deno-deploy-proxy.ts` 文件
   - 点击 "Deploy"

4. **获取地址**
   - 复制项目 URL: `https://your-project.deno.dev`
   - 代理地址: `https://your-project.deno.dev/proxy/`

### 🔧 配置
```json
{
  "PROXY_BASE_URL": "https://your-project.deno.dev/proxy/"
}
```

### 💡 适用场景
- 快速原型开发
- 个人项目
- 不想维护服务器
- 需要全球访问

---

## 2. Cloudflare Workers

### 📁 文件
- `cloudflare-worker.js` - Cloudflare Workers 代码

### ✨ 特点
- ✅ 全球边缘计算
- ✅ 极低延迟
- ✅ 强大的免费额度
- ✅ 自动 DDoS 防护
- ✅ 高可用性

### 🛠️ 部署步骤

1. **访问 Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com/
   ```

2. **进入 Workers & Pages**
   - 点击 "Workers & Pages"
   - 点击 "Create application"
   - 选择 "Create Worker"

3. **部署代码**
   - 复制 `cloudflare-worker.js` 的内容
   - 粘贴到编辑器中
   - 点击 "Save and Deploy"

4. **获取地址**
   - 代理地址: `https://your-worker.your-subdomain.workers.dev/proxy/`

### 🔧 配置
```json
{
  "PROXY_BASE_URL": "https://your-worker.your-subdomain.workers.dev/proxy/"
}
```

### 💡 适用场景
- 高性能需求
- 全球用户访问
- 需要 CDN 加速
- 企业级应用

---

## 3. Vercel Edge Functions

### 📁 文件
- `vercel-edge-function.ts` - Vercel Edge Functions 代码

### ✨ 特点
- ✅ 零冷启动
- ✅ 全球边缘网络
- ✅ 与 Next.js 完美集成
- ✅ 自动 HTTPS
- ✅ 简单部署

### 🛠️ 部署步骤

#### 方法一：GitHub 自动部署（推荐）

1. **准备项目文件**
   ```bash
   # 1. 创建项目目录
   mkdir morphotv-proxy-vercel
   cd morphotv-proxy-vercel

   # 2. 初始化项目
   npm init -y
   ```

2. **安装依赖**
   ```bash
   # 安装 Next.js 和相关依赖
   npm install next@latest react@latest react-dom@latest
   npm install -D typescript @types/react @types/node
   ```

3. **创建项目结构**

   **选择一种路由方式**：

   **App Router（推荐，Next.js 13+）**：
   ```bash
   # 创建 App Router 目录结构
   mkdir -p app/api/proxy/[...slug]

   # 复制代码文件
   cp ../vercel-edge-function.ts app/api/proxy/[...slug]/route.ts
   ```

   **Pages Router（兼容旧版本）**：
   ```bash
   # 创建 Pages Router 目录结构
   mkdir -p pages/api/proxy

   # 复制代码文件
   cp ../vercel-edge-function.ts pages/api/proxy/[...slug].ts
   ```

4. **配置 package.json**
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     }
   }
   ```

5. **推送到 GitHub 并连接 Vercel**
   - 将项目推送到 GitHub 仓库
   - 在 [Vercel Dashboard](https://vercel.com/dashboard) 导入项目
   - Vercel 会自动检测 Next.js 项目并部署

#### 方法二：Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录并部署**
   ```bash
   # 登录 Vercel
   vercel login

   # 部署项目
   vercel --prod
   ```

#### 方法三：单文件部署（最简单）

1. **创建最小项目**
   ```bash
   mkdir morphotv-proxy-simple
   cd morphotv-proxy-simple

   # 创建 package.json
   echo '{"type": "module"}' > package.json

   # 创建 API 路由
   mkdir -p api/proxy
   cp ../vercel-edge-function.ts api/proxy/[...slug].ts
   ```

2. **直接部署**
   ```bash
   vercel --prod
   ```

### 🔧 配置

部署成功后，在 MorphoTV 中使用以下配置：

```json
{
  "PROXY_BASE_URL": "https://your-app.vercel.app/api/proxy/"
}
```

**注意事项**：
- 替换 `your-app` 为您的实际 Vercel 应用名称
- 确保 URL 以 `/api/proxy/` 结尾
- Vercel 会自动提供 HTTPS 证书

**测试代理功能**：
访问 `https://your-app.vercel.app/api/proxy/https/httpbin.org/get` 测试是否正常工作。

### 💡 适用场景
- Next.js 项目
- 需要与前端集成
- 快速部署需求
- 现代化技术栈

---

## 4. Deno 本地运行

### 📁 文件
- `deno-proxy-original.ts` - 本地 Deno 运行版本

### ✨ 特点
- ✅ 无需 Node.js
- ✅ TypeScript 原生支持
- ✅ 安全的运行时
- ✅ 现代化 API
- ✅ 零配置启动

### 🛠️ 部署步骤

1. **安装 Deno**
   ```bash
   # Windows (PowerShell)
   irm https://deno.land/install.ps1 | iex
   
   # macOS/Linux
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **运行服务器**
   ```bash
   # 启动服务器（默认端口8080）
   deno run --allow-net --allow-env deno-proxy-original.ts

   # 指定自定义端口
   PORT=3000 deno run --allow-net --allow-env deno-proxy-original.ts
   ```

### 🔧 配置
- **默认端口**: 8080
- **代理地址**: `http://localhost:8080/proxy/` （默认）或 `http://localhost:3000/proxy/` （自定义端口）
- **状态页面**: `http://localhost:8080/` （默认）或 `http://localhost:3000/` （自定义端口）

### 💡 适用场景
- Deno 开发环境
- 学习现代 JavaScript
- 安全性要求高
- 简单快速启动

---

## 🔧 MorphoTV 配置方法

无论选择哪种部署方案，在 MorphoTV 初始化界面中都需要配置代理地址：

### JSON 配置格式
```json
{
  "PROXY_BASE_URL": "你的代理地址/proxy/"
}
```

### 配置步骤
1. 打开 MorphoTV 应用
2. 在初始化对话框中选择 "JSON数据" 标签页
3. 输入上述 JSON 配置
4. 点击 "导入JSON数据"
5. 系统自动重新加载

---

## 🔍 故障排除

### 常见问题

#### 1. 代理服务器无法访问
- 检查服务器是否正常运行
- 确认端口没有被防火墙阻止
- 验证代理地址格式是否正确

#### 2. CORS 错误
- 确认代理服务器已启用 CORS
- 检查请求头是否正确设置
- 验证目标 URL 是否可访问

#### 3. 请求超时
- 检查网络连接
- 增加请求超时时间
- 尝试更换代理服务器

### 测试方法

访问以下地址测试代理功能：
```
你的代理地址/proxy/https://httpbin.org/get
```

应该返回 JSON 格式的响应数据。

---

## 📊 性能对比

| 指标 | Express | Deno Deploy | Cloudflare | Vercel | Deno 本地 |
|------|---------|-------------|------------|--------|-----------|
| 冷启动时间 | 0ms | ~100ms | ~5ms | ~10ms | 0ms |
| 全球延迟 | 取决于服务器 | <50ms | <20ms | <30ms | 本地 |
| 并发处理 | 高 | 很高 | 极高 | 高 | 中等 |
| 免费额度 | 无限制* | 100万请求/月 | 10万请求/天 | 100GB/月 | 无限制 |
| 自定义域名 | ✅ | ✅ | ✅ | ✅ | ❌ |

*需要自己的服务器

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这些代理服务器方案！

## 📄 许可证

MIT License - 详见各文件头部注释

---

**选择建议**: 
- 🚀 **快速开始**: Deno Deploy
- 🏠 **本地开发**: Express 本地服务器  
- ⚡ **最佳性能**: Cloudflare Workers
- 🔧 **易于集成**: Vercel Edge Functions
