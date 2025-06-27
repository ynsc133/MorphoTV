# MorphoTV 代理服务器部署指南

> 🚀 详细的部署步骤和配置说明

## 📋 部署前准备

### 1. 环境要求

- Node.js >= 18.0.0
- npm 或 yarn 包管理器
- Git（用于版本控制）
- Vercel 账户（免费）

### 2. 选择部署方案

| 需求 | 推荐方案 | 理由 |
|------|----------|------|
| 快速上线 | Pages Router 版本 | 更快的构建和部署 |
| 长期维护 | App Router 版本 | 更好的扩展性和类型安全 |
| 性能优先 | Pages Router 版本 | 更小的体积和更快的启动 |
| 现代化开发 | App Router 版本 | 最新的 Next.js 特性 |

## 🚀 方案一：App Router 版本部署

### 步骤 1：准备项目

```bash
# 克隆项目
git clone https://github.com/your-username/MorphoTV.git
cd MorphoTV/deploy-proxy/morphotv-proxy-vercel

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

### 步骤 3：配置环境变量（可选）

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件
# ALLOWED_DOMAINS=api.example.com,github.com
```

### 步骤 4：部署到 Vercel

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
   - 选择 `deploy-proxy/morphotv-proxy-vercel` 目录
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

### 步骤 5：获取代理地址

部署成功后，您将获得类似以下的地址：
```
https://your-app-name.vercel.app/api/proxy?url=
```

## ⚡ 方案二：Pages Router 版本部署

### 步骤 1：准备项目

```bash
# 进入 Pages Router 版本目录
cd MorphoTV/deploy-proxy/morphotv-proxy-vercel-pages

# 安装依赖
npm install
```

### 步骤 2：本地测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000 查看状态页面
```

### 步骤 3：部署到 Vercel

```bash
# 使用 Vercel CLI 部署
vercel --prod
```

## 🔧 在 MorphoTV 中配置

### 配置步骤

1. **打开 MorphoTV 应用**
2. **进入初始化界面**
3. **选择 "JSON数据" 标签页**
4. **输入配置**：
   ```json
   {
     "PROXY_BASE_URL": "https://your-app.vercel.app/api/proxy?url="
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

#### 1. 部署失败

**问题**：Vercel 部署时出错
**解决方案**：
```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18.0.0

# 清理缓存并重新安装
rm -rf node_modules package-lock.json
npm install

# 重新部署
vercel --prod
```

#### 2. 代理不工作

**问题**：代理请求失败
**解决方案**：
1. 检查代理地址格式是否正确
2. 确认目标 URL 可以正常访问
3. 查看 Vercel 函数日志

#### 3. CORS 错误

**问题**：浏览器显示 CORS 错误
**解决方案**：
1. 确认代理服务器正常运行
2. 检查请求头设置
3. 验证目标 API 支持跨域请求

#### 4. 域名限制

**问题**：某些域名无法访问
**解决方案**：
1. 检查 `ALLOWED_DOMAINS` 环境变量
2. 确认目标域名在白名单中
3. 移除域名限制（如果不需要）

### 调试方法

#### 查看 Vercel 日志

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 点击 "Functions" 标签页
4. 查看函数执行日志

#### 本地调试

```bash
# 启动开发服务器
npm run dev

# 查看控制台输出
# 测试代理功能
curl "http://localhost:3000/api/proxy?url=https://httpbin.org/get"
```

## 📊 性能优化

### 1. 环境变量优化

```bash
# 在 Vercel 项目设置中添加
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 2. 域名白名单

```bash
# 限制可访问的域名，提高安全性
ALLOWED_DOMAINS=api.github.com,httpbin.org
```

### 3. 缓存配置

在 `vercel.json` 中已经配置了适当的缓存策略，无需额外配置。

## 🔒 安全配置

### 1. 域名白名单

```bash
# 设置允许的域名
ALLOWED_DOMAINS=trusted-api.com,another-api.com
```

### 2. HTTPS 强制

Vercel 自动提供 HTTPS，无需额外配置。

### 3. 安全头部

项目已经配置了安全头部：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📈 监控和维护

### 1. 性能监控

- 使用 Vercel Analytics 监控性能
- 查看函数执行时间和错误率
- 监控带宽使用情况

### 2. 日志监控

- 定期查看 Vercel 函数日志
- 监控错误和异常情况
- 设置告警通知

### 3. 定期更新

```bash
# 更新依赖
npm update

# 重新部署
vercel --prod
```

## 🎯 最佳实践

### 1. 版本控制

- 使用 Git 管理代码版本
- 为每次部署打标签
- 保持代码库整洁

### 2. 环境管理

- 区分开发和生产环境
- 使用环境变量管理配置
- 不要在代码中硬编码敏感信息

### 3. 测试策略

- 部署前进行本地测试
- 使用测试 URL 验证功能
- 监控生产环境性能

## 📞 技术支持

如果遇到问题，可以：

1. 查看项目 README 文档
2. 检查 Vercel 官方文档
3. 在 GitHub 提交 Issue
4. 参考 Next.js 官方文档

---

**部署成功后，记得保存您的代理地址，并在 MorphoTV 中正确配置！**
