import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import boxen from "boxen";
import { select } from "@inquirer/prompts";
import ora from "ora";
import semver from "semver";
import { colors } from "./utils.js";

const DISMISS_INTERVAL = 1000 * 60 * 60 * 24; // 24 小时后再次提示
const CHECK_INTERVAL = 1000 * 60 * 60 * 1; // 已是最新版本时，1 小时检查一次
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

    // 1. 先用缓存的结果提示用户（如果有新版本）
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
            await performUpdate(packageName);
          } else if (action === "dismiss") {
            writeCache({ ...cache, lastDismiss: now });
          }
        } else {
          showSimpleNotification(currentVersion, cache.latestVersion);
        }
      }
    }

    // 2. 后台异步检查更新（每次都检查，不阻塞）
    backgroundCheck(currentVersion, packageName);
  } catch (error) {
    // 如果是用户按 Ctrl+C，重新抛出让全局处理
    if (error?.constructor?.name === "ExitPromptError") {
      throw error;
    }
    // 其他错误静默失败，不影响主程序
  }
}

/**
 * 后台异步检查更新（不阻塞）
 * - 有新版本时：每次都检查
 * - 已是最新版本时：1 小时检查一次
 */
function backgroundCheck(currentVersion: string, packageName: string): void {
  const cache = readCache();
  const now = Date.now();

  // 如果已是最新版本，且距离上次检查不到 1 小时，跳过
  const isUpToDate =
    cache?.latestVersion && !semver.gt(cache.latestVersion, currentVersion);
  const recentlyChecked =
    cache?.lastCheck && now - cache.lastCheck < CHECK_INTERVAL;

  if (isUpToDate && recentlyChecked) {
    return;
  }

  // 使用 setImmediate 确保不阻塞主流程
  setImmediate(async () => {
    try {
      const latestVersion = await getLatestVersion(packageName);

      if (latestVersion) {
        const cache = readCache() || {};
        writeCache({
          ...cache,
          lastCheck: Date.now(),
          latestVersion,
          checkedVersion: currentVersion,
        });
      }
    } catch {
      // 静默失败
    }
  });
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
 * 显示简单的更新通知（非交互式，不阻塞）
 */
function showSimpleNotification(current: string, latest: string): void {
  const message = `${colors.yellow("🎉 发现新版本")} ${colors.dim(
    current
  )} → ${colors.green(latest)}    ${colors.dim("运行")} ${colors.cyan(
    "gw update"
  )} ${colors.dim("更新")}`;

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

  const usingVolta = isUsingVolta();
  const updateCommand = usingVolta
    ? `volta install ${packageName}@latest`
    : `npm install -g ${packageName}@latest`;

  try {
    const action = await select({
      message: "你想做什么？",
      choices: [
        {
          name: "🚀 立即更新",
          value: "update",
          description: `运行 ${updateCommand}`,
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
 * 执行更新
 */
async function performUpdate(packageName: string): Promise<void> {
  console.log("");

  const usingVolta = isUsingVolta();
  const updateCommand = usingVolta
    ? `volta install ${packageName}@latest`
    : `npm install -g ${packageName}@latest`;

  const spinner = ora({
    text: "正在更新...",
    spinner: "dots",
  }).start();

  try {
    // 根据包管理器选择更新命令
    execSync(updateCommand, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    spinner.succeed(colors.green("更新成功！"));

    // 清理缓存文件
    clearUpdateCache();

    console.log("");
    console.log(
      boxen(
        [
          colors.green(colors.bold("✨ 更新完成！")),
          "",
          colors.dim("请执行以下命令验证:"),
          colors.cyan("  hash -r && gw --version"),
          "",
          colors.dim("或重新打开终端"),
        ].join("\n"),
        {
          padding: { top: 1, bottom: 1, left: 2, right: 2 },
          margin: { top: 0, bottom: 1, left: 2, right: 2 },
          borderStyle: "round",
          borderColor: "green",
          align: "left",
          width: 40,
        }
      )
    );

    // 更新成功后退出，让用户重新运行
    process.exit(0);
  } catch (error) {
    spinner.fail(colors.red("更新失败"));
    console.log("");
    console.log(colors.dim("  你可以手动运行以下命令更新:"));
    console.log(colors.cyan(`  ${updateCommand}`));
    console.log("");
  }
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
