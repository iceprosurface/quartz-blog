---
title: 部署你的octopress到vps上
date: 2016-05-23 13:38:47 +0800
comments: true
permalink: /2016/05/23/2016/2016-05-23-octopress-to-new-vps/
tags:
  - 服务器
updated: 2024-05-17T01:57:38+08:00
---

在github上挂了这么久的博客最后还是决定迁出blog，原因很简单吧，无非是github上面的速度实在有点慢，使用了大量的cnd站屏蔽了许多国外api，仍然无法在不使用vpn的情况下达到合理的访问时间（首次访问3s以下）

基于这一点，最后决定还是把内容放置到自己的vps上，github页面制作备份

下面让我来介绍以下如何将你的octopress迁移到你自己的vps上！

<!-- more -->

> 下面的内容需要一定的前置技能：
>
> 1. 基础的bash知识
> 
> 2. 基础的vi/vim操作知识
> 
> 3. 对nginx有一定的了解（简单配置能看懂）
> 

### 1. 准备工作

首先，现在我有一个已经配置完毕的octopress内容，也就是生成已经不用考虑，所以唯一需要准备的就是你自己的vps。

一般的vps（centos系统）是不会有nginx源的（这个访问静态资源比aparche快很多），所以首先需要在yum中添加nginx源，然后配置nginx，由于只是需要简单的访问，所以在server中只需要配置域名，路径和监听端口就可以了。

假设，如果你是一个忠实的ubuntu使用者恭喜你，直接apt-get可能就可以完美运行了。

### 2. 添加nginx源

首先ssh登陆你的vps：
```bash
#root 替换为你需要登陆的用户名
#ip 替换成你需要登陆的ip
#port 替换成你需要登陆的端口，如果不使用-p则默认22端口
ssh root@ip -p port
```
按提示输入密码后就可以登陆了，接下来先配置nginx源

```bash
#如果你的系统没有vim的vi也是可以的
vim /etc/yum.repos.d/nginx.repo
```

这个__文件的内容__如下：


```ini
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/mainline/centos/6/$basearch/
gpgcheck=0
enabled=1
```

接着让我__更新__一下yum源
```bash
#你可以看一眼是否正确
cat > /etc/yum.repos.d/nginx.repo
yum clean all
yum update
# 然后在一大串信息以后我们就可以安装nginx了
yum install nginx
```
### 3. 配置nginx

在安装完以后需要配置一下nginx，这部分不是很难。

```bash
vim /etc/nginx/nginx.conf
```

在http中的末尾添加以下内容

```conf
server{
	listen 80;
	#定义域名，将www.xxx.com替换为你自己的域名
	server_name www.xxx.com;
	location / {
		#定义服务器的默认网站根目录位置，yourname替换成你的的用户名不建议使用root
		root /home/yourname/octopress;
		#定义默认的服务器首页文件
		index index.html index.htm;      
	}
}
```

将开头的__user root__替换为yourname

```bash
#替换成箭头处
usr root;
#->user yourname;
```

### 4. 添加用户

直接使用root并不是不可以但不安全，建议的话创建一个普通用户yourname来，其实建议在控制台将root用户禁止ssh登陆（这样更安全，当然如果只是自用，不在乎安全问题的大可root全通）

```bash
adduser yourname
passwd yourname
#按要求设置密码
#cd ~或者cd /home/yourname都是可以的
cd ~
#创建一个octopress目录
mkdir octopress
```

### 5. 启动或关闭nginx

这里可以启动了，此处记录一下nginx的启动和关闭方法

```bash
#启动
nginx -c /etc/nginx/nginx.conf
#关闭
pkill -9 nginx
```

### 6. 上传文件

此时你就可以登陆网站了，不过提示显然是空白的，要求你继续操作或配置，不需要去理他，下面上传文件就行了

打开你的octopress目录，找到rakefile文件，使用任何文本编辑器打开即可
修改内容为一下内容：

> __注意同步方式记得改为rsync__

```ruby
#ssh用户名
ssh_user       = "yourname@ip"
#ssh端口
ssh_port       = "port"
#这里是目录，假设你有自己改动过的记得改成对应的目录
document_root  = "~/octopress/"
rsync_delete   = false
rsync_args     = ""
deploy_default = "rsync"
```

接下来就是执行了

```bash
#切换到目录
cd ~/octopress
#编译
rake generate
#上传
rake deploy
#编译+上传
rake gen_deploy
#我自己在bin里面添加了bash所以直接使用blogpush命令就可以的
```

值得注意的是她会提示你输入密码这可太麻烦了，我们需要添加ssh_rsa

### 7. 添加rsa_pub

```
#如果没有id_rsa.pub你可以使用ssh-keygen生成一个
ssh-copy-id -i ~/.ssh/id_rsa.pub ip -p port
```

如果你是mac用户很遗憾的告诉你原生的mac term并没有附带ssh-copy-id命令你需要安装一下

```bash
brew install ssh-copy-id
```
好就这样，已经完成了迁移工作是不是值得庆贺呢？