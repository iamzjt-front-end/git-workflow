// @ts-nocheck shebang handled by tsup banner

import { readFileSync } from "fs";
import { cac } from "cac";
import { colors, checkGitRepo } from "./utils.js";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8")
);
import { createBranch, deleteBranch } from "./commands/branch.js";
import { listTags, createTag } from "./commands/tag.js";
import { release } from "./commands/release.js";
import { init } from "./commands/init.js";
import { showHelp } from "./commands/help.js";

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

cli.help((sections) => {
  sections.push({
    body: showHelp(),
  });
});
cli.version(pkg.version);

cli.parse();
