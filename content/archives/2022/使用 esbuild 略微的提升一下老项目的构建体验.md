---
title: 使用 esbuild 略微的提升一下老项目的构建体验
date: 2022-10-27T19:32:10+08:00
updated: 2024-07-03T14:55:50+08:00
permalink: /2022/esbuild-speed-up-project/
tags:
  - 编译
  - 前端
ccby: true
comments: true
---

## 前言

最近发现我们的项目构建速度越来越缓慢的，不得已，还是得稍微解决一下构建问题的。

首先我们的项目本身对浏览器兼容性要求不高，所以构建是可以省略很多内容的，首先推了一下另外一个小伙伴把错误的 `.browserslistrc` 改了一下。

一个常见的错误就是声明 last 2 version:

```
> 1%
last 2 versions
```


事实上你认为 last 2 version 是指浏览器最新的 2 个版本，这个 2 个版本是包含所有浏览器的。换而言之 ie 的两个版本（IE10 & IE11）都会被囊括的。

所以你需要新增两个“补充条款” ———

```
not dead
not ie 11
```

这样就把已经上路的浏览器和还算没上路 IE11 送走了。

下面就是调整一下构建。

<!-- more -->

## esbuild & swc

事实上 esbuild 和 swc 区别不大，两者都可以用，对于越陈旧的项目，esbuild 的兼容性会更高一点。

我们这边也选用 esbuild。

首先我们选择安装 esbuild-loader 他同时提供了 minimizer 和 loader。由于我们使用的 vue-cli，这里相当于使用 webpack-chain 魔改。

首先需要把旧的 js 相关的 use 内容全部删除，然后追加我们自己的

```js
  // 使用 esbuild 编译 js 文件
  const { ESBuildMinifyPlugin } = require('esbuild-loader');
  const rule = webpackConfig.module.rule('js');
  // 清理自带的 babel-loader
  rule.uses.clear();
  // 添加 esbuild-loader
  rule
    .test(/\.js$/)
    .use('esbuild-loader')
    .loader('esbuild-loader')
    .options({
      target: 'es2015',
    })
```

然后由于使用了 ts 这里需要把 ts 相关的内容也移除，然后替换掉：

```ts
webpackConfig.module.rules.delete('ts');
```

新增自己的 ts 配置
```js
  webpackConfig.module
    .rule('ts')
    .test(/\.ts$/)
    .use('esbuild-loader')
    .loader('esbuild-loader')
    .options({
      target: 'esnext',
      loader: 'ts',
      tsconfigRaw: require('./tsconfig.json'),
    })
    .end();
```

然后 tsx 也可以交给 esbuild 来解析：

```js
  const tsx = webpackConfig.module.rule('tsx');
  tsx
    .test(/.tsx$/)
    .use('esbuild-loader')
    .loader('esbuild-loader')
    .options({
      target: 'esnext',
      loader: 'tsx',
      tsconfigRaw: require('./tsconfig.json'),
    })
```

由于 vue 的 h 函数和 jsx 不完全一致（内容上有差异），所以这里还的用 babel 转换，当然如果完全不写 jsx 和 tsx 这两步也可以不加。

```js
  const jsx = webpackConfig.module.rule('jsx');
  jsx.test(/.jsx$/).use('babel-loader').loader('babel-loader').end();
```

##  效果

使用 esbuild 前

![esbuild前](https://cdn.iceprosurface.com/upload/md/20221027192813.png)

使用 esbuild 后

![esbuild 后](https://cdn.iceprosurface.com/upload/md/20221027192755.png)

不能说没有把，反正效果不怎么好，但是总归快了不少。

## cache

其实你还可以配合 webpack5 的 cache 近一步提升速度，这个就比较恐怖了，如果啥都没改就是 7 s。