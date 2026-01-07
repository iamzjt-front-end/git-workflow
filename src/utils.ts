import { execSync, type ExecSyncOptions } from "child_process";

export interface Colors {
  red: (s: string) => string;
  green: (s: string) => string;
  yellow: (s: string) => string;
  dim: (s: string) => string;
}

export const colors: Colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
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
