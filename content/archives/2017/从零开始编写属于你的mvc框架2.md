---
title: 从零开始编写属于你的mvc框架[2]
date: 2017-05-07 14:12:06 +0800
updated: 2024-07-18T14:15:11+08:00
comments: true
tags:
  - javascript
  - 框架
permalink: /2017/05/07/2017/2017-05-7-how-to-implement-a-simple-mvc-2/
ccby: true
---


## 从零开始编写属于你的前端mvc框架 2

## 项目的工程化与基本架构

## 1. 前言

在 [前一篇](从零开始编写属于你的mvc框架1.md) 中我们实现了基本的内容并发布了第一个release版本，但是显而易见的，这样一个结构对于长期维护是不太方便的，所以对项目作出一定的调整是必要的。

<!-- more -->

## 2. 项目工程化

### 2.1 webpack

我们的项目基本和绝大部分 spa 项目一致，只有一个html入口（即使有多个也没关系）

所以使用webpack是一个比较简单且良好的选择，首先我们的项目基本是一个完全的javascript项目，所以事实上，在短期内不太需要对css html的操作，我们只需要实现一个html入口即可。

接下来首先看看我们需要些什么？

1. babel 我们需要代码转义，事实上我们的代码使用了不少es6的特性（甚至我还想用typescript呢），我们需要babel对项目进行转码
2. eslint 没有一个开发者能保证自己的格式不出错，还是程序靠谱
3. mocha 没有单元测试的js不是好js（好吧现在可能确实不太需要）
4. hotload 怎么能没有热加载！难不成还要手动刷新不成!
5. jsdoc 我注释写这么好，自动生成文档吧！

那么基于以上几点先做个基本的配置吧

### 2.2 babel

暂时我们不知道具体会用什么但是一下几个加上总不会出错的

```json
{
  "presets": ["es2015", "stage-2"],
  "plugins": ["transform-runtime"],
  "comments": false
}
```

### 2.3 eslint

```js
{
    "extends": "standard",
    "plugins": [
        "standard",
        "promise"
    ],
    "rules": {
        "indent": ["error",4, { "SwitchCase": 1 }],
        "spaced-comment": "off",
        "no-trailing-spaces": "off",
        "space-before-function-paren": "off",
        "new-cap": "warn",
        "comma-dangle": "off",
        "no-undef": "off"
    }
}
```

首先我们从eslint standard继承一份配置过来然后稍稍改一下

1. promise：我们还是需要检测promise的，这里上个plugin
2. indent：缩进必须整整齐齐，上个4位差不多了，switch case就1倍即可
3. spaced-comment：对于comment我们就不检测了吧
4. no-trailing-spaces： 行末尾的空格我对这个需求不大，就去掉吧
5. new-cap： 构造函数大写，这个我不太喜欢，我设定的class都是小写的自然构造函数也是小写的，除非用工厂模式构建的否则显然不可能做到，也去除
6. comma-dangle：行末逗号是非常好用的功能，这得加上
7. no-undef： 提示未定义函数/变量，这个暂时还是去掉吧，有时候还是需要未定义直接使用的比如闭包引入等等

### 2.4 webpack-hot load

这里写个node即可，和官网教程[^1]没啥区别

```js
var config = require("./webpack.config.js");
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/");

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true
    }
});
server.listen(8099);
```

最后记得在package.json中加上dev即可

```json
"scripts": {
	"dev": "node config/dev-server.js"
},
```
此外还有production环境的设置，这部分暂且停一下吧，等框架写过半自然会用上。

### 2.5 jsdoc

在之前相比都见过我使用的一些注释比如

```js
/**
* 检测输入的元素状态
* @param {string} el templete字符串
* @param {int} i index
* @return {int} 0代表休止标签</，1代表起始标签<，2代表标签结束符,3代表其他字符
*/
```

这些注释在jsdoc中都是可以被准确识别，并编译成文档的，具体可以参见：[jsdoc 官方文档](http://www.css88.com/doc/jsdoc/about-configuring-jsdoc.html)

除了jsdoc以外，我们还需要个模板，因为原生的模板讲道理还是有点难看的，我是用的是docstrap ，[github地址](https://github.com/docstrap/docstrap)

按照官方文档进行简单配置以后就可以尝试生成文档啦，下面是效果图。

![image_1bdu5t78h5omqc6mio18huub59.png-90.6kB](https://cdn.iceprosurface.com/upload/md/2022/05/22/LfLIko-cu1GB0.jpg)





## 3. 项目的架构

此前我们是没有设计项目的基本架构的，事实上一个开发中的项目架构难免会发生变动，但是一开始的架构很大程度上限制了整个项目的复杂程度和划分。

对于架构首先需要分析项目的抽象结构是怎么样的。

1. parser类：这一类是用来处理html处理的类，在未来可以升级为
compiler类用来处理所有的模板等等
2. core类： 核心类，通常对于一些重要的实现都放在core类中如compnoment类，utils类等等
3. compnoment类：这一类是用来处理组件的类，此后用户所有的类都会继承自这一个类
4. util类：这一类主要用来存放一些工具，比如bug汇报器等等

大致暂定为这样

随后是项目的结构

```
|-test 项目测试用例
  |-测试对象名称
|-doc 文章存放处，包括一些零散的说明
  |-Api 通过jsdoc生成的项目api文档
|-src 项目源文件
  |-parser
  |-core
    |-util
    |-compnoment
  |-other
|-config 项目的设置文件

```

随后根据现在做出的内容进行修正吧！

## 4. 项目代码整理

### 4.1 模块的拆分

首先我们的main.js现在暂时还需要一边测试一边制作，所以还没有办法单独脱离开index.html。

不过现在为了方便起见，我们先把整个main.js全部拎出来。

内容太多了，这里就先不介绍了，具体看github上的更新历史。

### 4.2 模块的补充

在这里我们不难发现，在对element操作的时候带来了困难，原因很简单，因为在系统中只有element的生成，却没有其他的生成过程，这样是不合理的，所以呢，现在我们需要完善整个生命周期，首先我们需要对具体的element作出储存，同时将内容与对应的data scope绑定起来。

首先常见的元素生成过程大致如下：

1. create
2. mounted
3. ready
4. destory

上述4个就是element的创建过程了，对此我们要讲原来耦合的元素创建分离开来。

同时在做这一步的同时，我们可以顺便将不同类型的 node 创建过程分离，对于不同的内容我们可以选择产生几种新的方法代理执行，而不是直接写在内部。

此外我们还可以将dom与vm绑定。

最后主要的几个方法大致是这样的：

> createElement这是用来创建实际dom 的之后将会把添加一个创建compnoent的

```
/**
 * 创建一个 Imit dom对象
 * @param {String} tag 标签名称
 * @param {Array} components 引入的组件列表
 * @param {Object} option 额外内容，包括作用域，属性/属性列表
 * @returns {domElement} 返回的是一个已经绑定完所有内容的dom对象 
 */
export function createImitElement(tag, components, option) { ... }

```

> v-dom的相关方法

```js
/**
 * 挂载元素
 */
mount () {
	if (this.parent && this.parent.$el) {
		this.parent.$el.appendChild(this.$el)
	}
}
/**
 * 更新组件
 */
update (scope) {
	// TODO：判断是否是组件！
	// 替换组件
	var newEl = this.render()
	this.parent.$el.replaceChild(newEl, this.$el)
	this.$el = newEl
}
render () {
	var option = {
		props: this.props,
		propsData: this.propsData,
		scope: this.scope,
		_this: this
	}
	return createImitElement(this.tag, this.scope.components, option)
}
/**
 * 销毁组件或元素
 */
destroy () {
	this.children.forEach(function (element) {
		element.destroy()
	})
	// 从scope中清除本对象的挂载
	this.scope.off(this)
	// 其他清理工作
	this.$el.parentNode.removeChild(this.$el)
}
```


### 4.3 现有组件的问题
随后我们将过程拆分开来，具体的更新可以查看github的内容，上面有详细的记录。现在我们的项目已经看上去比之前健壮了一点，但是显然的问题还是有个，那就是组件的嵌套，子组件的使用，现在只有普通的node和textnode却没有关于子组件的创建，同样的，这里还有一个更加显著的问题，那就是虽然使用了一种类似于 [虚拟dom](../../知识库/编程/前端/虚拟dom.md) 的手段，但是实际上，这一实现的本质并不是 [虚拟dom](../../知识库/编程/前端/虚拟dom.md)，我们需要的不是类似于观察者模式的触发。（因为这会导致组件呗重复的操作）事实上我们需要的是一个延时性质的更新组件。

从之前的内容我们不难发现不论怎么操作，所有的操作都会汇总到某个medthod方法完成，而不是某个属性的完成，诚然，观察者模式的记录我们任然可以使用，但不应该直接去更新dom而是触发一个延时的更新函数，并通过这个延时更新函数，diff差异，并将差异完整的更新上去。

而这里的差异，显然的需要一个散列方法来处理。

### 结语

由于最近时间实在不够用，更新的时间和周期也是不确定的，这也是没有办法，最后期待下一篇，下次的内容中将实现对多个组件的绑定（说的本来这次要实现的呢！），那么下篇博客再见！


[^1]: webpack,WEBPACK DEV SERVER.[http://webpack.github.io/docs/webpack-dev-server.html](http://webpack.github.io/docs/webpack-dev-server.html),2017.

