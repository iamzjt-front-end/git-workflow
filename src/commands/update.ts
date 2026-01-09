import { execSync } from "child_process";
import ora from "ora";
import boxen from "boxen";
import semver from "semver";
import { existsSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { colors } from "../utils.js";

const CACHE_FILE = ".gw-update-check";

/**
 * 清理更新缓存文件
 */
function clearUpdateCache(): void {
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
 * 获取 npm 上的最新版本
 */
async function getLatestVersion(packageName: string): Promise<string | null> {
  try {
    const result = execSync(`npm view ${packageName} version`, {
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["pipe", "pipe", "ignore"],
    });
    return result.trim();
  } catch {
    return null;
  }
}

/**
 * 手动更新命令
 */
export async function update(currentVersion: string): Promise<void> {
  const packageName = "@zjex/git-workflow";

  console.log("");
  console.log(colors.bold("🔍 检查更新..."));
  console.log("");

  const spinner = ora("正在获取最新版本信息...").start();

  try {
    const latestVersion = await getLatestVersion(packageName);

    if (!latestVersion) {
      spinner.fail("无法获取最新版本信息");
      console.log(colors.dim("  请检查网络连接后重试"));
      return;
    }

    spinner.stop();

    // 使用 semver 比较版本
    if (semver.gte(currentVersion, latestVersion)) {
      console.log(
        boxen(
          [
            colors.green(colors.bold("✅ 已是最新版本")),
            "",
            `当前版本: ${colors.green(currentVersion)}`,
          ].join("\n"),
          {
            padding: 1,
            margin: { top: 0, bottom: 1, left: 2, right: 2 },
            borderStyle: "round",
            borderColor: "green",
            align: "left",
          }
        )
      );
      return;
    }

    // 有新版本
    const versionText = `${currentVersion}  →  ${latestVersion}`;
    const maxWidth = Math.max(
      "🎉 发现新版本！".length,
      versionText.length,
      "✨ 更新完成！".length,
      "请重新打开终端使用新版本".length
    );

    console.log(
      boxen(
        [
          colors.yellow(colors.bold("🎉 发现新版本！")),
          "",
          `${colors.dim(currentVersion)}  →  ${colors.green(
            colors.bold(latestVersion)
          )}`,
        ].join("\n"),
        {
          padding: { top: 1, bottom: 1, left: 3, right: 3 },
          margin: { top: 0, bottom: 1, left: 2, right: 2 },
          borderStyle: "round",
          borderColor: "yellow",
          align: "center",
          width: 40,
        }
      )
    );

    // 开始更新
    const updateSpinner = ora("正在更新...").start();

    execSync(`npm install -g ${packageName}@latest`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    updateSpinner.succeed(colors.green("更新成功！"));

    // 清理缓存文件
    clearUpdateCache();

    console.log("");
    console.log(
      boxen(
        [
          colors.green(colors.bold("✨ 更新完成！")),
          "",
          colors.dim("请重新打开终端使用新版本"),
        ].join("\n"),
        {
          padding: { top: 1, bottom: 1, left: 3, right: 3 },
          margin: { top: 0, bottom: 1, left: 2, right: 2 },
          borderStyle: "round",
          borderColor: "green",
          align: "center",
          width: 40,
        }
      )
    );

    // 更新成功后退出
    process.exit(0);
  } catch (error) {
    spinner.fail(colors.red("更新失败"));
    console.log("");
    console.log(colors.dim("  你可以手动运行以下命令更新:"));
    console.log(colors.cyan(`  npm install -g ${packageName}@latest`));
    console.log("");
    process.exit(1);
  }
}
