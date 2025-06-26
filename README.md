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

## 系统初始化
第一次访问会强制要求初始化系统，目的是为了在localstore里存储一个接口代理地址，项目是纯前端，数据来源第三方，接口会存在跨域请求限制，所以需要一个代理接口请求地址。这里给出一个Deno示例代码，可以部署到[Deno](https://dash.deno.com/)上使用。

```typescript
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

// 启用 CORS 支持的函数
function enableCors(response: Response): Response {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

// 处理代理请求的函数
async function handleProxyRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // 提取目标 URL (去掉 `/proxy/` 前缀)
  const targetUrl = decodeURIComponent(url.pathname.replace("/proxy/", ""));

  if (!targetUrl) {
    return enableCors(
      new Response(JSON.stringify({ error: "Target URL is required!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }

  try {
    // 配置请求选项
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: new Headers(req.headers),
    };

    // 删除不必要的头信息
    fetchOptions.headers.delete("host");
    fetchOptions.headers.delete("connection");

    // 添加必要的 User-Agent 头
    fetchOptions.headers.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    );

    // 如果请求不是 GET 方法，传递请求 body
    if (req.method !== "GET") {
      const body = await req.text();
      fetchOptions.body = body;
    }

    // 转发请求到目标服务器
    const proxyResponse = await fetch(targetUrl, fetchOptions);

    // 转发响应
    const responseBody = await proxyResponse.text();
    const response = new Response(responseBody, {
      status: proxyResponse.status,
      headers: proxyResponse.headers,
    });

    return enableCors(response);
  } catch (error) {
    console.error("Proxy error:", error);

    const errorMessage = {
      error: "Proxy error",
      message: error instanceof Error ? error.message : "Unknown error",
    };

    return enableCors(
      new Response(JSON.stringify(errorMessage), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }
}

// 创建 Deno HTTP 服务器
const port = Number(Deno.env.get("PORT")) || 8080;

serve(req => {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") {
    // 处理预检请求
    return enableCors(new Response(null, { status: 204 }));
  } else if (url.pathname.startsWith("/proxy/")) {
    return handleProxyRequest(req);
  } else if (url.pathname === "/") {
    // 为根路径返回一个简单的页面
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proxy Server</title>
      </head>
      <body>
        <h1>Welcome to the Proxy Server</h1>
        <p>To use this proxy, send requests to the <code>/proxy/{target-url}</code> endpoint.</p>
      </body>
      </html>
    `;
    return enableCors(new Response(html, { status: 200, headers: { "Content-Type": "text/html" } }));
  } else {
    return enableCors(
      new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain" } }),
    );
  }
}, { port });

console.log(`Proxy server is running on port ${port}`);
```

## 观看方式

1. 采集站资源
   内置4种来源，可以自行添加更多
   * 支持在线观看
   * 历史播放记录
   * 自助设置跳过片头片尾
2. 网盘资源
   自行添加有网盘自己的站，再配合AI大模型提取。
3. 各大视频网站地址解析
   复制视频地址到搜索框进行搜索即可
4. 完整m3u8视频地址，直接复制地址到搜索框搜索即可。

# M3U8代理设置

这个主要用于过滤采集站内存存在的插针广告或者提速视频播放作用，如果要构建一个m3u8代理地址，参考项目：https://github.com/eraycc/m3u8-proxy-script

## 鸣谢项目

[LibreTV](https://github.com/LibreSpark/LibreTV)

[M3U8 Proxy Filter Script](https://github.com/eraycc/m3u8-proxy-script)



