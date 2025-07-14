import { d } from "./hyperscript";

export function Indicator(options?: { size?: number; outlineWidth?: number }) {
  const { size = 20, outlineWidth = 2 } = options ?? {};

  const element = d("div", { className: "indicator" });

  element.style.width = `${size}px`;
  element.style.height = `${size}px`;

  element.style.outlineWidth = `${outlineWidth}px`;

  let x = 0,
    y = 0;
  setPosition({ x, y });

  function setPosition(position: { x: number; y: number }) {
    x = position.x;
    y = position.y;

    element.style.left = `${x - size / 2}px`;
    element.style.top = `${y - size / 2}px`;
  }
  function getPosition() {
    return { x, y };
  }
  function setColor(color: { r: number; g: number; b: number }) {
    const { r, g, b } = color;
    element.style.background = `rgb(${r}, ${g}, ${b})`;
  }
  return { element, getPosition, setPosition, setColor };
}

import { h } from "kuai-ts";

export function K_Indicator(options?: {
  size?: number;
  outlineWidth?: number;
}) {
  const { size = 20, outlineWidth = 2 } = options ?? {};

  let x = 0,
    y = 0;

  let setDomColor: (color: { r: number; g: number; b: number }) => void;
  let setDomPosition: (position: { x: number; y: number }) => void;
  const vnode = h("div.indicator", {
    style: {
      width: `${size}px`,
      height: `${size}px`,
      outlineWidth: `${outlineWidth}px`,
    },
    ref: (dom) => {
      setDomColor = ({ r, g, b }) => {
        dom.style.background = `rgb(${r}, ${g}, ${b})`;
      };
      setDomPosition = ({ x, y }) => {
        dom.style.left = `${x - size / 2}px`;
        dom.style.top = `${y - size / 2}px`;
      };
    },
  });

  function setPosition(position: { x: number; y: number }) {
    x = position.x;
    y = position.y;

    setDomPosition?.(position);
  }
  function getPosition() {
    return { x, y };
  }
  function setColor(color: { r: number; g: number; b: number }) {
    setDomColor?.(color);
  }

  return { vnode, instance: { getPosition, setPosition, setColor } };
}
