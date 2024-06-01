---
title: "[angular.js]第三章 一个简单的购物车范例(2)"
date: 2016-03-01 20:33:53 +0800
update: 2016-03-01 20:33:53 +0800
comments: true
tags:
  - javascript
permalink: /2016/03/01/2016/2016-03-01-angular-3rd/
updated: 2024-06-01T13:17:37+08:00
---
> 千里之行，始于足下

angular.js 基础范例简单购物车
================================

前情提要
------------

  上一章，我们做到了基础的界面设计，在本章中，我们将会完成上一章所需的控制器方面的代码。
  
控制器代码
-----------------

## 从服务器获取数据

  这里的内容只是讲述基础的前端知识，所以本次介绍将暂时不需要对服务器进行任何操作。
  
  这里我们使用简单的赋值操作即可完成获取数据的操作，这两项变量分别命名为：
  
  - cart 
   + json 
   + 原始购物车内容，可以使用cookie类库向cookie索取
  - ShopList 
   + json 
   + 本页需要的商品列表，可以通过未来需要学习的 `$http` 获取或直接使用jquery的 `$.post/get` 获取
  <!-- more -->
## 基础设定

  首先，声明一个模块，这个模块是我们用来处理购物车的，我们称呼他为CartApp,这里和之前在模版中设定的完全一致，其余的变量也都与之前设定的完全一致。
  
```js
var CartModule = angular.module('CartApp', []);
CartModule.controller('ShopListController',
	function($scope,$filter){  
		// 绑定商品列表到物品列表
		$scope.items = ShopList;
		// 绑定购物车
		$scope.cart = cart;
		// 设定详细页面对应购买默认个数
		$scope.mount = 1;
		// 初始化详细列表
		$scope.detail = {};
		// 设定详细列表显示为否
		$scope.shopDetail=false;
	}
);
```
  这里和之前略有不同的是我们的控制器的参数列表中多了一个filter，这里是一个新的知识点是关于过滤器的知识，我们稍后在做解释。
  
  
## 各个方法实现

  我们先翻一下笔记，之前我们有记录的所有方法:
  
  - $scope.showDetail()
    + 无参数
    + 这个方法用来控制详情页面是否显示
  - $scope.bt()
    + 无参数
	+ 此方法用来控制购物车列表的高度，此高度将由购物列表的数目大小决定
  - $scope.addItemIntoCart()
    + 无参数
	+ 此方法用来向购物车添加商品，商品内容有详情列表决定，（或通过参数决定-下一章解决）

  好操作就这么多了我们来一一实现：
  
```js
$scope.showDetail = function(item) {
	$scope.shopDetail=true;
	// 克隆detail
	$scope.detail=JSON.parse(JSON.stringify( item ));
};
```
  
  > 这里值得注意，我们不希望在这里的对象实现双向绑定，姑且猜测所有的angular对象操作都是通过回调和原型继承的方法来获取数值和操作的，那么这里直接使用item会使得item的原型被继承，我们只是需要数据，而不希望双向绑定，so应该将其克隆一遍

```js
$scope.bt = function(){
	var bt_long=$filter('jsonlenght')($scope.cart["items"]);
	return {"height": 11.075*bt_long +"rem"};
}
```
  
  > 这里需要讲述一个新的概念，过滤器，在许多的后台框架中都使用了许多类似的方法，比如thinkphp的{xxx|html_trap}
  >
  > 这里也是一样的你完全可以用一样的方法使用过滤器，同时angular也允许你加入自己的过滤器语法如下：
  > > XXXModule.filter('filtername',function()\{ return function \});
  > 
  > 这没有什么难度，我们之间演示实例就能明白了
  >
  > Tips:值得注意的是假如你不是在页面中使用过滤器，那么请一定要将$filter加入控制器的参数中来使用
  
```js
CartModule.filter('jsonlenght',function(){
	var jsonlenghtFilter = function(input){
		var jsonLength = 0;
		for(var item in input){
			jsonLength++;
		}
		return jsonLength;
	}
	return jsonlenghtFilter;
});
```
 
  这里我们需要构建一个用来返回json数组长度的过滤器，input是指输入的内容，我们最后返回了jsonlenghtFilter
  
```js
$scope.addItemIntoCart = function() {
	var find=false;
	$.each($scope.cart['items'], function(i, cartitem){
		if(cartitem.id==$scope.detail.id){
			cartitem['mount']=cartitem.mount+$scope.mount;
			find=true;
		}
	});
	if(!find){
		$scope.cart['items'][$scope.detail.id]=JSON.parse(JSON.stringify( $scope.detail ));
		$scope.cart['items'][$scope.detail.id]['from']=$scope.detail['from']['id'];
	}
};
```

  这个是最后一个方法，由于之前忘记在视图页面中添加一键购买，so，我这里没有按照id添加的方法。
  
  就这样第三篇内容完成了，现在你可以把这个js加入html文件运行一下，你可以自由的添加购物车内容，显示详情，这一阶段的工作已经完成了

写在最后
--------------

下一篇 我将会继续后面第二个页面的学习，第一个页面的控制器编写已经结束了（触类旁通的学习，剩余的所有功能比如删除购物车内容等等都可以简单使用json数组的方法解决），千里之行始于足下，我希望一步步下去能脚踏实地的学会angular.js

在下一篇中，我将会使用到实际的服务器来进行数据的传输（其实这是不合理的创建一个服务器测试数据并没有什么意义，通常angular通过单元测试后才需要拿实打实的数据测试一下，这样更加节省时间），同时在下一篇中我将会学习简单的关于路由功能，服务和指令，敬请期待下一篇
[[angular 第四章 一个简单的购物车范例(3)]]
  
  
 