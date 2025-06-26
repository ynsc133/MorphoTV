# Stage 1: Build the React application
# 使用一个包含 Node.js 和 bun 的基础镜像（如果官方没有，可以先安装 bun）
# 这里选用 node:20-alpine 作为基础，并手动安装 bun
FROM docker.m.daocloud.io/node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 bun
# 注意：如果网络环境访问 npm registry 较慢，可以考虑换源
RUN npm install -g bun

# 复制 package.json 和 bun.lock 到工作目录
COPY package.json bun.lock ./

# 安装项目依赖
# 使用 --frozen-lockfile 确保使用 lock 文件中的版本，保证构建一致性
RUN bun install --frozen-lockfile

# 复制项目所有文件到工作目录
# 注意：如果项目中有不需要复制到镜像的文件（如 .git, node_modules），
# 可以在项目根目录添加 .dockerignore 文件来排除它们
COPY . .

# 执行构建命令
RUN bun run build
# Vite 默认构建输出到 dist 目录

# Stage 2: Serve the application with Nginx
# 使用轻量级的 Nginx 镜像
FROM docker.m.daocloud.io/nginx:stable-alpine

# 将自定义的 Nginx 配置文件复制到镜像中 Nginx 的配置目录下
# default.conf 是 Nginx 默认加载的配置文件名
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从 builder 阶段复制构建好的静态文件到 Nginx 的 web 服务根目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露容器的 80 端口
EXPOSE 80

# 容器启动时运行 Nginx 服务
# -g 'daemon off;' 让 Nginx 在前台运行，这是 Docker 容器推荐的方式
CMD ["nginx", "-g", "daemon off;"]