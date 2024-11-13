---
title: 利用 gitlab downstream trigger 简化 pipeline 配置
date: 2024-11-13T10:44:22+08:00
updated: 2024-11-13T11:19:04+08:00
permalink: /ci-cd/gitlab-downstream-trigger-pipeline/
tags:
  - 运维
ccby: true
draft: true
comments: true
no-rss: true
---

# 前言

最近在整理项目的 CI/CD 配置，发现了项目中存在大量的配置文件重复，类似于下图这种结构：

![项目结构图](./attachments/项目结构图.excalidraw.md)

结构上存在十多个项目具有完全一致的流程，但是他们的配置项都有点区别，主要在于目录上有一定的区别。这种重复的劳作在之前的 [文章](../../../archives/2024/mono%20项目最佳实践指南.md) 中就提过，对于一个 mono 项目来说，规模化效应是一个重要的指标，mono 项目的高效的一个核心因素是项目中相同模式的方案能快速的应用在一个新的项目上。

所以这种重复劳作的 ci 配置是应该避免出现的，同时手工编码这些流程难免容易出错，且在 gitlab 的 pipeline 视图上，会显示的尤为复杂难以阅读。基于这一点，维护者应当尽可能的将这种部署模式寻找一个通用的解决方案，例如将这种 ci 配置变成一种约定。

# gitlab 官方提供的一些方案

gitlab 对于 pipeline 的管理提供了一些其他的管理措施：

1. 基于 trigger 做分离，这个一般在 [polyrepo](../../名词/polyrepo.md) 使用的更多一点 -> [文档](https://docs.gitlab.com/ee/ci/triggers/)
2. 基于 downstream pipeline 做分离，这个适合在单一仓库执行，[monorepo](../../名词/monorepo.md) 中是个不错额选择 -> [文档](https://docs.gitlab.com/ee/ci/pipelines/downstream_pipelines.html)

> [!caution] 备注
> 对于第二种其实很多不同的策略可以使用，如果你希望通过更灵活的方式去实现，那么 [动态生成 child pipeline](https://docs.gitlab.com/ee/ci/pipelines/downstream_pipelines.html#dynamic-child-pipelines) 是一个非常有效的方案，本文也会基于动态生成方案实践。


## 实践



