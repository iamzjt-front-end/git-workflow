import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { execOutput } from "./utils.js";

export interface GwConfig {
  // 默认基础分支，不设置则自动检测 main/master
  baseBranch?: string;
  // feature 分支前缀，默认 "feature"
  featurePrefix: string;
  // hotfix 分支前缀，默认 "hotfix"
  hotfixPrefix: string;
  // 是否要求必填 ID，默认 false
  requireId: boolean;
  // ID 标签名称
  featureIdLabel: string;
  hotfixIdLabel: string;
  // 默认 tag 前缀
  defaultTagPrefix?: string;
  // 创建分支后是否自动推送，默认询问
  autoPush?: boolean;
  // commit 时是否自动暂存所有更改，默认 true
  autoStage?: boolean;
  // commit 时是否使用 emoji，默认 true
  useEmoji?: boolean;
  // 自定义 commit 类型的 emoji
  commitEmojis?: {
    feat?: string;
    fix?: string;
    docs?: string;
    style?: string;
    refactor?: string;
    perf?: string;
    test?: string;
    build?: string;
    ci?: string;
    chore?: string;
    revert?: string;
  };
  // AI commit 配置
  aiCommit?: {
    enabled?: boolean; // 是否启用 AI commit，默认 true
    provider?: "github" | "openai" | "claude" | "ollama"; // AI 提供商，默认 github
    apiKey?: string; // API key，空则使用内置 key
    model?: string; // 模型名称
    language?: "zh-CN" | "en-US"; // 生成语言，默认 zh-CN
    maxTokens?: number; // 最大 token 数，默认 200
    detailedDescription?: boolean; // 是否生成详细的修改点描述，默认 false
  };
}

const defaultConfig: GwConfig = {
  featurePrefix: "feature",
  hotfixPrefix: "hotfix",
  requireId: false,
  featureIdLabel: "Story ID",
  hotfixIdLabel: "Issue ID",
  autoStage: true,
  useEmoji: true,
};

function getGitRoot(): string {
  return execOutput("git rev-parse --show-toplevel");
}

function findConfigFile(): string | null {
  const configNames = [".gwrc.json", ".gwrc", "gw.config.json"];

  // 先在当前目录找
  for (const name of configNames) {
    if (existsSync(name)) {
      return name;
    }
  }

  // 再在 git 根目录找
  try {
    const gitRoot = getGitRoot();
    if (gitRoot) {
      for (const name of configNames) {
        const configPath = join(gitRoot, name);
        if (existsSync(configPath)) {
          return configPath;
        }
      }
    }
  } catch {
    // 不在 git 仓库中
  }

  return null;
}

function findGlobalConfigFile(): string | null {
  const globalConfigPath = join(homedir(), ".gwrc.json");
  return existsSync(globalConfigPath) ? globalConfigPath : null;
}

export function loadConfig(): GwConfig {
  let config = { ...defaultConfig };

  // 1. 先加载全局配置
  const globalConfigPath = findGlobalConfigFile();
  if (globalConfigPath) {
    try {
      const content = readFileSync(globalConfigPath, "utf-8");
      const globalConfig = JSON.parse(content) as Partial<GwConfig>;
      // 深度合并 aiCommit 配置
      config = {
        ...config,
        ...globalConfig,
        aiCommit: {
          ...config.aiCommit,
          ...globalConfig.aiCommit,
        },
      };
    } catch (e) {
      console.warn(`全局配置文件解析失败: ${globalConfigPath}`);
    }
  }

  // 2. 再加载项目配置（会覆盖全局配置）
  const projectConfigPath = findConfigFile();
  if (projectConfigPath) {
    try {
      const content = readFileSync(projectConfigPath, "utf-8");
      const projectConfig = JSON.parse(content) as Partial<GwConfig>;
      // 深度合并 aiCommit 配置
      config = {
        ...config,
        ...projectConfig,
        aiCommit: {
          ...config.aiCommit,
          ...projectConfig.aiCommit,
        },
      };
    } catch (e) {
      console.warn(`项目配置文件解析失败: ${projectConfigPath}`);
    }
  }

  return config;
}

// 全局配置实例
let config: GwConfig | null = null;

export function getConfig(): GwConfig {
  if (!config) {
    config = loadConfig();
  }
  return config;
}
