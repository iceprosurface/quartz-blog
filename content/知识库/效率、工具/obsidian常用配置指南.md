---
title: obsidian常用配置指南
date: 2024-06-01T11:31:28+08:00
updated: 2024-06-18T14:44:18+08:00
permalink: /2024/obsidian-plugin/
tags:
  - 工具
ccby: true
draft: false
comments: true
---
最近听闻 [Sleaf](../../朋友圈/Sleaf.md) 打算也入坑 obsidian ，想找我要份配置，思来想去反正也要整理不如顺便写个文章记录一下常用的配置好了

# 插件

## admonitions

是一个 **Callout** 的增强模式，譬如：

> [!note] https://github.com/javalent/admonitions

可以通过下面的代码来显示一些特别的标记和样式：

```markdown
> [!<something>]
```

当然他也有 **Admonition** 模式，这个我不太用


## advanced-tables-obsidian

高级版本的 table，主要可以稍稍改进一下表格的显示和格式化，新版的 obsidian 已经内置了一些高级操作，这个应该也可以不安装了

[https://github.com/tgrosinger/advanced-tables-obsidian](https://github.com/tgrosinger/advanced-tables-obsidian)


## obsidian-auto-link-title

一个有用但不多的插件，可以在复制链接的时候帮你自动抓一下标题。

[https://github.com/zolrath/obsidian-auto-link-title](https://github.com/zolrath/obsidian-auto-link-title)

## commander

可以在很多位置新增一些操作按钮，有用，但不多。

[https://github.com/phibr0/obsidian-commander](https://github.com/phibr0/obsidian-commander)

## obsidian-editing-toolbar

在顶部添加一个操作栏，可以相对方便的做个加粗什么的，比如我一般写完文章以后在添加着重标记，一般来说绑定快捷键肯定更好，不过懒得记的情况下又不想打字这个还是挺好用的。

[https://github.com/PKM-er/obsidian-editing-toolbar](https://github.com/PKM-er/obsidian-editing-toolbar)


## obsidian-excalidraw-plugin

默认的画板现在做的已经很好了，不过个人更喜欢 excalidraw，开源而且可以内嵌在任意地方，相当于是一个通用格式了。

[https://github.com/zsviczian/obsidian-excalidraw-plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin)

## obsidian-floating-toc-plugin

一个美化插件，把 toc 放在左侧，或者自定义的某个位置，可有可无，而且切换内容的时候不会立即更新 toc。

[https://github.com/PKM-er/obsidian-floating-toc-plugin](https://github.com/PKM-er/obsidian-floating-toc-plugin)


## obsidian-footnotes

脚注提示和预览，很好用，如果你很喜欢标记来源的话，他是你的不二之选。

[https://github.com/MichaBrugger/obsidian-footnotes](https://github.com/MichaBrugger/obsidian-footnotes)

## obsidian-git

核心功能，利用它可以上传到 github 并触发后续的 github workflow，发布和存档就全靠它了，手机上很卡，不建议安装。

[https://github.com/denolehov/obsidian-git](https://github.com/denolehov/obsidian-git)


## obsidian-omnisearch

全功能的搜索插件，速度很快，但是使用前会需要索引，支持 pdf 和 ocr 是一个非常强力的搜索插件，我用它替代了内置的搜索功能。

[https://github.com/scambier/obsidian-omnisearch](https://github.com/scambier/obsidian-omnisearch)


## obsidian-plugin-manager

可有可无，如果你对软件的启动速度无所谓那么可以不装，如果有感觉则可以选这个，他可以对每一个插件设置一个启动延迟，譬如不重要的非核心功能延后几秒加载会让整个 obsidian 启动快很多，比如我现在的启动时间大概在 300ms。

[https://github.com/ohm-en/obsidian-plugin-manager](https://github.com/ohm-en/obsidian-plugin-manager)


## obsidian-ReadItLater

非常好用的摘抄器，我用他来替代以前 大象笔记 的剪藏功能，如果你想办法在 obisidian 内完成登陆的话，即使页面需要登陆你也是可以正常剪藏的，还有一个做法是用浏览器插件下载成 markdown，不过有了这个以后基本很少用浏览器插件干这个事情了。

[https://github.com/DominikPieper/obsidian-ReadItLater](https://github.com/DominikPieper/obsidian-ReadItLater)

## remotely-save

手机端同步插件，同样的也是一个后备的恢复源。

[https://github.com/remotely-save/remotely-save](https://github.com/remotely-save/remotely-save)


## obsidian-image-auto-upload-plugin

图片上传插件，需要配合 picgo 工作，其实我觉得内置进去更好一点，奈何还是需要搭配使用的。

[https://github.com/renmu123/obsidian-image-auto-upload-plugin](https://github.com/renmu123/obsidian-image-auto-upload-plugin)


## obsidian-style-settings

辅助主题编辑，如果你用的主题可定制性比较强，那么是需要他的。

[https://github.com/mgmeyers/obsidian-style-settings](https://github.com/mgmeyers/obsidian-style-settings)

## obsidian-text-extractor

ocr 插件，主要配合搜索插件使用

[https://github.com/scambier/obsidian-text-extractor](https://github.com/scambier/obsidian-text-extractor)

## update-time-on-edit-obsidian

自动更新 元数据 中的 updated 字段，更新文章就不用手动更新这个字段了。

[https://github.com/beaussan/update-time-on-edit-obsidian](https://github.com/beaussan/update-time-on-edit-obsidian)


## cm-chs-patch

中文分词补充，我建议用结巴分词，因为这个分词系统可以让搜索也能使用上，匹配更精准。

[https://github.com/aidenlx/cm-chs-patch](https://github.com/aidenlx/cm-chs-patch)

# 主题

我现在用的主题是： [Blue-Topaz_Obsidian-css](https://github.com/PKM-er/Blue-Topaz_Obsidian-css)

他需要配合之前的主题配置插件使用。

而且他有一个非常不错的示例仓库用来学习如何管理：[ https://github.com/PKM-er/Blue-topaz-example](https://github.com/PKM-er/Blue-topaz-example)
