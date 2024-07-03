---
title: vscode vim 配置
date: 2022-09-04T12:46:40+08:00
updated: 2024-07-03T14:56:24+08:00
permalink: /2022/vscode-vim-config/
tags:
  - 编辑器
ccby: true
comments: true
---

之前我介绍了一下 lunar-vim，lunar-vim 诚然是一个不错的选择，但是实际上在 vscode 中直接开启 vim 已经能有不错的体验的了，这里只需要稍稍做一下配置的修改即可。

<!-- more -->

## 切换 tab

不知道为什么默认没有提供，我们可以在 config 中这么添加：


```json
{
	"vim.normalModeKeyBindings": [
	    {
	      "before": ["H"],
	      "commands": [":tabp"]
	    },
	    {
	      "before": ["<Leader>", "h"],
	      "commands": [":tabp"]
	    },
	    {
	      "before": ["L"],
	      "commands": [":tabn"]
	    },
	    {
	      "before": ["<Leader>", "l"],
	      "commands": [":tabn"]
	    },
	]
}
```

这样在 normal 模式下就可以通过 `H` `L` 获得 `<Leader>` 切换了

## 更换 leader

默认的 leader 按键是 `/` 你可以选择用 空格 按键替代，这个也是常用方案了。

```json
{
 "vim.leader": "<space>",
}
```

## 切换窗口

说实话切换窗口我都是直接 `c-l` 和 `c-h` 的,所以这里也建议绑定一下

```json
{
	"vim.normalModeKeyBindings": [
	   {
	      "before": ["<c-l>"],
	      "after": ["<c-w>", "l"]
	    },
	    {
	      "before": ["<c-h>"],
	      "after": ["<c-w>", "h"]
	    }
	]
}
```

> 这里 vscode 从侧边栏切换回来比较蠢，不能直接用指令，所以你要么使用自带的快捷键比如我这里是 （command+shift+e）靠切换资源管理器切换回去

## 开启寄存器与系统剪切板绑定

这样会让 `*` 寄存器和剪切板保持同步，方便 复制粘贴

```json
{
	"vim.useSystemClipboard": true,
}
```

## 开启驼峰跳转

使用 leader + w/b 等操作，可以按照驼峰和下划线跳转。

```json
{
	"vim.camelCaseMotion.enable": true,
}
```

## vim.easymotion

easy motion 是用来做快捷跳转的，如果不习惯的话，就不建议开了。

```json
{
  "vim.easymotion": true,
  "vim.easymotionKeys": "12345qwerasdhjkl",
  "vim.normalModeKeyBindings": [
     {
      "before": ["<Leader>", "`"],
      "after": ["leader", "leader", "s"]
    },
  ]
}
```

如果使用的话可以绑定一个快捷按钮触发 easy motion。

当然默认的 easy motion 是全键盘的，这个对我这种手不快的非常不友好，所以一般情况下我会改成左手上半区间+hjkl，这样手大体不需要移动就可以流畅的跳转。

比如我常用的 `space+backquote+<任意字母>` 一般情况最多 5 键就可以跳转到页面上任意一个点。

## 绑定寄存器浏览器

绑定一个寄存器按钮方便看寄存器，同时在绑定了若干 visual 模式下的案件绑定。在 visual 模式下通过 `leader + 1` 直接粘贴 1 号寄存器，通过 `leader + !` 直接复制到 1 号寄存器。

```json
{
  "vim.normalModeKeyBindings": [
	{
      "before": ["<Leader>", "r"],
      "commands": [":registers"]
    },
  ],
  "vim.visualModeKeyBindings": [
    {
      "before": ["<Leader>", "`"],
      "after": ["\"", "0", "p"]
    },
    {
      "before": ["<Leader>", "~"],
      "after": ["\"", "0", "y"]
    },
    {
      "before": ["<Leader>", "1"],
      "after": ["\"", "1", "p"]
    },
    {
      "before": ["<Leader>", "!"],
      "after": ["\"", "1", "y"]
    },
    {
      "before": ["<Leader>", "2"],
      "after": ["\"", "2", "p"]
    },
    {
      "before": ["<Leader>", "@"],
      "after": ["\"", "2", "y"]
    },
    {
      "before": ["<Leader>", "3"],
      "after": ["\"", "3", "p"]
    },
    {
      "before": ["<Leader>", "#"],
      "after": ["\"", "3", "y"]
    },
    {
      "before": ["<Leader>", "4"],
      "after": ["\"", "4", "p"]
    },
    {
      "before": ["<Leader>", "$"],
      "after": ["\"", "4", "y"]
    },
  ],
}
```

