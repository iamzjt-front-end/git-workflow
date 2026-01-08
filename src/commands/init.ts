import { existsSync, writeFileSync } from "fs";
import { select, input, confirm } from "@inquirer/prompts";
import { colors, theme, divider } from "../utils.js";
import type { GwConfig } from "../config.js";

const CONFIG_FILE = ".gwrc.json";

// 默认的 commit emoji 配置
const DEFAULT_COMMIT_EMOJIS = {
  feat: "✨",
  fix: "🐛",
  docs: "📝",
  style: "💄",
  refactor: "♻️",
  perf: "⚡️",
  test: "✅",
  build: "📦",
  ci: "👷",
  chore: "🔧",
  revert: "⏪",
};

export async function init(): Promise<void> {
  if (existsSync(CONFIG_FILE)) {
    const overwrite = await confirm({
      message: `${CONFIG_FILE} 已存在，是否覆盖?`,
      default: false,
      theme,
    });
    if (!overwrite) {
      console.log(colors.yellow("已取消"));
      return;
    }
  }

  console.log(colors.dim("配置 git-workflow，直接回车使用默认值\n"));

  const config: Partial<GwConfig> = {};

  // 基础分支
  const baseBranch = await input({
    message: "默认基础分支 (留空自动检测 main/master):",
    theme,
  });
  if (baseBranch) config.baseBranch = baseBranch;

  divider();

  // 分支前缀
  const featurePrefix = await input({
    message: "Feature 分支前缀:",
    default: "feature",
    theme,
  });
  if (featurePrefix !== "feature") config.featurePrefix = featurePrefix;

  const hotfixPrefix = await input({
    message: "Hotfix 分支前缀:",
    default: "hotfix",
    theme,
  });
  if (hotfixPrefix !== "hotfix") config.hotfixPrefix = hotfixPrefix;

  divider();

  // ID 配置
  const requireId = await confirm({
    message: "是否要求必填 ID (Story ID / Issue ID)?",
    default: false,
    theme,
  });
  if (requireId) config.requireId = true;

  const featureIdLabel = await input({
    message: "Feature 分支 ID 标签:",
    default: "Story ID",
    theme,
  });
  if (featureIdLabel !== "Story ID") config.featureIdLabel = featureIdLabel;

  const hotfixIdLabel = await input({
    message: "Hotfix 分支 ID 标签:",
    default: "Issue ID",
    theme,
  });
  if (hotfixIdLabel !== "Issue ID") config.hotfixIdLabel = hotfixIdLabel;

  divider();

  // Tag 配置
  const defaultTagPrefix = await input({
    message: "默认 Tag 前缀 (留空则每次选择):",
    theme,
  });
  if (defaultTagPrefix) config.defaultTagPrefix = defaultTagPrefix;

  // 自动推送
  const autoPushChoice = await select({
    message: "创建分支后是否自动推送?",
    choices: [
      { name: "每次询问", value: "ask" },
      { name: "自动推送", value: "yes" },
      { name: "不推送", value: "no" },
    ],
    theme,
  });
  if (autoPushChoice === "yes") config.autoPush = true;
  if (autoPushChoice === "no") config.autoPush = false;

  divider();

  // Commit 配置
  const autoStage = await confirm({
    message: "Commit 时是否自动暂存所有更改?",
    default: true,
    theme,
  });
  if (!autoStage) config.autoStage = false;

  const useEmoji = await confirm({
    message: "Commit 时是否使用 emoji?",
    default: true,
    theme,
  });
  if (!useEmoji) config.useEmoji = false;

  // 始终写入默认的 commitEmojis 配置，方便用户修改
  config.commitEmojis = DEFAULT_COMMIT_EMOJIS;

  divider();

  // 写入配置
  const content = JSON.stringify(config, null, 2);
  writeFileSync(CONFIG_FILE, content + "\n");

  console.log(colors.green(`✓ 配置已保存到 ${CONFIG_FILE}`));
  console.log(
    colors.dim(
      "\n提示: 可以在配置文件中修改 commitEmojis 来自定义各类型的 emoji"
    )
  );
  console.log(colors.dim("\n" + content));
}
