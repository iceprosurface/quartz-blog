---
title: systemd
date: 2024-09-18T17:44:44+08:00
updated: 2024-09-19T10:40:20+08:00
permalink: /tools/systemd/
tags:
  - 服务器
  - 工具
ccby: true
draft: false
comments: true
no-rss: false
---
# systemd 是什么

systemd 是一个用于 Linux 操作系统的系统和服务管理器，负责启动和管理系统服务和进程。

> [!tip] 提示
> 尽管`systemd` 默认集成在绝大部分发行版中，但是并不是所有发行版都有的，譬如 *Alpine*
> 如果你碰到了 `bash: systemctl is not installed` ，你需要使用对应的包管理器进行安装

# systemd 的用法

## 停止和启动服务

```bash /application/
# 启动
sudo systemctl start application.service
# 重启
sudo systemctl restart application.service
# 关闭
sudo systemctl stop application.service
```

## 重新载入配置

有的 service 是支持重新载入配置的：

```bash /application/
sudo systemctl reload application.service
```

但是有时候我们无法确定这个程序是否可以支持 reload，这种情况比较好的做法是使用 `reload-or-restart`:

```bash /application/
sudo systemctl reload-or-restart application.service
```

## 开启开机自启动

你可以使用 `enable` 和 `disable` 来开关开机自启动：

```bash /application/
# 开机启动
sudo systemctl enable application.service
# 禁止开启启动
sudo systemctl disable application.service
# 是否是 enabled 状态
sudo systemctl is-enabled cadd
```


## 检查服务状态

一般我们通过 status 去检查 service 的状态，通常 service 的信息会显示在下面，并包含日志

```bash /application/
systemctl status application.service
```

> [!example]- 一个 caddy 服务的例子 
> ![](https://cdn.iceprosurface.com/upload/md/202409181821950.png)


你还可以使用 `is-active` 来判断是否启动了

```bash /application/
systemctl is-active application.service
```

> [!hint] 请注意！
> 上文中提到的 `is-` 相关的命令都可以通过命令执行的 code 来判断是否成功，退出状态“0”表示发生故障，退出状态“1”表示任何其他状态

## 编辑

可以直接使用 `edit` 来编辑一个 service

```bash /application/
# 修改完整代码
sudo systemctl edit --full application.service
# 添加片段单元
sudo systemctl edit application.service
```

> [!warning] 警告
> 请注意添加的片段单元将会部分覆盖 service

## 删除

删除一个 service 直接删除对应的文件即可，譬如下文的 删除一个 nginx 的配置：

```bash /nginx/
sudo rm -r /etc/systemd/system/nginx.service.d
sudo rm /etc/systemd/system/nginx.service
```
## 重载配置

上文中的任意操作写、改、删操作后，都需要重载配置

```bash /daemon-reload/
sudo systemctl daemon-reload
```

# 编写 systemd

除开一些早起的发行版和部分精简发行版，systemd 目前在绝大部分系统中都储存在 `/etc/systemd/system` 下

一个 systemd 的 service 包含三大块内容：

+ Unit 描述服务的信息
+ Service 描述服务如何运作
+ Install 描述怎么启动这个服务

## Unit

unit 通常会包含：

+ 描述性质
	+ Description 描述服务做什么的（仅仅是个介绍并无实际用途）
	+ Documentation 文档
+ 启动相关
	+ After 描述服务类别，表示本服务需要在哪一个服务启动后在启动
	+ Before 表示需要在某些服务启动之前启动
+ 依赖关系
	+ Wants 定义一个**弱依赖关系**，当自己启动时也会试图启动 Wants 列表中的 service ，但是列表中的 **服务退出以后自己不会退出**
	+ Requires  与 Wants 不同，Requires 描述**强依赖关系**，当**列表中的服务退出以后，自身也会退出**

## service

service 通常会包含以下几个字段：
+ 命令执行相关
	+ Type 服务的启动方式
		+ simple：`ExecStart`字段启动的进程为主进程
		+ forking： `ExecStart`字段将以`fork()`方式启动
		+ oneshot ：只**执行一次**，等它执行完，才启动其他服务
		+ dbus： 会等待 [D-Bus](../名词/D-Bus.md) 信号后启动
		+ notify： 启动结束后会发出通知信号，才启动其他服务
		+ idle： 等待空闲（其他任务执行结束），才启动该服务
	+ User 服务运行的用户
	+ Group 服务运行的用户组
	+ WorkingDirectory 服务 cwd
+ 执行操作，代表不同生命周期需要执行的命令
	- ExecStart：启动服务
	- ExecStop：停止服务
	- ExecStartPre：启动服务前
	- ExecStartPost：启动服务后
	- ExecStopPost：停止服务后
	- ExecReload：重启服务时
+ 重启相关
	+ KillMode 定义systemd如何停止服务
		+ control-group：终止整个控制组（cgroup）中的所有进程
		+ process：只 kill 主进程
		+ mixed： 向主进程（即启动服务的主进程）发送 `SIGTERM` 信号，控制组（cgroup）中的其他所有子进程发送 `SIGKILL` 信号
		+ none：什么都不做，然后执行 stop 
	+ Restart 定义服务进程退出后，systemd的重启方式，默认是不重启的
		+ no： 退出不重启
		+ on-success：只有正常退出时（状态码为0）重启
		+ on-failure：非正常退出时（状态码非0, 包括 `SIGKILL` 和超时）重启
		+ on-abnormal：终止(包括 `SIGKILL` 和 `SIGTERM` )和超时时重启
		+ on-abort：收到非正常”信号时（如 `SIGABRT`，即中止信号）重启
		+ on-watchdog：超时后重启
		+ always：总是重启
	+ RestartSec 重启前等待的秒数

## Install

install 只有一个 WantedBy，代表该服务所在的 Target，他可以在其他 service 的 before 和 after 中使用。

