import { existsSync, readFileSync } from "fs";
import { join } from "path";
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
}

const defaultConfig: GwConfig = {
  featurePrefix: "feature",
  hotfixPrefix: "hotfix",
  requireId: false,
  featureIdLabel: "Story ID",
  hotfixIdLabel: "Issue ID",
  autoStage: true,
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

export function loadConfig(): GwConfig {
  const configPath = findConfigFile();

  if (!configPath) {
    return defaultConfig;
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    const userConfig = JSON.parse(content) as Partial<GwConfig>;
    return { ...defaultConfig, ...userConfig };
  } catch (e) {
    console.warn(`配置文件解析失败: ${configPath}`);
    return defaultConfig;
  }
}

// 全局配置实例
let config: GwConfig | null = null;

export function getConfig(): GwConfig {
  if (!config) {
    config = loadConfig();
  }
  return config;
}
