#!/usr/bin/env node

import { select } from "@inquirer/prompts";
import { ExitPromptError } from "@inquirer/core";

// 捕获 Ctrl+C 退出，静默处理
process.on("uncaughtException", (err) => {
  if (err instanceof ExitPromptError) {
    console.log("\n✓ Ctrl+C 被正确捕获，程序退出");
    process.exit(0);
  }
  console.error("其他错误:", err);
  process.exit(1);
});

async function test() {
  try {
    const choice = await select({
      message: "测试 Ctrl+C (按 Ctrl+C 退出):",
      choices: [
        { name: "选项 1", value: "1" },
        { name: "选项 2", value: "2" },
      ],
    });
    console.log(`你选择了: ${choice}`);
  } catch (error) {
    console.log("\n在 catch 中捕获到错误，重新抛出...");
    throw error;
  }
}

test();
