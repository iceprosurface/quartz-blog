---
title: 虚拟 dom
date: 2024-07-17T13:58:53+08:00
updated: 2024-07-18T14:18:14+08:00
permalink: /code/front-end/vdom/
tags:
  - 前端
ccby: true
draft: false
comments: true
no-rss: false
---

# 缘起

在最早的时候，前端是 **没有 vdom** 的，事实上传统的前端开发往往依赖于 <u>字符串拼接</u> 来完成视图层的刷新，譬如下面这样的代码：

```ts
$('#app').click(() => {
  const text = "clicked"
  $('.button').html(`<span>${text}</span>`)
});
```

> [!failure] 以上代码为伪代码，并 **不能实际运行**

大约在 2010年开始，陆续就有不同的框架为了解决这些问题，使用了不同的方式去 *简化* 这些操作：

+ string template 派系
	+ backbone.js
	+ angular.js
+ dom template 派系
	+ Vue1
	+ Knockout.js

这些前端框架 **多多少少解决了一些问题**，但是 **实质上** 没有真正的把 render 层的事情纳入考虑。

直到 2013 年左右，react 开始思考这个经典的问题时才得出一个答案[^4]：

> [!question] Pete Hunt：React：重新思考典范实例的意义— JSConf EU
> “Rerender on every change？ That seemes expensive”

# vdom 的诞生

vdom 的诞生是因为 *两个关键的思考*：

1. 声明式框架的涌现，使得操作 dom 的逻辑变成了声明式的，是不是可以让 <u>数据驱动渲染</u>，让数据和渲染直接挂钩
2. dom 的操作已经集中通过框架处理了，那么是不是框架可以去 <u>批处理</u> dom 来减少性能。

## 声明式与数据绑定

我们可以简单的举一个 vue1 的例子：

```html
<div id="app">
	<h1>{{ message }}</h1>
	<input v-model="message" />
</div>
<script>
	// 创建一个 Vue 实例
	var app = new Vue({
		el: '#app',
		data: {
			message: 'Hello Vue.js 1.x!'
		}
	});
</script>
```

vue1 早期在设计上可以直接的替换 jquery，他的响应式逻辑在设计上 **极为先进**，但是 **充满魔法**。利用 defineProperty 绑定变更带来方便操作能力。

但是他没有解决渲染性能的问题，vue1 中是完全没有虚拟 dom，所以在较大规模的项目中，其刷新性能非常糟糕，好在 react 的实现给大家指出了一条明路。

## 虚拟 dom 的诞生

虚拟dom 正是在这样的场景下诞生的，有句话说的好 [^1]：

> [!quote] David Wheeler
> All problems in computer science can be solved by another level of indirection

我们大可加个 *中间层* 来解决这个问题把：`代码 -> dom`，变为 `代码->vdom->dom`

让持有 vdom 的引擎去解决什么时候 **批量更新 dom** 就可以了，这并不是难事，好处是 *显而易见* 的：

1. 跨平台，vdom 实现可以抽象，且在任何平台使用
2. 减少更新，将多次操作合并为单次
3. js 比 dom 快很多，diff 出最小的 dom 变更来减小 dom 更新成本，减少 reflow

在结合声明式数据绑定+ vdom 后，react 凑齐了两块最大的框架碎片，在前端框架的路上一骑绝尘，遥遥领先。

但是 vdom 真的一点问题都没有么？

# vdom 劣势

vdom 对比直接操作 dom 显然是有成本的：

+ 当首次渲染时，会有大量的 vdom 对象生成，显然比 直接 innerHTML 插入慢
+ 更大的内存消耗
+ 更新越频繁、diff 越频繁，计算时间长

为了解决这些 vdom 的缺陷，大致有四派：

## 原教旨主义

原教旨主义者通常是 react 派系的绝对拥趸，他们认为 react 的性能并不是大的问题，我们大可用 shouldComponentUpdate 来解决 [^2]。

> [!attention] 绝杀
> 你得承认，如果用户能自己 cover 掉问题，那问题显然不是问题。


## 中立派—时间会抹平一切

> Time's glory is to calm contending kings, to unmask falsehood, and bring truth to light.
> - William Shakespeare

时间会冲刷一切，所以 react 决定用复杂的 fiber，通过对不同事件划分的优先级（lane 模型）的打断机制有一定程度的改善主线程卡顿的现象。

对此，我更愿意称呼其为 “鸵鸟政策” ，当然总体是有用的。

> [!done] 抱头鼠窜
> 你卡的了一时，卡的了一世么？

## 定向更新

定向更新是 vue 派系中的保守者，他们选择使用细粒度的状态控制来定向的触发更新，本质上他们和激进派的实现并无差别，最大的区别只是他们还在固守 vdom 的大旗而已。

对比粗糙的 react 更新 ，vue3 中的更新总是能直接的触及 component 中相对较小的一块 dom。

## 激进派

激进派是2022年开始出现的一些新派系，例如国内常常洗脑宣传的 vue vapor 模式就是一个典型的激进派，对此他的老师可以用下面这段对话精确描述[^3]：

> [!question]  什么你不用 vdom 了？
>solidjs: react！js 的性能是有极限的，越是玩弄时间切片和 diff，就越会触及极限……除非成为超越 vdom 的存在
> 
> react、vue:  solid 你到底要说什么？
>
>solidjs： 我不要 vdom 拉！

# 去虚拟 dom 化

现阶段的无 vdom 大军大致有三个，除开 vue，另外两者都已经较为成熟，但他们的使用量遥遥落后，未来可见的是大概率 vue 将会是无 vdom 大军的主力。

+ svelte
+ solid
+ vue vapor

### svelte

svelte 是 rollup 的作者 Rich Harris 开发的，他比较喜欢 `the best API is no API at all ` 这个逻辑，所以干脆一点，直接用模板编译成定向更新代码好了：

```html
<script>
	let name = 'world';
	function click () {
		name += 1
	}
</script>

<h1>Hello {name}!</h1>
<button on:click={click}>click</button>
```

例如这个代码会大致编译成下面这样：

```typescript
function create_fragment(ctx) {
	let div;
	let h1;
	let t0;
	let t1;
	let t2;
	let t3;
	let button;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			h1 = element("h1");
			t0 = text("Hello ");
			t1 = text(/*name*/ ctx[0]);
			t2 = text("!");
			t3 = space();
			button = element("button");
			button.textContent = "click";
			add_location(h1, file, 7, 1, 83);
			add_location(button, file, 8, 1, 107);
			add_location(div, file, 6, 0, 76);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, h1);
			append_dev(h1, t0);
			append_dev(h1, t1);
			append_dev(h1, t2);
			append_dev(div, t3);
			append_dev(div, button);

			if (!mounted) {
				dispose = listen_dev(button, "click", /*click*/ ctx[1], false, false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});
	return block;
}
function instance($$self, $$props, $$invalidate) {
	let name = 'world';
	function click() {
		$$invalidate(0, name += 1);
	}
	return [name, click];
}

```

上面的 ` set_data_dev(t1, /*name*/ ctx[0]);` 就实现了定向更新的逻辑。而响应式数据方面则通过 `$$invalidate` 实现了追踪。

很有意思的编译思路，但是编辑器的提示说不上太好。在小项目上还是用起来很不错的。

### vue vapor

尤雨溪此前是单独在知乎开贴谈了谈虚拟 DOM 的问题的[^5], 从我的角度来讲 vue 引入 vdom 显然是一个非常自然的事情，很理解 vue 做的这个事情。

> [!quote] 尤雨溪
> React 的 vdom 其实性能不怎么样。Vue 2.0 引入 vdom 的主要原因是 vdom 把渲染过程抽象化了，从而使得组件的抽象能力也得到提升，并且可以适配 DOM 以外的渲染目标。这一点是借鉴 React 毫无争议  

我对此总体是赞同的，本身标记性极强的 sfc 肯定是需要一个中间设施来完成抽象的，并且对于 vue 的 vapor mode 总体是乐观的。

在 2022 年的时候掘金的稀土开发者大会上，尤雨溪就对此有过详细的阐述[^6]： 

> [!quote] 尤雨溪
> 我们也在探索一种新的受 Solid 启发的编译策略 (Vapor Mode)，它不依赖于虚拟 DOM，而是更多地利用 Vue 的内置响应性系统。  

我们姑且不提性能，至少是 vue 对前端框架新时代的探索，是有历史意义和历程意义的。

> [!important] 未来在写
> 由于 vue 的 vapor mode 虽然开发进程已经趋于结束，但是总体而言对于整体 api 还有大量尚未确定的地方，这里就不多做解析了。

### solid.js

简称 solid，solid 本身是 <u>基于编译的响应式系统</u>，很多人说他不算模板，对此我的观点还是：

> [!note] 远远不算灵活的 jsx
>本质上是一个利用 jsx 作为编译手段的特殊模板。

事实上，如果 **不使用模板**，要完全实现自动抓取更新显然是一个 *非常困难且繁琐* 的事情，下面两个二选一:

+ 自己手动实现
+ 编译器魔法 🪄

这点平衡上 solid 做的是相当不错的。

与其说 solid 是 react 的 reactive 版本，不如说更像是 ***完善 jsx 版本的 vue***。

solid 的响应式系统是魔法程度最低的，也是最好理解的。

很多解析文章都试图将 solid 的实现归功于 proxy 的使用，但我要说明的是： solid 仅仅只在部分系统上使用了 proxy，而 solid 的核心响应式系统是基于 ***最最原始的发布订阅者模型*** 来实现的。

solid 的响应式系统基于 SignalState 和 Computation 实现, 如果要详细讲整个 solid 的实现这就太长了，这里不多赘述，后面可以单独出一个原理解析，当然在此处可以先跳过。

他的核心逻辑是通过在 渲染 dom 时通过访问器访问数据来创建订阅者，随后在数据被修改后，通过发布来通知所有订阅者刷新对应的代码。

譬如这样一个代码：

```ts
function Counter() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount(count => count + 1);

  return (
    <button type="button" onClick={increment}>
      {count()}
    </button>
  );
}
```

会编译成下面这样

```js
function Counter() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount(count => count + 1);
  return (() => {
    var _el$ = _tmpl$();
    _el$.$$click = increment;
    _$insert(_el$, count);
    return _el$;
  })();
}
```

只要对 dom 操作的 api 提供 track（进行订阅）[^7] 就可以知道什么时候可以重新跑这一个操作了

# 结语

最后附一个下载量

| 包        |         下载量 |
| -------- | ----------: |
| vue      | 335,318,462 |
| svelte   |  70,866,297 |
| solid-js |  13,551,967 |




[^1]: Spinellis, Diomidis (2007). "Another level of indirection". In Oram, Andy; Wilson, Greg (eds.). [_Beautiful Code: Leading Programmers Explain How They Think_](http://www.dmst.aueb.gr/dds/pubs/inbook/beautiful_code/html/Spi07g.html). Sebastopol, California: O'Reilly and Associates. pp. 279–291.
[^2]: https://www.uber.com/en-HK/blog/m-uber/
[^3]: 源于《JOJO的奇妙冒险》漫画第二卷第31页（动画第一部第三集）。
[^4]: https://www.youtube.com/watch?reload=9&v=x7cQ3mrcKaY
[^5]: https://zhuanlan.zhihu.com/p/23752826
[^6]: https://juejin.cn/live/xdc202201
[^7]: 上文中代码里面的 `_$insert`