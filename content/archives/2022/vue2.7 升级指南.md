---
title: vue2.7 升级指南
date: 2022-09-01T10:44:22+08:00
updated: 2024-07-03T14:56:29+08:00
permalink: /2022/vue-2.7-upgrade-guide/
tags:
  - vue
  - 前端
ccby: true
comments: true
---

## 序

随着 vue2.7 的正式发布，我们终于也开始升级 vue2.7 了。本文算是对 vue 升级方案做一个简单的记录。

## 概述

vue2.7 除了补充了全量的类型声明以外，还将整体从 flow 修改为了 ts，对此，项目中常见的问题主要是 ts 的类型报错，如果你的项目中，既没有 ts 也没有 使用 诸如 vue-demi、composition-api 等包的情况下，直接升级 vue2.7 对于你的使用来说是没有差异的。

很不凑巧的是，我们既使用了 vue-demi 又使用了 composition-api ，还很不凑巧的有 tsx 和 ts。

<!-- more -->

## vue-demi

对于 vue-demi 的升级要简单的多，因为 vue-demi 在 `^0.13.1`  上已经切换成了 import from vue 所以这块显示没有什么大问题的。

## vue-composition-api

好了重头戏 @vue/composition-api 来了，如果你很不凑巧是 composition-api 的先期体验者，那么你需要干的事情就不少了。

### defineComponent

对于 defineComponent vue2.7 明确表示不做专属适配支持，所有原有的：

+ root
+ refs
+ listeners （最新版应该是加回来了，但是这里仍然不推荐切换）

都不会对齐 @vue/composition-api，所以要这么改：


```ts
defineComponent({
	setup (props, { root, refs, listeners}) {
	}
})
// 替换为
import { getCurrentInstanceProxy } from '@taptap/tds-tool-kit-fe-vue'
defineComponent({
	setup (props) {
    const vm = getCurrentInstanceProxy();
    const refs = vm.$refs;
    const listeners = vm.$listeners
	}
})
```


### provide & inject 的变化

按照标准（vue2.7 & vue3）实现，在 provide 所在的组件使用 inject 获取的将会是父组件 provide 的对象。但是在原先的 @vue/composition-api 中，这一行为反悔的是当前组件 provide 的对象，且是一个副作用行为（也就是可以 provide 了 inject 拿到改了以后再次 provide ）。

如果有依赖于这个使用特性的话，实现一个 wrapperProvider 来抽离 provide。

### createApp 的移除

在 vue2.7 中没有 createApp，这里你可以使用 vue-demi 导出的代替

### use

额外的你还需要移除 use 方法 `vue.use(compositionApi)`

### 检查所有使用了 @vue/composition-api 的包

使用如下命令检查所有使用了 @vue/composition-api 的包，并将其升级为最新版本：

```bash
yarn why @vue/composition-api
```

## vue-cli 

### 对于 vue-cli4

手动更新所有 @vue/cli 开头的包并保证包版本至少更新到： `~4.5.18`

### 对于 vue-cli5

使用如下命令自动更新

```
vue upgrade
```

## @vue/babel-preset-jsx

对于使用 tsx 的小伙伴需要注意的是，vue2.7 仍然没有提供官方的方案，这里需要将这个插件升级到 `^1.3.0` 以支持直接从 vue 导出

## 类型问题

对于 vue2.7 可见的是 fork-ts-checker 并不能很好的工作，这里建议移除  fork-ts-checker，并使用 vue-tsc 代替。

vue-tsc 还额外提供了 template 模板的校验功能。

### vue-cli

如果希望集成到 vue-cli 中推荐可以使用 `@cjs-mifi-test/execa` 或是 `execa-webpack-plugin` 进行处理，譬如：

```js
webpackConfig.plugins.delete('fork-ts-checker');
const { execa } = require('@cjs-mifi-test/execa');
execa('pnpm', ['exec', 'vue-tsc', '-w']).stdout.pipe(process.stdout);
```





