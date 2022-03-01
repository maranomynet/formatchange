import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("./package.json");
// import * as pkg from "./package.json" assert { type: "json" };

import esbuild from "esbuild";
// import { dtsPlugin } from "esbuild-plugin-d.ts";
import { exec as exec_cb } from "child_process";
import { promisify } from "util";
const exec = promisify(exec_cb);

// ===========================================================================

const opts = process.argv.slice(2).reduce(
  /* <Record<string,unknown>> */ (map, arg) => {
    const [key, value] = arg.replace(/^-+/, "").split("=");
    map[key] = value == null ? true : value;
    return map;
  },
  {}
);

// ---------------------------------------------------------------------------

const allDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];
const exit1 = (err) => {
  console.error(err);

  process.exit(1);
};

// ---------------------------------------------------------------------------

const baseOpts = {
  bundle: true,
  external: allDeps,
  format: "cjs",
  outdir: "./",

  watch: opts.dev,
};

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

esbuild
  .build({
    ...baseOpts,
    entryPoints: ["./formatchange.js"],
    entryNames: "[name]-min",
    minify: true,
  })
  .catch(exit1);

// esbuild
//   .build({
//     ...baseOpts,
//     entryPoints: ["./src/react.tsx"],
//     plugins: [dtsPlugin({ outDir: baseOpts.outdir })],
//   })
//   .catch(exit1);

exec(
  `tsc src/react.tsx --outDir ./  --esModuleInterop --declaration --jsx react`
).catch(exit1);
