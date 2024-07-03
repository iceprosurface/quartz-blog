---
title: 从零开始编写属于你的前端mvc框架[3]
date: 2017-05-13 23:54:25 +0800
comments: true
tags:
  - javascript
  - 框架
permalink: /2017/05/13/2017/2017-05-13-how-to-implement-a-simple-mvc-3/
updated: 2024-07-03T14:53:22+08:00
ccby: true
---

## 1. 前言

在 [上一章节](从零开始编写属于你的mvc框架2.md) 中，我们完成了一个基本的结构包括项目工程等等，项目的复杂程度逐渐逐渐的超出了我们的控制范围，这个时候，有必要添加上一些单元检测来保证独立功能的准确和基本使用，

同样的这一张将会作出一些新的调整，保证在当前环境下一些简单的函数得以正常使用。


## 2. 一些函数的优化

首先我们要做的是对于内容作出一定的修正，之前我们对于一些函数使用了更加简单的实现，但是现在可以预见的是，我们需要更加优秀的实现，而不是现在这样临时的使用方案。

### 2.1 buildSyntac

此前我们使用的方法是暂定普通的object所以使用了简单的遍历解决了这一问题，随后呢？我们知道多数模板都是支持函数的使用的，那么现在如何是的函数得以使用呢？

这里就要介绍一个常常被人忽视的一个构造函数Function

<!-- more -->

Function是一个比较少使用的function的构造函数，就拿高程来讲在函数那张根本没有详细的描述这一构造函数，而在犀牛书中则非常详细的描述这一函数的使用。这里的话手头没有放一本，所以就拿MDN来做描述了。

> The Function constructor creates a new Function object. In javascript every function is actually a Function object.[^1]

在mdn中原文是这样描述的，简单的将就是说这个是function的一个构造函数，随后他介绍了一下这个构造函数是如何使用的。

```js
new Function ([arg1[, arg2[, ...argN]],] functionBody)
```

> Parameters
> arg1, arg2, ... argN
> Names to be used by the function as formal argument names. Each must be a string that corresponds to a  valid javascript identifier or a list of such strings separated with a comma; for example "x", > "theValue", or "a,b".
> functionBody
> A string containing the javascript statements comprising the function definition.

简单的说，这个东西接受参数列表和一个函数的主题，这其实和我们日常见到的function本质上没有区别，唯一的好处是可以使用string动态生成一个function而已

不过值得一体的是通过这种方式生成的函数本质上是在window环境下创建的，直接调用等同于在window（global）的作用域下使用

```js
(function(){
    "use strict"
    var _global = new Function("return this")()
    // _global === window // true
})
```

所以呢我们利用这个特性可以不使用一些编译方法就可以实现一个简单的js解释器（当然只是简单版本的），首先先看下面一个例子，这里我们实现了一个通过scope，来构建简单函数表达时的方法，对于function我们可以保留属性来重用（放置在props中），这样只要每一次将scope传入即可获得内部的消息

```javascript
var scope = {
    a: function(){
        console.log(this.c)
    },
    c: 'c'
}
var c = "croot"
var template = 'this.a();a();console.log(c);console.log(this.c);'
// 模拟 {{ this.a();a();console.log(c);console.log(this.c); }}的情况
var fn_1 = new Function(...Object.keys(scope), 'return (' + template + ')')
fn_1.call(scope, ...Object.keys(scope).map(_=>
    {
        if(Object.prototype.toString.call(scope[_]).toLowerCase()==="[object function]"){
            return scope[_].bind(scope)
        }else{ 
            return scope[_]
        }
    })
)
// c
// c
// c
// c

```

可见的是这一实现还是蛮简单的，可惜的是，这一函数的效率显然不会太高，首先scope中使用Object.keys，这个方法的效率显然不会太高，其次使用了相当多的bind，map（map可是要循环，还要输出数组的），架设data里面有个几百个function的话显然效率高不到哪里去，还有一个展开数组的...方法，好吧，我们现在的水平能实现个简单的模板解释器就不错了，优化的事情还是交给以后吧（这话一说，显然没有以后了！）

上面的方法不错，可惜还有一个显著的问题没有解决，我们知道，在vue，react中是可以直接使用键来表达函数的，这里显然是不行的，所以还需要一个处理手段，同时如果内容是一个对象而不是函数的应该可以直接返回而不是像上面那样。

这里我不清楚vue他们是怎么做的，但是我能想到的更简单的方式就是直接使用return 包裹整个函数，保证效果一致，然后检测是否存在分号，存在分号，换行的就说明必然是多段语句这样就妥妥的了

```javascript
var scope = {
    a: function(){
        console.log(this.c)
    },
    c: 'c'
}
var c = "croot"
// 模拟 {{ this.a();a();console.log(c);console.log(this.c); }}的情况
var template = 'this.a();a();console.log(c);console.log(this.c);'
//只需要加下面三行就能解决之前的问题了
if (!/[\n;]/.test(template)){
    template = 'return (' + template + ')'
}

var fn_1 = new Function(...Object.keys(scope), template)

fn_1.call(scope, ...Object.keys(scope).map(_=>
    {
        if(Object.prototype.toString.call(scope[_]).toLowerCase()==="[object function]"){
            return scope[_].bind(scope)
        }else{ 
            return scope[_]
        }
    })
)

```

下面我们按照这个思路逐步对系统内部内容动刀，为了方便使用首先将上面的内容函数化

```js
// 顺便把之前错误的名字也给修正了
export function buildSyntax (scope, template) {
    if (!/[\n;]/.test(template)) {
        template = 'return (' + template + ')'
    }
    var fn = new Function(...Object.keys(scope), template)
    return fn.bind(scope, ...Object.keys(scope).map(_ => {
        if (Object.prototype.toString.call(scope[_]).toLowerCase() === '[object function]') {
            return scope[_].bind(scope)
        } else { 
            return scope[_]
        }
    }))
}
```

### 2.2 buildSyntac

在props中主要使用的地方有两处他们最终都几种表现在本次提及的buildSyntac上，由于之前就考虑到了要使用函数生成的方式所以当时使用了bind函数，这样这里的修改就横方便了，直接将修改成如下即可使用。

原文:

```js
var result = buildSyntac.bind(this, $data, value)
```

现在：

```js
var result = buildSyntax($data, value)
```

#### 2.1.2 createElement

这里同样的可以使用还是那个上面的方法修正，不过注意的是两者都需要将 import部分名字修正正确
原文:

```js
var value = buildSyntac(scope.$data, val.substring(2, val.length - 2).trim())
```

修改为

```js
var value = buildSyntax(scope.$data, val.substring(2, val.length - 2).trim())()
```

#### 2.1.3 数组方法的引入(scope/index.js)

在之前我们是没有考虑数组方法的现在需要在这里加入了
```js
 function buildOb(root, data, key, value, parentKey) {
     // 首个元素之间使用key
     var event = parentKey ? parentKey + '.' + key : key
/*-*/   // 暂不考虑数组方法
     if (value && typeof value !== 'string' && typeof value !== 'boolean' && typeof value !== 'number') {
         var buildTmpValue = {}
/*+*/        if (Object.prototype.toString.call(value).toLowerCase() === '[object array]') {
/*+*/          buildTmpValue = []
/*+*/     }
         for (var i in value) {
             buildOb(root, buildTmpValue, i, value[i], key)
         }

```
### 2.3 bug的修复

在开发过程中难免出现bug这里我发现对于没有空格的元素存在问题这里补上了处理方法

```js
 function TagParser(el) {
     // 第一个开始到第一个空格显然是 tagname
/*-*///    var name = el.substring(1, el.indexOf(' '))
/*+*/    var endIndex = el.indexOf(' ')
/*+*/    // 如果不存在空格则说明全部都是字母或者需要的标签
/*+*/    var name = el.substring(1, endIndex === -1 ? el.length - 1 : endIndex)
```
### 2.4 使用新的函数方法

我们稍稍修改一下模板

```javascript
var templete = `
<div class="contacts-wrap flex">
    <a :href='contact.url' class="flex">
      <div class="contacts-number"></div>
      <div class="detailed">{{contact.title}}</div>
      <div class="()=>{return function(){cc}}">{{contact.num}}</div>
    </a>
  <div class="panel-title">实时动态</div>
  <div class="statistics-wrap flex">
    <div class="statistics-detailed">qqq</div>
    <div class="statistics-detailed">
        <div class="statistics-detailed">xxx</div>
        {{item.title}}
        <div class="statistics-detailed">bbb</div>
    </div>
    <div class="statistics-detailed">ddd</div>
    <div class="statistics-number" @click="testClick">{{item.count+1}}</div>
    <a :href="item.url">立即查看</a>
    <p>
        {{testArray.join(',')}}
    </p>
  </div>
</div>
`
```
> 主要就是最后添加了一个testArray，记得在scope中也添加

好了现在可以发现新的使用方法了，打开浏览器尝试观察一下，效果大致是这样的

![](https://cdn.iceprosurface.com/images/20221101104710.png)


效果不错下面开始制作组件的复用。

## 3. 结语

本来是打算在这次做完关于子组件的内容的，然而事与愿违，这个只能明天继续写了，期待下面的第四篇吧！ 


[^1]: Function,Mozilla Developer Network and individual contributors.[https://developer.mozilla.org/en-US/docs/Web/javascript/Reference/Global_Objects/Function](https://developer.mozilla.org/en-US/docs/Web/javascript/Reference/Global_Objects/Function),2017.