#!/usr/bin/env node

import { select, input } from "@inquirer/prompts";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 颜色定义
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✖ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

// 读取 package.json
const packagePath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
const currentVersion = packageJson.version;

// 计算下一个版本号
function calculateNextVersion(current, type) {
  const [major, minor, patch] = current.split(".").map(Number);

  switch (type) {
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "major":
      return `${major + 1}.0.0`;
    default:
      return current;
  }
}

// 验证版本号格式
function validateVersion(version) {
  const semverRegex =
    /^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  return semverRegex.test(version);
}

async function main() {
  console.log("");
  log.info(`当前版本: ${colors.cyan}${currentVersion}${colors.reset}`);
  console.log("");

  const patchVersion = calculateNextVersion(currentVersion, "patch");
  const minorVersion = calculateNextVersion(currentVersion, "minor");
  const majorVersion = calculateNextVersion(currentVersion, "major");

  const choices = [
    {
      name: `patch  ${currentVersion} → ${patchVersion}  (bug 修复)`,
      value: { type: "patch", version: patchVersion },
      description: "向后兼容的 bug 修复",
    },
    {
      name: `minor  ${currentVersion} → ${minorVersion}  (新功能)`,
      value: { type: "minor", version: minorVersion },
      description: "向后兼容的新功能",
    },
    {
      name: `major  ${currentVersion} → ${majorVersion}  (破坏性更新)`,
      value: { type: "major", version: majorVersion },
      description: "不向后兼容的重大更改",
    },
    {
      name: "custom (自定义版本号)",
      value: { type: "custom", version: null },
      description: "输入自定义版本号",
    },
  ];

  try {
    const answer = await select({
      message: "选择新版本号:",
      choices,
    });

    let newVersion = answer.version;

    // 如果选择自定义版本号
    if (answer.type === "custom") {
      newVersion = await input({
        message: "请输入版本号:",
        default: currentVersion,
        validate: (value) => {
          if (!value) {
            return "版本号不能为空";
          }
          if (!validateVersion(value)) {
            return "版本号格式无效，请使用语义化版本格式 (如 1.0.0 或 1.0.0-beta.1)";
          }
          return true;
        },
      });
    }

    // 更新 package.json
    console.log("");
    log.info(`正在更新版本号到 ${newVersion}...`);

    packageJson.version = newVersion;
    writeFileSync(
      packagePath,
      JSON.stringify(packageJson, null, "\t") + "\n",
      "utf-8"
    );

    log.success(`版本号已更新: ${currentVersion} → ${newVersion}`);
    console.log("");

    process.exit(0);
  } catch (error) {
    if (error.name === "ExitPromptError") {
      console.log("");
      log.info("已取消");
      process.exit(0);
    }
    log.error(`发生错误: ${error.message}`);
    process.exit(1);
  }
}

main();
