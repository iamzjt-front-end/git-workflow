#!/usr/bin/env node

import boxen from "boxen";

const version = process.argv[2];

if (!version) {
  console.error("请提供版本号");
  process.exit(1);
}

const message = [
  "\x1b[1m🎉 发布成功！\x1b[0m",
  "",
  `\x1b[36m版本:\x1b[0m \x1b[1mv${version}\x1b[0m`,
].join("\n");

console.log("");
console.log(
  boxen(message, {
    padding: { top: 1, bottom: 1, left: 8, right: 8 },
    margin: { top: 0, bottom: 1, left: 0, right: 0 },
    borderStyle: "round",
    borderColor: "green",
    align: "center",
  })
);

console.log(
  "\x1b[2m  🔗 \x1b[0m\x1b[36mGitHub:\x1b[0m \x1b[2m\x1b[4mhttps://github.com/iamzjt-front-end/git-workflow/releases/tag/v" +
    version +
    "\x1b[0m"
);
console.log(
  "\x1b[2m  📦 \x1b[0m\x1b[36mnpm:\x1b[0m \x1b[2m\x1b[4mhttps://www.npmjs.com/package/@zjex/git-workflow\x1b[0m"
);
console.log("");
