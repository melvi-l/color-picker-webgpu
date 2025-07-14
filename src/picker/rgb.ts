import { rgbRenderer } from "../renderer/rgbRenderer";
import { d } from "../utils/hyperscript";

import { Indicator } from "../utils/indicator";
import { Interactor } from "../utils/interactor";

export interface RGBOptions {
    canvas?: HTMLCanvasElement;
    width: number;
    height: number;
    onPick?: (color: { r: number; g: number; b: number }) => void;
    initialLuminance?: number;
}

export async function RGBPicker(options: RGBOptions) {
    const { width, height, onPick, initialLuminance = 1.0 } = options;

    const canvas = options.canvas ?? d("canvas", { width, height });
    canvas.width = width;
    canvas.height = height;

    const indicator = Indicator();

    const container = d("div", { className: "picker-container" });

    if (options.canvas) {
        canvas.replaceWith(container);
    }

    container.appendChild(canvas);
    container.appendChild(indicator.element);
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;

    const { sync, render } = await rgbRenderer(canvas);

    const removeListener = Interactor(container, ({ x, y }) => {
        indicator.setPosition({ x, y });

        const color = positionToRgb(x, y);

        indicator.setColor(color);
        onPick?.(color);
    });

    function setLuminance(value: number) {
        luminance = Math.max(0, Math.min(1, value));

        sync(luminance);
        render();

        const { x, y } = indicator.getPosition();
        const color = positionToRgb(x, y)

        indicator.setColor(color);
        onPick?.(color)
    }

    let luminance = 0;
    setLuminance(initialLuminance);

    return {
        element: container,
        setLuminance,
        render,
        destroy() {
            removeListener();
            container.replaceWith(canvas.cloneNode(true));
        },
    };

    function positionToRgb(x: number, y: number) {
        const rx = x / width;
        const gy = y / height;
        const bz = 1.0 - Math.max(rx, gy);

        const r = Math.floor(rx * luminance * 255);
        const g = Math.floor(gy * luminance * 255);
        const b = Math.floor(bz * luminance * 255);
        return { r, g, b };
    }
}
