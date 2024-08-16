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
            <div>
              <span style="margin-right: 4px">
                Comments by <a href="https://twikoo.js.org" target="_blank">Twikoo</a>
              </span>
              <span>,</span>
            </div>
            <div>
              <span style="margin-right: 4px">Site by</span>
              <span>
                <a href="https://github.com/jackyzha0/quartz" target="_blank">quartz</a>
              </span>
              <span>,</span>
            </div>
            <div>
              <span style="margin-left: 8px">
                <a href="https://status.iceprosurface.com/" target="_blank">站点状态</a>
              </span>
            </div>
          </div>
        </div>
        <div class="extra-footer-link">
          <a class="planet-shuttle" target="_blank" href="https://www.boyouquan.com/planet-shuttle">「博友圈 · 星球穿梭」</a>
          <a class="footer-link" target="_blank" href="https://www.boyouquan.com/home">博友圈</a>
        </div>
      </footer>
    )
  }

  // 不知道为什么修改这个没有作用
  Footer.css = footerCss + Rss.css
  return Footer
}) satisfies QuartzComponentConstructor
