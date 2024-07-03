---
title: "[nodejs]第一章基础的node教学"
date: 2016-05-29 13:36:19 +0800
comments: true
tags:
  - node
permalink: /2016/05/29/2016/2016-05-29-base-of-node-1/
updated: 2024-07-03T14:51:09+08:00
ccby: true
---

## 1.起因

不管学习什么都是有一个理由的，此次node的学习也是不例外，首先对于node我是接触过的，之前有一篇没写完的iceplayer的文章中就使用过node，但是这并不是系统化的学习，所以为此在好好写这一篇文章前，首先就要写几篇关于node的笔记。

> 在本章中我们将会学习如何安装node，并使用node开启一个http服务。

下面正文：

<!-- more -->

## 2. 准备工作

首先需要安装node，由于我是osx ，同时网上也没有介绍关于osx的安装教程，所以此次优先介绍osx的安装。

### 2.1 通过homebrew安装

```bash
#假设homebrew已经安装完成
homebrew install node
#如果你安装zsh又没有专门配置过，那么命令应该是下面这个
/usr/local/bin/brew install node

#同样的顺便把npm安装了
homebrew install npm
#zsh
/usr/local/bin/brew install npm

#安装后测试一下版本
node -v
npm -v
```

值得一提的是：

> npm的安装并不是必须的，并且npm源在国内通常无法使用，所以建议切换成淘宝cnpm。
> [淘宝源链接](https://npm.taobao.org/)

同时淘宝源上自带教程，再次就不多赘述了，此外还要一种pkg的下载方式，具体可以上 [node](https://nodejs.org/en/) 官网查看

其余系统的设置可以自行百度，大致没有什么问题，不过需要注意一下的是，如果还在使用xp系统有可能会碰到xp系统导致的专属bug，建议使用vista或win7以上系统。

## 3. 创建一个hello world程序

> 在使用node前先让我们创建一个测试目录

```bash
cd ~ 
mkdir test
cd test
touch test.js
#使用默认编辑器打开/或者用vim打开也可以
open test.js
vim test.js
```

将文件内部输入一下代码

```javascript
console.log("Hello World");
```

> 这里需要注意的是请 *确保自己在test目录下* ,当然为了避免错误使用 ~/test/test.js 做路径也是完全可行的

```bash
node test.js
```

如果没出错的话下面就会显示一行hello world

## 4. 那么下面我们就可以编写第一个node程序了

### 4.1 引入 http 模块

这一步的作用是引入一个 http 模块，并将这个模块定义为 http。

```js server.js
var http = require("http");
```

require是node里面重要的一环，通过require我们可以不用全部自己制作轮子，转而通过npm来安装需要的js，并载入，那么require是怎么实现的呢？

#### 4.1.1 require函数的实现

在我看来实现一个require函数应该是直接将一个javascripe文件引入一个匿名函数中封装起来，然后赋值给需要的目标，这样可见的是至少应该是下面这个样子

```js
(function ( require , __path) {
// code
})
```


然而实际上是这样的

```js
(function (exports, require, module, __filename, __dirname) {
// YOUR CODE INJECTED HERE!
})
```

当然咯这个requirejs是对内部的一个modulejs的一个简单封装，核心是modulejs，这里有空再分析。

### 4.2 创建一个http服务

```javascript
const http = require('http');

// 创建一个简单的http服务
const server = http.createServer((request, response) => {

	// 发送 HTTP 头部 
	// HTTP 状态值: 200 : OK
	// 内容类型: text/plain
	response.writeHead(200, {'Content-Type': 'text/plain'});

	// 发送响应数据 "Hello World"
	response.end('Hello World\n');
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
// 终端打印如下信息
server.listen(8888);
console.log('Server running at http://127.0.0.1:8888/');
```

学过前端的同学应该都是知道request和respond的所以不多解释。这个是官方给的例子，我稍稍做了一些修改，具体的文档可以参见[httpserver](https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_class_http_server)


下面是最后的效果

![node](http://iceprosurface.com/images/node/node1-1.png)

目前我们没有指定推出命令，所以只能在*命令行中*按下ctrl+c退出。

### 4.3 创建一个标准的web服务器

当然这个服务是不合理的因为还没有添加任何访问文件的方法

```js
const http = require('http');
const fs = require('fs');
const url = require('url');

// 创建一个简单的http服务
const server = http.createServer((request, response) => {
	
	// 解析请求，包括文件名
   var pathname = url.parse(request.url).pathname;
   
   // 输出请求的文件名
   console.log("Request for " + pathname + " received.");
   
   // 从文件系统中读取请求的文件内容
   fs.readFile(pathname.substr(1), function (err, data) {
      if (err) {
         console.log(err);
         // HTTP 状态码: 404 : NOT FOUND
         // Content Type: text/plain
         response.writeHead(404, {'Content-Type': 'text/html'});
      }else{	         
         // HTTP 状态码: 200 : OK
         // Content Type: text/plain
         response.writeHead(200, {'Content-Type': 'text/html'});	
         
         // 响应文件内容
         response.write(data.toString());		
      }
      //  发送响应数据
      response.end();
  });
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// 终端打印如下信息
server.listen(8888);
console.log('Server running at http://127.0.0.1:8888/');
```

然后接下来就是创建一个index.html的文件了

```bash
touch index.html
vim index.html
```

然后在index.html文件中写下如下内容

```html
<html>
<head>
<title>index</title>
</head>
<body>
Hello World!
</body>
</html>
```
ok然后运行一下访问http://127.0.0.1:8888/index.html

即可看到hello world就说嘛访问成功。

> 下面详细解释一下几个函数

#### 4.3.1 URL Parsing url解析

具体内容参考至[官方url的文档](https://nodejs.org/dist/latest-v6.x/docs/api/url.html)


具体表现为我们在上面使用的url.parse(request.url).pathname这一段

```js
url = "http://user:pass@host.com:8080/p/a/t/h?query=string#hash"
```

当我们在开头require url后，我们就可以使用下面的内容了，左边是指url.parse(urls).param

|param|return|备注|
|:-:|:-:|:-:|
|href|'http://user:pass@host.com:8080/p/a/t/h?query=string#hash'|全url|
|protocol|'http:'|请求类型（拿官方的话就是：网络数据交换规则）|
|slashes| true or false|是否使用反斜杠语法|
|host|'host.com:8080'|host|
|auth|'user:pass'|验证类型（用户名：密码）|
|hostname|'host.com'|主机名称|
|port|'8080'|端口|
|pathname|'/p/a/t/h'|路径|
|search|'?query=string'|search|
|path|'/p/a/t/h?query=string'|全路径|
|query|'query=string'或者{'query':'string'}|参数（我一般这么叫具体官方怎么说不清楚）|
|hash|'#hash'|位置标识符（这个东西叫法很多,而且包含美元符号$）|

#### 4.3.2 fs.readFile()

这是个系统函数，可以参考这里[readfile](https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_fs_readfile_file_options_callback)
文件系统，这个函数的完整参数是这样的fs.readFile(file[, options], callback)。

这段话 `fs.readFile(pathname.substr(1), function (err, data) {...}` 这样会读取文件，err 会返回两个情况，假设读取到文件就会返回 true，反之false。

于是就对应下面response里面的 200 和 404 。

>值得注意的是这是一个非同步方法，具体可以自行查找官方文档。

至此第一章结束，下面不定期更新后面章节。