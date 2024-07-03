---
title: 在 markdown 中一键上传图片
date: 2018-04-09T07:00:53+08:00
tags:
  - 工具
comments: true
updated: 2024-07-03T14:54:17+08:00
permalink: /2018/04/08/2018/qiniu-picture-clould/
ccby: true
---

## 前言

一直使用 markdown 写博客，此前使用的 cmdmarkdown 做编辑，但是后来开始本地编辑了，就开始非常怀念 cmd markdown 一键上传到七牛云的功能了，搜索了一番找到了一个替代的方案。

> 本着有轮子就不会自己写代码的原则，这里用的轮子是 [markdown-image-alfred](https://github.com/kaito-kidd/markdown-image-alfred)

## 原料

> 此方法就 mac 可用，win党就先散了吧

1. alfred
2. markdown-image-alfred
3. 注册完整的七牛云(目前七牛需要实名认证，大约三个工作日)

## 配置

前往 github 下载 markdown-image-alfred，双击打开自动安装，随后设置快捷键 option + command + v

不过比较惨的事情就是上传速度不是太快有点卡卡的感觉，一般都要等一会才能上传成功。

不过我觉得这个是值得的毕竟七牛的静态对象储存访问速度又快，还可以加速前端访问，挺好的效果~


