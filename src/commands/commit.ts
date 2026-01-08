import { execSync } from "child_process";
import { select, input, confirm, checkbox } from "@inquirer/prompts";
import ora from "ora";
import { colors, theme, execOutput, divider } from "../utils.js";
import { getConfig } from "../config.js";

// Conventional Commits 类型 + Gitmoji
const COMMIT_TYPES = [
  { type: "feat", emoji: "✨", description: "新功能" },
  { type: "fix", emoji: "🐛", description: "修复 Bug" },
  { type: "docs", emoji: "📝", description: "文档更新" },
  { type: "style", emoji: "💄", description: "代码格式 (不影响功能)" },
  { type: "refactor", emoji: "♻️", description: "重构 (非新功能/修复)" },
  { type: "perf", emoji: "⚡️", description: "性能优化" },
  { type: "test", emoji: "✅", description: "测试相关" },
  { type: "build", emoji: "📦", description: "构建/依赖相关" },
  { type: "ci", emoji: "👷", description: "CI/CD 相关" },
  { type: "chore", emoji: "🔧", description: "其他杂项" },
  { type: "revert", emoji: "⏪", description: "回退提交" },
] as const;

interface FileStatus {
  status: string;
  file: string;
}

function parseGitStatus(): { staged: FileStatus[]; unstaged: FileStatus[] } {
  const output = execOutput("git status --porcelain");
  if (!output) return { staged: [], unstaged: [] };

  const staged: FileStatus[] = [];
  const unstaged: FileStatus[] = [];

  for (const line of output.split("\n")) {
    if (!line) continue;
    const indexStatus = line[0];
    const workTreeStatus = line[1];
    const file = line.slice(3);

    // 已暂存的更改 (index 有状态)
    if (indexStatus !== " " && indexStatus !== "?") {
      staged.push({ status: indexStatus, file });
    }

    // 未暂存的更改 (work tree 有状态，或者是未跟踪文件)
    if (workTreeStatus !== " " || indexStatus === "?") {
      const status = indexStatus === "?" ? "?" : workTreeStatus;
      unstaged.push({ status, file });
    }
  }

  return { staged, unstaged };
}

function formatFileStatus(status: string): string {
  const statusMap: Record<string, string> = {
    M: colors.yellow("M"),
    A: colors.green("A"),
    D: colors.red("D"),
    R: colors.yellow("R"),
    C: colors.yellow("C"),
    "?": colors.green("?"),
  };
  return statusMap[status] || status;
}

export async function commit(): Promise<void> {
  const config = getConfig();
  let { staged, unstaged } = parseGitStatus();

  // 没有暂存的更改
  if (staged.length === 0) {
    if (unstaged.length === 0) {
      console.log(colors.yellow("工作区干净，没有需要提交的更改"));
      return;
    }

    console.log(colors.yellow("没有暂存的更改"));
    divider();
    console.log("未暂存的文件:");
    for (const { status, file } of unstaged) {
      console.log(`  ${formatFileStatus(status)} ${file}`);
    }
    divider();

    // 根据配置决定是否自动暂存
    const autoStage = config.autoStage ?? true;

    if (autoStage) {
      // 自动暂存所有文件
      execSync("git add -A", { stdio: "pipe" });
      console.log(colors.green("✔ 已自动暂存所有更改"));
      divider();
      // 重新获取状态
      const newStatus = parseGitStatus();
      staged = newStatus.staged;
    } else {
      // 让用户选择要暂存的文件
      const filesToStage = await checkbox({
        message: "选择要暂存的文件:",
        choices: unstaged.map(({ status, file }) => ({
          name: `${formatFileStatus(status)} ${file}`,
          value: file,
          checked: true,
        })),
        theme,
      });

      if (filesToStage.length === 0) {
        console.log(colors.yellow("没有选择任何文件，已取消"));
        return;
      }

      // 暂存选中的文件
      for (const file of filesToStage) {
        execSync(`git add "${file}"`, { stdio: "pipe" });
      }
      console.log(colors.green(`✔ 已暂存 ${filesToStage.length} 个文件`));
      divider();

      // 重新获取状态
      const newStatus = parseGitStatus();
      staged = newStatus.staged;
    }
  } else {
    console.log("已暂存的文件:");
    for (const { status, file } of staged) {
      console.log(`  ${formatFileStatus(status)} ${file}`);
    }
    divider();
  }

  // 选择提交类型
  const typeChoice = await select({
    message: "选择提交类型:",
    choices: COMMIT_TYPES.map((t) => ({
      name: `${t.emoji}  ${t.type.padEnd(10)} ${colors.dim(t.description)}`,
      value: t,
    })),
    theme,
  });

  // 输入 scope (可选)
  const scope = await input({
    message: "输入影响范围 scope (可跳过):",
    theme,
  });

  // 输入简短描述
  const subject = await input({
    message: "输入简短描述:",
    validate: (value) => {
      if (!value.trim()) return "描述不能为空";
      if (value.length > 72) return "描述不能超过 72 个字符";
      return true;
    },
    theme,
  });

  // 输入详细描述 (可选)
  const body = await input({
    message: "输入详细描述 (可跳过):",
    theme,
  });

  // 是否有破坏性变更
  const hasBreaking = await confirm({
    message: "是否包含破坏性变更 (BREAKING CHANGE)?",
    default: false,
    theme,
  });

  let breakingDesc = "";
  if (hasBreaking) {
    breakingDesc = await input({
      message: "描述破坏性变更:",
      validate: (value) => (value.trim() ? true : "请描述破坏性变更"),
      theme,
    });
  }

  // 关联 Issue (可选)
  const issues = await input({
    message: "关联 Issue (如 #123, 可跳过):",
    theme,
  });

  // 构建 commit message
  const { type, emoji } = typeChoice;
  const scopePart = scope ? `(${scope})` : "";
  const breakingMark = hasBreaking ? "!" : "";

  // Header: emoji type(scope)!: subject
  let message = `${emoji} ${type}${scopePart}${breakingMark}: ${subject}`;

  // Body
  if (body || hasBreaking || issues) {
    message += "\n";

    if (body) {
      message += `\n${body}`;
    }

    if (hasBreaking) {
      message += `\n\nBREAKING CHANGE: ${breakingDesc}`;
    }

    if (issues) {
      message += `\n\n${issues}`;
    }
  }

  divider();
  console.log("提交信息预览:");
  console.log(colors.green(message));
  divider();

  const shouldCommit = await confirm({
    message: "确认提交?",
    default: true,
    theme,
  });

  if (!shouldCommit) {
    console.log(colors.yellow("已取消"));
    return;
  }

  const spinner = ora("正在提交...").start();

  try {
    // 使用 -m 参数，需要转义引号
    const escapedMessage = message.replace(/"/g, '\\"');
    execSync(`git commit -m "${escapedMessage}"`, { stdio: "pipe" });
    spinner.succeed("提交成功");

    // 显示提交信息
    const commitHash = execOutput("git rev-parse --short HEAD");
    console.log(colors.dim(`commit: ${commitHash}`));
  } catch (error) {
    spinner.fail("提交失败");
    if (error instanceof Error) {
      console.log(colors.red(error.message));
    }
  }
}
