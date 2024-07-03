---
title: leetcode：Add Two Numbers(#2)
date: 2018-06-26T15:36:51+08:00
tags:
  - 算法
  - javascript
comments: true
updated: 2024-07-03T14:53:54+08:00
permalink: /2018/06/24/2018/leetcode/2/
ccby: true
---

## 1. 题目 Add Two Numbers

You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order** and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.


> **Input**: (2 -> 4 -> 3) + (5 -> 6 -> 4)
> **Output**: 7 -> 0 -> 8
> **Explanation**: 342 + 465 = 807.


## 2. 简单的翻译一下

将会给你两个通过 **非空** 链表来描述的非负整数，其中整数的每一个数字将会以 **反序** 方式储存在链表的节点中。将链表组成的数字相加，并返回一个该种方式组成的链表。

除非这个数字本身是0,否则你需要假定这两个数字不存在任何前导0。

举个栗子

> 输入: (2 -> 4 -> 3) + (5 -> 6 -> 4)
> 输出: 7 -> 0 -> 8
> 计算过程: 342 + 465 = 807.

## 3. 解法

这题不难，凡是了解过加法器的大抵都知道进位都是咋实现的，这个处理算法实际和加法器差不多，唯一需要注意的是，因为两数的长度完全可能不同，所以这个是需要处理一下，除此以外，并没有什么特殊的地方。

### 3.1 递归

由于是链表，用递归是一个常见思路

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    return addTwoNumbersWithDelta(l1, l2, 0)
};

function addTwoNumbersWithDelta (l1, l2, delta) {
    if (!l1 && !l2 && !delta) {
        return null
    }
    let val1 = 0
    let val1Next
    let val2 = 0
    let val2Next
    if (l1) {
        val1 = l1.val
        val1Next = l1.next
    }
    if (l2) {
        val2 = l2.val
        val2Next = l2.next
    }
    let value = val1 + val2 + delta
    let carry = parseInt(value / 10)
    let val = value % 10
    let next = addTwoNumbersWithDelta(val1Next, val2Next, carry)
    let res = new ListNode(val)
    res.next = next
    return res
}
```

这样递归一遍得出的 res 就是实际解了

