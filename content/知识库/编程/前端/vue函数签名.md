---
title: vue 函数签名（在 vue2中实现 vue3 函数签名）
date: 2024-07-29T18:16:36+08:00
updated: 2024-09-04T13:08:51+08:00
permalink: /code/front-end/function-signature/
tags:
  - vue
ccby: true
draft: false
comments: true
no-rss: false
---

> [!danger] 前提警告
> 由于我们是 *重逻辑和流程* 的 B 端业务，所以不存在 C 端非常大面积的交互，渲染的情况。
> 
> 而 B 端性能成本的最高的表格和表单组件本身就是需要**严格定向优化**的，所以事实上对于性能而言，我们的要求并没有这么高。如果想参考下面的方案，请`思考清楚你使用的场景`。


# 沉痛代价

最近几周我都在团队里面推进关于 vue2 中实现类似于 vue3 function-signature 的工作 [^1]，最近也写了一段时间的 solid-js 不得不说 solid-js 总体的体验是 ***非常流畅的*** ，回过头看看 vue2，如果 fucntion-signature 正式开始使用了，那么会是 <u>一个解决的机会</u> 甚至某些编写体验上会更好（性能当然差中差了）。

在此前的[吐槽](再谈谈%20vue2%20和%20vue3.md) 中, 我痛骂了 vue sfc 的痛点，而我个人认为 vue 所有的 **不流畅体验都来自于 vue sfc**，而性能基准这块，在*绝大部分情况下*是可以做出 **一些牺牲的** [^2]。

首先我们来看一下 vue 官方提供的 function-signature 方案：

```ts
import { ref, h } from 'vue'

const Comp = defineComponent(
  (props) => {
    // 就像在 <script setup> 中一样使用组合式 API
    const count = ref(0)

    return () => {
      // 渲染函数或 JSX
      return h('div', count.value)
    }
  },
  // 其他选项，例如声明 props 和 emits。
  {
    props: {
      /* ... */
    }
  }
)
```

vue 官方的 function-signature 方案同旧的方案并无二致，唯一的区别是将 setup 提升到了 第一个参数，从[源码](https://github.com/vuejs/core/blob/af60e3560c84e44136f950fc3d0e39b576098c6c/packages/runtime-core/src/apiDefineComponent.ts#L301)[^3]看就是简单的做了一个分发，然后利用函数重载实现的：

```ts 
// implementation, close to no-op
/*! #__NO_SIDE_EFFECTS__ */
export function defineComponent(
  options: unknown,
  extraOptions?: ComponentOptions,
) {
  return isFunction(options)
    ? // #8326: extend call and options.name access are considered side-effects
      // by Rollup, so we have to wrap it in a pure-annotated IIFE.
      /*#__PURE__*/ (() =>
        extend({ name: options.name }, extraOptions, { setup: options }))()
    : options
}
```

[函数重载](https://github.com/vuejs/core/blob/af60e3560c84e44136f950fc3d0e39b576098c6c/packages/runtime-core/src/apiDefineComponent.ts#L123) 相关代码

```ts
export function defineComponent<
  Props extends Record<string, any>,
  E extends EmitsOptions = {},
  EE extends string = string,
  S extends SlotsType = {},
>(
  setup: (
    props: Props,
    ctx: SetupContext<E, S>,
  ) => RenderFunction | Promise<RenderFunction>,
  options?: Pick<ComponentOptions, 'name' | 'inheritAttrs'> & {
    props?: (keyof Props)[]
    emits?: E | EE[]
    slots?: S
  },
): DefineSetupFnComponent<Props, E, S>
export function defineComponent<
  Props extends Record<string, any>,
  E extends EmitsOptions = {},
  EE extends string = string,
  S extends SlotsType = {},
>(
  setup: (
    props: Props,
    ctx: SetupContext<E, S>,
  ) => RenderFunction | Promise<RenderFunction>,
  options?: Pick<ComponentOptions, 'name' | 'inheritAttrs'> & {
    props?: ComponentObjectPropsOptions<Props>
    emits?: E | EE[]
    slots?: S
  },
): DefineSetupFnComponent<Props, E, S>
```

可以看出，逻辑是比较简单的，就是单纯的重载了一下类型，然后做了一个合并和提取泛型的操作。

但是可见的是，整个代码在编写上还是有很不方便的地方，譬如 option 相关的 api 都 **必须** 要通过 ***额外*** 参数声明，特别是 ***props 无可省略***  [^1]。

> [!quote] vue-official
> 在将来，我们计划提供一个 Babel 插件，自动推断并注入运行时 props (就像在 SFC 中的 `defineProps` 一样)，以便省略运行时 props 的声明。

 官方团队声称会提供一个 babel 插件来提供运行时注入 props， 对此我持 `极度悲观` 的态度，原因很简单，目前的 setup 的 defineProps 就仍然有大量的问题，譬如类型合并等等操作都是无法使用的。

就如同官方团队[^5]说的：

> [!quote] vue-official
> 这个限制已经在 3.3 版本中解决。最新版本的 Vue 支持在类型参数的位置引用导入的和有限的复杂类型。

是的多数情况下下面这个说法的确不会让业务开发碰壁：

> [!quote] vue-official
> 然而，由于类型到运行时的转换仍然基于 AST，因此并不支持使用需要实际类型分析的复杂类型，例如条件类型等。你可以在单个 prop 的类型上使用条件类型，但不能对整个 props 对象使用。

但是说实话，对于 B 业务而言，复杂的组合类型判断在复杂的业务场景下，利用 **少量的体操** 来减少复杂校验和联动逻辑，排除非必要逻辑、屏蔽低级错误上是必不可少的，而这通常都是是通过组合泛型、条件泛型来解决的。显然 vue 目前提供的方案是 <u>一个可行之举，但是还不够好</u>。

另外就是基于 ast 实现的类型 props 提取方案，这个 <u>限制太大</u> 了，我***不是很看好这个方案***。

# 在 vue2 中实现 vue3 函数签名

## render 函数 -- runtime 性能并不是瓶颈

由于我们所有的项目都是用 esbuild 来构建，并且，整个项目没有 **主动** 使用 babel 来编译代码，所以在之前我们就利用 esbuild inject code 的方式实现了 vue tsx 和 react tsx 的对齐，对于 runtime 性能在 select row 上损失约为 33.8%, 是一个 <u>比较高昂的代价</u>。

我们可以看 vue3 的数据（使用了 v-memo，不使用的话大致在 1.63，折合约 6.35 ）大致如下：

![vue3|400](https://cdn.iceprosurface.com/upload/md/202407301318135.png)

vue2 相关的渲染性能总体是接近的

![数据表格|400](https://cdn.iceprosurface.com/upload/md/202407301259984.png)


> 图表中的数据是使用 [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) 在 M1 pro 上跑的，其中 vue2 部份都按照 vue3 版本的代码，剔除 v-memo 后实现。

但是不得不提一句，此前我们已经在大表格上、大表单应用过 tsx 方案了，实际结果就是 —— 

> [!failure] 大差不差
>如果 tsx 方案卡、那么即使换成 vue template ，依然卡，即使手工优化也只是勉强一用，这种场景下即使你换成 vue3 然后用 v-memo，也仅仅只是卡的好一点，并没有本质差别。可见这样的瓶颈本身不在框架和语法糖的问题上，更多的是写法上的问题了，需要换一种实现。

限制于篇幅这里不会具体介绍 render 函数实现方案，后续 *可能* 会单独记录一篇。

## 实现 vue.FC

那么在这种情况下，我们有了一个 vue.FC 的可行方案了，我们需要知道的是：

>ts 是如何理解你定义的组件有哪些参数的。

换而言之首先需要了解 vue template 和 tsx 是怎么工作的。

虽然没有看过 vue-template 的源码，但是通过 volar 可以推测 vue 对于 template 的解析上应该是有参考 typescript 对 tsx 的处理的，而 typescript 对于 tsx 的处理可以参考 [官方的文档](https://www.typescriptlang.org/docs/handbook/jsx.html)。

本质上是利用 `ElementClass` 和 `ElementAttributesProperty` 声明了 tsx 实例需要一个什么样子的结构。

譬如 vue 就要求有 `$props`

```ts
interface ElementClass {  
  $props: {}  
}  
interface ElementAttributesProperty {  
  $props: {}  
}
```

对此我们可以基于这个思路大幅度简化 vue 的类型声明，譬如我们可以像下面这样声明一个 jsx 专用的类型：

```typescript
export type DefineJSX<Props> = {
  new (...args: any[]): {
    $props: Omit<Props, 'children'>;
    $children: Props extends { children: infer U } ? U : undefined;
  };
};
```


下面我们就可以想办法实现一个 `vue.FC` 组件了，如下所示：

```typescript
export const SIMPLE_VNODE_FLAG = 'simple-vnode';
function snakeToCamel(str: string) {
  return str.replace(SNAKE_REG, function (v) {
    return v[1].toUpperCase();
  });
}
function FC<Props extends Record<string, any>>(
  fc: (
    props: ComputedRef<
      Props & {
        children?: VNode[];
      }
    >,
  ) => RenderFunction,
  {
    name,
  }: {
    name?: string;
  } = {},
) {
  return {
    name: name ?? fc.name,
    [SIMPLE_VNODE_FLAG]: true,
    inheritAttrs: false,
    setup() {
      const vm = getCurrentInstance()?.proxy;
      const get$attrs = () => {
        const attrs = vm?.$attrs ?? {};
        return Object.keys(attrs).reduce((acc, key) => {
          // 将 $attrs 自动转换为驼峰，以适配 vue 的 props
          acc[snakeToCamel(key)] = attrs[key];
          return acc;
        }, {} as Record<string, any>);
      };
      const getChildren = () => vm?.$slots.default;
      const props = computed(() => ({ ...get$attrs(), children: getChildren() }));
      return fc(props as any);
    },
  } as unknown as DefineJSX<Props>;
}
```

这样我们就实现了一个 vue.FC 组件，这样的组件肉眼可见的是性能会有很大的损失，第一个 computed 是一次性包裹了整个 attrs，这样如果下面的组件无法正确处理[^4]，那么性能损失应当是比较大的。

> [!note]  提示
> SIMPLE_VNODE_FLAG 这个属性会在后文提及，是用来标记，做渲染优化的

### 编写优势

这样的 vue.FC 在编写代码上是有比较大的优势的

#### 泛型

vue.FC 组件是可以正确识别泛型并使用的，和 react 组件一样：

```typescript
const D = vue.FC(<T extends string | number>(props: ComputedRef<{ list: T[]; renderItem: (x: T) => void }>) => {
  return () => <div></div>;
});

function C() {
  // 自动类型推导
  return <D list={[1, 2, '3']} renderItem={(item) => item} />;
}
function C2() {
  // 需要手工约束类型的情况下
  return <D<number> list={[1, 2, '3']} renderItem={(item) => item} />;
}
```

譬如 renderItem 可以正确的推导类型，这个是一个非常巨大的进步，除此外，泛型组件的编写也变得尤为灵活

![](https://cdn.iceprosurface.com/upload/md/202407301139249.png)

他可以自动推导出 item 的类型

![](https://cdn.iceprosurface.com/upload/md/202407301139250.png)

当然你可以强约束类型，譬如要求一定得是个 string 而不是默认的 string | number, 做一个类型的收窄(type narrowing)：

![](https://cdn.iceprosurface.com/upload/md/202407301318137.png)

#### 更加高效的类型补全能力

对比 volar，typescript 的 tsx 能力非常强，且性能极高，并且在函数推导上会提供更多的魔法支持

举一个现在项目里面使用的例子：

```typescript
export type SyncProps<RecordsData extends Record<string, any>> = {
  [K in keyof RecordsData]: RecordsData[K];
} & {
  [K in keyof RecordsData as GetChangeName<string & K>]?: (val: RecordsData[K]) => void;
};

type ChangeName = '__handleChange';
type GetChangeName<T extends string> = `${ChangeName}${T}`;
export function getChangeName<Name extends string>(name: Name): GetChangeName<Name> {
  return `__handleChange${name}`;
}

type ForbiddenPrefix = ChangeName;
type ExcludeForbiddenPrefix<T> = T extends `${ForbiddenPrefix}${infer R}` ? never : T;
type ExcludeKey = 'children' | 'key' | 'scopedSlots' | 'attrs' | 'class' | 'nativeOn' | 'on' | 'ref' | 'slot' | 'style';
/**
 * 类似于 v-model:name
 */
export function toSync<V, T extends string>(value: Ref<V>, name: Exclude<ExcludeForbiddenPrefix<T>, ExcludeKey>) {
  return {
    [name]: value.value,
    [getChangeName(name)]: (val: V) => (value.value = val),
  } as {
    [K in T]: K extends T ? V : (val: V) => void;
  } & {
    [K in GetChangeName<T>]?: (val: V) => void;
  };
}
```

我们利用这个方法实现了一个 toSync 的函数, 他的效果类似于 v-model:name ,利用少量的类型体操，排除了一些不必要的类型后，我们可以获得这样的编写体验：

![](https://cdn.iceprosurface.com/upload/md/202407301147703.png)

他可以提示出 props 上有的属性，比如 data 和 data2 并排除不需要的属性 `__handleChangedata`，当然你仍然无法区分 data 和 data2 ***是不是一个 sync model，但是总体已经是足够的了***。

#### 更完善的类型错误提示

对比 vue 的类型提示，vue.FC 组件无论是在 vue 文件内，还是 tsx 中提示都比 vue 要好的多，譬如必填参数 data2 ：

![](https://cdn.iceprosurface.com/upload/md/202407301147704.png)

你可以很快的找出缺少的参数有哪些，而错误的类型提示也非常易读, 不是 vue 那个一长串的推导：

![](https://cdn.iceprosurface.com/upload/md/202407301148140.png)

而这一类型带来的优势在 vue 中也是可以使用的：

![](https://cdn.iceprosurface.com/upload/md/202407301248542.png)

缺少组件需要的属性：

![](https://cdn.iceprosurface.com/upload/md/202407301248543.png)

而至少在 vue2 中你是没有办法正确提示出参数缺少的。

### 劣势

虽然在编写上有很大的优势，但是 **vue.FC** 在性能上至少是灾难级的，在更新操作上，这一组件会和 template 组件拉开巨大的差距：

| 节点数量   | Vue template | Vue tsx with FC | 差距   |
| ------ | ------------ | --------------- | ---- |
| 10000  | 57.9～66.8    | 89.7~99.8       | 约34% |
| 100000 | 600~800      | 880-1100        | 约40% |

好在我还有一些优化手段，由于新版写法无需做解析，所以 tsx 可以优化为定向渲染。使用定向渲染方案情况下要比 tsx 性能要强一点，这情况下反倒是弥补了原先 tsx 的性能劣势了，非常有意思的结果：

| 节点数量   | Vue template | Vue tsx with FC | 差距    |
| ------ | ------------ | --------------- | ----- |
| 10000  | 57.9～66.8    | 69.2~72.6       | 约 12% |
| 100000 | 600~800      | 790-830         | 约 13% |

方式也很简单，我们的 jsx， render 是这样实现的：

```typescript
import { h } from 'vue';
import { buildProps, SIMPLE_VNODE_FLAG } from './buildProps';

export const jsxs = (tag: any, props: any) => {
  const vnode = renderSimpleVNode(tag, props);
  if (vnode) {
    return vnode;
  }
  const { children, ...rest } = props;
  return h(tag, buildProps(rest), children);
};
export const jsx = (tag: any, props: any) => {
  const vnode = renderSimpleVNode(tag, props);
  if (vnode) {
    return vnode;
  }
  const { children, ...rest } = props;
  return h(tag, buildProps(rest), [children]);
};


function renderSimpleVNode(tag: any, props: any = {}) {
  const { children, key, scopedSlots, ref, refInFor, ...rest } = props ?? {};

  if (tag[SIMPLE_VNODE_FLAG]) {
    return h(
      tag,
      {
        attrs: rest,
        scopedSlots,
        key,
        ref,
        refInFor,
      },
      children,
    );
  }
  return null;
}
```

利用在 component 上打上的标记 `SIMPLE_VNODE_FLAG` 来节省解析 props 的时间，来节约渲染时间，但是 computed 消耗的额外性能是没法逃掉了。

# 结语

目前在项目中，vue.FC 已经正式在开始使用了，由于 vue3 的巨大 breaking，项目还得继续在 vue2.7 上继续折腾，如果 vue.FC 碰到了问题后续在写文章总结吧。


[^1]: https://cn.vuejs.org/api/general.html#function-signature 函数签名
[^2]: 不超过 30% 的性能损失
[^3]: 分为两段，[函数重载](https://github.com/vuejs/core/blob/af60e3560c84e44136f950fc3d0e39b576098c6c/packages/runtime-core/src/apiDefineComponent.ts#L139) 和 [声明](https://github.com/vuejs/core/blob/af60e3560c84e44136f950fc3d0e39b576098c6c/packages/runtime-core/src/apiDefineComponent.ts#L301)
[^4]: 指合理使用 computed，例如将简单类型缓存起来减少不必要的更新。
[^5]: https://cn.vuejs.org/api/sfc-script-setup.html#type-only-props-emit-declarations