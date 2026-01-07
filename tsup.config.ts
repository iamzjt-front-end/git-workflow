import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  shims: true,
  minify: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
