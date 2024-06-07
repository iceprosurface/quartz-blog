import { MutableRefObject } from "preact/compat";
import { useRef, useState } from "preact/hooks";
import screenfull from 'screenfull';
type TargetValue<T> = T | undefined | null;
type TargetType = HTMLElement | Element | Window | Document;
export interface PageFullscreenOptions {
  className?: string;
  zIndex?: number;
}

type BasicTarget<T extends TargetType = Element> = MutableRefObject<TargetValue<T>>;
interface Options {
  pageFullscreen?: boolean | PageFullscreenOptions;
  onExit?: () => void;
  onEnter?: () => void;
}
function getTargetElement<T extends TargetType>(target: BasicTarget<T>, defaultElement?: T) {
  if (!target) {
    return defaultElement;
  }
  let targetElement: TargetValue<T>;
  if ('current' in target) {
    targetElement = target.current;
  } else {
    targetElement = target;
  }

  return targetElement;
}
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

export function useFullScreen(target: BasicTarget, options?: Options) {
  const { pageFullscreen = false, onExit, onEnter } = options || {};
  const [state, setState] = useState(screenfull.isFullscreen)
  const { className = 'page-fullscreen', zIndex = 999999 } =
    typeof (pageFullscreen) === 'boolean' || !pageFullscreen ? {} : pageFullscreen;

  const onExitRef = useLatest(onExit);
  const onEnterRef = useLatest(onEnter);
  const invokeCallback = (fullscreen: boolean) => {
    if (fullscreen) {
      onEnterRef.current?.();
    } else {
      onExitRef.current?.();
    }
  };
  function getIsFullscreen() {
    return (
      screenfull.isEnabled &&
      !!screenfull.element &&
      screenfull.element === getTargetElement(target)
    );
  }
  const stateRef = useRef(getIsFullscreen());
  const toggleFullscreen = () => {
    if (state) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };
  const enterFullscreen = () => {
    const el = getTargetElement(target);
    if (!el) {
      return;
    }

    if (pageFullscreen) {
      togglePageFullscreen(true);
      return;
    }
    if (screenfull.isEnabled) {
      try {
        screenfull.request(el);
      } catch (error) {
        console.error(error);
      }
    }
  };
  const updateFullscreenState = (fullscreen: boolean) => {
    if (stateRef.current !== fullscreen) {
      invokeCallback(fullscreen);
      setState(fullscreen);
      stateRef.current = fullscreen;
    }
  };

  const togglePageFullscreen = (fullscreen: boolean) => {
    const el = getTargetElement(target);
    if (!el) {
      return;
    }

    let styleElem = document.getElementById(className);

    if (fullscreen) {
      el.classList.add(className);

      if (!styleElem) {
        styleElem = document.createElement('style');
        styleElem.setAttribute('id', className);
        styleElem.textContent = `
          .${className} {
            position: fixed; left: 0; top: 0; right: 0; bottom: 0;
            width: 100% !important; height: 100% !important;
            z-index: ${zIndex};
          }`;
        el.appendChild(styleElem);
      }
    } else {
      el.classList.remove(className);

      if (styleElem) {
        styleElem.remove();
      }
    }

    updateFullscreenState(fullscreen);
  };
  const exitFullscreen = () => {
    const el = getTargetElement(target);
    if (!el) {
      return;
    }

    if (pageFullscreen) {
      togglePageFullscreen(false);
      return;
    }
    if (screenfull.isEnabled && screenfull.element === el) {
      screenfull.exit();
    }
  };
  return [
    state,
    {
      enterFullscreen: enterFullscreen,
      exitFullscreen: exitFullscreen,
      toggleFullscreen: toggleFullscreen,
      isEnabled: screenfull.isEnabled,
    },
  ] as const;
}