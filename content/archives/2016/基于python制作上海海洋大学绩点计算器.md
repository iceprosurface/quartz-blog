---
title: 基于python制作上海海洋大学绩点计算器
date: 2016-04-04 17:07:49 +0800
updated: 2024-07-03T14:52:42+08:00
comments: true
permalink: /2016/04/04/2016-04-04-base-on-python-cal/
tags:
  - 工具
ccby: true
---

## 原因

最早只是觉得手工计算绩点比较麻烦，so用js写了一个绩点计算器，当然咯，之前是有人写过的不过现在我打算让其完成自动化的过程，首先了，不得不提提海大的学分系统了

它大量使用了iframe框架，虽然说作为一个站内站点，不需要做SEO但是讲道理，这里面js跨域的问题就觉得麻烦么？

so，我把最初的js的版本放弃了。

> 当然，我不得不提一句，由于新学期开始了，so这个办法目前是不能获得分数的（因为页面就还没放上内容）
> 现在改版本已做更新，请上github观看

<!-- more -->

## 程序设计

这里就不去把抓包数据分析了，直接上代码

首先讲述一下思路，因为我们学校使用了类似于sessionid的客户端cookie（不理解为什么这么做），so我们不能直接访问入口，必须要访问门户获取一次cookie

```python
#登录的主页面  
hosturl = 'http://urp.shou.edu.cn/'
#post数据接收和处理的页面（我们要向这个页面发送我们构造的Post数据）  
posturl = 'http://urp.shou.edu.cn/loginAction.do'   
#设置一个cookie处理器，它负责从服务器下载cookie到本地，并且在发送请求时带上本地的cookie  
cj = cookielib.LWPCookieJar()  
cookie_support = urllib2.HTTPCookieProcessor(cj)  
opener = urllib2.build_opener(cookie_support, urllib2.HTTPHandler)  
urllib2.install_opener(opener)  
  
#打开登录主页面（他的目的是从页面下载cookie，这样我们在再送post数据时就有cookie了，否则发送不成功）  
h = urllib2.urlopen(hosturl)  
```

接下来我们读取一下设置好的用户名和密码

```python
cf = ConfigParser.ConfigParser()
cf.read("./config.conf")
#读取用户全局设置
username = cf.get("globe","username")
password = cf.get("globe", "password")

#构造header，一般header至少要包含一下两项。学校抓包数据表明为这两项
headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:14.0) Gecko/20100101 Firefox/14.0.1',  
				   'Referer' : 'http://urp.shou.edu.cn/'}  
#构造Post数据  
postData = {
						'zjh' : username, 
						'mm' : password, 
						}  

print '检验post数据是否正确'
print postData

#需要给Post数据编码  
postData = urllib.urlencode(postData)  
```

然后通过urllib2提供的request方法来向指定Url发送我们构造的数据，并完成登录过程  

```python
request = urllib2.Request(posturl, postData, headers)  
print '校验request是否成功'
print request  
response = urllib2.urlopen(request)  
text = response.read()  
print '校验是否进入学校登陆页面'
print text

```


接下来获取我们学分页面
```python
##构造get的header，一般header至少要包含一下两项。学校抓包数据表明为这两项
headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:14.0) Gecko/20100101 Firefox/14.0.1',  
				   'Referer' : 'http://urp.shou.edu.cn/menu/s_main.jsp'}
##我们需要get的页面 
geturl = 'http://urp.shou.edu.cn/bxqcjcxAction.do'
request = urllib2.Request(geturl)
#获得返回值
response = urllib2.urlopen(request)  
text = response.read()  
print '校验是否获得目标学分'
```

获得了之后我们把它保存在同级目录下，然后在结尾处加上我们的js代码，这里我已经把js处理成单行的，恐怕没有什么好的办法还原了，so将就着看吧

```python
#字符串格式转码
text = text.decode('GBK').encode('UTF-8')
#替换计算系统
regex = re.compile("</html>")
upload='<script src="http://apps.bdimg.com/libs/jquery/2.1.1/jquery.min.js"></script><script>function getPoints(t){return t.match("通过")?3.3:t.match("优秀")?3.3:t.match("良好")?2.3:t.match("通过")?1:t>=90?4:t>=85?3.7:t>=82?3.3:t>=78?3:t>=75?2.7:t>=72?2.3:t>=68?2:t>=66?1.7:t>=64?1.5:t>=60?1:0}function getPoint(t,n,r){return sumt=0,suml=0,$.each(t,function(t){0!=t&&(sumt+=r[t]*n[t],suml+=n[t])}),sumt/suml}$(document).ready(function(){var t=new Array,n=new Array,r=new Array;$("#user tr").each(function(e){0!=e&&(r[e]=parseFloat($.trim(this.children[4].innerHTML)),n[e]=$.trim(this.children[6].innerHTML),t[e]=getPoints(n[e]))});var e=getPoint(n,r,t);alert(e)});</script></html>'
text = re.sub(regex,upload,text)
#将文件标示为utf类型
regex = re.compile("<head>")
upload='<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'
text = re.sub(regex,upload,text)
print text
#打开文本
# text = unicode(text, "utf-8")
f = open(".\index.html","wt")
#输出到文本
f.write(text)
#关闭文本
f.close()
#打开文件
url = '.\index.html'
webbrowser.open(url)
```

> 完整代码如下

```python
#!/usr/bin/python  
#coding:utf-8
import HTMLParser  
import urlparse  
import urllib  
import urllib2  
import cookielib  
import string  
import re  
import sys
import webbrowser
import codecs
import ConfigParser

cf = ConfigParser.ConfigParser()
cf.read("./config.conf")
#读取用户全局设置
username = cf.get("globe","username")
password = cf.get("globe", "password")
#登录的主页面  
hosturl = 'http://urp.shou.edu.cn/'
#post数据接收和处理的页面（我们要向这个页面发送我们构造的Post数据）  
posturl = 'http://urp.shou.edu.cn/loginAction.do'   
#设置一个cookie处理器，它负责从服务器下载cookie到本地，并且在发送请求时带上本地的cookie  
cj = cookielib.LWPCookieJar()  
cookie_support = urllib2.HTTPCookieProcessor(cj)  
opener = urllib2.build_opener(cookie_support, urllib2.HTTPHandler)  
urllib2.install_opener(opener)  
  
#打开登录主页面（他的目的是从页面下载cookie，这样我们在再送post数据时就有cookie了，否则发送不成功）  
h = urllib2.urlopen(hosturl)  
  
#构造header，一般header至少要包含一下两项。学校抓包数据表明为这两项
headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:14.0) Gecko/20100101 Firefox/14.0.1',  
				   'Referer' : 'http://urp.shou.edu.cn/'}  
#构造Post数据  
postData = {
						'zjh' : username, 
						'mm' : password, 
						}  

print '检验post数据是否正确'
print postData

#需要给Post数据编码  
postData = urllib.urlencode(postData)  
  
#通过urllib2提供的request方法来向指定Url发送我们构造的数据，并完成登录过程  
request = urllib2.Request(posturl, postData, headers)  
print '校验request是否成功'
print request  
response = urllib2.urlopen(request)  
text = response.read()  
print '校验是否进入学校登陆页面'
print text

##构造get的header，一般header至少要包含一下两项。学校抓包数据表明为这两项
headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:14.0) Gecko/20100101 Firefox/14.0.1',  
				   'Referer' : 'http://urp.shou.edu.cn/menu/s_main.jsp'}
##我们需要get的页面 
geturl = 'http://urp.shou.edu.cn/bxqcjcxAction.do'
request = urllib2.Request(geturl)
#获得返回值
response = urllib2.urlopen(request)  
text = response.read()  
print '校验是否获得目标学分'
#字符串格式转码
text = text.decode('GBK').encode('UTF-8')
#替换计算系统
regex = re.compile("</html>")
upload='<script src="http://apps.bdimg.com/libs/jquery/2.1.1/jquery.min.js"></script><script>function getPoints(t){return t.match("通过")?3.3:t.match("优秀")?3.3:t.match("良好")?2.3:t.match("通过")?1:t>=90?4:t>=85?3.7:t>=82?3.3:t>=78?3:t>=75?2.7:t>=72?2.3:t>=68?2:t>=66?1.7:t>=64?1.5:t>=60?1:0}function getPoint(t,n,r){return sumt=0,suml=0,$.each(t,function(t){0!=t&&(sumt+=r[t]*n[t],suml+=n[t])}),sumt/suml}$(document).ready(function(){var t=new Array,n=new Array,r=new Array;$("#user tr").each(function(e){0!=e&&(r[e]=parseFloat($.trim(this.children[4].innerHTML)),n[e]=$.trim(this.children[6].innerHTML),t[e]=getPoints(n[e]))});var e=getPoint(n,r,t);alert(e)});</script></html>'
text = re.sub(regex,upload,text)
#将文件标示为utf类型
regex = re.compile("<head>")
upload='<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'
text = re.sub(regex,upload,text)
print text
#打开文本
# text = unicode(text, "utf-8")
f = open(".\index.html","wt")
#输出到文本
f.write(text)
#关闭文本
f.close()
#打开文件
url = '.\index.html'
webbrowser.open(url)
```