import { defineConfig } from "tsup";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  shims: false,
  minify: false,
  splitting: false,
  treeshake: false,
  external: [
    // 不打包这些依赖，让 node 自己解析
    "boxen",
    "ora",
    "@inquirer/prompts",
    "@inquirer/core",
    "cac",
  ],
  banner: {
    js: "#!/usr/bin/env node",
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
});
