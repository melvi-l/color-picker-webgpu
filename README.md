[![NPM Version](https://img.shields.io/npm/v/color-picker-webgpu?labelColor=%23F1F1F1&color=%23CC3534)](https://www.npmjs.com/package/color-picker-webgpu)

# color-picker-webgpu

Basically just component for my [node-editor-webgpu](https://github.com/melvi-l/node-editor-webgpu), not really intended or ready for production (nor development tbh), but feel free to browse the source code take the code and knowledge you find relevent.

Just wanted to learn more on some module development stuff and practice all the github pipeline and npm release stuff because, hey, is there a bad pretext to learn and practice ?

> I, again, let my self sink into the project, forgetting to commit all along, so, sorry for the frail git history.

It now use [kuai](https://github.com/melvi-l/kuai-ts), a little declarative VirtualDOM renderer library that I wrote. The available component are exported with a `K_` prefix.

---

## Features

- A pale but open source copy of [Google Color Selector](https://g.co/kgs/hfaPw9T)
- WebGPU-powered canvas rendering (HSL, RGB): quite overkill but, hey, is there a bad pretext to learn and practice ?
- Cute little slider that work just fine.
- Lightweight templating via `h()` hyperscript helper
- Fully typed with TypeScript
- No framework dependency

---

## Installation

```bash
npm install color-picker-webgpu
```

or use directly via ES modules and CSS:

```html
<script type="module" src="./dist/color-picker-webgpu.es.js"></script>
<link rel="stylesheet" href="./dist/color-picker-webgpu.css" />
```

---

## Usage

### Import from module

```ts
import {
  RGBPicker,
  HSLPicker,
  HueSlider,
  LuminanceSlider,
} from "color-picker-webgpu";
```

### Basic example: HSL Picker with hue control

```ts
const hslPicker = await HSLPicker({
  canvas: window["hsl-canvas"], // you can let `canvas` `undefined` if you want to manually add it to the DOM
  width: 512,
  height: 512,
  onPick: ({ r, g, b }) => {
    // whatever you wanna do with rgb channel
  },
  initialHue: 0,
});
const hueSlider = HueSlider({
  container: window["hue-slider"],
  initialHue: 0,
  onChange: hslPicker.setHue,
});
```

---

## Components

### `HSLPicker(options)`

Render a GPU canvas with **saturation** and **luminance** axes for a given `hue`.

| Param             | Type                | Description                                               |
| ----------------- | ------------------- | --------------------------------------------------------- |
| `canvas`          | `HTMLCanvasElement` | Optional canvas to reuse (will be replaced by the picker) |
| `width`, `height` | `number`            | Canvas dimensions                                         |
| `initialHue`      | `number` (0-1)      | Initial hue value                                         |
| `onPick`          | `function({r,g,b})` | Callback on interaction                                   |

Returns:

```ts
{
  element: HTMLElement,
  setHue(h: number): void,
  render(): void,
  destroy(): void
}

```

---

### `RGBPicker(options)`

Render a GPU canvas with **red (R)** and **green (G)** on axes, and **blue (B)** derived from the max saturation — scaled by a `luminance` value.

| Param              | Type                  | Description                                               |
| ------------------ | --------------------- | --------------------------------------------------------- |
| `canvas`           | `HTMLCanvasElement`   | Optional canvas to reuse (will be replaced by the picker) |
| `width`, `height`  | `number`              | Canvas dimensions in pixels                               |
| `initialLuminance` | `number` (0–1)        | Multiplies all channels; defines brightness               |
| `onPick`           | `function({r, g, b})` | Callback triggered when user selects a color              |

Returns:

```ts
{
  element: HTMLElement,
  setLuminance(l: number): void,
  render(): void,
  destroy(): void
}
```

---

### `HueSlider(options)`

Renders a horizontal **hue slider** with gradient from 0° to 360°.

| Param        | Type                     | Description                     |
| ------------ | ------------------------ | ------------------------------- |
| `container`  | `HTMLElement` (optional) | Element to append the slider to |
| `initialHue` | `number` (0–1)           | Starting hue value              |
| `onChange`   | `function(hue: number)`  | Called when the hue changes     |

Returns:

```ts
{
  element: HTMLElement,
  setHue(h: number): void,
  dispose(): void
}
```

---

### `LuminanceSlider(options)`

Displays a horizontal **luminance slider** with grayscale from black to white.

| Param              | Type                      | Description                    |
| ------------------ | ------------------------- | ------------------------------ |
| `container`        | `HTMLElement` (optional)  | Element to mount the slider in |
| `initialLuminance` | `number` (0–1)            | Starting luminance value       |
| `onChange`         | `function(value: number)` | Triggered on interaction       |

Returns:

```ts
{
  element: HTMLElement,
  setLuminance(l: number): void,
  dispose(): void
}
```

---

## Internals & Architecture

### WebGPU rendering

Both RGB and HSL pickers use WebGPU shaders to render smooth and performant color spaces:

- Color calculations happen in **WGSL fragment shaders**
- Uniforms like `hue` and `luminance` are injected to the GPU at runtime

### DOM: hyperscript (`h()`)

To simplify DOM creation without using JSX or innerHTML, I use a little `h()` utility.

```ts
const slider = h("div", { className: "slider" }, thumb);
```

This improves readability, modularity, and keeps everything in native DOM land.

### Interaction

All user interactions are abstracted via the `Interactor` utility, handling pointer events and clamping.

### Indicator

Custom thumb indicator (`div`) that follows interaction and reflects color.

---

## Project Structure

```
src/
├── picker/
│   ├── rgb.ts
│   └── hsl.ts
├── slider/
│   ├── hue.ts
│   └── luminance.ts
├── renderer/
│   ├── hslRenderer.ts
│   └── rgbRenderer.ts
├── utils/
│   ├── interactor.ts
│   ├── indicator.ts
│   ├── hyperscript.ts
│   └── color.ts
├── style.css
└── main.ts
```

---

## License

GLWTSPL
