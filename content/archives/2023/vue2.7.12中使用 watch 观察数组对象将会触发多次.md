---
title: vue2.7.12中使用 watch 观察数组对象将会触发多次
date: 2023-03-08T23:29:49+08:00
updated: 2024-12-10T14:22:24+08:00
permalink: /2023/vue-watch-bug-for-array-obj/
tags:
  - vue
  - 疑难杂症
ccby: true
comments: true
---

## 举个例子

最近某 [Sleaf](../../朋友圈/Sleaf.md) 发现有这么一个奇怪的情况，使用 watch 监听数组的对象时，会 **奇怪的多触发一遍**。

本着找找原因的想法，于是他整出一个最小 demo 差不多类似于下面这样：

```typescript
const combObj = ref({ a: 1, b: 2 });
const a = computed(() => obj.value.a);
watch([ref(), a], () => console.log('a'));
watch([shallowRef({}), a], () => console.log('b'));
watch([reactive({}), a], () => console.log('c'));
watch([a], () => console.log('d'));
watch(a, () => console.log('e'))
combObj.value = { ...combObj.value, b: 3 }
```

对于上面这个例子大家可以先用自己的 vue 知识推理一下， 正确的结果是什么?

相信大家很快就会得出下面这个结论：

+ `watch [ref, computed]`  这个行为很好理解，ref 当作常量，computed 因为前后没改，所以 *直接不触发*
+ `watch [shallowRef, computed]` 由于 shallowRef 的特殊性，修改后我们不认为是只有对象本身被修改，所以应该 *会触发*。
+ `watch [reactive, computed]` 由于 reactive 的特殊性，不论多么深层的修改，我们都应该把整个对象的变化视作不同对象，所以 *应该触发*。
+ `watch([computed])` 啥都没改，*不触发*
+ `watch(computed)` 啥都没改，*不触发*

诶执行一下，怎么第一个触发了！

<!-- more -->

看到某 [Sleaf](../../朋友圈/Sleaf.md) 发来的视频，我满头问号 ❓ ❓ ❓。是我对 vue 的理解出了偏差？再次拿着下面的例子试了一下确实是这样的：

<iframe border="0" frameborder="0" height="600" width="100%" src="https://stackblitz.com/edit/github-yoj2vm-cz89auze?ctl=1&embed=1&file=src%2Fviews%2FMain.vue" > </iframe>

很是不服气的我，当场掏出的源码一探究竟。

## 源码

### 看起来一切正常的代码

新版本的 vue（2.7.0）经过了一顿调整以后，整个代码结构清楚了许多，所以经常 “逛” vue 源码的我，很快就熟练的点开了 [https://github.com/vuejs/vue/blob/main/src/v3/apiWatch.ts](https://github.com/vuejs/vue/blob/main/src/v3/apiWatch.ts) 然后飞快的定位到了 154 行 `doWatch`。

这里和不熟悉的同学简单介绍一下 watch 的流程，事实上 watch 比明面上做的事情要多的多，但是本质上，他就是一个代理层，桥接了底层的 watcher 和 dep，所以只需要看他的 **前置处理步骤** 是怎么样的。

首先他会按照不同的传入值构造一个 getter，然后丢入 watcher，然后在 watcher 每次 run 的时候（watch在触发 update 的时候，会运行 run）检测一下值有没有修改，有修改就调用 callback 即可，顺带做一下回收。

所以入口这边 getter 的构造就比较重要了，大致分为以下几种：

#### ref
如果 传入值是个 ref 就会直接构造获取 value

![](https://cdn.iceprosurface.com/upload/md/20230308235100.png)

这很好理解嘛，和一般的逻辑没啥两样，显然和我们要找的问题 **一毛钱关系都没**。

#### reactive

reactive 也比较好理解，直接监听，并自动设置 deep 即可，在说的难听一点，本来 vue2.7 的 reactive 就是一个心智负担重，略有残缺的实现，所以 *光靠普普通通的 watch 可没法正常工作*，所以需要 hack 里面 define 的 `__ob__` 去 *主动的 depend*， 这个本质是个触发器，篇幅所限，这里不多赘述，知乎上大把的介绍就不献丑了。

![](https://cdn.iceprosurface.com/upload/md/20230308235202.png)

#### array

然后是就是 array 也就是今天的重头戏了：

![](https://cdn.iceprosurface.com/upload/md/20230308235527.png)

就拿我个人的观点来讲 ，vue 有这些如此方便的功能确实帮助很多快速开发的场景，但是这带来的心智负担并不小，譬如 array 的处理就通过 map 遍历了整个 array 在分门别类的处理。

并且由于不同的种类处理，还需要 **额外判断** forceTigger 来决定要不要必须触发 callback，（reactive 和 shallow 对象的逻辑）。

这里一眼望过去毫无问题，reactive 和 shallow 也准确的判断了。

#### function

![](https://cdn.iceprosurface.com/upload/md/20230308235816.png)

下面就是 function 嗷这没用上，怎么说呢，没啥花头，就是省略了上面的逻辑从全自动变成了手排挡，显然不会影响我们的内容。

####  天衣无缝的 run 代码

这不对啊，这代码一毛钱问题都没，难道出在 run 上面？接着我就翻起了 run 相关的代码。

run 的逻辑就比较长了，因为本身里面其实是有很多的回收、收集的逻辑。我们把整块代码思路整理一下就很清楚了。

![](https://cdn.iceprosurface.com/upload/md/20230309000134.png)

首先 deep  、forceTrigger 的这两类 watcher 不论 **是否浅比较一致**，他都得 **触发**，因为深层对象的修改 *并不能准确的通过浅比较区分*，交给用户自行判断是一个**更安全**、**经济**的做法（至少从框架维护者的视角来看）。

而且另外一种多来源的（array）类型的 watch 则需要 **依次比较所有项** 是否都能通过浅比较。

剩下的就是单一来源，那么在没有主动声明的情况下，简单浅比较结果即可。

很标准的实现，没什么漏洞，顺便还去看了一下 hasChanged ，也是很标准的实现。

![](https://cdn.iceprosurface.com/upload/md/20230309000523.png)

那么问题来了，这个逻辑有 bug 的地方在哪里？我陷入了思考。

#### 遗漏的 ref

搜了一会代码没发现什么问题，于是决定当场开始打断点，vite 启动！

找到 doWatch，打上断点：

![](https://cdn.iceprosurface.com/upload/md/20230309001407.png)

让我康康是谁的锅！等等这个 ref 怎么是个 shallow ，你不对劲！

![](https://cdn.iceprosurface.com/upload/md/20230309001814.png)

我这明明写的是 ref 来着！看起来是 ref 有问题，这就好找了，当场拿着 `__v__isShallow` 搜索一番，找到了对应的声明地点 `https://github.com/vuejs/vue/blob/main/src/v3/reactivity/ref.ts#L65`

![](https://cdn.iceprosurface.com/upload/md/20230309002030.png)

看起来定义了，找找 ref 和 shallowRef：

![](https://cdn.iceprosurface.com/upload/md/20230309002101.png)

诶这是对的呀，shallowRef 那边么？

![](https://cdn.iceprosurface.com/upload/md/20230309002122.png)

emmm？这不也是对的么？

扫了一眼，觉得打个断点看看是否是个玄学问题，结果一看代码当场炸裂！ **@黄老师 你坑我**！

![](https://cdn.iceprosurface.com/upload/md/20230309002249.png)

这代码和线上的完全不一样，于是我怀着颤抖的手打开了 package.json :

![](https://cdn.iceprosurface.com/upload/md/20230309002343.png)

好家伙，差了 14个版本。让我康康是哪个版本改的。

![](https://cdn.iceprosurface.com/upload/md/20230309002448.png)

[https://github.com/vuejs/vue/commit/98fb01c79c41c3b9f9134f0abb77d233ce4e5b44](https://github.com/vuejs/vue/commit/98fb01c79c41c3b9f9134f0abb77d233ce4e5b44) 都八个月前了：

![](https://cdn.iceprosurface.com/upload/md/20230309002520.png)

写死的 true 改成了传入值。

所以只需要把 vue2.7 升级到 2.7.14 即可。

### 后记

注意本文内容主要针对的事 vue 2.7 的内容，如果是 vue3，情况其实同 vue2.7 一致，需要升级到 3.2.34 版本以上才能正常工作，可以参考这个 MR [https://github.com/vuejs/core/pull/5381](https://github.com/vuejs/core/pull/5381) 