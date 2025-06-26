# 任务计划

1. 手机端的适配能力，如何设置
2. 播放设置优化，比如跳过片头
4. 数据无法进行导出和导入，webdav 同步
5. 部署到docker里，和其他平台
6. 整理优化代码

# 后端Server部署到服务器

1. 执行项目构建
```bash
pnpm build
```
2. 将以下文件和目录传输到服务器：
* dist/ 目录（编译后的代码）
* package.json
* pnpm-lock.yaml
* .env 文件（如果有环境变量配置）
  
3. 在服务器上安装依赖

```bash
 pnpm install --prod
```
4. 使用pm2进行进程管理

```bash
pm2 start pnpm --name proxy -- run start
```



# 打包Docker容器

```bash
docker build -t morphotv .
```

**部署镜像**

本地部署

```bash
docker run -d --name morphotv --restart unless-stopped -p 7180:80 morphotv 
```

镜像打标签

```bash
docker tag morphotv lampon/morphotv:latest
```

推送到docker hub
```bash
docker push lampon/morphotv:latest    
```

# 部署

部署到Verge

[![](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https://github.com/Lampon/MorphoTV)

docker 部署

```bash
docker run -d --name morphotv --restart unless-stopped -p 7180:80 lampon/morphotv 
```

