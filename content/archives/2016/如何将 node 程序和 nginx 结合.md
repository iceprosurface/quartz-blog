---
title: 如何将node程序和nginx结合
date: 2016-06-06 12:57:56 +0800
comments: true
tags:
  - 后端
  - 前端
permalink: /2016/05/29/2016/2016-05-29-base-of-node-1/
updated: 2024-05-13T10:32:03+08:00
---

> express是node处理静态文件的良好框架，但是专业的事情还是要交给专业的来，那么有请nginx给我们的node服务器提供转接服务吧~

<!-- more -->

## 前言

我们当然知道，node是一个非常好的并发处理服务器，因为其优良的结构（天生异步架构），使得其在处理任务时通常是非阻塞式的。

但是这也同时说明了，node在处理静态资源上并没有显著的优势（至少没有对此类的需求特别优化过），express框架可以解决这个问题，当然咯我们还有其他的解决方案，比如自己通过解析url在用fs读取，写入response，本质上只是再造一个轮子，没有什么意思，最好的解决方案就是简单的动静分离，将需要交互的扔给node不需要的则由nginx代理。

如果不考虑多服务器负载均衡的情况下，我们不需要特别配置一番，只需要简单的添加一个location代理转发即可

## 示例

在这个示例中我们将常见静态资源使用正则表达式匹配，然后交给nginx完成，*值得注意的是：一旦完成静态资源的匹配，将不再会对后面的代理生效*

同样的对于第二条目，我们使用restFul类型的请求，将类似的请求完全转发给node处理，在node中我们只要在服务器设置为8888端口即可。

同理该种方法是可以用来反向代理其他的任意服务器的，对于nginx，我也仅仅限于看文档配置，还不能灵活的使用，有任何错误或问题，请对照[官方文档](http://nginx.org/en/docs/)查看，如果有什么建议你也可以通过左侧的github，或gmail邮件联系我。

```nginx
server {
	listen       4000;
	server_name  localhost;
	index index.html;

	location ~ .*\.(html|htm|gif|jpg|jpeg|bmp|png|ico|txt|js|css)$ {
	        root /Users/icepro/Site/;
	        expires 1m;
	}

	location ~ ^/(post|get|delete|put)/ {

	        proxy_pass http://127.0.0.1:8888;

	}
}
```