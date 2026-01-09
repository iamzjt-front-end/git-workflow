import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import boxen from "boxen";
import { select } from "@inquirer/prompts";
import ora from "ora";
import semver from "semver";
import { colors } from "./utils.js";

const CHECK_INTERVAL = 1000 * 60 * 60 * 4; // 4 小时检查一次
const DISMISS_INTERVAL = 1000 * 60 * 60 * 24; // 24 小时后再次提示
const CACHE_FILE = ".gw-update-check";

interface UpdateCache {
  lastCheck?: number; // 上次检查更新的时间
  lastDismiss?: number; // 用户上次关闭提示的时间
  latestVersion?: string; // 最新版本号
  checkedVersion?: string; // 检查时的当前版本
}

/**
 * 检查是否有新版本（异步静默检查）
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

    // 1. 先检查缓存中是否有新版本需要提示
    if (cache?.latestVersion && cache.checkedVersion === currentVersion) {
      // 如果用户在 24 小时内关闭过提示，跳过
      if (cache.lastDismiss && now - cache.lastDismiss < DISMISS_INTERVAL) {
        // 继续后台检查（不阻塞）
        backgroundCheck(currentVersion, packageName);
        return;
      }

      // 使用 semver 比较版本
      if (semver.gt(cache.latestVersion, currentVersion)) {
        if (interactive) {
          // 交互式模式：显示完整提示，可选择更新
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
          // 非交互式模式：只显示简单提示
          showSimpleNotification(currentVersion, cache.latestVersion);
        }
      }
    }

    // 2. 后台异步检查更新（不阻塞当前命令）
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
 */
function backgroundCheck(currentVersion: string, packageName: string): void {
  const cache = readCache();
  const now = Date.now();

  // 如果距离上次检查不到 4 小时，跳过
  if (cache?.lastCheck && now - cache.lastCheck < CHECK_INTERVAL) {
    return;
  }

  // 使用 Promise 异步执行，不阻塞当前命令
  Promise.resolve().then(async () => {
    try {
      const latestVersion = await getLatestVersion(packageName);

      if (latestVersion) {
        writeCache({
          ...cache,
          lastCheck: now,
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

  console.log("");
  console.log(
    boxen(message, {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
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
      margin: 1,
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
          width: 50,
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
