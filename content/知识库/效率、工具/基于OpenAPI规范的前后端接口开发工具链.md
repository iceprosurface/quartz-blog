---
title: 基于 OpenAPI 规范的前后端接口开发工具链
date: 2024-06-18T16:47:06+08:00
updated: 2024-06-19T22:43:59+08:00
permalink: /code/openapi-based-api-development-toolchain/
tags:
  - 工具
  - 效率
ccby: false
draft: false
comments: true
---
在早些年（约 2021 年）的时候就 [介绍过](../../archives/2022/2021年年度总结.md) 使用 proto 来做 [IDL](../编程/IDL.md) 生成 ts 代码，经过最近一段时间的使用，对这个使用流程做了一些优化。

我们利用 proto 来作为前后端的接口文档类似于下图这样：

![接口开发流程.excalidraw](接口开发流程.excalidraw.md)

我们后端使用的是 [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway) ，这里前端这边使用 他 提供的 open-api-v2 插件生成 swagger 在通过 [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) 生成对应的 ts 代码。

有同学可能会提出问题为什么不直接使用 proto 来作为前后端通讯的方法，而要兜圈子，用 swagger 来作为中间媒介生成代码。这里在重新讲一下。

时至今日，我们依然可以发现 grpc-web 在 2024 年仍然没有成熟的框架+较好的调试工具来辅助开发，对比 json 形式的 restful api，其易用性 **仍然需要打一个巨大的问号**，对于需要投入生产的商业项目，在这点上不愿意以此为基础冒险使用一个 <u>前景很不明朗</u> 的项目。

## 流程管理

我们对于 proto 的流程大体上在编写代码前，我们会和后端一起约定 proto ，当 proto 约定完成以后合并到指定的分支，此时会触发 ci/cd 构建 go 代码并通知 ts 构建服务开始工作，ts 构建服务是一个中心化的 mono 大仓，储存了所有项目使用的 proto 产物。

ts 构建服务完成构建以后会提交到代码仓库作为备份，同时推送到内网的 npm 上。

此时前端就可以通过 `@taptap/proto-xxx`  安装并使用对应的接口。

![proto构建流程.excalidraw](proto构建流程.excalidraw.md)

## 构建脚本

构建脚本是一个比较简单的事情，我们使用一份较大的 setting.ts 作为配置文件管理所有的配置项目, 相关的脚本使用 ts-node 配合带类型的 zx 运行这样可以少写一下代码：

```typescript
interface ProjectBasicSetting {
  /**
   * 项目的名称
   */
  name: string;
  notification?: {
    /**
     * 成功后通知的 slack 配置
     */
    slack?: {
      channel: string;
      thread_ts?: string;
    };
  };
  /**
   * 核心维护人员，如果项目失败，会通知这些人
   */
  maintainer?: string[];
}
export interface ProtoProject extends ProjectBasicSetting {  
  /**
   * git 仓库设置
   */
  git: {
    /**
     * 需要监控拉取的分支
     */
    branch: string;
    /**
     * git 仓库地址
     */
    repo: string;
    /**
     * glob 配置，用于监控的文件, 使用 glob 语法
     * 可以通过 input 来控制你需要处理的文件
     */
    glob?: {
      input?: string | string[];
    };
  };
  /**
   * 生成的 protoSetting 不建议配置, 如非必要请使用默认配置
   */
  protoSetting?: Record<string, string>;
}
export interface OpenApiProject {
	url: string;
}
export type ProjectSetting = ProtoProject | OpenApiProject;

```

这样我们的构建脚本就可以通过读取配置来完成代码封装，核心代码是下面这样写，其他的拉取代码操作就是简单的 git 操作，不多赘述。

```typescript
/**  
 * 默认的 proto 生成 swagger 配置  
 */  
const defaultProtoSetting = {  
  // 合并 swagger  
  allow_merge: 'true',  
  // 合并文件名  
  merge_file_name: 'api',  
  // 不使用 json 名称  
  json_names_for_fields: 'false',  
  // 使用 fqn 命名策略  
  openapi_naming_strategy: 'fqn',  
};
// 其中 setting: ProtoProject, ctx: CTX，ctx 是一个上下文环境，用来获取一些 logger 什么的配置
// 拉取代码的操作不多赘述自行使用 zx 编写即可
// await fetchGit(setting, ctx);
const protoSetting = createProtoSetting({  
  ...defaultProtoSetting,  
  ...setting.protoSetting,  
});
const gitName = setting.name;
const inputs = setting.git?.glob?.input ?? ['api/**/*.proto'];
// 查找 proto 文件
const protoFiles = (
await glob(inputs, {
  cwd: `${ctx.cwd}/${gitName}`,
})
).map((p) => `${gitName}/${p}`);
// 使用 protoc 生成 swagger.json，注意这里 protoFiles 应当使用数组，否则会被 shell 解析为单个参数
ctx.logger.log(`filePaths: ${protoFiles.join(' ')}`);
const swaggerPath = `./packages/${outputName}/src`;
const { stdout, stderr, exitCode } = await $({
nothrow: true,
quiet: true,
})`protoc -I ./${gitName} --openapiv2_out=${swaggerPath} --openapiv2_opt=${protoSetting} ${protoFiles}`;
  ```

> [!danger] 注意事项
> 1. zx 中调用 git 不能使用 promise.all 因为 git 本身是 **带锁的**，同时调用 **会抛出异常**
> 2. openapi_naming_strategy 建议使用 fqn 否则碰到重名会比较麻烦，会出现互相覆盖的问题

在上面的 proto 将会生产一个 swagger.json 文件到 src 目录下面，随后按照自己的喜好编写 swagger-typescript-api 的模板，在编译 swagger 到 ts 代码即可，如果有需要的话，最后一步使用 tsc 简单的编译为 js + d.ts 提升在开发环境下的 ts 提示性能。


## 生成结果

```typescript
type WithApiKey = { apiKey?: string };
export class Api<AdditionalConfig extends WithApiKey> {
  private _request: Request<AdditionalConfig | WithApiKey>;

  constructor(request: Request<AdditionalConfig | WithApiKey>) {
    this._request = request;
  }

  xxxXxx = {
    /**
     * No description
     *
     * @tags xxxService
     * @name XxxServiceXxxXxx
     * @request GET:/rep-admin/v1/basic/apps
     */
    xxxServiceXxxXxx: (query: XxxParams) =>
      this._request.GET<XxxResp>(`/xxx/xxx/xxx/xxx`, {
        params: query,
        config: { apiKey: 'XxxServiceXxxXxx' },
      }),
  }
}
```

随后在项目里面配合 `@taptap/tool-kit-fe-vue`  使用即可：

```typescript
import { Api } from '@taptap/proto-xxx'
const apiService = new Request<{ apiKey>: string }>({ baseUrl: '' });
export const { xxxXxx } = new Api(apiService);

// 项目里面使用
import { useRequest } from '@taptap/tool-kit-fe-vue';
const { data, send, sending } = useRequst(xxxXxx.xxxServiceXxxXxx)
send();
// data -> XxxResp
```

