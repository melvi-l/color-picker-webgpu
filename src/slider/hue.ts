import { hslToRgb } from "../utils/color";
import { h } from "../utils/hyperscript";
import { Indicator } from "../utils/indicator";
import { Interactor } from "../utils/interactor";

export function HueSlider(options: {
    container?: HTMLElement;
    initialHue?: number;
    onChange?: (hue: number) => void;
}) {
    const { container, initialHue = 1, onChange } = options;
    const height = 32;

    const thumb = Indicator();

    const gradient = h("div", { className: "hue-slider-gradient" });
    const track = h(
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

    const wrapper = h("div", { className: "hue-slider-wrapper" }, track);
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
