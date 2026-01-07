import { defineConfig } from "tsup";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  shims: true,
  minify: true,
  banner: {
    js: "#!/usr/bin/env node --no-warnings",
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
});
