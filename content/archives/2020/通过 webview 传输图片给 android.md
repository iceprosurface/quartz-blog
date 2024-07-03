---
title: 通过 webview 传输图片给 android
date: 2020-05-05T18:35:16+08:00
tags:
  - javascript
  - android
comments: true
permalink: /2020/05/05/2020/pass-image-to-android/
updated: 2024-07-03T14:55:02+08:00
ccby: true
---

## 序

此文承接上一篇文章，主要把后续传输图片的部分介绍一下。

其实传输图片除了直接注入 js 还有一个方案是通过 拦截 url 实现。

但是这既不灵活也不优雅，具体怎么实现在此就不多赘述了。

惯例，我不太喜欢写 java 代码，还是继续 kt 把，反正语法就一丢丢差别

## 安卓端代码

### 权限

由于 安卓 q 的权限变更，如果你是老老实实使用正常的权限的话，理论上不需要额外申请相册的写入权限，此外相册的写入权限只是为了方便图片是否写入成功，写 cache 目录是同理的。

### 相册保存

首先先非常简单的把写相册功能实现一下：

```kotlin
// 这里不使用复杂的方案了，直接 replace ，理论上是需要通过正则提取的
val buffer = Base64.decode(base64.replace("data:image/png;base64", ""), Base64.DEFAULT)

val bitmap = BitmapFactory.decodeByteArray(buffer, 0, buffer.size)
// 构建 query
val contentValue = ContentValues().apply {
    // 这里可以改名字的，我就用时间代替了 
    put(MediaStore.MediaColumns.DISPLAY_NAME, System.currentTimeMillis().toString())
    put(MediaStore.MediaColumns.MIME_TYPE, "image/png")
    put(MediaStore.MediaColumns.RELATIVE_PATH,  Environment.DIRECTORY_PICTURES)
}
val resolver = this.contentResolver
val contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
// 这两是为了出错的时候会正常关闭流
var stream: OutputStream? = null
var uri: Uri? = null
try {
    uri = resolver.insert(contentUri, contentValue)
        ?: throw IOException("fail to create record")
    stream = resolver.openOutputStream(uri) ?: throw IOException("fail to get output stream");
    if (!bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)) {
        throw IOException("fail to save bitmap image");
    }
} catch (e: IOException) {
    // 如果 uri 生成了记得一定要删除 
    if (uri != null) {
        resolver.delete(uri, null, null);
    }
    throw e;
} finally {
    // 如果 stream 存在一定要记得关闭流
    stream?.close()
}
```

### 从js端获取 base64 代码
然后没什么难度的传递参数：

```kotlin
this@MainActivity.saveFileIntoStorage(base64)
val alertDialog = AlertDialog.Builder(this@MainActivity)
alertDialog.setTitle("系统提示")
    .setMessage("js传图成功")
    .create()
alertDialog.show()
```

## web 端

我们把代码整体修改一下，如下所示：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <button id="btn">click</button>
    <script>
      function download(url) {
        // 这里用了 fetch api 其他的可能需要做一个转换
        // 也很简单通过 xhr 获取后 设置 xhr.responseType = "blob" 即可
        // content 直接是 blob 的
        // 如果实在不行可以用 canvas toBlob 解决，都不难
        return fetch(url).then(function (response) {
          return response.blob();
        });
      }
      document.getElementById("btn").addEventListener("click",  () => {
        let url = "./test.png";
        download(url)
          .then(
            (blob) =>
              new Promise( (resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                // 转换成 base64 
                reader.readAsDataURL(blob);
              })
          )
          .then( (base64) => {
            window.webviewTest.onJsCallback(base64);
          });
      });
    </script>
  </body>
</html>

```

## 效果

然后看一下效果， 也 ok ，没啥问题。

<video src="https://cdn.iceprosurface.com/upload/md/video/2020-05-05-10-30-45.mp4" controls />

## 后记

我记得之前听我一个做安卓的同学说 安卓 那边是可以直接用 blob 的，但是我找了一圈，委实并未找到相关的 api ，即使相似的也只有 sql.blob 这东西感觉也不像，那还是老老实实用 base 64折腾把。

相比较 拦截 url ，这里传输的图片要大很多。

实测是 大约1.5M以下的图片通过地址栏传输是没啥问题的，而函数传输在 10M 以内实测是没有什么问题。

至于再大的图片，您就老老实实挂一个 http 本地服务，用 tcp 上传得了（大家都省事儿），要知道前端这个速度转换一个 10M 的图片少说4秒起步，在走各种管线，跑安卓在转换 走 fs，着实慢得无法接受。

在虚拟机上 10M 的图片需要花费约 8 秒的时间来传输，如果使用 jpg 压缩后（85%质量）直接走 http可比这快多了。 