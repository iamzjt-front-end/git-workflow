// @ts-nocheck shebang handled by tsup banner

import { cac } from "cac";
import { ExitPromptError } from "@inquirer/core";
import { checkGitRepo } from "./utils.js";
import { createBranch, deleteBranch } from "./commands/branch.js";
import { listTags, createTag } from "./commands/tag.js";
import { release } from "./commands/release.js";
import { init } from "./commands/init.js";
import { stash } from "./commands/stash.js";
import { showHelp } from "./commands/help.js";

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
  typeof __VERSION__ !== "undefined"
    ? __VERSION__
    : (await import("../package.json", { with: { type: "json" } })).default
        .version;

const cli = cac("gw");

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

cli.help((sections) => {
  sections.push({
    body: showHelp(),
  });
});
cli.version(version);

cli.parse();
