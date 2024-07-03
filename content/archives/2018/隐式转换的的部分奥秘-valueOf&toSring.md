---
title: 隐式转换的的部分奥秘-valueOf&toSring
date: 2018-09-18T14:33:15+08:00
tags:
  - javascript
comments: true
updated: 2024-07-03T14:54:12+08:00
permalink: /2018/09/18/2018/valueOf-and-toString/
ccby: true
---



## 前言

我的一个小伙伴给我提出了一个神奇的问题，这样一个函数执行算不算函数科里化：


```javascript
function mul(x) {
    var product= x;
    var tmp = function (y) {
        product = product * y;
        return tmp;
    };
    tmp.toString = function () {
        return product ;
    };
    return tmp;
}
console.log(mul(1)(2)(3)(4)(8));
```


诶嘿，我是不会告诉别人，我并没有一眼看出这就是，不过,这不打紧，至少解释一下这个函数怎么执行的还是不成问题的，但是最后到console.log输出字符串的时候，有了那么一点分歧，这里主要还没想到隐式转换的那些规则，故而我想当然的认为，这里首先输出的是valueOf,而非toString，然后对后面一个问题 ：

192 ==  mul(1)(2)(3)(4)(8)

给出了答案 false，但是显然小伙伴是不服气的，原因很简单，她执行的结果是true！



难以置信！为什么呢？（来自未来的icepro：你是不是傻，隐式转换规则都忘记了）

<!-- more -->



首先对于隐式转换可以翻看红宝书和犀牛书，但是显然手头并没有这两本厚重的书籍，对此我只能去看看那本定义超全的 ecma 262 文档了



## 让我们顺着ecma捋一遍



首先对于全等运算走的是 Abstract Equality Comparison，执行的是啥呢？这下面这段:

![image-20180920103955558](https://cdn.iceprosurface.com/upload/md/2018-09-20-023957.png)



不算太长哈，那么实际运转是怎么样的呢？实际上现在这种情况下直接执行的是 8 这个方法：



+ ToPrimitive(y) 这个方法



这篇文档给的跳转比较蠢只是简单的说明了一下大致是这样的：



![image-20180914190558547](https://cdn.iceprosurface.com/upload/md/2018-09-14-110601.png)



所以后面我选择直接使用了 ecma的官方文档：

![image-20180921153745974](https://cdn.iceprosurface.com/upload/md/2018-09-21-073748.png)

官方文档是这样写那么我们顺着走一下：

1. 通过
2. 先走 2-a `If PreferredType is not present, let hint be "default"`.
3. 走 2-f `If hint is "default", set hint to "number"`
4. 走 2-g  `Return ? OrdinaryToPrimitive(input, hint)`



然后我们看一下 OrdinaryToPrimitive 这一段是这样的：



![image-20180920101251221](https://cdn.iceprosurface.com/upload/md/2018-09-20-021258.png)



前面两个只是判断一下类型用于抛出错误，显然都是正确的，直接跳过即可

随后执行3，这里设定了执行顺序，先执行 valueof在执行tostring

随后第五步里面按顺序获取 method 如果method 可以执行则执行，如果结果不是 Object则返回值，由于我们传入的内容一个function，所以取出的 valueOf 也是一个 function，当然是不符合上述定义的,所以最后会通过 toString 转化为 string 随后回到如下步骤：

```javascript
y == ToPrimitive(y)
```



那显然是true咯（未来的icepro疯狂锤头： 你个zz）



那为什么 console 那边也会输出 string 呢？ 而不是一个function？要知道， console是可以准确识别对象的，由于任意一个 console 的 spec 或者文档都没有给出合适的解释，所以我们只能吹毛求疵的去找 传说中的源码了，来上 v8 源码：



首先v8中的 console 实现位于[这里](https://github.com/v8/v8/blob/master/src/inspector/v8-console.cc):

![image-20180920140740683](https://cdn.iceprosurface.com/upload/md/2018-09-20-060742.png)



调用的方法是这个



![image-20180921102355107](https://cdn.iceprosurface.com/upload/md/2018-09-21-022406.png)



当然作为一个 c++ 苦手。。大半代码都是看不懂的，好在这边语法也不算太难，我们可以往下翻，找到创建完成以后调用的函数 reportCall 



![image-20180921102510267](https://cdn.iceprosurface.com/upload/md/2018-09-21-022511.png)



这里不难理解，循环遍历了 args, 随后调用了一个重载了的方法：



![image-20180921102605766](https://cdn.iceprosurface.com/upload/md/2018-09-21-022607.png)



重点来了，大家看好了，这里创建了 v8 console message 这个类的实例，好在这个东西很好找，因为就在当前文件夹下面

![image-20180921102742033](https://cdn.iceprosurface.com/upload/md/2018-09-21-022742.png)



好了接下来看一下这个message在里面做了什么吧！



首先我们找到这个 static 方法：

![image-20180921103014037](https://cdn.iceprosurface.com/upload/md/2018-09-21-023016.png)



有点长，不过我们不需要细读这个方法，直接看返回值，返回值是message 所以我们向上找 message 声明的地方（381~382）：



```c++
  std::unique_ptr<V8ConsoleMessage> message(
      new V8ConsoleMessage(V8MessageOrigin::kConsole, timestamp, String16()));
```

这里创建了一个实例， 那么有意思的是，这个实例都有些什么属性呢？我们这里在向上翻在 190行处有了一个类的构造函数：



![image-20180921103347045](https://cdn.iceprosurface.com/upload/md/2018-09-21-023350.png)



其他的都不重要，这里我们姑且可以猜测 m_message 实际就是最后需要使用的东西，然后回到这段查看一下 401 行处就生成了这个所谓的 message：



![image-20180921103519037](https://cdn.iceprosurface.com/upload/md/2018-09-21-023520.png)



那么我们在向上翻，在 71 行处有了详细的定义：



![image-20180921103611261](https://cdn.iceprosurface.com/upload/md/2018-09-21-023613.png)



所以从 71- 73 行代码处可见最关键的是如下 append 方法：



![image-20180921103903940](https://cdn.iceprosurface.com/upload/md/2018-09-21-023907.png)



这里的代码更长了，（icepro：写浏览器的人都是神仙）

![image-20180921104847750](https://cdn.iceprosurface.com/upload/md/2018-09-21-024849.png)



上面的都不满足所以直接执行的是这里。



但是问题来着 ToString 这个方法不太好找，这个时候我们需要查一下data structure 来辅助我们阅读，[这里](https://v8docs.nodesource.com/node-0.8/dc/d0a/classv8_1_1_value.html)是v8的doc库，这里可以简单的查找每一个类的结构图什么的。



![image-20180921152214767](https://cdn.iceprosurface.com/upload/md/2018-09-21-072216.png)



从这里可以看到所有浏览器使用的对象都是从value这个大类继承下来的，我们再往下看



![image-20180921152409396](https://cdn.iceprosurface.com/upload/md/2018-09-21-072411.png)



这些都是应该实现的相关方法，ok这个时候就直接跳进去看一下是咋实现的了：



![image-20180921152902550](https://cdn.iceprosurface.com/upload/md/2018-09-21-072904.png)



读过ecma标准的同学一定会发出这个感叹： 诶这个方法是不是看的有点熟悉来着？

对在 ecma的定义中也存在完全相同的定义方式，毕竟浏览器是需要按照标准实现的：



![image-20180921153025149](https://cdn.iceprosurface.com/upload/md/2018-09-21-073027.png)

好了由于 Function 是一个Object 所以 ToPrimitive 又要来一遍了：



![9DFCC33BB30AB1EC55547B8BA1F23327](https://cdn.iceprosurface.com/upload/md/2018-09-14-110634.jpg)



所以按照顺序我们依旧 是 1->2-b->2-d->2-g,接下来跑 OrdinaryToPrimitive



接下来顺序就调整为：



![image-20180921153614116](https://cdn.iceprosurface.com/upload/md/2018-09-21-073616.png)



那么有意思的事情来了！



对这不就调用了 ToString 方法了么 = =



至于为什么会显示一个 f 开头，这个就得接着往下了，可能是在string-uils里面当然也可能在别的地方，反正首先篇幅，这里就不继续介绍了。



>  不得不说作为一个 c++ 的苦手，在对于源码阅读的地方显然是有不少错误的，如果这里出现了任何错漏的情况请指出！Thanks♪(･ω･)ﾉ

