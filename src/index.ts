// @ts-nocheck shebang handled by tsup banner

import { cac } from "cac";
import { select } from "@inquirer/prompts";
import { ExitPromptError } from "@inquirer/core";
import { checkGitRepo, theme, colors } from "./utils.js";
import { createBranch, deleteBranch } from "./commands/branch.js";
import { listTags, createTag } from "./commands/tag.js";
import { release } from "./commands/release.js";
import { init } from "./commands/init.js";
import { stash } from "./commands/stash.js";
import { commit } from "./commands/commit.js";
import { showHelp } from "./commands/help.js";
import { checkForUpdates } from "./update-notifier.js";
import { checkForUpdates } from "./update-notifier.js";

// 捕获 Ctrl+C 退出，静默处理
process.on("uncaughtException", (err) => {
  if (err instanceof ExitPromptError) {
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});

declare const __VERSION__: string | undefined;

// 开发环境下从 package.json 读取版本号
const version: string =
  typeof __VERSION__ !== "undefined" && __VERSION__ !== ""
    ? __VERSION__
    : "0.0.0-dev";

// 交互式主菜单
async function mainMenu(): Promise<void> {
  // 先检查更新，等待完成后再显示主菜单
  await checkForUpdates(version, "@zjex/git-workflow");

  // ASCII Art Logo
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
  console.log(colors.dim(`  git-workflow v${version}\n`));

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
        name: `[6] 📋 列出 tags              ${colors.dim("gw ts")}`,
        value: "tags",
      },
      {
        name: `[7] 📦 发布版本               ${colors.dim("gw r")}`,
        value: "release",
      },
      {
        name: `[8] 💾 管理 stash             ${colors.dim("gw s")}`,
        value: "stash",
      },
      {
        name: `[9] ⚙️  初始化配置             ${colors.dim("gw init")}`,
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

const cli = cac("gw");

// 默认命令 - 显示交互式菜单
cli.command("", "显示交互式菜单").action(() => {
  return mainMenu();
});

cli
  .command("feature", "创建 feature 分支")
  .alias("feat")
  .alias("f")
  .option("--base <branch>", "指定基础分支")
  .action((options: { base?: string }) => {
    checkGitRepo();
    return createBranch("feature", options.base);
  });

cli
  .command("hotfix", "创建 hotfix 分支")
  .alias("fix")
  .alias("h")
  .option("--base <branch>", "指定基础分支")
  .action((options: { base?: string }) => {
    checkGitRepo();
    return createBranch("hotfix", options.base);
  });

cli
  .command("delete [branch]", "删除本地/远程分支")
  .alias("del")
  .alias("d")
  .action((branch?: string) => {
    checkGitRepo();
    return deleteBranch(branch);
  });

cli
  .command("tags [prefix]", "列出所有 tag，可按前缀过滤")
  .alias("ts")
  .action((prefix?: string) => {
    checkGitRepo();
    return listTags(prefix);
  });

cli
  .command("tag [prefix]", "交互式选择版本类型并创建 tag")
  .alias("t")
  .action((prefix?: string) => {
    checkGitRepo();
    return createTag(prefix);
  });

cli
  .command("release", "交互式选择版本号并更新 package.json")
  .alias("r")
  .action(() => {
    return release();
  });

cli.command("init", "初始化配置文件 .gwrc.json").action(() => {
  return init();
});

cli
  .command("stash", "交互式管理 stash")
  .alias("s")
  .alias("st")
  .action(() => {
    checkGitRepo();
    return stash();
  });

cli
  .command("commit", "交互式提交 (Conventional Commits + Gitmoji)")
  .alias("c")
  .alias("cm")
  .action(() => {
    checkGitRepo();
    return commit();
  });

cli.help((sections) => {
  sections.push({
    body: showHelp(),
  });
});
cli.version(version);

cli.parse();
