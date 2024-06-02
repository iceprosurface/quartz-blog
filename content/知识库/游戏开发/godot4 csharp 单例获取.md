---
title: godot4 C# 单例获取节点
date: 2024-05-08T14:40:22+08:00
updated: 2024-06-02T13:04:04+08:00
permalink: /2024/godot4-singleton/
tags:
  - 游戏开发
  - "#csharp"
---

### 环境

```
godot 4.1.2+
.net8
```



####  通过 GetMainLoop + sceneTree 获取
一般来说需要使用 [[../编程/单例模式|单例模式]] 获取的通常都是 autoloads 的代码，由于 MainLoop 实质上也是单例的，所以可以通过 mainLoop 来获得 sceneTree 通过 root GetNode 来获取

```csharp
public partial class Test : Node  
{
	public static Test Instance  
	{  
	    get  
	    {  
	        var mainLoop = Engine.GetMainLoop();  
	        if (mainLoop is SceneTree sceneTree) return sceneTree.Root.GetNode<Test>("/root/<name>");  
	        return null;  
	    }
    }
}
```

这样我们就能比较简单的获取这个实例了 `Test.Instance.xxxx` 不过这种代码在 autoloads 中使用并不如直接 `__Ready` 来的方便，所以这里并不推荐，这一方法比较适合的是在 Node 外部调用时，通过全局 API 访问才需要。

#### 通过 static 注册的方式
还有一种比较常见的方式是通过 public static 在 ready 的时候去注册：

```csharp
public partial class Test : Node  
{  
    public static Test Instance { get; private set; }  
    public override void _Ready()  
    {        
	    Instance = this;  
    }
}
```