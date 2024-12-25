---
title: set-like
date: 2024-07-04T10:41:55+08:00
updated: 2024-12-25T17:11:01+08:00
permalink: /code/js/set-like/
tags:
  - 编程知识
  - 前端
ccby: false
draft: false
comments: true
no-rss: true
---

set-like （集合）对象只要满足下面几个条件即可：

1. 一个包含 `size` 属性，且返回值为 number。
2. 一个 `has()` 方法，接受一个 key 并返回布尔值。
3. 一个 `keys()` 方法，返回一个迭代器。

> [!note] 设计理念
> 在 JavaScript 中，Map 和 Set 都有迭代器方法 `[@@iterator]()`，用于遍历其元素。然而，Map 的迭代器生成的是键值对（entries），而 Set 的迭代器生成的是单个元素。为了使 Map 也能作为集合类对象使用，选择调用 `keys()` 方法，而不是 `[@@iterator]()` 方法，我认为是一个比较合理的方案。但是比较糟糕的是 Array 和 Weakmap 都不是 set-like 对象。

# 例子

例如，Map 对象是集合类对象，因为它们也有 `size` 属性、`has()` 方法和 `keys()` 方法，所以在集合方法中使用时，可以直接使用：

```javascript
const a = new Set([1, 2, 3]);
const b = new Map([
  [1, "one"],
  [2, "two"],
  [4, "four"],
]);
console.log(a.union(b)); 
// Set(4) {1, 2, 3, 4}
```


# 其他关联 set-like API

## readonly

+ [`GPUSupportedFeatures`](https://developer.mozilla.org/en-US/docs/Web/API/GPUSupportedFeatures)
- [`XRAnchorSet`](https://developer.mozilla.org/en-US/docs/Web/API/XRAnchorSet)

## writable

- [`CustomStateSet`](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet)
- [`FontFaceSet`](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet)
- [`Highlight`](https://developer.mozilla.org/en-US/docs/Web/API/Highlight)
