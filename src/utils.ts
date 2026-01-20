import { execSync, spawn, type ExecSyncOptions } from "child_process";
import type { Ora } from "ora";

/**
 * 全局 debug 模式标志
 */
let debugMode = false;

/**
 * 设置 debug 模式（由主入口调用）
 */
export function setDebugMode(enabled: boolean): void {
  debugMode = enabled;
}

/**
 * 获取当前 debug 模式状态
 */
export function isDebugMode(): boolean {
  return debugMode;
}

export interface Colors {
  red: (s: string) => string;
  green: (s: string) => string;
  yellow: (s: string) => string;
  blue: (s: string) => string;
  cyan: (s: string) => string;
  dim: (s: string) => string;
  bold: (s: string) => string;
  purple: (s: string) => string;
  orange: (s: string) => string;
  lightPurple: (s: string) => string;
  white: (s: string) => string;
  brightYellow: (s: string) => string;
  reset: string;
}

export const colors: Colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  purple: (s) => `\x1b[35m${s}\x1b[0m`,
  orange: (s) => `\x1b[38;5;208m${s}\x1b[0m`,
  lightPurple: (s) => `\x1b[38;5;141m${s}\x1b[0m`,
  white: (s) => `\x1b[37m${s}\x1b[0m`,
  brightYellow: (s) => `\x1b[93m${s}\x1b[0m`, // 亮黄色
  reset: "\x1b[0m",
};

export const TODAY: string = new Date()
  .toISOString()
  .slice(0, 10)
  .replace(/-/g, "");

type KeysHelpTip = [string, string][];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const theme: any = {
  helpMode: "always",
  style: {
    keysHelpTip: (keys: KeysHelpTip): string => {
      const tips = keys.map(([key, label]) => `${key} ${label}`).join(" • ");
      return `\x1b[2m${tips} • Ctrl+C quit\x1b[0m`;
    },
  },
};

export function exec(cmd: string, silent: boolean = false): string {
  try {
    const options: ExecSyncOptions = {
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    };
    return execSync(cmd, options) as string;
  } catch (e) {
    if (silent) return "";
    throw e;
  }
}

export function execOutput(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

export function checkGitRepo(): void {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "pipe" });
  } catch {
    console.log(colors.red("错误: 当前目录不是 git 仓库"));
    process.exit(1);
  }
}

export function getMainBranch(): string {
  const branches = execOutput("git branch -r")
    .split("\n")
    .map((b) => b.trim());
  if (branches.includes("origin/main")) {
    return "origin/main";
  }
  if (branches.includes("origin/master")) {
    return "origin/master";
  }
  return "origin/main";
}

export type BranchType = "feature" | "hotfix";

export function divider(): void {
  console.log(colors.dim("─".repeat(40)));
}

/**
 * 使用 spawn 异步执行命令，避免阻塞 spinner
 * @param command 命令字符串
 * @param spinner 可选的 ora spinner 实例
 * @returns Promise<{success: boolean, error?: string}> 返回执行结果和错误信息
 */
export function execAsync(
  command: string,
  spinner?: Ora,
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    // Debug 模式：显示执行的命令
    if (debugMode) {
      console.log(colors.dim(`\n[DEBUG] 执行命令: ${colors.cyan(command)}`));
    }

    // 使用 shell 模式执行命令，这样可以正确处理引号
    const process = spawn(command, {
      stdio: spinner ? "pipe" : "inherit",
      shell: true,
    });

    let errorOutput = "";
    let stdoutOutput = "";

    // 捕获标准输出（debug 模式）
    if (debugMode && process.stdout) {
      process.stdout.on("data", (data) => {
        stdoutOutput += data.toString();
      });
    }

    // 捕获错误输出
    if (process.stderr) {
      process.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });
    }

    process.on("close", (code) => {
      // Debug 模式：显示退出码和输出
      if (debugMode) {
        console.log(colors.dim(`[DEBUG] 退出码: ${code}`));
        if (stdoutOutput) {
          console.log(colors.dim(`[DEBUG] 标准输出:\n${stdoutOutput}`));
        }
        if (errorOutput) {
          console.log(colors.dim(`[DEBUG] 错误输出:\n${errorOutput}`));
        }
      }

      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: errorOutput.trim() });
      }
    });

    process.on("error", (err) => {
      // Debug 模式：显示进程错误
      if (debugMode) {
        console.log(colors.dim(`[DEBUG] 进程错误: ${err.message}`));
        console.log(colors.dim(`[DEBUG] 错误堆栈:\n${err.stack}`));
      }

      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * 执行命令并在 spinner 中显示进度
 * @param command 命令字符串
 * @param spinner ora spinner 实例
 * @param successMessage 成功消息
 * @param errorMessage 错误消息
 * @returns Promise<boolean> 成功返回 true，失败返回 false
 */
export async function execWithSpinner(
  command: string,
  spinner: Ora,
  successMessage?: string,
  errorMessage?: string,
): Promise<boolean> {
  const result = await execAsync(command, spinner);

  if (result.success) {
    if (successMessage) {
      spinner.succeed(successMessage);
    } else {
      spinner.succeed();
    }
  } else {
    if (errorMessage) {
      spinner.fail(errorMessage);
    } else {
      spinner.fail();
    }

    // 显示具体的错误信息
    if (result.error) {
      console.log(colors.dim(`  ${result.error}`));
    }

    // Debug 模式：显示完整的命令和建议
    if (debugMode) {
      console.log(colors.yellow("\n[DEBUG] 故障排查信息:"));
      console.log(colors.dim(`  命令: ${command}`));
      console.log(colors.dim(`  工作目录: ${process.cwd()}`));
      console.log(colors.dim(`  Shell: ${process.env.SHELL || "unknown"}`));
      console.log(
        colors.dim(`  建议: 尝试在终端中直接运行上述命令以获取更多信息\n`),
      );
    }
  }

  return result.success;
}
