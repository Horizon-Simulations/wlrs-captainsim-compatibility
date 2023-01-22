"use strict";

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import scss from "rollup-plugin-scss";

const { join } = require("path");

export default {
    input: join(__dirname, "instrument.tsx"),
    output: {
        dir: join(__dirname, "../../../../wlrs-captainsim-boeing-base/html_ui/Pages/VCockpit/Instruments/B77RS/PFD"),
        format: "es",
    },
    plugins: [
        scss({ output: join(__dirname, "../../../../wlrs-captainsim-boeing-base/html_ui/Pages/VCockpit/Instruments/B77RS/PFD/pfd.css") }),
        resolve(),
        typescript(),
    ],
};