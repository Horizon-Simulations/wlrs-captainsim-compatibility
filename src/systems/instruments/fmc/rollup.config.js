import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import css from '@rollup/plugin-import-css';

const { join } = require("path");

export default {
    input: join(__dirname, "fmc.tsx"),
    output: {
        dir: join(__dirname, "../../../../../wlrs-captainsim-boeing-base/html_ui/Pages/VCockpit/Instruments/B77HS/FMC"),
        format: "es",
    },
    plugins: [
        css({ output: join(__dirname, "../../../../../wlrs-captainsim-boeing-base/html_ui/Pages/VCockpit/Instruments/B77HS/FMC/fmc.css") }),
        resolve(),
        typescript(),
    ],
};