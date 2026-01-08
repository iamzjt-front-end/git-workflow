#!/usr/bin/env node

import { confirm } from "@inquirer/prompts";

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
};

async function main() {
  console.log("");
  console.log(`${colors.cyan}ℹ 之前暂存的更改可以恢复${colors.reset}`);

  try {
    const answer = await confirm({
      message: "是否恢复暂存的更改? (Ctrl+C 跳过)",
      default: false,
    });

    // 输出结果到 stdout
    process.stdout.write((answer ? "yes" : "no") + "\n");
    process.exit(0);
  } catch (error) {
    if (error.name === "ExitPromptError") {
      // Ctrl+C 被按下，静默退出，默认不恢复
      process.stdout.write("no\n");
      process.exit(0);
    }
    process.exit(1);
  }
}

main();
