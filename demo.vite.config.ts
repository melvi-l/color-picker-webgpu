import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  base: "/color-picker-webgpu",
  build: {
    outDir: "../gh-pages",
    emptyOutDir: true,
  },
});
