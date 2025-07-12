import { hslRenderer } from "../renderer/hslRenderer";

import { Indicator } from "../utils/indicator";
import { Interactor } from "../utils/interactor";
import { h } from "../utils/hyperscript";
import { hslToRgb } from "../utils/color";

export interface HSLOptions {
    canvas?: HTMLCanvasElement;
    width: number;
    height: number;
    onPick?: (color: { r: number; g: number; b: number }) => void;
    initialHue?: number;
}

export async function HSLPicker(options: HSLOptions) {
    const { width, height, onPick, initialHue = 1.0 } = options;

    const canvas = options.canvas ?? h("canvas", { width, height });
    canvas.width = width;
    canvas.height = height;

    const indicator = Indicator();

    const container = h("div", { className: "picker-container" });

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
        const color = positionToRgb(x, y)

        indicator.setColor(color);
        onPick?.(color)
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
