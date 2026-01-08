#!/usr/bin/env node

import boxen from "boxen";
import { select } from "@inquirer/prompts";
import { ExitPromptError } from "@inquirer/core";

// 捕获 Ctrl+C 退出，静默处理
process.on("uncaughtException", (err) => {
  if (err instanceof ExitPromptError) {
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});

const colors = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

async function checkForUpdates() {
  const current = "0.2.3";
  const latest = "0.2.4";
  const packageName = "@zjex/git-workflow";

  const message = [
    colors.bold("🎉 发现新版本可用！"),
    "",
    `${colors.dim(current)}  →  ${colors.green(colors.bold(latest))}`,
  ].join("\n");

  console.log("");
  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "yellow",
      align: "left",
    })
  );

  try {
    const action = await select({
      message: "你想做什么？",
      choices: [
        {
          name: "🚀 立即更新",
          value: "update",
          description: `运行 npm install -g ${packageName}`,
        },
        {
          name: "⏭️  稍后更新，继续使用",
          value: "continue",
          description: "下次启动时会再次提示",
        },
        {
          name: "🙈 跳过此版本 (24h 内不再提示)",
          value: "dismiss",
          description: "24 小时内不会再提示此版本",
        },
      ],
    });

    if (action === "update") {
      console.log("\n模拟更新中...\n");
      process.exit(0);
    } else if (action === "dismiss") {
      console.log(colors.dim("\n已跳过此版本，24 小时内不再提示\n"));
    }
  } catch (error) {
    // 用户按了 Ctrl+C，重新抛出让全局处理
    console.log("");
    throw error;
  }
}

async function mainMenu() {
  // 先检查更新，等待完成
  await checkForUpdates();

  // 然后显示主菜单
  console.log(
    colors.green(`
 ███████╗     ██╗███████╗██╗  ██╗
 ╚══███╔╝     ██║██╔════╝╚██╗██╔╝
   ███╔╝      ██║█████╗   ╚███╔╝ 
  ███╔╝  ██   ██║██╔══╝   ██╔██╗ 
 ███████╗╚█████╔╝███████╗██╔╝ ██╗
 ╚══════╝ ╚════╝ ╚══════╝╚═╝  ╚═╝
`)
  );
  console.log(colors.dim(`  git-workflow v0.2.4\n`));

  const choice = await select({
    message: "选择操作:",
    choices: [
      { name: "[1] ✨ 创建 feature 分支      gw f", value: "1" },
      { name: "[2] 🐛 创建 hotfix 分支       gw h", value: "2" },
      { name: "[3] 🗑️  删除分支               gw d", value: "3" },
    ],
  });

  console.log(`\n你选择了: ${choice}\n`);
}

mainMenu();
