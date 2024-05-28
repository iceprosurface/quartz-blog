---
title: 如何用 csharp 阻止 windows  电脑休眠
date: 2024-04-17T17:34:12+08:00
updated: 2024-05-12T17:34:12+08:00
permalink: /code/how-prevent-windows-sleep/
tags:
  - csharp
ccby: false
---
之前我弟问了我一个问题有办法完全阻止电脑休眠么（在没有办法操作控制面板的情况下）。

这是一个奇怪的需求，不过目前应该是可以做到了，用 c# 调用 windows 给出的 dll 即可解决这个问题：

```csharp
using System.Runtime.InteropServices;  
  
namespace PowerUtilities;  
  
public static class KeepAlive  
{  
    [Flags]  
    public enum EXECUTION_STATE : uint  
    {  
        ES_AWAYMODE_REQUIRED = 0x00000040,  
        ES_CONTINUOUS = 0x80000000,  
        ES_DISPLAY_REQUIRED = 0x00000002,  
        ES_SYSTEM_REQUIRED = 0x00000001  
        // 官方文档已经不建议使用此 flag  
        // ES_USER_PRESENT = 0x00000004    
	}  
    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]  
    static extern uint SetThreadExecutionState(EXECUTION_STATE esFlags);  
  
    private static AutoResetEvent _event = new AutoResetEvent(false);  
  
    public static void PreventPowerSave()  
    {        (new TaskFactory()).StartNew(() =>  
            {  
                SetThreadExecutionState(  
                    EXECUTION_STATE.ES_CONTINUOUS  
                    | EXECUTION_STATE.ES_DISPLAY_REQUIRED  
                    | EXECUTION_STATE.ES_SYSTEM_REQUIRED);  
                _event.WaitOne();  
  
            },            TaskCreationOptions.LongRunning);  
    }  
    public static void Shutdown()  
    {        _event.Set();  
    }}
```

然后配合 wpf 或者 maui 随便写个界面即可。