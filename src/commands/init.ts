import { existsSync, writeFileSync } from "fs";
import { select, input } from "@inquirer/prompts";
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
    const overwrite = await select({
      message: `${CONFIG_FILE} 已存在，是否覆盖?`,
      choices: [
        { name: "否，取消", value: false },
        { name: "是，覆盖", value: true },
      ],
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
  const requireId = await select({
    message: "是否要求必填 ID (Story ID / Issue ID)?",
    choices: [
      { name: "否", value: false },
      { name: "是", value: true },
    ],
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
  const autoStage = await select({
    message: "Commit 时是否自动暂存所有更改?",
    choices: [
      { name: "是", value: true },
      { name: "否", value: false },
    ],
    theme,
  });
  if (!autoStage) config.autoStage = false;

  const useEmoji = await select({
    message: "Commit 时是否使用 emoji?",
    choices: [
      { name: "是", value: true },
      { name: "否", value: false },
    ],
    theme,
  });
  if (!useEmoji) config.useEmoji = false;

  // 始终写入默认的 commitEmojis 配置，方便用户修改
  config.commitEmojis = DEFAULT_COMMIT_EMOJIS;

  divider();

  // AI Commit 配置
  console.log(
    colors.dim("\nAI Commit 配置 (使用 AI 自动生成 commit message)\n")
  );

  const enableAI = await select({
    message: "是否启用 AI Commit 功能?",
    choices: [
      { name: "是（推荐）", value: true },
      { name: "否", value: false },
    ],
    theme,
  });

  if (enableAI) {
    const aiProvider = await select({
      message: "选择 AI 提供商:",
      choices: [
        {
          name: "GitHub Models（免费，推荐）",
          value: "github",
          description: "使用 GitHub 账号，每天 150 次免费",
        },
        {
          name: "Groq（免费）",
          value: "groq",
          description: "需要注册，每天 14,400 次免费",
        },
        {
          name: "OpenAI（付费）",
          value: "openai",
          description: "需要付费 API key",
        },
        {
          name: "Claude（付费）",
          value: "claude",
          description: "需要付费 API key",
        },
        {
          name: "Ollama（本地）",
          value: "ollama",
          description: "需要安装 Ollama",
        },
      ],
      theme,
    });

    const useBuiltinKey = await select({
      message: "API Key 配置:",
      choices: [
        {
          name: "使用内置 Key（开箱即用）",
          value: true,
          description: "使用工具内置的 API key，共享限额",
        },
        {
          name: "使用自己的 Key（推荐）",
          value: false,
          description: "配置自己的 API key，独享限额",
        },
      ],
      theme,
    });

    let apiKey = "";
    if (!useBuiltinKey) {
      apiKey = await input({
        message: `输入你的 ${
          aiProvider === "github" ? "GitHub Token" : "API Key"
        }:`,
        validate: (value) => {
          if (!value.trim()) return "API Key 不能为空";
          return true;
        },
        theme,
      });
    }

    const language = await select({
      message: "生成的 commit message 语言:",
      choices: [
        { name: "中文", value: "zh-CN" },
        { name: "English", value: "en-US" },
      ],
      theme,
    });

    config.aiCommit = {
      enabled: true,
      provider: aiProvider as
        | "github"
        | "groq"
        | "openai"
        | "claude"
        | "ollama",
      apiKey: apiKey || undefined,
      language: language as "zh-CN" | "en-US",
    };

    // 根据提供商设置默认模型
    const defaultModels: Record<string, string> = {
      github: "gpt-4o-mini",
      groq: "llama-3.1-8b-instant",
      openai: "gpt-4o-mini",
      claude: "claude-3-haiku-20240307",
      ollama: "qwen2.5-coder:7b",
    };
    config.aiCommit.model = defaultModels[aiProvider];
  } else {
    config.aiCommit = {
      enabled: false,
    };
  }

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

  if (config.aiCommit?.enabled) {
    console.log(
      colors.dim(
        "提示: AI Commit 已启用，运行 'gw c' 时可以选择 AI 自动生成 commit message"
      )
    );
    if (!config.aiCommit.apiKey) {
      console.log(
        colors.yellow(
          "\n⚠️  当前使用内置 API key，建议配置自己的 key 以获得更好的体验"
        )
      );
      console.log(
        colors.dim("   获取方法: https://github.com/settings/tokens/new")
      );
    }
  }

  console.log(colors.dim("\n" + content));
}
