import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { render } from 'preact';
import LZString from 'lz-string';
import { ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types/types";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { useFullScreen } from "./useFullscreen";
type ExcalidrawProps = {
  width?: number,
  height?: number
}
function App(props: {
  data?: ExcalidrawInitialDataState
} & ExcalidrawProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const ref = useRef(null);
  const maxSize = useCallback(async () => {
    if (excalidrawAPI) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), {
        fitToViewport: true,
        animate: true,
        duration: 300,
      });
    }
  }, [excalidrawAPI])
  const [isFullscreen, { toggleFullscreen }] = useFullScreen(ref, {
    pageFullscreen: true,
    onEnter: maxSize,
    onExit: maxSize
  })
  useEffect(() => {
    maxSize()
  }, [maxSize])

  return <div style={{ width: '100%', height: '100%' }} ref={ref} >
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          ...props.data,
          appState: {
            ...props.data?.appState,
            width: props.width,
            height: props.height,
            zenModeEnabled: true
          },
        }}
        viewModeEnabled={true}
      >
        <MainMenu>
          <MainMenu.Item onSelect={toggleFullscreen}>{isFullscreen ? '关闭全屏' : '全屏'}</MainMenu.Item>
        </MainMenu>
      </Excalidraw>
    </div>
    {!isFullscreen && <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 2 }}></div>}
  </div>
}

export function mountApp(element: HTMLElement, initialData: ExcalidrawInitialDataState, options: ExcalidrawProps) {
  render(<App data={initialData} {...options} />, element);
}
export const decompress = (data: string,): string => {
  return LZString.decompressFromBase64(data.replaceAll("\n", "").replaceAll("\r", ""));
};

//https://github.com/zsviczian/obsidian-excalidraw-plugin/issues/182
const DRAWING_COMPRESSED_REG =
  /(\n##? Drawing\n[^`]*(?:```compressed\-json\n))([\s\S]*?)(```\n)/gm;
const DRAWING_COMPRESSED_REG_FALLBACK =
  /(\n##? Drawing\n(?:```compressed\-json\n)?)(.*)((```)?(%%)?)/gm;
export function decodeData(data: string): ExcalidrawInitialDataState {
  let res = data.matchAll(DRAWING_COMPRESSED_REG);

  //In case the user adds a text element with the contents "# Drawing\n"
  let parts;
  parts = res.next();
  if (parts.done) {
    //did not find a match
    res = data.matchAll(DRAWING_COMPRESSED_REG_FALLBACK);
    parts = res.next();
  }
  if (parts.value && parts.value.length > 1) {
    return JSON.parse(decompress(parts.value[2]));
  }
  return {};
}