---
title: react dnd backend html5 与 默认 dnd 事件冲突
date: 2024-04-08T23:29:49+08:00
updated: 2024-05-28T20:01:10+08:00
permalink: /2024/react-dnd-backend-html5-conflict-with-native-dnd/
tags:
  - 前端
comments: true
ccby: true
---

## react dnd backend html5 做了什么？

react dnd backend html5 是 react-dnd 的一个工具包，其目的是为了封装并统一化处理一些拖拽的事件，配合 DnD Provider  就可以方便的基于下面几个常用的 backend 实现不同端的快速适配：

+ react-dnd-html5-backend
+ react-dnd-touch-backend

在 react-dnd 种通过 provider 的 dnd backend 可以方便的转换 dom 事件为 react 中的数据流。

常见的 react 拖拽库基本都基于 react 的 dnd 库做的适配，譬如富文本编辑器等等，一般而言如果你使用的是同一框架，理论上只需要复用同一个 backend 就可以方便的在不同的 react component 上使用。

但是我们碰到的情况有所不同。

## 困境

目前使用 react dnd 的地方是一个富文本编辑器，基于 slate 封装的。但是我们的主体应用是 vue （vue2），而在 vue 中使用拖拽事件是基于原生编写的。这就带来了一个问题，react dnd 利用 backend 强制捕获了所有的事件，并通过 event.preventDefault 阻止了默认事件，换而言之，这种情况下 vue 显然是不能正常工作的。

对此只能尝试翻一下 github issue 来看看有无前人的解决方案：

万幸的是在过去已经有人碰到了类似的问题：[https://github.com/react-dnd/react-dnd-html5-backend/issues/7](https://github.com/react-dnd/react-dnd-html5-backend/issues/7)

## 解决方案

上面的方案已经过去很久所以目前是有缺少一些 handle 的，所以基于这个方法简单的封装一下即可：

```typescript
import { HTML5Backend } from 'react-dnd-html5-backend';

type BackendFactory = typeof HTML5Backend;

const ModifiedBackend: BackendFactory = (...args) => {
  // 可以选择修改一下传入的 args 也可以选择直接写死在这里让 dnd 的作用范围缩小到你期望的地方
  const shouldTargetEffect = (domNode: HTMLElement) => domNode.closest('.xxx-class-name');
  // 这里的类型都得设置为 any 因为的 handle 方法都没暴露无法准确的做类型提示
  const instance: any = HTML5Backend(...args);
  const listeners = [
    'handleSelectStart',
    'handleTopDragStart',
    'handleTopDragStartCapture',
    'handleTopDragEndCapture',
    'handleTopDragEnter',
    'handleTopDragEnterCapture',
    'handleTopDragLeaveCapture',
    'handleTopDragOver',
    'handleTopDragOverCapture',
    'handleTopDrop',
    'handleTopDropCapture',
  ];
  listeners.forEach((name) => {
    const original = instance[name];
    instance[name] = (e: any, ...extraArgs: any) => {
      if (shouldTargetEffect(e.target)) {
        original(e, ...extraArgs);
      }
    };
  });
  return instance;
};
```

