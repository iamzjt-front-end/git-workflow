import { select, input } from "@inquirer/prompts";
import ora from "ora";
import {
  colors,
  theme,
  exec,
  execOutput,
  execAsync,
  execWithSpinner,
  divider,
} from "../utils.js";
import { getConfig } from "../config.js";

/**
 * 列出 tags（最新的显示在最下面，多个前缀分列展示）
 * @param prefix 可选的 tag 前缀过滤
 */
export async function listTags(prefix?: string): Promise<void> {
  // 1. 获取远程 tags
  const spinner = ora("正在获取 tags...").start();
  exec("git fetch --tags", true);
  spinner.stop();

  // 2. 获取 tags 列表（按版本号升序排序，最新的在最后）
  const pattern = prefix ? `${prefix}*` : "";
  const allTags = execOutput(`git tag -l ${pattern} --sort=v:refname`)
    .split("\n")
    .filter(Boolean);

  // 3. 过滤无效 tag（如 vnull、vundefined 等误操作产生的 tag）
  // 有效 tag 必须包含数字（版本号）
  const tags = allTags.filter((tag) => /\d/.test(tag));

  // 4. 如果没有 tags，提示并返回
  if (tags.length === 0) {
    console.log(
      colors.yellow(prefix ? `没有 '${prefix}' 开头的 tag` : "没有 tag"),
    );
    return;
  }

  // 5. 如果指定了前缀，直接显示单列（最多 5 个）
  if (prefix) {
    console.log(
      colors.green(`以 '${prefix}' 开头的 tags (共 ${tags.length} 个):`),
    );
    if (tags.length > 5) {
      console.log(colors.dim("  ..."));
    }
    const displayTags = tags.slice(-5);
    displayTags.forEach((tag) => console.log(`  ${tag}`));
    return;
  }

  // 6. 按前缀分组（提取 tag 名称中数字前的部分作为前缀）
  // 由于已过滤无效 tag，所有 tag 都包含数字
  const grouped = new Map<string, string[]>();
  tags.forEach((tag) => {
    // 提取数字之前的字母部分作为前缀（如 "v0.1.0" -> "v"）
    const prefix = tag.replace(/\d.*/, "") || "(无前缀)";
    if (!grouped.has(prefix)) {
      grouped.set(prefix, []);
    }
    grouped.get(prefix)!.push(tag);
  });

  // 7. 如果只有一个前缀，使用单列显示（最多 5 个）
  if (grouped.size === 1) {
    console.log(colors.green(`所有 tags (共 ${tags.length} 个):`));
    if (tags.length > 5) {
      console.log(colors.dim("  ..."));
    }
    const displayTags = tags.slice(-5);
    displayTags.forEach((tag) => console.log(`  ${tag}`));
    return;
  }

  // 7. 多个前缀，分列显示
  console.log(colors.green("所有 tags (按前缀分组):"));
  console.log("");

  // 8. 准备每列的数据（每列最多显示 5 个最新的 tag）
  const columns: Array<{ prefix: string; tags: string[]; hasMore: boolean }> =
    [];
  grouped.forEach((tagList, prefix) => {
    const hasMore = tagList.length > 5;
    // 取最后 5 个（最新的）
    const displayTags = hasMore ? tagList.slice(-5) : tagList;
    columns.push({ prefix, tags: displayTags, hasMore });
  });

  // 9. 计算每列的宽度（取所有 tag 中最长的，至少 20 字符）
  const maxTagLength = Math.max(
    ...columns.flatMap((col) => col.tags.map((t) => t.length)),
  );
  const columnWidth = Math.max(maxTagLength + 4, 20);

  // 10. 打印表头（显示前缀和总数）
  const headers = columns.map((col) => {
    const total = grouped.get(col.prefix)!.length;
    const header = `${col.prefix} (${total})`;
    return header.padEnd(columnWidth);
  });
  console.log(colors.cyan("  " + headers.join("  ")));

  // 11. 打印分隔线
  console.log(
    colors.dim(
      "  " +
        "─".repeat(columnWidth * columns.length + (columns.length - 1) * 2),
    ),
  );

  // 12. 打印省略号（如果某列有超过 5 个 tag）
  const ellipsisRow = columns
    .map((col) => {
      const text = col.hasMore ? "..." : "";
      return text.padEnd(columnWidth);
    })
    .join("  ");
  if (columns.some((col) => col.hasMore)) {
    console.log(colors.dim("  " + ellipsisRow));
  }

  // 13. 打印 tags 内容（按行打印，每行包含所有列的对应 tag）
  const maxRows = Math.max(...columns.map((col) => col.tags.length));
  for (let i = 0; i < maxRows; i++) {
    const row = columns
      .map((col) => {
        const tag = col.tags[i] || ""; // 如果该列没有这一行，填充空字符串
        return tag.padEnd(columnWidth);
      })
      .join("  ");
    console.log("  " + row);
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

// 获取指定前缀的最新有效 tag（必须包含数字）
function getLatestTag(prefix: string): string {
  const tags = execOutput(`git tag -l "${prefix}*" --sort=-v:refname`)
    .split("\n")
    .filter((tag) => tag && /\d/.test(tag)); // 过滤无效 tag
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
    // 过滤无效 tag（如 vnull、vundefined 等误操作产生的 tag）
    const allTags = execOutput("git tag -l")
      .split("\n")
      .filter((tag) => tag && /\d/.test(tag));

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

    // 从现有 tag 中提取前缀（数字之前的字母部分）
    const prefixes = [
      ...new Set(allTags.map((t) => t.replace(/\d.*/, "")).filter(Boolean)),
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
        },
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
      colors.yellow(`未找到 '${prefix}' 开头的 tag，将创建 ${newTag}`),
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
    /^(\d+)\.(\d+)\.(\d+)-([a-zA-Z]+)\.(\d+)$/,
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

  await doCreateTag(nextTag);
}

async function doCreateTag(tagName: string): Promise<void> {
  divider();

  const spinner = ora(`正在创建 tag: ${tagName}`).start();
  const success = await execWithSpinner(
    `git tag -a "${tagName}" -m "Release ${tagName}"`,
    spinner,
    `Tag 创建成功: ${tagName}`,
    "tag 创建失败",
  );

  if (!success) {
    return;
  }

  const pushSpinner = ora("正在推送到远程...").start();
  const pushSuccess = await execWithSpinner(
    `git push origin "${tagName}"`,
    pushSpinner,
    `Tag 已推送: ${tagName}`,
    "远程推送失败",
  );

  if (!pushSuccess) {
    console.log(colors.dim(`  可稍后手动执行: git push origin ${tagName}`));
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
  const localSuccess = await execWithSpinner(
    `git tag -d "${tagToDelete}"`,
    spinner,
    `本地 tag 已删除: ${tagToDelete}`,
    "本地 tag 删除失败",
  );

  if (!localSuccess) {
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
    const remoteSuccess = await execWithSpinner(
      `git push origin --delete "${tagToDelete}"`,
      pushSpinner,
      `远程 tag 已删除: ${tagToDelete}`,
    );

    if (!remoteSuccess) {
      pushSpinner.warn(
        `远程删除失败，可稍后手动执行: git push origin --delete ${tagToDelete}`,
      );
    }
  }
}

/**
 * 修改 tag 名称（重命名 tag）
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

  const oldTag = await select({
    message: "选择要重命名的 tag:",
    choices,
    theme,
  });

  if (oldTag === "__cancel__") {
    console.log(colors.yellow("已取消"));
    return;
  }

  console.log("");
  console.log(colors.dim(`当前 tag: ${oldTag}`));
  console.log("");

  const newTag = await input({
    message: "输入新的 tag 名称:",
    default: oldTag,
    theme,
  });

  if (!newTag || newTag === oldTag) {
    console.log(colors.yellow("已取消"));
    return;
  }

  // 检查新 tag 是否已存在
  const existingTags = execOutput("git tag -l").split("\n").filter(Boolean);
  if (existingTags.includes(newTag)) {
    console.log(colors.red(`Tag ${newTag} 已存在，无法重命名`));
    return;
  }

  divider();

  const spinner = ora(`正在重命名 tag: ${oldTag} → ${newTag}`).start();

  // 获取旧 tag 的 commit 和消息
  const commit = execOutput(`git rev-list -n 1 "${oldTag}"`).trim();
  const message = execOutput(
    `git tag -l --format='%(contents)' "${oldTag}"`,
  ).trim();

  // 创建新 tag（指向同一个 commit）
  let createSuccess: boolean;
  if (message) {
    createSuccess = await execWithSpinner(
      `git tag -a "${newTag}" "${commit}" -m "${message}"`,
      spinner,
    );
  } else {
    createSuccess = await execWithSpinner(
      `git tag "${newTag}" "${commit}"`,
      spinner,
    );
  }

  if (!createSuccess) {
    spinner.fail("tag 重命名失败");
    return;
  }

  // 删除旧 tag
  const deleteSuccess = await execAsync(`git tag -d "${oldTag}"`, spinner);
  if (!deleteSuccess) {
    spinner.fail("删除旧 tag 失败");
    return;
  }

  spinner.succeed(`Tag 已重命名: ${oldTag} → ${newTag}`);

  const pushRemote = await select({
    message: "是否同步到远程?",
    choices: [
      { name: "是", value: true },
      { name: "否", value: false },
    ],
    theme,
  });

  if (pushRemote) {
    const pushSpinner = ora("正在同步到远程...").start();

    // 推送新 tag
    const pushNewSuccess = await execAsync(
      `git push origin "${newTag}"`,
      pushSpinner,
    );
    if (!pushNewSuccess) {
      pushSpinner.warn(
        `远程同步失败，可稍后手动执行:\n  git push origin ${newTag}\n  git push origin --delete ${oldTag}`,
      );
      return;
    }

    // 删除远程旧 tag
    const deleteOldSuccess = await execAsync(
      `git push origin --delete "${oldTag}"`,
      pushSpinner,
    );
    if (!deleteOldSuccess) {
      pushSpinner.warn(
        `远程旧 tag 删除失败，可稍后手动执行: git push origin --delete ${oldTag}`,
      );
      return;
    }

    pushSpinner.succeed(`远程 tag 已同步: ${oldTag} → ${newTag}`);
  }
}

/**
 * 清理无效标签（不包含数字的标签）
 */
export async function cleanInvalidTags(): Promise<void> {
  const fetchSpinner = ora("正在获取 tags...").start();
  exec("git fetch --tags", true);
  fetchSpinner.stop();

  divider();

  // 获取所有标签
  const allTags = execOutput("git tag -l").split("\n").filter(Boolean);

  // 过滤出无效标签（不包含数字）
  const invalidTags = allTags.filter((tag) => !/\d/.test(tag));

  if (invalidTags.length === 0) {
    console.log(colors.green("✅ 没有找到无效标签"));
    return;
  }

  console.log(colors.yellow(`❌ 找到 ${invalidTags.length} 个无效标签：`));
  console.log("");

  // 显示每个无效标签的详细信息
  for (const tag of invalidTags) {
    try {
      const commitHash = execOutput(`git rev-list -n 1 "${tag}"`).trim();
      const commitDate = execOutput(`git log -1 --format=%ai "${tag}"`).trim();
      const commitMsg = execOutput(`git log -1 --format=%s "${tag}"`).trim();

      console.log(colors.red(`  标签: ${tag}`));
      console.log(colors.dim(`    Commit: ${commitHash}`));
      console.log(colors.dim(`    日期: ${commitDate}`));
      console.log(colors.dim(`    消息: ${commitMsg}`));
      console.log("");
    } catch {
      console.log(colors.red(`  标签: ${tag}`));
      console.log(colors.dim(`    (无法获取提交信息)`));
      console.log("");
    }
  }

  divider();

  const shouldClean = await select({
    message: "是否删除这些无效标签？",
    choices: [
      { name: "是，删除所有无效标签", value: true },
      { name: "否，取消操作", value: false },
    ],
    theme,
  });

  if (!shouldClean) {
    console.log(colors.yellow("已取消"));
    return;
  }

  divider();

  // 删除本地标签
  const localSpinner = ora("正在删除本地无效标签...").start();
  let localSuccess = 0;
  let localFailed = 0;

  for (const tag of invalidTags) {
    const success = await execAsync(`git tag -d "${tag}"`, localSpinner);
    if (success) {
      localSuccess++;
    } else {
      localFailed++;
    }
  }

  if (localFailed === 0) {
    localSpinner.succeed(`本地标签已删除: ${localSuccess} 个`);
  } else {
    localSpinner.warn(
      `本地标签删除: 成功 ${localSuccess} 个，失败 ${localFailed} 个`,
    );
  }

  // 询问是否删除远程标签
  const deleteRemote = await select({
    message: "是否同时删除远程的无效标签？",
    choices: [
      { name: "是", value: true },
      { name: "否", value: false },
    ],
    theme,
  });

  if (deleteRemote) {
    const remoteSpinner = ora("正在删除远程无效标签...").start();
    let remoteSuccess = 0;
    let remoteFailed = 0;

    for (const tag of invalidTags) {
      const success = await execAsync(
        `git push origin --delete "${tag}"`,
        remoteSpinner,
      );
      if (success) {
        remoteSuccess++;
      } else {
        remoteFailed++;
      }
    }

    if (remoteFailed === 0) {
      remoteSpinner.succeed(`远程标签已删除: ${remoteSuccess} 个`);
    } else {
      remoteSpinner.warn(
        `远程标签删除: 成功 ${remoteSuccess} 个，失败 ${remoteFailed} 个`,
      );
    }
  }

  console.log("");
  console.log(colors.green("✨ 清理完成！"));
}
