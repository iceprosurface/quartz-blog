---
title: "[angular.js]第四章 一个简单的购物车范例(3)"
date: 2016-04-16 18:47:31 +0800
update: 2016-04-17 19:43:31 +0800
comments: true
tags:
  - javascript
permalink: /2016/04/16/2016/2016-04-16-angular-4th/
updated: 2024-07-03T14:52:08+08:00
ccby: true
---

生产模拟仿真考试考完终于可以继续写博客了，这里我要把之前的坑填完，这里将会讲述关于angular的路由功能，服务和指令。

> ~~此次更新只是预留一个位置，内容将会在2天内放上blog~~
> 现在已经放上了

<!-- more -->

## 一.微调结构

在这一章我要做一个路由实例，so之前的页面需要作出一点微调，因为angular是使用ng-view来表示显示页面并区分固态页面和动态页面的，所以我们要把需要动态替换的页面提炼出来

```html  first.html 
	<div class="body" ng-controller="ShopListController">
	……
		<h1>你的购物车    <a href="#closingCost"><button>现在结算！</button></a></h1>
	……
	</div>
```

就是这一段此段单独列出来命名为first.html，新建一个目录tpl，然后把它放进去就ok了，同时将下面_现在结算_那里的跳转更改为#closingCost
剩下的页面重命名为index.html，当然喽在body中间你得加上angular的标签 `<ng-view>`

```html first.html 
<!doctype html>
<html ng-app="CartApp">
	……
	<script src="./angular-route.min.js"></script>
	……
	<body>
		<ng-view>
			
		</ng-view>
	</body>
  ……
</html>
```

这样angular就能依靠本身的路由功能了，这里还需要引入一个文件angular-route.min.js仔细寻找一下你从官网下载的angular包，里面应该都会带有这个东西

接下来只要我们小小的改动一下controllers就可以使得我们之前写的内容兼容下面的内容了~

## 二.增加路由
### (1).添加依赖
在增加路由钱你得先确定一下是否引入了angular-route.min.js，如果引入成功那么首先要在angular中添加依赖。


```javascript controllers.js
	var CartModule = angular.module('CartApp', []);
	// -->var CartModule = angular.module('CartApp', ['ngRoute']);
```

将第一行修改为箭头所指的那样（就是在依赖里面注册ngRoute模块）

### (2).添加路由
接下来就是添加路由了，路由的语法非常简单，根本不需要我详细解释，就小小的tip一下吧

> 路由功能使用$routeProvider的when方法在侦测到浏览器url变化后执行操作，默认使用的是#，不过不是很确定是否可以使用/作为符号标示，将来有待验证
> when方法有两个参数，第一个是路由的名称，第二个是相关设置json格式{controller:,templateUrl:}第一个controller是执行操作的控制器，第二个templateUrl指的是需要替换的URL，这里也可以换成直接用HTML内容*具体的详细情况需要查询官方的API手册*
> 另外一个是otherwise方法，他只有一个参数就是{redirectTo:}指的是默认跳转的位置。


```js  controllers.js
CartModule.config(function($routeProvider){
	$routeProvider.
		when("/",{
			controller:'ShopListController',
			templateUrl:'./tpl/first.html'
		}).
		when("/shopList",{
			controller:'ShopListController',
			templateUrl:'./tpl/first.html'
		}).
		when("/closingCost",{
			controller:'ClosingCostController',
			templateUrl:'./tpl/closingCost.html'
		}).otherwise({redirectTo:'/'});
		
});
```

这里是路由功能的全部功能了，你可以将其放在controllers.js的任意空白位置，但是不要放在 `var CartModule = angular.module('CartApp', ['ngRoute']);` 之前

然后创建 `/tpl/closingCost.html`

内容简单一点就是

```html closingCost.html
<p>this is closingCost page</p>
```

现在你可以跳转了，是不是没有问题？前进和后退也可以使用

> tips:值得注意的是，如果你没指定跳转的位置（#xxx），那么后退将不可使用

## 三.增加服务
### (1).改造变量
我们不难发现一个问题，那就是之前我们把所有的变量放在了全局变量里面，哦no这可不好，原因很简单，这是一个典型的全局变量污染，so最好的做法是放到一个单独的方法里面，angular已经为我们做出了榜样，那就是下面一个问题angular服务（鉴于服务的写法很多，so这里使用了我比较喜欢的方法，如果需要的话*尽量使用官方API文档查询*）

```js controllers.js
CartModule.factory('cartFactory', function() {
	var ShopList=
	{……};
	var cart=
	{……};
	return {
		cart:cart,
		ShopList:ShopList,
	}
}
```

服务的语法很简单，这是一个简单的工厂模式，和单例模式有点像，不过不完全一样这里就叙述了，使用的时候需要有以下别的注意事项

### (2).使用服务

在controller中使用的时候必须注意的是，你的在参数中带上之前声明的service，当然了最良好的方法就是同时加上依赖，这样防止在出现问题时无法找出问题

```javascript  controllers.js
CartModule.controller('ShopListController',
	function($scope,$filter,cartFactory){
		$scope.items = cartFactory.ShopList;
		$scope.cart = cartFactory.cart;
		……
```

使用的话简单的赋值就够了，这里绝大多数情况下都是双向绑定的，但如果你使用自定的函数可能无法完成双向绑定，这时你需要使用$scope.$apply(function(){})来告诉angular这里需要更新，但是请不要滥用这个函数，因为这会引起巨大的性能问题。

``` html
<p>this is closingCost page</p>
<div style="background-color:#FF3300">
	<div ng-repeat="item in cart.items" >
		<h2>{{item.name}}</h2>
		<h3>单价：{{item.price}},数量{{item.mount}}</h3>
	</div>
</div>
```

接下来你可以在结算页面尝试一下是否成功，当然喽，你不能刷新页面，因为我们没有使用cookie储存数据而所谓的跳转只是angular耍了一个漂亮的帽子戏法，只是局部更新了页面，但是你一旦刷新了页面这一切都将不复存在

## 三.计算结果
这一部份就不拿出来了，因为显然没有什么难度了，只需要简单的，从服务中取出变量，然后简单的做一次运算就可以了，其他的内容也只是简单实用前面的内容作出应对，值得提醒的是，我们要尽可能避免使用angular的时候以页面为核心构建网页，而是应该以数据为核心构建，任何的dom都不应该是angular完成的（当然喽angular是内置的jqlite，但是这不部分并不影响我的结论。）。
至此angular购物车实例已经全部完结了，之前说的指令在这一章没有很好的表现so我直接抽离了这不封内容，打算在下一个实例中放出，下一个实例将会把angular和electon结合打造一个桌面播放器iceplayer

敬请期待下一章~ 联动-electron和angular构建html5桌面播放器！