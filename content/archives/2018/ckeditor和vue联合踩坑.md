---
title: ckeditor和vue联合踩坑
date: 2018-01-19T05:16:46+08:00
tags:
  - vue
  - 前端
  - 富文本编辑器
comments: true
updated: 2024-07-03T14:54:22+08:00
permalink: /2018/01/18/2018/ckeditor/
ccby: true
---

## 背景

系统使用的vue 1.0， 这里使用的 所见即所得的 ckeditor编辑器作为文本内容输入使用的编辑器。

我们知道ckeditor是一个不错的文本编辑器，但是他的文档配置的使用都并不那么简单。

首先他有一套自由的构建手段，和 cmd/amd 加载都不同，其中其数据和交互使用方面都有自己一套规则，和其他编辑器一样，使用了一些特有的操作模式。

在初期选用ckeditor作为编辑器，纯粹只是偷懒，但是没想到的是没有好好选型编辑器带来的坑有这么大，这篇笔记一来是做个记录，二来是为了防止后面使用ckeditor的不要踩相同的坑

## 功能实现和问题

### 实现一个即时显示

需要实现一个数据即时显示在预览区的功能，所以这里呢使用如下功能显示：


<!-- more -->

```javascript
export default  {
    props: {
        value: {}
    },
    data () {
        return {
            lock: false,
            editor: null,
        }
    },
    ready () {
        CKEDITOR.replace(this.id, this.config)
        this.editor = CKEDITOR.instances[this.id]
        this.editor.setData(this.value)
        this.editor.on('blur', (event) => {
            this.lock = false
            this.value = this.editor.getData()
            this.$emit('blur', event, this.editor.getData())
        })
        this.editor.on('change', (event) => {
            this.value = this.editor.getData()
            this.$emit('change', event, this.editor.getData())
        })
        this.editor.on('focus', (event) => {
            this.lock = true
            this.$emit('focus', event, this.editor.getData())
        })
    },
    watch: {
        'value'(newVal, oldVal){
            if (!this.lock) {
                CKEDITOR.instances[this.id].setData(newVal)
            }
        }
    }
    
}
```

将value设置为 sync双向绑定即可，如果有vuex的大可直接用vuex来控制。如果是2.0，又没有使用vuex的可以选择用callback更新即可

### 拷贝上传图片/附件

由于搜索了一圈上传组件，基本没有一个组件可以使用在这里，所以这里拷贝上传图片的功能只能自己来实现了。

目前word的拷贝有专门的方法可以获取，但是这里没有时间研究了，所以就不多写过程了。

对于简单的paste的情况，我大致分为两种情况

第一种是图片，第二种是附件，无论是图片还是附件，都需要将内容上传到服务器，这里选用锚点的方式，在html中定锚，随后使用替换src/href的方式来更新内容


首先锚点需要定一个独立的guid，这里就用最常见的guid的方式取生成，这个随机生成一个一下就好了，发生碰撞的概率很低，可以大胆使用

```javascript
export default function guid () {
    function S4 () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4())
}
```

随后在ckeditor上绑定paste，并通过emit调给父级

```javascript
export default {
    data: {
        // 如果需要可以用progress生成进度条
        progress: 0,
        max: 0,
        editor: null,
        cb: null
    },
    methods: {
        isBase64 (dataUrl) {
            return /^data:image\/[\w\W]+;base64,/.test(dataUrl.substr(0, 100))
        },
        paste (event, done) {
        // 注意done是类似于 cb 的操作,接受格式为: {data:<image|attach>, id: <uuid>, type: <'image'|'attach'> ,[name: <file.name>]}
        // 走图片上传通道处理
        if (event.data.dataTransfer.getFilesCount() > 0) {
            let templateDom = document.createElement('div')
            let fileUploadList = []
            this.progress = 0
            this.max = event.data.dataTransfer.getFilesCount()
            for (let i = 0; i < event.data.dataTransfer.getFilesCount(); i++) {
                // 这里可以直接从ck的event时间里面获取到file，并且直接走的二进制流
                // 不需要转换
                let file = event.data.dataTransfer.getFile(i)
                let fd = new FormData()
                // 上id
                let id = 'guid' + guid()
                fd.append('FromFile', file, file.name)
                // 有file的先检查是不是图片,是图片的直接转img,不是的转附件
                if (file.type.indexOf("image/") !== -1) {
                    let img = document.createElement('img')
                    img.id = id
                    templateDom.appendChild(img)
                    // 走图片接口,并插入img标签
                    fileUploadList.push(uploadImg(fd)
                        .then(data => {
                            this.progress += 1
                            return window.Promise.resolve({
                                data: data,
                                id,
                                type: 'image'
                            })
                        })
                    )
                } else {
                    // 走附件接口,并插入a标签
                    let attach = document.createElement('a')
                    attach.id = id
                    templateDom.appendChild(attach)
                    fileUploadList.push(uploadAttach(fd)
                     .then(data => {
                         this.progress += 1
                         return window.Promise.resolve({
                             data: data,
                             id,
                             type: 'attach',
                             name: file.name
                         })
                     })
                    )
                }
                // 后面加个空格!防止连续的附件看不清楚间隙
                let space = document.createElement('span')
                space.innerHTML = ' '
                templateDom.appendChild(space)
            }
            event.data.dataValue = templateDom.innerHTML
            window.Promise.all(fileUploadList)
                .then((list) => {
                    done(list)
                    templateDom.remove()
                })
                .catch((e) => {
                    this.$alert('图片或附件上传失败!', 'center', 'fail')
                })
            return
        }
        // 走富文本通道处理
        let item = event.data.dataTransfer.getData('text/html')
        let templateDom = document.createElement('div')
        templateDom.innerHTML = item
        // 这里偷懒用了jquery，用原声也是可以的，比如queryselectall
        let $templateDom = $(templateDom)
        let imgs = $templateDom.find('img')
        this.progress = 0
        this.max = imgs.length
        let imglist = []
        imgs.each((i, item) => {
            let src = item.src
            if (!this.isBase64(src)) {
                // 不是base64不处理
                return
            }
            let id = 'guid' + guid()
            item.id = id
            let arr = src.split(','),
                mime = arr[0].match(/:(.*?;)/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n)
            // 先转Unit8Array在通过blob封装mime最后走formdata上传
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            let fd = new FormData()
            fd.append('FromFile', new Blob([u8arr], {type: mime}), 'img.png')
            imglist.push(uploadImg(fd)
                .then(data => {
                    item.src = data.url
                    this.progress += 1
                    return window.Promise.resolve({
                        data: data,
                        id,
                        type: 'image'
                    })
                })
            )
        })
        event.data.dataValue = templateDom.innerHTML
        if (imgs.length === 0) {
            // 如果imgs是空的直接返回就可以，就是没有插入任何图片
            return $templateDom.remove()
        }
        window.Promise.all(imglist)
            .then((list) => {
                done(list)
                $templateDom.remove()
            })
            .catch(e => {
                console.error(e)
                this.$alert('图片上传失败!', 'center', 'fail')
            })
        }
    }
}
```

我们在ckeditor.vue中可以这样绑定paste，当然如果上传流程是确定的话也不需要这样绑定，直接吧上述内容放置在ckeditor中即可

```javascript
// this.editor 就是CKEDITOR.instance[id]取出来的内容
// 可以选择在合适的时机绑定即可
this.editor.on('paste', (event) => {
    this.$emit('paste', event, (list) => {
        for (let item of list) {
            if (item.type === 'image') {
                let obj = this.editor.document.findOne('img#' + item.id)
                obj.setAttribute('id', '')
                obj.setAttribute('src', item.data.url)
                obj.data('cke-saved-src', item.data.url)
            }
            if (item.type === 'attach') {
                let obj = this.editor.document.findOne('a#' + item.id)
                obj.setAttribute('id', '')
                obj.setAttribute('href', item.data.path)
            }
        }
        this.value = this.editor.getData()
    })
})
```

### 插入连接

这个功能是最困难的一步，好在在Stack Overflow小伙伴的帮助下成功找到了可以借鉴的组件link

由于我们需要插入连接，但是实际上问题最大的是编写一个合适plugin去处理这些操作，从我的角度来讲，ck 呼出的plugin有他自有的规则，最好的方案是通过按钮呼出到vue，执行完成后，使用callback回调那就是最好的。

不得不说，文档全还是有好处的ck这里提供了比较详细的plugin介绍让我们来学习，大体可以参见 [官方文档](https://docs.ckeditor.com/ckeditor4/docs/#!/guide/plugin_sdk_sample)

反正声明一个 plugin 大致使用这种方法：

```javascript
CKEDITOR.plugins.add( 'timestamp', {
    icons: 'timestamp',
    init: function( editor ) {
        //Plugin logic goes here.
    }
});
```

照着葫芦画瓢还是简单的

```javascript
CKEDITOR.plugins.add('linkage', {
	icons: 'linkage', 
	lang: 'zh', 
	hidpi: true,
	init: function (editor) {
		 // 这里添加一个命令到时候用来执行内容
		 editor.addCommand('linkage', {
			exec: function () {
				editor.fire('linkage', function (link) {
					// 这里是linkage的回调了
				});
			}
		 });
		 // 这里添加一个按钮
		 editor.ui.addButton && editor.ui.addButton('LinkageToken', {
			 label: '链接',
			 command: 'linkage',
			 toolbar: 'insert,8',
			 icon: this.path + 'icons/linkage.png'
		 });

	}
});
```

然后不难使用,类似于这种方式怼给vue就可以了，不难操作，我们通过回调来将link更新到ckeditor

```javascript
this.editor.on('linkage', (event, cb) => {
    this.$emit('linkage', event, cb)
})
```

然后下面就是最大的难点了，怎么划分一个a标签，我们知道html可以这么写

```html
<span>aaa</span><span><span>bbbu <u>sss</u><sup>ssss</sup></span></span><span>sss</span>
```

我们可以从 aaa 的第二个字开始一路划到sss的的第二个字，还有跨层划分等等。

不过好在，我们有一个相对现成的组件可以借鉴，就是系统中自带的link组件，这个组件复杂度很高，非常难借鉴，但是要想抄过来勉强用下还是办得到的


这个组件提供了比较多不同类型的上a标签的形式，我们不排除以后会用，最好的手段就是保留那些功能。

首先他提供了一个基础的plugin的组件，叫 link，

这个组件我们可以直接拿来用，里面提供一些基础方法，然后非常暴力的抄袭一下link中找到的一些方法

```javascript
var plugin = CKEDITOR.plugins.link,
	initialLinkText;
function insertLinksIntoSelection (editor, data) {
	var attributes = plugin.getLinkAttributes(editor, data),
		ranges = editor.getSelection().getRanges(),
		style = new CKEDITOR.style({
			element: 'a',
			attributes: attributes.set
		}),
		rangesToSelect = [],
		range,
		text,
		nestedLinks,
		i,
		j;
	style.type = CKEDITOR.STYLE_INLINE; // need to override... dunno why.
	for (i = 0; i < ranges.length; i++) {
		range = ranges[i];
		// Use link URL as text with a collapsed cursor.
		if (range.collapsed) {
			// Short mailto link text view (http://dev.ckeditor.com/ticket/5736).
			text = new CKEDITOR.dom.text(data.linkText ||
				(data.type == 'email' ? data.email.address : data.default || attributes.set['data-cke-saved-href'] ), editor.document);
			// text.setAttribute("style","text-decoration:none;")
			range.insertNode(text);
			range.selectNodeContents(text);
		} else if (initialLinkText !== data.linkText) {
			text = new CKEDITOR.dom.text(data.linkText, editor.document);
			// Shrink range to preserve block element.
			range.shrink(CKEDITOR.SHRINK_TEXT);
			// Use extractHtmlFromRange to remove markup within the selection. Also this method is a little
			// smarter than range#deleteContents as it plays better e.g. with table cells.
			editor.editable().extractHtmlFromRange(range);
			range.insertNode(text);
		}
		// Editable links nested within current range should be removed, so that the link is applied to whole selection.
		nestedLinks = range._find('a');
		for (j = 0; j < nestedLinks.length; j++) {
			nestedLinks[j].remove(true);
		}
		// Apply style.
		style.applyToRange(range, editor);
		rangesToSelect.push(range);
	}
	editor.getSelection().selectRanges(rangesToSelect);
}
function createRangeForLink (editor, link) {
	var range = editor.createRange();
	range.setStartBefore(link);
	range.setEndAfter(link);
	return range;
}
function editLinksInSelection (editor, selectedElements, data) {
	var attributes = plugin.getLinkAttributes(editor, data),
		ranges = [],
		element,
		href,
		textView,
		newText,
		i;
	for (i = 0; i < selectedElements.length; i++) {
		// We're only editing an existing link, so just overwrite the attributes.
		element = selectedElements[i];
		href = element.data('cke-saved-href');
		textView = element.getHtml();
		element.setAttributes(attributes.set);
		element.removeAttributes(attributes.removed);
		if (data.linkText && initialLinkText != data.linkText) {
			// Display text has been changed.
			newText = data.linkText;
		} else if (href == textView || data.type == 'email' && textView.indexOf('@') != -1) {
			// Update text view when user changes protocol (http://dev.ckeditor.com/ticket/4612).
			// Short mailto link text view (http://dev.ckeditor.com/ticket/5736).
			newText = data.type == 'email' ? data.email.address : attributes.set['data-cke-saved-href'];
		}
		if (newText) {
			element.setText(newText);
		}
		ranges.push(createRangeForLink(editor, element));
	}
	// We changed the content, so need to select it again.
	editor.getSelection().selectRanges(ranges);
}

```
 
接下来我们在应用以上代码前需要对内容作出一定的预处理

```javascript
 editor.addCommand('linkage', {
// var plugin = CKEDITOR.plugins.link,
 // initialLinkText;
    exec: function () {
        // 获得选区
        var selection = editor.getSelection(),
            // 直接调用plugin的元素获得element
            elements = plugin.getSelectedLink(editor, true),
            firstLink = elements[0] || null;
        // 下面良好照抄的
        if (firstLink && firstLink.hasAttribute('href')) {
            // Don't change selection if some element is already selected.
            // For example - don't destroy fake selection.
            if (!selection.getSelectedElement() && !selection.isInTable()) {
                selection.selectElement(firstLink);
            }
        }
        // 我尝试用这个plugin提供的方法去获得一下内容，实际上并没有什么用
        var data = plugin.parseLinkAttributes(editor, firstLink);
        initialLinkText = editor.getSelection().getSelectedText();
        // 响应一个linkage事件
        editor.fire('linkage', function (link, defaultTitle) {
            // 这里是linkage的回调了
            // 实际上data应该是取不到任何数据的，直接就是{}
            if (data.url) {
                data.url = {}
            }
            data.url.protocol = ''
            data.url.url = link
            // 有默认名称的时候上默认名称，没有那就直接上url，和link保持一致即可
            data.default = defaultTitle
            data.linkText = initialLinkText
            data.type = 'url'
        });
    }
 });
```

此后使用只需要在响应一次linkage event后，记下cb，随后，cb(url) 即可

这里同样也有一个问题，那就是：

当url是这样的时候：


```html
<a href="aaa">aaa</a><span>ccc</span><a href="ddd">ddd</a>
```

试图对该行作出修改时将会碰到一个问题，第一个a标签将永远无法获得，这里，在花费一定时间阅读源码后断定问题是出现在_find这个函数这里

```javascript
/**
 * Looks for elements matching the `query` selector within a range.
 *
 * @since 4.5.11
 * @private
 * @param {String} query
 * @param {Boolean} [includeNonEditables=false] Whether elements with `contenteditable` set to `false` should
 * be included.
 * @returns {CKEDITOR.dom.element[]}
 */
_find: function( query, includeNonEditables ) {
    var ancestor = this.getCommonAncestor(),
        boundaries = this.getBoundaryNodes(),
        // Contrary to CKEDITOR.dom.element#find we're returning array, that's because NodeList is immutable, and we need
        // to do some filtering in returned list.
        ret = [],
        curItem,
        i,
        initialMatches,
        isStartGood,
        isEndGood;

    if ( ancestor && ancestor.find ) {
        initialMatches = ancestor.find( query );

        for ( i = 0; i < initialMatches.count(); i++ ) {
            curItem = initialMatches.getItem( i );

            // Using isReadOnly() method to filterout non editables. It checks isContentEditable including all browser quirks.
            if ( !includeNonEditables && curItem.isReadOnly() ) {
                continue;
            }

            // It's not enough to get elements from common ancestor, because it might contain too many matches.
            // We need to ensure that returned items are between boundary points.
            isStartGood = ( curItem.getPosition( boundaries.startNode ) & CKEDITOR.POSITION_FOLLOWING ) || boundaries.startNode.equals( curItem );
            isEndGood = ( curItem.getPosition( boundaries.endNode ) & ( CKEDITOR.POSITION_PRECEDING + CKEDITOR.POSITION_IS_CONTAINED ) ) || boundaries.endNode.equals( curItem );

            if ( isStartGood && isEndGood ) {
                ret.push( curItem );
            }
        }
    }

    return ret;
}
};
```

问题出在此处 curItem.getPosition 和 boundaries.startNode.equals( curItem ) 这条两处判断全部失效导致，第一个a标签没有被准确的加入

由于实在无法理解 CKEDITOR.POSITION_FOLLOWING 和 boundaries获取的判断依据，所以这个问题最后选择搁置


### blur 的错误使用和click的冲突

原先使用blur时为了确保在离开编辑区的时候，必然会触发一次更新操作，以确保内容是最新的。但是这里带来了一个问题：

由于左侧存在一个列表区域，列表区域内容可以点击后切换内容，在这里操作时， blur优先级在多数情况下低于 click


```javascript
/**
 * Object used to store private stuff.
 *
 * @private
 * @class
 * @singleton
 */
CKEDITOR.focusManager._ = {
    /**
     * The delay (in milliseconds) to deactivate the editor when a UI DOM element has lost focus.
     *
     * @private
     * @property {Number} [blurDelay=200]
     * @member CKEDITOR.focusManager._
     */
    blurDelay: 200
};
```

同时由于ck调用blur也是通过focusManager来实现的，本身存在 约200ms的延迟，不过我这边由于中间本身更新有一定的耗时操作，所以这里最终表现为如果api请求速度够快，在100ms内返回值，那么将会出现以下情况

触发click->触发数据加载->触发blur->触发定时器->数据加载完成，并更新到dom—>定时器函数触发，并更新data到value->触发watch->更新value到ckeditor

非常完美的残留的数据，所以凡是使用blur来更新数据的情况下，都需要在其他操作进行前主动触发blur，并不设置任何延迟

```javascript
if ( CKEDITOR &&  CKEDITOR.instances &&  CKEDITOR.instances[id]) {
    CKEDITOR.instances[id].focusManager.blur(true)
}
```

> 还是没有吸取教训，其实还是对页面上用户行为的可控程度不够高，没有完整的控制器去控制整个编辑器的状态，使得大量异常情况的产生大致也是因为这个原因。


### 内存溢出

其中最严重的溢出需要检讨一下自己，使用了随机id生成ckedior实例，但是在使用完成后并没有销毁带来的问题就是内存爆炸式的增长，这个完全是个人的疏忽导致的错误，并且本可以避免，却最后产生。确实不太应该，好在这个问题还好解决。

第一种方法是接destroy阶段销毁

```javascript
CKEDITOR.instances[id].destroy(true)
```

这样就可以了

第二种是选择不销毁，直接复用，注意setdata的时机要对就可以了

此外就是ckeditor本身的内存溢出问题，其plugin中的filter在许多情况下不能正常回收，并且目前还尚未能确定filter具体产生无法回收内容的原因

## 结语

本次项目踩得坑很多一方面是在构建初期的规划并不良好，一路下来基本上最后全部选择了使用计划方案中 b 或 c 方案，并没有使用相对更好的解决策略，此外经验方面的问题也尤为突出，并没有能够很好的预料到一些写法可能产生的巨坑，操作流程的考虑不周全也是本次产生问题的核心，

最为致命的问题是，由于中途更换了主键方式，将一个 外键 + lang 作为复合主键，导致原先基于 主键 的操作，在累计的修改下混乱甚至崩盘的情况，也是在初期没有完善思考项目整体架构的原因，最后在花费一整个下午打草稿理清整个 `创建/更新/删除` 的流程下才将逻辑理顺。

而其中大量的坑都是在更换外键 + lang 作为符合主键中埋下的。

对于操作复杂，需要横跨多个组件通讯，涉及巨量状态，不同状态间相互影响的情况下，果断的使用 vuex 去集合处理全局的状态更新，而不要使用冒泡的方式去处理。这样能显著降低整体项目的耦合程度，减小代码复杂程度。

此外对于具有可能共性的东西，尽量花时间抽象，泛化，而不要选择跟着需求走，因为需求是在快速变更的，如果直接照抄需求制作项目，显然会出现下一次添加内容会变得繁琐的问题。

