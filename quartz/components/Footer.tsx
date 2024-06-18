import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import footerCss from "./styles/footer.scss";
import { Rss } from "./Rss";
interface Options {
  links: Record<string, string>
}
export default ((opts?: Options) => {
  const Footer: QuartzComponent = (setting: QuartzComponentProps) => {
    const { displayClass, cfg } = setting;
    const year = new Date().getFullYear()
    return (
      <footer class="footer" id="footer">
        <div class="outer">
          <div class="footer-left">
            <span>© {year} icepro</span>
            <Rss {...setting} />
          </div>
          <div class="footer-right">
            <span style="margin-right: 4px">
              Comments by <a href="https://twikoo.js.org" target="_blank">Twikoo</a>
            </span>
            <span style="margin-right: 4px">,Site by</span>
            <span>
              <a href="https://github.com/jackyzha0/quartz" target="_blank">quartz</a>
            </span>
            <span style="margin-left: 8px">
              <a href="https://status.iceprosurface.com/" target="_blank">站点状态</a>
            </span>
          </div>
        </div>
      </footer>
    )
  }

  // 不知道为什么修改这个没有作用
  Footer.css = footerCss + Rss.css
  return Footer
}) satisfies QuartzComponentConstructor
