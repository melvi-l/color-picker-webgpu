import { hslToRgb } from "../utils/color";
import { d } from "../utils/hyperscript";
import { Indicator, type IndicatorOptions } from "../utils/indicator";
import { Interactor } from "../utils/interactor";
export type HueSliderOptions = {
  container?: HTMLElement;
  initialHue?: number;
  onChange?: (hue: number) => void;
  indicatorOptions?: IndicatorOptions;
};
export function HueSlider(options: {
  container?: HTMLElement;
  initialHue?: number;
  onChange?: (hue: number) => void;
}) {
  const { container, initialHue = 1, onChange } = options;
  const height = 32;

  const thumb = Indicator();

  const gradient = d("div", { className: "hue-slider-gradient" });
  const track = d(
    "div",
    {
      className: "hue-slider-track",

      tabIndex: 0,
      role: "slider",
      ariaValueMin: "0",
      ariaValueMax: "1",
    },
    gradient,
    thumb.element,
  );

  const wrapper = d("div", { className: "hue-slider-wrapper" }, track);
  wrapper.style.height = `${height}px`;

  if (container) {
    container.appendChild(wrapper);
  }

  const y = height / 2;

  function setHue(hue: number) {
    const x = hue * track.offsetWidth;

    thumb.setPosition({ x, y });

    thumb.setColor(hslToRgb(hue, 1, 0.5));

    track.setAttribute("aria-valuenow", hue.toFixed(0));
  }

  const removeListener = Interactor(track, ({ x }) => {
    const percent = x / track.offsetWidth;
    setHue(percent);
    onChange?.(percent);
  });

  setHue(initialHue);

  return {
    element: wrapper,
    setHue,
    dispose: () => {
      removeListener();
    },
  };
}

import { h } from "kuai-ts";

import { K_Indicator } from "../utils/indicator";

export type K_HueSliderOptions = {
  initialHue?: number;
  onChange?: (hue: number) => void;
  indicatorOptions?: IndicatorOptions;
};
export function K_HueSlider(options: K_HueSliderOptions) {
  const { initialHue = 1, onChange, indicatorOptions } = options;
  const height = 32;
  const y = height / 2;

  const indicator = K_Indicator(indicatorOptions);
  const { setPosition, setColor } = indicator.instance;

  let setDomHue: (hue: number) => void;
  const track = h(
    "div.hue-slider-track",
    {
      tabIndex: 0,
      role: "slider",
      ariaValueMin: "0",
      ariaValueMax: "1",
      ref: (dom) => {
        setDomHue = (hue) => {
          const x = hue * dom.offsetWidth;

          setPosition({ x, y });

          setColor(hslToRgb(hue, 1, 0.5));

          dom.setAttribute("aria-valuenow", hue.toFixed(2));
        };
        Interactor(dom, ({ x }) => {
          const percent = x / dom.offsetWidth;
          setHue(percent);
          onChange?.(percent);
        });

        setHue(initialHue);
      },
    },
    [h("div.hue-slider-gradient"), indicator.vnode],
  );

  function setHue(hue: number) {
    setDomHue?.(hue);
  }

  const vnode = h(
    "div.hue-slider-wrapper",
    {
      style: { height: `${height}px` },
    },
    [track],
  );

  return {
    vnode,
    instance: {
      setHue,
    },
  };
}
