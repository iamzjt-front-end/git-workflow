/**
 * @zjex/git-workflow - Git 工作流 CLI 工具
 *
 * 主入口文件，负责：
 * 1. 初始化 CLI 应用
 * 2. 注册所有命令
 * 3. 处理全局错误和信号
 * 4. 显示交互式主菜单
 */

// @ts-nocheck shebang handled by tsup banner

import { cac } from "cac";
import { select } from "@inquirer/prompts";
import { ExitPromptError } from "@inquirer/core";
import { checkGitRepo, theme, colors } from "./utils.js";
import { createBranch, deleteBranch } from "./commands/branch.js";
import { listTags, createTag, deleteTag, updateTag } from "./commands/tag.js";
import { release } from "./commands/release.js";
import { init } from "./commands/init.js";
import { stash } from "./commands/stash.js";
import { commit } from "./commands/commit.js";
import { showHelp } from "./commands/help.js";
import { checkForUpdates } from "./update-notifier.js";
import { update } from "./commands/update.js";

// ========== 全局错误处理 ==========

/**
 * 捕获未捕获的异常
 * 主要用于优雅处理用户按 Ctrl+C 退出的情况
 */
process.on("uncaughtException", (err) => {
  if (err instanceof ExitPromptError) {
    console.log(""); // 输出空行，让界面更整洁
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});

/**
 * 捕获未处理的 Promise 拒绝
 */
process.on("unhandledRejection", (reason) => {
  if (reason instanceof ExitPromptError) {
    console.log("");
    process.exit(0);
  }
  console.error("未处理的 Promise 拒绝:", reason);
  process.exit(1);
});

/**
 * 捕获 SIGINT 信号 (Ctrl+C)
 * 确保用户按 Ctrl+C 时能优雅退出
 */
process.on("SIGINT", () => {
  console.log("");
  process.exit(0);
});

/**
 * 捕获 SIGTERM 信号
 * 处理进程终止信号
 */
process.on("SIGTERM", () => {
  console.log("");
  process.exit(0);
});

// ========== 版本信息 ==========

/**
 * 版本号由构建工具注入
 * 开发环境下使用 0.0.0-dev
 */
declare const __VERSION__: string | undefined;

/**
 * 当前版本号
 * 生产环境：从构建时注入的 __VERSION__ 获取
 * 开发环境：使用 0.0.0-dev
 */
const version: string =
  typeof __VERSION__ !== "undefined" && __VERSION__ !== ""
    ? __VERSION__
    : "0.0.0-dev";

// ========== 交互式主菜单 ==========

/**
 * 显示交互式主菜单
 * 提供所有可用命令的可视化选择界面
 */
async function mainMenu(): Promise<void> {
  // 显示 ASCII Art Logo
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
  console.log(colors.dim(`  git-workflow v${colors.yellow(version)}\n`));

  const action = await select({
    message: "选择操作:",
    choices: [
      {
        name: `[1] ✨ 创建 feature 分支      ${colors.dim("gw f")}`,
        value: "feature",
      },
      {
        name: `[2] 🐛 创建 hotfix 分支       ${colors.dim("gw h")}`,
        value: "hotfix",
      },
      {
        name: `[3] 🗑️  删除分支               ${colors.dim("gw d")}`,
        value: "delete",
      },
      {
        name: `[4] 📝 提交代码               ${colors.dim("gw c")}`,
        value: "commit",
      },
      {
        name: `[5] 🏷️  创建 tag               ${colors.dim("gw t")}`,
        value: "tag",
      },
      {
        name: `[6] 🗑️  删除 tag               ${colors.dim("gw td")}`,
        value: "tag-delete",
      },
      {
        name: `[7] ✏️  重命名 tag               ${colors.dim("gw tu")}`,
        value: "tag-update",
      },
      {
        name: `[8] 📋 列出 tags              ${colors.dim("gw ts")}`,
        value: "tags",
      },
      {
        name: `[9] 📦 发布版本               ${colors.dim("gw r")}`,
        value: "release",
      },
      {
        name: `[a] 💾 管理 stash             ${colors.dim("gw s")}`,
        value: "stash",
      },
      {
        name: `[b] ⚙️  初始化配置             ${colors.dim("gw init")}`,
        value: "init",
      },
      { name: "[0] ❓ 帮助", value: "help" },
      { name: "[q] 退出", value: "exit" },
    ],
    loop: false,
    theme,
  });

  switch (action) {
    case "feature":
      checkGitRepo();
      await createBranch("feature");
      break;
    case "hotfix":
      checkGitRepo();
      await createBranch("hotfix");
      break;
    case "delete":
      checkGitRepo();
      await deleteBranch();
      break;
    case "tag":
      checkGitRepo();
      await createTag();
      break;
    case "tag-delete":
      checkGitRepo();
      await deleteTag();
      break;
    case "tag-update":
      checkGitRepo();
      await updateTag();
      break;
    case "tags":
      checkGitRepo();
      await listTags();
      break;
    case "commit":
      checkGitRepo();
      await commit();
      break;
    case "release":
      await release();
      break;
    case "stash":
      checkGitRepo();
      await stash();
      break;
    case "init":
      await init();
      break;
    case "help":
      console.log(showHelp());
      break;
    case "exit":
      break;
  }
}

// ========== CLI 应用初始化 ==========

/**
 * 创建 CLI 应用实例
 * 使用 cac (Command And Conquer) 库
 */
const cli = cac("gw");

// ========== 命令注册 ==========

/**
 * 默认命令 - 显示交互式菜单
 * 运行 `gw` 时触发，会检查更新（交互式模式）
 */
cli.command("", "显示交互式菜单").action(async () => {
  await checkForUpdates(version, "@zjex/git-workflow", true);
  return mainMenu();
});

cli
  .command("feature", "创建 feature 分支")
  .alias("feat")
  .alias("f")
  .option("--base <branch>", "指定基础分支")
  .action(async (options: { base?: string }) => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return createBranch("feature", options.base);
  });

cli
  .command("hotfix", "创建 hotfix 分支")
  .alias("fix")
  .alias("h")
  .option("--base <branch>", "指定基础分支")
  .action(async (options: { base?: string }) => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return createBranch("hotfix", options.base);
  });

cli
  .command("delete [branch]", "删除本地/远程分支")
  .alias("del")
  .alias("d")
  .action(async (branch?: string) => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return deleteBranch(branch);
  });

cli
  .command("tags [prefix]", "列出所有 tag，可按前缀过滤")
  .alias("ts")
  .action(async (prefix?: string) => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return listTags(prefix);
  });

cli
  .command("tag [prefix]", "交互式选择版本类型并创建 tag")
  .alias("t")
  .action(async (prefix?: string) => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return createTag(prefix);
  });

cli
  .command("tag:delete", "删除 tag")
  .alias("td")
  .action(async () => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return deleteTag();
  });

cli
  .command("tag:update", "重命名 tag")
  .alias("tu")
  .action(async () => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return updateTag();
  });

cli
  .command("release", "交互式选择版本号并更新 package.json")
  .alias("r")
  .action(async () => {
    await checkForUpdates(version, "@zjex/git-workflow");
    return release();
  });

cli.command("init", "初始化配置文件 .gwrc.json").action(async () => {
  await checkForUpdates(version, "@zjex/git-workflow");
  return init();
});

cli
  .command("stash", "交互式管理 stash")
  .alias("s")
  .alias("st")
  .action(async () => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return stash();
  });

cli
  .command("commit", "交互式提交 (Conventional Commits + Gitmoji)")
  .alias("c")
  .alias("cm")
  .action(async () => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return commit();
  });

cli
  .command("update", "检查并更新到最新版本")
  .alias("upt")
  .action(async () => {
    return update(version);
  });

cli.command("clean", "清理缓存文件").action(async () => {
  const { clearUpdateCache } = await import("./update-notifier.js");
  clearUpdateCache();
  console.log("");
  console.log(colors.green("✔ 缓存已清理"));
  console.log("");
});

cli.help((sections) => {
  sections.push({
    body: showHelp(),
  });
});

// 不使用 cac 的 version，手动处理 --version
cli.option("-v, --version", "显示版本号");

// 在 parse 之前检查 --version
const args = process.argv.slice(2);
if (args.includes("-v") || args.includes("--version")) {
  console.log(colors.yellow(`v${version}`));
  process.exit(0);
}

cli.parse();
