import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface Options {
  links: Record<string, string>
}
export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class="footer" id="footer">
        <div class="outer">
          <div class="footer-left">
            © {year} icepro
          </div>
          <div class="footer-right">
            powered by
            <a href="https://github.com/jackyzha0/quartz" target="_blank">quartz</a>
          </div>
        </div>
      </footer>
    )
  }

  // 不知道为什么修改这个没有作用
  Footer.css = `
footer#footer {
  font-size: 12px;
  font-family: Menlo, Monaco, "Andale Mono", "lucida console", "Courier New", monospace;
  text-shadow: 0 1px #fff;
  opacity: 0.6;
  text-align: center;
  margin-bottom: 24px;
  margin-top: 12px;
}
footer#footer a {
  background: rgba(0, 0, 0, 0);
  text-decoration: none;
  color: #08c;
}
footer#footer .outer {
  display: flex;
  justify-content: space-between;
}`;
  return Footer
}) satisfies QuartzComponentConstructor
