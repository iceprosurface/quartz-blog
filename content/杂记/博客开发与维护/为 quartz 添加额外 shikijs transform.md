---
title: 为 quartz 添加额外 shikijs transform
date: 2024-09-04T13:35:27+08:00
updated: 2024-09-04T14:24:39+08:00
permalink: /blog/quartz-shikijs-transform/
tags: 
ccby: true
draft: false
comments: true
no-rss: false
---
最近对博客的代码代码块进行整理，不论是较为陈旧的代码，还是新的都需要定期维护的，里面有写代码的格式上并不便于阅读。

所以这里查阅了 [官方文档](https://quartz.jzhao.xyz/features/syntax-highlighting)。

从官方文档来看支持的种类是很多的, 除了 quartz 官方支持的以外，一些 shikijs 支持的子 transform 是需要自己添加的，所以本文记录一下如何添加的，添加后的效果是什么样子的.

# 代码修改

代码方面只需要修改2个文件即可。

```ts title="quartz/plugins/transformers/syntax.ts"
import {
  transformerNotationDiff,// [!code ++]
  transformerNotationWordHighlight,// [!code ++]
  transformerNotationFocus,// [!code ++]
  transformerNotationErrorLevel,// [!code ++]
} from '@shikijs/transformers';
// ...
export const SyntaxHighlighting: QuartzTransformerPlugin<Options> = (
  userOpts?: Partial<Options>,
) => {
  const opts: Partial<CodeOptions> = {
    ...defaultOptions,
    ...userOpts,
    transformers: [// [!code ++]
      transformerNotationDiff(),// [!code ++]
      transformerNotationWordHighlight(),// [!code ++]
      transformerNotationFocus(),// [!code ++]
      transformerNotationErrorLevel(),// [!code ++]
    ]// [!code ++]
  }

  return {
    name: "SyntaxHighlighting",
    htmlPlugins() {
      return [[rehypePrettyCode, opts]]
    },
  }
}
```

随后在新增一个 sass 文件即可，这里写的比较粗糙，没有整理变量。

```scss title="quartz/styles/syntax.scss"
pre.has-diff {
  .diff.add {
    background-color: rgba(16, 185, 129, .14);
    &::before {
      content: "+";
      color: #18794e;
    }
  }
  .diff.remove {
    background-color: rgba(244, 63, 94, .14);
    opacity: .7;
    &::before {
      content: "-";
      color: #b34e52;
    }
  }
}
pre {
  .highlighted-word {
    background-color: #f6f6f7;
    border: 1px solid #c2c2c4;
    padding: 1px 3px;
    margin: -1px -3px;
    border-radius: 4px;
  }
  code .highlighted.error {
    background-color: rgba(244, 63, 94, .14);
  }
  code .highlighted.warning {
    background-color: rgba(234, 179, 8, .14);
  }
}


pre.has-focused [data-line]:not(.focused) {
  filter: blur(.095rem);
  opacity: .4;
  transition: filter .35s,opacity .35s
}

pre.has-focused [data-line]:not(.focused) {
  opacity: .7;
  transition: filter .35s,opacity .35s
}

pre:hover.has-focused [data-line]:not(.focused) {
  filter: blur(0);
  opacity: 1
}
```

# 试试效果
# 文字高亮

顶部支持

```js /useState/
const [age, setAge] = useState(50);
const [name, setName] = useState('Taylor');
```

使用 `!code word` 支持

```ts
// [!code word:Hello]
const message = 'Hello World'
console.log(message) // prints Hello World
```

## add 和 remove

```ts
const add // [!code ++]
const delete // [!code --]
```

## 高亮代码

使用 `{number}` 方式高亮

```ts {1,3}
const a = 1
const b = 2
const c = 3
```

使用 `// [!code highlight]`


```ts
const a = 1
const b = 2 // [!code highlight]
const c = 3
```

## focus 功能

```ts
const a = 1
const b = 2 // [!code focus]
const c = 3
const c = 3
const b = 2 // [!code focus]
const a = 1
```

## 颜色标记

```ts
console.log('No errors or warnings')
console.error('Error') // [!code error]
console.warn('Warning') // [!code warning]
```

