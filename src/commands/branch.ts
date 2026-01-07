import { execSync } from "child_process";
import { select, input } from "@inquirer/prompts";
import ora from "ora";
import {
  colors,
  TODAY,
  theme,
  exec,
  execOutput,
  getMainBranch,
  divider,
  type BranchType,
} from "../utils.js";
import { getConfig } from "../config.js";

export async function createBranch(
  type: BranchType,
  baseBranchArg?: string | null
): Promise<void> {
  const config = getConfig();

  const idLabel =
    type === "feature" ? config.featureIdLabel : config.hotfixIdLabel;
  const branchPrefix =
    type === "feature" ? config.featurePrefix : config.hotfixPrefix;

  const idMessage = config.requireId
    ? `请输入${idLabel}:`
    : `请输入${idLabel} (可跳过):`;

  const id = await input({ message: idMessage, theme });

  if (config.requireId && !id) {
    console.log(colors.red(`${idLabel}不能为空`));
    return;
  }

  const description = await input({ message: "请输入描述:", theme });
  if (!description) {
    console.log(colors.red("描述不能为空"));
    return;
  }

  const branchName = id
    ? `${branchPrefix}/${TODAY}-${id}-${description}`
    : `${branchPrefix}/${TODAY}-${description}`;

  divider();

  // 优先使用参数，其次配置文件，最后自动检测
  let baseBranch: string;
  if (baseBranchArg) {
    baseBranch = `origin/${baseBranchArg}`;
  } else if (config.baseBranch) {
    baseBranch = `origin/${config.baseBranch}`;
  } else {
    baseBranch = getMainBranch();
  }

  const spinner = ora(`正在从 ${baseBranch} 创建分支...`).start();

  try {
    exec(`git fetch origin ${baseBranch.replace("origin/", "")}`, true);
    exec(`git checkout -b "${branchName}" ${baseBranch}`);
    spinner.succeed(`分支创建成功: ${branchName}`);

    divider();

    // 根据配置决定是否询问推送
    let shouldPush: boolean;
    if (config.autoPush !== undefined) {
      shouldPush = config.autoPush;
      if (shouldPush) {
        console.log(colors.dim("(自动推送已启用)"));
      }
    } else {
      shouldPush = await select({
        message: "是否推送到远程?",
        choices: [
          { name: "是", value: true },
          { name: "否", value: false },
        ],
        theme,
      });
    }

    if (shouldPush) {
      const pushSpinner = ora("正在推送到远程...").start();
      try {
        execSync(`git push -u origin "${branchName}"`, { stdio: "pipe" });
        pushSpinner.succeed(`已推送到远程: origin/${branchName}`);
      } catch {
        pushSpinner.warn(
          "远程推送失败，可稍后手动执行: git push -u origin " + branchName
        );
      }
    }
  } catch {
    spinner.fail("分支创建失败");
  }
}

export async function deleteBranch(branchArg?: string): Promise<void> {
  const fetchSpinner = ora("正在获取分支信息...").start();
  exec("git fetch --all --prune", true);
  fetchSpinner.succeed("分支信息已更新");

  divider();

  const currentBranch = execOutput("git branch --show-current");

  let branch = branchArg;

  if (!branch) {
    const recentBranches = execOutput(
      "git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short)'"
    )
      .split("\n")
      .filter((b) => b && b !== currentBranch);

    if (recentBranches.length === 0) {
      console.log(colors.yellow("没有可删除的本地分支"));
      return;
    }

    interface BranchChoice {
      name: string;
      value: string;
    }

    const choices: BranchChoice[] = recentBranches.map((b) => {
      const hasRemote = execOutput(`git branch -r | grep "origin/${b}$"`);
      return {
        name: hasRemote ? `${b} (本地+远程)` : `${b} (仅本地)`,
        value: b,
      };
    });
    choices.push({ name: "取消", value: "__cancel__" });

    branch = await select({
      message: "选择要删除的分支 (按最近使用排序):",
      choices,
      theme,
    });

    if (branch === "__cancel__") {
      console.log(colors.yellow("已取消"));
      return;
    }
  }

  if (branch === currentBranch) {
    console.log(colors.red("不能删除当前所在分支"));
    return;
  }

  const localExists = execOutput(`git branch --list "${branch}"`);
  const hasRemote = execOutput(`git branch -r | grep "origin/${branch}$"`);

  if (!localExists) {
    if (hasRemote) {
      console.log(
        colors.yellow(`本地分支不存在，但远程分支存在: origin/${branch}`)
      );
      const deleteRemote = await select({
        message: `是否删除远程分支 origin/${branch}?`,
        choices: [
          { name: "是", value: true },
          { name: "否", value: false },
        ],
        theme,
      });

      if (deleteRemote) {
        const spinner = ora(`正在删除远程分支: origin/${branch}`).start();
        try {
          execSync(`git push origin --delete "${branch}"`, { stdio: "pipe" });
          spinner.succeed(`远程分支已删除: origin/${branch}`);
        } catch {
          spinner.fail("远程分支删除失败");
        }
      }
    } else {
      console.log(colors.red(`分支不存在: ${branch}`));
    }
    return;
  }

  const localSpinner = ora(`正在删除本地分支: ${branch}`).start();
  try {
    execSync(`git branch -D "${branch}"`, { stdio: "pipe" });
    localSpinner.succeed(`本地分支已删除: ${branch}`);
  } catch {
    localSpinner.fail("本地分支删除失败");
    return;
  }

  if (hasRemote) {
    divider();

    const deleteRemote = await select({
      message: `是否同时删除远程分支 origin/${branch}?`,
      choices: [
        { name: "是", value: true },
        { name: "否", value: false },
      ],
      theme,
    });

    if (deleteRemote) {
      const remoteSpinner = ora(`正在删除远程分支: origin/${branch}`).start();
      try {
        execSync(`git push origin --delete "${branch}"`, { stdio: "pipe" });
        remoteSpinner.succeed(`远程分支已删除: origin/${branch}`);
      } catch {
        remoteSpinner.fail("远程分支删除失败");
      }
    }
  }
}
