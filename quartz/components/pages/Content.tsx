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
          <p><b>作者授权：</b>本文由 icepro 原创编译并授权刊载发布。</p>
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
    <p>
      <b>
        查看源码：
      </b>
      <a target="_blank" href={`https://github.com/iceprosurface/quartz-blog/blob/v4/${fileData.filePath}?plain=1`} title="在 github 上查看源码">
        <svg style="height: 12px;" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f" /></svg>
      </a>
    </p>
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
