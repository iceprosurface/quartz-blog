---
title: FIDO身份验证
date: 2024-09-06T10:10:45+08:00
updated: 2024-09-06T10:10:45+08:00
permalink: /terminology/FIDO/
tags:
  - 安全
  - 术语
ccby: false
draft: false
comments: true
no-rss: true
---

在注册在线服务时，用户的客户端设备会创建一个与网络服务域绑定的新加密密钥对。设备保留私钥，并向在线服务注册公钥。这些加密密钥对被称为 [通行密钥](通行密钥.md)，他们也属于 [非对称加密](非对称加密.md) 方式。

FIDO 现在已经在浏览器中被广泛支持， [web authentication api](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Authentication_API) 提供了在浏览器端的支持[^1][^2][^3]，而在数字货币领域、区块链等领域应用也更为广泛。


[^1]: chrome 的支持 [https://blog.chromium.org/2018/09/chrome-70-beta-shape-detection-web.html](https://blog.chromium.org/2018/09/chrome-70-beta-shape-detection-web.html)
[^2]: edge 的支持 [https://blogs.windows.com/msedgedev/2018/07/30/introducing-web-authentication-microsoft-edge/](https://blogs.windows.com/msedgedev/2018/07/30/introducing-web-authentication-microsoft-edge/)
[^3]: firefox 的支持 [https://blog.mozilla.org/en/products/firefox/firefox-gets-down-to-business-and-its-personal/](https://blog.mozilla.org/en/products/firefox/firefox-gets-down-to-business-and-its-personal/)
