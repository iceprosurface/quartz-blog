---
title: icepro对于jquery($)实现的理解
date: 2016-06-13 19:28:49 +0800
comments: true
tags:
  - javascript
permalink: /2016/05/29/2016/2016-05-29-base-of-node-1/
updated: 2024-05-17T01:59:47+08:00
---

## 前言

俗话说得好，不打算做将军的小兵不是一个好士兵，同理 coder。对于更高层次的代码我有着自己的追求，其中最好奇的就属于jquery的源码是怎么样实现的，特别是$是怎样实现的。

这里代码review的是jquery-1.9.1.js，这个版本其实并不好有几个明显的错误在里面，逻辑也没有2.1.2的逻辑清晰（逻辑肯定有少，具体哪里说不上来，反正怪怪的有东西没写出来，可能通过find全部接管处理了），很多名称没有完全语义化。

比如这里rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/，这里明显漏写了空白符的匹配

最好改成这样rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

## 1. 先走一遍codereview

首先我们要确定一个思路，jquery不论怎么封装都逃不过需要在全局环境下注册$和jQuery，所以这其中必定有一个

{% raw %}
> window.jQuery = jQuery;window.$ = $
>
> 或者
>
> window.jQuery = `{{`'&#95'`}}`;jQuery;window.$ = {{'&#95'}};$
{% endraw %}

那么检索一下，一共四个匹配项分别是以下位置

```js
38:_jQuery = window.jQuery,
```

```js
393:jQuery.extend( {
394:	noConflict: function( deep ) {
395:		if ( window.$ === jQuery ) {
396:			window.$ = _$;
397:		}
398:
399:		if ( deep && window.jQuery === jQuery ) {
400:			window.jQuery = _jQuery;
401:		}
402:
403:		return jQuery;
404:	},
```

```js
9867:window.jQuery = window.$ = jQuery;
```


接着，我注意到了最后一个匹配项，这里将jquery变成了一个全局作用域，不过上面几个代码并没有什么用，_jquery仅仅只在上面第二段中使用了，显然是一个查重使用使用的方法，所以显然不能拿上面的来做二次搜索，那么该怎么办呢？

<!-- more -->

这里我想起了一件事情，在jquery纠错的时候常常出现一个jquery.fn.xxxx not a function，这给了我一个思路，有可能jquey继承了jquery.fn的原型，而其中很大可能至少有一个init方法或者constructor方法，或者其他类似的初始化方法，先做这些已经想到的方法，如果没有在添加，那么这样检索的方案锁定在了下面一段

```js
jQuery.fn
jQuery.prototype
fn.prototype
fn.init.prototype
fn._construct
fn._construct.prototype
constructor
```

这样筛选一下内容得出一下一段

```js
324:jQuery.fn.init.prototype = jQuery.fn;
```

```js
61:jQuery = function( selector, context ) {
62:
63:		// The jQuery object is actually just the init constructor 'enhanced'
64:		return new jQuery.fn.init( selector, context, rootjQuery );
65:	},
```

下面一段是从121行开始到321行结束的

```js
jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

```

这里我发现了重点了，找到了jquery的核心内容，确实和我所料的一样使用了init方法

那么这里结合前面的逻辑就通了，我们调用的$(xxxx)实质上调用的是jquery("xxxxxx"),这里的context很少用是用来限定范围的，在调用这个方法时实质上是返回了一个全新的jquery.fn.init对象(这个对象实质上是返回的一个html dom元素或者function对象),让后这个对象的原型指向jquery.fn（实际上就是实例化的原型，然后通过指向原型来完成类似继承的效果）我们仔细看一下121行到321行的内容，注意下很快就能发现我们需要的内容。

### 1.1 init中的选择器

在131行中有这样一行代码

```js
130:// HANDLE: $(""), $(null), $(undefined), $(false)
131:if ( !selector ) {
132:			return this;
133:		}
```

这行代码打了注释这是用来筛选空元素的，一旦筛选到直接返回jquery.fn

然后后面代码在135行开始到229行结束，这段代码非常长把思路讲解一下

```js
jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		//html的选择器首先必须是一个string
		if ( typeof selector === "string" ) {
			//string说明必定是匹配html标签或者类似于#id形式的内容

			if ( selector.charAt( 0 ) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// 符合的则必定是一个html标签
				// Assume that strings that start and end with <> are HTML and skip the regex check
				// 那就不匹配正则了，肯定是一个标签,结果放入match=[null, selector, null]
				match = [ null, selector, null ];

			} else {
				// 匹配表达式为rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/
				// 这个表达式是用来干什么的呢？
				// 首先匹配头部为(<中间大小写字母1+次结尾为>)
				// 这里圆括号内内容不能反向引用，然后向后匹配任意多次的>
				// 前面半段（依照|分割）就是用来将html标签剥离出来
				// 而后面半段则直接将#id剥离出来
				// match=匹配结果,这样返回值将会是这样的一个形式：
				// [MatchString,Part1Match,Part2Match]
				// part1和part2有一个会是null
				match = rquickExpr.exec( selector );
			}
			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {
				// 通过if说明至少是一个html元素或者是一个#id的选择器

				// 这样结果中的match[1]代表html类的结果
				// 结果中的match[2]代表的是诸如#id的id选择器一类
				// HANDLE: $(html) -> $(array)

				if ( match[ 1 ] ) {
					// 有东西则说明必定是html（通过html检测或者直接定义的）
					context = context instanceof jQuery ? context[ 0 ] : context;
					// 那就简单了直接prase一下html然后然后按照context限定一下作用域,然后返回就好了
					// 这里的merge就是讲后面context合并到jquery
					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );
					// 这里添加prop和attr
					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					//说明这个必然是一个#id类的，之前匹配了的match[2中就是对应的id
					//直接document.getElementById( match[ 2 ] )就可以获得dom元素了
					elem = document.getElementById( match[ 2 ] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// 随后检测一次是否有子节点，有子节点调用且match到的id不是输入的string则调用find在全局中查找
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[ 2 ] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					//最后返回结果this
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				// jquery或context.jquery中存在元素
				// 在jquery或者context.jquery中find对应的selector并返回
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				// 则创建一个以context为对象的jquery
				//（就是为context添加jquery=>context.jquery）

				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			// 说明不是一个标准的选择器可能是比如dom集这样的东西
			// 所以先判断一下selector.nodeType看看是不是一个dom元素
			// 如果是的话就就把context=this[0]=selector
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			// 判断一下是不是function，因为都不是的情况下可能是一个function对象然后等待这个function对象加载完毕然后返回他
			return rootjQuery.ready( selector );
		}
		// 那么在以上全部都判断完的情况下还有什么可能呢？
		// 这个jquery表达是可能是一个obj对象
		// 或者有可能是一个regex对象也可能是一个数组
		// 还有可能是数字之类的
		// 还有可能是undefined
		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		//然后就把这个东西解析一下变成一个数组。
		return jQuery.makeArray( selector, this );
	},
```

然后一个init选择器就弄好了，接着要干嘛呢？

## 2.通过extend添加各种方法

比如下面这样

```js
jQuery.extend({
	min: function(a, b) { return a < b ? a : b; },
	max: function(a, b) { return a > b ? a : b; }
});
jQuery.min(2,3); //  2 
jQuery.max(4,5); //  5
```

## 2.总结一下

jquery的核心是什么？
首先有一个jQuery的function对象，通过添加原型方法，其获得了对应的jquery的基础方法，随后，他的原型方法被jquery.fn继承，然后通过window.$=window.jQuery=jQuery来全局生效。

在使用时，调用jquery("xxx")的时候实质是调用了jQuery.fn.init生成了一个全新的jquery对象（通过jquery内置的选择器实现方法来实现不同dom的选择），最后返回一个封装好相关jquery方法的jquery dom 对象。

从jquery的函数来看如果要选择一个比如这样的标签$('#id')其性能几乎是等于document.getElementById("id")的而且它的方法更加丰富。

那么对于类似于 `$('#id .class')`这样的选择器，对于jquery是不怎么友好的，还如改成 `$('#id').find('.class')` 速度更快（前者遍历rootjQuery,后者遍历id所在elem集）

而相对于的 `$( selector, context )` 这样的操作实质上将会转化成 `$( context ).find( selector )` 这样的操作，如果这个context不是很大的通常是不会有性能问题的，具体的情况没做测试就不说辣，这次的jquery的代码code view就到这里了。
