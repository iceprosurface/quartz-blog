---
title: 从零开始编写属于你的mvc框架[1]
date: 2017-04-16 17:36:06 +0800
comments: true
tags:
  - javascript
  - 框架
permalink: /2017/04/16/2017/2017-04-16-how-to-implement-a-simple-mvc/
updated: 2024-07-18T14:51:50+08:00
ccby: true
---


## 挂载dom和动态数据更新

### 1. 前言

来看这里的想必是看过 [前文](如何从零开始编写一个简单的mvc框架.md) 的，在 [前文](如何从零开始编写一个简单的mvc框架.md) ，我们事先了一个简单的 [虚拟dom](../../知识库/编程/前端/虚拟dom.md)，但是这一dom显然尚未实现挂载的功能，并且还没有实现一些基本的动态数据更新，不过这并不要紧在本文中，我将会带领大家实现一个基本的单项数据更新方法以及一个将dom直接渲染成dom的方法（还未实现 [虚拟dom](../../知识库/编程/前端/虚拟dom.md) diff算法）

<!-- more -->

### 2. 遍历dom以及生产dom

对于遍历dom的算法常见的也就是图论中经典的 [深度优先算法](../../知识库/编程/算法/深度优先算法.md) 和 [广度优先算法](../../知识库/编程/算法/广度优先算法.md)，在本文中的深度和广度算法基本依赖于 [广度优先算法,深度优先算法的javascript实现](https://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393)。

在原文中，[^1]提到了对多叉树的遍历基本实现如下

```js
Tree.prototype.traverseDF = function(callback) {
 
    // this is a recurse and immediately-invoking function 
    (function recurse(currentNode) {
        // step 2
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
            // step 3
            recurse(currentNode.children[i]);
        }
 
        // step 4
        callback(currentNode);
         
        // step 1
    })(this._root);
 
};

Tree.prototype.traverseBF = function(callback) {
    var queue = new Queue();
     
    queue.enqueue(this._root);
 
    currentTree = queue.dequeue();
 
    while(currentTree){
        for (var i = 0, length = currentTree.children.length; i < length; i++) {
            queue.enqueue(currentTree.children[i]);
        }
 
        callback(currentTree);
        currentTree = queue.dequeue();
    }
};
```

本着有轮子坚决不自己写的觉悟，我直接抄袭了这段，魔改了一下后完成了对dom的实现

```js
class element {
  constructor(tag, props, parent, scope) {
    this.tag = tag
    this.props = props
    this.parent = parent
    this.scope = scope
    this.children = []
  }
  addChild(ele) {
    this.children.push(ele)
  }
  //深度优先算法
  //参考至 http://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393
  traverseDF(callback) {
    (function recurse(currentNode,parent) {
      if (currentNode.children) {
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
          recurse(currentNode.children[i],currentNode);
        }
      }
      callback(currentNode,parent);
    })(this,this.parent);
  }
  // build dom 方法，使用递归遍历的方法将下级所有dom节点，并组装返回为树
  buildDom(){
    if(this.tag == "text"){
      return document.createTextNode(this.props)
    }
    var ele = document.createElement(this.tag)
    this.props.forEach(function(prop) {
      ele.setAttribute(prop.key,prop.value)
    })
    for (var i = 0, length = this.children.length; i < length; i++) {
      ele.appendChild(this.children[i].buildDom())
    }
    return ele
  }
  //广度优先算法
  //参考至 http://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393
  traverseBF(callback) {
    //先访问本级节点->入栈
    //堆栈->取出最先放入节点->将该节点的孩子放入堆栈->执行操作
    var queue = [];
    queue.push(this);
    currentNode = queue.shift();
    while (currentNode) {
      if (currentNode.children) {
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
          queue.push(currentNode.children[i]);
        }
      }
      callback(currentNode);
      currentNode = queue.shift();
    }
  }
}
```

接着让我们看看渲染的结果吧
![渲染的dom结构](https://cdn.iceprosurface.com/upload/md/2022/05/22/gFPKST-HREfcK.jpg)

ok很不错基本满意，但是显然花括号和属性绑定并没有完整的实现，所以下面需要实现的是数据的单项绑定

### 3. 一个粗糙的单向数据流实现

### 3.1 数据到视图

首先我们不考虑性能，至于v-for这样的东西也暂时不去考虑单单考虑存在前缀:xxxx，@xxx以及在文本内容中 `{{}}` 这两个符号绑定的数据元素，基于此首先要对root元素绑定上scope在渲染dom的阶段取出scope中的数据，来实现对实际数据的封装。

这样我们就需要思考以下两点了：

1. 怎样判断模板中的 `{{}}` 实现？
2. 怎么判断props是绑定属性以及@绑定事件？

首先我并没有绝大部分框架制作者深厚的js功底，对于语法分析能力也不是太强，基于此，我直接更加简单的实现一个渲染策略

1. 对于模板字符串，那我就简单的认为不允许表达式的使用（如果要使用其实可以使用eval来实现，但这实在太危险了，我并不认为自己能良好的驾驭），这样只需要对某个对象的某个属性或者元素来使用，这样就显得简单的多了。
2. props的判断则简单的多，因为显然，只需要判断key的开头是不是规定的元素即可。

让我们一步步实现他吧！

首先假定我们的scope结构是这样的
```js
var scope = {
    $data: {
        'item':{
            'title': 'you name',
            'count': 1,
            'url': 'www.baidu.com',
        },
        'contact': {
            'url': 'www.iceprosurface.com',
            "num": 2
        }
    },
    methods: {
        testClick(){
            console.log("u clicked!")
            console.log("this now is ",this)
        }
    }
}
```

我们假定我们的模板字符串长这样

```javascript
<div class="contacts-wrap flex">
    <a :href='contact.url' class="flex">
      <div class="contacts-number"></div>
      <div class="detailed">{{contact.title}}</div>
      <div class="()=>{return function(){cc}}">{{contact.num}}</div>
    </a>
  <div class="panel-title">实时动态</div>
  <div class="statistics-wrap flex">
    <div class="statistics-detailed">{{item.title}}</div>
    <div class="statistics-number" @click="testClick">{{item.count}}</div>
    <a :href="item.url">立即查看</a>
  </div>
</div>
```



### 3.1.1 模板字符串的渲染

> 显然的我们需要取出对象里面的方法，具体我不知道有什么更好的方法，这里我就暂且先用这个替代吧！

```js
// 用于递归取出合适的object对象
function canGetO(o,arr){
    if(arr.length > 0){
        var n = arr.shift()
        if(o[n])
            // 数组存在继续遍历
            return canGetO(o[n],arr)
        else
            // 数组存在,但是没有内容,0,false,或者其他为非情况
            return false
    }else{
        return o
    }
}
function buildSyntac(obj,str){
  var o = str.split(/[\.\[\]]\.?/)
  var content = canGetO(obj,o)
  if(content !== false){
      // 说明字段存在,返回字段
      return content
  }else{
      return false
      console.warn("[parser error]:can`t get obj,while finding '",str,"'")
  }
}
```

接着小小魔改一下text阶段的内容即可，这样内容就生效了

```javascript
if(this.tag == "text"){
      // text 元素
      var temReg = /{{.*?}}/g
      var temStr = this.props
      var temMatchResult = temStr.match(temReg)
      if(temMatchResult) 
        temMatchResult.forEach((val)=>{
          // 首先要对遍历出的目标作出修正，首先是取出括号，随后去掉前后空格
          var value = buildSyntac($data,val.substring(2,val.length-2).trim())
          temStr = temStr.replace(val,value)
        })
      return document.createTextNode(temStr)
    }
```

### 3.1.2 属性和事件监听的渲染

```js
this.props.forEach((prop)=>{
      var key = prop.key
      // 去掉头就是第一位啦！！
      var keyStr = key.substring(1,key.length)
      var value = prop.value
      // 属性绑定
      if(key.startsWith(':')){
        var result = buildSyntac($data,value)
        if(!result){
          console.error("[method error] can`t find ",keyStr)
          return
        }
        ele.setAttribute(keyStr,result)  
      } else if(key.startsWith('@')){
        // 方法绑定      
        if(!methods.hasOwnProperty(value)){
          console.error("[method error] can`t find ",value)
          return
        }
        ele.addEventListener(keyStr,methods[value].bind($data))
      }else{
        ele.setAttribute(key,value)
      }
    })
```

让我们看看效果如何


### 3.1.3 结果！

dom 结构

![dom结构][https://cdn.iceprosurface.com//upload/md/2022/05/22/MwCPEk-WbraTZ.jpg]

试试点击！

![scoped](https://cdn.iceprosurface.com//upload/md/2022/05/22/AwqiBy-FOR6OX.jpg)

看看效果还不错！

但这并不完整，我们只是单单制作了从数据渲染到dom的方法，却没有制作动态的更新策略，下面我们需要作出 dom -> data -> view


### 3.2 视图 到 数据 到 视图

当然咯这里我们可以使用最简单的一个实现，那就是使用data的get方法和set方法来操作最简单的那就是直接使用手动设置比如这样

```js
/**
 * 按照scope生成监控对象
 * @param {Object} scope 
 */
function buildScope (scope){
  var $data = {}
  for(var i in scope.$data){
       buildOb($data,i,scope.$data[i])
  }
  return {
    $data,
    methods:scope.methods
  }
}
/**
 * 递归生成监控组
 * @param {Object} data 需要绑定的对象
 * @param {String} key 键
 * @param {*} value 值，但不能是数组 
 */
function buildOb(data,key,value){
  // 暂不考虑数组方法
  if(value && typeof value != 'string' && typeof value != 'boolean' && typeof value != 'number'){
    var buildTmpValue = {}
    for(var i in value){
      buildOb(buildTmpValue,i,value[i])
    }
    value = buildTmpValue
  }
    Object.defineProperty(data,key,{
    enumerable: true,
    configurable: true,
        get: function (){return value},
        set: function (newVal){ value = newVal;update()}
    })
}

var vir = HTMLCompnonentParser(buildScope(scope), HTMLParser(templete), null)
console.log(buildScope(scope))

function update(){
  document.getElementById("app").innerHTML = ""
  document.getElementById("app").appendChild(vir.buildDom())
}
update()
```

![点击前](https://cdn.iceprosurface.com//upload/md/2022/05/22/AWxvES-fvGVUY.jpg)__

![点击后](https://cdn.iceprosurface.com//upload/md/2022/05/22/XlMSaD-s3JQzx.jpg)

是的这样就实现了一个最简单也是最容易实现的监控方法了，但是这样也带来不少问题

## 4. 问题

### 4.1 冗长的函数

不难发现随着编写的时间延长，我们的代码行数越来越长，越来越难以控制，方法没有形成模块，查找方法越来越困难

### 4.2 没有形成组件

这里我们还是在手工绑定对象，手工执行内容，这不合理，我们需要一个工厂自动化处理这些，对了我们需要组件化我们的内容，我们需要组件组件间的交互

### 4.3 性能低下

不难发现上述更新的过程实际效率非常低，因为显然的假设我们更新了一部分数据，整个页面都会更新，那么假设一次我更新了7-8个数据，那岂不是要整个页面刷新个7-8遍不成？

要知道前端性能的瓶颈主要在dom操作，整个页面的重绘和回流等等都会极大的影响页面速度，而在这之间刷新了7-8遍这是无法接受的，不过好在从开头我们就使用了[虚拟dom](../../知识库/编程/前端/虚拟dom.md) 那么，接下来需要做的事情就是最小化更新dom以及更加懒惰的更新策略。


## 5. 结语

下面一章我会尝试将整个js文件拆分解体，使用一些打包合并工具，此外还会尝试对dom的更新作出修改,接下来还会实现一个组件生产器。



[^1]: Cho S. Kim.Data Structures With javascript: Tree .https://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393,2015-9-24.
