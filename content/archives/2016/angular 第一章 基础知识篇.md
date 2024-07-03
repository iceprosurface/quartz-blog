---
title: "[angular.js]第一章 基础知识篇"
date: 2016-02-26 19:56:38 +0800
updated: 2024-07-03T14:52:05+08:00
comments: true
tags:
  - javascript
permalink: /2016/02/26/2016/2016-02-26-angular-1st/
ccby: true
---

> 重要信息：在阅读该博文前请确保有以下前置知识：1) html  2) javascript   3) css

## 一.介绍

为什么我开始学习使用angular.js？这得从知乎大佬的一片文章说起，时间有点久远了，链接是给不出了。这里大致说一下，大意就是，要往深处学习，沿着陡峭的web前端知识向上攀爬，最先走过的是原生javascript->随后就是最好的用jquery->下一步便是angular.js顺便还提及了ext.js。
对于前两个我有着大量的使用经验，从最开始简单的js写了大量的代码完成一个精美漂亮的照片墙（高仿版），到jquery数行代码结合插件快速完成开发，这些过程有着大量的成就感，但是随着越来越多的应用开发使用（其实只是自己做着玩的东西），发现随着应用逻辑的快速增长，代码越来越长直到最后难以维护，大量重复冗余的代码堆积，然后就学习了原型方法，使用各种模型方法来简化代码，增加复用，现在，有一个大佬告诉了我一个新的解决方案--angular.js

记得学java的时候有一个很不错的特性--

依赖注入（ioc），没记错的话这是一种被称为AOP面切面的编程思想，具体怎么样早就忘记了，据说angular.js就可以做到这种操作具体的将就是
`反正我不用考虑程序是怎么完成操作的，我只需要完成程序预定的接口就可以完成具体的操作。

<!--more-->

## 二.配置angular.js环境

讲道理其实并不需要什么配置，我们需要做的是跑到github上下载就好，也可以直接从google上下载，百度上下载都可以,也可以下载本站的内容 

```html
<script src="./angular.min.js"></script>
```

## 三.第一个helloworld程序

不论任何语言，第一条永远都是创建一个helloworld程序

首先，我们需要准备以下几个文件：

 * hello.html
 * controllers.js
 * angular.min.js

随后我们需要编辑上述的第一个和第二个文件

``` html
<!doctype html>
<html ng-app="HelloApp">
  <head>
    <script src="./angular.min.js"></script>
    <script src="./controllers.js"></script>
  </head>
  <body>
    <div ng-controller="HelloController">
      <label>Name:</label>
      <input type="text" ng-model="meeting.text" placeholder="Enter a name here">
      <hr>
      <h1>Hello {{meeting.text}}!</h1>
    </div>
  </body>
</html>

```

```js
var HelloModule = angular.module('HelloApp', []);
HelloModule.controller("HelloController",
function($scope){
$scope.meeting={'text':'icepro'};
});
```
当然我不是很懂这些代码中间是怎么操作的不过我只要知道他能完成什么就行了

![效果图](https://cdn.iceprosurface.com/images/effect.png)

看这个就是最后的效果，你可以随意更改内容，他会简单的将input同步到到那个被 `{{}}` 标记的变量的地方。

是不是发现什么诀窍了？对！使用这个我们不需要再去考虑繁琐的dom元素操作了，在这之前，我们可能需要在div上设置一系列的id，用jquery+原生js取子元素，获取`<P>`的html属性然后修改。而现在不需要了！

## 四.例子详解

```html
<html ng-app="HelloApp">
```

首先我们将ng-app绑定到了html元素上,这个属性是用来声明angular程序的边界的，这里的边界就是整个html标签，当然了你也可以这么设置：
```html
……
  <div ng-app="HelloApp">
  ……
  </div>
……
```

这样就把程序设定为该个div以内，保证不影响其他的dom元素。
然后就是controller元件，angular.js同许多后台框架一样，拥有层次较为清晰的mvc架构。
所以有一个controller也是理所应当的。

```js
var HelloModule = angular.module('HelloApp', []);
```

这里我比较倾向于称为实例化一个helloapp模块，简单的将就是调用angular生成了一个helloapp模块，这里的我没有看过源码比较大的可能就是直接把一个原始模块的prototype方法直接赋予了这个controller，这样就在全局作用中注册了这模块。
随后我们在这个模块中注册了名为hellocontroller的控制器。

```js
HelloModule.controller("HelloController",
    function($scope){
        $scope.meeting={'text':'hi'};
    });
    
```

在注册完所有的控制器模块后。相应的，我们可以简单的在这个控制器的作用范围中使用(标记为ng-controller="HelloController")调用任何在这个控制器中声明的方法和变量。
