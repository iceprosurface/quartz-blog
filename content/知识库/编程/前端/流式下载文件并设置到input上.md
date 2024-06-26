---
title: 前端流式下载文件并设置到 input 上
date: 2024-06-26T11:03:49+08:00
updated: 2024-06-26T13:45:37+08:00
permalink: /code/web-frontend/stream-download-to-input/
tags:
  - 前端
ccby: true
draft: false
comments: true
---

## 起因

最近隔壁的有个同事突然发问，我们有个商店页面可以用来上传 apk ，他们部门内部其实是有个 npkg 平台用来上传 apk 测试、生产包的。所以提出了一个问题：

> [!question] 问题！
> 有没有办法可以实现点击上传时候打开 npkg 平台选择内容后直接把 apk 包传到商店页面

让商店页面来适配 npkg 平台是 *不现实的*，因为这块的业务 **是对外的**，<u>即使是一方的应用也不可能以这个理由提供支持</u>，但是他们提出可以考虑让运营安装 chrome 插件来 ***绕过一些安全策略***，这个想法 `非常有意思`，我认为理论上 ***应该是可行的***。

于是尝试写个 demo 试试。

## 实现

### 抽象行为

首先我们需要抽象一下行为，这个里面的步骤大致可以分为如下这几个步骤：

1. 识别 商店上传input，并在上面绘制一个触发按钮
2. 点击触发 按钮，弹出 npkg 页面
3. 在 npkg 中点击列表内容
4. 将文件添加到 input

我们分步骤来看，第一步是最容易的，无非是找一下 input 特征即可。

第二步应该是不难做的，弹出 npkg 页面可以用 window.open 来实现，然后基于窗口通讯即可，当然也可以直接使用 iframe 嵌入，然后利用 postMessage 实现，也都不难。

第三步点击列表内容需要他们自己适配一下

比较有问题的是第四步，其中有两个比较主要的问题。

+ pkg 包不会小，由于某些原因，这些游戏包的大小可能会很大，譬如可能 `达到 2G 以上`
+ 怎么样给 Input 设置 file ，并触发响应


### 过大的 pkg 包

由于是游戏 app，所以大小不可控，有的会到 2G 以上，很重要的一点是 2G 是一个分水岭，因为 chrome 对 blob 大小的限制是有规定的，具体可以前往 [源码](https://source.chromium.org/chromium/chromium/src/+/main:storage/browser/blob/blob_memory_controller.cc;l=75?q=CalculateBlobStorageLimitsImpl&ss=chromium) 查看：

```c++
// CrOS:
// * Ram -  20%
// * Disk - 50%
//   Note: The disk is the user partition, so the operating system can still
//   function if this is full.
// Android:
// * RAM -  1%
// * Disk -  6%
// Desktop:
// * Ram -  20%, or 2 GB if x64.
// * Disk - 10%
BlobStorageLimits CalculateBlobStorageLimitsImpl(
    const FilePath& storage_dir,
    bool disk_enabled,
    std::optional<uint64_t> optional_memory_size_for_testing) {
```

这里只截取了注释：一旦 blob 超过 2G 那么就无法正确的分配内存了。

不过我们可以考虑不把 blob 放置到内存里面，因为很简单，基于 file 的 blob 的最大可以用 disk 的 10% 这个是一个非常巨大的数字。

### 写一个 demo

下面我们需要写一个 demo 实现一下。

图快这里用 vscode 的 [live-server插件](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

随后使用如下命令创建一个超大的文件：

```bash
# 创建一个 10g 的文件
dd if=/dev/zero of=10g.dat bs=1M count=10240
```

#### 设置下载

设置下载很简单, 首先我们要获取元素的大小，然后预分配：

```typescript
const url = '/10g.dat';
// 首先获取 /download 文件大小
const response = await fetch(url);
// 获取文件名
const size = parseInt(response.headers.get('Content-Length'));
const reader = response.body.getReader();
// 建议提前关闭，节省资源
await reader.cancel();
// 创建一个文件
const newHandle = await window.showSaveFilePicker({
	suggestedName: url.split('/').pop()
});
const writableStream = await newHandle.createWritable();
// 预分配大小
await writableStream.truncate(size);
```


#### 循环下载

> [!danger] 警告
> 由于文件太大，所以不能一次性写入，需要分块写入，且不能使用同一个 fetch 请求, 因为同一个 fetch 请求也会载入到内存，突破 chrome tab 占用内存的上限


```typescript
let receivedLength = 0;
// 100MB
const chunkSize = 1024 * 1024 * 100;
while (receivedLength < size) {
	const start = receivedLength;
	// 防止超出长度
	const end = Math.min(size, start + chunkSize);
	const response = await fetch(url, {
		headers: {
			Range: `bytes=${start}-${end - 1}`
		}
	});
	const reader = response.body.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		await writableStream.write(value);
		receivedLength += value.length;
	}
	// 主动关闭读取流
	await reader.cancel()
}
// 关闭写入流
await writableStream.close();
```


#### 触发change 事件

```typescript
const file = await newHandle.getFile();
let container = new DataTransfer();
container.items.add(file);
testInput.files = container.files;
testInput.dispatchEvent(new Event('change'));
```

虽然 FileList 是不能直接修改的[^1]，因为本身 FileList 是一个 `attempt to create an unmodifiable list`[^2] 的行为，所以不能修改。

而 FileList 没有提供对外的 new 方法，所以也同样不能创建。

但是我们有 DataTransfer，他 items 是一个 FileList 所以可以用它来生成 input 需要的 files 字段，随后利用自定义事件触发 event 即可。

### 完整测试代码

完整代码使用 image 来模拟，用来模拟成功效果：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>

<body>
    <div>测试页面</div>
    <input id="testInput" type="file" />
    <button id="startSetup">开始设置</button>
    <div id="progress"></div>
    <script>
        const testInput = document.getElementById('testInput');
        testInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            alert('file changed');
            // 在页面上显示图片
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            document.body.appendChild(img);
        });
        const startSetup = document.getElementById('startSetup');
        startSetup.addEventListener('click', async function () {
            const url = '/test.jpg';
            // 首先获取 /download 文件大小
            const response = await fetch(url);
            // 获取文件名
            const size = parseInt(response.headers.get('Content-Length'));
            const reader = response.body.getReader();
            await reader.cancel();
            console.log('size', size);
            // 创建一个文件
            const newHandle = await window.showSaveFilePicker({
                suggestedName: url.split('/').pop()
            });
            const writableStream = await newHandle.createWritable();

            await writableStream.truncate(size);
            let receivedLength = 0;
            // 由于文件太大，所以不能一次性写入，需要分块写入，且不能使用同一个 fetch 请求
            const chunkSize = 1024 * 1024 * 100; // 100MB

            while (receivedLength < size) {
                const start = receivedLength;
                const end = Math.min(size, start + chunkSize);
                const response = await fetch(url, {
                    headers: {
                        Range: `bytes=${start}-${end - 1}`
                    }
                });
                const reader = response.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    await writableStream.write(value);
                    receivedLength += value.length;
                    refreshUI(receivedLength, size);
                }
                await reader.cancel()
            }
            // 关闭写入流
            await writableStream.close();
            // 设置 input file 的值，触发 change 事件
            testInput.value = '';
            const file = await newHandle.getFile();
            let container = new DataTransfer();
            container.items.add(file);
            testInput.files = container.files;
            // 触发 input 的 change 事件
            testInput.dispatchEvent(new Event('change'));
        });
        function refreshUI(receivedLength, size) {
            const progress = document.getElementById('progress');
            progress.innerText = `${receivedLength} / ${size} (${(receivedLength / size * 100).toFixed(2)}%)`;
        }
    </script>
</body>
</html>
```


[^1]: https://developer.mozilla.org/en-US/docs/Web/API/FileList
[^2]: https://stackoverflow.com/questions/74630989/why-use-domstringlist-rather-than-an-array/74641156#74641156