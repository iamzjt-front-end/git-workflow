import { execSync } from "child_process";
import { select, input, confirm } from "@inquirer/prompts";
import { colors, theme, execOutput, divider } from "../utils.js";

/**
 * 格式化日期为 Git 可接受的格式
 * @param date Date 对象
 * @returns Git 日期格式字符串 (YYYY-MM-DD HH:mm:ss)
 */
function formatGitDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 解析用户输入的日期
 * 支持格式：YYYY-MM-DD (默认 00:00:00)
 * @param input 用户输入
 * @returns Date 对象或 null
 */
function parseDate(input: string): Date | null {
  const trimmed = input.trim();
  const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      0,
      0,
      0,
    );
  }

  return null;
}

/**
 * 获取最近的 commits
 * @param limit 数量限制
 * @returns commit 列表
 */
function getRecentCommits(limit: number = 20): Array<{
  hash: string;
  message: string;
  date: string;
}> {
  const output = execOutput(`git log -${limit} --pretty=format:"%H|%s|%ai"`);

  if (!output) return [];

  return output.split("\n").map((line) => {
    const [hash, message, date] = line.split("|");
    return { hash, message, date };
  });
}

/**
 * 根据 hash 获取 commit 信息
 * @param hash commit hash (可以是短 hash)
 * @returns commit 信息或 null
 */
function getCommitByHash(hash: string): {
  hash: string;
  message: string;
  date: string;
} | null {
  try {
    const output = execOutput(`git log -1 ${hash} --pretty=format:"%H|%s|%ai"`);

    if (!output) return null;

    const [fullHash, message, date] = output.split("|");
    return { hash: fullHash, message, date };
  } catch {
    return null;
  }
}

/**
 * 修改指定 commit 的提交时间
 * 支持修改 author date 和 committer date
 * @param commitHash 可选的 commit hash
 */
export async function amendDate(commitHash?: string): Promise<void> {
  console.log(colors.cyan("修改 Commit 提交时间"));
  divider();

  let selectedCommit: { hash: string; message: string; date: string };

  // ========== 步骤 1: 确定要修改的 commit ==========
  if (commitHash) {
    // 如果指定了 hash，直接获取该 commit
    const commit = getCommitByHash(commitHash);
    if (!commit) {
      console.log(colors.red(`✖ 找不到 commit: ${commitHash}`));
      return;
    }
    selectedCommit = commit;
  } else {
    // 否则让用户选择
    const commits = getRecentCommits(20);

    if (commits.length === 0) {
      console.log(colors.yellow("没有找到任何 commit"));
      return;
    }

    selectedCommit = await select({
      message: "选择要修改时间的 commit:",
      choices: commits.map((c) => ({
        name: `${colors.yellow(c.hash.slice(0, 7))} ${c.message.slice(0, 60)} ${colors.dim(c.date)}`,
        value: c,
        description: c.date,
      })),
      pageSize: 15,
      theme,
    });
  }

  console.log("");
  console.log("当前 commit 信息:");
  console.log(`  Hash:    ${colors.yellow(selectedCommit.hash.slice(0, 7))}`);
  console.log(`  Message: ${selectedCommit.message}`);
  console.log(`  Date:    ${colors.cyan(selectedCommit.date)}`);
  divider();

  // ========== 步骤 2: 输入新日期 ==========
  console.log(colors.dim("输入日期格式: YYYY-MM-DD (如: 2026-01-19)"));
  console.log("");

  const dateInput = await input({
    message: "输入新的日期:",
    validate: (value) => {
      const parsed = parseDate(value);
      if (!parsed) {
        return "日期格式不正确，请使用 YYYY-MM-DD 格式";
      }
      return true;
    },
    theme,
  });

  const newDate = parseDate(dateInput)!;
  const formattedDate = formatGitDate(newDate);

  // ========== 步骤 3: 预览并确认 ==========
  divider();
  console.log("修改预览:");
  console.log(`  Commit:   ${colors.yellow(selectedCommit.hash.slice(0, 7))}`);
  console.log(`  旧时间:   ${colors.dim(selectedCommit.date)}`);
  console.log(`  新时间:   ${colors.green(formattedDate)}`);
  console.log(`  修改类型: Author + Committer (两者都修改)`);
  divider();

  // 检查是否是最新的 commit
  const latestHash = execOutput("git rev-parse HEAD");
  const isLatestCommit = selectedCommit.hash === latestHash;

  if (!isLatestCommit) {
    console.log(
      colors.yellow(
        "⚠️  警告: 修改非最新 commit 需要使用 rebase，可能会改变 commit hash",
      ),
    );
    console.log(colors.dim("   这会影响已推送到远程的 commit，请谨慎操作"));
    console.log("");
  }

  const shouldProceed = await confirm({
    message: "确认修改?",
    default: false,
    theme,
  });

  if (!shouldProceed) {
    console.log(colors.yellow("已取消"));
    return;
  }

  // ========== 步骤 4: 执行修改 ==========
  try {
    if (isLatestCommit) {
      // 最新 commit，使用 amend
      // 使用 --reset-author 确保 Author Date 也被修改
      execSync(
        `GIT_AUTHOR_DATE="${formattedDate}" GIT_COMMITTER_DATE="${formattedDate}" git commit --amend --no-edit --reset-author`,
        { stdio: "pipe", shell: "/bin/bash" },
      );

      console.log("");
      console.log(colors.green("✔ 修改成功"));
    } else {
      // 非最新 commit，使用 filter-branch
      console.log("");
      console.log(colors.cyan("正在执行 rebase..."));

      const parentHash = execOutput(`git rev-parse ${selectedCommit.hash}^`);

      const filterCmd = `git filter-branch -f --env-filter 'if [ "$GIT_COMMIT" = "${selectedCommit.hash}" ]; then export GIT_AUTHOR_DATE="${formattedDate}"; export GIT_COMMITTER_DATE="${formattedDate}"; fi' ${parentHash}..HEAD`;

      execSync(filterCmd, { stdio: "pipe" });

      console.log(colors.green("✔ 修改成功"));
      console.log("");
      console.log(colors.yellow("⚠️  注意: commit hash 已改变"));
      console.log(colors.dim("   如果已推送到远程，需要使用 force push:"));
      console.log(colors.cyan("   git push --force-with-lease"));
    }

    console.log("");
  } catch (error) {
    console.log("");
    console.log(colors.red("✖ 修改失败"));
    if (error instanceof Error) {
      console.log(colors.dim(error.message));
    }
    console.log("");
    throw error;
  }
}
