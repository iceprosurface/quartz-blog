---
title: 第一篇 iceplayer 个人音乐播放器
date: 2016-05-01 21:55:41 +0800
comments: true
tags:
  - 前端
permalink: /2016/05/01/2016/2016-05-01-iceplayer-1st/
updated: 2024-05-17T01:59:31+08:00
---

> 时隔半月，我又开始码字了，这次带来的是electron的使用方案，制作一个桌面播放器。

## 起因
说起音乐播放器，大抵我只想需要一个能放音乐的就好，说来也是有点奇怪，我一同学对现在的播放器横不满意为什么呢原因有三点

1. 不能拖拽载入音乐（这个理应是一个简单好用的功能）
2. 必须使用网络源歌词（完全能理解，商业公司总是要推销自己的ip的是吧？）
3. 自定义的歌单永远都是从云端下载的，本地歌单只能分一个大类

那么这样就有了一个需求了不是么？

于是乎我决定，就此做一个音乐播放器来练手，当然一开始并_不需要什么代码_，所以在本章节不会有_任何代码_出现，我们需要先分析一下需要的东西。

<!-- more -->

## 需求分析

首先，音乐器必须要满足本身最基本的功能，播放，其次才是其他功能。首先就把java抛弃了，因为按我的水平写个漂亮的ui着实有点困难，而C目前只是停留在变量认识的基础上，不做考虑，那最好的策略是什么呢？

很快就能想到一个开发包，nwjs，不过这个社区不是很发达（主要是文档不够多），于是我转而投向了一个更好的封装，electron。

HTML+css+js就能做出一个不错的桌面应用，这显然对我有很大的魅力，这样就选择好了框架。

首先仔细思考了一下我们最基本需要的是什么呢？

* 播放器内核
* 控制器（用来切换各种页面的）
* 歌词播放器
* 歌单系统
* UI

这样一来事情就简单了，如果需要在各个页面之间切换而无疑问angular可以为我们提供不错的服务，并且单个模块测试起来是很简单的。

至于ui，个人比较喜欢metro风格（其实就是和win比较搭配），所以依旧使用了metro UI CSS （当然咯你也可以使用bootstrap的flatUI 本质上应该没有什么区别）

## 对于模块的思考

一直以来，自己的写的程序都是难以维护的代码（写到哪里算哪里），所以这次考虑了一下尽可能的减少单独模块间的耦合使用标准接口和数据来减少维护的成本，另外最良好的方式是使用注入的方式。

### 播放器内核

对于播放器，首先需要满足的基本功能有 播放，停止， 暂停 ，静音……blabla 这些统统都不用管，你照着HTML5的官方文档照着封装一下就好，这里只需要考虑和歌词系统的接口问题。

至于歌曲的播放停止等等的判断大抵都属于内部事件，不与外部交互，所以这里就单独列出一章在做分析。

播放器主要的按钮方面只需要返回一个方法就可以了，让button能够绑定ng-click即可

### 歌单系统

歌单系统并不困难，利用services直接从本地读json就好，这点实现并不困难。（目前还不需要增加或者删除歌单的功能）

对于歌单内部的歌曲，目前是需要增加和删除的，这里主要考虑使用拖拽加载和右键删除，这里主要考虑使用directive来构建一个右键菜单，对于css的转换同样考虑使用指令来完成。

同样的这也需要单独罗列一章出来

### 歌词系统
歌词系统是一个比较麻烦的东西，主要大量歌词的格式不一样，所以需要一个解析器，还需要一个统一时间的转换器。

这里的内容主要单独罗列一个章节出来讲解

### electron相关

electron是一个新内容，其中有些新的内容需要加入，这里会稍微翻一下官方API并且把需要的内容翻译过来。

electron使用的chrome V8 为基础（其实就是node），通过一个浏览器对接底层接口，我们不需要像c那样接触底层接口就能简单的使用css+HTML构建一个桌面应用，得益于chrome V8 的速度，js的执行速度已经可以接近C，在复杂运算上不成问题。

同样的基于这一框架开发的桌面应用可以在全平台使用（需要编译对应的版本），安装electron可以通过npm从淘宝源下载，这里同样会使用新的一个章节来介绍。
