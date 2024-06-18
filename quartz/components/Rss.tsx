import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import RssStyle from "./styles/rss.scss"

export const Rss: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  return (
    <div class="rss">
      <a href="/index.xml" target="_blank">
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4268" >
          <title>rss</title>
          <path d="M554.666667 896c-25.6 0-42.666667-17.066667-42.666667-42.666667 0-187.733333-153.6-341.333333-341.333333-341.333333-25.6 0-42.666667-17.066667-42.666667-42.666667s17.066667-42.666667 42.666667-42.666666c234.666667 0 426.666667 192 426.666666 426.666666 0 25.6-17.066667 42.666667-42.666666 42.666667z" p-id="4269"></path><path d="M853.333333 896c-25.6 0-42.666667-17.066667-42.666666-42.666667 0-354.133333-285.866667-640-640-640-25.6 0-42.666667-17.066667-42.666667-42.666666s17.066667-42.666667 42.666667-42.666667c401.066667 0 725.333333 324.266667 725.333333 725.333333 0 25.6-17.066667 42.666667-42.666667 42.666667z" p-id="4270"></path><path d="M213.333333 810.666667m-85.333333 0a85.333333 85.333333 0 1 0 170.666667 0 85.333333 85.333333 0 1 0-170.666667 0Z" p-id="4271"></path>
        </svg>
      </a>
    </div>
  )
}

Rss.css = RssStyle
export default (() => Rss) satisfies QuartzComponentConstructor