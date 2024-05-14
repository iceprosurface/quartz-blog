import { ComponentType } from "preact"
import { FullSlug, isFullSlug, resolveRelative, slugifyFilePath } from "../util/path"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { FileNode, FolderState } from "./ExplorerNode"

export const FolderList: QuartzComponent = ({ allFolders, fileData, allFiles }: QuartzComponentProps) => {
  let folderList: {
    slug: FullSlug;
    title: string;
  }[] = [];
  // 说明是一个目录，且需要构建
  if (fileData.slug?.endsWith('/index') && fileData.slug) {
    const folderSlug = fileData.slug.replace(/\/index$/, '');
    const fileTree = new FileNode("")
    allFiles.forEach((file) => {
      if (file.slug?.startsWith(folderSlug) && folderSlug !== file.slug) {
        fileTree.add(file)
      }
    })
    const folders = fileTree.getFolderPaths(false)
    folders.forEach((folder) => {
      const path = folder.path;
      if (isFullSlug(path) && !folderSlug.includes(path)) {
        folderList.push({
          slug: path,
          title: folder.path,
        })
      }

    })
  }
  if (folderList.length === 0) {
    return <div></div>
  }
  return (
    <div>
      <p>
        此文件夹下有 {folderList.length} 个子文件夹
      </p>
      <ul class="folder-section-ul">

        {folderList?.map((folder) => {
          return (
            <li class="folder-section-li">
              <div class="folder-section">
                <div class="folder-desc">
                  <h3>
                    <a href={resolveRelative(folder.slug!, folder.slug!)} class="internal">
                      {folder.title}
                    </a>
                  </h3>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

FolderList.css = `
.folder-desc h3 {
  margin: 0;
}
`
