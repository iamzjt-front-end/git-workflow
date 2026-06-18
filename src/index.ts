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
import { checkGitRepo, theme, colors, setDebugMode } from "./utils.js";
import { createBranch, deleteBranch } from "./commands/branch.js";
import {
  listTags,
  createTag,
  deleteTag,
  updateTag,
  cleanInvalidTags,
} from "./commands/tag.js";
import { release } from "./commands/release.js";
import { init } from "./commands/init.js";
import { stash } from "./commands/stash.js";
import { commit } from "./commands/commit.js";
import { checkForUpdates } from "./update-notifier.js";
import { log, quickLog } from "./commands/log.js";
import { amendDate } from "./commands/amend-date.js";
import { amend } from "./commands/amend.js";
import { review } from "./commands/review.js";

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
`),
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
        name: `[3] 🗑️  删除分支               ${colors.dim("gw brd")}`,
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
        name: `[9] � 发布版本               ${colors.dim("gw r")}`,
        value: "release",
      },
      {
        name: `[a] � 管理 stash             ${colors.dim("gw s")}`,
        value: "stash",
      },
      {
        name: `[b] 📜 查看日志               ${colors.dim("gw log")}`,
        value: "log",
      },
      {
        name: `[c] 🕐 修改提交时间           ${colors.dim("gw ad")}`,
        value: "amend-date",
      },
      {
        name: `[d] ✏️  修改提交信息           ${colors.dim("gw amend")}`,
        value: "amend",
      },
      {
        name: `[e] 🔍 AI 代码审查            ${colors.dim("gw review")}`,
        value: "review",
      },
      {
        name: `[f] ⚙️  初始化配置             ${colors.dim("gw init")}`,
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
    case "log":
      checkGitRepo();
      await log();
      break;
    case "amend-date":
      checkGitRepo();
      await amendDate();
      break;
    case "amend":
      checkGitRepo();
      await amend();
      break;
    case "review":
      checkGitRepo();
      await review();
      break;
    case "init":
      await init();
      break;
    case "help":
      // 使用 cac 自动生成的帮助信息
      cli.outputHelp();
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
  .command("br:del [branch]", "删除本地/远程分支")
  .alias("brd")
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
  .command("tag:del", "删除 tag")
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
  .command("tag:clean", "清理无效 tag")
  .alias("tc")
  .action(async () => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return cleanInvalidTags();
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
  .command("log", "交互式Git日志查看 (分页模式)")
  .alias("ls")
  .alias("l")
  .option("--limit <number>", "限制显示数量")
  .action(async (options: any) => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();

    // 构建选项对象 - 默认交互式模式
    const logOptions: any = { interactive: true };
    if (options.limit) logOptions.limit = parseInt(options.limit);

    return log(logOptions);
  });

cli
  .command("amend:date [hash]", "修改指定 commit 的提交时间")
  .alias("ad")
  .action(async (hash?: string) => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return amendDate(hash);
  });

cli
  .command("amend [hash]", "修改指定 commit 的提交信息")
  .action(async (hash?: string) => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return amend(hash);
  });

cli
  .command("review [...hashes]", "AI 代码审查")
  .alias("rw")
  .option("-n, --last <number>", "审查最近 N 个 commits")
  .option("-s, --staged", "审查暂存区的更改")
  .option("-o, --output <path>", "指定输出文件路径")
  .action(async (hashes: string[], options: any) => {
    await checkForUpdates(version, "@zjex/git-workflow");
    checkGitRepo();
    return review(
      hashes.length > 0 ? hashes : undefined,
      {
        last: options.last ? parseInt(options.last) : undefined,
        staged: options.staged,
        output: options.output,
      }
    );
  });

cli
  .command("clean", "清理缓存和临时文件")
  .alias("cc")
  .action(async () => {
    const { clearUpdateCache } = await import("./update-notifier.js");
    const { existsSync, unlinkSync, readdirSync } = await import("fs");
    const { homedir, tmpdir } = await import("os");
    const { join } = await import("path");
    const { select } = await import("@inquirer/prompts");

    let cleanedCount = 0;
    let deletedGlobalConfig = false;

    // 检查全局配置文件是否存在
    const globalConfig = join(homedir(), ".gwrc.json");
    const hasGlobalConfig = existsSync(globalConfig);

    // 如果有全局配置文件，询问是否删除
    if (hasGlobalConfig) {
      const shouldDeleteConfig = await select({
        message: "检测到全局配置文件，是否删除？",
        choices: [
          { name: "否，保留配置文件", value: false },
          { name: "是，删除配置文件", value: true },
        ],
        theme,
      });

      if (shouldDeleteConfig) {
        try {
          unlinkSync(globalConfig);
          cleanedCount++;
          deletedGlobalConfig = true;
        } catch {
          // 静默失败
        }
      }
    }

    // 1. 清理更新缓存
    clearUpdateCache();
    cleanedCount++;

    // 2. 清理临时 commit 消息文件
    try {
      const tmpDir = tmpdir();
      const files = readdirSync(tmpDir);
      const gwTmpFiles = files.filter((f) => f.startsWith(".gw-commit-msg-"));

      for (const file of gwTmpFiles) {
        try {
          unlinkSync(join(tmpDir, file));
          cleanedCount++;
        } catch {
          // 静默失败
        }
      }
    } catch {
      // 静默失败
    }

    console.log("");
    console.log(colors.green(`✔ 已清理 ${cleanedCount} 个文件`));

    if (deletedGlobalConfig) {
      console.log("");
      console.log(colors.yellow("⚠️  全局配置文件已删除"));
      console.log(
        colors.dim(`   如需重新配置，请运行: ${colors.cyan("gw init")}`),
      );
    }

    console.log("");
  });

// 不使用 cac 的 version，手动处理 --version、--help 和 --debug
cli.option("-v, --version", "显示版本号");
cli.option("-h, --help", "显示帮助信息");
cli.option("-d, --debug", "启用调试模式，显示详细的命令和错误信息");

// 在 parse 之前检查 --version、--help 和 --debug
const processArgs = process.argv.slice(2);

// 检查是否启用 debug 模式
if (processArgs.includes("-d") || processArgs.includes("--debug")) {
  setDebugMode(true);
  console.log(colors.yellow("🐛 Debug 模式已启用\n"));
}

if (processArgs.includes("-v") || processArgs.includes("--version")) {
  console.log(colors.yellow(`v${version}`));
  process.exit(0);
}
if (processArgs.includes("-h") || processArgs.includes("--help")) {
  cli.outputHelp();
  process.exit(0);
}

cli.parse();
