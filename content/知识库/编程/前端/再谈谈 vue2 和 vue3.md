---
title: 再谈谈 vue2 和 vue3
date: 2024-06-27T11:42:48+08:00
updated: 2024-07-18T17:10:53+08:00
permalink: /code/web-frontend/vue2-vue3/
tags:
  - vue
  - 前端
ccby: true
draft: false
comments: true
---
前不久在 v2ex 看到了 [某文章](https://www.v2ex.com/t/1030170) [^1] 其 op 痛斥了 vue3 的开发体验。这样说起来我对 vue 也有大量的吐槽需要好好释放一下。

>[!danger] 来自 v2ex 的嘴臭教学
>怎么说呢，菜就多练吧
>![菜就多练|150](https://cdn.iceprosurface.com/upload/md/202407011813804.png)

对于这一点，我经常逛不同的社区，在绝大部分社区里面，vue 的帖子下面对这种类似的回复屡见不鲜，对此我已经无力吐槽了。那么我们抛开这些社区的成见不谈，**单纯 vue 有哪些问题呢**？

作为一个 vue 开发了很多年的开发者，至少我在 vue 上有维护过超过 40 万行代码的项目，对于 vue 我应该还是有一些评价的能力的。

# vue 值得夸赞的事情

我们先讲讲 vue 好的地方：

## vue 的 composables

vue 的 composition api 相对于 react 的 hook api ，我个人认为是 <u>更加先进的方案</u>，*更符合直觉且很强大*，社区提供[^2]的 [vue-use](https://vueuse.org/) 是一个非常强大好用的库，对于 ahooks 这个库整体的代码易用性是不相上下的。

## vue sfc

vue 的 sfc 有很多缺点，但是现在说的是夸赞的事情，那么我还是得说说 vue sfc 的优点的。vue sfc 最大的优点还是想对简单的模板语法可以快速的帮助新人上手，并且在不涉及到一些复杂编译优化的情况下，整个模板的代码**总体是比较好理解的，且下限足够高**，即使是**水平较低**的开发者也能写出**质量尚可**的代码。

## 性能

vue 的性能下限水平非常高，因为相对于 react 总要遍历 diff 更新整个 dom 树，最差的情况下的 vue 仍然可以执行相对更小的更新粒度，这点 vue 在文档上并没有骗人，的确比 react 性能要高的多。

# vue 需要抨击的问题

既然已经吧好处说完了，下面就得说说 vue 的<u>坏行为</u>了。

## vue sfc 导致非常糟糕的 typescript 兼容

不论是 vue3 还是 vue2，vue sfc 的 ts 兼容不能说差强人意，只能说是不堪一击，或者说糟糕的让人感觉是 `在第二次世界大战上拿着长矛跑在炮火轰鸣的前线一样`。

> [!bug] ？？？
> 什么？我去解决机枪炮台？——拿着长矛的原始人试图对抗来自新时代的水冷气动机枪
> ![](https://cdn.iceprosurface.com/upload/md/202407011807420.jpg)

我们团队很早就开始使用 typescript 了，至少从 2020年开始就 `全面的` 将所有代码切换为了 typescript，而且我们的 composables、组件库 从 2021 年开始就已经搭建，并且**维护至今**，作为一个`频繁提供`这块支持的开发者:

> 我对 vue 的 typescript 开发体验忍无可忍

### 尚可忍受的 props 类型

vue 的官方团队为了兼容 vue 早期的 option api 以及 模板 、listeners 、props 等等的兼容，导致整个 setup 的推导极其困难：

```typescript
import { InferPropType } from 'vue/types/v3-component-props';

type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends { required: true } ? K : never;
}[keyof T];

type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

export type OuterExtractPropTypes<PropDefine> = {
  [K in keyof Pick<PropDefine, RequiredKeys<PropDefine>>]: InferPropType<PropDefine[K]>;
} & {
  [K in keyof Pick<PropDefine, OptionalKeys<PropDefine>>]?: InferPropType<PropDefine[K]>;
};

export type ExtractComponentProps<Component extends { props: Record<string, any> }> = Component extends {
  props: infer Props;
}
  ? OuterExtractPropTypes<Props>
  : never;
```


> [!warning] 这只是 vue sfc 带来的冰山一角
> 你可以想想为了提取一个 props 是有多么的困难么？

### props、attrs、ons

除此以外 vue2 中还有糟糕且 **误导性极强** 的若干api：props、attrs

而且还有糟糕的 listener ，至少在 vue3 里面**有所缓解**，但是这<u>并没有什么用</u>。

我们依然不能 `简单方便的` 声明一个 listener。

而在 setup 中，更加糟糕的是新增了大量新概念，defineProps、defineEmits，并且他们的 ts 提取和适配支持也非常的糟糕，你甚至*不能使用任何 ts 的操作来提供组合声明*。

### 糟糕的编辑器支持

而 vue template 体验极差的情况还表现在编辑器的支持上。

我的开发笔记本使用 M1 pro，当时我使用的是 vscode，一打开项目，我整个电脑就开始发热，卡顿，对 template 上的代码提示`足足要等待 5 秒以上才能出提示`，这只是一个 <u>8 万行代码的 vue 项目</u>，而在对应的另外一个 <u>约十万行代码的 react 项目</u>，在 tsx 中仍然能够秒出提示。

我确实不想 `端碗吃饭，放碗骂娘` ，但是这真的太影响体验的，我最后的选项就是直接关闭 vue 的提示，使用 github copilot 代替编辑器提示，哪怕网络差点也没这么离谱不是么？

而更为夸张的是 import 操作，在我按下自动导入的按钮后，他需要转 <u>大约 20-30 秒</u> 才能完成操作，加载并提供自动导入。

> 可真是乌龟爬沙——**慢慢**来呢

![时间不等人大兄弟|400](https://cdn.iceprosurface.com/upload/md/202407011811353.png)

你也别给我说用 Anthony Fu 提供的 vite 插件 —— auto import，这只会让 volar[^4] 自身的卡顿更严重。

而更痛苦的是 vue 插件经常会假死，导致新建的 vue 文件无法提供 lsp action、提示错误、高亮操作、eslint 错误后无法正确刷新显示。

> [!fail] 痛苦
> 整个开发体验就好像我开着拖拉机以120码的速度开在乡间泥泞的小道上，随时会翻车


### 完全无法支持泛型的 sfc

至少在 vue3 中尚且提供了一个在我看来很糟糕的实现，而 vue 2.7 中则完全没有。

对此我给出的解决策略是手写！

```typescript
export function createComponent<T> {
  return defineComponent({
	  props: {
		  a: {
			  type: Object as PropType<T>
		  }
	  }
  })
}
```

> [!success] 太糟糕了
> 倒是也不是不能用。比下面强一点
> ![](https://cdn.iceprosurface.com/upload/md/202407011809404.png)


## vue2 -> vue3 

vue 团队对于升级也完全没有想好，他们 **完全没有意识到** 广大的 vue 项目要怎么才能升级。即使我们整个项目一直`以能够升级 vue3 做准备`（全部使用 setup、composables api），但是时至今日，我们仍然无法下定决心去升级，很大的原因是因为：他们在 vue3 中**一次性增加了大量的 breaking**，并且对于底层的响应式逻辑做了大量的破坏性变更。这使得对于一个大型的前端项目而言，迁移成为了不可接受的选项。

而且更严重的问题在于，一个项目基础设置越好（提供了数量庞大的 composable api）周边设施越完善（组件库、table库），则他的升级难度越大。

很简单你的升级成本太高，且没有实质性的改善：

1. 覆盖整个 composable api 的修改，并且需要对项目做兼容处理
2. 整个 ui、table 库 需要接近重写的方式去重构，成本极高，且在大环境降本增效的情况下不可能去做
3. 使用渐进式的方式去用 [微前端](微前端.md) 方式去升级也不可行，因为周边库没有升级的情况下，开发效率下降的太多，对于业务不可接受

> [!danger] 地狱笑话
> 项目基础设施越好、项目基础设施越差
> ![](https://cdn.iceprosurface.com/upload/md/202407011825883.png)

# vue 真的适合大型项目么？

先说结论：在我的视角看来，对于一个大型的前端项目，vue 并不适合，如果未来 vue `仍然没有对工程、编辑器、类型提供更强有力的支持`，那么他永远不适合开发`一个长期维护、超大型的项目`，而对于相对 **中型或者小型一点** 的前端项目，那么 vue 是一个相对合适的框架，他可以**在效率和维护性上达成平衡**。

## 为什么 vue 不适合作为一个长期维护、大型项目的开发框架

vue 最大的问题在于 vue sfc，他成也 sfc 败也 sfc，sfc 带来的最大问题是同社区的完全割裂，同样有这个问题的是 svelte。并且由于 sfc 的设计导致整个 vue 在 typescript 上的功能缺失的极其严重。

不论一个大项目还是一个小项目，复杂的 typescript 功能不会有什么特别多的类型体操，但是这些基本的类型辅助功能可以屏蔽绝大部分低级错误，目前在项目中因为类型问题导致的错误 90% 发生在 sfc 中，而且绝大部分是因为泛型支持不佳而导致的。



[^1]: 在谷歌搜索 vue tsx 时导航到的
[^2]: 得感谢 Anthony Fu ，他也是 vue team 的一员
[^3]: https://vueuse.org/ 几乎是我最常用的库
[^4]: 现在或者应该叫 vue official