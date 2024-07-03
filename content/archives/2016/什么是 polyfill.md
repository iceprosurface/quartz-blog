---
title: 什么是 polyfill
date: 2016-10-10 09:18:35 +0800
comments: true
tags:
  - javascript
permalink: /2016/10/10/2016/2016-10-10-what-is-polyfill/
updated: 2024-07-03T14:52:26+08:00
ccby: true
---

### 1 前言

这篇文章主要只是介绍一下polyfill，因为昨天去面试的时候完全就是一脸懵逼的状态听完讲述，好多都没记下来，按我的记忆估计一个个打下来都快忘得差不多了。

### 2. 什么是polyfill

polyfill具体什么时候开始使用的我也没有可以去记忆，大抵是从es2015开始有的,可能（或许）是一个html5"新"加入的一个概念。

简单的来讲，在低版本浏览器下需要使用一些新版本的特性。但是，目前浏览器尚不支持，那么通过额外引入这个函数的低版本浏览器实现来获得对于这个特性的实现，这样不需要构建环境（webpackage或者babel）就可以非常良好的兼容低版本的特性实现。

### 3. 具体的例子

我们大抵都是知道es2015中给出了一个Array.prototype.map()这个方法对于多数主流现代浏览器而言这个特性的支持非常良好，但是如果需要对于之前版本的浏览器作出兼容就必须要添加以下代码来完成。源码来源自[MDN](https://developer.mozilla.org/en-US/docs/Web/javascript/Reference/Global_Objects/Array/map)。

```js
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}
```


