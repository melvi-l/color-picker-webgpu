import { dts } from "rollup-plugin-dts";

const config = [
    {
        input: "./src/main.ts",
        output: [{ file: "dist/type.d.ts", format: "es" }],
        plugins: [dts()],
    },
];

export default config;
