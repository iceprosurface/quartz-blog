---
title: 现代 vim 编辑器指北
date: 2022-02-08T18:15:00+08:00
updated: 2024-08-07T13:30:32+08:00
comments: true
tags:
  - 编辑器
permalink: /2022/02/08/2022/lunar-vim/
ccby: true
---

# 旧时代的 vim

最早用 ubuntu 的时候，那个时候还是 atom & vscode 针锋相对相对的时候，基于两者生态还没起来的原因，不免使用上有所不便，索性也就都不用了，直接把目光投向了最老牌的两个编辑器 —— emacs & vim。

出于对 编辑器 没有什么太高要求，故而最终用上的是 vim。

但是想把 vim 调教成一个合适的，功能齐全的编辑器并不方便，核心在于 vim 本身受制于 vimscript 功能局限，加之 vim 在本身是同步编程时代的产物，一旦在成规模的应用上，使用 vim 来作为主力 ide 是一件不怎么好用的事情。

<!-- more -->

当然那是其实也配置了诸多个性化的配置。

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-08/102713-6TvYSU.png)


vim 也能带上侧边栏，有自动补全（you complete me），但是说实话和 atom 差不多，卡得很。

所以后来也就简单的文本编辑用上了 vim，或者在服务器端，直接用 vi，真正成规模使用的编辑器最早用的还是 sublime （我转去使用 mac 了）。

旧时代的 vim 完全不像一个现代编辑器，充斥着旧时代样貌，不能说不好用，但也只是勉强，万幸的是 vim 的编辑模式倒是广泛的流传开来，在各大编辑器中都有对应的插件实现。

但是这些使用难免有那么一些割裂感，主要来源于 vim 键盘操作和各个编辑器本身快捷键操作的割裂。

# 现代 vim —— neovim

随着时代的推进，到了 15 年、16年的时候， neovim 横空出世，他的作者不满于 vim 薄弱的编辑功能，为此在 vim 的主线上单独拉出了一个全新的分支。

基于异步操作的实现，得以让 vim 可以真正的和现代编辑器在同一起跑线竞争。

同时由于 vscode 制定的 LSP 标准使得各个不同编辑器之间割裂的语法服务器得以统一。

此后，neovim 又一巨大的改进则是引入了 lua，lua 极大的提升了插件的表现能力，引发了插件生态的繁荣，至此一个现代 vim 的雏形诞生了。

# LunarVim

对于我而言早就过了折腾的年代的，现在只想着抄一抄别人的 vim 配置，而 LunarVim（[点击这里前往](https://www.lunarvim.org/)） 则是一个不错的选择：

仅仅需要一行即可快速安装

```bash
bash <(curl -s https://raw.githubusercontent.com/lunarvim/lunarvim/master/utils/installer/install.sh)
```

此外你还需要添加一些必要的依赖（我是 mac 所以用的 brew）：

```bash
# neovim 原始依赖
brew install --HEAD neovim
# fuzzy finder
brew install fzf
# 快速搜索文件
brew install fd
# 正则搜索文本
brew install ripgrep
```

## 入口页面

在命令行输入 lvim 后短暂的等待安装，即可启动：

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-08/104648-qyfhIV.png)

## 侧边栏和tab栏目

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-08/104504-wEqDQL.png)

使用 `H` 和 `L`  即可左右切换 tab。

使用 `<Leader> + e` 可以开启关闭侧边栏目

## 搜索文件

使用 `<Leader> + f` 可以快速搜索文件并预览

使用 `<Ctrl> + d/u` 即可上下翻页 preview

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-08/105046-L1WVfa.png)


## 搜索字符串

使用 `<Leader> + s + t` 可以快速搜索关键词

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-08/112142-wuzJFR.png)

## git 功能

使用 `<Leader> + s + b` 可以快速切换 branch

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-08/132155-IsNMKG.png)

## lsp 补全 & lint 提示等

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-08/133206-9iPi5z.png)

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-08/133243-KbCKFt.png)


## 快速打开一个 terminal

使用 `<Ctrl> + t` 可以快速打开一个命令行，当然你在按下这个快捷键前按个数字，就可以启动不同的命令行。

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-11/171726-VpqvKj.png)


## 各种语言的补全能力

### vue

template

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-11/171826-bgXiwr.png)

script

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-11/171944-e7PPFD.png)

style

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-11/172012-yj4aH9.png)

lint 提示情况

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-11/172033-C6bPOr.png)

自动格式化情况

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-11/172104-YXfXjK.png)


### ts/js/jsx/tsx

基本和 vscode 完全一致，所以不多赘述了


### php


![图片](https://cdn.iceprosurface.com/upload/md/2022-02-11/172332-hIuRmH.png)


### lua

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-11/172658-RRTWcL.png)


### 其他

几乎所有的主流语言都完善的支持了

![图片](https://cdn.iceprosurface.com/upload/md/2022-02-11/172536-zy3mkp.png)


# 使用体验

在体验完以后，就在日常试了试，在纯粹的编写体验而言是远远超过单纯 vim 和 vscode 的，但是在日常使用期间，如果涉及到大面积的重构和 debug ，就这方面的体验而言，确实并不比 vscode 和 webstorm。