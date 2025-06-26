import express, { Request, Response } from "express";
import cors from "cors";
import axios, { AxiosError } from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// 启用 CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 根路径处理 - 用于测试代理服务器是否正常运行
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "running",
    message: "MorphoTV Proxy Server is running",
    proxyEndpoint: "/proxy/",
    usage: "Use /proxy/{target-url} to proxy requests"
  });
});

// 通用代理路由
app.all("/proxy/*", async (req: Request, res: Response) => {
  try {
    // 获取目标 URL（移除 /proxy/ 前缀并解码）
    const targetUrl = decodeURIComponent(req.path.replace("/proxy/", ""));

    // 获取请求方法
    const method = req.method.toLowerCase();

    // 获取请求头（排除一些不需要转发的头）
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;

    // 添加一些必要的请求头
    headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
    console.log(targetUrl);
    // 发送请求到目标服务器
    const response = await axios({
      method,
      url: targetUrl,
      headers,
      data: method !== "get" ? req.body : undefined,
      params: method === "get" ? req.query : undefined,
    });

    // 设置响应头
    // Object.entries(response.headers).forEach(([key, value]) => {
    //   if (key.toLowerCase() !== 'content-encoding') {
    //     res.set(key, value as string);
    //   }
    // });

    // console.log("响应结果"+response.data);
    // 确保设置正确的 Content-Type
    // res.set('Content-Type', 'application/json');
    // 发送响应
    res.status(response.status).send(response.data);
  } catch (error) {
    console.log(error);
    console.error("Proxy error:", error instanceof Error ? error.message : "Unknown error");

    // 如果目标服务器返回了错误响应，转发该响应
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        res.status(axiosError.response.status).send(axiosError.response.data);
      } else {
        res.status(500).json({
          error: "Proxy error",
          message: axiosError.message,
        });
      }
    } else {
      res.status(500).json({
        error: "Proxy error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});
