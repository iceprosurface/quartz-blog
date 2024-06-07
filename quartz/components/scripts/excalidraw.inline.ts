import { loadScript } from "./util";
type ExcalidrawElement = any;
type ExcalidrawProps = {
  width?: string;
  height?: string;
};
declare global {
  interface Window {
    QuartzExcalidrawPlugin: {
      mountApp(element: HTMLElement, initialData: readonly ExcalidrawElement[] | null, options: ExcalidrawProps): void
      decodeData(data: string): ExcalidrawElement[];
    };
  }
}
export async function init() {
  await loadScript('/static/quartz-excalidraw-plugin.umd.cjs');
  const element = document.querySelector('[data-excalidraw]');
  if (!element) {
    return;
  }
  const data = element.getAttribute('data-excalidraw') ?? '';
  const markdown = await fetch(data).then((res) => res.text());
  window.QuartzExcalidrawPlugin.mountApp(element as HTMLElement, window.QuartzExcalidrawPlugin.decodeData(markdown), {
    width: '100%',
    height: '400px',
  });
  element.removeAttribute('data-excalidraw');
}
init();

document.addEventListener('nav', (event) => {
  init();
})

