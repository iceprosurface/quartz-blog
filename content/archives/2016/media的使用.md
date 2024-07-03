---
title: media的使用
date: 2016-03-15 22:34:40 +0800
updated: 2024-07-03T14:51:37+08:00
comments: true
tags:
  - javascript
permalink: /2016/03/15/2016/2016-03-15-media-control/
ccby: true
---

> 这是一个关于media的播放器模块化控制，用于个人iceplayer播放器

<!-- more -->

花了一定的时间解决了之前碰到的关于播放器的问题，目前在开发一个html5播放器。

播放器将基于bootstrap metro UI css 和angularjs，此模块是在angular控制器中用于控制音乐播放的模块。

开头的方法列表并没完全写入所有的方法，在下面可以自己增加或删除，在这里面的lrc仅限读取和设置，lrc的实时播放将会被列入一个单独的模块。

```js
/**
* media控制器
* @author icepro
* @Time 2016-3-10 11:13:55
* @return setMedia              设置media元素
* @return playList              播放列表
* @return className             类名
* @return play                  播放
* @return pause                 暂停
* @return setSrc                设置文件路径
* @return getSrc                获得文件路径
* @return newMusic              依照url开始新音乐
* @return setMedia              设置media元素
* @return getMedia              获取media元素
* @return playNext              播放下一首
* @return setCurrentTime        设置当前播放时间
* @return getCurrentTime        获得当前播放时间
* @return getDuration           获得歌曲完整长度
* @return setLrc                设置当前歌词的lrc
*/
function mediaContol(){
	
	// 生成一个audio
	var media = new Audio();
	
	var indexOfList = 0,
		played = false,
		playing = false,
		playList = new Array(),
		className = "mediaControl",
		theNext = false,
		bt_play = true,
		duration=0,
		currentTime=0,
		lrc="";

	// 特殊情况下需要返回自己
	var getMediaContol = function(){
		return this;
	}
	
	// 获取media元素
	var getMedia = function (){
		return media;
	}
	
	// 播放
	var play = function(){
		if(this.playList.length==0){
			console.log("no music loaded");
			return false;
		}
		if((!media.paused)|(!played)|theNext){
			setSrc(this.playList[indexOfList]);
			theNext = !theNext;
		}
		// 设置当前播放状态
		playing = true;
		// 设置是否已经加载过src
		played = true;
		// 设置按钮为pause
		bt_play = false;
		media.play();
	}
	
	// 暂停
	var pause = function(){
		bt_play = true;
		media.pause();
	}
	
	// 获得当前播放按钮是否为play
	var getBt_play = function(){
		return bt_play;
	}
	
	// 获得是否为播放状态
	var isPlaying = function(){
		return playing;
	}
	
	// 设置歌曲完整长度
	var setDuration = function(){
		duration = media.duration == NaN ? 0 :media.duration;

	}
	
	// 获得歌曲完整长度
	var getDuration = function(){
		return duration;
	}
	
	// 获取当前时间
	var getCurrentTime = function(){
		return parseInt(media.currentTime);
	}
	
	// 设置当前时间
	var setCurrentTime = function(time){
		media.currentTime = time;
	}
	
	// 以百分比获取当前时间
	var getCurrentTimeByPercent = function(){
		return (Math.round(media.currentTime / media.duration * 10000) / 100.00 + "%");
	}
	
	// 停止
	var stop = function(){
		// 设置当前播放状态
		playing = false	;	
		media.stop();
	}
	
	// 设置播放
	var setSrc = function(url){
		media.src=url; 
	}
	
	// 获得播放
	var getSrc = function(){
		return media.src; 
	}
	
	// 开始新曲目
	var newMusic = function(index){
		indexOfList= index > this.playList.length-1 ? 0 : index;
		theNext = true;
		this.play();
	}
	
	// 下一首
	 var playNext =function(){
		if(this.playList.length!=0){
			indexOfList = (indexOfList == this.playList.length-1)?0:indexOfList + 1;
			theNext = true;
			this.play();
		}else{
			console.log("no music loaded");
		}
	}
	
	// 设置当前歌词的lrc
	var setLrc = function(lrcs){
		lrc = lrcs;
	}
	
	return {
		isPlaying:isPlaying,
		indexOfList:indexOfList,
		stop:stop,
		getBt_play:getBt_play,
		playList:playList,
		className:className,
		play:play,
		pause:pause,
		setSrc:setSrc,
		getSrc:getSrc,
		newMusic:newMusic,
		getMedia:getMedia,
		playNext:playNext,
		setCurrentTime:setCurrentTime,
		getCurrentTime:getCurrentTime,
		setDuration:setDuration,
		getDuration:getDuration,
		getCurrentTimeByPercent:getCurrentTimeByPercent,
		setLrc:setLrc,
	}
	
}
```
