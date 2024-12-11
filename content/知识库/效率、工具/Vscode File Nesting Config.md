---
title: 使用 vscode 的 File Nesting config 来收起不重要的衍生文件
date: 2024-12-11T10:29:29+08:00
updated: 2024-12-11T10:39:26+08:00
permalink: /tools/vscode-file-nesting-config/
tags:
  - 生产力
ccby: true
draft: false
comments: true
no-rss: false
---
作为一个 idea 用户，在 idea 中，衍生的文件一般会被归并起来比如 js 和 js.map 这样的文件，最近有朋友问我 vscode 能不能也这样收起：

![](https://cdn.iceprosurface.com/upload/md/202412111036434.png)

> 主要是消费降级，公司给他配的电脑更差了哈哈哈哈哈，跑 idea 卡

不过讲道理是现在 idea 越来越卡，做个二手准备总没错！vscode 当然也有这个功能，我自己用的是 antfu 的 nesting config ，稍微魔改了一下，只保留了前端相关的配置，我这里就不贴自己的配置的，直接导流到 antfu 的 github  -> [vscode-file-nesting-config](https://github.com/antfu/vscode-file-nesting-config)

![](https://cdn.iceprosurface.com/upload/md/202412111036185.png)

效果图片就是上面这样，一般来说如果是项目独立的配置，你可以保存在 `.vscode/setting.json` 下面，这样可以针对项目作覆盖。