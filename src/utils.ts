import { execSync, spawn, type ExecSyncOptions } from "child_process";
import type { Ora } from "ora";

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
 * @returns Promise<boolean> 成功返回 true，失败返回 false
 */
export function execAsync(command: string, spinner?: Ora): Promise<boolean> {
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(" ");

    const process = spawn(cmd, args, {
      stdio: spinner ? "pipe" : "inherit",
    });

    process.on("close", (code) => {
      resolve(code === 0);
    });

    process.on("error", () => {
      resolve(false);
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
  const success = await execAsync(command, spinner);

  if (success) {
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
  }

  return success;
}
