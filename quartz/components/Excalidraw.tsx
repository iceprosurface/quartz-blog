// @ts-ignore
import { FullSlug, resolveRelative } from "../util/path"
import excalidrawScript from './scripts/excalidraw.inline.ts'
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export const Exclidraw: QuartzComponent = ({ classString, fileData }: QuartzComponentProps) => {
  return <article class={classString + ' popover-hint'}>
    <div class="excalidraw" style="width: 100%;height: 500px" data-excalidraw={resolveRelative(`${fileData.filePath!}` as FullSlug, fileData.slug!) + ".md"}></div>
  </article>
}

Exclidraw.afterDOMLoaded = excalidrawScript

