# MorphoTV 代理服务器部署方案

> 🎬 为 MorphoTV 提供的多平台代理服务器部署方案

## 📁 项目结构

```
deploy-proxy/
├── cloudflare-worker.js           # Cloudflare Workers 部署方案
├── deno-deploy-proxy.ts           # Deno Deploy 部署方案
├── deno-proxy-original.ts         # 原始 Deno 代理实现
├── vercel-deploy/                  # Vercel 部署方案
│   ├── api/proxy.js               # Vercel API 路由
│   ├── api/health.js              # 健康检查接口
│   ├── public/index.html          # 状态页面
│   ├── package.json               # 项目配置
│   └── vercel.json                # Vercel 配置
├── DEPLOYMENT_GUIDE.md            # 详细部署指南
└── README.md                       # 本文档
```

## 🔄 方案对比

### 🌟 方案一：Cloudflare Workers（强烈推荐）

**为什么是首选？**
- 🚀 **部署最简单**：3 分钟即可完成部署
- ⚡ **性能最强**：全球 200+ 边缘节点，<50ms 响应
- 💰 **免费额度最高**：每天 100,000 次请求
- 🔒 **安全性最好**：自动 DDoS 防护和 SSL
- 🌍 **全球覆盖**：适合所有地区用户

**技术特点：**
- ✅ 全球边缘网络部署
- ✅ 每天 100,000 次免费请求
- ✅ 毫秒级冷启动（<1ms）
- ✅ 自动 HTTPS 和 HTTP/2
- ✅ 无服务器架构
- ✅ 零配置部署

### 方案二：Deno Deploy

**适用场景：**
- TypeScript 优先的项目
- 现代化开发体验需求
- 需要原生 ES 模块支持
- 追求开发效率的场景

**技术特点：**
- ✅ 原生 TypeScript 支持
- ✅ 现代 V8 引擎
- ✅ 全球分布式部署
- ✅ 零配置部署
- ✅ 内置性能监控

### 方案三：Vercel 部署

**适用场景：**
- 熟悉 Next.js 生态的开发者
- 需要快速部署的项目
- 希望与 GitHub 集成的场景
- 追求简单配置的用户

**技术特点：**
- ✅ 与 GitHub 无缝集成
- ✅ 自动 CI/CD 部署
- ✅ 免费 SSL 证书
- ✅ 全球 CDN 分发
- ✅ 零配置部署

### 方案四：本地部署

**适用场景：**
- 企业内网环境
- 需要完全控制的场景
- 自建服务器部署
- 开发测试环境

**技术特点：**
- ✅ 完全自主控制
- ✅ 无外部依赖
- ✅ 可自定义配置
- ✅ 适合内网部署
- ✅ 支持自定义端口

## 📊 详细对比

| 特性 | 🌟 Cloudflare Workers | Deno Deploy | Vercel | 本地部署 |
|------|----------------------|-------------|--------|----------|
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **部署难度** | 🟢 极简（3分钟） | 🟢 简单 | 🟢 简单 | 🟡 中等 |
| **性能** | 🟢 极高（<50ms） | 🟢 高 | 🟢 高 | 🟡 取决于硬件 |
| **免费额度** | 🟢 100K 请求/天 | 🟡 100K 请求/月 | 🟡 100GB 带宽/月 | 🟢 无限制 |
| **全球分布** | 🟢 200+ 节点 | 🟢 全球分布 | 🟢 全球 CDN | 🔴 单点 |
| **冷启动** | 🟢 <1ms | 🟡 <10ms | 🟡 <100ms | 🟢 无冷启动 |
| **TypeScript** | 🟡 支持 | 🟢 原生支持 | 🟢 完整支持 | 🟡 需配置 |
| **监控** | 🟢 内置完善 | 🟢 内置 | 🟢 内置 | 🔴 需自建 |
| **自定义域名** | 🟢 免费 | 🟢 支持 | 🟢 免费 | 🟢 支持 |
| **维护成本** | 🟢 零维护 | 🟢 低 | 🟢 低 | 🔴 高 |
| **GitHub 集成** | 🟡 需配置 | 🟢 原生支持 | 🟢 完美集成 | 🔴 需自建 |

> 💡 **结论**：Cloudflare Workers 性能最佳，Vercel 开发体验最好，Deno Deploy 对 TypeScript 最友好！

## 🚀 快速开始

### 🌟 推荐路径：Cloudflare Workers（3 分钟部署）

**为什么选择 Cloudflare Workers？**
- ✅ **最简单**：无需安装任何软件，浏览器即可完成
- ✅ **最快速**：3 分钟即可完成部署
- ✅ **最稳定**：全球 200+ 节点，99.9% 可用性
- ✅ **最经济**：免费额度足够个人使用

**快速部署步骤**：
1. 访问 [Cloudflare Workers](https://dash.cloudflare.com/)
2. 创建新 Worker
3. 复制粘贴 `cloudflare-worker.js` 代码
4. 点击部署 - 完成！

### 其他方案

- **TypeScript 爱好者**：Deno Deploy（原生 TS 支持）
- **企业内网用户**：本地部署（完全控制）

### 📖 详细指南

请参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 获取详细的部署步骤。

### 🔧 配置 MorphoTV

部署成功后，在 MorphoTV 中配置代理地址：

**Cloudflare Workers 配置示例**：
```json
{
  "PROXY_BASE_URL": "https://your-worker.workers.dev/proxy"
}
```

**其他平台配置示例**：
- **Deno Deploy**: `"PROXY_BASE_URL": "https://your-project.deno.dev/proxy"`
- **Vercel**: `"PROXY_BASE_URL": "https://your-app.vercel.app/api/proxy?url="`
- **本地部署**: `"PROXY_BASE_URL": "http://localhost:3000/proxy"`

## 🔧 功能特性

### 核心功能

- ✅ **CORS 跨域支持**：解决浏览器跨域限制
- ✅ **请求转发**：支持 GET、POST、PUT、DELETE 等方法
- ✅ **头部转发**：保持原始请求头信息
- ✅ **错误处理**：友好的错误信息返回
- ✅ **安全防护**：基础的安全头部设置

### 高级功能

- ✅ **域名白名单**：可配置允许访问的域名
- ✅ **请求日志**：记录代理请求信息
- ✅ **性能优化**：缓存策略和压缩支持
- ✅ **监控支持**：内置性能监控
- ✅ **自动重试**：网络错误自动重试机制

## 🔒 安全考虑

### 基础安全

- 设置合理的域名白名单
- 配置安全响应头
- 限制请求大小和频率

### 高级安全

- 实施 API 密钥验证（可选）
- 配置 IP 白名单（本地部署）
- 启用请求日志监控

## 📈 性能优化

### Cloudflare Workers

- 利用全球 CDN 网络
- 自动缓存静态资源
- 智能路由优化

### Deno Deploy

- V8 引擎优化
- 原生 ES 模块支持
- 自动代码分割

### 本地部署

- 使用 PM2 进程管理
- 配置负载均衡
- 启用 Gzip 压缩

## 🛠️ 故障排除

### 常见问题

1. **代理不工作**：检查代理地址格式和目标 URL
2. **CORS 错误**：确认代理服务器正常运行
3. **性能问题**：检查网络连接和服务器负载

### 调试方法

- 查看平台日志
- 使用浏览器开发者工具
- 测试代理端点

## 📞 技术支持

- 📖 [详细部署指南](./DEPLOYMENT_GUIDE.md)
- 🐛 [GitHub Issues](https://github.com/your-username/MorphoTV/issues)
- 💬 [社区讨论](https://github.com/your-username/MorphoTV/discussions)

---

**选择适合您的部署方案，开始使用 MorphoTV 代理服务器！**
