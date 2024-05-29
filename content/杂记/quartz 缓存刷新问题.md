---
title: quartz 缓存刷新问题
date: 2024-05-28T22:39:53+08:00
updated: 2024-05-28T22:45:57+08:00
permalink: /blog/quartz-cache-refresh/
tags:
  - 生活
ccby: true
draft: false
comments: true
---
quartz 的缓存刷新一直是一个问题，之前还可以忍忍，这次改 comment 缓存完全不刷新实在费力，所以痛并思痛，决定奴役 copilot 帮我写一个 node 脚本批处理一下把 js 和 css 都给处理成带 hash 的。

具体可以看 [这里](https://github.com/iceprosurface/quartz-blog/blob/32c93a42dd65a5e38fcaf9e76b8f4329a5cbb14a/scripts/hash-public.mjs) 差不多奴役它五分钟就写完了，逻辑很简单：

1. 查找所有的 js 和 css 文件建 map，算 short hash
2. 重命名 js 和 css 文件
3. 遍历所有的 html ，找出 link 和 script ，将 js 和 css 文件替换上 short hash
4. 写入 html

随后 `package.json` 中修改一下 build： 

```json
{
  "scripts": {
    build": "npx quartz build && node ./scripts/hash-public.mjs",
  }
}
```
