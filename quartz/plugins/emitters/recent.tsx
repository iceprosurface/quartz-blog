import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import BodyConstructor from "../../components/Body"
import HeaderConstructor from "../../components/Header"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { FilePath, FullSlug } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { RecentNotes } from "../../components"
import { defaultProcessedContent } from "../vfile"
import { write } from "./helpers"
import DepGraph from "../../depgraph"

export const RecentPage: QuartzEmitterPlugin = () => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: RecentNotes({
      limit: 20,
      isPage: true,
    }),
  }

  const { head: Head, header, beforeBody, pageBody, left, right, footer: Footer } = opts
  const Body = BodyConstructor()
  const Header = HeaderConstructor()

  return {
    name: "recentPage",
    getQuartzComponents() {
      return [Head, Header, Body, ...header, ...beforeBody, pageBody, ...left, ...right, Footer]
    },
    async getDependencyGraph(_ctx, _content, _resources) {
      return new DepGraph<FilePath>()
    },
    async emit(ctx, content, resources): Promise<FilePath[]> {
      const cfg = ctx.cfg.configuration
      const slug = "recent" as FullSlug

      const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
      const path = url.pathname as FullSlug
      const externalResources = pageResources(path, resources)
      const recent = '最近笔记'
      const [tree, vfile] = defaultProcessedContent({
        slug,
        text: recent,
        description: recent,
        frontmatter: { title: recent, tags: [] },
      })
      const allFiles = content.map((c) => c[1].data)
      const componentData: QuartzComponentProps = {
        ctx,
        fileData: vfile.data,
        externalResources,
        cfg,
        children: [],
        tree,
        allFiles,
      }

      return [
        await write({
          ctx,
          content: renderPage(cfg, slug, componentData, opts, externalResources),
          slug,
          ext: ".html",
        }),
      ]
    },
  }
}
