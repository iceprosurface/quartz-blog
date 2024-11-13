---
title: polyrepo
date: 2024-11-13T11:14:06+08:00
updated: 2024-11-13T11:16:52+08:00
permalink: /terminology/polyrepo/
tags:
  - 术语
ccby: false
draft: false
comments: true
no-rss: true
---
"Polyrepo" 是一种软件开发和版本控制策略，全称为 "poly-repository"（多仓库）。在 polyrepo 策略中，每个项目或组件通常都有自己独立的代码仓库。这与 "monorepo"（单仓库）策略相对，在 [monorepo](monorepo.md) 中，多个项目或组件会被集中存放在同一个代码仓库中。

# 优点

1. **各项目独立**：每个项目都有自己的仓库，可以独立管理，适合不同的开发团队。
2. **权限管理清晰**：可以为不同的仓库设置不同的访问权限，更容易控制。
3. **定制化**：每个仓库可以使用不同的工具链和配置，适合项目的特定需求。

# 缺点

1. **复杂的依赖管理**：多个仓库之间的依赖关系复杂。
2. **更难的版本控制**：需要手动同步不同仓库之间的版本。