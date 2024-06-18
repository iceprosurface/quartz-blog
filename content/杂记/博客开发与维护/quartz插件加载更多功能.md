---
title: quartz插件加载更多功能
date: 2024-06-09T09:30:19+08:00
updated: 2024-06-18T14:44:18+08:00
permalink: /blog/dev/quartz-plugin-script/
tags: 
ccby: false
draft: false
comments: true
---
# 前言
 
 quartz 默认提供的打包功能其实问题不少，第一对于样式没有很好的处理，第二对于 script 都是打包到一个地方，这样会让主脚本的大小膨胀的非常厉害，这是不好的。

所以首先对项目进行一些改造来实现加载外部的功能脚本。

# 项目改造

由于本身我一开始使用的就是 pnpm 修改为 pnpm workspace 是容易的：

添加一个 pnpm-workspace.yaml

```yaml
packages:
 - 'packages/**'
```

随后添加目录 `packages/quartz-xxx-plugin` 即可。

## 子项目构建

子项目直接使用 vite 构建即可，关于 vite 的配置这里不多赘述。

随后在通过 vite 构建 umd 包后，需要将 vite 构建的 umd 包和对应的 css 文件拷贝到 static 目录(`quartz/static`) 下，这样就完成了第一步。

## 在 head 中添加脚本配置

我预期会使用这样一个脚本去加载 js 脚本信息：

```typescript
export function getJsByMeta(name: string) {
  const pluginPath = document.querySelector(`meta[data-js][name="${name}"]`)?.getAttribute('content');
  if (!pluginPath) {
    throw new Error('plugin path not found');
  }
  return pluginPath;
}
```

为什么要这样做原因在于 [quartz 缓存刷新问题](../quartz%20缓存刷新问题.md) 中提到的缓存问题，我们还需要对前文中的脚本添加对于 meta 的更新：

```javascript
 $('[data-js]').each((index, element) => {
      const src = $(element).attr('content');
      if (src) {
        const hash = resources.get(resolveLink(src, file.path));
        if (hash) {
          $(element).attr('content', src.replace(/\.js$/, `-${hash}.js`));
        }
      }
    })
```

随后就可以去 head 文件中添加配置了：

```typescript
<meta name="excalidraw-plugin" spa-preserve data-js content="/static/quartz-excalidraw-plugin.js" />
```

## 举个 Excalidraw 的例子
由于我们加载的 umd 包，所以最终代码会被注入到 window 上，目前声明还没做 type 导出，预期后面是会使用 package 导入的，现在先手工声明一下：

```typescript
// Excalidraw
type ExcalidrawElement = any;
type ExcalidrawProps = {
  width?: string;
  height?: string;
};
declare global {
  interface Window {
    QuartzExcalidrawPlugin: {
      mountApp(element: HTMLElement, initialData: readonly ExcalidrawElement[] | null, options: ExcalidrawProps): void
      decodeData(data: string): ExcalidrawElement[];
    };
  }
}
async function loadExcalidraw(element: HTMLElement) {
  const data = element.getAttribute('data-excalidraw') ?? '';
  element.removeAttribute('data-excalidraw');
  const markdown = await fetch(data).then((res) => res.text());
  window.QuartzExcalidrawPlugin.mountApp(element as HTMLElement, window.QuartzExcalidrawPlugin.decodeData(markdown), {});
}
export async function initExcalidraw() {
  const pluginPath = getJsByMeta('excalidraw-plugin');
  await loadScript(pluginPath, false);
  const elements = document.querySelectorAll('[data-excalidraw]');
  if (!elements || !elements.length) {
    return;
  }
  elements.forEach((element) => {
    loadExcalidraw(element as HTMLElement);
  });
}
```