---
title: centos 6 配置安装 python 2.7
date: 2018-04-18T05:19:01+08:00
tags:
  - 服务器
comments: true
updated: 2024-07-03T14:54:20+08:00
permalink: /2018/04/17/2018/ss-on-centos6/
ccby: true
---

## 起因

同事叫我帮忙装一下 ss ，她不会装，我就估摸着反正装个 ss 能多难，也就几分钟的事情，然而事实却有点坑。

## 现在的pip不支持 python 2.6.6

万万没想到 centos 6 x86 的安装这么可怕

这一次使用的centos 6 x86 上面默认安装的 python 2.6.6  起初我看 ss 是支持 python2.6.6 的,但是万万没想到, pip无法正确安装

起初我是这样安装的: 

```bash
yum install python-setuptools && easy_install pip
```

报了个错,具体是啥没记录

然后就想是不是 pip 没安装对,然后我就尝试 手工安装了:

```bash
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
```

结果报错了

```
Traceback (most recent call last):
  File "get-pip.py", line 17474, in <module>
    main()
  File "get-pip.py", line 17466, in main
    bootstrap(tmpdir=tmpdir)
  File "get-pip.py", line 17406, in bootstrap
    import pip
  File "/tmp/tmpB9jhvw/pip.zip/pip/__init__.py", line 9, in <module>
  File "/tmp/tmpB9jhvw/pip.zip/pip/log.py", line 9, in <module>
  File "/tmp/tmpB9jhvw/pip.zip/pip/_vendor/colorama/__init__.py", line 2, in <module>
  File "/tmp/tmpB9jhvw/pip.zip/pip/_vendor/colorama/initialise.py", line 5, in <module>
  File "/tmp/tmpB9jhvw/pip.zip/pip/_vendor/colorama/ansitowin32.py", line 6, in <module>
  File "/tmp/tmpB9jhvw/pip.zip/pip/_vendor/colorama/winterm.py", line 2, in <module>
  File "/tmp/tmpB9jhvw/pip.zip/pip/_vendor/colorama/win32.py", line 7, in <module>
```

当时我脑海中就是,emmmm这是个啥,算了我装个python34好了,centos应该有

```bash
yum install python34
yum install python3
yum install python35
yum install python36
```

what???没有,这个时候 打了一个 yum search一翻...对根本没有 python 2.6以上的版本,得了,自己编译吧


## 手工编译 python 2.7

先把依赖装以下:

```bash
yum install zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel
wget https://www.python.org/ftp/python/2.7.13/Python-2.7.13.tgz
tar vxf Python-2.7.13.tgz
cd Python-2.7.13
./configure --prefix=/usr/local
make && make install
```

```
checking for gcc... no
checking for cc... no
checking for cl.exe... no
configure: error: no acceptable C compiler found in $PATH
See `config.log' for more details.
```

what?没有gcc....


### 安装gcc

接着安装以下gcc

```bash
yum install gcc
```

再来一次

```bash
./configure --prefix=/usr/local
make && make install
```

```
libpython2.7.a(mystrtoul.o):/root/Python-2.7.13/Python/mystrtoul.c:165: more undefined references to `_PyLong_DigitValue' follow
collect2: ld 返回 1
make: *** [python] 错误 1
```

### 更换版本 2.7.8

这是个啥...算了....我换个版本....

```bash
wget https://www.python.org/ftp/python/2.7.8/Python-2.7.8.tgz
tar vxf Python-2.7.8.tgz
cd Python-2.7.8
./configure --prefix=/usr/local
make && make install
```

好这次安装成功了, 还带上了pip,艰苦的历程QAQ,接下来按照之前的教程接着走一此就成了

## 总结

事实证明，linux 环境更换一下是有很大差别的，总体来看，下载源码自行编译这个技能还是需要的。

这里就扯几句题外话，这个时候就要表扬一下 Debian 系统了 apt 仓库简直不能更新，全部默认提供最新的源（如果不把旧的源删除相信我就义无反顾成为死忠粉了），对比一下保守的 Redhat 系， Debian 在日常开发，自己小规模使用中体验是相当好的，但是对于成建制的运维来讲虽然是不大的，但是 Debian 系在对服务器的方面的 服务支持 是相对更少的。

最后的最后，其实实际上我们更多的是需要一个 虚拟环境 去帮我们摒除这些反复的配置 比如 docker ！就是一个非常 nice 的选择！

