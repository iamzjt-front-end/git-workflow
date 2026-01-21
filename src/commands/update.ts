import { execSync, spawn } from "child_process";
import ora, { Ora } from "ora";
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
  return new Promise((resolve) => {
    const npmView = spawn("npm", ["view", packageName, "version"], {
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    });

    let output = "";

    if (npmView.stdout) {
      npmView.stdout.on("data", (data) => {
        output += data.toString();
      });
    }

    npmView.on("close", (code) => {
      if (code === 0 && output.trim()) {
        resolve(output.trim());
      } else {
        resolve(null);
      }
    });

    npmView.on("error", () => {
      resolve(null);
    });
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
 * 手动更新命令
 */
export async function update(currentVersion: string): Promise<void> {
  const packageName = "@zjex/git-workflow";
  const usingVolta = isUsingVolta();

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
          },
        ),
      );
      return;
    }

    // 有新版本
    const versionText = `${currentVersion}  →  ${latestVersion}`;

    console.log(
      boxen(
        [
          colors.yellow(colors.bold("🎉 发现新版本！")),
          "",
          `${colors.dim(currentVersion)}  →  ${colors.green(
            colors.bold(latestVersion),
          )}`,
        ].join("\n"),
        {
          padding: { top: 1, bottom: 1, left: 3, right: 3 },
          margin: { top: 0, bottom: 1, left: 2, right: 2 },
          borderStyle: "round",
          borderColor: "yellow",
          align: "center",
          width: 40,
        },
      ),
    );

    // 开始更新
    console.log("");
    console.log(colors.cyan("📦 开始安装新版本..."));
    console.log("");

    // 根据包管理器选择更新命令
    const updateCommand = usingVolta
      ? `volta install ${packageName}@latest`
      : `npm install -g ${packageName}@latest`;

    // 使用 spawn 异步执行，这样可以显示实时输出
    const [command, ...args] = updateCommand.split(" ");

    const updateProcess = spawn(command, args, {
      stdio: "inherit", // 继承父进程的 stdio，显示实时输出
    });

    updateProcess.on("close", (code) => {
      console.log("");

      if (code === 0) {
        console.log(colors.green("✔ 更新成功！"));

        // 清理缓存文件
        clearUpdateCache();

        console.log("");
        console.log(
          boxen(
            [
              colors.green(colors.bold("✨ 更新完成！")),
              "",
              `新版本: ${colors.green(colors.bold(latestVersion))}`,
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
            },
          ),
        );

        // 更新成功后退出
        process.exit(0);
      } else {
        console.log(colors.red("✖ 更新失败"));
        console.log("");
        console.log(colors.dim("  你可以手动运行以下命令更新:"));
        console.log(colors.cyan(`  ${updateCommand}`));
        console.log("");
        process.exit(1);
      }
    });

    updateProcess.on("error", (error) => {
      console.log("");
      console.log(colors.red("✖ 更新失败"));
      console.log("");
      console.log(colors.dim("  你可以手动运行以下命令更新:"));
      console.log(colors.cyan(`  ${updateCommand}`));
      console.log("");
      console.log(colors.dim(`  错误信息: ${error.message}`));
      console.log("");
      process.exit(1);
    });

    // 更新成功后退出
    process.exit(0);
  } catch (error) {
    spinner.fail(colors.red("获取版本信息失败"));
    console.log("");
    console.log(colors.dim("  请检查网络连接后重试"));
    console.log("");

    if (error instanceof Error) {
      console.log(colors.dim(`  错误信息: ${error.message}`));
    }
    console.log("");
    process.exit(1);
  }
}
