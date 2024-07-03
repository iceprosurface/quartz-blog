---
title: url 地址栏的长度上限
date: 2020-05-06T17:37:22+08:00
tags:
  - 前端
comments: true
updated: 2024-07-03T14:55:07+08:00
permalink: /2020/05/06/2020/max-length-of-url/
ccby: true
---

## 序

还是接着上文的内容，此前在 安卓传输 图片中提到了，大约可以传输 1.5 M 长度的文件，那么有意思的来了 —— 浏览器真正限制的长度是多少呢？

<!-- more -->

## 浏览器们

### 先辈年代

早些时候网传 url 的长度限制约 4K ， IE 提供的长度是约为  2k （2083） 也就是 231 个中文字差不多。

这个观点我已经无从考究了，毕竟我自己就没怎么阅读到过 ie 的源码，这里还是拿众多现代浏览器做评价吧。

### chrome

首先是 chrome, 我们可以翻阅 chrome 的 [源码](https://source.chromium.org/chromium/chromium/src/+/master:url/url_constants.cc;l=36)

```c
const size_t kMaxURLChars = 2 * 1024 * 1024;
```

可以看到这里限制的长度是 2097152 也就是 2M 的长度，具体哪边用的可以自行前往查询。

### firefox

firefox 的 [源码](https://dxr.mozilla.org/mozilla-central/source/netwerk/base/nsURLHelper.cpp#36) 中提到下述内容

```cpp
static int32_t gMaxLength = 1048576;  // Default: 1MB
```

而且还十分贴心的标注了大小是 1M，那就不多赘述了。

### safari

我翻了一圈苹果官网，也没找到源码，不过按理说是 webkit 内核，那去 webkit 里面找一下，也没找到什么限制

难不成 safari 不限制 url 长度？

实测 直到 2M 为止，都是可以正常打开的

## 网传的长度从何而来呢？

那么问题来了，那个 4k 的长度从哪里来的？

简单描述一下，我们网站基本都是依托于一些静态资源处理的服务端的，如 nginx , apache 等等。

举个例子，早期的 nginx 有一个参数 large_client_header_buffers ，当然现在也有，一般设置为 4k，有极少数设置为 8k，而现在多数的云服务器配置的内存分页设置多为 4k，所以 nginx 也多设置为 4k ，当然这块我也不是太懂，后面搞懂了在写一下（这么说八成是不会写了）。

受限于 nginx 的处理长度，大于这个长度的网站会被截断处理或直接返回错误。所以网传的长度由此而来，并且为了性能和安全考虑，也不可能设置的过大。

## 总结

chrome: 2MB
firefox: 1MB
IE: 约 2K
safari: 大于 2MB

服务端接受大小：4K 或 8K


