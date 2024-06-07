export function registerEscapeHandler(outsideContainer: HTMLElement | null, cb: () => void) {
  if (!outsideContainer) return
  function click(this: HTMLElement, e: HTMLElementEventMap["click"]) {
    if (e.target !== this) return
    e.preventDefault()
    cb()
  }

  function esc(e: HTMLElementEventMap["keydown"]) {
    if (!e.key.startsWith("Esc")) return
    e.preventDefault()
    cb()
  }

  outsideContainer?.addEventListener("click", click)
  window.addCleanup(() => outsideContainer?.removeEventListener("click", click))
  document.addEventListener("keydown", esc)
  window.addCleanup(() => document.removeEventListener("keydown", esc))
}

export function removeAllChildren(node: HTMLElement) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

declare global {
  interface Window {
    scriptPromiseMap: Map<string, Promise<void>>;
  }
}
if (!window.scriptPromiseMap) {
  window.scriptPromiseMap = new Map();
}

export function loadScript(url: string, preserve = true) {
  let resolve: (value: void) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<void>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  if (window.scriptPromiseMap.get(url) && preserve) {
    return window.scriptPromiseMap.get(url) || Promise.resolve();
  }
  const script = document.createElement('script');
  script.src = url;
  script.async = true;
  if (preserve) {
    script.setAttribute('spa-preserve', 'true');
  }
  script.onload = () => {
    resolve();
  };
  script.onerror = () => {
    reject(new Error(`Failed to load script: ${url}`));
  };
  document.head.appendChild(script);
  if (preserve) {
    window.scriptPromiseMap.set(url, promise);
  }
  return promise
}

// Excalidraw
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
export async function initExcalidraw() {
  const pluginPath = document.querySelector('meta[name="excalidraw-plugin"]')?.getAttribute('content');
  if (!pluginPath) {
    return false;
  }
  await loadScript(pluginPath, false);
  const element = document.querySelector('[data-excalidraw]');
  if (!element) {
    return;
  }
  const data = element.getAttribute('data-excalidraw') ?? '';
  element.removeAttribute('data-excalidraw');
  const markdown = await fetch(data).then((res) => res.text());
  window.QuartzExcalidrawPlugin.mountApp(element as HTMLElement, window.QuartzExcalidrawPlugin.decodeData(markdown), {});
}