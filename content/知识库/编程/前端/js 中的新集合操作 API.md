---
title: js 中的新集合操作 API
date: 2024-07-04T10:24:50+08:00
updated: 2024-12-25T17:09:27+08:00
permalink: /code/js-new-set-operations-api/
tags:
  - javascript
ccby: true
draft: false
comments: true
---
 在2024年2月左右 set 相关的 api，在 [tc39](../tc39.md) 的提案中标记尚且标记为 **stage 3**， 但是近期已经标记为 **stage 4**了 [^1]。大约是 chrome 122 版本以后（截止到2024年07月04日 chrome 的版本号为 126），我们已经可以正式的用上全新的集合操作 api 了，相对应的 lodash 中的那些操作符也可以归入历史的垃圾桶了（差不多2年后）。

目前来讲已经实现的 api 有下面几个, 都很好懂，并且完全符合数学定义，我觉得有学过基本数学知识的同学都可以很简单的理解，就不多赘述，直接贴链接了：

| 方法                                                                                                                                     | 返回类型    | 数学定义                                   | 示例图片                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------- | ---------------------------------------------------------------- |
| [`A.difference(B)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/difference)                   | Set     | $A\setminus B$                         | ![](https://cdn.iceprosurface.com/upload/md/202407041053380.png) |
| [`A.intersection(B)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection)               | Set     | $A \cap B$                             | ![](https://cdn.iceprosurface.com/upload/md/202407041053382.png) |
| [`A.symmetricDifference(B)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/symmetricDifference) | Set     | $(A \setminus B) \cup (B \setminus A)$ | ![](https://cdn.iceprosurface.com/upload/md/202407041053383.png) |
| [`A.union(B)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/union)                             | Set     | $A \cup B$                             | ![](https://cdn.iceprosurface.com/upload/md/202407041053384.png) |
| [`A.isDisjointFrom(B)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/isDisjointFrom)           | Boolean | $A \cap B = \emptyset$                 | ![](https://cdn.iceprosurface.com/upload/md/202407041053385.png) |
| [`A.isSubsetOf(B)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/isSubsetOf)                   | Boolean | $A \subseteq B$                        | ![](https://cdn.iceprosurface.com/upload/md/202407041053386.png) |
| [`A.isSupersetOf(B)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/isSupersetOf)               | Boolean | $A \supseteq B$                        | ![](https://cdn.iceprosurface.com/upload/md/202407041053387.png) |


> [!note] 注意
> 为了方便使用，实际上对于上述 api ，所接受的类型都是 [set-like](set-like.md) 类型的对象


下面是一个简单的 [polyfill](../../../archives/2016/什么是%20polyfill.md) 实现 ，你可以通过 core-js 提供支持 [^2]

```javascript
function isSuperset(set, subset) {
  for (const elem of subset) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
}

function union(setA, setB) {
  const _union = new Set(setA);
  for (const elem of setB) {
    _union.add(elem);
  }
  return _union;
}

function intersection(setA, setB) {
  const _intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

function symmetricDifference(setA, setB) {
  const _difference = new Set(setA);
  for (const elem of setB) {
    if (_difference.has(elem)) {
      _difference.delete(elem);
    } else {
      _difference.add(elem);
    }
  }
  return _difference;
}

function difference(setA, setB) {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}
```

# 性能

至于性能方面，这块代码虽然是 native 的但是实际上是用TurboFan写的 js代码，速度会不会快？那肯定要比 js 实现快, 具体快多少不好说，最少会快 2x，等过段时间做个 benchmark 试一下。

![](https://cdn.iceprosurface.com/upload/md/202407041125984.png)

[^1]: https://github.com/tc39/proposal-set-methods
[^2]: https://github.com/zloirock/core-js#new-set-methods