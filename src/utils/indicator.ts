import { h } from "./hyperscript";

export function Indicator(options?: { size?: number; outlineWidth?: number }) {
  const { size = 20, outlineWidth = 2 } = options ?? {};

  const element = h("div", { className: "indicator" });

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
