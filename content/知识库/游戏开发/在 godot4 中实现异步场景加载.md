---
title: 在 godot4 中实现异步场景加载
date: 2024-05-08T16:17:00+08:00
updated: 2024-06-02T13:04:06+08:00
permalink: /2024/godot-loading-scene/
tags:
  - 游戏开发
---
## 环境

```
godot 4.1.2+
.net 8
```


## 正文

一般而言我们的游戏过场通常会有一些过场动画，这个时候通常一般是用来加载数据、场景，随后进入场景。我们可以在 godot4 中用下面这个方式去载入场景:

```csharp
GD.Load<PackedScene>("res://scenes/LoadingScene.tscn");
```

这样去编写好处是比较简单的，坏处是我们不知道加载进度，所以我们要更换一个实现方案：


<!-- more --> 

好在 godot 默认提供了如下两个 API 去完成：

+ ResourceLoader.LoadThreadedGet - 完成后获取内容
+ ResourceLoader.LoadThreadedGetStatus - 获取当前的状态
+ ResourceLoader.LoadThreadedRequest - 开始加载

通过这个三个 api 就可以像下面这样实现：

```csharp
public partial class SceneManager : Node  
{
	private LoadingNode _loadingScene;
	// 用来确保 loading 动画是在最上面的
	public void MoveLoadingSceneToTop() {}
	public void DoLoadingStatus(string path) {}
	public async Task StartLoad(string path) 
	{
		MoveLoadingSceneToTop();
		var state = ResourceLoader.LoadThreadedRequest(path, "", true);
		{  
		    await _loadingScene.LoadingFadeIn();  
		    bool didLoadFinish;  
		    do  
		    {  
		        didLoadFinish = await DoLoadingStatus(path);  
		        await Task.Delay(TimeSpan.FromSeconds(0.1));  
		    } while (!didLoadFinish);  
		}
	}
	
}
```

我们利用 async await 去等待 status 执行，目前调用间隔为 100ms 实际上为了获取更精确的进度，可以设置的更短一点。

下面编写一下 DoLoadingStatus 的逻辑：

```csharp
private Godot.Collections.Array progress = new();
public async Task DoLoadingStatus(string currentLoadingPath)  
{  
    var loadState = ResourceLoader.LoadThreadedGetStatus(currentLoadingPath, progress);  
    switch (loadState)  
    {        
		case ResourceLoader.ThreadLoadStatus.Loaded:  
			// 完成了加载	
            break;  
        case ResourceLoader.ThreadLoadStatus.InvalidResource:  
            // 加载资源无效
            break;  
        case ResourceLoader.ThreadLoadStatus.Failed:  
            // 加载资源失败
            break;  
        case ResourceLoader.ThreadLoadStatus.InProgress:  
            // 资源在加载中
            break;  
    }  
}
```

loading 进度的逻辑就通过 progress 传递给 loading scene 即可。