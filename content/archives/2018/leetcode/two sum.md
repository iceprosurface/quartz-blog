---
title: leetcode： two sum(#1)
date: 2018-06-24T16:36:51+08:00
tags:
  - 算法
  - javascript
comments: true
updated: 2024-05-17T01:54:29+08:00
permalink: /2018/06/24/2018/leetcode/1/
---

## 1. 题目：Two Sum

Given an array of integers, return **indices** of the two numbers such that they add up to a specific target.

You may assume that each input would have **exactly** one solution, and you may not use the same element twice.

Given nums = [2, 7, 11, 15], target = 9,

Because nums[0] + nums[1] = 2 + 7 = 9,
return [0, 1].

## 2. 简单的翻译一下

对于某给定整数数组，找出其中两数和为给定数字，并返回其序号。

你必须确保每一个输入都只有唯一解，且不能使用同一元素两次以上。

## 3. 解法

这题很有意思，首先想到的方法是遍历嘛，把所有的组合遍历一遍求解即可，这挺容易的

### 3.1 遍历所有内容

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = 1; j < nums.length; j++) {
            if(i !== j && nums[i] + nums[j] === target) {
                return i < j ? [i, j] : [j, i] 
            }
        }
    }
};
```

这就完事儿了，但是显然并不是一个最优解，好歹空间复杂度为 $O(1)$, [[../../../知识库/编程/时间复杂度|时间复杂度]] 大概是 $O(n^2)$,（这个我不太会算，不过应该没错）

### 3.2 哈希表的方式

首先我们知道给定的数组是不能够使用2次以上的也就是说，那些多余的重复的数字是没有意义的，另外由于是 2sum ———— 那么另外一个值显然是知道的（target - now）,那么我们就有机会用空间换时间大致是空间： $O(1)$ -> $O(n)$ ，时间：$O(n^2)$ -> $O(n)$(大多数情况下，拿空间换时间都是比较划算的)

所以大致可以这么玩：

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let map = new Map();
    nums.forEach(function (value, index) {
        map.set(value, index);
    });
    for(let index = 0; index < nums.length; index++) {
        // 我记得Complement好像是补集的意思懒得查了，就用它吧
        let complement = target - nums[index];
        if (map.has(complement) && map.get(complement) !== index) {
            return [index, map.get(complement)]
        }
    }
    return 'no sum'
};
```

当然他还可以再简单一点,只消一次循环即可，因为我们知道遍历过的那一段说明里面的任意两两组合的数字都不可能相加为target，所以————我们可以这么写，只需要一次循环即可，当然咯 $O(2n)$ === $O(n)$ (从理智上讲并没有什么差别)


```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let map = new Map();
    for(let index = 0; index < nums.length; index++) {
        let complement = target - nums[index];
        if (map.has(complement) && map.get(complement) !== index) {
            // 注意一下这里和上个解法不同，因为取出的内容是之前的，所以输出的索引顺序需要反过来
            return [map.get(complement), index]
        } else {
            map.set(nums[index], index);
        }
    }
    return 'no sum'
};
```

最后。。。当然我觉得这两种解法基本没差，如果可以说出差别的，可以留言给我~就这样吧

