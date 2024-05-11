---
layout: post
title: "[angular.js]第二章 一个简单的购物车范例(1)"
date: 2016-02-27 14:39:34 +0800
updated: 2024-05-09T11:27:27+08:00
comments: true
tags:
  - 前端
permalink: /2016/02/27/2016/2016-02-27-angular-2nd/
---
> 千里之行，始于足下

angular.js 基础范例简单购物车
================================

设计思路
----------

首先我们需要从mvc上对本次购物车实例进行分析

* 模型
* 视图（也可以叫模板）
* 控制器

## 模型

首先值得分析的是模型：

每一个购物车都需要以下属性

* id（这个唯一的属性将会被持久化到服务器，并作为购物的唯一标识）
* 物品
  + 物品ID （这个唯一的属性将会被用来标示物品）
  + 物品名称
  + 物品数量
  + 物品价格
  + 物品的优惠和折扣
    - 优惠
	- 折扣
  + 物品的来源(记录来源的ID)
* 提交日期
* 总价格
  + 物品原价
  + 折扣后价格

<!--more-->

我们还需要商品的列表大抵应该是这样的，和上面的商品没啥差别就是少了一个数量而已

* 商品
  + 物品ID （这个唯一的属性将会被用来标示物品）
  + 物品名称
  + 物品价格
  + 物品的优惠和折扣
    - 优惠
	- 折扣
  + 物品的来源
    - 商店的名称
	- 商店的id（就是上面的来源id）

就这么多啦，服务端的操作我们不需要考虑，so为了不从服务器获取数据这里我们手动构建一下数据列表(这个是在购买前有的列表)

```json
{
	'id': 'shop_123456789',
	'items': 
	{
		'ks-11782': {
			'id':'ks-11782',
			'name': '甜味饼干',
			'mount': 13,
			'price': 23.5,
			'discount': 0.93,
			'preferentialPrice': 1,
			'from':'xd-123441'
		},
		'ks-213331': {
			'id':'ks-213331',
			'name': '巧克力威化饼干',
			'mount': 7,
			'price': 17.1,
			'discount': 0.93,
			'preferentialPrice': 1,
			'from':'xd-12345523'
		}
	}
}
```

是的你没有看错，我们伟大的网点当当一号店可以同时购买传说中的京东和淘宝的东东,我们大概意思一下给个三个就好了，至于图片详情什么的，就不加入了，简单的变量替换而已

```json
{
	'ks-11782': {
		'id':'ks-11782',
		'name': '甜味饼干',
		'price': 23.5,
		'discount': 93,
		'mount': 1,
		'preferentialPrice': 1,
		'from': {
			'id': 'xd-123441',
			'name': '京东官方旗舰店'
		}
	},
	'ks-213331': {
		'id':'ks-213331',
		'name': '巧克力威化饼干',
		'price':23.5,
		'discount':93,
		'mount': 1,
		'preferentialPrice': 0.23,
		'from': {
			'id': 'xd-12345523',
			'name': '淘宝官方旗舰店'
		}
	},
	'ks-123123': {
		'id':'ks-123123',
		'name': '巧克力',
		'price': 33.5,
		'discount': 97,
		'mount': 1,
		'preferentialPrice': '0.77',
		'from': {
			'id': 'xd-12345523',
			'name': '淘宝官方旗舰店'
		}
	}
}
```

## 业务逻辑设计（控制器设计）

  好的我们现在还不需要设计什么代码功能，现在需要搞清楚我们需要干什么
  
  现在先看看我们的客户会做些什么？


1. 打开网站
1. 选择商品
 2. 点击商品
 2. 选择数量（或者不选择）
 2. 加入购物车
1. 结算
 3. 补加商品数量（可选）
 3. 自动补全总价
 3. 结算

  
		
  好了好了！我们不需要更多了吗，业务就需要这么多了，那么现在可以开始构建我们的页面了
  
## 视图（模板）设计

  现在要设计我们的主页了，我想这并不困难，首先确定一下我们需要哪些页面好了！
  
  需要的页面如下：
  
  - 商品总览页面
  - 商品细则页面
  - 购物车页面
  - 结算页面

  不过这显然太多了，上面三个页面完全可以放在一个页面上
  
  - 浏览页面
    + 商品总览列表
	+ 商品详细边栏
	+ 购物车边栏
  - 结算页面
  
  ok！大功告成，我们的设计完成了，下面该写代码！

视图代码编写
------------

	现在第一点我们需要先创建两个页面：
	
	- first.page(-不应该是index！-不不不个人爱好)
	- closingCost

	讲道理自己设计css可不是我擅长的事情，css方面嘛，大可忽略，直接上bootstrap就好，我这里就只是练习一下，写的难看一点别介意。
	
## 外层div和基本框架

  我们希望整个页面都被我们的cartapp托管，所以直接在html标签处加上
  
  > ng-app="CartApp"
  
  我们希望在页面的正文处开始使用*shoplist*的控制器来托管我们的属性，所以我在被标记为
  
  > class="body"
  
  的地方加上控制器
  
  > ng-controller="ShopListController"
  
  好，我们在引入各个js类库和angular框架，顺便带上我们后面会使用的controller控制器
  
  完整代码如下：

```html
<html ng-app="CartApp">
	<head>
		<meta name=”viewport” content=”width=device-width, initial-scale=1″ />
		<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
		<script src="./angular.min.js"></script>
		<script src="./controllers.js"></script>
		<script src="./jquery-2.1.4.js"></script>
	</head>
	<body>
	<div class="body" ng-controller="ShopListController">
		
	</div>
</body>
</html>
```

> 现在我们需要在正文处加上我们的布局了，我希望在这里用大约45%的空间实现列表，和55%的空间显示详细情况，具体的css先不考虑，但是这里必然有浮动。
> 首先我打算将页面分为两块一块显示列表，一块显示详细情况，顺便加上class方便以后加样式，然后这两块地方是想加浮动的，为了防止忘记添加消除浮动，先带上消除浮动的div。

  完整代码如下：
  
```html
<!-- 用来显示商品列表的页面 -->
<div  class="shop-list" >
</div>
<!-- 用来显示商品详细的页面 -->
<div style="background-color:#FFFF00" class="shop-detal" ng-show="shopDetail">
</div>
<div class="clearfix" style="clear: both"></div>
<!-- 用来显示购物车的页面 -->
<div style="background-color:#FF3300" class="cart">
</div>
```
## 商品列表

  这里是重复生成的页面，我们只需要设计其中一个的div然后让angular自动按照json数据列表生成即可。
  
  这里使用的是ng-repeat属性语法为
  
  > ng-repeat="value in array"
  >
  > 在被ng-repeat包裹的块级元素将会连同自身及孩子进行复制和重复，在被包裹元素内部可以使用
  > > value来操作读取,同步绑定你array内的数据，而 `{{$index}}` 可以用来获得此次循环的索引值
  >
  > Tips：值得注意的是，不提倡使用 `{{$index}}` 来确定元素，这种方式并不准确，因为 `$index` 并不进行双向数据绑定，如果你在后文对该数组进行重排列等操作后，将会使得 `$index` 无法取得准确的数值，在这种时候请使用具体的value.id等方式来传递参数。
  
```html
<!-- 用来显示商品列表的页面 -->
<div  class="shop-list" >
	<div style="background-color:#001188" class="list-single" ng-repeat="item in items" >
	</div>
</div>
```

  这里我把商品命名为items，这里先拿记事本记录下来，在controller中将会使用到
  
```html
<div class="title" id="{{item.id}}"> 来自：{{item.from.name}}</div>
<div class="shop-list-content">
	<table>
		<tr>
			<td>商品名称：</td><td><h3>{{item.name}}</h3></td><td>商品价格：</td><td>{{item.price}}</td>
		</tr>
		<tr>
			<td>商品限时折扣：</td><td>{{item.discount}}%</td><td>每3件优惠：</td><td>{{item.preferentialPrice}}元</td>
		</tr>
	</table>
	<br/>
</div>
```

  然后按照之前设计好的模型填入具体的内容，（即上面list.json）的内容

  随后我们需要一个按钮来响应我们的操作，由于我们需要绑定angular独有的click事件，所以这里引入ng-click，具体语法如下

> ng-click="dothings()"

  在click内仍然使用任何双向绑定的数据，这里只是为了演示，并没有加入“现在购买的”ng-click属性。

```html
<div class="bty"><button ng-click="showDetail(item)">查看详情</button><button>现在购买！</button></div>
```

  完整代码如下：

```html
<!-- 用来显示商品列表的页面 -->
<div  class="shop-list" >
	<div style="background-color:#001188" class="list-single" ng-repeat="item in items" >
		<div class="title" id="{{item.id}}"> 来自：{{item.from.name}}</div>
		<div class="shop-list-content">
			<table>
				<tr>
					<td>商品名称：</td><td><h3>{{item.name}}</h3></td><td>商品价格：</td><td>{{item.price}}</td>
				</tr>
				<tr>
					<td>商品限时折扣：</td><td>{{item.discount}}%</td><td>每3件优惠：</td><td>{{item.preferentialPrice}}元</td>
				</tr>
			</table>
			<br/>
			<div class="bty"><button  ng-click="showDetail(item)">查看详情</button><button>现在购买！</button></div>
		</div>
	</div>
</div>
```

## 商品详细

  在这个页面我不希望一开始就是被显示的，所以在这里我加入了一个ng-show，这是angular独有的用来显示或隐藏dom元素的函数
  语法如下：
  
> ng-show="boolean"
> ng-hide="boolean"
  
  在属性内部可以使用任何返回值为boolean的函数表达式，或者双向绑定的变量
  
  其他的并没有什么新的内容直接可以照着填写就好，例如商品的别的属性也不想从服务器获取，直接从list中获取就好了，这里的ng-show使用了shopDetail这个变量来判断
  
  完整代码如下：
  

```html  first.html
<!-- 用来显示商品详细的页面 -->
<div style="background-color:#FFFF00" class="shop-detal" ng-show="shopDetail">
	<div class="detail-content">
		<h2>{{detail.name}}</h2>
		<img alt="这个是商品的图片balabala"/>
		<br/>
		<p>原价为：{{detail.price}}</p>
		<h1>现价为：￥{{detail.price*detail.discount/100}}</h1>
		<h2>现满3件立减{{detail.preferentialPrice}}元</h2>
		<p>你需要订购的数量为：<input type="number" ng-model="mount" /></p>
		<button ng-click="addItemIntoCart()"><h1>加入购物车</h1></button>
	</div>
	
</div>
```

## 购物车边栏

  在购物车中我将会用来显示到底购买了那些功能，纯css是比较难调整div的大小的，这里就引入一个ng-style的属性来控制style，同样的还有ng-class
  语法如下：

  > ng-style="json\{attribute1:value,……\}"
  > ng-class="json\{class1:true,……\}"
  
  你需要返回为上述格式的json来供angular识别，这里我需要识别一下整个cart-detail浮出栏的大小，使用了bt()方法来返回值，这里需要记录一下以便之后使用。
  

```html first.html
<!-- 用来显示购物车的页面 -->
<div style="background-color:#FF3300" class="cart">
	<div class="cart-detail" ng-style="bt()">
		<div style="background-color:#001188" class="cart-single"  ng-repeat="item in cart.items" >
			<h2>{{item.name}}</h2>
			<h3>单价：{{item.price}},数量{{item.mount}}</h3>
		</div>
	</div>
	<h1>你的购物车</h1>
</div>
```

## css

  之前就说过css不是重点，大家看着就好，丑陋是不能避免的~
  
```css
html{
	font-size:62.5%; /* 10÷16=62.5% */
}
body{
	font-size:12px;
	font-size:1.2rem ; /* 12÷10=1.2 */
}
p{
	font-size:14px;
	font-size:1.4rem;
}
div{
	position:relative;
	width:100%;
	height:100%;
}
button {
	color: #003399;
	border: 1px #000000 solid;
	color: #006699;
	border-bottom: #93bee2 1px solid;
	border-left: #93bee2 1px solid;
	border-right: #93bee2 1px solid;
	border-top: #93bee2 1px solid;
	background-color: #FFFFFF;
	cursor: hand;
	font-style: normal;
}
table{
	
}
img{
	border:1px #000000 solid;
	width:20rem;
	width:20rem;
}
.body{
	width:95%;
	margin-left: auto;
	margin-right: auto;
}
.title{
	text-align:right;
	height:1rem;
	width:100%;
	padding-right:1.25rem;
}
.shop-detal{
	float:left;
	width:55%;
	
}
.detail-content{
	padding:1.25rem;
}
.shop-list{
	float:left;
	width:45%;
}
.bty{
	text-align:right;
}
.list-single{
	color:#FFFFFF;
	padding:1.25rem;
	margin-left: auto;
	margin-right: auto;
	margin-bottom:0.75rem;
	width:75%;
}
.clearfix:after { 
	visibility: hidden; 
	display: block; 
	font-size:12px;
	font-size:1.2rem ; /* 12÷10=1.2 */
	content: "."; 
	clear: both; 
	height: 0; 
}
.clearfix{
	z-index:-1;
	width:0px;
	height:0px;
	clear: both; 
}
.cart{
	right:0px;
	height:7.375rem;
	width:45rem;
	bottom:0px;
	position:fixed;
}
.cart:hover{
	right:0px;
	height:7.375rem;
	position:fixed;
	width:45rem;
	bottom:0px;
}

.cart-single{
	float:left;
	color:#FFFFFF;
	padding:1.25rem;
	margin-bottom:1rem;
	width:100%;
	height:7.375rem;
	border:#FFFFFF solid 1px;
}
.cart:hover .cart-detail{
	position:fixed;
	display:block;
	border:#FF3300 solid 1px;
	
	height:100%;
	bottom: 7.375rem;
}
.cart .cart-detail{
	position:fixed;
	display:none;
}
```

写在最后
----------

下一篇 我将会继续后面angular部分的代码，第一个页面的视图的设计已经结束了，当然这部分内容是不足以运行的，需要下一篇
[[angular.js]第三章 一个简单的购物车范例(2)](https://iceprosurface.com/2016/02/27/2016/2016-02-27-angular-2nd/2016/03/01/2016/2016-03-01-angular-3rd/)
