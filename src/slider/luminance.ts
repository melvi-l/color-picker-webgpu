import { Indicator } from "../utils/indicator";
import { Interactor } from "../utils/interactor";

import { d } from "../utils/hyperscript";

export function LuminanceSlider(options: {
    container?: HTMLElement;
    initialLuminance?: number;
    onChange?: (luminance: number) => void;
}) {
    const { container, initialLuminance = 1, onChange } = options;
    const height = 32;

    const thumb = Indicator();

    const gradient = d("div", { className: "luminance-slider-gradient" });
    const track = d(
        "div",
        {
            className: "luminance-slider-track",
            tabIndex: 0,
            role: "slider",
            ariaValueMin: "0",
            ariaValueMax: "1",
        },
        gradient,
        thumb.element,
    );

    const wrapper = d("div", { className: "luminance-slider-wrapper" }, track);
    wrapper.style.height = `${height}px`;
    if (container) {
        container.appendChild(wrapper);
    }

    const y = height / 2;

    function setLuminance(luminance: number) {
        const x = luminance * track.offsetWidth;

        thumb.setPosition({ x, y });

        const gray = Math.floor(luminance * 255);
        thumb.setColor({ r: gray, g: gray, b: gray });

        track.setAttribute("aria-valuenow", luminance.toFixed(2));
    }

    const removeListener = Interactor(track, ({ x }) => {
        const percent = x / track.offsetWidth;
        setLuminance(percent);
        onChange?.(percent);
    });

    setLuminance(initialLuminance);

    return {
        element: wrapper,
        setLuminance: (value: number) => setLuminance(value),
        dispose: () => {
            removeListener();
        },
    };
}
