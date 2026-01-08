#!/usr/bin/env node

import boxen from "boxen";
import { select } from "@inquirer/prompts";
import ora from "ora";

const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  reset: "\x1b[0m",
};

async function testUpdateFlow() {
  const current = "0.1.0";
  const latest = "0.2.0";
  const packageName = "@zjex/git-workflow";

  // 1. 显示更新提示框
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

  // 2. 交互式选择
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

    console.log("");

    // 3. 根据选择执行操作
    if (action === "update") {
      // 模拟更新过程
      const spinner = ora({
        text: "正在更新...",
        spinner: "dots",
      }).start();

      // 模拟卸载旧版本
      await new Promise((resolve) => setTimeout(resolve, 1000));
      spinner.text = "已卸载旧版本，正在安装新版本...";

      // 模拟安装新版本
      await new Promise((resolve) => setTimeout(resolve, 2000));

      spinner.succeed(colors.green("更新成功！"));
      console.log("");
      console.log(colors.cyan("  提示: 请重新运行命令以使用新版本"));
      console.log("");
    } else if (action === "continue") {
      console.log(colors.cyan("继续使用当前版本..."));
      console.log("");
    } else if (action === "dismiss") {
      console.log(colors.dim("已跳过此版本，24 小时内不再提示"));
      console.log("");
    }
  } catch (error) {
    console.log("");
    console.log(colors.dim("已取消"));
    console.log("");
  }
}

testUpdateFlow();
