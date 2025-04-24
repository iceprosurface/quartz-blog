---
title: 来试试用 react 的写法写 vue
date: 2025-04-24T12:39:19+08:00
updated: 2025-04-24T13:46:59+08:00
permalink: /code/front-end/try-use-vueireact/
tags:
  - 前端
ccby: true
draft: false
comments: true
no-rss: false
---
# 前言

我在 vue2 里面用 react 的写法写了很久的 vue，现在想想有没有机会在 vue3 里面复刻一下，于是试了试，确实可以，经过一些魔法和限制，我们可以在 vue 里面**享受到和 react 一样优秀的 typescript 体验**，并且有着 vue 保底的性能优势。

这种写法**最大的优势**在于：

+ 编译足够简单，你可以选用**任意支持 jsx 构建的编译器**，比如 swc、esbuild、tsc 等等
+ 类型系统足够简单
+ 概念简单清晰
+ 编写的代码是完全的 typescript，没有任何编译器魔法

劣势在于：

+ 性能，你无法使用任何 vue-compiler 带来的优化，如果具有强烈性能要求的场景，需要你手工优化
+ 屏蔽了绝大部分 vue sfc 的语法糖，你只能使用完全符合 typescript 中定义的语法

项目地址位于： [https://github.com/iceprosurface/vueireact](https://github.com/iceprosurface/vueireact) ，喜欢这个项目的话可以帮忙点个 star ～

如果你只是希望体验一下功能的话可以直接前往 [REPL](https://vueireact-repl.vercel.app/) 体验， REPL 尚未支持样式，你可以选择使用 unocss 代替（以内置，使用 class 提供支持）。

# 安装

如果是一个全新的项目，那么你可以使用 vite 默认的 vue 配置，随后使用 npm 安装即可：

```bash
npm install @vueireact/core
```

下面你只需要简单配置一下 tsconfig 即可使用：

```json
{ 
  "compilerOptions": { 
    "jsx": "react-jsx", 
    "jsxImportSource": "@vueireact/core" 
  }
}
```

随后你可以选择移除 vue plugin，因为这个系统是基于 runtime 实现的，并不需要 vue compiler

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [], // 从这里移除 vue()
})
```



# 使用 & 概念

## 如何声明一个组件

在 vueireact 中，我们的组件只包含两个组成部分，函数的 **setup 声明区域**和 **返回值 render function** ：


```ts
function App (
  // 这里是 props
  props,
  // context 目前只支持了 expose
  context
) {
  // 相当于 setup

  // 这里返回的 render
  return () => ...
}

// 如果需要将组件暴露给 vue 体系使用，那么你需要使用 toVue 或是 toVues
const components = toVues({
  HelloWorld
})
// 或是这样
const HelloWorld = toVue(HelloWorld)
```

我们以 vue 的 hello world 为例子：

```tsx
import { ref } from 'vue'
function HelloWorld () {
  const message = ref('Hello World!')
  return () => <h1>{ message.value }</h1>
}

function App() {
  return () => <HelloWrold />
}
```

这样就完成了一个 hello world 的组件声明和使用了。

## 一个更加进阶一点的例子

下面我们举一个更加进阶一点的例子，比如一个带插槽渲染的泛型组件：

```tsx
import { ref } from 'vue'
import { toVue } from '@vueireact/core'
// 你可以像正常的函数一样，随意的声明泛型
function GenericComponent<T>(props: {
  list: T[]
  onListChange: (list: T[]) => void
  // 你可以声明具名插槽要求传入的类型匹配你的要求
  children: {
    item: (item: T, index: number) => JSX.Element;
  }
}) {
  return () => (
    <div>
      <h1>{
        props.list.map((item, index) => (props.children.item(item, index)))
      }</h1>
    </div>
  )
}

function App() {
  const list = ref([1, 2, 3]);
  function addOneToListItem(index: number) {
    const current = list.value[index]
    list.value.splice(index, 1, current + 1)

  }
  function addItem() {
    list.value.push(list.value.length + 1)
  }
  return () => (
    <div>
      {/* 这里组件会自动识别泛型，并约束，如果需要手工标注则可以这样写： <GenericComponent<string> */}
      <GenericComponent
        list={list.value}
        onListChange={(v) => list.value = v}
      >
        {
          {
            item: (item, index) => <div key={`item` + index} onClick={() => addOneToListItem(index)}>{item}</div>
          }
        }
      </GenericComponent>
      <button onClick={addItem}>Add</button>
    </div>
  )
}
```

## ref

调用组件方法可以通过 `defineExpose`  以及 `useRef` 配合来使用，他们是强类型匹配的，可以有效减少错误。

```tsx
import { toVue, defineExpose, useRef } from '@vueireact/core'
function RefComponent(props: {},
  ctx: {
    // 使用 expose 定义会存在哪些方法
    expose: {
      refresh: () => void
    }
  }
) {
  defineExpose(ctx, {
    // 定义需要暴露的方法，不建议对外暴露属性，如果需要暴露的应该使用 getFunction 或将依赖倒置到顶层
    // defineExpose 内部使用 expose 来对外暴露属性，其效果和 vue 的 expose 完全一致，此方法仅为语法糖
    refresh: () => alert('ctx')
  })
  return () => (<div/>)
}

function App() {
  const refComponent = useRef(RefComponent)
  function refresh() {
    refComponent.value?.refresh();
    // 点击后会 alert 
  }
  return () => (
    <div>
      <RefComponent ref={refComponent}></RefComponent>
      <button onClick={refresh} >refresh</button>
    </div>
  )
}

export default toVue(App)
```


# 结语

在 vue 中使用 react 的写法是完全可行的，至少我在 vue2 中使用并上线了超过 20万行代码，但是 vue2 版本的实现方式和 vue3 版本有比较大差异，vue3 版本的代码尚未经过检验，请谨慎使用。

其他功能可以查看 [官方文档](https://vueireact-docs.vercel.app/zh/guide/getting-started.html)
