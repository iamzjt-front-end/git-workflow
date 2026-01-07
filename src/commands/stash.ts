import { execSync } from "child_process";
import { select, input } from "@inquirer/prompts";
import ora from "ora";
import {
  colors,
  theme,
  divider,
  execOutput,
  type BranchType,
} from "../utils.js";
import { getBranchName } from "./branch.js";

interface StashEntry {
  index: number;
  branch: string;
  message: string;
  date: string;
  files: string[];
}

function parseStashList(): StashEntry[] {
  const raw = execOutput('git stash list --format="%gd|%s|%ar"');
  if (!raw) return [];

  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [ref, subject, date] = line.split("|");
      const index = parseInt(ref.match(/stash@\{(\d+)\}/)?.[1] || "0");

      const branchMatch = subject.match(/(?:WIP on|On) ([^:]+):/);
      const branch = branchMatch?.[1] || "unknown";

      let message = subject.replace(/(?:WIP on|On) [^:]+:\s*/, "");
      if (subject.startsWith("WIP")) {
        message = message.replace(/^[a-f0-9]+ /, "");
      }
      message = message || "(no message)";

      const filesRaw = execOutput(
        `git stash show stash@{${index}} --name-only 2>/dev/null`
      );
      const files = filesRaw ? filesRaw.split("\n").filter(Boolean) : [];

      return { index, branch, message, date, files };
    });
}

function formatStashChoice(entry: StashEntry): string {
  const fileCount = entry.files.length;
  const filesInfo = fileCount > 0 ? colors.dim(` (${fileCount} 文件)`) : "";
  return `${colors.yellow(`[${entry.index}]`)} ${colors.green(entry.branch)} ${
    entry.message
  }${filesInfo} ${colors.dim(entry.date)}`;
}

function showStashDetail(entry: StashEntry): void {
  console.log();
  console.log(colors.yellow(`Stash #${entry.index}`));
  console.log(`分支: ${colors.green(entry.branch)}`);
  console.log(`消息: ${entry.message}`);
  console.log(`时间: ${colors.dim(entry.date)}`);

  if (entry.files.length > 0) {
    console.log(`文件 (${entry.files.length}):`);
    entry.files
      .slice(0, 10)
      .forEach((f) => console.log(`  ${colors.dim("•")} ${f}`));
    if (entry.files.length > 10) {
      console.log(colors.dim(`  ... 还有 ${entry.files.length - 10} 个文件`));
    }
  }
}

export async function stash(): Promise<void> {
  const entries = parseStashList();

  if (entries.length === 0) {
    console.log(colors.yellow("没有 stash 记录"));

    const status = execOutput("git status --porcelain");
    if (status) {
      const doStash = await select({
        message: "检测到未提交的变更，是否创建 stash?",
        choices: [
          { name: "是", value: true },
          { name: "否", value: false },
        ],
        theme,
      });
      if (doStash) {
        await createStash();
      }
    }
    return;
  }

  console.log(colors.green(`共 ${entries.length} 个 stash:\n`));

  const choices = entries.map((entry) => ({
    name: formatStashChoice(entry),
    value: entry.index.toString(),
  }));
  choices.push({ name: colors.dim("+ 创建新 stash"), value: "__new__" });
  choices.push({ name: colors.dim("取消"), value: "__cancel__" });

  const selected = await select({
    message: "选择 stash:",
    choices,
    theme,
  });

  if (selected === "__cancel__") {
    return;
  }

  if (selected === "__new__") {
    await createStash();
    return;
  }

  const entry = entries.find((e) => e.index.toString() === selected)!;
  await showStashActions(entry);
}

async function showStashActions(entry: StashEntry): Promise<void> {
  showStashDetail(entry);
  divider();

  const action = await select({
    message: "操作:",
    choices: [
      { name: "应用 (保留 stash)", value: "apply" },
      { name: "弹出 (应用并删除)", value: "pop" },
      { name: "创建分支", value: "branch" },
      { name: "查看差异", value: "diff" },
      { name: "删除", value: "drop" },
      { name: "返回列表", value: "back" },
      { name: "取消", value: "cancel" },
    ],
    theme,
  });

  switch (action) {
    case "apply":
      applyStash(entry.index, false);
      break;
    case "pop":
      applyStash(entry.index, true);
      break;
    case "branch":
      await createBranchFromStash(entry.index);
      break;
    case "diff":
      await showDiff(entry.index);
      await showStashActions(entry);
      break;
    case "drop":
      await dropStash(entry.index);
      break;
    case "back":
      await stash();
      break;
  }
}

async function createStash(): Promise<void> {
  const status = execOutput("git status --porcelain");
  if (!status) {
    console.log(colors.yellow("没有需要 stash 的变更"));
    return;
  }

  const hasUntracked = status.split("\n").some((line) => line.startsWith("??"));

  let includeUntracked = false;
  if (hasUntracked) {
    includeUntracked = await select({
      message: "检测到未跟踪的文件，是否一并 stash?",
      choices: [
        { name: "是 (包含未跟踪文件)", value: true },
        { name: "否 (仅已跟踪文件)", value: false },
      ],
      theme,
    });
  }

  const message = await input({
    message: "Stash 消息 (可选):",
    theme,
  });

  const spinner = ora("创建 stash...").start();
  try {
    let cmd = "git stash push";
    if (includeUntracked) cmd += " -u";
    if (message) cmd += ` -m "${message.replace(/"/g, '\\"')}"`;
    execSync(cmd, { stdio: "pipe" });
    spinner.succeed("Stash 创建成功");
    await stash();
  } catch {
    spinner.fail("Stash 创建失败");
  }
}

function applyStash(index: number, pop: boolean): void {
  const action = pop ? "pop" : "apply";
  const spinner = ora(`${pop ? "弹出" : "应用"} stash...`).start();

  try {
    execSync(`git stash ${action} stash@{${index}}`, { stdio: "pipe" });
    spinner.succeed(`Stash ${pop ? "已弹出" : "已应用"}`);
  } catch {
    spinner.fail("操作失败，可能存在冲突");
    const status = execOutput("git status --porcelain");
    if (status.includes("UU") || status.includes("AA")) {
      console.log(colors.yellow("\n存在冲突，请手动解决后提交"));
    }
  }
}

async function showDiff(index: number): Promise<void> {
  try {
    execSync(`git stash show -p --color=always stash@{${index}}`, {
      stdio: "inherit",
    });
    console.log();
    await input({
      message: colors.dim("按 Enter 返回菜单..."),
      theme,
    });
  } catch {
    console.log(colors.red("无法显示差异"));
  }
}

async function createBranchFromStash(index: number): Promise<void> {
  const type = await select({
    message: "选择分支类型:",
    choices: [
      { name: "feature", value: "feature" as BranchType },
      { name: "hotfix", value: "hotfix" as BranchType },
      { name: "取消", value: "__cancel__" },
    ],
    theme,
  });

  if (type === "__cancel__") {
    console.log(colors.yellow("已取消"));
    return;
  }

  const branchName = await getBranchName(type as BranchType);
  if (!branchName) return;

  const spinner = ora(`创建分支 ${branchName}...`).start();
  try {
    execSync(`git stash branch "${branchName}" stash@{${index}}`, {
      stdio: "pipe",
    });
    spinner.succeed(`分支已创建: ${branchName} (stash 已自动弹出)`);
  } catch {
    spinner.fail("创建分支失败");
  }
}

async function dropStash(index: number): Promise<void> {
  const confirmed = await select({
    message: `确认删除 stash@{${index}}?`,
    choices: [
      { name: "是", value: true },
      { name: "否", value: false },
    ],
    theme,
  });

  if (!confirmed) {
    console.log(colors.yellow("已取消"));
    return;
  }

  const spinner = ora("删除 stash...").start();
  try {
    execSync(`git stash drop stash@{${index}}`, { stdio: "pipe" });
    spinner.succeed("Stash 已删除");
  } catch {
    spinner.fail("删除失败");
  }
}
