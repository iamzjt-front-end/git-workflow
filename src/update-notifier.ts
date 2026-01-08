import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import boxen from "boxen";
import { select } from "@inquirer/prompts";
import ora from "ora";
import { colors } from "./utils.js";

const DISMISS_INTERVAL = 1000 * 60 * 60 * 24; // 24 小时后再次提示
const CACHE_FILE = ".gw-update-check";

interface UpdateCache {
  lastDismiss?: number; // 用户上次关闭提示的时间
  latestVersion?: string;
}

/**
 * 检查是否有新版本
 */
export async function checkForUpdates(
  currentVersion: string,
  packageName: string = "@zjex/git-workflow"
): Promise<void> {
  try {
    // 读取缓存
    const cache = readCache();
    const now = Date.now();

    // 如果用户在 24 小时内关闭过提示，跳过
    if (cache?.lastDismiss && now - cache.lastDismiss < DISMISS_INTERVAL) {
      return;
    }

    // 获取最新版本
    const latestVersion = await getLatestVersion(packageName);

    // 如果有新版本，显示提示
    if (latestVersion && latestVersion !== currentVersion) {
      const action = await showUpdateMessage(
        currentVersion,
        latestVersion,
        packageName
      );

      if (action === "update") {
        // 用户选择立即更新
        await performUpdate(packageName);
      } else if (action === "dismiss") {
        // 用户选择跳过，记录时间
        writeCache({ lastDismiss: now, latestVersion });
      }
      // action === "continue" 时直接继续，不记录
    }
  } catch (error) {
    // 静默失败，不影响主程序
  }
}

/**
 * 获取 npm 上的最新版本
 */
async function getLatestVersion(packageName: string): Promise<string | null> {
  try {
    const result = execSync(`npm view ${packageName} version`, {
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["pipe", "pipe", "ignore"], // 忽略 stderr
    });
    return result.trim();
  } catch {
    return null;
  }
}

/**
 * 显示更新提示消息并让用户选择
 * @returns "update" | "continue" | "dismiss"
 */
async function showUpdateMessage(
  current: string,
  latest: string,
  packageName: string
): Promise<"update" | "continue" | "dismiss"> {
  const message = [
    colors.bold("� 发现新版新本可用！"),
    "",
    `${colors.dim(current)}  →  ${colors.green(colors.bold(latest))}`,
  ].join("\n");

  console.log("");
  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "yellow",
      align: "left",
    })
  );

  try {
    const action = await select({
      message: "你想做什么？",
      choices: [
        {
          name: "🚀 立即更新",
          value: "update",
          description: `运行 npm install -g ${packageName}`,
        },
        {
          name: "⏭️  稍后更新，继续使用",
          value: "continue",
          description: "下次启动时会再次提示",
        },
        {
          name: "🙈 跳过此版本 (24h 内不再提示)",
          value: "dismiss",
          description: "24 小时内不会再提示此版本",
        },
      ],
    });

    return action as "update" | "continue" | "dismiss";
  } catch (error) {
    // 用户按了 Ctrl+C，视为继续
    console.log("");
    return "continue";
  }
}

/**
 * 执行更新
 */
async function performUpdate(packageName: string): Promise<void> {
  console.log("");

  const spinner = ora({
    text: "正在更新...",
    spinner: "dots",
  }).start();

  try {
    // 先尝试卸载旧版本（无 scope 的版本）
    try {
      execSync("npm uninstall -g git-workflow", {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      spinner.text = "已卸载旧版本，正在安装新版本...";
    } catch {
      // 旧版本不存在，忽略错误
    }

    // 执行更新命令
    execSync(`npm install -g ${packageName}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    spinner.succeed(colors.green("更新成功！"));
    console.log("");
    console.log(colors.cyan("  提示: 请重新运行命令以使用新版本"));
    console.log("");

    // 更新成功后退出，让用户重新运行
    process.exit(0);
  } catch (error) {
    spinner.fail(colors.red("更新失败"));
    console.log("");
    console.log(colors.dim("  你可以手动运行以下命令更新:"));
    console.log(colors.yellow("  # 如果之前安装过旧版本，先卸载:"));
    console.log(colors.cyan("  npm uninstall -g git-workflow"));
    console.log("");
    console.log(colors.yellow("  # 然后安装新版本:"));
    console.log(colors.cyan(`  npm install -g ${packageName}`));
    console.log("");
  }
}

/**
 * 读取缓存
 */
function readCache(): UpdateCache | null {
  try {
    const cacheFile = join(homedir(), CACHE_FILE);

    if (!existsSync(cacheFile)) {
      return null;
    }

    const content = readFileSync(cacheFile, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * 写入缓存
 */
function writeCache(cache: UpdateCache): void {
  try {
    const cacheFile = join(homedir(), CACHE_FILE);

    writeFileSync(cacheFile, JSON.stringify(cache), "utf-8");
  } catch {
    // 静默失败
  }
}
