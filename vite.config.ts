import { defineConfig } from "vite";
import path from "path";

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
});
