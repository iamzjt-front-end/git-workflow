/**
 * AI 代码审查命令
 *
 * 功能：
 * 1. 审查当前暂存的更改
 * 2. 审查指定的 commit(s)
 * 3. 交互式选择要审查的 commits
 * 4. 生成详细的 markdown 审查报告
 */

import { select, checkbox } from "@inquirer/prompts";
import ora from "ora";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { execOutput, colors, theme, divider } from "../utils.js";
import { loadConfig, type GwConfig } from "../config.js";

// ========== 类型定义 ==========

interface CommitInfo {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  date: string;
}

interface ReviewOptions {
  last?: number;
  output?: string;
  staged?: boolean;
}

interface DiffFile {
  oldPath: string;
  newPath: string;
  status: string; // A: added, M: modified, D: deleted, R: renamed
  diff: string;
}

// ========== AI Provider 配置 ==========

interface AIProvider {
  name: string;
  endpoint: string;
  defaultModel: string;
}

const AI_PROVIDERS: Record<string, AIProvider> = {
  github: {
    name: "GitHub Models",
    endpoint: "https://models.github.ai/inference/chat/completions",
    defaultModel: "gpt-4o",
  },
  openai: {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    defaultModel: "gpt-4o",
  },
  claude: {
    name: "Claude",
    endpoint: "https://api.anthropic.com/v1/messages",
    defaultModel: "claude-3-5-sonnet-20241022",
  },
  ollama: {
    name: "Ollama",
    endpoint: "http://localhost:11434/api/generate",
    defaultModel: "qwen2.5-coder:14b",
  },
};

// ========== 辅助函数 ==========

/**
 * 解析 git log 输出的 commit 信息
 */
function parseCommitLine(line: string): CommitInfo | null {
  const parts = line.split("|");
  if (parts.length < 5) return null;
  
  const [hash, shortHash, subject, author, date] = parts;
  return { hash, shortHash, subject, author, date };
}

/**
 * 获取最近的 commits 列表
 */
function getRecentCommits(limit: number = 20): CommitInfo[] {
  try {
    const output = execOutput(
      `git log -${limit} --pretty=format:"%H|%h|%s|%an|%ad" --date=short`
    );
    if (!output) return [];

    return output
      .split("\n")
      .filter(Boolean)
      .map((line) => parseCommitLine(line))
      .filter((c): c is CommitInfo => c !== null);
  } catch {
    return [];
  }
}

/**
 * 获取暂存区的 diff
 */
function getStagedDiff(): string {
  try {
    const diff = execOutput("git diff --cached");
    if (diff) return diff;
    // 如果没有暂存的更改，获取工作区更改
    return execOutput("git diff") || "";
  } catch {
    return "";
  }
}

/**
 * 获取指定 commit 的 diff
 */
function getCommitDiff(hash: string): string {
  try {
    return execOutput(`git show ${hash} --format="" --patch`) || "";
  } catch {
    return "";
  }
}

/**
 * 获取多个 commits 的合并 diff
 */
function getMultipleCommitsDiff(hashes: string[]): string {
  if (hashes.length === 0) return "";
  if (hashes.length === 1) return getCommitDiff(hashes[0]);

  // 获取范围 diff
  const oldest = hashes[hashes.length - 1];
  const newest = hashes[0];
  try {
    return execOutput(`git diff ${oldest}^..${newest}`) || "";
  } catch {
    // 如果失败，合并各个 commit 的 diff
    return hashes.map((h) => getCommitDiff(h)).join("\n\n");
  }
}

/**
 * 解析 diff 内容，提取文件信息
 */
function parseDiff(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  const fileDiffs = diff.split(/^diff --git /m).filter(Boolean);

  for (const fileDiff of fileDiffs) {
    const lines = fileDiff.split("\n");
    const headerMatch = lines[0]?.match(/a\/(.+) b\/(.+)/);
    if (!headerMatch) continue;

    const oldPath = headerMatch[1];
    const newPath = headerMatch[2];

    // 判断文件状态
    let status = "M";
    if (fileDiff.includes("new file mode")) status = "A";
    else if (fileDiff.includes("deleted file mode")) status = "D";
    else if (fileDiff.includes("rename from")) status = "R";

    files.push({
      oldPath,
      newPath,
      status,
      diff: "diff --git " + fileDiff,
    });
  }

  return files;
}

/**
 * 获取 diff 统计信息
 */
function getDiffStats(diff: string): { additions: number; deletions: number; files: number } {
  const lines = diff.split("\n");
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      additions++;
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      deletions++;
    }
  }

  const files = parseDiff(diff).length;
  return { additions, deletions, files };
}

// ========== 提示词构建 ==========

/**
 * 构建代码审查的系统提示词
 */
function buildSystemPrompt(language: string): string {
  const isZh = language === "zh-CN";

  if (isZh) {
    return `你是一个资深的代码审查专家，拥有丰富的软件开发经验。你的任务是审查 Git 提交中的代码变更，提供专业、有价值、有建设性的审查意见。

## 审查原则

1. **重点关注变更代码**：只审查 diff 中带 \`+\` 或 \`-\` 的代码行，这些是实际的变更内容
2. **提供具体建议**：不要泛泛而谈，要针对具体代码行给出改进建议
3. **区分问题严重程度**：使用 🔴 严重、🟡 警告、🔵 建议 三个级别
4. **代码示例**：在建议修改时，尽可能提供修改后的代码示例
5. **正面反馈**：对于写得好的代码，也要给予肯定

## 审查维度

1. **代码质量**：可读性、可维护性、代码风格
2. **潜在 Bug**：空指针、边界条件、异常处理
3. **安全问题**：SQL 注入、XSS、敏感信息泄露
4. **性能问题**：不必要的循环、内存泄漏、重复计算
5. **最佳实践**：设计模式、SOLID 原则、DRY 原则

## Diff 格式说明

- 以 \`+\` 开头的行是新增的代码
- 以 \`-\` 开头的行是删除的代码
- \`@@\` 行表示代码位置信息，格式为 \`@@ -旧文件起始行,行数 +新文件起始行,行数 @@\`
- 没有 \`+\` 或 \`-\` 前缀的行是上下文代码，用于帮助理解变更

## 输出格式

请使用 Markdown 格式输出审查报告，包含以下部分：

1. **概述**：简要总结本次变更的内容和整体评价
2. **问题列表**：按严重程度列出发现的问题
3. **改进建议**：提供具体的代码改进建议
4. **亮点**：指出代码中写得好的地方（如果有）

注意：
- 每个问题都要指明文件路径和行号
- 提供修改建议时要给出代码示例
- 如果代码没有明显问题，也要说明审查结论`;
  }

  return `You are a senior code review expert with extensive software development experience. Your task is to review code changes in Git commits and provide professional, valuable, and constructive review feedback.

## Review Principles

1. **Focus on Changed Code**: Only review lines with \`+\` or \`-\` prefixes in the diff - these are the actual changes
2. **Provide Specific Suggestions**: Don't be vague, give improvement suggestions for specific code lines
3. **Categorize Issue Severity**: Use 🔴 Critical, 🟡 Warning, 🔵 Suggestion levels
4. **Code Examples**: When suggesting changes, provide modified code examples whenever possible
5. **Positive Feedback**: Also acknowledge well-written code

## Review Dimensions

1. **Code Quality**: Readability, maintainability, code style
2. **Potential Bugs**: Null pointers, boundary conditions, exception handling
3. **Security Issues**: SQL injection, XSS, sensitive data exposure
4. **Performance Issues**: Unnecessary loops, memory leaks, redundant calculations
5. **Best Practices**: Design patterns, SOLID principles, DRY principle

## Diff Format Explanation

- Lines starting with \`+\` are added code
- Lines starting with \`-\` are deleted code
- \`@@\` lines indicate code location, format: \`@@ -old_start,count +new_start,count @@\`
- Lines without \`+\` or \`-\` prefix are context code to help understand changes

## Output Format

Please output the review report in Markdown format, including:

1. **Overview**: Brief summary of changes and overall assessment
2. **Issues**: List issues by severity
3. **Suggestions**: Provide specific code improvement suggestions
4. **Highlights**: Point out well-written code (if any)

Note:
- Each issue should specify file path and line number
- Provide code examples when suggesting modifications
- If no obvious issues, state the review conclusion`;
}

/**
 * 构建用户提示词（包含 diff 内容）
 */
function buildUserPrompt(
  diff: string,
  commits: CommitInfo[],
  language: string
): string {
  const isZh = language === "zh-CN";
  const stats = getDiffStats(diff);
  const files = parseDiff(diff);

  let prompt = "";

  // 添加变更概览
  if (isZh) {
    prompt += `## 变更概览\n\n`;
    prompt += `- 涉及文件: ${stats.files} 个\n`;
    prompt += `- 新增行数: +${stats.additions}\n`;
    prompt += `- 删除行数: -${stats.deletions}\n\n`;

    if (commits.length > 0) {
      prompt += `## 相关提交\n\n`;
      for (const commit of commits) {
        prompt += `- \`${commit.shortHash}\` ${commit.subject} (${commit.author}, ${commit.date})\n`;
      }
      prompt += `\n`;
    }

    prompt += `## 变更文件列表\n\n`;
    for (const file of files) {
      const statusIcon =
        file.status === "A" ? "🆕" : file.status === "D" ? "🗑️" : file.status === "R" ? "📝" : "✏️";
      prompt += `- ${statusIcon} \`${file.newPath}\`\n`;
    }
    prompt += `\n`;

    prompt += `## Diff 内容\n\n请仔细审查以下代码变更：\n\n`;
  } else {
    prompt += `## Change Overview\n\n`;
    prompt += `- Files changed: ${stats.files}\n`;
    prompt += `- Lines added: +${stats.additions}\n`;
    prompt += `- Lines deleted: -${stats.deletions}\n\n`;

    if (commits.length > 0) {
      prompt += `## Related Commits\n\n`;
      for (const commit of commits) {
        prompt += `- \`${commit.shortHash}\` ${commit.subject} (${commit.author}, ${commit.date})\n`;
      }
      prompt += `\n`;
    }

    prompt += `## Changed Files\n\n`;
    for (const file of files) {
      const statusIcon =
        file.status === "A" ? "🆕" : file.status === "D" ? "🗑️" : file.status === "R" ? "📝" : "✏️";
      prompt += `- ${statusIcon} \`${file.newPath}\`\n`;
    }
    prompt += `\n`;

    prompt += `## Diff Content\n\nPlease carefully review the following code changes:\n\n`;
  }

  // 添加 diff 内容，使用特定格式便于 AI 理解
  for (const file of files) {
    prompt += `### ${file.newPath}\n\n`;
    prompt += "```diff\n";
    prompt += file.diff;
    prompt += "\n```\n\n";
  }

  return prompt;
}

// ========== AI API 调用 ==========

/**
 * 调用 GitHub Models API
 */
async function callGitHubAPI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch(AI_PROVIDERS.github.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub Models API 错误: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

/**
 * 调用 OpenAI API
 */
async function callOpenAIAPI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch(AI_PROVIDERS.openai.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API 错误: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

/**
 * 调用 Claude API
 */
async function callClaudeAPI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string
): Promise<string> {
  const response = await fetch(AI_PROVIDERS.claude.endpoint, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 4000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API 错误: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text?.trim() || "";
}

/**
 * 调用 Ollama API
 */
async function callOllamaAPI(
  systemPrompt: string,
  userPrompt: string,
  model: string
): Promise<string> {
  try {
    const response = await fetch(AI_PROVIDERS.ollama.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
        options: {
          num_predict: 4000,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama 未运行或模型未安装`);
    }

    const data = await response.json();
    return data.response?.trim() || "";
  } catch (error) {
    throw new Error(
      `Ollama 连接失败。请确保：\n1. 已安装 Ollama (https://ollama.com)\n2. 运行 'ollama serve'\n3. 下载模型 'ollama pull ${model}'`
    );
  }
}

/**
 * 调用 AI 进行代码审查
 */
async function callAIReview(
  diff: string,
  commits: CommitInfo[],
  config: GwConfig
): Promise<string> {
  const aiConfig = config.aiCommit || {};
  const provider = aiConfig.provider || "github";
  const language = aiConfig.language || "zh-CN";
  const apiKey = aiConfig.apiKey || "";

  const providerInfo = AI_PROVIDERS[provider];
  if (!providerInfo) {
    throw new Error(`不支持的 AI 提供商: ${provider}`);
  }

  // Review 使用更强大的模型
  const model = aiConfig.model || providerInfo.defaultModel;

  if (provider !== "ollama" && !apiKey) {
    throw new Error(
      `${providerInfo.name} 需要 API key。请运行 'gw init' 配置，或在 .gwrc.json 中设置 aiCommit.apiKey`
    );
  }

  const systemPrompt = buildSystemPrompt(language);
  const userPrompt = buildUserPrompt(diff, commits, language);

  // 限制 diff 长度
  const maxLength = 30000;
  const truncatedUserPrompt =
    userPrompt.length > maxLength
      ? userPrompt.slice(0, maxLength) + "\n\n[... diff 内容过长，已截断 ...]"
      : userPrompt;

  switch (provider) {
    case "github":
      return callGitHubAPI(systemPrompt, truncatedUserPrompt, apiKey, model);
    case "openai":
      return callOpenAIAPI(systemPrompt, truncatedUserPrompt, apiKey, model);
    case "claude":
      return callClaudeAPI(systemPrompt, truncatedUserPrompt, apiKey, model);
    case "ollama":
      return callOllamaAPI(systemPrompt, truncatedUserPrompt, model);
    default:
      throw new Error(`不支持的 AI 提供商: ${provider}`);
  }
}

// ========== 报告生成 ==========

/**
 * 生成审查报告的 markdown 文件
 */
function generateReportFile(
  reviewContent: string,
  commits: CommitInfo[],
  stats: { additions: number; deletions: number; files: number },
  outputPath?: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const commitInfo =
    commits.length > 0
      ? commits.map((c) => c.shortHash).join("-")
      : "staged";

  // 确保 .gw-reviews 目录存在
  const reviewDir = ".gw-reviews";
  if (!existsSync(reviewDir)) {
    mkdirSync(reviewDir, { recursive: true });
  }

  const filename = outputPath || join(reviewDir, `review-${commitInfo}-${timestamp}.md`);

  // 构建完整的报告
  let report = `# 🔍 代码审查报告\n\n`;
  report += `> 生成时间: ${new Date().toLocaleString("zh-CN")}\n\n`;

  // 添加变更统计
  report += `## 📊 变更统计\n\n`;
  report += `| 指标 | 数值 |\n`;
  report += `|------|------|\n`;
  report += `| 文件数 | ${stats.files} |\n`;
  report += `| 新增行 | +${stats.additions} |\n`;
  report += `| 删除行 | -${stats.deletions} |\n\n`;

  // 添加 commit 信息
  if (commits.length > 0) {
    report += `## 📝 审查的提交\n\n`;
    for (const commit of commits) {
      report += `- \`${commit.shortHash}\` ${commit.subject} - ${commit.author} (${commit.date})\n`;
    }
    report += `\n`;
  }

  // 添加 AI 审查内容
  report += `## 🤖 AI 审查结果\n\n`;
  report += reviewContent;
  report += `\n\n---\n\n`;
  report += `*本报告由 [git-workflow](https://github.com/iamzjt-front-end/git-workflow) 的 AI Review 功能生成*\n`;

  // 写入文件
  writeFileSync(filename, report, "utf-8");

  return filename;
}

// ========== 主函数 ==========

/**
 * 代码审查主函数
 */
export async function review(
  hashes?: string[],
  options: ReviewOptions = {}
): Promise<void> {
  const config = loadConfig();

  // 检查 AI 配置
  const aiConfig = config.aiCommit;
  if (!aiConfig?.apiKey && aiConfig?.provider !== "ollama") {
    console.log(colors.red("❌ 未配置 AI API Key"));
    console.log("");
    console.log(colors.dim("  请先运行以下命令配置 AI:"));
    console.log(colors.cyan("  gw init"));
    console.log("");
    return;
  }

  let diff = "";
  let commits: CommitInfo[] = [];

  // 确定要审查的内容
  if (hashes && hashes.length > 0) {
    // 检查是否是范围语法 (abc123..def456)
    if (hashes.length === 1 && hashes[0].includes("..") && !hashes[0].includes("...")) {
      const range = hashes[0];
      const [startHash, endHash] = range.split("..");
      
      // 使用 startHash^..endHash 来包含起始 commit（闭区间 [A, B]）
      const inclusiveRange = `${startHash}^..${endHash}`;
      
      // 获取范围内的所有 commits
      try {
        const output = execOutput(
          `git log ${inclusiveRange} --pretty=format:"%H|%h|%s|%an|%ad" --date=short --reverse`
        );
        if (!output) {
          console.log(colors.red(`❌ 无效的 commit 范围: ${range}`));
          process.exit(1);
        }
        commits = output
          .split("\n")
          .filter(Boolean)
          .map((line) => parseCommitLine(line))
          .filter((c): c is CommitInfo => c !== null);
        // 获取范围 diff
        diff = execOutput(`git diff ${inclusiveRange}`) || "";
      } catch {
        console.log(colors.red(`❌ 无效的 commit 范围: ${range}`));
        process.exit(1);
      }
    } else {
      // 指定了单个或多个 commit hash
      commits = hashes.map((hash) => {
        const info = execOutput(
          `git log -1 --pretty=format:"%H|%h|%s|%an|%ad" --date=short ${hash}`
        );
        if (!info) {
          console.log(colors.red(`❌ 找不到 commit: ${hash}`));
          process.exit(1);
        }
        const commit = parseCommitLine(info);
        if (!commit) {
          console.log(colors.red(`❌ 无法解析 commit 信息: ${hash}`));
          process.exit(1);
        }
        return commit;
      });
      diff = getMultipleCommitsDiff(hashes);
    }
  } else if (options.last) {
    // 审查最近 N 个 commits
    commits = getRecentCommits(options.last);
    diff = getMultipleCommitsDiff(commits.map((c) => c.hash));
  } else if (options.staged) {
    // 审查暂存区
    diff = getStagedDiff();
  } else {
    // 交互式选择
    const recentCommits = getRecentCommits(10);
    const stagedDiff = getStagedDiff();

    const choices: any[] = [];

    if (stagedDiff) {
      choices.push({
        name: `📦 暂存区的更改 (staged changes)`,
        value: "staged",
      });
    }

    choices.push(
      ...recentCommits.map((c) => ({
        name: `${colors.yellow(c.shortHash)} ${c.subject} ${colors.dim(`- ${c.author} (${c.date})`)}`,
        value: c.hash,
      }))
    );

    if (choices.length === 0) {
      console.log(colors.yellow("⚠️  没有可审查的内容"));
      return;
    }

    divider();

    const selected = await checkbox({
      message: "选择要审查的内容 (空格选择，回车确认):",
      choices,
      pageSize: choices.length, // 显示所有选项，不滚动
      loop: false, // 到达边界时不循环
      theme,
    });

    if (selected.length === 0) {
      console.log(colors.yellow("⚠️  未选择任何内容"));
      return;
    }

    if (selected.includes("staged")) {
      diff = stagedDiff;
    } else {
      commits = recentCommits.filter((c) => selected.includes(c.hash));
      diff = getMultipleCommitsDiff(selected as string[]);
    }
  }

  if (!diff) {
    console.log(colors.yellow("⚠️  没有检测到代码变更"));
    return;
  }

  const stats = getDiffStats(diff);

  divider();
  console.log(colors.cyan("📊 变更统计:"));
  console.log(colors.dim(`   文件: ${stats.files} 个`));
  console.log(colors.dim(`   新增: +${stats.additions} 行`));
  console.log(colors.dim(`   删除: -${stats.deletions} 行`));
  divider();

  // 调用 AI 进行审查
  const spinner = ora("🤖 AI 正在审查代码...").start();

  try {
    const reviewContent = await callAIReview(diff, commits, config);
    spinner.succeed("AI 审查完成");

    // 生成报告文件
    const reportPath = generateReportFile(
      reviewContent,
      commits,
      stats,
      options.output
    );

    console.log("");
    console.log(colors.green(`✅ 审查报告已生成: ${colors.cyan(reportPath)}`));
    console.log("");

    // 询问是否打开报告
    const shouldOpen = await select({
      message: "是否打开审查报告?",
      choices: [
        { name: "是，在编辑器中打开", value: true },
        { name: "否，稍后查看", value: false },
      ],
      theme,
    });

    if (shouldOpen) {
      // 尝试用默认编辑器打开
      try {
        const { exec } = await import("child_process");
        exec(`open "${reportPath}"`);
      } catch {
        console.log(colors.dim(`  请手动打开: ${reportPath}`));
      }
    }
  } catch (error) {
    spinner.fail("AI 审查失败");
    console.log("");
    console.log(colors.red(`❌ ${(error as Error).message}`));
    console.log("");
  }
}
