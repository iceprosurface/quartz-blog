---
title: "[Octopress]基础指引"
date: 2016-02-27 13:40:54 +0800
updated: 2024-07-03T14:51:29+08:00
comments: true
permalink: /2016/02/27/2016/2016-02-27-octopress-base/
tags:
  - 工具
ccby: true
---

## 坑爹的Octopress！

传说中号称黑客使用的博客的确名不虚传，至少我是花了不少时间去研究这个博客系统的，嫌麻烦的推荐还是直接上wordpress算了，简单多了。

现在正式的把blog迁移到了github上，绑定了自己的域名，这里记录一下安装过程中的一些问题，或许可以帮助后来者少走一点弯路。

## 准备工作

首先，强调三遍！

使用win安装会非常麻烦!

使用win安装会非常麻烦！

使用win安装会非常麻烦！

这些麻烦的地方并不是应用本身的问题，而是相关依赖软件的问题导致的。

如果你在完成前期安装后还能继续下去的话，那正文开始！

<!--more-->

由于Octopress是基于jekyll的，所以首先我们要安装关于jekyll的相关依赖

那么你需要安装以下所有的软件

  * ruby
  * python
  * DevKit
  * gem
  * git
  
再次之中你可能会碰到各种个样的问题，不过这些多数是系统变量设置的问题，这些问题都可以经过百度快速解决，so，本文将不对此处做出详细解释。

你可能会发现在国内使用gem源大多有点问题，可能是没有办法使用的。

这样我们可能需要改几个CDN源位置，具体可以到各自的官网去查询，这里我使用的是淘宝源

> [淘宝源](https://ruby.taobao.org/ "淘宝源")

## 安装依赖

安装依赖项目

```bash
cd octopress
ruby --version # Should report Ruby 1.9.2
gem install bundler
bundle install 
```

然后使用默认主题（你可以自己下载主题，具体每个主题的制作者都会给出教程）

```bash
rake install
```


## 配置Octopress
首先它不支持中文，我们先要添加中文支持

```ruby convertible.rb
self.content = File.read(File.join(base, name))
```
修改为

```ruby  convertible.rb
self.content = File.read(File.join(base, name),:encoding => "utf-8")
```

特殊情况下你可能需要在环境变量中添加

```
LANG=zh_cn.UTF-8
LC_ALL=zh_cn.UTF-8
```

将octopress的文件夹下的_config.yml的编码改成UTF-8,修改_config.yml，修改url、title、subtitle、author等等。

## 移除关于Twitter，google+，google API的支持

这里内容太多了，得按照各自的主题慢慢修改了

## 写博文

利用rake new_post["title"];可以生成一个新的博文

然后我们可以写个bat来快速开启

```bash new.bat
F:
cd F:\blog\bg
rake new_post
pause
```

然后我不懂ruby，不过修改一下文件还是没有问题的
寻找根目录下的rakefile文件中这里一段

```ruby rakefile
task :new_post, :title do |t, args|
```
在

```ruby rakefile
  end
  filename ="#{file_root}/#{source_dir}/#{posts_dir}/#{Time.now.strftime('%Y-%m-%d')}-#{title.to_url}.#{new_post_ext}"
  --> puts "now is open by notepad++:#{filename}"
  --> system "start opennote.bat #{filename}"
end
```

添加箭头处的两段代码

```bash  new.bat
system "start opennote.bat #{filename}"
```

然后创建一个opennote.bat放在更目录下（前提是你用的编辑器必须在windows变量中包含在可以用这个bat）

```vb new.bat
for %%a in (%1) do (
	if not %%a equ "" (
		start notepad++ %%a
	)
)
exit
```

然后以后双击new.bat就可以直接写了（讲道理win的控制台太烂了）
如果你是在github部署的话可能会遇到和我的一样问题就是CNAME文件无法被识别
据我所知作者是加入了CNAME识别的我看不懂ruby语言，但不妨碍我加一个识别进去


```ruby makefile
FileList["#{args.source}/**/.*"].exclude("**/.", "**/..", "**/.DS_Store", "**/._*").each do |file|
```
加入CNAME文件的识别

```ruby makefile
FileList["#{args.source}/**/.*","#{args.source}/CNAME"].exclude("**/.", "**/..", "**/.DS_Store", "**/._*").each do |file|
```

这样就ok了，你可以开始使用markdown语言写文章了

