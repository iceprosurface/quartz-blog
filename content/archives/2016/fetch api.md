---
title: fetch api
date: 2016-10-12 10:06:08 +0800
comments: true
tags:
  - javascript
permalink: /2016/10/12/2016/2016-10-12-fetch-api/
updated: 2024-07-03T14:52:02+08:00
ccby: true
---

### 1. 前情提要

> 这是一个实验性质的api如果使用，需要注意浏览器兼容性，ff34+(实际测试时发现在39开始才能使用)，chrome42+，safari10+。

> 本文内代码仅仅保证在chrome53-64bit环境下正常运行，本文内代码经过测试并可以正常运行，但不保证在其他环境中因不可控因素导致的错误情况发生。

写这篇文章，主要是为了记录一下fetch api的学习情况，这个名字取得让人不太舒服(fetch data && 'fetch' data)，在看英语文档的时候一度被误解，此外我一开始以为这是一个独立的第三方api，但是没有想到的是这是一个浏览器原声支持的api。

<!-- more -->
### 2. fetch api出现的缘由

大抵在学习的初期，所有的js课程都会不厌其烦的教授关于xhr的内容，大抵操作XMLHttpRequest 总是让人不太愉快的是吧！是的复杂的ajax操作令初学者望而却步，说实话我也背不出那一串串冗长的代码段，为了解决这个问题，就有了fetch。

相较之XMLHttpRequest，fetch在对数据的处理和操作上显得更为友好，在使用上和jquery的ajax方法略有相同。

### 3. fetch 的interface

fetch在使用上依赖以下接口：

1. Headers
2. Request
3. Response

通常而言，headers不需要额外设置直接使用new Headers()即可，当然和jquery一样我们可以对header作出以下复杂的设定

#### 3.1 Header 
##### 3.1.0 Headers()
如何声明一个headers
```js
var myHeaders = new Headers();
```

##### 3.1.1 Headers.append()

使用append为headers添加header

```js
myHeaders.append(name,value);
```

append提供一个方法来对headers中不存在的header作出设定，如果已经存在则不会作出任何改变，而是会额外增加一个位置来储存。
此外，如果设置一些不被允许的header将会抛出一个类型错误（typeError）。

```js
myHeaders.append('Content-Type', 'image/jpeg');
myHeaders.get('Content-Type')
//"image/jpeg"
myHeaders.append('Content-Type', 'text/html');
myHeaders.get('Content-Type')
//"image/jpeg"
myHeaders.getAll('Content-Type');
//["image/jpeg","text/html"]
```

如果需要改变一个以及存在的值可以使用Headers.set()方式和append完全一样

```js
myHeaders.set(name,value);
```

##### 3.1.2 Headers.get();

使用get方法获取headers的某个header

```js
myHeaders.get(name);
```

值得注意的是在翻看api的时候发现指出了如果使用了非HTTP header的name将会抛出一个typeerror的错误，但是在实际测试中却没有找到发生的情况，这里的声明可能只是针对设置时而言的。

当然除了get以外如果需要获取全部的header，那么可以使用Headers.getAll()方法（这在前文已经出现过了不多赘述）

#### 3.2 Request && response

##### 3.2.1 创建一个Request

```js
var myRequest = new Request(input, init);
```

在input中允许两种形式的输入

1. 另外一个request，这将是的本个request成为另外一个request的复制品
2. 一个你希望拉取的数据或者资源的直接地址

在使用第二种方法时，可能需要添加init，默认的其设置为GET方法，没有携带任何header信息。

- method      : GET/POST/DELETE/PUT
- headers     : 就是头部信息，可以不填，需要使用Headers创建的对象或者字节序列字符串(不推荐，操作不便)
- body        : 可以后面列出的数据类型中的任意一种Blob, BufferSource, FormData, URLSearchParams, USVString 

其他的方法并未全部列出以上方法对于常见的ajax请求已经基本满足需求了，其余的内容可以参见mdn,对于request而言其他的多数属性都是read only的，可以自己查阅[mdn](https://developer.mozilla.org/en-US/docs/Web/API/Request)



##### 3.2.2 读取一个response

在使用response前必须先提出一句重要的内容``Response实现了一个基于Body的函数，而Body仅仅只能被调用一次，所以在第二次调用时你将会获得一个完全空白的string或者arrayBuffer``

- type			: GET/POST/DELETE/PUT
- url			: 地址
- useFinalURL	: 是否是最终地址，返回一个boolean
- status		: 状态码
- ok			: 是否成功的（200-299以内代表true）
- statusText	: status （比如ok什么的）
- headers		: 头部信息

这些是常用的功能,此外还有一些方法用来处理回执信息，具体的信息可以参见

- clone()       : 创建一个克隆（通过这个方法可以让你多次访问'同'一个回执信息）
- error()       : 这将会创建一个全新的response对象来处理error问题(网络错误)
- redirect()    : 使用一个url来，创建一个全新的Response对象来(但是我没有找到任何关于这个方法的使用例子，并且在chrome实验是url并没有被正确的获取到)
- arrayBuffer() : 返回一个promise
- blob()        : 返回一个promise
- formData()    : 返回一个promise
- json()        : 返回一个promise
- text()        : 返回一个promise

受限于篇幅这里建议还是前往[mdn](https://developer.mozilla.org/en-US/docs/Web/API/Response)前往查看
#### 4 fetch

现在终于可以正式开始讲述一下fetch了，有了上面那些我们就可以使用fetch做一些ajax操作了，同promise类似，fetch支持promise的链式操作，这里我照抄一段***MDN***上给出的例子

```js
var myHeaders = new Headers();

var myInit = { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default' };

fetch('flowers.jpg',myInit)
	.then(function(response) {
	  return response.blob();
	})
	.then(function(myBlob) {
	  var objectURL = URL.createObjectURL(myBlob);
	  myImage.src = objectURL;
	});
```

这就是最简单的fetch例子，当然咯，我们一样也可以使用catch去捕获一些错误。

```js
fetch('flowers.jpg',myInit)
	.then(function(response){
	  // do something for res
	})
	.catch(function(error) {
	  console.log('There has been a problem with your fetch operation: ' + error.message);
	});
```

下面给出一个简单的例子来实现带参数的执行方法：

```js
// 给予一个json 的数据形式
fetch('https://davidwalsh.name/submit-json', {
    method: 'post',
    body: JSON.stringify({
        username: document.getElementById('username').value
        password: document.getElementById('password').value
    })
});
// 或者直接给予一个表单形式
fetch('https://davidwalsh.name/submit', {
    method: 'post',
    body: new FormData(document.getElementById('simple-form'))
});
```

#### 4. 除此之外就是Guard

我也不是太懂这个东西到底起了什么作用，如果有明白的可以发送邮件给我或者底下留言，我会尽快回复。

#### 5. 那么写在最后

就这样，没有别的东西了！如果说还需要了解的话，就是去好好看看promise的api！


