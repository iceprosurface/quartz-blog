---
title: D-Bus
date: 2024-09-19T10:34:21+08:00
updated: 2024-09-19T10:35:56+08:00
permalink: /terminology/d-bus/
tags:
  - 术语
ccby: false
draft: false
comments: true
no-rss: true
---
D-Bus（Desktop Bus）是一个用于进程间通信（Inter-Process Communication, IPC）的消息总线系统，广泛应用于现代Linux桌面环境和系统服务。它的设计目的是提供一种简单且高效的方式，使不同的应用程序和系统服务能够相互通信和协调。他基于对象模型设计的，每个应用程序可以在总线上公开自己的对象，这些对象可以有方法、信号和属性。其他应用程序可以调用这些方法、监听信号和读取或设置属性。