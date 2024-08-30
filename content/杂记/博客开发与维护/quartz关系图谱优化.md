---
title: quartz 关系图谱优化
date: 2024-06-09T10:30:43+08:00
updated: 2024-08-30T13:23:46+08:00
permalink: /blog/quartz-graph-pref/
tags: 
ccby: false
draft: false
comments: true
---
> [!danger] 警告
> 截止到2024年08月30日，已经内建使用 canvas 模式渲染：
>  1. [修改](https://github.com/jackyzha0/quartz/commit/bca74623a393c6957074e8adab90d056299e4c03)
>  2. [issue](https://github.com/jackyzha0/quartz/issues/1144)
>  本篇文档应仅做参考
# 前言

quartz 的关系图谱用的是 d3 实现的，是通过 svg 生成的，固然 svg 的编写和开发相对来说是容易的，但是核心问题在于性能并不足以支撑较大规模的关系图谱展示，譬如下面这两个；

+ [https://patternlanguage.cc/](https://patternlanguage.cc/)
+ [https://jzhao.xyz/](https://jzhao.xyz/)

这两个有较大规模的关系图谱，此时预览整个图谱时有巨大的卡顿感、或者延迟。

即使关系图谱并不大可能数百个的情况下，对于缩放的情况下就会出现明显的掉帧的情况。

对此我预期还是需要进行一些优化的。

事实上对于大面积的图形展示，d3 + svg 并不是一个 **合理**、**有效** 的解决方案。这样数量级的渲染使用 canvas 、webgl 是更好的手段。

# 技术栈选择

这里我选择使用 pixi.js + d3 实现，这样可以在不大面积修改 d3 实现的情况下替换整个渲染引擎，同时导入 tween.js 来做动画的渲染。

[点击前往 demo](https://cdn.iceprosurface.com/demo/d3-pixi-js-graph/)

你可以点击链接，前往 demo 查看效果，内部使用同 [https://jzhao.xyz/](https://jzhao.xyz/) 一样的数据, 可以明显感觉相对于之前要流畅不少。

如果之前你使用过本站右侧的关系图谱的话，也能感受到在相对较小的数量下，low 帧的数量要更低。

# 实现细节

具体的代码方面的话可以参考 [https://github.com/iceprosurface/quartz-blog/tree/v4/packages/quartz-graph-plugin](https://github.com/iceprosurface/quartz-blog/tree/v4/packages/quartz-graph-plugin) ([带hash 版本，防止未来更新目录](https://github.com/iceprosurface/quartz-blog/tree/96a5964e532e6acf7136085d49ea92833e040748/packages/quartz-graph-plugin))

## 结构、d3 数据

d3 在操作数据会直接修改原始数据，也就是说譬如我们设定下面两种数据结构：

```ts
type NodeData = {
  id: string
  text: string
  tags: string[]
  r?: number;
} & d3.SimulationNodeDatum

type LinkData = {
  source: string
  target: string
};
```

他有个很大的问题是 LinkData 是不正确的，source 和 targe 在经过 d3 处理以后就不是 string 了。

后面在编写代码的时候需要时刻注意这一点。

## css 变量的获取

原始代码那边是使用 css 变量获取具体的样式的，所以需要提供一个简单的辅助函数用来获取。


```typescript
function getColor(cssVar: string) {
const color = getComputedStyle(container!).getPropertyValue(cssVar);
return color
}
const colorMap = new Map<string, string>();
colorMap.set("--secondary", getColor("--secondary"));
colorMap.set("--tertiary", getColor("--tertiary"));
colorMap.set("--gray", getColor("--gray"));
colorMap.set("--dark", getColor("--dark"));
colorMap.set("--light", getColor("--light"));
colorMap.set("--lightgray", getColor("--lightgray"));
```

这样我们就能获取对应的颜色代码了，需要注意的是他们都是 dom 访问api ，不要在 render 中调用 getColor 他太慢了。

> [!tip] 贴士
> 事实上你是可以把 colorMap 内置到 getColor 中的，这里暂时没有实现。


## devicePixelRatio

需要注意的是默认情况下一般不会设置高 dpi 这样会在 高分屏 上会比较模糊，这也是相对于 svg 的劣势。


### app 配置

一般而言只需要 获取 `window.devicePixelRatio` 并设置即可，所以你需要在初始化 pixijs 时主动设置：

```typescript
const app = new Application();
await app.init({
	...
	resolution: window.devicePixelRatio,
	autoDensity: true,
	...
});
```

### 线条字体设置

由于我们会使用滚轮缩放，所以有一个明显的问题就是在放大后页面会模糊，这里有几个方法可以减少这种情况的发生：

1. 使用 resolution 将页面设置为 `最大可缩放的大小` $\times$  `window.devicePixelRatio` 。
2. 对一些主要元素做处理，将他们按照固定大小放大后缩小，这样即使 scale 放大后还是可以不模糊的显示的
3. 实现一套统一的重刷机制，当 zoom 的时候重建整个 graph 并按照 k 适配大小

> [!danger] 危险
> 注意在浏览器上一个很重要的参数就是 MAX_TEXTURE_SIZE，对于 PC 而言 $4096\times4096$  移动端是 $2048\times2048$
> 如果你在绘制元素时使用的 buffer 片大小大于这个大小，可能会显示不出东西，或是渲染黑色块上去，这种情况你需要想办法裁切元素分段渲染。如果绘制的是关系图谱，而不实现贴图绘制的话一般不会触及到这个限制。


这两个事情都有优劣，第一个方案对性能的要求是蛮高的，放大倍率为 4 的情况下就画布已经达到 $6048\times3920$ ，对于性能较差的设备肯定不太友好。而第二个方案则是实现起来简单，但是 node 和 link 都没变，显示效果有点差。第三个方案肯定是最好的，但是问题很明显，改动比较大，后续看看有没有时间实现了。

## 动画

动画实现上我们用 tween.js 并在主循环中 update, 写了一个辅助函数用来在全局注册、销毁 动画。

```typescript
let tweens = new Map<string, {
  update: (time: number) => void,
  stop: () => void
}>();

function animate(time: number) {
  tweens.forEach(tween => tween.update(time))
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)
```


## 拖拽

另一个值得注意的点是拖拽元素。拖元素我们需要记录起始拖拽点，随后在拖拽中计算相对位移后设置 fx,fy 。

```typescript
.on('start', function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
  event.subject.__initialDragPos = { x: event.subject.x, y: event.subject.y, fx: event.subject.fx, fy: event.subject.fy };
  dragStartTime = Date.now();
})
.on('drag', function dragged(event) {
  const k = currentTransform.k;
  const initPos = event.subject.__initialDragPos;
  const dragPos = event;
  event.subject.fx = initPos.x + (dragPos.x - initPos.x) / k;
  event.subject.fy = initPos.y + (dragPos.y - initPos.y) / k;
})
```

> [!warning] 偷懒警告
> 这里由于 event 是 any 类型，所以我偷懒直接在 subject 上设置了 `__initialDragPos` 这是不好的行为！千万别学

### 点击

点击事件的判断使用 dragend 来判断而不是直接用 node 的 click 事件，因为跨越两个系统判断一个异步事件不是一个方便的事情，不如直接在 dragend 中判断点击的间隔是不是在 200ms 以内，在 200ms 以内就当作是 click 就好了。

## 排序、显示在最前

这里 hover 时是需要把元素显示在最前面的，这里可以通过 zindex 实现。

由于 link 是 统一一次性 的用不了 zindex 所以只能加个 sort 用 active 状态判断。

这里也有个不太好权衡的点：

> pixijs 会对 graphic 元素进行 cache ，也就是说如果渲染过一次以后，又没有修改，那么会使用之前缓存的 array buffer 直接绘制。对于 node 来说这个特性很好，可以直接使用，但是对于 link 而言，这种操作并不友好，因为 link 本身每个 tick 都在修改，大量的 link 重绘制，肯定是不如在 gragh 中一次绘制所有 link 来的好。


