---
title: 基于 decorators 的 ant-design-vue 表单验证声明优化思路
tags:
  - 前端
permalink: /2022/05/19/2022/class-validator/
comments: true
date: 2022-05-19T23:58:31+08:00
updated: 2024-06-01T13:54:54+08:00
---


## 表单验证

说起表单验证，这可是一个经久不衰的话题了，不论是新型的 low code 方案还是老旧的手写方式。

表单验证已经在过去长久的实践里面获得通用的认识，所以大体上，绝大多数的表单验证，在观感上、体验上基本都是一致的。

通常而言，我们常见的都可以发现大致有这么几种表单验证方式：

+ 基于 JSON schema 的
+ 基于 js 配置的
+ 基于 class 的

而我们目前使用的 ant-design-vue（1.7.8） 的表单验证器，至少在现阶段说不上好用，勉强算是灵活有效，适应面广泛。

而 ant-design-vue 的表单验证基本是基于 async-validator 的这带来的比较大的问题就是写起来其实蛮繁琐的。

随手举个官网的例子：

```js
ruleForm: {
    pass: '',
    checkPass: '',
    age: '',
},
rules: {
    pass: [{ validator: validatePass, trigger: 'change' }],
    checkPass: [{ validator: validatePass2, trigger: 'change' }],
    age: [{ validator: checkAge, trigger: 'change' }],
},
```

最大的特点就是 rules 的声明与 form 分离，且极其不直观。

当然这也是 js 配置方式的一贯特点，很灵活，没有什么太大的劣势。

那么对于我来说，我觉得代码这个东西，主要还是人阅读的，从这个基本点出发，我还是希望稍稍的改善一下阅读体验，但是呢，并不想太过改动原本的验证逻辑。

那么实际上用 class 方式的验证就可以做到。

<!-- more -->

> [!warning] 注意：下文所有代码皆为伪代码，不保证可运行，请自行勘误、编写后使用。

## class 方式的表单验证

首先我们需要定义一下 class 方式的表单验证要怎么写。

这里其实不用自己绞尽脑汁的去想了，首先有现成的参考对象 —— spring，其次有现成的实现方案 —— [class-validator](https://github.com/typestack/class-validator)

当然要把 class-validator 接入 ant-design-vue 是比较复杂和麻烦的。所以我们可以快速的实现一个最小精简子集，借鉴思路即可。

### 模板

首先定义模板，这块我们就参考 class-validator 的方案就可以了：

```ts
@Injectable
class BasicInfoForm {
    @Info({
        name: '用户名',
        trigger: 'change'
    })
    @Required()
    @Max(10)
    @Min(5)
    @UserName()
    userName = '';
    @Int()
    @Currency()
    @Info({
        name: '支付金额',
    })
    payCount = 0;
} 

```

上面这部分代码的意思可以等价的转换为：

```js
const provideKey = Symbo()
const userNameInfo = {
    name: '用户名',
    trigger: 'change'
}
const payCountInfo = {
    name: '支付金额',
    trigger: 'change'
}
const form = {
    ruleForm: {
        userName: '',
        payCount: '',
    },
    rules: {
        userName: [
            Required(userNameInfo), 
            Max(userNameInfo),
            Min(userNameInfo),
            UserName(userNameInfo),
        ],
        payCount: [
            Int(payCountInfo),
            Currency(payCountInfo),
        ],
    },
}
useFormProvide(provideKey, form)
```

从简洁程度上来说，这个阅读效率总体是高于直接声明的，那么怎么才能比较好的实现这个语法呢？

这里就需要引入 decorators。

### decorators

decorators 是处于 [[../../知识库/编程/tc39|tc39]] Stage2 阶段的语法提案，当然这一提案已经大变更过一次，由于各个浏览器厂商和使用者都有自己的想法，所以这块可能没这么容易定下来。

并且由于目前还处于实验阶段，无论使用 babel 亦或是 typesript 你都需要单独添加对应的配置，譬如 ts 中你需要主动声明 `"experimentalDecorators": true,`。

具体 decorator 是怎么用的这里就不献丑了，我建议是直接读 [阮老师的 es6 decorator 指南](https://es6.ruanyifeng.com/#docs/decorator)，或者英语能力比较好的同学可以去阅读 ts hand book 中 [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) 一章的详细解释，印象中 ts 的实现同 es6 有微小的差异，这里大家可以自行查询校对，本文代码以 ts 的 decorator 规范为标准（typescirpt~4.5.5）。

### 思路

使用修饰器的情况下我们首先要想一下存储的数据要放哪里，decorator 的生效时机位于 对应目标 的声明时期。所以实际上我们可以变相的理解这一声明的内容是存储在 class 对应 constructor 方法的 prototype 上的，变相的是一个 静态属性。

当然事实上——绝大多数的 class 实现通常会使用一个不那么全局的变量去储存这个数据，我们这里似乎没有这个必要这样做。

那么基于这个思路的原理，上文这个 class 可以等价的翻译为：

```ts
const InjectableKey = Symbol('injectable')
const InfoKey = Symbol('infoKey')
const ValidationKey = Symbol('validationKey')
class BasicInfoForm {
    static [InjectableKey] = Symbol()
    static [InfoKey] = {
        userName: {
            name: '用户名',
            trigger: 'change'
        },
        payCount: {
            name: '支付金额',
        }
    }
    static [ValidationKey] = [
        {
            key: 'userName',
            instance: Required()
        },
        {
            key: 'userName',
            instance: Max(10)
        },
        {
            key: 'userName',
            instance: Min(5)
        },
        {
            key: 'userName',
            instance: UserName()
        },
        {
            key: 'payCount',
            instance: Int()
        },
        {
            key: 'payCount',
            instance: Currency()
        }
    ]
    userName = '';
    payCount = 0;
} 
```

有了上面这个思路以后我们很快就可以写出修饰器的方式：

```ts
const infoKey = Symbol('infoKey')
const validationKey = Symbol('validationKey')
export function getReflectValue<T>(target: any, key: symbol, initValue: T) {
  if (!Reflect.has(target, key)) {
    const value = initValue;
    Object.defineProperty(target, key, {
        // 我们不希望他可以被修改，且不能被遍历出来
        enumerable: false,
        configurable: false,
        value,
    });
    return value;
  }
  return target[key];
}
type FormPropertyInfo =  { name: string }
// 怎么设置 info
export function Info(info: FormPropertyInfo) {
  return (target: any, propertyKey: string) => {
    const map = getReflectValue(target, infoMetaKey, {});
    map[propertyKey] = info;
  };
}

type ValidationInstance = {...}
// 怎么设置 validation
export function createCustomRule(instance: ValidationInstance) {
  return function (target: any, propertyKey: string) {
    const value = getReflectValue(target, validateMetaKey, []);
    value.push({
      key: propertyKey,
      instance,
    });
  };
}
// inject 同理
```

### 编写 rule

下面只需要利用 createCustomRule 编写 rule 即可：

```ts
function Max (num: Number) {
    return createCustomRule({
        max: num,
        message: (info) => `${info.name}输入的字符长度不能超过${num}`
    })
}
```

### 实现一个 class validator 的 composition

下面实现一个 class validator 的转换 composition 即可:

```ts
export type Instanceable<T> = { new (): T };
export const InjectableKey = Symbol('injectable')
export function getInjectableMetaKey<T extends Record<string, any>>(classValidator: Instanceable<T>): symbol | undefined {
  return classValidator.prototype?.[InjectableKey];
}
export function useClassValidatorForm<T extends Record<string, any>>(classValidator: Instanceable<T>) {
  const vm = getCurrentInstanceProxy();
  const instance = new classValidator();
  const formValues = reactive(instance);
  const formRules = computed(() => getClassValidatorRules(vm, instance));
  const formLabels = computed(() => getClassValidatorLabels(vm, instance));
  const injectableMetaKey = getInjectableMetaKey(classValidator);
  const formRef = CreateForm();
  if (injectableMetaKey) {
    provide(injectableMetaKey, {
      formValues: formValues as T,
      formRules,
      formLabels,
      formRef,
    });
  }
  return {
    formValues: formValues as T,
    formRules,
    formLabels,
    formRef,
  };
}
```

其中 `getClassValidatorRules` 、 `getClassValidatorLabels` 都十分简单，只是为了取出数据遍历一下，生成结构即可，这里的结构和传输的 instance 也有关系，这里就不多赘述了，按照各自的实际需求去实现：比如添加 i18n 等等。

至于需要 inject 的位置，同样的只需要简单的去处 inject 的 meta key 即可 ：

```ts
type InjectFormInstance = {...}
const injectableMetaKey = getInjectableMetaKey(classDefine);
const form = inject<InjectFormInstance<T> | null>(injectableMetaKey, null);
```

这就很简单了可以拿到注册的 form 来绑定 ref ，绑定表单元素了。