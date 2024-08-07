import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import ccByStyle from '../styles/ccby.scss'
import commentScript from './../scripts/comment.inline'
import { Exclidraw } from './../Excalidraw';
const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree, cfg } = props;
  const content = htmlToJsx(fileData.filePath!, tree)
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")
  const permalink = fileData.frontmatter?.permalink
  // 判断是否是 index 页面
  const isIndex = fileData.filePath?.endsWith('index.md');
  const openCCBY = (fileData.frontmatter?.ccby ?? true) && !isIndex;
  const hasComments = fileData.frontmatter?.comments ?? false;
  const link = `https://${cfg.baseUrl}${permalink}`;
  // 不添加默认原创
  const isPageOriginal = !Boolean(fileData.frontmatter?.['origin-link'] ?? false);
  const isExcalidraw = fileData.frontmatter?.['excalidraw-plugin'] ?? false;
  if (isExcalidraw) {
    return <Exclidraw {...props} />
  }
  const originMeta = {
    link: fileData.frontmatter?.['origin-link']?.toString() ?? '',
    author: fileData.frontmatter?.['origin-author'],
    license: fileData.frontmatter?.['origin-license'],
    note: fileData.frontmatter?.['origin-note'],
  }
  // 如果是非原创的应当把原文链接放在最前面，如果是原创的则放在最后面
  const ccby = (permalink && <div class="cc-by">
    {
      isPageOriginal && (
        <p><b>本文标题：</b>{fileData.frontmatter?.title}</p>
      )
    }
    {permalink && <p><b>永久链接：</b><a href={link}>{link}</a></p>}
    {
      openCCBY && isPageOriginal && (
        <>
          <p><b>作者授权：</b> 本文由 icepro 原创编译并授权刊载发布。</p>
          <p><b>版权声明：</b>本文使用<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans" target="_blank">「署名-非商业性使用-相同方式共享 4.0 国际」</a>创作共享协议，转载或使用请遵守署名协议。</p>
        </>
      )
    }
    {
      !isPageOriginal && (
        <>
          <p><b>原文链接：</b><a href={originMeta.link} target="_blank">{originMeta.link}</a></p>
          {
            originMeta.author && (
              <p><b>原文作者：</b>{originMeta.author}</p>
            )
          }
          {
            originMeta.license && (
              <p><b>原文版权：</b>{originMeta.license}</p>
            )
          }
          {
            originMeta.note && (
              <p><b>修改说明：</b>{originMeta.note}</p>
            )
          }
          <p>此文档仅做存档引用，如有侵权请 <a href="mailto:iceprosurface@gmail.com">邮件</a> 联系我删除，如需转载，请标注原文链接、作者。</p>
          <p></p>
        </>
      )
    }
  </div>)
  return <article class={classString}>
    {!isPageOriginal && ccby}
    {content}
    {isPageOriginal && ccby}
    {hasComments && permalink && <div id="tcomment" data-id={permalink}></div>}
  </article>
}

export default (() => {
  Content.css = (ccByStyle)
  Content.afterDOMLoaded = commentScript + '\n' + Exclidraw.afterDOMLoaded;
  return Content;
}) satisfies QuartzComponentConstructor
