---
title: 实现tinkphp和nginx的动静分离（不使用pathinfo）
date: 2016-06-13 13:14:16 +0800
comments: true
tags:
  - 后端
  - php
permalink: /2016/06/13/2016/2016-06-13-use-tp-on-niginx/
updated: 2024-07-03T14:52:23+08:00
ccby: true
---

## 前言 

这次的起因还是那个创新项目，说到底整个项目还是以我的代码为主（99.99%），所以实际上我想怎么写就怎么写呗，这次考虑彻底的分离动态和静态页面，采用api的方式查询数据，所以显而易见的需要处理一个nginx的动静结合问题，此外还有nginx对于tp的特殊一点，*nginx是不原生支持pathinfo*。

所以简单的讲也就是url重写功能是 *__不会开启__* 的，这样相对于原来的lmap架构简单的部署而言要麻烦不少，当然了我们还可以使用更加复杂的架构比如lnmap这样的结构，不过目前来看apache还是不完全必要的因为后面只有一个php服务器，简单的lnap就好了。

## tp的url知识

首先要设置url的读取规则，tp的url读取规则有三种，不过我只是记得两种，
第一种是这样的

```
/index.php/model/controller/action?var=value
```

当然咯这个还有一种变种写法比如这样的

```
/index.php?s=/model/controller/action?var=value
```

还有一个更加分离的写法，比如这样的

```
/index.php?$m=model&$c=controller&$a=action&var=value
/index.php?model=model&controller=controller&action=action&var=value
```

所以在了解thinkurl规则的情况下不需要进行pathinfo通过url重写同样可以完成操作

而事实上thinkphp中也通常使用了*相同的方法*，比如重写模式

```
RewriteRule ^(.*)$ index.php/$1 [QSA,PT,L]
```

所以为了方便正则匹配，我简单的选择$s的方法来匹配,先设置一下url规则

```
<?php
return array(
	'URL_MODEL'=>2, 
); 
?>
```

## nginx的配置

nignx的配置就简单多了简单的使用rewrite就好了

```nginx
server {
	listen       4000;
	server_name  localhost;
	index index.html;
	#将静态资源由自己代理
	location ~ .*\.(html|htm|gif|jpg|jpeg|bmp|png|ico|txt|js|css)$ {
		root /Users/icepro/Site/dest
		#开发环境设置时间为1分钟
		expires 1m;
		#expires 30d;
	}
	#先匹配/api/index.php存在直接访问
    location ~ ^/api/index\.php/?.*$ {
        #root           html;
        root /Users/icepro/Site/server;
        
        fastcgi_pass   127.0.0.1:9000;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #include        fastcgi_params;
        include        fastcgi.conf;
    }
    #将没有匹配的重写url在进行匹配，如果在不匹配则会返回404
    location ~ ^/api/(.*)$ {
        if (!-e $request_filename) {
            rewrite ^/api/(.*)$ /api/index.php?s=$1 last;
            break;
        }
    }

}
```
