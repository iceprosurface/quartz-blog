---
title: 用户自定义icon的纯色显示
date: 2018-01-21T21:33:15+08:00
tags:
  - 工具
  - vue
comments: true
permalink: /2018/01/21/2018/custom-icon/
updated: 2024-07-03T14:54:14+08:00
ccby: true
---

## 1. 需求

核心问题:

1. 用户上传图片大小不一致,需要处理为相同大小
2. 用户上传的图片可能并不符合显示要求(纯色,所以在上传或者预览阶段就应当先预处理成合适的颜色)

运行环境为: 

1. 移动端,不考虑桌面端显示
2. 默认用户浏览器支持html5
3. 视图框架 vue

这里暂不清楚需求是需要在编辑阶段就转化图片还是在显示阶段才转化图片,但是从逻辑上来讲,应该在编辑阶段就处理掉图片,所以这里暂实现一个组件以在前端处理图片样式.

ps: 

其他解决方案:

由于用户上传的是图片,实际上是可以使用 svg + filter 的方式实现的,这里笔者暂不展开,具体可以百度

## 2. 实现

对于前端像素级操作,无非就使用一下canvas处理,这里对canvas的使用还是得心应手的.



```javascript
// img 为图片
// this.color 数组包含 [r, g, b, a]
this.ctx.drawImage(img, 0, 0, 100, 100)
var c = this.ctx.getImageData(0, 0, img.width, img.height)
for (let i = 0; i < c.height; ++i) {
    for (let j = 0; j < c.width; ++j) {
        let x = i * 4 * c.width + 4 * j
        let a = c.data[x + 3]
        // 有像素的地方才去处理,否则就不要去动
        if (a > 0) {
        c.data[x] = parseInt(this.color[0])
        c.data[x + 1] = parseInt(this.color[1])
        c.data[x + 2] = parseInt(this.color[2])
        c.data[x + 3] = parseInt(this.color[3]) // 透明度0表示完全透明
      }
    }
}
this.ctx.putImageData(c, 0, 0, 0, 0, 100, 100)
```

> 这里只显示一个基础的icon组件, 图片裁切方面应当在此前就已经实现了

```html
<template>
  <div class="canvas-icon">
    <canvas ref="canvas" width="100" height="100"></canvas>
  </div>
</template>
<script>
export default {
data () {
    return {
      ctx: null
    }
  },
  props: {
    img: {},
    color: {
      default: function () {
        return [
          255,
          255,
          255,
          255
        ]
      }
    }
  },
  methods: {
    draw (img) {
      this.ctx.drawImage(img, 0, 0, 100, 100)
      let c = this.ctx.getImageData(0, 0, img.width, img.height)
      for (let i = 0; i < c.height; ++i) {
        for (let j = 0; j < c.width; ++j) {
          let x = i * 4 * c.width + 4 * j
          let a = c.data[x + 3]
          if (a > 0) {
            c.data[x] = parseInt(this.color[0])
            c.data[x + 1] = parseInt(this.color[1])
            c.data[x + 2] = parseInt(this.color[2])
            c.data[x + 3] = parseInt(this.color[3]) // 0表示完全透明
          }
        }
      }
      this.ctx.putImageData(c, 0, 0, 0, 0, 100, 100)
      this.$emit('dataEventListener', this.$refs.canvas.toDataURL('image/jpeg'))
    },
    loadImage () {
      let img = new Image()
      img.src = this.img
      img.onload = () => {
        this.draw(img)
      }
    }
  },
  mounted () {
    let canvas = this.$refs.canvas
    this.ctx = canvas.getContext("2d")
    this.loadImage()
  },
  watch: {
    img () {
      this.loadImage()
    }
  }
}
</script>

<style lang="less" scoped></style>
```





