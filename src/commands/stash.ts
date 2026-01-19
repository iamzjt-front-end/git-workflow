import { spawn } from "child_process";
import { select, input } from "@inquirer/prompts";
import ora from "ora";
import boxen from "boxen";
import {
  colors,
  theme,
  divider,
  execOutput,
  execAsync,
  execWithSpinner,
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
        `git stash show stash@{${index}} --name-only 2>/dev/null`,
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
      await applyStash(entry.index, false);
      break;
    case "pop":
      await applyStash(entry.index, true);
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
  let cmd = "git stash push";
  if (includeUntracked) cmd += " -u";
  if (message) cmd += ` -m "${message.replace(/"/g, '\\"')}"`;

  const success = await execWithSpinner(
    cmd,
    spinner,
    "Stash 创建成功",
    "Stash 创建失败",
  );

  if (success) {
    await stash();
  }
}

async function applyStash(index: number, pop: boolean): Promise<void> {
  const action = pop ? "pop" : "apply";
  const spinner = ora(`${pop ? "弹出" : "应用"} stash...`).start();

  const success = await execWithSpinner(
    `git stash ${action} stash@{${index}}`,
    spinner,
    `Stash ${pop ? "已弹出" : "已应用"}`,
    "操作失败，可能存在冲突",
  );

  if (!success) {
    const status = execOutput("git status --porcelain");
    if (status.includes("UU") || status.includes("AA")) {
      console.log(colors.yellow("\n存在冲突，请手动解决后提交"));
    }
  }
}

async function showDiff(index: number): Promise<void> {
  try {
    // 获取差异内容（不使用颜色，我们自己格式化）
    const diffOutput = execOutput(
      `git stash show -p --no-color stash@{${index}}`,
    );

    if (!diffOutput) {
      console.log(colors.yellow("没有差异内容"));
      await input({
        message: colors.dim("按 Enter 返回菜单..."),
        theme,
      });
      return;
    }

    // 获取统计信息
    const statsOutput = execOutput(`git stash show --stat stash@{${index}}`);

    // 解析差异内容，按文件分组
    const files = parseDiffByFile(diffOutput);

    // 构建完整输出
    let fullOutput = "";

    // 添加统计信息
    if (statsOutput) {
      const statsBox = boxen(statsOutput, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: "double",
        borderColor: "yellow",
        title: `📊 Stash #${index} 统计`,
        titleAlignment: "center",
      });
      fullOutput += statsBox + "\n";
    }

    // 为每个文件创建边框
    for (const file of files) {
      const fileContent = formatFileDiff(file);
      const fileBox = boxen(fileContent, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: "round",
        borderColor: "cyan",
        title: `📄 ${file.path}`,
        titleAlignment: "left",
      });
      fullOutput += fileBox + "\n";
    }

    // 使用 less 分页器显示，等待用户退出
    await startPager(fullOutput);
  } catch (error) {
    console.log(colors.red("无法显示差异"));
    await input({
      message: colors.dim("按 Enter 返回菜单..."),
      theme,
    });
  }
}

/**
 * 解析差异内容，按文件分组
 */
interface FileDiff {
  path: string;
  lines: string[];
}

function parseDiffByFile(diffOutput: string): FileDiff[] {
  const files: FileDiff[] = [];
  const lines = diffOutput.split("\n");
  let currentFile: FileDiff | null = null;

  for (const line of lines) {
    // 检测文件头
    if (line.startsWith("diff --git")) {
      // 保存上一个文件
      if (currentFile && currentFile.lines.length > 0) {
        files.push(currentFile);
      }

      // 提取文件路径
      const match = line.match(/diff --git a\/(.*?) b\/(.*?)$/);
      const path = match ? match[2] : "unknown";

      currentFile = { path, lines: [] };
    } else if (currentFile) {
      // 跳过 index 和 --- +++ 行
      if (
        line.startsWith("index ") ||
        line.startsWith("--- ") ||
        line.startsWith("+++ ")
      ) {
        continue;
      }

      currentFile.lines.push(line);
    }
  }

  // 保存最后一个文件
  if (currentFile && currentFile.lines.length > 0) {
    files.push(currentFile);
  }

  return files;
}

/**
 * 格式化文件差异内容
 */
function formatFileDiff(file: FileDiff): string {
  const formattedLines: string[] = [];

  for (const line of file.lines) {
    if (line.startsWith("@@")) {
      // 位置信息 - 使用蓝色
      formattedLines.push(colors.blue(line));
    } else if (line.startsWith("+")) {
      // 新增行 - 使用绿色
      formattedLines.push(colors.green(line));
    } else if (line.startsWith("-")) {
      // 删除行 - 使用红色
      formattedLines.push(colors.red(line));
    } else {
      // 上下文行 - 使用灰色
      formattedLines.push(colors.dim(line));
    }
  }

  return formattedLines.join("\n");
}

/**
 * 启动分页器显示内容
 */
function startPager(content: string): Promise<void> {
  return new Promise((resolve) => {
    const pager = process.env.PAGER || "less";

    try {
      // -R: 支持ANSI颜色代码
      // -S: 不换行长行
      // -F: 如果内容少于一屏则直接退出
      // -X: 不清屏
      // -i: 忽略大小写搜索
      const pagerProcess = spawn(pager, ["-R", "-S", "-F", "-X", "-i"], {
        stdio: ["pipe", "inherit", "inherit"],
        env: { ...process.env, LESS: "-R -S -F -X -i" },
      });

      // 处理 stdin 的 EPIPE 错误（当 less 提前退出时）
      pagerProcess.stdin.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code !== "EPIPE") {
          console.error(err);
        }
      });

      // 将内容写入分页器
      pagerProcess.stdin.write(content);
      pagerProcess.stdin.end();

      // 等待分页器退出后返回菜单
      pagerProcess.on("exit", () => {
        resolve();
      });

      // 处理错误
      pagerProcess.on("error", () => {
        console.log(content);
        resolve();
      });
    } catch (error) {
      // 如果出错，直接输出内容
      console.log(content);
      resolve();
    }
  });
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
  await execWithSpinner(
    `git stash branch "${branchName}" stash@{${index}}`,
    spinner,
    `分支已创建: ${branchName} (stash 已自动弹出)`,
    "创建分支失败",
  );
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
  await execWithSpinner(
    `git stash drop stash@{${index}}`,
    spinner,
    "Stash 已删除",
    "删除失败",
  );
}
