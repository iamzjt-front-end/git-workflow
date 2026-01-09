import { execSync } from "child_process";
import { select, input } from "@inquirer/prompts";
import ora from "ora";
import { colors, theme, exec, execOutput, divider } from "../utils.js";
import { getConfig } from "../config.js";

export async function listTags(prefix?: string): Promise<void> {
  const spinner = ora("正在获取 tags...").start();
  exec("git fetch --tags", true);
  spinner.stop();

  const pattern = prefix ? `${prefix}*` : "";
  const tags = execOutput(`git tag -l ${pattern} --sort=-v:refname`)
    .split("\n")
    .filter(Boolean);

  if (tags.length === 0) {
    console.log(
      colors.yellow(prefix ? `没有 '${prefix}' 开头的 tag` : "没有 tag")
    );
    return;
  }

  console.log(
    colors.green(prefix ? `以 '${prefix}' 开头的 tags:` : "所有 tags:")
  );
  tags.slice(0, 20).forEach((tag) => console.log(`  ${tag}`));

  if (tags.length > 20) {
    console.log(colors.yellow(`\n共 ${tags.length} 个，仅显示前 20 个`));
  }
}

interface PrefixInfo {
  prefix: string;
  latest: string;
  date: number;
}

interface TagChoice {
  name: string;
  value: string;
}

// 获取指定前缀的最新 tag（不依赖 shell 管道）
function getLatestTag(prefix: string): string {
  const tags = execOutput(`git tag -l "${prefix}*" --sort=-v:refname`)
    .split("\n")
    .filter(Boolean);
  return tags[0] || "";
}

export async function createTag(inputPrefix?: string): Promise<void> {
  const config = getConfig();
  const fetchSpinner = ora("正在获取 tags...").start();
  exec("git fetch --tags", true);
  fetchSpinner.stop();

  divider();

  let prefix = inputPrefix;

  // 如果没有指定前缀，优先使用配置文件中的默认前缀
  if (!prefix && config.defaultTagPrefix) {
    prefix = config.defaultTagPrefix;
    console.log(colors.dim(`(使用配置的默认前缀: ${prefix})`));
  }

  if (!prefix) {
    const allTags = execOutput("git tag -l").split("\n").filter(Boolean);

    // 仓库没有任何 tag 的情况
    if (allTags.length === 0) {
      prefix = await input({
        message: "当前仓库没有 tag，请输入前缀 (如 v):",
        default: "v",
        theme,
      });
      if (!prefix) {
        console.log(colors.yellow("已取消"));
        return;
      }

      // 选择初始版本号
      const initialVersion = await select({
        message: "选择初始版本号:",
        choices: [
          { name: `${prefix}0.0.1`, value: "0.0.1" },
          { name: `${prefix}0.1.0`, value: "0.1.0" },
          { name: `${prefix}1.0.0`, value: "1.0.0" },
          { name: "自定义...", value: "__custom__" },
        ],
        theme,
      });

      let version = initialVersion;
      if (initialVersion === "__custom__") {
        version = await input({
          message: "请输入版本号 (如 0.0.1):",
          theme,
        });
        if (!version) {
          console.log(colors.yellow("已取消"));
          return;
        }
      }

      const newTag = `${prefix}${version}`;
      const ok = await select({
        message: `确认创建 ${newTag}?`,
        choices: [
          { name: "是", value: true },
          { name: "否", value: false },
        ],
        theme,
      });
      if (ok) {
        doCreateTag(newTag);
      }
      return;
    }

    // 从现有 tag 中提取前缀
    const prefixes = [
      ...new Set(allTags.map((t) => t.replace(/[0-9].*/, "")).filter(Boolean)),
    ];

    if (prefixes.length === 0) {
      // 有 tag 但无法提取前缀（比如纯数字 tag）
      prefix = await input({
        message: "请输入 tag 前缀 (如 v):",
        default: "v",
        theme,
      });
      if (!prefix) {
        console.log(colors.yellow("已取消"));
        return;
      }
    } else {
      const prefixWithDate: PrefixInfo[] = prefixes.map((p) => {
        const latest = getLatestTag(p);
        const date = latest
          ? execOutput(`git log -1 --format=%ct "${latest}" 2>/dev/null`)
          : "0";
        return { prefix: p, latest, date: parseInt(date) || 0 };
      });
      prefixWithDate.sort((a, b) => b.date - a.date);

      const choices: TagChoice[] = prefixWithDate.map(
        ({ prefix: p, latest }) => {
          return { name: `${p} (最新: ${latest})`, value: p };
        }
      );
      choices.push({ name: "输入新前缀...", value: "__new__" });

      prefix = await select({
        message: "选择 tag 前缀:",
        choices,
        theme,
      });

      if (prefix === "__new__") {
        prefix = await input({ message: "请输入新前缀:", theme });
        if (!prefix) {
          console.log(colors.yellow("已取消"));
          return;
        }
      }
    }
  }

  const latestTag = getLatestTag(prefix);

  if (!latestTag) {
    const newTag = `${prefix}1.0.0`;
    console.log(
      colors.yellow(`未找到 '${prefix}' 开头的 tag，将创建 ${newTag}`)
    );
    const ok = await select({
      message: `确认创建 ${newTag}?`,
      choices: [
        { name: "是", value: true },
        { name: "否", value: false },
      ],
      theme,
    });
    if (ok) {
      doCreateTag(newTag);
    }
    return;
  }

  console.log(colors.yellow(`当前最新 tag: ${latestTag}`));

  divider();

  const version = latestTag.slice(prefix.length);

  // 解析版本号，支持预发布版本如 1.0.0-beta.1
  const preReleaseMatch = version.match(
    /^(\d+)\.(\d+)\.(\d+)-([a-zA-Z]+)\.(\d+)$/
  );
  const match3 = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  const match2 = version.match(/^(\d+)\.(\d+)$/);
  const match1 = version.match(/^(\d+)$/);

  let choices: TagChoice[] = [];

  if (preReleaseMatch) {
    // 预发布版本: 1.0.0-beta.1
    const [, majorStr, minorStr, patchStr, preTag, preNumStr] = preReleaseMatch;
    const major = Number(majorStr);
    const minor = Number(minorStr);
    const patch = Number(patchStr);
    const preNum = Number(preNumStr);
    const baseVersion = `${major}.${minor}.${patch}`;

    choices = [
      {
        name: `pre    → ${prefix}${baseVersion}-${preTag}.${preNum + 1}`,
        value: `${prefix}${baseVersion}-${preTag}.${preNum + 1}`,
      },
      {
        name: `release→ ${prefix}${baseVersion}`,
        value: `${prefix}${baseVersion}`,
      },
      {
        name: `patch  → ${prefix}${major}.${minor}.${patch + 1}`,
        value: `${prefix}${major}.${minor}.${patch + 1}`,
      },
      {
        name: `minor  → ${prefix}${major}.${minor + 1}.0`,
        value: `${prefix}${major}.${minor + 1}.0`,
      },
      {
        name: `major  → ${prefix}${major + 1}.0.0`,
        value: `${prefix}${major + 1}.0.0`,
      },
    ];
  } else if (match3) {
    const [, majorStr, minorStr, patchStr] = match3;
    const major = Number(majorStr);
    const minor = Number(minorStr);
    const patch = Number(patchStr);
    choices = [
      {
        name: `patch  → ${prefix}${major}.${minor}.${patch + 1}`,
        value: `${prefix}${major}.${minor}.${patch + 1}`,
      },
      {
        name: `minor  → ${prefix}${major}.${minor + 1}.0`,
        value: `${prefix}${major}.${minor + 1}.0`,
      },
      {
        name: `major  → ${prefix}${major + 1}.0.0`,
        value: `${prefix}${major + 1}.0.0`,
      },
      {
        name: `alpha  → ${prefix}${major}.${minor}.${patch + 1}-alpha.1`,
        value: `${prefix}${major}.${minor}.${patch + 1}-alpha.1`,
      },
      {
        name: `beta   → ${prefix}${major}.${minor}.${patch + 1}-beta.1`,
        value: `${prefix}${major}.${minor}.${patch + 1}-beta.1`,
      },
      {
        name: `rc     → ${prefix}${major}.${minor}.${patch + 1}-rc.1`,
        value: `${prefix}${major}.${minor}.${patch + 1}-rc.1`,
      },
    ];
  } else if (match2) {
    const [, majorStr, minorStr] = match2;
    const major = Number(majorStr);
    const minor = Number(minorStr);
    choices = [
      {
        name: `minor  → ${prefix}${major}.${minor + 1}`,
        value: `${prefix}${major}.${minor + 1}`,
      },
      {
        name: `major  → ${prefix}${major + 1}.0`,
        value: `${prefix}${major + 1}.0`,
      },
    ];
  } else if (match1) {
    const num = Number(match1[1]);
    choices = [
      { name: `next   → ${prefix}${num + 1}`, value: `${prefix}${num + 1}` },
    ];
  } else {
    console.log(colors.red(`无法解析版本号: ${version}`));
    return;
  }

  choices.push({ name: "取消", value: "__cancel__" });

  const nextTag = await select({
    message: "选择版本类型:",
    choices,
    theme,
  });

  if (nextTag === "__cancel__") {
    console.log(colors.yellow("已取消"));
    return;
  }

  doCreateTag(nextTag);
}

function doCreateTag(tagName: string): void {
  divider();

  const spinner = ora(`正在创建 tag: ${tagName}`).start();

  try {
    execSync(`git tag -a "${tagName}" -m "Release ${tagName}"`, {
      stdio: "pipe",
    });
    spinner.succeed(`Tag 创建成功: ${tagName}`);
  } catch {
    spinner.fail("tag 创建失败");
    return;
  }

  const pushSpinner = ora("正在推送到远程...").start();

  try {
    execSync(`git push origin "${tagName}"`, { stdio: "pipe" });
    pushSpinner.succeed(`Tag 已推送: ${tagName}`);
  } catch {
    pushSpinner.warn(
      `远程推送失败，可稍后手动执行: git push origin ${tagName}`
    );
  }
}

/**
 * 删除 tag
 */
export async function deleteTag(): Promise<void> {
  const fetchSpinner = ora("正在获取 tags...").start();
  exec("git fetch --tags", true);
  fetchSpinner.stop();

  const tags = execOutput("git tag -l --sort=-v:refname")
    .split("\n")
    .filter(Boolean);

  if (tags.length === 0) {
    console.log(colors.yellow("没有可删除的 tag"));
    return;
  }

  divider();

  const choices = tags.map((tag) => ({ name: tag, value: tag }));
  choices.push({ name: "取消", value: "__cancel__" });

  const tagToDelete = await select({
    message: "选择要删除的 tag:",
    choices,
    theme,
  });

  if (tagToDelete === "__cancel__") {
    console.log(colors.yellow("已取消"));
    return;
  }

  const confirm = await select({
    message: `确认删除 tag: ${colors.red(tagToDelete)}?`,
    choices: [
      { name: "是", value: true },
      { name: "否", value: false },
    ],
    theme,
  });

  if (!confirm) {
    console.log(colors.yellow("已取消"));
    return;
  }

  divider();

  const spinner = ora(`正在删除本地 tag: ${tagToDelete}`).start();

  try {
    execSync(`git tag -d "${tagToDelete}"`, { stdio: "pipe" });
    spinner.succeed(`本地 tag 已删除: ${tagToDelete}`);
  } catch {
    spinner.fail("本地 tag 删除失败");
    return;
  }

  const deleteRemote = await select({
    message: "是否同时删除远程 tag?",
    choices: [
      { name: "是", value: true },
      { name: "否", value: false },
    ],
    theme,
  });

  if (deleteRemote) {
    const pushSpinner = ora("正在删除远程 tag...").start();
    try {
      execSync(`git push origin --delete "${tagToDelete}"`, { stdio: "pipe" });
      pushSpinner.succeed(`远程 tag 已删除: ${tagToDelete}`);
    } catch {
      pushSpinner.warn(
        `远程删除失败，可稍后手动执行: git push origin --delete ${tagToDelete}`
      );
    }
  }
}

/**
 * 修改 tag（重新打标签）
 */
export async function updateTag(): Promise<void> {
  const fetchSpinner = ora("正在获取 tags...").start();
  exec("git fetch --tags", true);
  fetchSpinner.stop();

  const tags = execOutput("git tag -l --sort=-v:refname")
    .split("\n")
    .filter(Boolean);

  if (tags.length === 0) {
    console.log(colors.yellow("没有可修改的 tag"));
    return;
  }

  divider();

  const choices = tags.map((tag) => ({ name: tag, value: tag }));
  choices.push({ name: "取消", value: "__cancel__" });

  const tagToUpdate = await select({
    message: "选择要修改的 tag:",
    choices,
    theme,
  });

  if (tagToUpdate === "__cancel__") {
    console.log(colors.yellow("已取消"));
    return;
  }

  const newMessage = await input({
    message: "输入新的 tag 消息:",
    default: `Release ${tagToUpdate}`,
    theme,
  });

  if (!newMessage) {
    console.log(colors.yellow("已取消"));
    return;
  }

  divider();

  const spinner = ora(`正在更新 tag: ${tagToUpdate}`).start();

  try {
    // 删除旧 tag
    execSync(`git tag -d "${tagToUpdate}"`, { stdio: "pipe" });
    // 创建新 tag（在同一个 commit 上）
    execSync(`git tag -a "${tagToUpdate}" -m "${newMessage}"`, {
      stdio: "pipe",
    });
    spinner.succeed(`Tag 已更新: ${tagToUpdate}`);
  } catch {
    spinner.fail("tag 更新失败");
    return;
  }

  const pushRemote = await select({
    message: "是否推送到远程（会强制覆盖）?",
    choices: [
      { name: "是", value: true },
      { name: "否", value: false },
    ],
    theme,
  });

  if (pushRemote) {
    const pushSpinner = ora("正在推送到远程...").start();
    try {
      execSync(`git push origin "${tagToUpdate}" --force`, { stdio: "pipe" });
      pushSpinner.succeed(`Tag 已推送: ${tagToUpdate}`);
    } catch {
      pushSpinner.warn(
        `远程推送失败，可稍后手动执行: git push origin ${tagToUpdate} --force`
      );
    }
  }
}
