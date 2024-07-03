---
title: RSS 订阅说明
date: 2024-07-03T22:16:57+08:00
updated: 2024-07-03T22:23:10+08:00
permalink: /blog/rss/
tags: 
ccby: false
draft: false
comments: true
no-rss: true
---
最近整理了一下博客的 RSS 目前打算开放两个 RSS 订阅源，如果打算只订阅最新的最近的内容的就使用：

[https://iceprosurface.com/index.xml](https://iceprosurface.com/index.xml)

只会显示最近的 15 条，如果是希望下载所有文章的可以考虑使用下面这个链接

[https://iceprosurface.com/rss-full.xml](https://iceprosurface.com/rss-full.xml)

对于 RSS 订阅会排除所有的 excalidraw  渲染以及内部的 excalidraw 显示，主要还是不带交互的 excalidraw 并不好用，也不太好写，就先不显示吧，我这边还是保留了 data-excalidraw 地址，看看未来要不要支持。

除此以外，知识库中有大量零散内容，我考虑还是尽可能的移除了所有不包含永久链接的页面，同时标记为 no-rss 的页面不会在 rss 中出现，以减少对订阅者的影响。