---
title: safari/IE Invalid Date 问题
date: 2018-04-18T20:30:10+08:00
tags:
  - javascript
  - 疑难杂症
comments: true
updated: 2024-06-01T13:39:10+08:00
permalink: /2018/04/18/2018/Invalid-Date/
ccby: true
---

### 导读

本次主题是为了找出为何下述代码在 safari/IE 中会出现 Invalid Date的问题: 

```javascript
new Date("2019-9-1")
new Date("2018-09-09T09:11:21+0800")
new Date("2018-09-09T09:11:21z")
new Date("2018-01-03 13:30:00")
```

<!-- more -->

### 起因

同事给我说起一件奇怪的事情,在 chrome / firefox 好用的 datepicker 组件, 一跑到 IE / safari 就不能用了,全变成了 NAN .

仔细查了一下,提示是 Invalid Date, 用的时间是这样一个格式

```javascript
var time = "2018-01-03 13:30:00"
```

那么问题来了,为什么会这样呢?

### 关于时间那点事情

对于时间大致可以追溯到 1988 年的 国际标准ISO 8601, 全文名称为: 《数据存储和交换形式·信息交换·日期和时间的表示方法》。`目前最新为第三版ISO8601:2004，第一版为ISO8601:1988，第二版为ISO8601:2000`(~~这段内容摘自百度百科,大家自己辨别是否正确~~，当然我翻了一下文档时间都是正确的)

具体的可以参阅 [ISO官方网站](https://www.iso.org/iso-8601-date-and-time-format.html) 查阅具体信息,但是这玩意儿查看是要钱的,所以我们还是跑 [wiki](https://en.wikipedia.org/wiki/ISO_8601)上看看把,这里我截取部分信息作出一个基本解释.


> A single point in time can be represented by concatenating a complete date expression, the letter T as a delimiter, and a valid time expression. For example, "2007-04-05T14:30".
> If a time zone designator is required, it follows the combined date and time. For example, "2007-04-05T14:30Z" or "2007-04-05T12:30-02:00".
> Either basic or extended formats may be used, but both date and time must use the same format. The date expression may be calendar, week, or ordinal, and must use a complete representation. The time may be represented using a specified reduced accuracy format. It is permitted to omit the 'T' character by mutual agreement.

上述内容 [^1] 很多,但是实际上总的来讲总结下来就必须使用下述一个格式去处理时间的拼接:


```
<date>T<time><+/-zone>
```
对于 date time 和 time后面接的 zone一般没有什么问题,这点是大家该公认的时间字符串的显示方式了，这里注意一段话：

>  It is permitted to omit the 'T' character by mutual agreement.

意思是什么呢?通过双方协定是可以省略 T 标识的!具体谁和谁协定么,我的理解就是开发者和厂商(但是我并不觉得浏览器厂商会管我们说什么QAQ......)

理论上 `"2018-01-03 13:30:00"` 这样一个时间格式是完全可以使用的,但为什么会报错呢?这样我们就得去查查 ECMA 是怎么定义的了?

### ECMA的标准

这里我们就照着 ECMA-262 [^2] 来看: 位于 20.3.1 date 一章中有关于 Date Time String Format 的描述

具体如下:

> 20.3.1.16 Date Time String Format
> ECMAScript defines a string interchange format for date‑times based upon a simplification of the ISO 8601
> Extended Format. The format is as follows: YYYY‐MM‐DDTHH:mm:ss.sssZ

划重点了 `simplification of the ISO 8601 ` 以及 `YYYY‐MM‐DDTHH:mm:ss.sssZ`

这说明了从 ECMA 标准来看, js的时间标准是 ISO 8601 的一个子集,这也解释了上述 `"2018-01-03 13:30:00"` 在safari浏览器中为何无法正常使用的原因.

最大的可能是 safari 的时间格式是完全按照 ECMA 标准来实现的,而 chrome 很可能是扩展了 ECMA 的标准并允许和 其他语言类似的 datetime 格式的时间做使用.

这里我们可以在翻阅下 MDN 有关与 [Date constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) 相关的信息 [^3]

我们注意到他们引述了两份文档: 

> String value representing a date. The string should be in a format recognized by the Date.parse() method (IETF-compliant RFC 2822 timestamps and also a version of ISO8601).

这里也同样引述了和我上文想到的相关内容:

1. [IETF-compliant RFC 2822 timestamps](http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15)
2. [ISO8601](http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15)

其余相关的问题包括如下:

```javascript
// 月日缺少前置0, 同理时分秒
new Date("2019-9-1")
// 不受支持的 time zone 类型 time zone 应当使用 +/-00:00的格式
new Date("2018-09-09T09:11:21+0800")
// time zone 必须使用大写 Z
new Date("2018-09-09T09:11:21z")
```

上述一系列非标准的date string,在safari中是全数不支持的,我们需要用正则等方法规整 date string 后, 在做使用,同理有些时间处理库也会出现相同的问题,如 moment.js.


```javascript
moment('2017-8-8') // Invalid Date
```

所以最后的最后有些文章中指责 safari 浏览器特立独行不按照标准实现,倒是不应该的, 从规范角度来讲, safari 是完全按照 ECMA 标准实现的,而使用者却没有按照标准传输字符串, 这是使用者不按照 ECMA标准的问题.

但是从使用者角度来讲, chrome / firefox 这种优秀的容错体验确实要比 safari/IE 来的好用的多,在这些可以 flexible 的地方, chrome 考虑的更为周全和详细。


[^1]: Wikipedia, ISO 8601, [https://en.wikipedia.org/wiki/ISO_8601](https://en.wikipedia.org/wiki/ISO_8601)
[^2]: Ecma, ECMA-262, [http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf)
[^3]: MDN, [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)




