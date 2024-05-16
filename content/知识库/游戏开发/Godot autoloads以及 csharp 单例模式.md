---
title: Godot autoload 以及 csharp 单例模式
date: 2024-05-12T15:57:25+08:00
updated: 2024-05-16T23:41:30+08:00
permalink: /game-dev/godot-autoloads-and-csharp/
tags:
  - 游戏开发
  - csharp
ccby: false
---

# 标准的 godot 加载方式

之前我学习 godot 的时候，是按照文档方式去这样创建单例节点的：


![image.png](https://cdn.iceprosurface.com/upload/md/20240512155936.png)
然后在自动加载里面启用这个单例节点。

![image.png](https://cdn.iceprosurface.com/upload/md/20240512155957.png)

但是写着发现有点不对，这个单例也不是太有用，第一在 editor 界面上是没有办法直接编辑这个节点的数据的，也是需要运行时去编辑的，那么这个自动加载怎么算都不是很方便，因为在 c# 中我们可以直接实现单例

# c# 方案

在 c# 中我们可以非常方便的实现一个 [[../编程/单例模式|单例]]

```csharp
public class DataCenter {  
    private static DataCenter _instance;  
    public static DataCenter Instance => _instance ??= new DataCenter();  
}
```
