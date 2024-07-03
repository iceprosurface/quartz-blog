---
title: js 实现流程任务执行
date: 2022-07-07T11:32:31+08:00
updated: 2024-07-03T14:56:06+08:00
permalink: /2022/js-job-runner/
tags:
  - javascript
ccby: true
comments: true
---

##  前言

写着这么一个组件的原因也比较简单，因为现在在做的低代码编辑器需要可以进行事件的控制，而事实上我们的低代码平台的实现上主要还是比较偏向指令式的换而言之通常是这么个逻辑执行的：

```
执行 xxx 操作 -> 打开弹窗 -> 填写表单 -> 关闭弹窗  
```

那么自然而然的，我们就可以想到实现这种运行方式的编辑器，必然是一个流程图编辑器，那么在流程图编辑器获得 json 数据以后要怎么执行便成了问题。

在第一版我们不需要实现非常复杂的管理，可以简单的直接使用递归的方式直观的实现。

<!-- more -->

## 思路

首先，流程图必然是图，那么对于数据，必然存在两种类型：

+ edge 边
+ node 节点

### 节点

首先我们需要讨论的节点，节点事实上是为了描述做什么的，那么对其最简单的抽象是这样的：

```typescript
export interface Node {
	id: string;
	data?: any;
}
```

也就是说节点必然拥有一个 id 和一个 data 数据，data 数据用来描述这个节点是如何工作的。

为了方便测试和复用，那么我们在编写执行器的时候，大可不内置实现运行器，要求上级覆盖。

### 边

边是描述节点间关系的实体，那么对于边我们可以这么抽象：

```typescript
export interface Edge {
	id: string;
	from: string;
	to: string;
	data?: any;
}
```

对于边我们可以这么定义，data 是用来描述边是如何运行的，对于边需要关心的只有 from 和 to，至于最终 edge 的结果，我们默认他应该会返回一个 bool 来告诉我们是否可以去下一个节点即可。

这样我们就完成了全部的抽象，简单的写一下接口定义：

### 接口定义

首先我们定义传入类型

```
export interface RunnerSchema {
	nodes: Node[];
	edges: Edge[];
}
```

随后我们定义两种 runner 类型

```
type NodeRunner = (node: Node, arg: any) => Promise<any>;
type EdgeRunner = (edge: Edge, arg: any) => Promise<boolean>;
```

下面我们需要写一个 manage 类用来管理这些 runner (如果后续需要做一些复杂的前置或者后置，亦或者 运行池等行为可以覆盖这个基础实现)
```typescript
export class JobManager {
	constructor(
		private runner: RunnerSchema,
		private setting: {
			nodeRunner: Node;
			edgeRunner: Edge;
		},
	) {}
	setRunner(runner: RunnerSchema) {}
	async triggerJob(id: string, arg?: any) {}
	clone() {}
}
```

之后还需要一个用来执行任务的类，manager 将会生成这个类，如果需要维护执行池的话，则需要把这个类储存下来，丢入池子，并等待完成。

```typescript
export class JobRunner {
	constructor(
		private runner: RunnerSchema,
		protected nodeRunner: NodeRunner = async () => {},
		protected edgeRunner: EdgeRunner = async () => {},
	) {}
	/**
	 * 当前执行次数
	 */
	private currentRunTimes = 0;
	/**
	 * 最大执行次数
	 */
	maxRunTimes = 1000;
	/**
	 * 至多执行时间
	 */
	maxExecTime = 100 * 1000;
	startTask(uid: string, arg?: any) {}
	protected async triggerNode(id: string, arg?: any) {}
}
```


### 功能实现

#### startTask

startTask 实现很简单：

```typescript
startTask(id: string, arg?: any) {
	return new Promise((resolve, reject) => {
		if (this.jobRunnerLock) {
			reject(new Error('任务已结束，请勿重复触发同一job'));
		}
		setTimeout(() => {
			reject(new Error('任务执行超过最大等待时间'));
		}, this.maxExecTime);
		
		this.triggerNode(id, arg)
			.then(resolve)
			.catch(reject)
			.finally(() => {
				this.jobRunnerLock = true;
			});
	});
}
```

#### triggerNode

```typescript
  protected async triggerNode(id: string, arg?: any) {
    if (this.currentRunTimes >= this.maxRunTimes) {
      throw new Error('已经超过最大可执行上限，任务终止');
    }
    const resolveList: Promise<any>[] = [];
    for (const node of this.runner.nodes) {
      if (node.id === id) {
        this.currentRunTimes += 1;
        const promise = this.nodeRunner(node, arg).then(async (result) => {
          // 符合 node 要求，查找所有此 node 对应的 edge 节点
          for (const edge of this.runner.edges) {
            if (edge.from === node.id) {
              if (await this.edgeRunner(edge, result)) {
                // 如果返回值是 true 则继续执行下一个任务（edge.to)
                return this.triggerNode(edge.to, result);
              }
            }
          }
        });
        resolveList.push(promise);
      }
      await Promise.all(resolveList);
    }
  }
```

#### TriggerJob
```typescript
async triggerJob(id: string, arg?: any) {
	const runner = new JobRunner(this.runner, this.setting.nodeRunner, this.setting.edgeRunner);
	await runner.startTask(id, arg);
}
```

### 测试

最后我们需要简单的写一个测试用来检验结果是不是同预料的一致：

```typescript
import { JobManager, Node } from './jobRunner';
const createEdge = (from, to, data = null) => {
  return {
    id: 'any',
    from,
    to,
    data,
  };
};
const createNode = (id, data: any = null) => {
  return {
    data,
    id,
  };
};

test('job runner 应当线性执行', async () => {
  const runList: string[] = [];
  const jobRunnerManage = new JobManager(
    {
      nodes: ['a', 'b', 'c'].map(createNode),
      edges: [createEdge('a', 'b'), createEdge('b', 'c')],
    },
    {
      async nodeRunner(node: Node) {
        runList.push(node.id);
      },
      async edgeRunner() {
        return true;
      },
    },
  );
  await jobRunnerManage.triggerJob('a');
  expect(runList).toEqual(['a', 'b', 'c']);
});

test('job runner 最大可执行任务上限', async () => {
  const runList: string[] = [];
  const jobRunnerManage = new JobManager(
    {
      nodes: ['a', 'b', 'c'].map(createNode),
      // 创建一个死循环任务
      edges: [createEdge('a', 'b'), createEdge('b', 'c'), createEdge('c', 'a')],
    },
    {
      async nodeRunner(node: JobNode) {
        runList.push(node.id);
      },
      async edgeRunner() {
        return true;
      },
    },
  );
  try {
    await jobRunnerManage.triggerJob('a');
    // hack 用于强制提示错误
    expect(true).toBe(false);
  } catch (e) {
    expect(e.message).toBe('已经超过最大可执行上限，任务终止');
  }
});

```