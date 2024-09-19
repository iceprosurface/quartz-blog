---
title: 基于GPT-4o的表格模板生成
date: 2024-07-02T11:37:41+08:00
updated: 2024-09-14T16:46:48+08:00
permalink: /tool/gpt4o-table-template/
tags:
  - 工具
  - AI
ccby: true
draft: false
comments: true
---
最近在尝试使用 ai 辅助提升开发效率，作为一个长期 “副驾”[^1] 使用者，副驾是个不错的 ai 助手，但是其经常 <u>胡言乱语的问题</u> 还是比较严重的，这个时候我忽然想到一点，前段时间 gpt-4o 可以用上了，并且在 gpt-4o 中对于图片 `有充足的识别能力` 了。是不是截图给 [GPT](../名词/GPT.md) 让他快速的生成 table 模板来使用呢？

带着这个疑问我尝试写了一下提示词：

```markdown
我会给一个图片是一个表格，表格可以用如下 jsx 方式定义：

import { createUseColumn } from '@taptap/vxe-table/es/compositions';
const { useColumn, useColumns } = createUseColumn<T>();
const columns = useColumns([
  useColumn(() => ({});
]);

useColumn 格式如下：
useColumn(() => ({
  title: 'string',
  width: 1111,// 按照列宽度写
  fixed: 'left' | 'right' | undefined,// 你需要按照内容判断是否需要固定显示列
  slots: {
    default: ({row}) => {
       return [VNode]
    }
  }
}))
常用的 vnode render 函数从 @iem-module/components 导出有：

- function renderString(text?: string | string[])
- function renderEmpty()
- function renderPercentUnit(text?: number | string)
- function renderStringArray(textArray?: string[])
- function renderPercent(text?: number | string)
- function renderPercentWithThousandSeparator
- function renderNumber(text?: number)
- function renderNumberThousandSeparator(text?: number | string)
- function renderNameId(props?: { id?: number | string; name?: string; icon?: string })
- renderUser(user?: {  
    id?: number | string;  
    name?: string;  
    avatar?: string;  
    size?: 'small' | 'medium';  
    avatarStyle?: StyleValue;  
    })
- function renderGame(game?: { id: number | string; name: string; avatar?: string; avatarStyle?: object })
- function renderMoney(text?: number, { currency, unit }: { currency?: string; unit?: number } = {})
- function renderDate(text?: number | string | Dayjs, format = 'YYYY-MM-DD HH:mm:ss')
- function renderLabelActions(  
    shownActions: RenderLabelActionItem[] = [],  
    hiddenActions: RenderLabelActionItem[] = [],  
    )

其中 RenderLabelActionItem ：

export type RenderLabelActionItem = { label: string; action: () => any; };

如果你听懂了且准备好了，请回复我了解了

随后我会给一个表格和内容对应的类型定义 T
```

然后将其设置为 system 提示词：

![提示词|300](https://cdn.iceprosurface.com/upload/md/202407021144041.png)


随后我传了一个图片和对应的类型定义给 gpt 

![定义|300](https://cdn.iceprosurface.com/upload/md/202407021153997.png)

![设计稿|300](https://cdn.iceprosurface.com/upload/md/202407021153998.png)


有意思的来了，[GPT](../名词/GPT.md) 给出了这样一个回答：

```jsx
import { createUseColumn } from '@taptap/vxe-table/es/compositions';
import { renderString, renderDate, renderMoney, renderLabelActions, renderStringArray, renderNameId } from '@iem-module/components';

const { useColumn, useColumns } = createUseColumn<Tcccreatorv1SponsorGoodsOrder>();
const columns = useColumns([
  useColumn(() => ({
    title: '订单 ID',
    width: 150,
    slots: {
      default: ({ row }) => {
        return [renderString(row.id)];
      }
    }
  })),
  useColumn(() => ({
    title: '订单名称',
    width: 200,
    slots: {
      default: ({ row }) => {
        return [renderString(row.name)];
      }
    }
  })),
  useColumn(() => ({
    title: '游戏',
    width: 200,
    slots: {
      default: ({ row }) => {
        return [renderNameId({ id: row.app?.id, name: row.app?.name })];
      }
    }
  })),
  useColumn(() => ({
    title: '订单状态',
    width: 150,
    slots: {
      default: ({ row }) => {
        return [renderString(row.status)];
      }
    }
  })),
  useColumn(() => ({
    title: '订单总价（元）',
    width: 150,
    slots: {
      default: ({ row }) => {
        return [renderMoney(row.src_goods_price, { currency: 'CNY', unit: 100 })];
      }
    }
  })),
  useColumn(() => ({
    title: '订单创建时间',
    width: 200,
    slots: {
      default: ({ row }) => {
        return [renderDate(row.created_time, 'YYYY-MM-DD HH:mm:ss')];
      }
    }
  })),
  useColumn(() => ({
    title: '扣款时间',
    width: 200,
    slots: {
      default: ({ row }) => {
        return [renderDate(row.pay_time, 'YYYY-MM-DD HH:mm:ss')];
      }
    }
  })),
  useColumn(() => ({
    title: '完成时间',
    width: 200,
    slots: {
      default: ({ row }) => {
        return [renderDate(row.execute_time, 'YYYY-MM-DD HH:mm:ss')];
      }
    }
  })),
  useColumn(() => ({
    title: '所含商品',
    width: 300,
    slots: {
      default: ({ row }) => {
        return [renderStringArray(row.goods?.map(good => good.name))];
      }
    }
  })),
  useColumn(() => ({
    title: '操作',
    width: 100,
    fixed: 'right',
    slots: {
      default: ({ row }) => {
        return [
          renderLabelActions([
            {
              label: '详情',
              action: () => {
                console.log('查看详情', row.id);
              }
            }
          ])
        ];
      }
    }
  }))
]);
```

可以看得出 [GPT](../名词/GPT.md) 的回复质量极高，他能准确理解图片中内容的意思、并且准确的选择 interface 中[^2]的内容。

而很有意思的是对我们来说提取 interface 是一个简单的事情，因为 interface 是通过脚本自动生成的，你只需要简单的编写下面的代码

```ts
import { Tcccreatorv1SponsorGoodsOrder } from './api';

export { Tcccreatorv1SponsorGoodsOrder }
```


然后使用 tsup 执行 `tsup ./test.ts --dts-resolve` 提取类型，并直接丢给 gpt 就可以了。

也就说如果我们可以 *比较好的* 归类 **绝大部分的表格类型**，并且 `内置足够数量的内置渲染函数`，那么编写一个表格就可以通过 gpt 去识别表格内容 **自动生成表格** 了，并且其 `可维护性` 也是能够保障的。

换而言之，对于水平较低开发者而言，这并不是个好消息:

> [!danger] 下岗警告
> 他可以替代绝大部分的初级的前端开发工作。

有意思的是，相比较一两年前大量低代码平台而言，这套方案可能对前端开发的冲击要更高一点。



[^1]: github copilot
[^2]: interface 的内容是通过 proto 文件生成的，注释在编写时就携带了，是一个没有成本的事情