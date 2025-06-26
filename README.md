# 项目介绍

本项目是一个纯静态页面构建的影视资源整合站，支持多种观影方式和网盘资源下载，实现观影自由。

# 项目截图

<details>
  <summary>项目截图</summary>
  <img src="https://linux.do/uploads/default/original/4X/0/1/1/011c939ad50c263f6d2e8e010f8a26338cac97aa.jpeg" style="max-width:600px">
   <img src="https://linux.do/uploads/default/original/4X/6/e/3/6e348c941604c77fedd14019babc5d69dca31e04.jpeg"style="max-width:600px">
 <img src="https://linux.do/uploads/default/original/4X/b/5/d/b5dbe994d3bc5bbb291d00ed5fb0334cba237d16.png"style="max-width:600px">
</details>

# 项目部署

## Cloudflare Pages（推荐）

1. Fork 本仓库到 GitHub 账户
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 Pages 服务
3. 选择"导入现有Git存储"，选择本项目存储库
4. 构建设置
   - 构建命令：npm run build
   - 输出目录：dist
5. 点击"保存并部署"

## Docker

```
docker run -d --name morphotv --restart unless-stopped -p 7180:80 lampon/morphotv 
```

## Vercel

[![](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https://github.com/Lampon/MorphoTV)

## 云存储

因为项目为纯静态页面且使用了`hash路由`，因此可以部署到如 `阿里云OSS`、`七牛云KODO`等云存储上面。

1. 克隆项目到本地

   ```
   git clone https://github.com/Lampon/MorphoTV.git
   ```

2. 执行项目编译构建

   ```bash
   bun install
   bun run build
   ```

3. 复制目录/dist内所有静态文件到对应云存储里，要求在根目录下

4. 设置默认文档页为 `index.html`

# 如何使用

## 代理服务器配置

### 为什么需要代理服务器？

MorphoTV 是一个纯前端应用，数据来源于第三方采集站。由于浏览器的同源策略限制，直接访问这些第三方 API 会遇到 **跨域请求（CORS）** 问题。因此需要配置一个代理服务器来转发请求，解决跨域限制。

### 🚀 快速部署方案

我们提供了 **5 种不同的代理服务器部署方案**，您可以根据自己的需求选择最适合的方案：

| 方案 | 平台 | 难度 | 性能 | 成本 | 推荐指数 |
|------|------|------|------|------|----------|
| [Express 本地服务器](server/README.md) | 本地/VPS | ⭐⭐ | ⭐⭐⭐⭐ | 免费/低 | ⭐⭐⭐⭐⭐ |
| [Deno Deploy](deploy-proxy/README.md#1-deno-deploy) | 云端 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| [Cloudflare Workers](deploy-proxy/README.md#2-cloudflare-workers) | 云端 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| [Vercel Edge Functions](deploy-proxy/README.md#3-vercel-edge-functions) | 云端 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| [Deno 本地运行](deploy-proxy/README.md#4-deno-本地运行) | 本地 | ⭐ | ⭐⭐⭐ | 免费 | ⭐⭐⭐ |

> 📁 **部署指南**:
> - **本地部署**: 查看 [`server/`](server/) 文件夹获取 Express 服务器部署指南
> - **云端部署**: 查看 [`deploy-proxy/`](deploy-proxy/) 文件夹获取云端部署方案

### 🎯 推荐方案选择

- **🏠 本地开发**: Express 本地服务器 - 功能完整，稳定可靠
- **☁️ 云端部署**: Deno Deploy - 零配置，全球 CDN 加速
- **🌐 全球加速**: Cloudflare Workers - 极低延迟，边缘计算
- **⚡ 零配置**: Vercel Edge Functions - 与 Next.js 完美集成

### 📋 快速配置示例

#### 方法一：JSON 数据配置
在 MorphoTV 初始化界面的 "JSON数据" 标签页中输入：

```json
{
  "PROXY_BASE_URL": "https://your-proxy-domain.com/proxy/"
}
```

#### 方法二：上传配置文件
创建一个 `config.json` 文件并上传：

```json
{
  "PROXY_BASE_URL": "https://your-proxy-domain.com/proxy/"
}
```

#### 常见代理地址格式示例

```bash
# Deno Deploy
https://your-project.deno.dev/proxy/

# Cloudflare Workers
https://your-worker.your-subdomain.workers.dev/proxy/

# Vercel
https://your-app.vercel.app/api/proxy/

# 本地服务器
http://localhost:8080/proxy/
```

## 系统初始化

第一次访问 MorphoTV 时，系统会要求进行初始化配置。这是为了在浏览器的 localStorage 中存储代理服务器地址。

### 初始化步骤

1. **打开 MorphoTV 应用**
2. **选择配置方式**：
   - JSON 数据输入
   - 上传配置文件
   - 远程地址导入
3. **输入代理地址**（参考上方配置示例）
4. **点击导入**，系统自动重新加载
5. **开始使用** MorphoTV

### 🔧 故障排除

#### 常见问题及解决方案

**❌ 问题：代理服务器无法访问**
```
解决方案：
1. 检查代理服务器是否正常运行
2. 确认代理地址格式正确（必须以 /proxy/ 结尾）
3. 验证防火墙设置
4. 尝试在浏览器中直接访问代理地址
```

**❌ 问题：仍然出现跨域错误**
```
解决方案：
1. 确认代理服务器已启用 CORS
2. 检查代理服务器日志
3. 尝试更换代理服务器
4. 清除浏览器缓存后重试
```

**❌ 问题：请求超时**
```
解决方案：
1. 检查网络连接
2. 尝试更换代理服务器地址
3. 检查目标采集站是否可访问
4. 增加请求超时时间
```

#### 🧪 测试代理功能

访问以下地址测试代理是否正常工作：
```
https://your-proxy-domain.com/proxy/https://httpbin.org/get
```

如果返回 JSON 格式的响应数据，说明代理服务器工作正常。

### 💡 高级配置

#### 自定义采集站
您可以在系统中添加更多采集站：
1. 进入设置页面
2. 添加采集站 URL
3. 配置采集站参数
4. 保存并测试

#### M3U8 代理设置
用于过滤广告和提升播放速度，详见 [M3U8 代理设置](#m3u8-代理设置) 章节。

---

> 💡 **提示**: 如果您在配置过程中遇到问题，可以查看 [`deploy-proxy/README.md`](deploy-proxy/README.md) 获取详细的部署指南和故障排除方法。

## 观看方式

1. **采集站资源**
   - 内置4种来源，可以自行添加更多
   - 支持在线观看
   - 历史播放记录
   - 自助设置跳过片头片尾

2. **网盘资源**
   - 自行添加有网盘资源的站，再配合AI大模型提取

3. **各大视频网站地址解析**
   - 复制视频地址到搜索框进行搜索即可

4. **完整 M3U8 视频地址**
   - 直接复制地址到搜索框搜索即可

## M3U8 代理设置

这个主要用于过滤采集站内存在的插针广告或者提速视频播放作用。如果要构建一个 M3U8 代理地址，可以参考项目：[M3U8 Proxy Filter Script](https://github.com/eraycc/m3u8-proxy-script)

## 鸣谢项目

- [LibreTV](https://github.com/LibreSpark/LibreTV)
- [M3U8 Proxy Filter Script](https://github.com/eraycc/m3u8-proxy-script)