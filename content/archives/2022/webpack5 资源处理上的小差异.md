---
title: webpack5 资源处理上的小差异
permalink: /2022/wepack5-asset-diff/
date: 2022-05-22T19:35:10+08:00
updated: 2024-09-04T13:07:31+08:00
tags:
  - 编译
  - 前端
ccby: true
comments: true
---

## 前言

今天把整个博客都整理了一下主要是把 webpack3 升级到了 webpack5，可能是年纪大了，一些花里胡哨的东西都不太喜欢了。就把页面上以前一些花里胡哨的东西都移除了，留下了一个干干净净的，纯粹的文章页面。

在升级的过程中，发现了 webpack5 和 webpack3 & webpack4 比较大的一个差异点 —— 资源处理。

<!-- more -->

## 对比

### webpack3/4

在 webpack3/4 中我们通常使用下面几个 loader 处理一些常见的资源：

-   [`raw-loader`](https://v4.webpack.js.org/loaders/raw-loader/) 将文件导入为字符串
-   [`url-loader`](https://v4.webpack.js.org/loaders/url-loader/) 将文件作为 data URI 内联到 bundle 中
-   [`file-loader`](https://v4.webpack.js.org/loaders/file-loader/) 将文件发送到输出目录

### webpack5

在 webpack5 中一个比较大的区别是，现在我们引入了 4 种新的模块类型来替换掉所有的这些 loader。

-   `asset/resource` 发送一个单独的文件并导出 URL。等同于  `file-loader` 。
-   `asset/inline` 导出一个资源的 data URI。等同于 `url-loader` 。
-   `asset/source` 导出资源的源代码。等同于 `raw-loader`。
-   `asset` 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 `url-loader`，并且配置资源体积限制实现。

当然你还是可以在 webpack 5 中使用旧的 assets loader（如 `file-loader`/`url-loader`/`raw-loader` 等），但是其结果可能和你想的不太一致，他会优先输出一个 js 来处理。

### 例子


```js title="webpack.config.js"
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {// [!code ++]
    rules: [// [!code ++]
      {// [!code ++]
        test: /\.png/,// [!code ++]
        type: 'asset/resource'// [!code ++]
      }// [!code ++]
    ]// [!code ++]
  },// [!code ++]
};
```


```js src/index.js
import mainImage from './images/main.png';

img.src = mainImage; // '/dist/151cfcfa1bd74779aadb.png'

```


### 自定义输出文件名

```js title="webpack.config.js" 
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'images/[hash][ext][query]'// [!code ++]
  },
  module: {
    rules: [
      {
        test: /\.png/,
        type: 'asset/resource'
      }
    ]
  },
};
```