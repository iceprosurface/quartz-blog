---
title: IndexDB 初用解析 & Dexie
date: 2020-07-04T19:19:16+08:00
tags:
  - javascript
  - 数据库
comments: true
updated: 2024-07-03T14:55:10+08:00
permalink: /2020/07/04/2020/dexiejs/
ccby: true
---

### 什么是 IndexDB

随着浏览器的功能逐渐增强，我们不可避免的需要在前端处理越来越多的数据，除了数据，我们甚至可能需要对 cache 作出更加丰富的操作。

那么问题来了，用什么工具更加合适呢？

cookie 是我们常见数据持久化方案，但是他的大小仅仅只有 **4k**，并且随着 cookie 的增大，你的请求携带的cookie 也随之增加，这显然是不划算的。

localstorage 是一个不错的方案，他的大小也是勉强够用的，约 **2.5M** 随着各个浏览器大小的不同而发生改变，比如 chrome[^1]  他的大小就有 10M

当然咯有一些成熟的库对 localstorage 作出了一定程度上的封装来减少存取的难度，但是实际上，它在某些痛点上并不能很好的解决这些问题。（这会在后文指出）

所以 IndexDB 应运而生，用于处理这些复杂而麻烦的任务。

IndexDB 顾名思义，是一个 db。

各位前端的小伙伴相比都是用 node 的，对于 node 我们最喜欢也最常用的是 mongodb。

IndexDB 和 mongo 类似 是一个 nosql 数据库，并且非常像 redis，是一个 键值数据库，所以这货所存储的聚合不一定非要是领域对象，任何数据结构都可以，比如list、set、hash
等数据结构，而且支持某些高级的集合操作，比如求 交集/并集/差集 （当然用起来不是一般的麻烦，我觉得 LINQ 才是最好的数据处理方式）

<!-- more -->

### 为什么 IndexDB

那么就需要讲讲为什么要用 IndexDB 了，任何技术都有其适用环境，那么 IndexDB 的优点是什么呢？

- 异步
- key-value 形式保存数据，几乎所有的 js 类型都能被储存在内（数组，对象等）
- 支持事务
- 储存空间极大，最少 250MB，最大可以达到硬盘容量的 20%（域策略限制） * 50%（浏览器策略限制） = 10%
- 支持二进制储存（blob，buffer）

显而易见的这货是一个 _数据库_ 。

那么应用的场景就很明确了，比如你需要前端数据库的时候自然而然的就会考虑用上他了。

比如，你作为一个浏览器端的工具，需要离线使用，并且你是一个 博客编辑器，那就很有意思了，假设断网了，你的 post 岂不是不能用？当然不是的，结合 pwa + IndexDB，他可以在脱机情况下正常使用，直至网络恢复，在重新使用 IndexDB 内部的数据同步到服务器。

这是一个合理的应用场景，因为 localstorage 不能很好的支持图片缓存，而 IndexDB 却能很好的提供支持。

更有意思的是，你离线的时候，由于博文的内容已经被下载下来，那么自然而然的，脱机情况下你可以访问任何已经被缓存的数据，甚至像有网络的时候一样去用它。

### 兼容性


![image-20200630164112604](https://cdn.iceprosurface.com/upload/md/2020-06-30/164157-8lwrxN.png)

### 怎么使用？

IndexDb 原生的概念有点复杂，并且包含了很多数据库相关的知识，如果有数据的经验，你会更好的掌握他的使用方法。

不过由于IndexDB 的 API 过于接近底层，事实上远远不如 sql 来的直观好用。

#### IndexDB 的对象

- 数据库对象 
- 对象仓库
- 索引
- 事务
- 操作请求
- 指针
- 主键集合

对于 IndexDB我这里只是简单的讲述一下如何建立一个数据库并且链接，如何增删改查，更加细节的内容则不多赘述，建议前往 MDN 学习 / 或者看 阮老师的 相关博客[^3]

这里简单的列一下详细内容建议参考 wangDoc.com[^2]

```javascript
var request = window.indexedDB.open(databaseName, version);
var db;
// 新建数据库
request.onupgradeneeded = function (event) {
  db = event.target.result;
  var objectStore;
  if (!db.objectStoreNames.contains('person')) {
    objectStore = db.createObjectStore('person', { keyPath: 'id' });
  }
  // 建立主键
  var objectStore = db.createObjectStore(
    'person',
    { autoIncrement: true }
  );
  // 添加一条记录
  var request = db.transaction(['person'], 'readwrite')
    .objectStore('person')
    .add({ id: 1, name: '张三', age: 24, email: 'zhangsan@example.com' });

}

```

### 更好的解决方案

原生的 IndexDB 讲句实话，非常的不直观，也不符合正常的使用逻辑。

那么有更好的解决方案么？

当然有的，那就是 [dexieJs](https://dexie.org/) ！

![dexieJs](https://cdn.iceprosurface.com/upload/md/2020-06-30/QQ20200704-132531%402x.png)

这是一套相对简单的 ORM 框架（个人认为），他提供了一套更加符合直觉和用户常用习惯的 api 辅助使用。

那么如何使用捏，这边举一个例子：

```javascript
import Dexie from 'dexie';
export const db = new Dexie('pcr_sim');
/**
 * @interface IDRole
 * @property {string} jp_name
 * @property {string} cn_name
 * @property {number} id
 * @property {number} star
 */
/**
 * @interface IDRoleName
 * @property {string} name
 * @property {string} role_id
 */
db.version(2).stores({
  /** 角色列表，用于定向精确查找 **/
  roles: '&id,jp_name,cn_name,star',
  /** 角色名字列表，包含 jp 和 cn **/
  roleName: '[name+role_id]',
  /** 人物列表 **/
  box: '&id',
  /** 活动表 **/
  activity: 'id,*time_start,*time_end,type,json',
  /** 模拟缓存表 **/
  sim: 'id++,uid,time,json,seed',
  /** 模拟用户表 seed 是种子 **/
  simUser: 'id, seed',
  /** 模拟用户在给定时间的卡池 **/
  simBox: 'uid, role_id, time',
});
function logErr(e) {
  console.error(e.stack || e);
}
/**
 * work should never call this
 * @type {IRole[]}
 * @param jsons
 */
export function createOrUpdateRoleDb(jsons) {
  return db
    .transaction('rw', db.roles, db.roleName, async () => {
      const roles = jsons.map((v) => ({
        id: v.id,
        jp_name: v.id,
        cn_name: v.cn_name,
        star: 1,
      }));
      const names = [];
      jsons.forEach(({ cn_name, nick_names, jp_name, id }) => {
        names.push({ name: cn_name, role_id: id });
        names.push({ name: jp_name, role_id: id });
        nick_names &&
          nick_names.forEach((nick_name) => {
            names.push({
              name: nick_name,
              role_id: id,
            });
          });
      });
      await db.roles.bulkPut(roles);
      await db.roleName.bulkPut(names);
    })
    .catch(logErr);
}

/**
 * @param {Array<{id: number, time_start: number, time_end: number, type: string, json: Object}>} jsons
 */
export function createOrUpdateActivity(jsons) {
  return db
    .transaction('rw', db.activity, async () => {
      await db.activity.clear();
      return db.activity.bulkAdd(jsons);
    })
    .catch(logErr);
}

/**
 * @param {Array<{id: number, star: number}>} json
 * @return {PromiseExtended<unknown>}
 */
export function updateRoleStars(json) {
  return db.transaction('rw', db.roles, async () => {
    await db.roles.bulkPut(json);
  });
}

/**
 *
 * @param {number} time
 * @return {Promise<Array<{id: number, time_start: number, time_end: number, type: string, json: {pick_up: (string|number|IDRole)[][], is_double: boolean}}>>}
 */
export function getActivityBeforeTime(time) {
  return db.activity.where('time_start').below(time).toArray();
}
/**
 * 依照 id 查找指定role
 * @param {number} id
 * @return {Promise<IDRole>}
 */
async function getRoleById(id) {
  return db.roles.get(id);
}

/**
 *
 * @param {string} name
 * @return {Promise<IDRole[]>}
 */
export async function getRoleByName(name) {
  const data = await db.roleName
    .where(['name', 'role_id'])
    .between([name, Dexie.minKey], [name, Dexie.maxKey])
    .first();
  if (!data) {
    return null;
  }
  return getRoleById(data.role_id);
}
```

就比如上面这些 db 操作常见的增删改查都出现了，基本可以覆盖绝大部分使用情况了。

> [这里](https://dexie.org/docs/Tutorial/Getting-started) 有新手教学，以及更加详细的 API

### 注意事项

这里值得注意的是，IndexDB 也有着和 后端数据库一样的问题，就是批量修改远大于多次修改。

反应在 dexie 上就是：

10000 个 role 的创建需要约 18秒，而 bulkAdd 或者 bulkPut 只需要约 70 - 120
毫秒不到。如果添加了主键索引则速度可以更快。

> 当然你插入的时候可以不用 await 来显著的提升性能，卡浏览器的事儿能叫提升性能么，什么叫做卡死标签页【战术后仰】

当然咯，受限于实现，如果按照后端的那种方式去用的话，相比较后端成熟的 MySQL/MariaDB/PostgreSQL/Oracle
 等数据库简直慢的如牛爬，但是对于前端这种，对于查询时间相对并不是太过敏感的使用环境，其查询速度的缺点已经被其巨大的优势所掩盖，当然事实上我们还有一个更加强大的工具 —— websql（可惜这货只有chrome 可怜巴巴的支持。）
 


[^1]: [https://chromiumcodereview.appspot.com/21680002](https://chromiumcodereview.appspot.com/21680002)
[^2]: [https://wangdoc.com/javascript/bom/indexeddb.html](https://wangdoc.com/javascript/bom/indexeddb.html)
[^3]: [http://www.ruanyifeng.com/blog/2018/07/indexeddb.html](http://www.ruanyifeng.com/blog/2018/07/indexeddb.html)
