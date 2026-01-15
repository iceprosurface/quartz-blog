---
title: AOT
date: 2022-05-21T21:10:45+08:00
updated: 2024-07-04T10:11:28+08:00
tags:
  - 编译
ccby: false
no-rss: true
permalink: /2022/aot/
---

Ahead Of Time 即运行前编译。

### 优点

内存占用低，启动速度快，可以无需 runtime 运行，直接将 runtime 静态链接至最终的程序中。

### 缺点

无运行时性能加成，不能根据程序运行情况做进一步的优化。