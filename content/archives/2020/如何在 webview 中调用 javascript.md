---
title: 如何在 webview 中调用 javascript
date: 2020-05-04T19:19:16+08:00
tags:
  - javascript
  - android
comments: true
permalink: /2020/05/04/2020/call-js-for-android/
updated: 2024-07-03T14:54:58+08:00
ccby: true
---
## 序

最近我同事接了一个项目，就是需要传一个图片给游戏的 webview，考虑到服务端传输又没有账号登陆的原因，所以还是本地的好（喂喂喂！本来就该本地传输啊！！）

所以这里写了一个简单的 demo 来完成上述代码。

<!-- more -->

首先这个问题抽象一下，简单得讲就是需要让 android webview 能够响应 js 代码，并接受 js 的传参数，那这很简单，我们写个 demo 吧。

## 安卓端设置

### 添加网络权限

这里首先要创建一个空项目，这个很简单，跟着 IDE 点就行，随后在 gradle 安装完依赖以后，找到文件 `src/main/AndroidManifest.xml`, 并修改为如下代码（主要添加了）：

> `<uses-permission android:name="android.permission.INTERNET" />` 这个代码申请了网络权限

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
          package="com.example.test_app">

    <application
            android:allowBackup="true"
            android:icon="@mipmap/ic_launcher"
            android:label="@string/app_name"
            android:roundIcon="@mipmap/ic_launcher_round"
            android:supportsRtl="true"
            android:usesCleartextTraffic="true"
            android:theme="@style/AppTheme">
        
        <activity
                android:name=".MainActivity"
                android:label="@string/app_name"
                android:theme="@style/AppTheme.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>

                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
    <uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

> 注意 如果你和我一样是本地测试那么 usesCleartextTraffic 这条是可以开启的，如果是线上环境请尽可能的去掉，https 更为安全。

### 添加 webview

在可视化界面中添加 webview 并设置 id,文件路径为 `layout/activity_main.xml`：

```xml
<android.webkit.WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>
```

### 添加 webview 相关的交互代码

随后前往你所设置的软件目录添加后续的交互代码`src/main/java/com/example/test_app/MainActivity.kt`

这边我用的是 kotlin 如果是 java 路径是类似的

随后查询 webview 并注入代码：

> 这边就写一下 kt 代码，java 的不多赘述了


```kotlin
super.onCreate(savedInstanceState)
setContentView(R.layout.activity_main)
val webview = findViewById<WebView>(R.id.webview)
webview.loadUrl("http://192.168.1.101:5500")
val webviewSetting = webview.settings
webviewSetting.javaScriptEnabled = true
webview.addJavascriptInterface(object: JsCallbackFn {
    @JavascriptInterface
    override fun onJsCallback(text: String) {
        val alertDialog = AlertDialog.Builder(this@MainActivity)
        alertDialog.setTitle("系统提示")
            .setMessage("js传数值${text}")
            .create()
        alertDialog.show()
    }
}, "webviewTest")
```

> ⚠ 如果SDK(targetSdkVersion) 设置为 17 或更高，则必须为注入的对象的方法添加 @JavascriptInterface 注释并 设置为 public。如果未提供注释，那么在 Android 4.2 以上将无法正确访问。️

## html 代码

随后我们需要本地起一个服务来显示 http ，这里就用 vscode 的插件好了（简单快捷一点，反正只是演示）

把如下代码放置入任意文件夹，并使用 vscode 开启监控：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <input id="input">
    <button id="btn">click</button>
    <script>
        document.getElementById('btn').addEventListener('click', function () {
            var value = document.getElementById('input').value || '1';
            window.webviewTest.onJsCallback(value);
        })
    </script>
</body>
</html>
```

随后你就可以开始测试了，随便试一下，嗯传指什么的是没问题的了！

<video src="https://cdn.iceprosurface.com/upload/md/video/2020-05-04-14-37-20.mp4" controls />


## 更简单的方法？

那么除了这种注入的方式还有什么更好的方式么？

有的在不完全考虑安全性的情况下，你可以使用如下方法把整个 android 的 interface 方法直接注入进去，这样可以非常方便的让 js 调用这些方法：

```kotlin
val webView: WebView = findViewById(R.id.webview)
webView.addJavascriptInterface(WebAppInterface(this), "Android")
```

常见的:

 - dialog
 - toast 
 
 等等等






