import { Excalidraw } from "@excalidraw/excalidraw";
import { render } from 'preact';
import LZString from 'lz-string';
import { ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types/types";
import { useEffect, useState } from "preact/hooks";
type ExcalidrawProps = {
  width?: number,
  height?: number
}
function App(props: {
  data?: ExcalidrawInitialDataState
} & ExcalidrawProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  useEffect(() => {
    (async () => {
      if (excalidrawAPI) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), {
          fitToViewport: true,
          animate: true,
          duration: 300,
        });
      }
    })()
  }, [excalidrawAPI])
  return <div style={{ width: '100%', height: '100%' }}>
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
    </Excalidraw>
  </div>
}

export function mountApp(element: HTMLElement, initialData: ExcalidrawInitialDataState, options: ExcalidrawProps) {
  render(<App data={initialData} {...options} />, element);
}
export const decompress = (data: string,): string => {
  return LZString.decompressFromBase64(data.replaceAll("\n", "").replaceAll("\r", ""));
};

export function decodeData(data: string): ExcalidrawInitialDataState {
  const parts = data.split("\n# Drawing\n```compressed-json\n");
  if (parts.length !== 2) return {}
  const compressed = parts[1].split("\n```\n%%");
  if (compressed.length !== 2) return {}
  const decompressed = decompress(compressed[0]);
  if (!decompressed) {
    return {}
  }
  return JSON.parse(decompressed) ?? [];
}