---
title: 从零开始编写属于你的前端mvc框架[4]
comments: true
tags: javascript
date: 2017-05-14T21:01:25+08:00
updated: 2024-05-14T11:11:10+08:00
permalink: /2017/05/14/2017/2017-05-14-how-to-implement-a-simple-mvc-4/
---

## 1. 前言

在上一章 [[从零开始编写属于你的前端mvc框架3]] 中我们完善了我们简单的模板生成内容，下面我们可以尝试对模板使用更加合理的使用方式

## 2. 子组件的创建

对于子组件我们没有什么太过高效的方法去实现，不过这里我们倒是有不少参考方案，就拿vue来讲就是一个不错实现方案，那么我们需要对早期混乱的使用方法做出一定的修正。

首先整个生命周期中应该有且仅有出现一次，也就是说整个框架的主体至少得是单例结构的。

其次对于输入的模板和输出的函数需要一个工厂（类似工厂可能不完全是）模式类型的函数来处理，由于和vue相似，所以实质上在这里只是需要划定一下输出内容的结构即可。

<!-- more -->

### 2.1 子组件数据结构的划定

假设我们的子组件是一个结构清晰的组件单元或者元组，那么下面就方便我们逐次迭代。在此之前其实有个简单的模板了。

1. 对于每个组件，你需要实现一个template的字符串（对于非单文件结构的情况而言）
2. 对于每一个组件需要实现一个scope作用域，再内部可以实现一个medthos方法以及一个$data方法
3. 组件名字严格规定必须和调用时保持一致（现在暂时不实现那种替换为-小写字母的形式）

下面针对上述内容先动刀，目前我们虽然实现了一个简单的AST的HTMLpaser但是目前还是没能实现一个包含全部内容的编译器，所以现在只能先使用简单的model来实现了。

现在首先在文件夹下面创建一个hello.js文件，好了下面是吧这些模板内容移植过去，这部分没什么难的，主要分解为Template和Scope两种

大体结构是非常简单的，copy过来大致长这个样子

```javascript
export default {
    templete : `
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
    `,
    scope: {
        $data: {
            'item': {
                'title': 'you name',
                'count': 1,
                'url': 'www.baidu.com',
            },
            'contact': {
                'url': 'www.iceprosurface.com',
                'num': 2
            },
            'testArray': [0, 1, 2, 3, 4, 5]
        },
        methods: {
            testClick() {
                console.log('u clicked!')
                console.log('this now is ', this)
                this.item.title = 2222
            }
        }
    }
}
```

然后在main.js中引用（临时的手段）

```js
import hello from './test/hello.js'
```

好了这样一个 __基本__ 的结构就完成了，但是还有一个严重的问题，没有引入其他 *子组件* ,下面我们在创建一个子组件叫做world。

```js
export default {
	templete: `
		<p>this is world</p>
	`,
	scope: {
		$data: {
			content: 'this is world?'
		},
		methods: {
			clickEvent () {
				this.content = 'yes this is'
				this.fn()
				console.log(this)
			},
			fn () {
				console.log('fn called')
			}
		}
	}
}
```

然后魔改一下world的代码就可以拿出来用了，当然程序还是跑步起来的，因为还需要一些别的调整.


### 2.2 createComponent

首先，我们需要将一些内容加入其中，首先需要的制作一个 __创建组件__ 的方法，由于之前创建html组件使用的方法还算可以，暂时可以直接拿过来用，所以这里就直接调用了他.

代码是这样写的
```js
import { HTMLParser, HTMLCompnonentParser } from './../../../parser/HTMLparser'
import { buildScope } from './../../scope'
export function createComponent (component, parent) {
    var vmDom = HTMLCompnonentParser(buildScope(component.scope), HTMLParser(component.templete), parent)
    //设定对象为组件
    vmDom.isComponent = true
    return vmDom
}
```

接着在vm-dom中选择使用component的生成

```js
if (Object.keys(scope.components).indexOf(tag) !== -1) {
    // 当不等于-1的情况下，说明是一个子组件，调用createComponent创建dom
    return createComponent(scope.components[tag], parent)
}
```
顺便对addChildren方法在作出修正

```js
addChild(ele) {
    this.children.push(ele)
    if (!this.isComponent) {
        this.children.push(ele)
    }
}
```

此后我们可以在main中直接调用这个方法来生成组件，也就是这样使用：

```js
import { createComponent } from './core/compnoment/vdom/createComponent'
import hello from './test/hello.js'

var vir = createComponent(hello, null)
```

现在理论上程序已经跑起来了，下面对之前作出的一些内容在进行合理的优化

### 2.2 优化scope

现在的scope并没有把data和method中的内容映射到this中，所以在这里我们需要将scope中映射这些内容

```js
// import { update } from '../compnoment/update'
const invalidData = [ '$data', 'methods', 'components', '_list' ]
export function buildScope(scope) {
    if (!scope) {
        return {
            $data: {},
            methods: {},
            components: []
        }
    }
    var $data = new Observer()
    var methods = scope.methods ? scope.methods : {}
    var components = scope.components ? scope.components : []
    for (var i in scope.$data) {
        buildOb($data, $data, i, scope.$data[i])
    }
    // scope 对象
    var scopes = {
        $data,
        methods,
        components 
    }
    // 映射所有可见内容到scope 主要看这里！！！！！！
    for (var data in $data) {
        if (invalidData.indexOf(data) === -1) {
            Object.defineProperty(scopes, data, {
                enumerable: true,
                configurable: true,
                get: function () { return $data[data] },
                set: function (newVal) { $data[data] = newVal } 
            })
        }
    }
    for (var method in methods) {
        if (invalidData.indexOf(method) === -1) {
            Object.defineProperty(scopes, method, {
                enumerable: true,
                configurable: true,
                get: function () { return methods[method] },
                set: function (newVal) { methods[method] = newVal } 
            })
        }
    }
    return scopes
}
```

这样就完成了映射，当然其他地方的修改必不可少，这里一共有两处处，都在props.js，现在我们可以两者都享受直接从this中获取实际信息的便捷了

修改19行的 `var result = buildSyntax(scope, value)`
修改33行的 ` events.push({key: keyStr, value: methods[value].bind(scope)})`

## 3. 结语

好了做完了这些修改一个简单mvvm框架实际上已经完成了，但是我们并不会满足于这些功能的实现，实际上我们不难发现，项目中问题还是不少的，包括此前提出的虚拟dom到现在还没有解决，事实上，直接使用发布订阅者系统并不是一件好事，整个框架中拖累性能的地方也随处都是，但这些都不是重点！

正真的问题是没有测试，此后没有测试的情况下，项目的修改和变更将越来越难以判断，后一章我们将尝试添加一些测试用例来保证项目的平稳运行，此外，我们还将允许事件的绑定也使用匿名函数的方式进行操作

如果时间足够的话，下面还会将组件间的通讯补齐，或是添加一个合理的全局函数，如果时间非常充沛的话，顺便写一个loader用以处理代码也是一件不错的选择！好了，这一期的教程就此结束了，期待下一期的教程。






