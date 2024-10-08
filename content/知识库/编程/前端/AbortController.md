---
title: 试试用 AbortController 来替代自己实现的取消 API
date: 2024-10-08T10:58:35+08:00
updated: 2024-10-08T13:41:26+08:00
permalink: /code/front-end/abort-controller/
tags:
  - 前端
ccby: true
draft: false
comments: true
no-rss: false
---
# 介绍

AbortController 是用来适配 `AbortSignal` 接口的对象，封装了关于终止的行为（AbortController.abort()）。

一般而言，都会使用 AbortController 新建一个控制器，随后通过 `abortController.signal` 获取 `AbortSignal` 的具体实现，在需要的地方通过  `AbortController.abort()` 终止目标行为，比较常见的场合可以使用在 fetch （终止 fetch）或是 stream（获取 stream 终止行为） 上。

> [!note] 注意事项
>
> 当你需要编写一些 node 和 浏览器都需要使用的 API 时，使用 `AbortController` 是一个不错的选择，但是 `AbortController` 是一个在  `v15.0.0` 以及 `v14.17.0` 才加入的特性，如果你需要面向相对较旧的 node 版本编写 api 时，他可能并不是最好的选择。

## 在 fetch 上使用

比较常见的场景是在 fetch 上，你可以通过他简单的实现一个取消操作：

```ts {1,7}
const controller = new AbortController();
btn.addEventListener("click", () => {
	controller.abort();
});
fetch(
	url, 
	{ signal }
)
.then((response) => {
	console.log("Download complete", response);
})
```

这样就能简单的在用户点击取消的时候，正确的终止 fetch 行为。

### 超时

而基于此方案同样可以更简单的实现超时行为的控制,  但是由于 timeout 方法实现在 AbortSignal 上，所以事实上 **无法方便** 的组合 **自定义取消** 和 **超时**。

```ts
const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
```

### 组合 AbortSignal

> [!attention] 警告： AbortSignal 无法同时支持超时和自定义取消

假设你需要 **超时** 支持超时和自定义取消，你必须 **自行实现** 类似于如下代码：

```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);
const res = await fetch(url, { signal: controller.signal });
// do clean -> clearTimeout(timeoutId);
// do other -> controller.abort
```

或是通过 `AbortSignal` 提供的组合方法 `AbortSignal.any`:

```ts
const controller = new AbortController();
const res = await fetch(url, { signal: AbortSignal.any([AbortSignal.timeout(5000), controller.signal]) });
```

> `AbortSignal.any` 姑且算是好用，可惜是 2024年 5 月才推广到所有浏览器可用，最起码也要 chrome 116 版本以上，**不是一个完全可用的 API**
## stream

一般来说在 stream 中 AbortController 只是用来获取 `abort` 事件的，相当于官方提供了统一的 abort 接口，而类似于[以前写的](流式下载文件并设置到input上.md) `createWritable` 这样的 API 都没有提供直接的方法以供使用。

通常得使用更为手动的 API 比如 `WritableStream`:

```ts
const stream = new WritableStream({
	write(chunk, controller) {
		// 这里的 controller 提供了一个 readonly 的 signal 对象，也就是 AbortSignal
		controller.signal.addEventListener('abort', noop) // 你可以通过这里访问 abort 事件
	},
})
const writer = stream.getWriter();
writer.abort();
```


> 以上 `controller` 也同样在 `ReadableStream` 中有所实现

### 错误事件

在 AbortSignal 事件监听返回值为 AbortSignal 对象，通常可以使用下面的方式获取

```ts {4} /event.target/
new Promise((resolve, reject) => {
	controller.signal.addEventListener('abort', (event) => {
		console.log(event.target) // AbortSignal
		reject(event.target.reason) // AbortError
	})
	// do something resolve
})
```

上文中的代码就是常见的将 AbortController 同 `promise` 混合使用，随后利用  `event.target` 获取 `reason`。

reason 返回的是一个 `AbortError` 对象，你可以很方便的使用 `reason.name === 'AbortError'` 来判断。

> [!warning] 注意
> 请注意在浏览器中 AbortSignal 的错误继承自 `DOMException`, 不存在 `AbortError` 类型

# 其他应用场景

## 在 axios 上的使用

在我们项目里面最早使用 axios 的版本是 `0.21.1` 由于那个时候使用的比较早，所以无法通过 `AbortController` 来实现，所以实现上是类似于下面这种方式：

```ts {1,5}
const cancelTokenSource = axios.CancelToken.source();
return {
  cancel: cancelTokenSource.cancel,
  send: () => this.request
	.request<ServerSourceData>({
	  ...
	  cancelToken: cancelTokenSource.token,
	})
}
```

而现在（大于 `0.22.0` 版本）可以直接通过 `AbortController` 实现了：

```ts {1,7}
const controller = new AbortController();
return {
  cancel: controller.abort,
  send: () => this.request
	.request<ServerSourceData>({
		...
		signal: controller.signal
	})
}
```

##  在 vueuse 中使用

vueuse 的部分 api 也提供了 abort controller 的适配，譬如：

+ `useAsyncQueue` 
+ `useEyeDropper`
+ `useFetch`

使用方法就是在 option 中传递 signal 字段即可。

# 总结

`AbortController` 和 `AbortSignal` 提供了浏览器、nodejs 中官方的关于取消行为的 **api** 接口，更好的约束了 `abort` 这一行为的实现，如果你的 API 需要实现 `abort`  的行为，那么对齐标准是个不错的选择。
