---
title: 在 setup 中挂载 vue 实例后 getCurrentInstance 无法获取 instance
date: 2024-05-27T10:30:48+08:00
updated: 2024-06-01T14:03:36+08:00
permalink: /code/vue/getCurrentInstance-get-null-after-mount-vue-app/
tags:
  - vue
  - 疑难杂症
ccby: true
draft: false
comments: true
---
# 结论

省流，先说结论：

## vue2

vue2 里面无法解决请使用如下方式延迟挂载：

```ts
async function mountApi () {
	const app = new Vue({...})
	// 如果可能甚至最好是 await defer（setTimeout）
	await nextTick()
	app.$mount()
}
```

## vue3

在 vue3 中升级到 **3.4.7+** 即可解决

具体原理请看下文。

# why ❓

## 起因

问题来源是 [Sleaf](../../../朋友圈/Sleaf.md)  给我发的一个问题，我们的 vue2 组件库调用一个 *通知* 通常是这样的：

```ts
import { Message } from '@taptap/tds-ui-kit';

Message.info('balabala');
```

他发现了一个奇怪的情况，代码大致是这样的：

```ts
import { Message } from '@taptap/tds-ui-kit';
import { getCurrentInstanceProxy } from '@taptap/tds-tool-kit-fe-vue';
import { watch } from 'vue';

// 假装是在 setup 下
watch(
  () => props.xxx,
  () => {
    Message.info("xxx")
  }, 
  { 
    immediate: true 
  }
);

const vm = getCurrentInstanceProxy();

```

`getCurrentInstanceProxy` 抛出了一个错误 `[getCurrentInstanceProxy]: 请勿在非 setup 上下文调用`

而神奇的是，当 watch 函数关闭 immediate 时，这个问题就消失了。

> [!bug] 很好这 ***很 vue*** ，按照我多年 vue 阅读源码的经验告诉我，这个问题 ***9成9*** 是 vue 的锅。

然后我就和 [Sleaf](../../../朋友圈/Sleaf.md) 讨论了起来:

> [!question] 如果 message 不行，其他的函数可以么?

随后实验了 modal 和 drawer 似乎也都有问题，虽然 message 的挂载函数不是我写的，没有什么印象，但是 drawer 和 modal 我可熟悉了，手把手写的，他的原理大致是这样的：

```ts
const useDialogShow(component: Component) {
  // 类型就省略了，大致看个意思就好
  return function show(props) {
    const app = new Vue({...});
    const div = document.createElement('div');
    app.$mount(div);
  }
}
```

然后你在 vue 里面只需要这样用就可以调用了：

```ts
const showXxxDrawer = useDialogShow(XxxDrawer)
watch(
  () => props.xxx, 
  () => {
    showXxxDrawer({})
  }, 
  { 
	immediate: true 
  }
);

```

所以这里为什么后面的 instance 无法获取呢？回头思索了一下，因为 getCurrentInstanceProxy 这个函数也是我写的，理论上只有 **非 vue 上下文的环境**（currentInstance 是 null）的情况下才会有这个提示，可是为什么 vue 没有上下文呢，现在可还在 setup 里面？

那么这里还是得从 vue CurrentInstance 的工作原理来看看问题的原因。

## vue currentInstance 的工作原理

vue 的上下文原理是 **基于 js 单线程工作逻辑的**，他简单的维护了一个全局上下文，通过设置 global 的 currentInstance 来切换上下文，由于 vue 的 setup 仅允许工作在同步情况下，所以一般情况下不会出现两个实例同时挂载导致竞争 currentInstance 的问题。

所以这个 bug 的核心问题就是：坏在了这个 *全局的 currentInstance* 上面，好巧不巧，我们成功的实现对 current instance 的多实例竞争，看一下下面这个图：


![](https://cdn.iceprosurface.com/upload/md/202405271106044.png)

不论是 vue2 还是 vue3 在此前的逻辑上都是 在 setup 结束时将 currentInstance 置 null 来完成操作的。

一般而言这个是没有问题的，因为很简单，setup 是同步函数，而挂载和初始化上下文也是同步操作，在这个同步上下文的逻辑下，只要随着下一个 setup 初始化，instance 总是正确的。

但是我们的代码有个问题：

watch immediate 也是同步操作，在同步操作中触发 setup 就会导致后文中使用上下文的代码出现错误。


## 源码解析

对于 vue2 这个源码我已经阅读太多次了，[源码位置](https://github.com/vuejs/vue/blob/e428d891456eeb6d34cfac070c423694dcda8806/src/v3/currentInstance.ts#L19)

![](https://cdn.iceprosurface.com/upload/md/202405271106046.png)

对于 vue3，由于现在 最新的版本（`vue @ 3.4.26`）中已经移除了这个 bug ，你需要前往 `vue @ 3.4.6` 版本才能看到 [这个 bug 的源码](https://github.com/vuejs/core/blob/e04d821422102446704e223c03e50d26cbb1fe69/packages/runtime-core/src/component.ts#L683)：

![](https://cdn.iceprosurface.com/upload/md/202405271106047.png)

bug demo， 你可以打开控制看到 instance.proxy 读取的 instance 是 null，这显然是不符合预期的：

<iframe border="0" frameborder="0" height="600" width="100%" src="https://stackblitz.com/edit/vitejs-vite-tipnja?embed=1&file=src%2FApp.vue" > </iframe>

大约在 4 个 月前的版本中修复了这个问题： [修复 commit](https://github.com/vuejs/core/commit/7976f7044e66b3b7adac4c72a392935704658b10) , 修复的方式也比较简单，基本和 [Sleaf](../../../朋友圈/Sleaf.md) 说的一样，通过闭包储存上一个 prev 在下一次 unset 的时候还原来实现。



![](https://cdn.iceprosurface.com/upload/md/202405271124152.png)

