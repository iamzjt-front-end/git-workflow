import { execSync } from "child_process";
import { select, input, checkbox } from "@inquirer/prompts";
import ora from "ora";
import { colors, theme, execOutput, divider } from "../utils.js";
import { getConfig } from "../config.js";
import { generateAICommitMessage, isAICommitAvailable } from "../ai-service.js";

/**
 * Conventional Commits 类型定义 + Gitmoji
 * 遵循 https://www.conventionalcommits.org/ 规范
 * 使用 https://gitmoji.dev/ emoji
 */
const DEFAULT_COMMIT_TYPES = [
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
] as const;

type CommitType = (typeof DEFAULT_COMMIT_TYPES)[number]["type"];

/**
 * 获取提交类型列表（支持自定义 emoji）
 * @param config 用户配置
 * @returns 提交类型列表
 */
function getCommitTypes(config: ReturnType<typeof getConfig>) {
  const customEmojis = config.commitEmojis || {};
  return DEFAULT_COMMIT_TYPES.map((item) => ({
    ...item,
    emoji: customEmojis[item.type as CommitType] || item.emoji,
  }));
}

/**
 * 文件状态接口
 */
interface FileStatus {
  status: string; // M=修改, A=新增, D=删除, ?=未跟踪
  file: string; // 文件路径
}

/**
 * 解析 git status 输出
 * @returns 已暂存和未暂存的文件列表
 */
function parseGitStatus(): { staged: FileStatus[]; unstaged: FileStatus[] } {
  const output = execOutput("git status --porcelain");
  if (!output) return { staged: [], unstaged: [] };

  const staged: FileStatus[] = [];
  const unstaged: FileStatus[] = [];

  for (const line of output.split("\n")) {
    if (!line) continue;
    const indexStatus = line[0]; // 暂存区状态
    const workTreeStatus = line[1]; // 工作区状态
    const file = line.slice(3); // 文件路径

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

/**
 * 格式化文件状态显示（带颜色）
 * @param status 文件状态
 * @returns 带颜色的状态字符串
 */
function formatFileStatus(status: string): string {
  const statusMap: Record<string, string> = {
    M: colors.yellow("M"), // 修改
    A: colors.green("A"), // 新增
    D: colors.red("D"), // 删除
    R: colors.yellow("R"), // 重命名
    C: colors.yellow("C"), // 复制
    "?": colors.green("?"), // 未跟踪
  };
  return statusMap[status] || status;
}

/**
 * 交互式提交命令
 * 支持 AI 自动生成和手动编写两种模式
 * 遵循 Conventional Commits 规范
 */
export async function commit(): Promise<void> {
  const config = getConfig();
  let { staged, unstaged } = parseGitStatus();

  // ========== 步骤 1: 处理未暂存的文件 ==========
  if (unstaged.length > 0) {
    const autoStage = config.autoStage ?? true;

    if (autoStage) {
      // 自动暂存所有文件
      execSync("git add -A", { stdio: "pipe" });
      console.log(colors.green("✔ 已自动暂存所有更改"));
      divider();
      // 重新获取状态
      const newStatus = parseGitStatus();
      staged = newStatus.staged;
      unstaged = newStatus.unstaged;
    } else if (staged.length === 0) {
      // 没有暂存的文件，且不自动暂存，让用户选择
      console.log(colors.yellow("没有暂存的更改"));
      divider();
      console.log("未暂存的文件:");
      for (const { status, file } of unstaged) {
        console.log(`  ${formatFileStatus(status)} ${file}`);
      }
      divider();

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
  }

  // ========== 步骤 2: 检查是否有文件可提交 ==========
  if (staged.length === 0) {
    console.log(colors.yellow("工作区干净，没有需要提交的更改"));
    return;
  }

  // 显示已暂存的文件
  console.log("已暂存的文件:");
  for (const { status, file } of staged) {
    console.log(`  ${formatFileStatus(status)} ${file}`);
  }
  divider();

  // ========== 步骤 3: 选择提交方式（AI 或手动）==========
  const aiAvailable = isAICommitAvailable(config);
  let commitMode: "ai" | "manual" = "manual";

  if (aiAvailable) {
    commitMode = await select({
      message: "选择 commit 方式:",
      choices: [
        {
          name: "🤖 AI 自动生成 commit message",
          value: "ai",
          description: "使用 AI 分析代码变更自动生成",
        },
        {
          name: "✍️  手动编写 commit message",
          value: "manual",
          description: "传统的交互式输入方式",
        },
      ],
      theme,
    });
  }

  // 初始化 commit message 变量
  let message: string = "";

  // ========== 步骤 4: 生成 commit message ==========
  // AI 生成模式
  if (commitMode === "ai") {
    const spinner = ora("AI 正在分析代码变更...").start();

    try {
      const aiMessage = await generateAICommitMessage(config);
      spinner.succeed("AI 生成完成");

      console.log("");
      console.log("AI 生成的 commit message:");
      console.log(colors.green(aiMessage));
      divider();

      const useAI = await select({
        message: "使用这个 commit message?",
        choices: [
          { name: "✅ 使用", value: true },
          { name: "❌ 不使用，切换到手动模式", value: false },
        ],
        theme,
      });

      if (useAI) {
        message = aiMessage;
      } else {
        spinner.info("切换到手动模式");
        commitMode = "manual";
      }
    } catch (error) {
      spinner.fail("AI 生成失败");
      console.log(
        colors.red(error instanceof Error ? error.message : String(error))
      );
      console.log(colors.yellow("\n切换到手动模式..."));
      divider();
      commitMode = "manual";
    }
  }

  // 手动输入模式
  if (commitMode === "manual") {
    message = await buildManualCommitMessage(config);
  }

  // ========== 步骤 5: 预览并确认提交 ==========
  divider();
  console.log("提交信息预览:");
  console.log(colors.green(message));
  divider();

  const shouldCommit = await select({
    message: "确认提交?",
    choices: [
      { name: "✅ 确认提交", value: true },
      { name: "❌ 取消", value: false },
    ],
    theme,
  });

  if (!shouldCommit) {
    console.log(colors.yellow("已取消"));
    return;
  }

  // ========== 步骤 6: 执行提交 ==========
  const spinner = ora("正在提交...").start();

  try {
    // 提交前再次检查是否有暂存的文件
    const finalStatus = parseGitStatus();
    if (finalStatus.staged.length === 0) {
      spinner.fail("没有暂存的文件可以提交");
      console.log("");
      console.log(colors.yellow("请先暂存文件:"));
      console.log(colors.cyan("  git add <file>"));
      console.log(colors.dim("  或"));
      console.log(colors.cyan("  git add -A"));
      console.log("");
      return;
    }

    // 处理多行消息：使用 git commit -F - 通过 stdin 传递
    // 这样可以正确处理包含换行符的 commit message
    execSync(`git commit -F -`, {
      input: message,
    });
    spinner.succeed("提交成功");

    // 显示提交信息
    const commitHash = execOutput("git rev-parse --short HEAD");
    console.log(colors.dim(`commit: ${commitHash}`));
    console.log("");
  } catch (error) {
    spinner.fail("提交失败");
    console.log("");

    // 显示详细错误信息
    if (error instanceof Error) {
      console.log(colors.red("错误信息:"));
      console.log(colors.dim(`  ${error.message}`));
    }

    console.log("");
    console.log(colors.yellow("你可以手动执行以下命令:"));
    console.log(colors.cyan(`  git commit -m "${message}"`));
    console.log("");

    // 重新抛出错误，让调用者知道提交失败了
    throw error;
  }
}

/**
 * 手动构建 commit message
 * 通过交互式问答收集信息，构建符合 Conventional Commits 规范的提交信息
 * @param config 用户配置
 * @returns 完整的 commit message
 */
async function buildManualCommitMessage(
  config: ReturnType<typeof getConfig>
): Promise<string> {
  // 获取提交类型（支持自定义 emoji）
  const commitTypes = getCommitTypes(config);

  // ========== 1. 选择提交类型 ==========
  const typeChoice = await select({
    message: "选择提交类型:",
    choices: commitTypes.map((t) => {
      // 使用固定宽度格式化，不依赖 emoji 宽度
      const typeText = t.type.padEnd(10);
      // 针对 refactor 特殊处理，因为 ♻️ emoji 在不同终端宽度不一致
      const spacing = t.type === "refactor" ? "   " : "  ";
      return {
        name: `${t.emoji}${spacing}${typeText} ${colors.dim(t.description)}`,
        value: t,
      };
    }),
    pageSize: commitTypes.length, // 显示所有选项，不滚动
    theme,
  });

  // ========== 2. 输入 scope (可选) ==========
  const scope = await input({
    message: "输入影响范围 scope (可跳过):",
    theme,
  });

  // ========== 3. 输入简短描述 (必填) ==========
  const subject = await input({
    message: "输入简短描述:",
    validate: (value) => {
      if (!value.trim()) return "描述不能为空";
      if (value.length > 72) return "描述不能超过 72 个字符";
      return true;
    },
    theme,
  });

  // ========== 4. 输入详细描述 (可选) ==========
  const body = await input({
    message: "输入详细描述 (可跳过):",
    theme,
  });

  // ========== 5. 是否有破坏性变更 ==========
  const hasBreaking = await select({
    message: "是否包含破坏性变更 (BREAKING CHANGE)?",
    choices: [
      { name: "否", value: false },
      { name: "是", value: true },
    ],
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

  // ========== 6. 关联 Issue (可选) ==========
  const issues = await input({
    message: "关联 Issue (如 #123, 可跳过):",
    theme,
  });

  // ========== 7. 构建 commit message ==========
  const { type, emoji } = typeChoice;
  const scopePart = scope ? `(${scope})` : "";
  const breakingMark = hasBreaking ? "!" : "";

  // 根据配置决定是否使用 emoji
  const useEmoji = config.useEmoji ?? true;
  const emojiPrefix = useEmoji ? `${emoji} ` : "";

  // Header: [emoji] type(scope)!: subject
  let message = `${emojiPrefix}${type}${scopePart}${breakingMark}: ${subject}`;

  // Body (可选)
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

  return message;
}
