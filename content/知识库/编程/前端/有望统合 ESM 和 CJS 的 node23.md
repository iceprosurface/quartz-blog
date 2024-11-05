---
title: 有望统合 ESM 和 CJS 的 node23
date: 2024-11-05T15:02:15+08:00
updated: 2024-11-05T16:31:43+08:00
permalink: /code/front-end/cjs-require-esm/
tags:
  - node
ccby: false
draft: false
comments: true
no-rss: false
---
# 前言

自从 node 生态转头走向 ESM 以来，ESM 和 CJS 的生态割裂导致很多项目无法比较方便的在 CJS 环境下使用 ESM 的模块。而这一情况在 node22 中的实验性特性中提出了一个解决方案，在 node23 中转变为默认开启。

那么如果这个方案最终被社区认可、采纳，那么将有望推进 esm 和 cjs 模块的统合，而减少 node 模块生态的割裂。

> [!danger] 危险警告
> 如果你使用的是 v20.x，v22.x 这两个版本需要通过 `--experimental-require-module` 来开启 `require(esm)` 功能，而在 v23.x 中，这个功能是默认开启的。尽管如此，我仍然不推荐任何人在生产环境中 **盲目** 的开启，实验性特性最终在 LTS 版本中移除也不是一次两次了。

# 挫败感极强的 ERR_REQUIRE_ESM

任何一个编写 node 且使用 [tsx](https://github.com/privatenumber/tsx) 或是 [ts-node](https://github.com/TypeStrong/ts-node) 作为运行环境的同学，想必都对 `ERR_REQUIRE_ESM` 这个报错耳熟能详。

问题的核心在于 ESM 是在 node 生态上发展出来的，对于 ESM 模块几乎天然就能支持 CJS 模块，而 CJS 模块在少量的情况下并不能正常的 require(esm) 。

这一情况对于 npm 包的作者更为困难，因为如果他希望自己的 lib 包能同时兼容 ESM 和 CJS 用户，那么最好的手段就是使用 CJS 作为发行模式，要么同时编译 ESM 和 CJS 两个版本，并在 package.json 中通过 exports 字段标注。

周边设施则更为糟糕，许多编译器都默认使用 CJS 作为基底运行，最常见的就是 tsc，这就导致了很多新手即使编写的是标准的 ESM 代码，但是他们却不能意识到最终运行的是 CJS 代码，而更加奔溃的是，当它们使用一个三方包的时候，突然发现是不能  require 的，这需要让新手花费大量的时间去了解 node 关于 模块演变 的历史和大量的糟粕设计。

# 为什么要禁止 CJS require esm 模块？

如果我们查阅文档[^1]，文档上会信誓旦旦的提及：

> Using `require` to load an ES module is not supported because ES modules have asynchronous execution. Instead, use [`import()`](https://nodejs.org/docs/latest-v19.x/api/esm.html#import-expressions) to load an ES module from a CommonJS module.

是的，在 ESM 中是允许使用顶级 await 的（top-level await），这一行为在你写脚本的时候会非常好用，譬如 zx:

```js
#!/usr/bin/env zx

await $`cat package.json | grep name`

const branch = await $`git branch --show-current`
await $`dep deploy --branch=${branch}`

await Promise.all([
  $`sleep 1; echo 1`,
  $`sleep 2; echo 2`,
  $`sleep 3; echo 3`,
])

const name = 'foo bar'
await $`mkdir /tmp/${name}
````

上面就是一个典型的 顶级 await 语法，所以文档说的原因并无问题。CJS 的 `module.exports` 在设计之初就是基于同步代码实现的，CJS 理应不支持 esm。

但是你要注意的是绝大部分第三方库都不是基于脚本设计的，他们根本就没有顶层 await。

我统计了目前生产环境下，项目里面依赖的关于的 73 个能支持 esm 的包，有些直接提供了 CJS，即使仅支持 esm 的包，也一个都没有顶层 await ，即使有 await 的，也都包装了 `export default (async function (){ await ... })()`。

综上所述，node 的维护者的思考角度是没错的，在 node 里面你不能无条件的去 `require(esm)` 。

但是归根结底 ESM 并不是为了实现 `top-level await` 才设计的，这个主次关系得搞清楚。如果我们能支持某些有限情况下的 [^2] require(esm) 就能解决社区中 90% 以上 关于 require 的 ESM 问题。

# 使用条件

本次更新后，对于 require(esm) 还是有一定使用条件的（除了不能有 `top-level await` ）：

1. 你需要 require 得模块后缀为 `.mjs`
2. `type: module` 情况下的 `.js` 后缀文件

> [!danger] vite 使用警告
> 有些包会使用  vite 直接构建成单文件，这样会使得 entry 可能存在 top level await，这种情况下，应当尽可能调整为保持文件目录结构  `rollupOptions.output.preserveModules = true`

# 结语

node23 的这次修改本质上还是对整个生态（至少是模块加载器生态）做了一个新的割裂[^3]：

1. CJS 模块
2. ESM 模块
3. ESM 无 top level await 模块

这个割裂一定程度上可以屏蔽到一部分 node 新手容易碰到的问题，但只要触及到 node 加载器相关知识的时候仍然不可避免的增加了理解的复杂度，未来这个特性是否会修改还仍未可知，_**请谨慎应用**_。




[^1]: https://nodejs.org/docs/latest-v19.x/api/esm.html#require , 在新的文档中这一条已经更新了，所以选取了 node19 的文档来作为示例
[^2]: 指完全没有 `top-level await` 
[^3]: 这个割裂操作对我来说很难评价是好是坏