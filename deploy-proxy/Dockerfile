# MorphoTV 代理服务器 Docker 配置
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY express-proxy-server.ts ./
COPY tsconfig.json ./

# 安装 TypeScript 和 ts-node
RUN npm install -g typescript ts-node

# 编译 TypeScript
RUN tsc express-proxy-server.ts --target es2020 --module commonjs --outDir dist

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8080

# 启动应用
CMD ["node", "dist/express-proxy-server.js"]

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
