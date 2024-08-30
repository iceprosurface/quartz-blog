---
title: workbox 使用指北
date: 2019-03-27T20:10:00+08:00
tags:
  - javascript
comments: true
updated: 2024-08-30T13:25:43+08:00
permalink: /2019/03/27/2019/guide-of-workbox/
ccby: true
---
> [!danger] 警告
> 自 2024年5月20日起，本篇文章中提及的本网站 service worker 相关的功能已经下线，文章内容并无问题且可做参考，但本 blog 将不会特意做 pwa 离线支持

## 序

许久没有更新博客了，其实最近搞得事情太多，没有时间在写博客了，这不最近终于有时间可以写一下博客了，这次要写的是关于离线缓存资源以及pwa离线访问相关的东西。

当然咯！事实上对于离线访问资源或者说主动式的缓存策略而言，早已经有框架提供一种更为便捷的方式是实现了 - [workbox](https://developers.google.com/web/tools/workbox/):

<!--more-->
![workbox logo](https://cdn.iceprosurface.com/upload/md/Workbox-Logo-Grey.svg)


### service worker

提起 pwa 我们就不得不提一下 serivce worker, service worker 是一个很早就兴起的概念，它打开了通向不需要网页或用户交互的功能的大门。

我们可以发现 facebook 和 谷歌的网页主动式推送就使用了这种方式在后台静默的处理。

简而言之：Service Worker 是浏览器在后台独立于网页运行的脚本。

当然其兼容性也是非常惨淡虽然 微软 已经说明了会支持，但是显然 ie 以及 早期版本的 edge 显然是无法使用的具体可以看[这个](https://caniuse.com/#search=service%20workers)：

![service worker](https://cdn.iceprosurface.com/upload/md/2019-03-27-063503.png)



这里可以尝试前往谷歌的官方指南阅读： [【service-work】](https://developers.google.com/web/fundamentals/primers/service-workers/?hl=zh-cn)

这里就简单的介绍一下：


![](https://cdn.iceprosurface.com/upload/md/2019-03-27-040442.jpg)

> 注意如果使用 service worker 你的网站必须使用 https


service worker 主要执行的步骤大致如上所示。

事实上一个 service worker主要的目的还是拦截请求并处理请求的。

那么通过一个 service worker 我们可以简单的做到一个 api 的拦截器,比如像下面这样简单的拦截一下 fetch，如果命中缓存则直接返回缓存。


```javascript
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

当然单纯的使用 service work 去构建一个 pwa 的缓存策略着实不是一般的麻烦，这里 谷歌推出 workbox 用以简化整个 service  worker 处理过程

### workbox

现在我的博客已经支持 service work 了你可以关闭你的网络连接，刷新一下页面，可以看到现在的页面还是好好的显示的。

然后这是怎么做到的呢？

这很简单，首先受限于加载策略所以service worker是不允许跨域的，这样首先需要加载本地的service worker：

```html
<script>
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function(reg) {
        
            if(reg.installing) {
            console.log('Service worker installing');
            } else if(reg.waiting) {
            console.log('Service worker installed');
            } else if(reg.active) {
            console.log('Service worker active');
            }
        
        }).catch(function(error) {
            // registration failed
            console.log('Registration failed with ' + error);
        });
    }
</script>
```

这样浏览器就回去 /sw.js 下加载 service worker了，然后下面是具体的执行代码(一般情况下都可以这么使用，但是本站的匹配策略有点奇怪所以并未如此配置)：

```javascript
// 
importScripts('https://cdn.iceprosurface.com/workbox/workbox-sw.js')
workbox.setConfig({
    // 设置 cdn 前缀
    modulePathPrefix: 'https://cdn.iceprosurface.com/workbox/',
    debug: false
});

// 注册成功后要立即缓存的资源列表
workbox.precaching.precache([
  'https://avatars.githubusercontent.com/iceprosurface'
]);

// html的缓存策略
workbox.routing.registerRoute(
    '/(.*?)\/$',
    new workbox.strategies.NetworkFirst({
        cacheName: 'index',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 7 * 24 * 60 * 60,
            }),
        ],
    }),
)

// html的缓存策略
workbox.routing.registerRoute(
    new RegExp('.*.html'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'html-main',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 20,
                maxAgeSeconds: 7 * 24 * 60 * 60,
            }),
        ],
    }),
)

workbox.routing.registerRoute(
    new RegExp('.*.(js|css)'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'icepro-resource',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 20,
                maxAgeSeconds: 7 * 24 * 60 * 60,
            }),
        ],
    }),
)

workbox.routing.registerRoute(
    new RegExp('https://cdn.iceprosurface.com/'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'image-oss',
    }),
)

```

对于 js，css以及 html 文件我们只缓存 20 个并缓存一周，对于从 oss 上走的其他图片或者资源 我们选择使用默认缓存策略。

那么我们下面详细讲解一下各种缓存策略。

### 缓存策略

首先缓存策略有四种：


+ Stale-While-Revalidate
+ Cache First
+ Network First
+ Network Only
+ Cache Only


#### Stale-While-Revalidate

这一缓存策略和先有的 http 的同名策略几乎相同，优先选择 本地 缓存，随后请求并更新缓存，换而言之，要到下一次请求才会正确更新。

具体的策略见下图：


![Stale-While-Revalidate](https://cdn.iceprosurface.com/upload/md/2019-03-27-062340.jpg)


可以看到 page 优先走了 service workder 随后直接从 cache 获取了结果返回了页面，随后向 发起 请求，并更新了缓存

这一策略适合一些，有频繁更新最新版本特性的，但是又并非必需的资源：

+ 头像
+ 图标
+ 字体

#### Cache First

缓存优先，顾名思义，优先访问缓存，如果在缓存不可用的情况下在使用 网络进行请求

![Cache First](https://cdn.iceprosurface.com/upload/md/2019-03-27-063714.jpg)

> 值得一提的是： 如果不是以离线方式构建应用且并没有主动缓存更新机制的情况下，最好不要使用这一缓存策略


#### Network First

网络优先策略，与 Cache First 相反的策略。

![Network First](https://cdn.iceprosurface.com/upload/md/2019-03-27-064442.jpg)

大部分情况下都可以使用这个策略，当然离线用户会获得较旧的缓存版本。 如果网络请求成功，可能需要更新缓存条目。

通常而言更好的方式是下图所示，完成后同步更新缓存并再次更新页面：

![Network First and upadte Cache](https://cdn.iceprosurface.com/upload/md/2019-03-27-064542.jpg)


#### Network Only

这就不用说了，我们平时的页面就是 network only的

![Network Only](https://cdn.iceprosurface.com/upload/md/2019-03-27-064738.jpg)


#### Cache Only

理论上并不会用到这个方式，除非你有主动式的缓存更新策略,或者你认为在这个版本下此类资源将永不更新的也可以使用此方式处理，将会永久性的使用缓存而非网络

![Cache Only](https://cdn.iceprosurface.com/upload/md/2019-03-27-064833.jpg)




[^1]: Matt Gaunt,Service Worker：简介, [https://developers.google.com/web/fundamentals/primers/service-workers/?hl=zh-cn](https://developers.google.com/web/fundamentals/primers/service-workers/?hl=zh-cn)
[^2]: mnot,Two HTTP Caching Extensions, [https://www.mnot.net/blog/2007/12/12/stale](https://www.mnot.net/blog/2007/12/12/stale)
[^3]: Jake Archibald,离线指南, [https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/?hl=zh-cn](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/?hl=zh-cn)
[^4]: anonymous,service worker, [https://developer.mozilla.org/zh-CN/docs/Web/API/ServiceWorker](https://developer.mozilla.org/zh-CN/docs/Web/API/ServiceWorker)
[^5]: Fyrd, can use, [https://caniuse.com/#search=service%20workers](https://caniuse.com/#search=service%20workers)
[^6]: Google.Inc, Workbox Strategies, [https://developers.google.com/web/tools/workbox/modules/workbox-strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)