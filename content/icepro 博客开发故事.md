---
title: icepro 博客开发故事
date: 2024-05-12T10:48:07+08:00
updated: 2024-05-16T18:30:30+08:00
permalink: /blog/moc
tags:
  - 生活
ccby: true
---

# 博客开发的框架

首先在早些时候的 [文章](./archives/2021/notion-blog)  里面就提到过博客的管理其实很早就以前到了 obisidian 中了，[obsidian](https://obsidian.md/) 也是我日常笔记的软件了，本身 obsidian 是有一个 [发布服务](https://obsidian.md/pricing) 的 ，用来将站点整个发布为网站，收费 $8 大概 60 块钱不到每月，按这个价格给我用肯定是不划算的，毕竟我们有可以白嫖的对象存储 & cdn 以及优秀的 github 构建服务。

![image.png](https://cdn.iceprosurface.com/upload/md/20240512105911.png)

所以之前我基本还是将 obsidian 作为一个转发服务流程大概是编写完成以后 通过 git 上传到 github -> github workflow 将博客的内容同步专门的博客仓库 -> 博客仓库通过 github workflow 上传到对象存储，最后通过 cloudflare 访问，差不多类似于下面这个图这样。


![image.png](https://cdn.iceprosurface.com/upload/md/20240512110846.png)

总的来说还是很方便的，因为 obsidian 虽然内置的 git 性能很差，但是如果只是 *增量同步* 到 git 去 commit stage 的修改还是不错的。

后来在年初的时候看到了 [quartz](https://github.com/jackyzha0/quartz) 这个是一个把 obsidian 的 markdown 文件直接转换成网站的框架，用 preact 开发（只是当模板引擎，功能上似乎有一些额外的开发成本）。

所以就打算用他来转换一下博客，这两天试了一下，总体很顺利，下面记录一下是怎么做的。

# 部署和仓库结构

由于在 obsidian 中编写的笔记某些是私人的话题，所以不便于开放出来，所以设立了一个 public 可以对外的文件夹用来发布，随后 public 文件夹回同步到 blog 的主仓库中的 content 文件夹中，并 commit ，随后提交。由于构建和部署服务用的是 vercel 所以不需要额外的活，只需要 vercel 那边配置一下自定义域名即可，这里就不手把手教授知识了。

![image.png](https://cdn.iceprosurface.com/upload/md/20240512111533.png)

相关的知识点都可以在下面的网站上找到：

+ [https://github.com/actions/checkout](https://github.com/actions/checkout)
+ [https://github.com/pnpm/action-setup](https://github.com/pnpm/action-setup)
+ [https://quartz.jzhao.xyz/hosting#vercel](https://quartz.jzhao.xyz/hosting#vercel)

当然推荐对这方便知识薄弱的同学还是直接使用 Cloudflare Pages 更容易点，框架也有官方的指南： [https://quartz.jzhao.xyz/hosting#cloudflare-pages](https://quartz.jzhao.xyz/hosting#cloudflare-pages)


# 源码改动

对于源码这边还是会做一些修改的，这里会记录一些比较有意义的修改。由于修改应该不会向上游推送（如果需要推送会单独起一个仓库），所以修改上 _怎么方便怎么来_，并且也不会 **特意** 做 i18n。

## 字体
本身网站的字体设置上有 self host 和 google font 两种，对我来说一般情况 google font 就足够了，不过这个字体和我用的还不太一致，所以这里对字体做了一些处理。

本身 obsidian 中在使用的全局字体是 [霞鹜文楷](https://github.com/lxgw/LxgwWenKai) 是一个我认为 **比较精美** 且字 **比较齐全** 的字体。

不过他也有一个比较大问题，字越全，字体就越大，全部的字体大小 **高达 20M**，即使转换 ttf 变成 woff2 也是不能 **接受的字体大小**。

![image.png](https://cdn.iceprosurface.com/upload/md/20240512112602.png)

即使是 LxgwWenKai-Lite 这个轻便版本 <u>也足足有 10m</u>：

![image.png](https://cdn.iceprosurface.com/upload/md/20240512113414.png)

这对于 web 的加载几乎 _**是不可接受的**_ 。不过好在他的协议上允许对字体进行改造，这就带来了比较大的空间。

因为本身对外使用的博客常用字不会太多，所以我们只需要裁剪出现在在使用的字体即可，这里常用的字体裁剪工具是 [fontmin](https://github.com/ecomfe/fontmin) , 以前做页面基本都使用这个方法裁切字体。

下面只需要在下面这步添加一个收集字体的工作即可：

![image.png](https://cdn.iceprosurface.com/upload/md/20240512112928.png)


我们去 blog 的主仓库用 node 写一个收集程序即可：

```typescript
import klaw from 'klaw';
import * as path from 'path'
import { URL } from 'url';
import fs from 'fs';
import Fontmin from 'fontmin';
const __dirname = new URL('.', import.meta.url).pathname;

const textSet = new Set();
const dir = path.resolve(__dirname, "../content");
const files = klaw(dir);
for await (const file of files) {
  // 我这里是全收集，可以考虑只收集 markdown 的字符
  if (!file.stats.isDirectory()) {
    const content = fs.readFileSync(file.path, 'utf8');
    for(let i = 0; i < content.length; i++) {
      textSet.add(content[i]);
    }
  }
}
const allText = Array.from(textSet).join('');
// 输出一下看看字体是否收集齐全了
console.log(allText);
const fontmin = new Fontmin()
  .src(path.resolve(__dirname,'./LXGWWenKaiLite-Light.ttf'))
  .use(Fontmin.glyph({
    text: allText,
    hinting: false 
  }))
  .use(Fontmin.ttf2woff({
    deflate: true
  }))
  .use(Fontmin.ttf2woff2())
  .use(Fontmin.ttf2eot())
  .use(Fontmin.css({
    base64: false,          
    iconPrefix: 'xlwk-lite', 
    fontFamily: 'xlwk-lite',  
    asFileName: false,     
    local: true            
  }))
  .dest('./quartz/static/xlwk');
fontmin.run(function (err, files) {
  if (err) {
      throw err;
  }
});

```

在这样处理以后，差不多可以缩减到这个尺寸：

![image.png](https://cdn.iceprosurface.com/upload/md/20240512113650.png)

woff2 444k 的大小对于 web 来说已经 **完全可以接受**，而且更新频率不会太高，毕竟常用字就这些，难得会修改一次。

随后只需要去 head 里面添加内容即可：

https://github.com/iceprosurface/quartz-blog/blob/d7785f47c40bcf7bb180c17491f011b3e3372694/quartz/components/Head.tsx#L32

```HTML
<link rel="stylesheet" href="/static/xlwk/LXGWWenKaiLite-Light.css" />
```

随后前往 [base.scss](https://github.com/iceprosurface/quartz-blog/blob/d7785f47c40bcf7bb180c17491f011b3e3372694/quartz/styles/base.scss) 修改字体定义，并移除 [全局的 font 定义](https://github.com/iceprosurface/quartz-blog/blob/d7785f47c40bcf7bb180c17491f011b3e3372694/quartz/util/theme.ts#L47)_

```CSS
:root {
  --headerFont: "xlwk-lite";
  --bodyFont: "xlwk-lite";
  --codeFont: "xlwk-lite";
}
```