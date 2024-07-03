---
title: 几个不常用 web api 整理
date: 2019-06-12T20:10:00+08:00
tags:
  - 前端
comments: true
updated: 2024-07-03T14:54:31+08:00
permalink: /2019/06/12/2019/seldom-web-api/
ccby: true
---

### 序

虽然上面写的是 6 月 12 日（2019 年）实际上这个文档是 2018 年 12 月 就写了。

然而不知道为什么我就漏传了，只是 漏传了.jpg (((泥垢了，一共就几篇还漏传了！！！)))

### 简介

本次将会提及的几个 api 有：

+ page life cycle
+ online state
+ device orientation
+ battery status

<!-- more -->

### 正文

#### page life cycle

网页生命周期是使用 document.visibilityState 来控制的。

用法如下： 

```javascript
window.addEventListener('blur', () => {});

window.addEventListener('visibilitychange', () => {
    switch(document.visibilityState) {
        case 'prerender': // 预渲染状态，此时内容不可见
        case 'hidden': // 处于后台，最小化，或者锁屏状态
        case 'visible': // 内容可见状态
        case 'unloaded': // 文档被卸载状态
    }
})
```

效果差不多是这样：

![效果图](https://cdn.iceprosurface.com/upload/md/2018-12-24-1.gif)

这个 api 有很多用途，比如当手机锁屏时，把播放的内容暂停等等，兼容性在桌面端也是足够使用了：

![兼容性](https://cdn.iceprosurface.com/upload/md/2018-12-24-090726.png)


### 网络状态监控


这个 api 很简单，就是获取当前的网络状态.

一共就两个事件：

+ online
+ offline


主要的用处也就是离线提示用户，比如放视频的时候通知用户已经离线。


online/offine 浏览器支持度

![浏览器支持度](https://cdn.iceprosurface.com/upload/md/2018-12-26-065958.png)


### 震♂动

就是让手机震动啦！

```javascript
navigator.vibrate(100);
navigator.vibrate([300, 200, 100, 400, 100])
navigator.vibrate(0)
```


这里 caniuse 那边看不到这个 api 的相关信息，但是 [mdn](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate) 倒是有:

![mdn](https://cdn.iceprosurface.com/upload/md/2018-12-26-070707.png)

如果有这个功能的浏览器将会触发震动，没有的当然就不触发咯。

移动端的api，我们就看看移动端的兼容性就可以了，很遗憾的是，safari是完全没打算支持，至于 IE mobile 我们所索性忽略就可以了，安卓的 4.3版本和 4.4.4 版本以下都是 bug 奇多的版本不支持也是理所当然的咯，总体兼容性还可以，可以用作一个补强手段，比如检验密码的时候。

![兼容性](https://cdn.iceprosurface.com/upload/md/2018-12-26-071125.png)


> 然而在测试的时候，目前没有任何一个浏览器可以正常使用！


### 陀螺仪

陀螺仪是一个非常有意的 api，这个 api 的使用频次相较之上文 api 可以实际使用的情况要远远好于其他。

陀螺仪的使用场景通常也就是 webvr， 比方讲：

1. vr 红包这样
2. 还有就是像农药那样有个景深视差移动

至于浏览器兼容性么，基础功能的支持都是没啥问题的：

![浏览器兼容性](https://cdn.iceprosurface.com/upload/md/2018-12-27-120841.png)

利用和这个api可以获得如下三个数值

+ alpha
+ beta
+ gamma

#### alpha

这指代设备沿着 z 轴旋转角度

![alpha](https://cdn.iceprosurface.com/upload/md/2018-12-30-1.png)

#### beta 

这指代设备沿着 x 轴的旋转角度

![beta](https://cdn.iceprosurface.com/upload/md/2018-12-30-2.png)

#### gamma 

这指代设备沿着 y 轴的旋转角度

![gamma](https://cdn.iceprosurface.com/upload/md/2018-12-30-3.png)


上述三个api可以结合使用以获得当前设备在各个轴上的实际情况

```html
<div class="wrap">
	<div class="cube">
		<div class="front">前</div>
		<div class="back">后</div>
		<div class="top">上</div>
		<div class="bottom">下</div>
		<div class="left">左</div>
		<div class="right">右</div>
	</div>
</div>
```

就比如之前我们打算做的一个效果（~~虽然最后被废弃了怨念（（（）））~~）

<video src="https://cdn.iceprosurface.com/upload/md/video/parallax.mp4"  controls preload="none" />


### bettery status

电池状态检查： getBattery api 这个 api 只能用来检查一下电池状态，貌似在 **笔记本上** 也有为数不少的浏览器支持，这不算是一个常用的 api 所以兼容性也只能谢天谢地了，能用就是运气 max ++ 了。

![兼容性](https://cdn.iceprosurface.com/upload/md/2018-12-27-121220.png)


具体测试代码如下

![测试代码](https://cdn.iceprosurface.com/upload/md/2018-12-27-121514.png)

测试情况也就安卓的 chrome 使用情况良好了，至少微信啥的都是不可以用的。






