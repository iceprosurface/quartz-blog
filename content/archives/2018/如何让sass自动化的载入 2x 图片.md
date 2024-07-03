---
title: 如何让sass自动化的载入 2x 图片
date: 2018-09-27T06:16:46+08:00
tags:
  - css
comments: true
updated: 2024-07-03T14:54:07+08:00
permalink: /2018/09/26/2018/auto-bg-with-sass/
ccby: true
---



## 起因



这不用说，那肯定是工作上提供的问题了，无非是现在需要兼容 2x 图片了，pc 需要支持 真 · 2k屏，所以理所应当的加入对 2x 图片的支持了。



作为一个程序员，总是做重复性质的劳动总是不太开心的，所以对此，我认为和设计师好好沟通一下，产出可以自动载入2x图才是上策，所以便有了一下解决方案！



<!-- more -->

## 解决方案



### 1. 命名要求



对于我们的设计大大们，通常他们会选择使用如下方式添加后缀：



- -2x
- _2x
- @2x



对于1x图也有如下不同的命名方式



- -1x
- _1x
- @1x
- 



> 上面那个空点点没看错，就是根本没加



所以个人认为有必要叫设计大大们统一成 @${number}x的形势，好在设计大大们对此非常支持，本次交涉还是挺成功的。



随后双方对于把 1x图和2x图放置一个文件夹以方便大家载入上保持了一致的原则。



### 2. 编写批量脚本



对于图片的更新方面，我方碰到需要改图的次数数不胜数，由于采用的是node-sass 没有campass那些好用的 width 和 height 函数，只能依赖于一些其他的辅助脚本去生成这些代码了，对此寄出神器 node！



```js
const klaw = require('klaw');
const fs = require('fs-extra');
const path = require('path');
const fileRegex = /\.([^\.]+)$/;
const sharp = require('sharp');
const is_1x_pic = /[\@\-\_]1x\.([^\.\\\/]+)$/i;
const is_xx_pic = /[\@\-\_][2-9]x\.([^\.\\\/]+)$/i;
const nameRegex = /([\@\-\_][\d]x)?\.([^\.\\\/]+)$/i;
let items = [];

function readExt(filename) {
    if (fileRegex.test(filename)) {
        return filename.match(fileRegex)[1];
    }
    return null
}
async function readAsStat(path) {
    var image = sharp(path);
    return image
        .metadata()
        .then(function (metadata) {
            return {
                width: metadata.width,
                height: metadata.height
            }
        });
}
klaw(path.resolve(__dirname, 'imgs'))
    .on('readable', function () {
        while ((item = this.read())) {
            items.push(item.path)
        }
    })
    .on('end', async () => {
        items.sort();
        let out = '';
        let promiseList = items.map(async function (item) {
            return await new Promise(async function (resolve) {
                var from = path.resolve(__dirname, 'sass');
                var relativeFile = path.relative(from, item);
                if (is_xx_pic.test(relativeFile)) {
                    console.log('@xx pic out: ', relativeFile);
                    resolve();
                    return
                }
                var newName = relativeFile
                    .replace('../', '')
                    .replace(nameRegex, '')
                    .replace(/[\\\/]/g, '_');


                var ext = readExt(relativeFile);

                if (ext) {
                    if (['jpg', 'png', 'jpeg', 'svg'].indexOf(ext) < 0) {
                        console.log('ext pic out of', relativeFile);
                        resolve();
                        return;
                    }

                    switch (ext) {
                        case 'jpeg':
                        case 'jpg':
                        case 'png':
                            var data = await readAsStat(item);
                            out += '$' + newName + '-o: ' + ' url(' + relativeFile + ');\n';
                            out += '$' + newName + '-width: ' + data.width + 'px;\n'
                            out += '$' + newName + '-height: ' + data.height + 'px;\n'
                            out += '\n';
                            break;
                        case 'svg':
                            out += '$' + newName + '-o: ' + ' url(' + relativeFile + ');\n';
                            break;
                        default:
                    }
                } else {
                    console.log('passed ext: ' + item)
                }
                resolve();
            })

        });
        await Promise.all(promiseList);

        fs.outputFileSync('./img.scss', out);
    });
```



像我这么懒的人肯定不愿意自己写乱七八糟的循环的，直接掉了好几个库解决问题：



- Klaw 文件夹遍历库
- Fs-extra fs库的超集，提供更多的同步方法，和更加好用的快捷的api
- sharp node届的图片处理库扛把子（好吧好吧，其实还有依赖本地环境的 sharp，比较 imagemagic 还是大佬）



这样依托上述脚本可以吧代码统一的输出为这种格式：



```scss
$path_to_image-image-name-o: url(path/to/image/image-name);
```



对于 1x 图和 2x 也会机智的合并成同一份变量，然后呢！我们就可以使用一个统一的 sass 函数来处理这些图片了！



当当当当！



### 3. sass 函数

首先需要几个基础方法，首先是字符串替代函数，利用递归就可以完成，easy的



```scss
@function str-replace($string, $search, $replace: '') {
  $index: str-index($string, $search);
  @if ($index) {
    @return str-slice($string, 1, $index - 1) + $replace + str-replace(str-slice($string, $index + str-length($search)), $search, $replace);
  }
  @return $string
}
```



然后编写一个函数用来转换 nx 图

```scss
$file-prefix: ('png', 'jpg', 'gif');

/**
 * @desc 图片自动转换 2x
 * @param {path} $bg-path
 */
@function auto-bg-src ($bg-path) {
  $bg-path: unquote($bg-path);
  $bg-path: str-replace($bg-path, 'url(');
  $bg-path: str-replace($bg-path, ')');
  $bg-path-x: str-replace($bg-path, "@1x", '@2x');
  @return image-set(url('#{$bg-path}') 1x, url('#{$bg-path-x}') 2x);
}
```



好的机智的大家一定会想到下面一个操作：

```scss
@mixin auto-bg-2x ($path) {
  $index: str-index($path, '.svg');
  $has2x: str-index($path, '@1x');
  @if ($index) {
    background-image: $path;
  } @else {
    background-image: $path;
    @if ($has2x) {
      background-image: auto-bg-src($path);
    }
  }
}
```



好了怎么用呢？



机智的大家一定会想到来这么用：



![image-20180927164454726](https://cdn.iceprosurface.com/upload/md/2018-09-27-084455.png)



神一般的变量提示有木有！（icepro疯狂按时安利webstorm中）



如果在 npm script 加入脚本运行，那么出现图片更新而大小变更的情况，那么只需要使用 npm run img && npm run build 这样的命令就可以了，是不是很方便？