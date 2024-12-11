---
title: monorepo 项目中如何部署 node 服务
date: 2024-12-11T10:43:51+08:00
updated: 2024-12-11T11:09:50+08:00
permalink: /ci-cd/mono-repo-for-node-server/
tags:
  - 运维
ccby: true
draft: false
comments: true
no-rss: false
---
# 前言

团队一直在主推将零散的仓库合并到 mono 中，并且秉持着大 mono 项目原则上应该应收尽收的原则，所以逐渐的将外部放置的 node app 也收归到 mono 仓中维护，这就涉及到 ci/cd 改造的相关的问题。

# 一般的 node 服务构建

区别于一般的项目，我们的 ci/cd 流程在测试环境上有独立的 pod 统一处理 cache、增量构建，所以我们不会使用类似于如下[^3]的配置，先构建打镜像以后再部署。

```dockerfile
FROM node:20-alpine AS base FROM base AS builder

RUN apk add --no-cache gcompat 
WORKDIR /app

COPY package*json tsconfig.json src ./

RUN npm ci && \ 
  npm run build && \ 
  npm prune --production

FROM base AS runner 
WORKDIR /app

COPY --from=builder --chown=xxx:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

USER xxx

EXPOSE 3000
```

在流程上总是会有一个 build -> deploy 的过程，而有别于单仓库，项目是基于 pnpm 的 monorepo，所以你也不能直接 copy node_modules 运行，这样会导致符号连接失效。

# 构建规则

由于上述原因以及项目良好的缓存、增量构建策略，所以对于 build 部分我们不需要做任何修改，只需要将原先的项目移动到 mono 中即可，将其主流程的 script 名称对齐 mono 的规则，比如 `build:development` 、`build:production` 等。

随后我们需要利用 pnpm 提供的 deploy 命令[^1]将产物输出到目录：

```shell
pnpm --filter=@xxx/xxx deploy /prod/xxx
```

> [!warning] 警告
> 1. 如果你的项目依赖安装和声明足够正确，那么请选择添加 `--prod` 这会剔除所有的 devDependencies ，这样会让复制的 node_modules 更小
> 2. delopy 规则同 npm publish 类似，会按照 `package.json 中的 file 字段`、`.npmignore` 、`.gitignore`，进行 include 和 ignore
# 镜像的构建


随后镜像构建就极为简单了[^2]

```Dockerfile
FROM node:20-alpine
COPY /prod/xxx /app/xxx
WORKDIR /app/xxx
CMD ["pnpm", "start"]
```

# 服务运行

我们的项目一般来说不会直接跑在实体机上，都会通过 k8s 进行部署，一般而言理想情况下在使用 k8s 的情况下，node 应该直接运行，而不需要使用 pm2 进行进程管理，但是在实践中会有如下问题：

1. cpu 和 内存设置偏小，则可能无法正常启动
2. cpu 和 内存设置较大，则无法完全利用资源，主要是 cpu 资源占用不符合预期

上面两个情况会在跑 ssr 的情况下更为明显，所以最终实践上仍然会选择在 k8s 内部，使用 pm2 启动 node 服务，来尽可能提高 cpu 资源的使用情况。


[^1]: https://pnpm.io/cli/deploy , 目的是在部署期间，把需要部署包的文件将复制到目标目录，包含整个目录文件以及 node_modules, 随后这个包只需要复制到服务器并执行，无需额外的安装步骤
[^2]: 省略了其他步骤，仅作演示
[^3]: 下方的配置仅作演示，伪代码

