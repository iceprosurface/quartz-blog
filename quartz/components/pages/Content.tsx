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
  const isPageOriginal = Boolean(fileData.frontmatter?.isPageOriginal ?? true);
  const isExcalidraw = fileData.frontmatter?.['excalidraw-plugin'] ?? false;
  if (isExcalidraw) {
    return <Exclidraw {...props} />
  }
  return <article class={classString}>
    {content}
    {permalink && <div class="cc-by">
      <p><b>本文标题：</b>{fileData.frontmatter?.title}</p>
      {permalink && <p><b>本文链接：</b><a href={link}>{link}</a></p>}
      {
        openCCBY && (<p><b>作者授权：</b>{isPageOriginal ? "本文由 icepro 原创编译并授权刊载发布。" : "本文为转载内容，详情见正文标注"}</p>)
      }
      {
        openCCBY && isPageOriginal && <p><b>版权声明：</b>本文使用「署名-非商业性使用-相同方式共享 4.0 国际」创作共享协议，转载或使用请遵守署名协议。</p>
      }
    </div>}
    <script dangerouslySetInnerHTML={{ __html: `window.__comment_id__ = "${permalink}"` }}></script>
    {hasComments && permalink && <div id="tcomment"></div>}
  </article>
}

export default (() => {
  Content.css = (ccByStyle)
  Content.afterDOMLoaded = commentScript + '\n' + Exclidraw.afterDOMLoaded;
  return Content;
}) satisfies QuartzComponentConstructor
