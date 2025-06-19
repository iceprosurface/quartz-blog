---
title: Notification --来自html5的通知提醒功能
date: 2016-12-08 13:29:58 +0800
comments: true
tags:
  - 前端
permalink: /2016/12/08/2016/2016-12-08-web-notification/
updated: 2025-05-07T17:38:03+08:00
ccby: true
---

## 1. 起因

  oh，说起notification，这是一个意外的发现，在翻阅mdn的时候，突然注意到了html的新特性（不能说是'新'特性，原因很简单最早追溯到chrome22就提供base版本的通知。），这个html组件主要用来提示用户一些信息的，使用一种桌面提醒的功能，非常nice。

## 2. mdn中的解释

### 2.1 权限

	在chrome中，notification属于通知中的类别，当用户允许chrome向用户提示信息的情况下，你可以在任何情况下，对桌面弹出一个弹窗，当然咯，为了安全，你对弹窗的功能可以做出的操作是十分有限的。

	同时遗憾的是，本地似乎即使允许弹窗的情况下，仍然无法使得弹窗出现。

> 通常而言，我们首先需要通过Notification.permission来判断当前权限，常见的有以下几种：
> - granted: 允许操作
> - denied: 禁止操作
> - default: 默认权限，实际测试中，这个权限通常是完全可以看做deny来判断 


	这样就有了一个用来向用户请求权限的标准函数了

```js
if (Notification.permission == "granted") {
	popNotifition();
}else if (Notification.permission != "denied") {
	// 若没有权限则向用户询问
	Notification.requestPermission(function (permission) {
		popNotifition();
	});
} 
```

### 2.2 基本的使用

	最基本的使用就是弹窗，对于弹窗这里效果基本是固定的，除了可以自定的title和body以外还可以选择一个iron来做头像之类的（可能聊天室这种用来非常nice，当然仅限提醒咯）

```js
var title = 'this is a nitification'
var option = {
      body: 'this is a body',
      icon: '/thisIsJPG.jpg',
}
var notification = new Notification(title,option);
```

> 以上就是最基本的notification的用法了，当然你可以选择使用notification的一些readonly属性来对notification做一些后续操作，这样的话推荐查看[mdn](http://developer.mozilla.org/en-US/docs/Web/API/Notification-2.html)

## 3. demo

最后是我自己制作的一个最简单的demo，可以供看看，[大力点击这里](https://cdn.iceprosurface.com/demo/notifition/demo.html)。

有什么问题欢迎致电子邮件或通过github联系我。
