#!/usr/bin/env node

import { select } from "@inquirer/prompts";

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
};

async function main() {
  console.log("");
  console.log(`${colors.cyan}ℹ 检测到未提交的更改${colors.reset}`);
  console.log("");

  try {
    const answer = await select({
      message: "请选择操作 (Ctrl+C 退出):",
      choices: [
        {
          name: "暂存 (stash) 这些更改后继续",
          value: "stash",
          description: "将更改保存到 stash，发布完成后可以恢复",
        },
        {
          name: "取消发布",
          value: "cancel",
          description: "退出发布流程",
        },
      ],
    });

    // 输出结果供 shell 脚本读取
    console.log(answer);
    process.exit(0);
  } catch (error) {
    if (error.name === "ExitPromptError") {
      // Ctrl+C 被按下，静默退出
      process.stderr.write("\n");
      process.exit(130); // 130 是 Ctrl+C 的标准退出码
    }
    process.exit(1);
  }
}

main();
