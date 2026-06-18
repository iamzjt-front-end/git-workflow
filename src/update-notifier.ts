import { execSync, spawn } from "child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import boxen from "boxen";
import { select } from "@inquirer/prompts";
import semver from "semver";
import { colors } from "./utils.js";

const DISMISS_INTERVAL = 1000 * 60 * 60 * 24; // 24 小时后再次提示
const CACHE_FILE = ".gw-update-check";

interface UpdateCache {
  lastCheck?: number; // 上次检查更新的时间
  lastDismiss?: number; // 用户上次关闭提示的时间
  latestVersion?: string; // 最新版本号
  checkedVersion?: string; // 检查时的当前版本
}

/**
 * 检查是否有新版本
 * 策略：后台异步检查，下次运行时提示
 * @param currentVersion 当前版本
 * @param packageName 包名
 * @param interactive 是否交互式（true: 显示完整提示并可选择更新，false: 只显示简单提示）
 */
export async function checkForUpdates(
  currentVersion: string,
  packageName: string = "@zjex/git-workflow",
  interactive: boolean = false
): Promise<void> {
  try {
    const cache = readCache();
    const now = Date.now();

    // 1. 先用缓存的结果提示用户（如果有更新版本）
    if (
      cache?.latestVersion &&
      semver.gt(cache.latestVersion, currentVersion)
    ) {
      // 检查用户是否在 24 小时内关闭过提示
      const isDismissed =
        cache.lastDismiss && now - cache.lastDismiss < DISMISS_INTERVAL;

      if (!isDismissed) {
        if (interactive) {
          const action = await showUpdateMessage(
            currentVersion,
            cache.latestVersion,
            packageName
          );

          if (action === "update") {
            showUpdateCommand(packageName);
          } else if (action === "dismiss") {
            writeCache({ ...cache, lastDismiss: now });
          }
        } else {
          showSimpleNotification(currentVersion, cache.latestVersion, packageName);
        }
      }
    }

    // 2. 后台子进程检查更新（每次都检查，不阻塞）
    spawnBackgroundCheck(packageName);
  } catch (error) {
    // 如果是用户按 Ctrl+C，重新抛出让全局处理
    if (error?.constructor?.name === "ExitPromptError") {
      throw error;
    }
    // 其他错误静默失败，不影响主程序
  }
}

/**
 * 在子进程中检查更新（不阻塞主进程）
 * 使用 unref() 确保主进程退出后子进程仍能完成
 */
function spawnBackgroundCheck(packageName: string): void {
  try {
    const cacheFile = join(homedir(), CACHE_FILE);
    
    // 使用 node -e 执行检查脚本
    const script = `
      const { execSync } = require('child_process');
      const { writeFileSync, readFileSync, existsSync } = require('fs');
      try {
        const version = execSync('npm view ${packageName} version', {
          encoding: 'utf-8',
          timeout: 10000,
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        if (version) {
          let cache = {};
          try {
            if (existsSync('${cacheFile}')) {
              cache = JSON.parse(readFileSync('${cacheFile}', 'utf-8'));
            }
          } catch {}
          cache.lastCheck = Date.now();
          cache.latestVersion = version;
          writeFileSync('${cacheFile}', JSON.stringify(cache), 'utf-8');
        }
      } catch {}
    `;

    const child = spawn("node", ["-e", script], {
      detached: true,
      stdio: "ignore",
    });

    // unref 让主进程可以独立退出
    child.unref();
  } catch {
    // 静默失败
  }
}

/**
 * 检测是否使用 Volta
 */
function isUsingVolta(): boolean {
  try {
    const whichGw = execSync("which gw", { encoding: "utf-8" }).trim();
    return whichGw.includes(".volta");
  } catch {
    return false;
  }
}

/**
 * 获取推荐更新命令
 */
function getUpdateCommand(packageName: string): string {
  return isUsingVolta()
    ? `volta install ${packageName}@latest`
    : `npm install -g ${packageName}@latest`;
}

/**
 * 显示简单的更新通知（非交互式，不阻塞）
 */
function showSimpleNotification(
  current: string,
  latest: string,
  packageName: string
): void {
  const updateCommand = getUpdateCommand(packageName);
  const message = `${colors.yellow("🎉 发现新版本")} ${colors.dim(
    current
  )} → ${colors.green(latest)}    ${colors.dim("运行")} ${colors.cyan(updateCommand)}`;

  console.log(
    boxen(message, {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      borderStyle: "round",
      borderColor: "yellow",
      align: "center",
    })
  );
}

/**
 * 显示更新提示消息并让用户选择（交互式）
 * @returns "update" | "continue" | "dismiss"
 */
async function showUpdateMessage(
  current: string,
  latest: string,
  packageName: string
): Promise<"update" | "continue" | "dismiss"> {
  const message = [
    colors.yellow(colors.bold("🎉 发现新版本！")),
    "",
    `${colors.dim(current)}  →  ${colors.green(colors.bold(latest))}`,
  ].join("\n");

  console.log("");
  console.log(
    boxen(message, {
      padding: { top: 1, bottom: 1, left: 3, right: 3 },
      margin: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: "round",
      borderColor: "yellow",
      align: "center",
      width: 40,
    })
  );

  const updateCommand = getUpdateCommand(packageName);

  try {
    const action = await select({
      message: "你想做什么？",
      choices: [
        {
          name: "📦 显示更新命令",
          value: "update",
          description: updateCommand,
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
    // 用户按了 Ctrl+C，重新抛出错误让全局处理
    console.log("");
    throw error;
  }
}

/**
 * 显示手动更新命令
 */
function showUpdateCommand(packageName: string): void {
  console.log("");

  const updateCommand = getUpdateCommand(packageName);

  console.log(
    boxen(
      [
        colors.cyan(colors.bold("📦 手动更新命令")),
        "",
        colors.cyan(`  ${updateCommand}`),
        "",
        colors.dim("更新后可执行以下命令验证:"),
        colors.cyan("  hash -r && gw --version"),
      ].join("\n"),
      {
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        margin: { top: 0, bottom: 1, left: 2, right: 2 },
        borderStyle: "round",
        borderColor: "cyan",
        align: "left",
        width: 48,
      },
    ),
  );
}

/**
 * 清理更新缓存文件
 */
export function clearUpdateCache(): void {
  try {
    const cacheFile = join(homedir(), CACHE_FILE);
    if (existsSync(cacheFile)) {
      unlinkSync(cacheFile);
    }
  } catch {
    // 静默失败
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
