---
title: 如何使用 gulp 来构建你的项目
date: 2016-06-23 15:01:02 +0800
comments: true
tags:
  - 前端
permalink: /2016/06/23/2016/2016-06-23-how-to-use-gulp/
updated: 2024-05-12T00:11:17+08:00
---

HI! icepro又和你见面啦！时隔半月，经过了考试的奋战，我又回来码字了，这里要讲述的是传奇的构建工具gulp，你可能要问，为什么不使用grunt呢？原因很简单，更自由化的gulp明显对我这个自由主义者更为友好。

## 1. 为何要使用gulp

使用一个工具必然是有理由的，首要的一点就是这个工具在学习的上的成本+加上长期维护成本是否低于长期使用之前的方法的长期使用成本，如果是低于的毫无疑问你需要他！

那么gulp在学习成本上怎么样呢？

说句实话，几乎为0，如果你是一个忠实的npm爱好者，或者你是一个对js有深入了解的程序员，那么gulp的学习成本接近于0，并且由于大量的轮子所以你甚至不需要手动再去创建一些独有的轮子。

由于gulp的设计非常简单，所以它的使用也不会复杂到哪里去，我们可以形象的认为gulp是一个管道，*通过gulp.src(）这个*函数向目录抽水，然后*通过.pipe(fn())在管道中处理内容*，然后*通过gulp.dest(）*输出内容到目录，同样的由于这种设计，使得其在pipe阶段的处理能力远远大于grunt能提供的（node对于buffer可以最大并发的处理，但是对于写入操作并没有这么高的能力），最后把我们每个东西集成一下合成为一个优秀的task，这样一个任务就编写完成了。

那么显而易见的在成本上使用gulp是可行的，那么是否有必要使用gulp呢？

我们先假设一个操作环境，假定有个项目，我需要复用html的header和footer，并且希望自动化的能对内部的css和js文件标记版本号，同时我也是一个sass（less）的使用者，我希望同步的编译文件，而不是每次手动去编译。

这个时候大量的重复劳动给了gulp机会，我们使用gulp可以简单而自动的完成这些操作。

## 2. 安装gulp

首先我们假定我们已经安装了npm（我想不论哪个前端都不会放弃这么优秀的社区！）

那么现在让我安装一下gulp吧~

```bash
$ npm install --global gulp
$ npm install --save-dev gulp
#运行你的gulp，默认执行gulp default
$ gulp
```

## 3. 使用gulp
```gulp
var gulp = require('gulp');

gulp.task('default', function() {
  // 将你的默认的任务代码放在这
});
```


好上面都是gulp的官方文档给出的方法，这里呢我更喜欢另外一种分文件的构建方法

```js
var requireDir = require('require-dir');
requireDir('./gulp/tasks', { recurse: true});
```

鸡蛋不要放一个篮子里，所以我更喜欢拆分一下，这个（如果出现module不存在的情况请根据提示安装对应依赖由于每个人的npm情况不一样，所以结合自己情况，进入npm的module目录手动安装目录）

随后创建一个你的gulp/task目录~接着创建一些文件

* html.js
* sass.js
* watch.js
* css.js
* default.js

然后在gulp目录下创建一个config.js的文件

这样基础的目录就完成了，当然你也可以不使用config的方式配置，也可以直接写在内部

```js
// gulp/config.js
var src = './src';
var dest = './dest';
var lib = './dest/lib';

module.exports = {
	output: dest + "/",
	//sass的设置
	//对于less，按照对应根目录scss文件编译
	//由于有@import无需考虑其他文件
	sass: {
		all: src + "/sass/**/*.scss",  //所有sass
		src: src + "/sass/*.scss",	 //需要编译的sass
		dest: dest + "/css",	   //输出目录
		settings: { style: 'expanded'},		//编译sass过程需要的配置，可以为空
		map: dest + "/map" //如果需要map则输出对应的map
	},

	//html的设置
	//不包含public文件夹，此文件夹是一个公共的复用组件文件夹
	html: {
		all: src + "/html/**/*.html",
		src: [src + "/html/**/*.html","!" + src + "/html/public"], //所有的html文件
		dest: dest + "/"
	},

	//css
	//对于css不分先后全部合并，确保css内容相互无冲突
	//在html中css优先级高于sass编译完成文件
	css: {
		src: src + '/css/*.css',
		all: src + '/css/*.css',
		dest: dest + '/css'
	},
	//js文件仅对module进行合并所以需要确保所有添加的js为独立模块
	js: {
		src: src + '/js/*.js',
		all: src + '/js/*.js',
		dest: dest + '/js'
	},

}
```

首先我们来看一下html的task,这个是最简单html操作，复用组件使用的gulp-file-include来引入，而hash使用gulp-rev-append来操作，具体的文件细节在下面给出例子

```js
var gulp = require('gulp');
var fileinclude = require('gulp-file-include');
var rev = require('gulp-rev-append');
var config = require('../config').html;

gulp.task('html', function(){
	gulp.src(config.src)
		.pipe(fileinclude())
		.pipe(gulp.dest(config.dest))
		.pipe(rev())
		.pipe(gulp.dest(config.dest));
});
```

下面看两个例子

```html
@@include('public/header.html')
	<title>登陆</title>
</head>
<body class="bg-darkTeal">
    <div class="padding20 block-shadow bg-white">
        <p><a href='login.html'><label>login</label></a></p>
		<p><a href='import.html'><label>import</label></a></p>
		<p><a href='check.html'><label>check</label></a></p>
        <p><a href='email.html'><label>email</label></a></p>
        <p><a href='index.html'><label>admin</label></a></p>
    </div>
    <div id="ss"></div>
@@include('public/script.html')
</body>
</html>
```


```html
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<!-- common css -->
    <link href="css/main.css?rev=@@hash" rel="stylesheet">
    <link href="css/all.css?rev=@@hash" rel="stylesheet">
    <link href="lib/metro/css/metro.min.css?rev=@@hash" rel="stylesheet">
    <link href="lib/metro/css/metro-icons.min.css?rev=@@hash" rel="stylesheet">
```

> 其中请注意以下内容标识符必须使用@@include()，而自动标版本的rev也同样必须使用?rev=@@hash的方式，而替换的时候为当前操作时候的目录位置，如果没有则不替换（这点需要注意）
> ps：同样的你可以通过修改源码的方式使得其命名方法符合你的需求


同样的sass等等的操作可以直接前往[github](https://github.com/iceprosurface/gulp-default)查看具体的内容，由于篇幅有限，就先讲到这里啦！有任何疑问可以上github发布issue来提问！

