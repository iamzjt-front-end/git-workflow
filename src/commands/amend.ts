import { execSync } from "child_process";
import { select, input, confirm } from "@inquirer/prompts";
import { colors, theme, execOutput, divider } from "../utils.js";

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
 * 修改指定 commit 的提交信息
 * @param commitHash 可选的 commit hash
 */
export async function amend(commitHash?: string): Promise<void> {
  console.log(colors.cyan("修改 Commit 提交信息"));
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
      message: "选择要修改的 commit:",
      choices: commits.map((c) => ({
        name: `${colors.yellow(c.hash.slice(0, 7))} ${c.message} ${colors.dim(c.date)}`,
        value: c,
        description: c.message,
      })),
      pageSize: 15,
      theme,
    });
  }

  console.log("");
  console.log("当前 commit 信息:");
  console.log(`  Hash:    ${colors.yellow(selectedCommit.hash.slice(0, 7))}`);
  console.log(`  Message: ${selectedCommit.message}`);
  console.log(`  Date:    ${colors.dim(selectedCommit.date)}`);
  divider();

  // ========== 步骤 2: 输入新的 commit message ==========
  const newMessage = await input({
    message: "输入新的 commit message:",
    default: selectedCommit.message,
    validate: (value) => {
      if (!value.trim()) {
        return "commit message 不能为空";
      }
      return true;
    },
    theme,
  });

  // ========== 步骤 3: 预览并确认 ==========
  divider();
  console.log("修改预览:");
  console.log(
    `  Commit:      ${colors.yellow(selectedCommit.hash.slice(0, 7))}`,
  );
  console.log(`  旧 Message:  ${colors.dim(selectedCommit.message)}`);
  console.log(`  新 Message:  ${colors.green(newMessage)}`);
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
      execSync(`git commit --amend -m "${newMessage.replace(/"/g, '\\"')}"`, {
        stdio: "pipe",
      });

      console.log("");
      console.log(colors.green("✔ 修改成功"));
    } else {
      // 非最新 commit，使用 rebase
      console.log("");
      console.log(colors.cyan("正在执行 rebase..."));

      // 使用 git rebase -i 的自动化方式
      const parentHash = execOutput(`git rev-parse ${selectedCommit.hash}^`);

      // 创建临时的 rebase 脚本
      const rebaseScript = `#!/bin/sh
if [ "$1" = "${selectedCommit.hash}" ]; then
  echo "${newMessage}" > "$2"
fi
`;

      // 使用 filter-branch 修改 commit message
      const filterCmd = `git filter-branch -f --msg-filter 'if [ "$GIT_COMMIT" = "${selectedCommit.hash}" ]; then echo "${newMessage.replace(/"/g, '\\"')}"; else cat; fi' ${parentHash}..HEAD`;

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
