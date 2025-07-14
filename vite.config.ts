import { defineConfig } from "vite";
import path, { resolve } from "path";
import { copyFileSync } from "fs";

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/main.ts"),
            name: "color-picker-webgpu",
            fileName: (format) => `color-picker-webgpu.${format}.js`,
        },
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "src/main.ts"),
            },
        },
    },
    plugins: [
        {
            name: "copy-style",
            closeBundle() {
                const from = resolve(__dirname, "src/style.css");
                const to = resolve(__dirname, "dist/style.css");
                copyFileSync(from, to);
                console.log("Copied style.css to dist/");
            },
        },
    ],
});
