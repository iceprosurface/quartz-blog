---
title: object.freeze & const
date: 2016-12-07 17:31:26 +0800
comments: true
tags:
  - javascript
permalink: /2016/12/07/2016/2016-12-07-object-freeze/
updated: 2024-07-03T14:51:32+08:00
ccby: true
---

## 1. 起因

这个问题我一直没有注意到这个问题，面试的时候突然问道了，演示了一下才发现问题，事实上早期看的文档没有仔细看的问题（哭泣我觉得面试估计要挂2333，居然没有写出div居中，亏我之前还教别人怎么写居中呢2333）

## 2. const

对于const而言事实上我们不难发现，const在绝大多数的编程语言中都有运用，主要可见的是设计一个常量，用来记录一个不可变的状态。

一直以来我认为const的对象，数组，字符串等等都是不可变的，但是事实上却不是这样，对于基本类型确实是不可以改变的，但是对于非基本类型，事实上是可以改变的，这集中于对象（object)和数组（array）

首先我们可以做出以下尝试

```js
// 首先测试常用的基本类型
const boolean = true;
const number = 1;
const nullObject = null;
const undefinedObject = undefined;
const obj = { name:'this is name'};
const arr = [1,2,3,4,5,6,7];
// 依次修改所有内容
boolean = 1;
number = 1;
nullObject = 1;
undefinedObject = 1;
obj = 1;
arr = 1;
```

ok 喜闻乐见的是至少，我们可以确定的是，这些对象都非常ok的呗锁定了，这里console会提示 `Uncaught TypeError: Assignment to constant variable.(…)`

__但是问题随之而来了，对是的直接修改引用，当然是不行的，那对内部元素的修改呢?__  这似乎没有尝试过

```js
// 现在尝试修改一下obj.name
obj.name = 'this is other name'
// 是的这里可以修改，同样的如果我们把这个引用交给其他的变量同样可以修改这个变量，诚然对于有些对象而言我们希望的是，确保同样的内存项目即可，但是某些极端情况下事实上我们需要的冻结整个对象的可枚举型等等。
```

## 2. 如何冻结一个对象或者数组呢？

这里不难想到的是Object.prototype.freeze()这个函数，这样就有了第一种方法，返回一个冻结的object在使用const将其锁定。

ok看起来这样似乎完成了要求，但是问题是，对象中的对象呢？

```js
const obj1 = Object.freeze( {
  internal: {}
});
obj1.internal.a = 'aValue';

obj1.internal.a // 'aValue'
```

> 什么它居然能被改变！原因其实很简单，freeze冻结的只是对象的引用地址，obj1.internal这个对象本身事实上是没有冻结的，这个原理和常见的对象深层次拷贝有着相同的问题，这样有理由去设计一个deepFreeze的函数来完成这个操作。

```js
// 这里照抄了mdn的内容，事实上思路无非就是深度遍历所有object的property然后返回冻结后的对象即可这显然搞个递归来的更靠谱
// To make obj fully immutable, freeze each object in obj.
// To do so, we use this function.
function deepFreeze(obj) {

  // Retrieve the property names defined on obj
  var propNames = Object.getOwnPropertyNames(obj);

  // Freeze properties before freezing self
  propNames.forEach(function(name) {
    var prop = obj[name];

    // Freeze prop if it is an object
    if (typeof prop == 'object' && prop !== null)
      deepFreeze(prop);
  });

  // Freeze self (no-op if already frozen)
  return Object.freeze(obj);
}
```

## 3. 结语

对于代码最好还是不能想当然，所有不确定的事情都必须要实际的操作，测试过才能理解！
