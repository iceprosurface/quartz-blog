import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/iceprosurface",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.RecentNotes()),
    Component.DirectLink({
      link: '/archives/',
      title: '归档'
    }),
    Component.DirectLink({
      link: '/tags/',
      title: '标签'
    })
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.MobileOnly(Component.RecentNotes()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.MobileOnly(
      Component.DirectLink({
        link: '/archives/',
        title: '归档'
      })
    ),
    Component.MobileOnly(
      Component.DirectLink({
        link: '/tags/',
        title: '标签'
      })
    ),
    Component.ArticleTitle(),
    Component.ContentMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.RecentNotes()),
    Component.DesktopOnly(
      Component.DirectLink({
        link: '/archives/',
        title: '归档'
      })
    ),
    Component.DesktopOnly(
      Component.DirectLink({
        link: '/tags/',
        title: '标签'
      })
    )
  ],
  right: [],
}
