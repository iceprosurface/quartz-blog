---
title: select 联动
date: 2016-08-10 17:09:57 +0800
comments: true
tags:
  - 前端
permalink: /2016/08/10/2016/2016-08-10-formlinkage/
updated: 2024-05-17T02:00:38+08:00
---

## 1. 介绍

  相比一些格式化工厂，比如自动表单工厂等等，多级select联动使用的场合相比之前那些要用的更多一些也更简单一些。

  常见的多级联动比如，城市的选取等等，当然这次的demo只是抛砖引玉而已，只是实现了一个最简单的select的表单联动，基于可复用的无限级option联动，需求明确且独立所以不需要考虑太多。
<!-- more -->
## 2. 数据格式

我预想用中的格式应该是这样的

```javascrupt
var datas = {
	'上海市': {
		'上海市': {
			'浦东新区': {
				"xxx县城": null,
				"vvv县城": null,
				"yyy县城": null,
				"jjj县城": null
			},
			'金山区': {
				"ttt县城": null
			},
			'嘉定区': {
				"uuu县城": null,
				"ooo县城": null,
				"ppp县城": null,
				"lll县城": null
			}
		}
	},
	'北京市': {
		'北京市': {
			'东城区': {
				"aaa县城": null,
				"rrr县城": null,
				"bbb县城": null
			},
			'西城区': {
				"无": null,
			},
			'朝阳区': {
				"无": null,
			}
		}
	},
	'江苏省': {
		'盐城市': {
			'盐都区': {
				"无": null,
			},
			'亭湖区': {
				"无": null,
			}
		},
		'南京市': {
			'玄武区': {
				"无": null,
			},
			'江宁区': {
				"无": null,
			}
		}
	}
};

```

> 所以显然通过json不断的添加后续内容，select联动的长度可以无限延长，(当然由于只是打算做option的处理，所以完全没有考虑select本身的自动生成)

## 3. 结构与参数

  入口函数横简单，我们需要一个data，和一个用于绑定select的id数组，所以我这样设置了入口参数
  
```js
  (function() {
    function formLinkage(_data, list) {}
    window.formLinkage = formLinkage;
  })();
```


然后由于他是一个类似于链表的结构所以还需要一个node类来处理冒泡传递
```js
function listNode(_this, _data, _parent) {}
```

此外方法也需要定制一下，由于算法没设置好，所以只能在后面单独设置children，故而只能这样

```js
listNode.prototype.setChildren()
```

接着就是冒泡了，这个里是由父级向孩子冒泡

```js
listNode.prototype.callChildrenChange()
```

另外就是一个data方法，这里其实完全可以用对象的方法使得data变成一个属性，这个以后再说(估摸着没有以后了)

```js
listNode.prototype.data()
```

## 4. 完成内容的添加

```js
(function() {

        function listNode(_this, _data, _parent) {
            this.self = _this;
            this._data = _data;
            this.self.addEventListener('change', this.callChildrenChange.bind(this));
            this.parent = _parent;
            this.children = null;
        }
        //嚯嚯嚯有孩子/(ㄒoㄒ)/~~
        listNode.prototype.setChildren = function(_children) {
            this.children = _children;
        }
        listNode.prototype.callChildrenChange = function() {
            //当父元素改变的时候应该对子元素改变，但没有下级联动子菜单时，不做处理
            if (this.children) {
                var _dom = "<option value='-1' style='display:none' selected>请选择</option>";
                for (var i in this.children.data()) {
                    _dom += '<option>' + i + '</option>';
                }
                this.children.self.innerHTML = _dom;
            }
            //当如果存在子元素，则呼叫子元素处理
            if (this.children)
                this.children.callChildrenChange();
        }
        //TODO:改变为listNode.prototype.data的调用格式
        listNode.prototype.data = function() {
        		//如果是首个元素，则返回一个原始的数据（由于都是引用所以每个对象的data理论上是相同的）
                if (this.parent) {
                	//排除创建时可能为""的情况
                    if (this.self.value == "")
                        return null;
                    //排除当父级未选择的情况
                    if (this.parent.self.value != -1)
                        return this.parent.data()[this.parent.self.value];
                    else
                        return null;
                } else
                    return this._data;
            }
            //按先后顺序加载
        function formLinkage(_data, list) {
            this.domArr = [];
            this.data = _data;
            for (var i in list) {
                //创建新一级的节点
                //第一级节点返回null
                var last = this.domArr.length > 0 ? this.domArr[this.domArr.length - 1] : null;
                var singleNode = new listNode(document.getElementById(list[i]), this.data, last);
                if (this.domArr.length > 0)
                    this.domArr[this.domArr.length - 1].setChildren(singleNode);
                this.domArr.push(singleNode);
            }
            //对第一级节点单独设置
            var firstElement = this.domArr[0];
            firstElement.callChildrenChange();
            var _dom = "<option value='-1' style='display:none' selected>请选择</option>";
            for (var i in this.data) {
                _dom += '<option>' + i + '</option>';
            }
            firstElement.self.innerHTML = _dom;
        }
        //TODO:setData方法
        window.formLinkage = formLinkage;
    })();
```


## 5. 如何调用
```
new formLinkage(datas, ['province', 'city', 'county']);
```



## 6 完整demo

需要查看完整的demo的话 --->[点击这里](http://cdn.iceprosurface.com/demo/linkagedemo.html "demo")
