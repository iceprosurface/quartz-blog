---
title: 如何避免 hover 的背景图片在首次点击时出现闪烁
date: 2018-09-27T23:16:46+08:00
tags:
  - 前端
  - 疑难杂症
  - css
comments: true
updated: 2024-07-03T14:53:59+08:00
permalink: /2018/09/27/2018/avoid-flash-on-hovered-background/
ccby: true
---



## 起因



这个问题是刚刚在工作上碰到的，由于此前载入的图片使用的都是小号的图片都是 1x 图，但是由于最近更换了 2x 图片（用于支持 3840 * 2160 的图片）所以明显出现了一个载入的情况就是说会出现hover图片的时候首次会闪烁一下的情况：



<!--more-->



![未命名](https://cdn.iceprosurface.com/upload/md/2018-09-27-074735.gif)





首先分析一下出现的原因：



这一块的代码大抵是这样的：



```scss
.class {
    @include auto-bg-2x(url('path/to/background'));
    &:hover {
        @include auto-bg-2x(url('path/to/background-hover'))
    }
}
```



这样带来了一个显著的问题，在尚未hover的情况下，第二个图片其实不会加载，而白屏则是在这个阶段出现的。



但是之前为什么是可以的呢？原因是这样的：



此前我们的代码对于小图使用了 base64 的编码方式，由于没有网络请求，所以这一现象不会有表现，但是由于升级为 2x 图以后，出现了一个显著的情况就是几乎所有的 2x 图都大于 8k 这个大小，所以跳过了 base64 的阶段，自然就出现了，那么怎么解决呢？



## 解决方案



### A js preload



我们可以利用 js 来 preload 这些需要 hover 的图片，由于整体代码使用了weback 构建，所以要输出所有图片的地址，或者输出指定hover图片的json集合还是非常easy的大致操作可以这样：



首先写一个专门用来输出 json 的js

```js
const fs = require('fs-extra');
// clear proload path
fs.writeJsonSync('./js/preload.json', []);

let preload = {};

function buildPreload () {
    let result = [];
    for (let key in preload) {
        result.push(key);
    }
    return result;
} 

module.exports = function addPath (path) {
    preload[path] = 1;
    fs.writeJsonSync('./js/preload.json', buildPreload());
}

```

然后去 webpack 中在 图片的操作处理中加入如下代码：



```js
{
    test: /\.(jpe?g|png|gif)$/,
        use: [{
            loader: 'url-loader',
            options: {
                name: '[path][name].[ext]',
                limit: 8960,
                outputPath: function (url) {
                    return url;
                },
                publicPath: function (url) {
                    let publicPath = url
                    add(publicPath);
                    return publicPath;
                },
                fallback: 'file-loader',
            }
        }]
}
```

这里的add 函数就是上文的addPath,这里就简单的写一下具体用什么规则，大家自行判断添加即可。



随后在页面上可以这样去加载：



```js
import PreloadImage from './preload.json';

PreloadImage.forEach(function (path) {
    let image = new Image();
    image.src = path;
});
```



这样就自动的完成了加载，至于进度判断什么的这个就另说了。



### B html link load



这种加载方式是对 html 的一种侵入式加载方法，在 preload 中其实除了跨页面的图片和必须加载的文件以外基本不会使用这种方式去加载，因为侵入式代表强耦合，并不是非常友好：



```html
<link rel="preload" href="late_discovered_thing.js" as="script">
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="style" href="async_style.css" onload="this.rel='stylesheet'">
<link rel="preload" as="image" href="map.png" media="(max-width: 600px)">
```



以上四种是常见的preload的用法，这个得看需求了，至少在我们这里，这种方案并不适用。



### C css sightless block



使用 css 方式是比较好的一个方法，因为 css 本身脱离dom，这样并不会致使html 增加冗余代码，并且将大部分不重要的加载内容全权交给浏览器处理是一个明智的方式，至少在当前这种非 web app 的展示页面而言。



```scss
.class {
    @include auto-bg-2x(url('path/to/background'));
    &:after {
        opacity: 0;
        width: 0;
        height: 0;
        content: '';
        position: absolute;
        @include auto-bg-2x(url('path/to/background-hover'))
    }
    &:hover {
        @include auto-bg-2x(url('path/to/background-hover'))
    }
}
```



Opacity:0; 这一条可以不加，上述几个已经够用了，position: absolute也不是必须的条目，这里是因为会影响后文所以还是需要该元素脱离文档流比较保险一点。

