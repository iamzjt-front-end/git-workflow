import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { select, input } from "@inquirer/prompts";
import { colors, theme, divider } from "../utils.js";
import type { GwConfig } from "../config.js";

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
  console.log("");
  console.log(colors.bold("⚙️  初始化 git-workflow 配置"));
  console.log("");

  // 选择配置范围
  const configScope = await select({
    message: "选择配置范围:",
    choices: [
      {
        name: "全局配置（所有项目生效）",
        value: "global",
        description: "保存到 ~/.gwrc.json，所有项目都会使用此配置",
      },
      {
        name: "项目配置（仅当前项目）",
        value: "project",
        description: "保存到当前目录 .gwrc.json，仅当前项目使用",
      },
    ],
    theme,
  });

  const isGlobal = configScope === "global";
  const configFile = isGlobal ? join(homedir(), ".gwrc.json") : ".gwrc.json";

  if (existsSync(configFile)) {
    const overwrite = await select({
      message: `${isGlobal ? "全局" : "项目"}配置文件已存在，是否覆盖?`,
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
  config.featurePrefix = featurePrefix;

  const hotfixPrefix = await input({
    message: "Hotfix 分支前缀:",
    default: "hotfix",
    theme,
  });
  config.hotfixPrefix = hotfixPrefix;

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
  config.requireId = requireId;

  const featureIdLabel = await input({
    message: "Feature 分支 ID 标签:",
    default: "Story ID",
    theme,
  });
  config.featureIdLabel = featureIdLabel;

  const hotfixIdLabel = await input({
    message: "Hotfix 分支 ID 标签:",
    default: "Issue ID",
    theme,
  });
  config.hotfixIdLabel = hotfixIdLabel;

  divider();

  // 描述必填配置
  const featureRequireDescription = await select({
    message: "Feature 分支是否要求必填描述?",
    choices: [
      { name: "否", value: false },
      { name: "是", value: true },
    ],
    theme,
  });
  config.featureRequireDescription = featureRequireDescription;

  const hotfixRequireDescription = await select({
    message: "Hotfix 分支是否要求必填描述?",
    choices: [
      { name: "否", value: false },
      { name: "是", value: true },
    ],
    theme,
  });
  config.hotfixRequireDescription = hotfixRequireDescription;

  divider();

  // Tag 配置
  const defaultTagPrefix = await input({
    message: "默认 Tag 前缀 (留空则每次选择):",
    theme,
  });
  if (defaultTagPrefix) config.defaultTagPrefix = defaultTagPrefix;

  const tagLookupStrategy = await select({
    message: "Tag 递增基准策略:",
    choices: [
      {
        name: "仅基于最新创建的 Tag（默认）",
        value: "latest",
        description: "避免历史误打的高版本 tag 干扰后续递增",
      },
      {
        name: "全量排序",
        value: "all",
        description: "全量拉取 tags，并按版本号排序后取最新值",
      },
    ],
    theme,
  });
  config.tagLookupStrategy = tagLookupStrategy as "all" | "latest";

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
  if (autoPushChoice === "yes") {
    config.autoPush = true;
  } else if (autoPushChoice === "no") {
    config.autoPush = false;
  }
  // autoPushChoice === "ask" 时不设置，使用默认行为（每次询问）

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
  config.autoStage = autoStage;

  const useEmoji = await select({
    message: "Commit 时是否使用 emoji?",
    choices: [
      { name: "是", value: true },
      { name: "否", value: false },
    ],
    theme,
  });
  config.useEmoji = useEmoji;

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

    let apiKey = "";

    // GitHub Models 需要配置 GitHub Token
    if (aiProvider === "github") {
      console.log("");
      console.log(colors.cyan("💡 如何获取 GitHub Token:"));
      console.log(
        colors.dim("  1. 访问: https://github.com/settings/tokens/new")
      );
      console.log(colors.dim("  2. 勾选 'repo' 权限"));
      console.log(colors.dim("  3. 生成并复制 token"));
      console.log("");

      apiKey = await input({
        message: "输入你的 GitHub Token:",
        validate: (value) => {
          if (!value.trim()) return "GitHub Token 不能为空";
          return true;
        },
        theme,
      });
    } else if (aiProvider !== "ollama") {
      // OpenAI 和 Claude 必须配置 API key
      console.log("");
      if (aiProvider === "openai") {
        console.log(colors.cyan("💡 如何获取 OpenAI API Key:"));
        console.log(colors.dim("  访问: https://platform.openai.com/api-keys"));
      } else {
        console.log(colors.cyan("💡 如何获取 Claude API Key:"));
        console.log(colors.dim("  访问: https://console.anthropic.com/"));
      }
      console.log("");

      apiKey = await input({
        message: `输入你的 ${
          aiProvider === "openai" ? "OpenAI API Key" : "Claude API Key"
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

    const detailedDescription = await select({
      message: "是否生成详细的修改点描述?",
      choices: [
        {
          name: "是（包含修改点列表，推荐）",
          value: true,
          description:
            "如：feat(auth): 添加用户登录功能\n\n- 实现用户名密码登录接口\n- 添加登录状态验证中间件",
        },
        {
          name: "否（仅生成标题）",
          value: false,
          description: "如：feat(auth): 添加用户登录功能",
        },
      ],
      theme,
    });

    const aiUseEmoji = await select({
      message: "AI 生成的 commit message 是否包含 emoji?",
      choices: [
        {
          name: "是（推荐）",
          value: true,
          description: "如：✨ feat(auth): 添加用户登录功能",
        },
        {
          name: "否",
          value: false,
          description: "如：feat(auth): 添加用户登录功能",
        },
        {
          name: "跟随全局设置",
          value: undefined,
          description: `当前全局设置：${useEmoji ? "启用" : "禁用"} emoji`,
        },
      ],
      theme,
    });

    config.aiCommit = {
      enabled: true,
      provider: aiProvider as "github" | "openai" | "claude" | "ollama",
      apiKey: apiKey || undefined,
      language: language as "zh-CN" | "en-US",
      detailedDescription,
      useEmoji: aiUseEmoji,
    };

    // 根据提供商设置默认模型
    const defaultModels: Record<string, string> = {
      github: "gpt-4o-mini",
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
  writeFileSync(configFile, content + "\n");

  console.log(
    colors.green(
      `✓ 配置已保存到 ${
        isGlobal ? "全局配置文件" : "项目配置文件"
      }: ${configFile}`
    )
  );

  if (isGlobal) {
    console.log("");
    console.log(colors.cyan("💡 提示:"));
    console.log(
      colors.dim("  • 全局配置对所有项目生效，无需在每个项目中重复配置")
    );
    console.log(
      colors.dim("  • 如需为特定项目自定义配置，可在项目中运行 gw init")
    );
    console.log(colors.dim("  • 项目配置会覆盖全局配置"));
  } else {
    console.log("");
    console.log(
      colors.dim(
        "提示: 可以在配置文件中修改 commitEmojis 来自定义各类型的 emoji"
      )
    );
  }

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
