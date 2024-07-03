---
title: 如何让mac挂在ntfs的u盘
date: 2016-05-17 21:10:14 +0800
comments: true
tags:
  - 脚本
permalink: /2016/05/17/2016/2016-05-17-mac-ntfs/
updated: 2024-07-03T14:52:32+08:00
ccby: true
---

本人最近需要copy一份文件，最为一个忠实的ubunut fans 我是不会把u盘化成ntfs的，原因很简单，说不定哪天就要用内核登陆，到时候我可不一定能成功挂在ntfs，但是fat32至少是可以使用，不过我的小伙伴可不会这么办，于是我的os x对他的盘只能看不能写了。

## 某IT工程师的发现
百度了一下已经有__解决方案了__，简单的使用命令就可以了，我们把它挂载就能读+写了。
```bash
diskutil info /Volumes/fatherd | grep UUID
#uuid 就是上面的那个uuid
echo "UUID=uuid none ntfs rw,auto,nobrowse" | sudo tee -a /etc/fstab
```
这个是第一种方法了假设你知道uuid（反正我是不信有人能背出的）可以省略第一步

## 第二种方法
这种方法是基于上面启发的，我们可以尝试挂载到别的地方

```bash
ls /dev | grep disk
ls /dev | grep disk
#老样子看两次
VOLUME=`diskutil info /dev/disk2s1 | grep "Volume Name" | awk '{print $3}'`
sudo mount -t ntfs -o noowners,nodev,nobrowse,noatime,rw /dev/disk2s1 /Users/iceprosurface/Desktop/${VOLUME}
```

挂载桌面同名文件上