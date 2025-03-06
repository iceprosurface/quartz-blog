---
title: 未来已来？-- 基于 cursor 的 ai code review
date: 2025-03-06T15:30:20+08:00
updated: 2025-03-06T16:59:56+08:00
permalink: /knowledge/efficiency-tool/future-ai-code-review-with-cursor/
tags:
  - AI
  - 编辑器
ccby: true
draft: false
comments: true
no-rss: false
---


# 前言

在比较早期的时候，我曾经使用过 [GPT](../名词/GPT.md) 的 API 做过 `code review`，总体来讲，效果<u>并不理想</u>。在大约去年的时候，我尝试了 **cursor**，当时 cusor 已经能够基于 codebase 进行**上下文分析**，并给出代码补全建议。使用了一段时间后，cursor 的代码补全能力虽然相比较 github copilot 来说<u>确实要稍强一点</u>，但<u>没有拉开质量的差距</u>，所以后来并没有使用。

最近一段时间，公司给所有开发都配备了 cursor 的 **pro 版本**，所以我又重新开始使用 cursor。仅从代码补全角度已经**有了质的差别**，在前端上，cursor 对于项目代码的理解能力已经<u>远远超过</u> github copilot。

而 cursor 的其他能力则**更加强大**，比如利用 cursor 的 **agent 模式**可以非常方便的 **大面积** 创建代码、修改、重构，虽然距离 **完全自动化** 还有很长的路要走，但已经可以 **带来非常多的便利**。

而其中对于 **code review** 方向来说是一个比较大的突破，得益于 cursor 的**上下文分析能力**，cursor 可以基于代码库进行分析，<u>并给出更全面的代码审查建议</u>。

本文会介绍几种使用 cursor 进行 code review 的方法。


# 使用方法

## 方案一： 基于 mdc 思路的 code review

一般来说比较简单的 code review 可以使用 **rule** 让 llm 通过 rule 的 description 来判断是否使用。

**配置方式：**

1. 进入 **code setting**，随后添加 rules

![](https://cdn.iceprosurface.com/upload/md/202503061659524.png)

2. 输入 rule 名称，比如 **code-review**

![](https://cdn.iceprosurface.com/upload/md/202503061659525.png)

比如如果你是 **gitlab**，那么你可以这么写：

```md
---
description: 当用户试图 code review 时使用
globs: 
alwaysApply: false
---

你是一名**经验丰富的软件工程师**，代码审查（Code Review）。

你的任务是结合项目当前代码，分析代码变更，并提供有价值的反馈，确保代码符合高质量标准。

若用户提供了 gitlab mr id, 可以使用 `PAGER=cat glab mr diff ${mr_id}` 获取远程 mr 的 diff 内容, 如果没有安装，则提示用户，并退出
```

> **注意：** 如果是私有仓库，那么你需要安装 https://docs.gitlab.com/editor_extensions/gitlab_cli/ 来获取 diff 信息
> 
> **注意：** 如果是 github，那么 mdc 中最后一行完全可以不添加， cursor 可以自动读取，只需要配置一下登陆即可，也可以不用特意添加 rules，让 cursor 自由发挥


## 方案二: 基于 mcp 服务扩展规则

对于一些**复杂的 code review 规则**，仅通过 mdc 的 rule 配置，llm 不能很好的理解，并且对于一些查询性质的行为，是无法获取的。

另外一个糟糕的情况是 cusor 可能会**过大的审查或者获取代码**，如需要更为精准的缩小 code review 的范围，就可以通过 [mcp](../名词/Model%20Context%20Protocol.md) 服务来扩展 cursor 的能力。

### 1. 编写代码

下面举个例子：

在 node 中，我们可以使用 [**litemcp**](https://github.com/wong2/litemcp) 来快速的创建一个 mcp 服务。

```typescript
import { LiteMCP } from 'litemcp';
const server = new LiteMCP('xxx', '1.0.0');
// gitlab api
const api = new Gitlab({
	host: 'https://xxx.gitlab.com/',
	token: config.gitlabToken,
});
server.addTool({
  name: 'get_merge_request',
  description: 'Get a gitlab merge request infomation',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async (args) => {
    const pattern1 = /https?:\/\/[^/]+\/(.+)\/-\/merge_requests\/(\d+)/;
    const match = args.url.match(pattern1);
    if (!match) {
      return 'Invalid URL';
    }
    const projectPath = match[1];
    const mergeRequestIId = match[2];
    server.logger.info(`正在解析 merge request ${projectPath}/${mergeRequestIId}`);
    const project = await api.Projects.show(projectPath);
    server.logger.info(`已经查找到项目 ${project.name}（id: ${project.id}）, 正在获取 diffs`);

    const diffsRes = await api.MergeRequests.allDiffs(project.id, Number(mergeRequestIId));
    const diffs = diffsRes
        .filter(
          // 过滤掉不必要的文件
          (diff) =>
            [
              // 仅对 vue、js、ts、css、scss、html、json 文件进行 code review
              'vue',
              'js',
              'ts',
              'jsx',
              'tsx',
              'css',
              'scss',
              'html',
              'json',
            ].some((ext) => diff.new_path.endsWith(`.${ext}`)) &&
            ![
              // 过滤掉不需要 code review 的文件
              'package.json',
              'pnpm-lock.yaml',
              'tsconfig.json',
            ].some((file) => diff.new_path.endsWith(file)),
        )
        .map((diff) => ({
          path: diff.new_path,
          content: `${diff.diff}`,
        }))
    // 检查整个 diff 的总长度
    const totalLength = diffs.reduce((acc, diff) => acc + diff.content.length, 0);
    if (totalLength > 200000) {
      return {
        content: [
          {
            type: 'text',
            text: 'Diff 总长度超过 200，000 字符，请缩小范围',
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: '请注意，以下是本次 merge request 的 diff 信息，请根据 diff 信息进行 code review',
        },
        ...diffs.map((diff) => ({
          type: 'text',
          text: `文件路径：${diff.path}\n文件内容: ${diff.content}\n`,
        })),
        {
          type: 'text',
          text: '你需要使用中文进行回复',
        },
        {
          type: 'text',
          text: '请注意，你在进行审查前需要先获取 Code Review 规则，请根据规则进行审查, 比如 get_file_code_review_rules 工具',
        },
        {
          type: 'text',
          text: '请注意你需要搜索相关的文件并一起纳入考虑',
        },
      ],
      isError: false,
    };
  },
});
```


这样就提供了一个**获取 diff 工具**，同时也可以**过滤一些不必要的文件**。

然后我们还可以提供一些**额外的工具**来辅助 llm 判断 code review 规则，譬如你可以针对**目录**、**文件名**、或是 **language** 来提供一些额外的 prompt：

```typescript
server.addTool({
  name: 'get_file_code_review_rules',
  description: 'Get the code review rules for a file',
  parameters: z.object({
    files: z.array(
      z.object({
        path: z.string(),
        language: z.string(),
      }),
    ),
  }),
  execute: async (args) => {
    const prompts = new Set<string>();
    for (const file of args.files) {
      const { path, language } = file;
      prompts.add('尽可能回答简洁，如果没有必要的原因需要阐述可以回答 无原因。');
      prompts.add('请注意代码风格，代码规范，代码逻辑，代码性能等方面的问题。');
      prompts.add('请注意代码的安全性，是否有可能引发安全问题。');
      prompts.add('请注意代码的可读性，是否有可能引起误解。');
      prompts.add('请注意代码的可维护性，是否有可能引起维护困难。');
      if (language === 'vue') {
        prompts.add('对于 vue 文件，需要检查文件是否使用了 setup 语法，如果没有使用需要提示。');
      }
      if (
        language === 'javascript' ||
        language === 'typescript' ||
        [
          //
          '.tsx',
          '.ts',
          '.jsx',
          '.js',
        ].some((ext) => path.endsWith(ext))
      ) {
        prompts.add('ts 文件需要尽可能检查类型声明是否符合规范，是否有可能引发类型错误。');
      }
      if (path.endsWith('.tsx')) {
        prompts.add('对于 tsx 文件, 你需要调用 get_tsx_rules 工具获取 tsx 文件的代码审查规则');
      }
      if (language === 'css' || language === 'scss') {
        prompts.add('css 和 scss 文件需要检查是否符合代码规范，是否有可能引发样式问题。');
      }
    }
    return Array.from(prompts).join('\n');
  },
});
```

### 2. 在 cursor 中使用

在本机模式下你可以使用 **stdio 模式**调用：

```typescript
server.start({
  transportType: 'stdio',
});
```

在项目根目录：创建文件 `.cursor/mcp.json` 填写

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": [
        "path to js"
      ]
    }
  }
}
```

随后你就可以在 **MCP servers** 下看到你提供的服务了。

![](https://cdn.iceprosurface.com/upload/md/202503061659527.png)

然后你只需要在 chat 中开启 **agent 模式**，随后直接将链接贴入即可：

![](https://cdn.iceprosurface.com/upload/md/202503061659528.png)

我们可以看到 llm 非常智能的选择了合适的 tool：**`get_merge_request`** & **`get_file_code_review_rules`** & **`get_tsx_rules`** 处理不同的需求，由于这个 mr 没有引入其他文件或更大面积的变更，所有 cursor 没有使用 codebase 来获取其他相关文件。


# 结语

目前来讲，我们可以看到 AI 辅助 Code Review 已经真正从概念走向了实践。基于 Cursor 的 AI Code Review 不仅能够理解代码上下文，还能根据自定义规则进行智能分析，大大提高了代码审查的效率和质量，从我的实践来看，节省了 50% 以上的时间。

与早期使用 GPT API 进行 Code Review 相比，现在的 Cursor Pro 版本在代码理解能力上有了质的飞跃。它不仅能够分析单个文件的变更，还能够理解整个代码库的上下文，提供更加全面和准确的建议。

当然，AI Code Review 并不能完全替代人工审查，他更像一个秘书或者助手，可以帮助开发者发现潜在问题、提高代码质量。

