# MorphoTV 代理服务器部署指南

> 🚀 多平台部署方案和配置说明

## 📋 部署前准备

### 1. 环境要求

- Node.js >= 18.0.0（用于本地开发和测试）
- Git（用于版本控制）
- 选择一个云平台账户（免费）

### 2. 部署方案选择

| 推荐度 | 平台 | 特点 | 适用场景 |
|--------|------|------|----------|
| ⭐⭐⭐⭐⭐ | **Cloudflare Workers** | 全球边缘计算，免费额度高，性能极佳 | **首选方案**，适合所有用户 |
| ⭐⭐⭐⭐ | Deno Deploy | 现代 TypeScript 运行时 | TypeScript 优先项目 |
| ⭐⭐⭐⭐ | Vercel | 与 GitHub 完美集成，开发体验好 | Next.js 开发者，快速部署 |
| ⭐⭐⭐ | 本地部署 | 完全控制，无限制 | 企业内网，自建服务器 |

> 💡 **强烈推荐使用 Cloudflare Workers**：部署最简单，性能最好，免费额度最高！

## 🚀 方案一：Cloudflare Workers 部署（⭐ 强烈推荐）

> 🎯 **为什么选择 Cloudflare Workers？**
> - ✅ **零配置部署**：3 分钟即可完成
> - ✅ **全球边缘网络**：200+ 个数据中心
> - ✅ **超高免费额度**：每天 100,000 次请求
> - ✅ **毫秒级响应**：冷启动时间 <1ms
> - ✅ **自动 HTTPS**：无需配置 SSL 证书

### 步骤 1：准备代码

```bash
# 克隆项目
git clone https://github.com/your-username/MorphoTV.git
cd MorphoTV/deploy-proxy

# 查看 Cloudflare Workers 代码
cat cloudflare-worker.js
```

### 步骤 2：快速部署（仅需 3 分钟）

1. **访问 Cloudflare Workers**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Workers & Pages" 部分
   - 点击 "Create application"

2. **创建 Worker**
   - 选择 "Create Worker"
   - 给 Worker 起一个名字（如：morphotv-proxy）
   - 点击 "Deploy"

3. **上传代码**
   - 在 Worker 编辑器中，删除默认代码
   - 复制 `cloudflare-worker.js` 的内容并粘贴
   - 点击 "Save and Deploy"

### 步骤 3：获取代理地址

🎉 部署成功！您将获得类似以下的地址：

```text
https://morphotv-proxy.your-subdomain.workers.dev/?url=
```

**立即测试**：
```bash
curl "https://morphotv-proxy.your-subdomain.workers.dev/proxy/https://httpbin.org/get"
```

## ⚡ 方案二：Deno Deploy 部署

### 步骤 1：准备项目

```bash
# 确保已安装 Deno
curl -fsSL https://deno.land/x/install/install.sh | sh
```

### 步骤 2：部署到 Deno Deploy

1. **访问 Deno Deploy**
   - 登录 [Deno Deploy](https://dash.deno.com/)
   - 点击 "New Project"

2. **连接 GitHub**
   - 选择您的 GitHub 仓库
   - 设置入口文件为 `deploy-proxy/deno-deploy-proxy.ts`
   - 点击 "Link"

### 步骤 3：获取代理地址

部署成功后，您将获得类似以下的地址：
```text
https://your-project.deno.dev/proxy
```

## 🚀 方案三：Vercel 部署

### 步骤 1：准备项目

```bash
# 克隆项目
git clone https://github.com/your-username/MorphoTV.git
cd MorphoTV/deploy-proxy/vercel-deploy

# 安装依赖
npm install
```

### 步骤 2：本地测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000 查看状态页面
# 测试代理功能：http://localhost:3000/api/proxy?url=https://httpbin.org/get
```

### 步骤 3：部署到 Vercel

#### 方法 A：GitHub 自动部署（推荐）

1. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "Add MorphoTV proxy server"
   git push origin main
   ```

2. **连接 Vercel**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 选择 GitHub 仓库
   - 选择 `deploy-proxy/vercel-deploy` 目录
   - 点击 "Deploy"

#### 方法 B：Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

### 步骤 4：获取代理地址

部署成功后，您将获得类似以下的地址：
```text
https://your-app.vercel.app/api/proxy
```

## 🏠 方案三：本地部署

### 步骤 1：准备环境

```bash
# 克隆项目
git clone https://github.com/your-username/MorphoTV.git
cd MorphoTV/server

# 安装依赖
npm install
```

### 步骤 2：启动服务器

```bash
# 启动代理服务器
npm start

# 服务器将在 http://localhost:3000 启动
```

### 步骤 3：配置防火墙（可选）

如果需要外网访问，请配置防火墙开放端口 3000。

## 🔧 在 MorphoTV 中配置

### 配置步骤

1. **打开 MorphoTV 应用**
2. **进入初始化界面**
3. **选择 "JSON数据" 标签页**
4. **根据部署方案输入对应配置**：

   **🌟 Cloudflare Workers（推荐）**：
   ```json
   {
     "PROXY_BASE_URL": "https://your-worker.workers.dev/proxy"
   }
   ```
   > 💡 **示例**：如果您的 Worker 名称是 `morphotv-proxy`，则配置为：
   > `"PROXY_BASE_URL": "https://morphotv-proxy.your-subdomain.workers.dev/proxy"`

   **Deno Deploy**：
   ```json
   {
     "PROXY_BASE_URL": "https://your-project.deno.dev/proxy"
   }
   ```

   **Vercel**：
   ```json
   {
     "PROXY_BASE_URL": "https://your-app.vercel.app/api/proxy"
   }
   ```

   **本地部署**：
   ```json
   {
     "PROXY_BASE_URL": "http://localhost:3000/proxy"
   }
   ```

5. **点击 "导入JSON数据"**
6. **等待系统重新加载**

### 配置验证

配置成功后，您应该能够：
- 正常访问各种 API 接口
- 没有 CORS 错误
- 请求响应正常

## 🔍 故障排除

### 常见问题

#### 1. 代理不工作

**问题**：代理请求失败
**解决方案**：
1. 检查代理地址格式是否正确
2. 确认目标 URL 可以正常访问
3. 查看平台的函数日志

#### 2. CORS 错误

**问题**：浏览器显示 CORS 错误
**解决方案**：
1. 确认代理服务器正常运行
2. 检查请求头设置
3. 验证目标 API 支持跨域请求

#### 3. 域名限制

**问题**：某些域名无法访问
**解决方案**：
1. 检查代理代码中的域名白名单设置
2. 确认目标域名在允许列表中
3. 根据需要修改域名限制

#### 4. 本地部署端口冲突

**问题**：端口 3000 被占用
**解决方案**：
```bash
# 查看端口占用
netstat -ano | findstr :3000

# 修改端口（在 server/package.json 中）
"start": "node proxy-server.js --port=3001"
```

### 调试方法

#### Cloudflare Workers 调试

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择您的 Worker
3. 点击 "Logs" 标签页查看实时日志

#### Deno Deploy 调试

1. 访问 [Deno Deploy Dashboard](https://dash.deno.com/)
2. 选择您的项目
3. 查看 "Logs" 部分

#### 本地调试

```bash
# 启动本地服务器
cd server
npm start

# 测试代理功能
curl "http://localhost:3000/proxy/https://httpbin.org/get"
```

## 📊 性能优化

### 🌟 Cloudflare Workers 优化（首选）

**为什么性能最佳？**
- 🚀 **全球边缘网络**：200+ 个数据中心，就近响应
- ⚡ **毫秒级冷启动**：<1ms 启动时间，几乎无延迟
- 🔄 **智能缓存**：自动缓存静态资源，减少重复请求
- 🌐 **自动 HTTPS**：内置 SSL/TLS，支持 HTTP/2 和 HTTP/3
- 📈 **免费额度高**：每天 100,000 次请求，足够个人使用

**性能数据对比**：
```
响应时间：    Cloudflare Workers < 50ms
冷启动：      < 1ms
全球覆盖：    200+ 个城市
免费额度：    100,000 次/天
```

### Deno Deploy 优化

- 现代 V8 引擎，性能优异
- 原生 TypeScript 支持
- 全球分布式部署

### 本地部署优化

```bash
# 使用 PM2 进程管理器
npm install -g pm2
pm2 start server/proxy-server.js --name morphotv-proxy

# 设置开机自启
pm2 startup
pm2 save
```

## 🔒 安全配置

### 1. 域名白名单

在代理代码中配置允许的域名：
```javascript
const ALLOWED_DOMAINS = [
  'api.github.com',
  'httpbin.org',
  'your-trusted-api.com'
];
```

### 2. HTTPS 强制

- Cloudflare Workers：自动 HTTPS
- Deno Deploy：自动 HTTPS
- 本地部署：需要配置 SSL 证书

### 3. 安全头部

所有方案都已配置安全头部：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📈 监控和维护

### 1. 性能监控

**Cloudflare Workers**：
- 使用 Cloudflare Analytics
- 监控请求量和响应时间
- 查看错误率统计

**Deno Deploy**：
- 内置性能监控
- 实时日志查看
- 资源使用统计

**本地部署**：
```bash
# 使用 PM2 监控
pm2 monit

# 查看日志
pm2 logs morphotv-proxy
```

### 2. 定期维护

- 定期检查代理服务状态
- 监控目标 API 的可用性
- 及时更新代理代码

## 🎯 最佳实践

### 1. 选择合适的部署方案

- **高并发需求**：选择 Cloudflare Workers
- **TypeScript 项目**：选择 Deno Deploy
- **企业内网**：选择本地部署

### 2. 安全考虑

- 设置合理的域名白名单
- 定期检查访问日志
- 避免代理敏感 API

### 3. 性能优化

- 合理设置缓存策略
- 监控响应时间
- 优化代理逻辑

## 📞 技术支持

如果遇到问题，可以：

1. 查看项目 README 文档
2. 检查对应平台的官方文档
3. 在 GitHub 提交 Issue
4. 参考社区讨论

---

**部署成功后，记得保存您的代理地址，并在 MorphoTV 中正确配置！**
