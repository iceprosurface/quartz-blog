---
title: Infrastructure as Code
date: 2025-12-18T11:43:00+08:00
updated: 2025-12-18T11:43:00+08:00
permalink: /terminology/infrastructure-as-code/
tags:
  - 术语
  - DevOps
ccby: false
draft: false
comments: true
no-rss: true
---

Infrastructure as Code（IaC，基础设施即代码）是一种通过代码和配置文件来管理和配置基础设施的实践，而不是手动操作或使用交互式配置工具。

核心思想是：用声明式或命令式的配置文件描述期望的基础设施状态，然后让自动化工具去创建、修改或删除资源，使实际状态与配置文件保持一致。

# 优点

1. **可重复性**：相同的配置可以在不同环境中复用，保证一致性
2. **版本控制**：配置文件可以用 Git 管理，变更可追溯、可回滚
3. **自动化**：减少手动操作，降低人为错误
4. **文档化**：配置文件本身就是基础设施的文档

# 常见工具

- **Terraform**：多云平台支持，声明式配置
- **Ansible**：无代理架构，YAML 配置
- **Pulumi**：支持通用编程语言（TypeScript、Python 等）
- **CloudFormation**：AWS 原生 IaC 工具

# 延伸

这个思想不局限于运维领域。任何「用配置文件描述状态 → 自动化工具同步到目标环境」的模式都可以看作 IaC 的变体。