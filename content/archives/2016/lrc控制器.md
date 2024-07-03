---
title: lrc控制器试验
date: 2016-03-18 14:55:41 +0800
comments: true
tags:
  - javascript
permalink: /2016/03/18/2016/2016-03-18-lrc-cont/
updated: 2024-07-03T14:51:40+08:00
ccby: true
---

> 本例用于在lrc控制模块，在用于在timeupdate时间中同步更新lrc使用。

这里首先放置一个歌词解析模块，下面还需要做一个filter做歌词时间格式化模块
```js
/**
* 歌词解析模块
*
* 重复类歌词将repeat至array
* @author icepro
* @Time 2016-3-16 17:46:11
*/
function lrcParser(lrc){
	// 正则表达式用于已匹配[00:00:00][00:00][00:00.00]
	var reg = /(\[\d{2}[:]\d{2}([.|:]\d{2}){0,1}\])+(.*)[\n|\r|\r\n]/g;
	var res = lrc.toString().match(reg);
	// 用来push入歌词
	var stack = new Array();
	if(res.length>0){
		$.each(res,function(i1,item1){
			// 获取时间
			var timeStmp = item1.toString().match(/\[\d{2}[:]\d{2}([.|:]\d{2}){0,1}\]/g);
			// 获取歌词，将时间和换行符去除
			var song = item1.toString().replace(/\[\d{2}[:]\d{2}([.|:]\d{2}){0,1}\]/g,"").replace(/[\n|\r|\r\n]/g,"");
			$.each(timeStmp,function(i2,item2){
				stack.push({"song":song,"time":item2});
			});
		});
	}
	// 依照时间排序
	return stack.sort(function compare(a,b){return a.time.localeCompare(b.time);});
}
```
<!--more-->

下面放置一个歌词控制器模块。

```js
/**
* 歌词控制器
*
* 我认为在歌词控制中,不停循环遍历数组当然是可以的,不过这样显然太过浪费性能了
* 事实上我们只需要在重定位的时候遍历一遍数组获得新的index就好了，判断总比循环节省时间吧
* 以下方法麻烦了点,但是基于这个思路制作lrc控制器也是可以的
* 当然咯改成遍历肯定要灵活一些，个人习惯不同
* @author icepro
* @Time 2016-3-10 11:13:55
*/
function lrcControl(){
	var lrcs = new Array(),
		nowPlay = 0,
		offset = 0,
		speed = 0;
	/* 其中offset偏移时间和动画速率speed还未列入需求 */
	var ini = function(){
		var lrcs = new Array(),
		nowPlay = 0,
		offset = 0,
		speed = 0;
	}
	// 设置lrc,lrc格式必须为数组[{song:XXXX,time:[00:00.00]}]格式,判断也是
	// 如此，所以传入前必须先通过一个解释器统一格式
	var setLrc = function(lrc){
		lrcs = lrc;
	}
	// 获得所有的lrc,输出的lrc是经过排序的
	var getAllLrc = function(){
		return lrcs;
	}
	// 判断是否需要播放下一节
	var canPlayNext = function(nowtime){
		nowtime = "["+nowtime+"]";
		// console.log(nowtime+":"+lrcs[nowPlay].time);
		if(nowtime.localeCompare(lrcs.length>nowPlay&&lrcs[nowPlay].time)>=0){
			nowPlay += 1;
			console.log(lrcs[nowPlay-1].song);
		}else{
			return false;
		}
		
	}
	// 获得现在播放的index次序,在angular下不对数组后续操作重排的话直接可以使用$index即可替换class
	var getThisPlay = function(){
		return nowPlay;
	}
	// 重新计算lrc位置
	var reCalculate = function(nowtime){
		nowtime = "["+nowtime+"]";
		$.each(lrcs,function(i,item){
			if(nowtime.localeCompare(item.time)>=0) 
				return (nowPlay = (i-1<0?0:i-1));
		});
	}
	return {
		setLrc:setLrc,
		reCalculate:reCalculate,
		getThisPlay:getThisPlay,
		getAllLrc:getAllLrc,
		canPlayNext:canPlayNext,
	}
}
```