---
title: volar更新正式版本！
date: 2022-10-11T11:17:05+08:00
updated: 2024-07-30T14:04:21+08:00
permalink: /2022/volar-1.0/
tags:
  - vue
  - 编辑器
  - 前端
comments: true
ccby: false
no-rss: true
origin-link: https://blog.vuejs.org/posts/volar-1.0.html
---

10月10号瞅见 volar 更新了，今天早上过来就把 volar 升级了，从官网上来说，volar 实现了一个与 vue 框架无关的外置 ts server 用来给 vue 以外的语言实现语言服务器，比如 svelte。

当然这不是我比较关心的内容，从 release 的信息看主要提升在于性能，目前实际测试下来速度提升还是非常明显的。

之前 vue 文件的提示大约需要 100-500 毫秒的事件才能显示，现在 打开文件，输入以后几乎没有延迟就可以获得补全提示了。

此外就是项目的 vue-tsc 检测速度也大幅度提升（虽然我看 vue-tsc 代码也没改动），原先检测整个项目需要花费约 22秒的时间，现在在6秒内就可以出结果了。

当然现在 volar 对于项目内的 vue-tsc 版本也会进行检查，如果出现下图的内容，直接升级一下 vue-tsc 即可。

![错误图片](https://cdn.iceprosurface.com/upload/md/20221011112248.png)


原文地址： https://blog.vuejs.org/posts/volar-1.0.html