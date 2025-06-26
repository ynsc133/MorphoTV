# MorphoTV 本地代理服务器

> 🏠 **本地部署方案** - 功能完整、稳定可靠的 Express.js 代理服务器

## 📋 概述

这是 MorphoTV 项目的本地代理服务器，基于 Express.js 构建，用于解决前端应用访问第三方 API 时的跨域（CORS）问题。

### ✨ 特性

- ✅ **功能完整** - 支持所有 HTTP 方法和请求类型
- ✅ **稳定可靠** - 经过充分测试，适合生产环境
- ✅ **易于部署** - 支持本地开发和服务器部署
- ✅ **完整日志** - 详细的错误处理和请求日志
- ✅ **高性能** - 基于 Node.js，支持高并发请求
- ✅ **Docker 支持** - 可容器化部署

## 🚀 快速开始

### 环境要求

- Node.js 18.0.0 或更高版本
- npm 或 pnpm 包管理器

### 安装依赖

```bash
# 进入 server 目录
cd server

# 安装依赖
npm install
# 或使用 pnpm
pnpm install
```

### 启动服务器

#### 开发模式
```bash
npm run dev
# 或
pnpm run dev
```

#### 生产模式
```bash
# 构建项目
npm run build

# 启动服务
npm start
```

### 验证部署

访问 `http://localhost:8080` 应该看到：

```json
{
  "status": "running",
  "message": "MorphoTV Proxy Server is running",
  "proxyEndpoint": "/proxy/",
  "usage": "Use /proxy/{target-url} to proxy requests"
}
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件（可选）：

```env
# 服务器端口（默认：8080）
PORT=8080

# 运行环境
NODE_ENV=production
```

### 代理地址

服务器启动后，代理地址为：
```
http://localhost:8080/proxy/
```

## 📱 在 MorphoTV 中配置

### JSON 配置格式

在 MorphoTV 初始化界面输入：

```json
{
  "PROXY_BASE_URL": "http://localhost:8080/proxy/"
}
```

### 配置步骤

1. 启动本地代理服务器
2. 打开 MorphoTV 应用
3. 在初始化对话框选择 "JSON数据" 标签
4. 输入上述 JSON 配置
5. 点击 "导入JSON数据"
6. 系统自动重新加载

## 🐳 Docker 部署

### 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "start"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t morphotv-proxy .

# 运行容器
docker run -d --name morphotv-proxy -p 8080:8080 morphotv-proxy
```

### Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  morphotv-proxy:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 30s
      timeout: 10s
      retries: 3
```

运行：
```bash
docker-compose up -d
```

## 🔍 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 检查端口占用
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # macOS/Linux

# 更改端口
PORT=3000 npm run dev
```

#### 2. 依赖安装失败
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 3. 代理请求失败
- 检查目标 URL 是否可访问
- 确认网络连接正常
- 查看服务器日志输出

### 测试代理功能

```bash
# 测试代理是否正常工作
curl "http://localhost:8080/proxy/https://httpbin.org/get"
```

应该返回 JSON 格式的响应数据。

## 📊 性能优化

### 生产环境建议

1. **使用 PM2 管理进程**
```bash
npm install -g pm2
pm2 start dist/index.js --name morphotv-proxy
```

2. **启用 Gzip 压缩**
```javascript
app.use(compression());
```

3. **设置请求限制**
```javascript
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 🔒 安全考虑

### 生产部署建议

1. **使用 HTTPS**
2. **设置防火墙规则**
3. **限制访问来源**
4. **定期更新依赖**

### 访问控制

如需限制访问来源，可以修改 CORS 配置：

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-morphotv-domain.com']
}));
```

## 📝 开发说明

### 项目结构

```
server/
├── src/
│   └── index.ts          # 主服务器文件
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── pnpm-lock.yaml        # 依赖锁定文件
└── README.md            # 本文档
```

### 修改代码

主要逻辑在 `src/index.ts` 文件中：
- 代理路由处理：`/proxy/*`
- CORS 配置
- 错误处理
- 请求头处理

## 🆚 与云端方案对比

| 特性 | 本地部署 | 云端部署 |
|------|----------|----------|
| 部署难度 | 中等 | 简单 |
| 运行成本 | 免费* | 免费额度 |
| 性能 | 高 | 取决于服务商 |
| 可控性 | 完全控制 | 有限制 |
| 维护 | 需要维护 | 无需维护 |

*需要自己的服务器或本地运行

## 🔗 相关链接

- [云端部署方案](../deploy-proxy/README.md) - Deno Deploy、Cloudflare Workers 等
- [MorphoTV 主项目](../README.md) - 项目主页
- [问题反馈](https://github.com/Lampon/MorphoTV/issues) - GitHub Issues

---

> 💡 **提示**: 如果您需要更简单的部署方案，可以考虑使用 [云端部署方案](../deploy-proxy/README.md)，无需维护服务器。
