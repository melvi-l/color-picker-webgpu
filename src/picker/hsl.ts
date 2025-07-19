import { hslRenderer } from "../renderer/hslRenderer";

import { Indicator, type IndicatorOptions } from "../utils/indicator";
import { Interactor } from "../utils/interactor";
import { d } from "../utils/hyperscript";
import { hslToRgb } from "../utils/color";

export interface HSLOptions {
  width: number;
  height: number;
  canvas?: HTMLCanvasElement;
  indicatorOptions?: IndicatorOptions;
  onPick?: (color: { r: number; g: number; b: number }) => void;
  initialHue?: number;
}

export async function HSLPicker(options: HSLOptions) {
  const {
    width,
    height,
    canvas = d("canvas", { width, height }),
    indicatorOptions,
    onPick,
    initialHue = 1.0,
  } = options;

  canvas.width = width;
  canvas.height = height;

  const indicator = Indicator(indicatorOptions);

  const container = d("div", { className: "picker-container" });

  if (options.canvas) {
    canvas.replaceWith(container);
  }

  container.appendChild(canvas);
  container.appendChild(indicator.element);
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;

  const { sync, render } = await hslRenderer(canvas);

  const removeListener = Interactor(container, ({ x, y }) => {
    indicator.setPosition({ x, y });

    const color = positionToRgb(x, y);

    indicator.setColor(color);
    onPick?.(color);
  });

  function setHue(value: number) {
    hue = Math.max(0, Math.min(1, value));

    sync(hue);
    render();

    const { x, y } = indicator.getPosition();
    const color = positionToRgb(x, y);

    indicator.setColor(color);
    onPick?.(color);
  }

  let hue = 0;
  setHue(initialHue);

  return {
    element: container,
    setHue,
    render,
    destroy() {
      removeListener();
      canvas.replaceWith(canvas.cloneNode(true));
    },
  };

  function positionToRgb(x: number, y: number) {
    const s = x / width;
    const lTop = (1 - s) * 1 + s * 0.5; // linear interpolation to get that nice pure hue on the top-right corner (in the middle-right if not)
    const l = (1 - y / width) * lTop;

    return hslToRgb(hue, s, l);
  }
}

import { h } from "kuai-ts";

import { K_Indicator } from "../utils/indicator";

export interface K_HSLOptions {
  width: number;
  height: number;
  indicatorOptions?: IndicatorOptions;
  onPick?: (color: { r: number; g: number; b: number }) => void;
  initialHue?: number;
}
export function K_HSLPicker(options: K_HSLOptions) {
  const { width, height, indicatorOptions, onPick, initialHue = 0.0 } = options;

  let hue: number;

  const indicator = K_Indicator(indicatorOptions);
  const { getPosition, setPosition, setColor } = indicator.instance;

  let sync: (luminance: number) => void;
  let render: () => void;
  const canvas = h("canvas.webgpu", {
    width,
    height,
    ref: (dom) => {
      Interactor(dom, ({ x, y }) => {
        setPosition({ x, y });

        const color = positionToRgb(x, y);

        setColor(color);
        onPick?.(color);
      });
      hslRenderer(dom as HTMLCanvasElement).then(
        ({ sync: _sync, render: _render }) => {
          sync = _sync;
          render = _render;
          setHue(initialHue);
        },
      );
    },
  });

  function setHue(value: number) {
    hue = Math.max(0, Math.min(1, value));

    sync?.(hue);
    render?.();

    const { x, y } = getPosition();
    const color = positionToRgb(x, y);

    setColor(color);
    onPick?.(color);
  }
  setHue(initialHue);

  const vnode = h("div.picker-container", {}, [indicator.vnode, canvas]);

  return {
    vnode,
    instance: {
      setHue,
    },
  };

  function positionToRgb(x: number, y: number) {
    const s = x / width;
    const lTop = (1 - s) * 1 + s * 0.5; // linear interpolation to get that nice pure hue on the top-right corner (in the middle-right if not)
    const l = (1 - y / width) * lTop;

    return hslToRgb(hue, s, l);
  }
}
