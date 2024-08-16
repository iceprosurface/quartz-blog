---
title: 谈谈已经去世的 websql 和秽土转生的 sqlite-wasm
date: 2024-07-04T11:49:02+08:00
updated: 2024-08-16T10:48:32+08:00
permalink: /code/web-frontend/discuss-websql-and-sqlite-wasm/
tags:
  - 工具
  - 前端
ccby: true
draft: false
comments: true
---
# web 数据库的前世今生

web 数据库[^1]一直以来是有规范, 当然也是 Google, Inc. 作为第一发起人实现的。目的是用结构化方式在存储数据（内部基于 SQLite 数据库引擎）他在 2009年的时候推出[^2] , 没过两年就弃用了[^3] 属于纯的命运多舛，在 [此前的文章中](../../../archives/2020/IndexDB%20初用解析%20&%20Dexie.md) 我也有提及，但是那个时候未能料到仅仅1年多他最终进入了墓地 [^4]。

> [!quote]  哀悼
> 生于 webkit，存于 Blink ，未尽事业于 Gecko

很符合 websql 的一生。

目前来讲 W3C  更推崇开发者使用 indexDB、localstorage、sessionstorage[^5] 等等 storage api 来做储存。这些传统的 storage api 在绝大部分场景表现良好，但是可以肯定的是，他们仍然缺乏强有力的查询语言[^6]来提供一些必要的支持。

## websql 的废弃

截止现在（2024年07月04日），websql 已经彻底的在 chrome 上消失了。事实上如果需要一个精准的时间是 2022 年 1月后发布的 chrome119 版本开始。

### 安全性

websql 的废弃是有原因的，核心在于安全性，websql 是基于 sqlite 封装的，sqlite 从设计之初开始就不是一个基于沙箱运行的组件，所以起安全性有待验证，而更糟的是，一旦 sqlite 出现 安全性更新，那么 chrome 就必须跟着更新内置的 sqlite，对于浏览器来说，让用户升级是一个麻烦事儿。

另外从规范定义上来讲 websql 必须严格对齐 sqlite 3.6.19 ，并以此为规范实现：

![](https://cdn.iceprosurface.com/upload/md/202407111524655.png)

这使得原定的按照规范落地的计划并不成功。

> [!note] 核心原因
> 我个人认为更核心的原因还是在于没有一个事实的 sql 子集可以在 web 上安全、高性能的定义，绝大部分数据库在设计上是不考虑本地安全性的。而对于浏览器而言，这恰恰相反。

### 过于糟糕的 api

websql 在设计上是一个经典的回调地域写法：

> [!danger]  过时警告
> 下面是一段在绝大部分浏览器无法运行的伪代码，请不要参考、使用。

```javascript
openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024， (db) => {
  db.transaction(function (tx) { 
    tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)', () => {
      // do next
    }); 
  });
});
```

仅仅打开数据库查询内容，就可以初见端倪，诚然可以将其优化为 promise 版本，使用 async-await 解决，但是显然作为 native 实现的 api 要更新为 promise 是一个漫长的过程（需要扯皮）

### Mozilla 不愿意支持

Mozilla 对这一功能抵触情绪很强：

> [!quote] 原文
> We don't think [SQLite] is the right basis for an API exposed to general web content, not least of all because there isn't a credible, widely accepted standard that subsets SQL in a useful way. Additionally, we don't want changes to SQLite to affect the web later, and don't think harnessing major browser releases (and a web standard) to SQLite is prudent.

说人话：sqlite 没有事实标准，也没有 sql 子集，web 标准作为一个落地很慢的标准，不能把未来的标准和一个不稳定的方案绑定。[^7][^8]

# 当今的 web 数据库？

时至今日，由于浏览器越来越强大的原生能力和系统级api 的开放，我们得以将 sqlite 使用 wasm 的方式在浏览器上实现：

https://sqlite.org/wasm/doc/trunk/index.md

这个非常有意思，下面有一个简单的对比图[^9]： 

![](https://cdn.iceprosurface.com/upload/md/202407111536594.png)

我们可以看得出在性能上 wasm 版本的 sqlite 完全可用，并且效果不错。

[^1]: https://www.w3.org/TR/webdatabase/
[^2]: https://www.w3.org/TR/2009/WD-webdatabase-20091222/
[^3]: https://www.w3.org/TR/webdatabase/#status-of-this-document
[^4]: 大概在 2019 年 webkit 正式抛弃了 websql, https://lists.webkit.org/pipermail/webkit-dev/2019-November/030968.html
[^5]: 注意 cookie 并不属于 storage，这里是特意不加 cookie 的
[^6]: 我们知道有很多 storage 的封装来提供 ORM ，但是本质上其性能和能力上，对比 SQL 还是有很大不足的
[^7]: 一些文章： https://nolanlawson.com/2014/04/26/web-sql-database-in-memoriam/
[^8]: 来自 W3C 的讨论： https://www.w3.org/2009/11/02-webapps-minutes.html#item10
[^9]: https://sqlite-wasm-opfs.glitch.me/speedtest.html