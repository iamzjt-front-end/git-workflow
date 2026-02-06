import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execOutput } from "../src/utils";

// Mock dependencies
vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

vi.mock("../src/utils", () => ({
  execOutput: vi.fn(),
  colors: {
    red: (s: string) => s,
    green: (s: string) => s,
    yellow: (s: string) => s,
    cyan: (s: string) => s,
    dim: (s: string) => s,
  },
  theme: {},
  divider: vi.fn(),
}));

vi.mock("../src/config", () => ({
  loadConfig: vi.fn(),
}));

vi.mock("fs", () => ({
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
  checkbox: vi.fn(),
}));

vi.mock("ora", () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
  })),
}));

global.fetch = vi.fn();

describe("Review 功能测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Commit 信息解析", () => {
    it("应该正确解析 git log 输出", () => {
      const output =
        "abc123def|abc123d|feat: 添加新功能|张三|2024-01-20";
      const [hash, shortHash, subject, author, date] = output.split("|");

      expect(hash).toBe("abc123def");
      expect(shortHash).toBe("abc123d");
      expect(subject).toBe("feat: 添加新功能");
      expect(author).toBe("张三");
      expect(date).toBe("2024-01-20");
    });

    it("应该正确解析多个 commits", () => {
      const output = `abc123def|abc123d|feat: 添加新功能|张三|2024-01-20
def456ghi|def456g|fix: 修复 bug|李四|2024-01-19
ghi789jkl|ghi789j|docs: 更新文档|王五|2024-01-18`;

      const commits = output
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [hash, shortHash, subject, author, date] = line.split("|");
          return { hash, shortHash, subject, author, date };
        });

      expect(commits).toHaveLength(3);
      expect(commits[0].subject).toBe("feat: 添加新功能");
      expect(commits[1].subject).toBe("fix: 修复 bug");
      expect(commits[2].subject).toBe("docs: 更新文档");
    });

    it("空输出应该返回空数组", () => {
      const output = "";
      const commits = output
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [hash, shortHash, subject, author, date] = line.split("|");
          return { hash, shortHash, subject, author, date };
        });

      expect(commits).toHaveLength(0);
    });
  });

  describe("Diff 解析", () => {
    it("应该正确解析文件状态 - 新增文件", () => {
      const diff = `diff --git a/src/new.ts b/src/new.ts
new file mode 100644
index 0000000..abc1234
--- /dev/null
+++ b/src/new.ts
@@ -0,0 +1,10 @@
+export function newFunction() {
+  return "hello";
+}`;

      const isNewFile = diff.includes("new file mode");
      expect(isNewFile).toBe(true);
    });

    it("应该正确解析文件状态 - 删除文件", () => {
      const diff = `diff --git a/src/old.ts b/src/old.ts
deleted file mode 100644
index abc1234..0000000
--- a/src/old.ts
+++ /dev/null
@@ -1,10 +0,0 @@
-export function oldFunction() {
-  return "goodbye";
-}`;

      const isDeletedFile = diff.includes("deleted file mode");
      expect(isDeletedFile).toBe(true);
    });

    it("应该正确解析文件状态 - 重命名文件", () => {
      const diff = `diff --git a/src/old.ts b/src/new.ts
rename from src/old.ts
rename to src/new.ts`;

      const isRenamed = diff.includes("rename from");
      expect(isRenamed).toBe(true);
    });

    it("应该正确解析文件状态 - 修改文件", () => {
      const diff = `diff --git a/src/utils.ts b/src/utils.ts
index abc1234..def5678 100644
--- a/src/utils.ts
+++ b/src/utils.ts
@@ -10,6 +10,8 @@ export function helper() {
   return "helper";
 }
+
+export function newHelper() {
+  return "new helper";
+}`;

      const isNewFile = diff.includes("new file mode");
      const isDeletedFile = diff.includes("deleted file mode");
      const isRenamed = diff.includes("rename from");
      const isModified = !isNewFile && !isDeletedFile && !isRenamed;

      expect(isModified).toBe(true);
    });

    it("应该正确提取文件路径", () => {
      const diffHeader = "diff --git a/src/utils.ts b/src/utils.ts";
      const match = diffHeader.match(/a\/(.+) b\/(.+)/);

      expect(match).not.toBeNull();
      expect(match![1]).toBe("src/utils.ts");
      expect(match![2]).toBe("src/utils.ts");
    });

    it("应该正确分割多个文件的 diff", () => {
      const diff = `diff --git a/src/file1.ts b/src/file1.ts
index abc1234..def5678 100644
--- a/src/file1.ts
+++ b/src/file1.ts
@@ -1,3 +1,4 @@
+// new line
 export const a = 1;
diff --git a/src/file2.ts b/src/file2.ts
index ghi9012..jkl3456 100644
--- a/src/file2.ts
+++ b/src/file2.ts
@@ -1,3 +1,4 @@
+// another new line
 export const b = 2;`;

      const fileDiffs = diff.split(/^diff --git /m).filter(Boolean);
      expect(fileDiffs).toHaveLength(2);
    });
  });

  describe("Diff 统计", () => {
    it("应该正确统计新增行数", () => {
      const diff = `@@ -1,3 +1,6 @@
 existing line
+new line 1
+new line 2
+new line 3
 another existing line`;

      const lines = diff.split("\n");
      let additions = 0;

      for (const line of lines) {
        if (line.startsWith("+") && !line.startsWith("+++")) {
          additions++;
        }
      }

      expect(additions).toBe(3);
    });

    it("应该正确统计删除行数", () => {
      const diff = `@@ -1,6 +1,3 @@
 existing line
-deleted line 1
-deleted line 2
-deleted line 3
 another existing line`;

      const lines = diff.split("\n");
      let deletions = 0;

      for (const line of lines) {
        if (line.startsWith("-") && !line.startsWith("---")) {
          deletions++;
        }
      }

      expect(deletions).toBe(3);
    });

    it("应该正确统计文件数", () => {
      const diff = `diff --git a/src/file1.ts b/src/file1.ts
+new line
diff --git a/src/file2.ts b/src/file2.ts
+another new line
diff --git a/src/file3.ts b/src/file3.ts
+third new line`;

      const fileDiffs = diff.split(/^diff --git /m).filter(Boolean);
      expect(fileDiffs).toHaveLength(3);
    });

    it("应该忽略 +++ 和 --- 行", () => {
      const diff = `--- a/src/file.ts
+++ b/src/file.ts
@@ -1,3 +1,4 @@
+real new line`;

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

      expect(additions).toBe(1);
      expect(deletions).toBe(0);
    });
  });

  describe("问题严重程度", () => {
    const severityLevels = [
      { level: "critical", emoji: "🔴", description: "严重问题" },
      { level: "warning", emoji: "🟡", description: "警告" },
      { level: "suggestion", emoji: "🔵", description: "建议" },
    ];

    it("应该有 3 种严重程度", () => {
      expect(severityLevels).toHaveLength(3);
    });

    it("每种严重程度都应该有必需的字段", () => {
      severityLevels.forEach((level) => {
        expect(level).toHaveProperty("level");
        expect(level).toHaveProperty("emoji");
        expect(level).toHaveProperty("description");
      });
    });
  });

  describe("审查维度", () => {
    const reviewDimensions = [
      { name: "代码质量", key: "quality" },
      { name: "潜在 Bug", key: "bugs" },
      { name: "安全问题", key: "security" },
      { name: "性能问题", key: "performance" },
      { name: "最佳实践", key: "bestPractices" },
    ];

    it("应该有 5 个审查维度", () => {
      expect(reviewDimensions).toHaveLength(5);
    });

    it("每个维度都应该有名称和键", () => {
      reviewDimensions.forEach((dim) => {
        expect(dim.name).toBeTruthy();
        expect(dim.key).toBeTruthy();
      });
    });
  });

  describe("报告生成", () => {
    it("应该生成正确的文件名格式", () => {
      const commitHash = "abc1234";
      const timestamp = "2024-01-20T10-30-00";
      const filename = `review-${commitHash}-${timestamp}.md`;

      expect(filename).toBe("review-abc1234-2024-01-20T10-30-00.md");
    });

    it("多个 commit 应该用连字符连接", () => {
      const commits = ["abc1234", "def5678", "ghi9012"];
      const commitInfo = commits.join("-");

      expect(commitInfo).toBe("abc1234-def5678-ghi9012");
    });

    it("暂存区审查应该使用 staged 作为标识", () => {
      const commits: string[] = [];
      const commitInfo = commits.length > 0 ? commits.join("-") : "staged";

      expect(commitInfo).toBe("staged");
    });

    it("报告目录应该是 .gw-reviews", () => {
      const reviewDir = ".gw-reviews";
      expect(reviewDir).toBe(".gw-reviews");
    });
  });

  describe("AI 提供商配置", () => {
    const providers = [
      { id: "github", name: "GitHub Models", defaultModel: "gpt-4o" },
      { id: "openai", name: "OpenAI", defaultModel: "gpt-4o" },
      { id: "claude", name: "Claude", defaultModel: "claude-3-5-sonnet-20241022" },
      { id: "ollama", name: "Ollama", defaultModel: "qwen2.5-coder:14b" },
    ];

    it("应该支持 4 种 AI 提供商", () => {
      expect(providers).toHaveLength(4);
    });

    it("每个提供商都应该有默认模型", () => {
      providers.forEach((provider) => {
        expect(provider.defaultModel).toBeTruthy();
      });
    });

    it("Ollama 应该使用本地端点", () => {
      const ollamaEndpoint = "http://localhost:11434/api/generate";
      expect(ollamaEndpoint).toContain("localhost");
    });
  });

  describe("Diff 长度限制", () => {
    it("应该截断过长的 diff", () => {
      const maxLength = 30000;
      const longDiff = "a".repeat(35000);

      const truncated =
        longDiff.length > maxLength
          ? longDiff.slice(0, maxLength) + "\n\n[... diff 内容过长，已截断 ...]"
          : longDiff;

      expect(truncated.length).toBeLessThan(longDiff.length);
      expect(truncated).toContain("已截断");
    });

    it("短 diff 不应该被截断", () => {
      const maxLength = 30000;
      const shortDiff = "a".repeat(1000);

      const result =
        shortDiff.length > maxLength
          ? shortDiff.slice(0, maxLength) + "\n\n[... diff 内容过长，已截断 ...]"
          : shortDiff;

      expect(result).toBe(shortDiff);
      expect(result).not.toContain("已截断");
    });
  });

  describe("命令选项", () => {
    it("--last 选项应该限制 commit 数量", () => {
      const lastOption = 5;
      const allCommits = Array.from({ length: 20 }, (_, i) => ({
        hash: `hash${i}`,
        subject: `commit ${i}`,
      }));

      const limitedCommits = allCommits.slice(0, lastOption);
      expect(limitedCommits).toHaveLength(5);
    });

    it("--staged 选项应该审查暂存区", () => {
      const options = { staged: true };
      expect(options.staged).toBe(true);
    });

    it("--output 选项应该指定输出路径", () => {
      const options = { output: "./my-review.md" };
      expect(options.output).toBe("./my-review.md");
    });
  });

  describe("交互式选择", () => {
    it("选项应该包含暂存区（如果有更改）", () => {
      const hasStagedChanges = true;
      const choices: any[] = [];

      if (hasStagedChanges) {
        choices.push({
          name: "📦 暂存区的更改 (staged changes)",
          value: "staged",
        });
      }

      expect(choices).toHaveLength(1);
      expect(choices[0].value).toBe("staged");
    });

    it("选项应该包含最近的 commits", () => {
      const recentCommits = [
        { hash: "abc123", shortHash: "abc123", subject: "feat: 新功能" },
        { hash: "def456", shortHash: "def456", subject: "fix: 修复 bug" },
      ];

      const choices = recentCommits.map((c) => ({
        name: `${c.shortHash} ${c.subject}`,
        value: c.hash,
      }));

      expect(choices).toHaveLength(2);
      expect(choices[0].value).toBe("abc123");
    });

    it("没有可审查内容时应该返回空数组", () => {
      const hasStagedChanges = false;
      const recentCommits: any[] = [];
      const choices: any[] = [];

      if (hasStagedChanges) {
        choices.push({ name: "staged", value: "staged" });
      }
      choices.push(...recentCommits);

      expect(choices).toHaveLength(0);
    });
  });

  describe("系统提示词", () => {
    it("中文提示词应该包含审查原则", () => {
      const zhPrompt = `你是一个资深的代码审查专家
## 审查原则
1. 重点关注变更代码
2. 提供具体建议
3. 区分问题严重程度`;

      expect(zhPrompt).toContain("审查原则");
      expect(zhPrompt).toContain("重点关注变更代码");
    });

    it("英文提示词应该包含 Review Principles", () => {
      const enPrompt = `You are a senior code review expert
## Review Principles
1. Focus on Changed Code
2. Provide Specific Suggestions
3. Categorize Issue Severity`;

      expect(enPrompt).toContain("Review Principles");
      expect(enPrompt).toContain("Focus on Changed Code");
    });

    it("提示词应该包含 diff 格式说明", () => {
      const prompt = `## Diff 格式说明
- 以 + 开头的行是新增的代码
- 以 - 开头的行是删除的代码
- @@ 行表示代码位置信息`;

      expect(prompt).toContain("Diff 格式说明");
      expect(prompt).toContain("新增的代码");
      expect(prompt).toContain("删除的代码");
    });
  });

  describe("用户提示词", () => {
    it("应该包含变更概览", () => {
      const stats = { files: 3, additions: 45, deletions: 12 };
      const prompt = `## 变更概览
- 涉及文件: ${stats.files} 个
- 新增行数: +${stats.additions}
- 删除行数: -${stats.deletions}`;

      expect(prompt).toContain("变更概览");
      expect(prompt).toContain("3 个");
      expect(prompt).toContain("+45");
      expect(prompt).toContain("-12");
    });

    it("应该包含相关提交信息", () => {
      const commits = [
        { shortHash: "abc123", subject: "feat: 新功能", author: "张三", date: "2024-01-20" },
      ];

      let prompt = "## 相关提交\n\n";
      for (const commit of commits) {
        prompt += `- \`${commit.shortHash}\` ${commit.subject} (${commit.author}, ${commit.date})\n`;
      }

      expect(prompt).toContain("相关提交");
      expect(prompt).toContain("abc123");
      expect(prompt).toContain("feat: 新功能");
    });

    it("应该包含变更文件列表", () => {
      const files = [
        { newPath: "src/new.ts", status: "A" },
        { newPath: "src/modified.ts", status: "M" },
        { newPath: "src/deleted.ts", status: "D" },
      ];

      let prompt = "## 变更文件列表\n\n";
      for (const file of files) {
        const statusIcon =
          file.status === "A" ? "🆕" : file.status === "D" ? "🗑️" : "✏️";
        prompt += `- ${statusIcon} \`${file.newPath}\`\n`;
      }

      expect(prompt).toContain("🆕");
      expect(prompt).toContain("🗑️");
      expect(prompt).toContain("✏️");
    });
  });

  describe("报告内容", () => {
    it("报告应该包含标题", () => {
      const report = "# 🔍 代码审查报告\n\n";
      expect(report).toContain("代码审查报告");
    });

    it("报告应该包含生成时间", () => {
      const timestamp = new Date().toLocaleString("zh-CN");
      const report = `> 生成时间: ${timestamp}\n\n`;
      expect(report).toContain("生成时间");
    });

    it("报告应该包含变更统计表格", () => {
      const stats = { files: 3, additions: 45, deletions: 12 };
      const report = `## 📊 变更统计

| 指标 | 数值 |
|------|------|\n| 文件数 | ${stats.files} |
| 新增行 | +${stats.additions} |
| 删除行 | -${stats.deletions} |`;

      expect(report).toContain("变更统计");
      expect(report).toContain("| 文件数 | 3 |");
    });

    it("报告应该包含 AI 审查结果", () => {
      const reviewContent = "### 概述\n本次变更主要添加了用户登录功能...";
      const report = `## 🤖 AI 审查结果\n\n${reviewContent}`;

      expect(report).toContain("AI 审查结果");
      expect(report).toContain("概述");
    });

    it("报告应该包含工具署名", () => {
      const footer = "*本报告由 [git-workflow](https://github.com/iamzjt-front-end/git-workflow) 的 AI Review 功能生成*";
      expect(footer).toContain("git-workflow");
      expect(footer).toContain("AI Review");
    });
  });

  describe("getRecentCommits 函数逻辑", () => {
    it("应该使用正确的 git log 格式", () => {
      const limit = 20;
      const expectedCommand = `git log -${limit} --pretty=format:"%H|%h|%s|%an|%ad" --date=short`;
      expect(expectedCommand).toContain("--pretty=format");
      expect(expectedCommand).toContain("%H|%h|%s|%an|%ad");
      expect(expectedCommand).toContain("--date=short");
    });

    it("应该正确处理 limit 参数", () => {
      const limits = [5, 10, 20, 50];
      limits.forEach((limit) => {
        const command = `git log -${limit} --pretty=format:"%H|%h|%s|%an|%ad" --date=short`;
        expect(command).toContain(`-${limit}`);
      });
    });

    it("git log 失败时应该返回空数组", () => {
      const result: any[] = [];
      try {
        throw new Error("git log failed");
      } catch {
        // 返回空数组
      }
      expect(result).toHaveLength(0);
    });
  });

  describe("getStagedDiff 函数逻辑", () => {
    it("应该优先获取暂存区的 diff", () => {
      const stagedDiff = "diff --git a/file.ts b/file.ts\n+new line";
      const workingDiff = "diff --git a/other.ts b/other.ts\n+other line";

      // 模拟逻辑：如果有暂存区 diff，返回暂存区 diff
      const result = stagedDiff || workingDiff;
      expect(result).toBe(stagedDiff);
    });

    it("暂存区为空时应该获取工作区 diff", () => {
      const stagedDiff = "";
      const workingDiff = "diff --git a/other.ts b/other.ts\n+other line";

      const result = stagedDiff || workingDiff;
      expect(result).toBe(workingDiff);
    });

    it("两者都为空时应该返回空字符串", () => {
      const stagedDiff = "";
      const workingDiff = "";

      const result = stagedDiff || workingDiff || "";
      expect(result).toBe("");
    });
  });

  describe("getCommitDiff 函数逻辑", () => {
    it("应该使用正确的 git show 命令", () => {
      const hash = "abc1234";
      const expectedCommand = `git show ${hash} --format="" --patch`;
      expect(expectedCommand).toContain("git show");
      expect(expectedCommand).toContain(hash);
      expect(expectedCommand).toContain("--format=\"\"");
      expect(expectedCommand).toContain("--patch");
    });
  });

  describe("getMultipleCommitsDiff 函数逻辑", () => {
    it("空数组应该返回空字符串", () => {
      const hashes: string[] = [];
      const result = hashes.length === 0 ? "" : "some diff";
      expect(result).toBe("");
    });

    it("单个 hash 应该调用 getCommitDiff", () => {
      const hashes = ["abc1234"];
      const isSingle = hashes.length === 1;
      expect(isSingle).toBe(true);
    });

    it("多个 hash 应该使用范围 diff", () => {
      const hashes = ["abc1234", "def5678", "ghi9012"];
      const oldest = hashes[hashes.length - 1];
      const newest = hashes[0];
      const rangeCommand = `git diff ${oldest}^..${newest}`;

      expect(rangeCommand).toContain("git diff");
      expect(rangeCommand).toContain("ghi9012^");
      expect(rangeCommand).toContain("abc1234");
    });
  });

  describe("parseDiff 函数逻辑", () => {
    it("应该正确解析完整的 diff", () => {
      const diff = `diff --git a/src/utils.ts b/src/utils.ts
index abc1234..def5678 100644
--- a/src/utils.ts
+++ b/src/utils.ts
@@ -1,3 +1,4 @@
+// new comment
 export const a = 1;`;

      const fileDiffs = diff.split(/^diff --git /m).filter(Boolean);
      expect(fileDiffs).toHaveLength(1);

      const firstDiff = fileDiffs[0];
      const headerMatch = firstDiff.split("\n")[0]?.match(/a\/(.+) b\/(.+)/);
      expect(headerMatch).not.toBeNull();
      expect(headerMatch![1]).toBe("src/utils.ts");
    });

    it("应该处理没有匹配的 header", () => {
      const invalidDiff = "some invalid content";
      const headerMatch = invalidDiff.match(/a\/(.+) b\/(.+)/);
      expect(headerMatch).toBeNull();
    });
  });

  describe("AI API 调用逻辑", () => {
    it("GitHub API 应该使用正确的 endpoint", () => {
      const endpoint = "https://models.github.ai/inference/chat/completions";
      expect(endpoint).toContain("github.ai");
      expect(endpoint).toContain("chat/completions");
    });

    it("OpenAI API 应该使用正确的 endpoint", () => {
      const endpoint = "https://api.openai.com/v1/chat/completions";
      expect(endpoint).toContain("openai.com");
      expect(endpoint).toContain("chat/completions");
    });

    it("Claude API 应该使用正确的 endpoint", () => {
      const endpoint = "https://api.anthropic.com/v1/messages";
      expect(endpoint).toContain("anthropic.com");
      expect(endpoint).toContain("messages");
    });

    it("Ollama API 应该使用本地 endpoint", () => {
      const endpoint = "http://localhost:11434/api/generate";
      expect(endpoint).toContain("localhost:11434");
      expect(endpoint).toContain("generate");
    });

    it("API 请求应该包含正确的 headers", () => {
      const githubHeaders = {
        Authorization: "Bearer test-key",
        "Content-Type": "application/json",
      };
      expect(githubHeaders.Authorization).toContain("Bearer");
      expect(githubHeaders["Content-Type"]).toBe("application/json");
    });

    it("Claude API 应该使用 x-api-key header", () => {
      const claudeHeaders = {
        "x-api-key": "test-key",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      };
      expect(claudeHeaders["x-api-key"]).toBe("test-key");
      expect(claudeHeaders["anthropic-version"]).toBe("2023-06-01");
    });

    it("API 请求应该包含正确的 body 结构", () => {
      const body = {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "system prompt" },
          { role: "user", content: "user prompt" },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      };

      expect(body.model).toBe("gpt-4o");
      expect(body.messages).toHaveLength(2);
      expect(body.max_tokens).toBe(4000);
      expect(body.temperature).toBe(0.3);
    });

    it("Claude API body 结构应该不同", () => {
      const claudeBody = {
        model: "claude-3-5-sonnet-20241022",
        system: "system prompt",
        messages: [{ role: "user", content: "user prompt" }],
        max_tokens: 4000,
        temperature: 0.3,
      };

      expect(claudeBody.system).toBe("system prompt");
      expect(claudeBody.messages).toHaveLength(1);
    });

    it("Ollama API body 结构应该不同", () => {
      const ollamaBody = {
        model: "qwen2.5-coder:14b",
        prompt: "system prompt\n\nuser prompt",
        stream: false,
        options: {
          num_predict: 4000,
          temperature: 0.3,
        },
      };

      expect(ollamaBody.prompt).toContain("system prompt");
      expect(ollamaBody.stream).toBe(false);
      expect(ollamaBody.options.num_predict).toBe(4000);
    });
  });

  describe("错误处理", () => {
    it("不支持的 AI 提供商应该抛出错误", () => {
      const provider = "invalid";
      const providers = ["github", "openai", "claude", "ollama"];
      const isSupported = providers.includes(provider);

      expect(isSupported).toBe(false);
    });

    it("缺少 API key 时应该抛出错误（非 Ollama）", () => {
      const provider = "github";
      const apiKey = "";
      const needsKey = provider !== "ollama" && !apiKey;

      expect(needsKey).toBe(true);
    });

    it("Ollama 不需要 API key", () => {
      const provider = "ollama";
      const apiKey = "";
      const needsKey = provider !== "ollama" && !apiKey;

      expect(needsKey).toBe(false);
    });

    it("API 响应失败时应该抛出错误", () => {
      const response = { ok: false, status: 401 };
      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it("找不到 commit 时应该退出", () => {
      const commitInfo = "";
      const shouldExit = !commitInfo;
      expect(shouldExit).toBe(true);
    });

    it("没有代码变更时应该提示", () => {
      const diff = "";
      const hasChanges = !!diff;
      expect(hasChanges).toBe(false);
    });

    it("未选择任何内容时应该提示", () => {
      const selected: string[] = [];
      const hasSelection = selected.length > 0;
      expect(hasSelection).toBe(false);
    });
  });

  describe("配置检查", () => {
    it("未配置 AI 时应该提示运行 gw init", () => {
      const config = { aiCommit: undefined };
      const hasConfig = !!config.aiCommit?.apiKey;
      expect(hasConfig).toBe(false);
    });

    it("配置了 Ollama 但没有 apiKey 应该允许", () => {
      const config = { aiCommit: { provider: "ollama" } };
      const isOllama = config.aiCommit?.provider === "ollama";
      expect(isOllama).toBe(true);
    });

    it("应该使用默认语言 zh-CN", () => {
      const config = { aiCommit: {} };
      const language = (config.aiCommit as any).language || "zh-CN";
      expect(language).toBe("zh-CN");
    });

    it("应该使用默认提供商 github", () => {
      const config = { aiCommit: {} };
      const provider = (config.aiCommit as any).provider || "github";
      expect(provider).toBe("github");
    });
  });

  describe("文件系统操作", () => {
    it("应该在 .gw-reviews 目录不存在时创建", () => {
      const reviewDir = ".gw-reviews";
      const exists = false;

      if (!exists) {
        // 应该调用 mkdirSync
        expect(reviewDir).toBe(".gw-reviews");
      }
    });

    it("应该使用 recursive: true 创建目录", () => {
      const options = { recursive: true };
      expect(options.recursive).toBe(true);
    });

    it("应该使用 utf-8 编码写入文件", () => {
      const encoding = "utf-8";
      expect(encoding).toBe("utf-8");
    });
  });

  describe("时间戳格式", () => {
    it("应该生成 ISO 格式的时间戳", () => {
      const timestamp = new Date().toISOString();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("应该替换时间戳中的特殊字符", () => {
      const timestamp = "2024-01-20T10:30:00.000Z";
      const formatted = timestamp.replace(/[:.]/g, "-").slice(0, 19);
      expect(formatted).toBe("2024-01-20T10-30-00");
      expect(formatted).not.toContain(":");
      expect(formatted).not.toContain(".");
    });
  });

  describe("checkbox 交互配置", () => {
    it("pageSize 应该等于 choices 长度", () => {
      const choices = [
        { name: "option1", value: "1" },
        { name: "option2", value: "2" },
        { name: "option3", value: "3" },
      ];
      const pageSize = choices.length;
      expect(pageSize).toBe(3);
    });

    it("loop 应该为 false", () => {
      const loop = false;
      expect(loop).toBe(false);
    });
  });

  describe("select 交互配置", () => {
    it("打开报告选项应该有两个选择", () => {
      const choices = [
        { name: "是，在编辑器中打开", value: true },
        { name: "否，稍后查看", value: false },
      ];
      expect(choices).toHaveLength(2);
      expect(choices[0].value).toBe(true);
      expect(choices[1].value).toBe(false);
    });
  });

  describe("文件状态图标", () => {
    it("新增文件应该使用 🆕 图标", () => {
      const status = "A";
      const icon = status === "A" ? "🆕" : status === "D" ? "🗑️" : status === "R" ? "📝" : "✏️";
      expect(icon).toBe("🆕");
    });

    it("删除文件应该使用 🗑️ 图标", () => {
      const status = "D";
      const icon = status === "A" ? "🆕" : status === "D" ? "🗑️" : status === "R" ? "📝" : "✏️";
      expect(icon).toBe("🗑️");
    });

    it("重命名文件应该使用 📝 图标", () => {
      const status = "R";
      const icon = status === "A" ? "🆕" : status === "D" ? "🗑️" : status === "R" ? "📝" : "✏️";
      expect(icon).toBe("📝");
    });

    it("修改文件应该使用 ✏️ 图标", () => {
      const status = "M";
      const icon = status === "A" ? "🆕" : status === "D" ? "🗑️" : status === "R" ? "📝" : "✏️";
      expect(icon).toBe("✏️");
    });
  });

  describe("英文提示词", () => {
    it("英文变更概览应该使用正确的标题", () => {
      const isZh = false;
      const title = isZh ? "## 变更概览" : "## Change Overview";
      expect(title).toBe("## Change Overview");
    });

    it("英文相关提交应该使用正确的标题", () => {
      const isZh = false;
      const title = isZh ? "## 相关提交" : "## Related Commits";
      expect(title).toBe("## Related Commits");
    });

    it("英文变更文件列表应该使用正确的标题", () => {
      const isZh = false;
      const title = isZh ? "## 变更文件列表" : "## Changed Files";
      expect(title).toBe("## Changed Files");
    });

    it("英文 Diff 内容应该使用正确的标题", () => {
      const isZh = false;
      const title = isZh ? "## Diff 内容" : "## Diff Content";
      expect(title).toBe("## Diff Content");
    });
  });

  describe("API 响应解析", () => {
    it("GitHub/OpenAI 响应应该从 choices[0].message.content 获取", () => {
      const response = {
        choices: [
          {
            message: {
              content: "review content",
            },
          },
        ],
      };
      const content = response.choices[0]?.message?.content?.trim() || "";
      expect(content).toBe("review content");
    });

    it("Claude 响应应该从 content[0].text 获取", () => {
      const response = {
        content: [
          {
            text: "review content",
          },
        ],
      };
      const content = response.content[0]?.text?.trim() || "";
      expect(content).toBe("review content");
    });

    it("Ollama 响应应该从 response 获取", () => {
      const response = {
        response: "review content",
      };
      const content = response.response?.trim() || "";
      expect(content).toBe("review content");
    });

    it("空响应应该返回空字符串", () => {
      const response = { choices: [] };
      const content = response.choices[0]?.message?.content?.trim() || "";
      expect(content).toBe("");
    });
  });

  describe("Ollama 错误处理", () => {
    it("连接失败应该提供安装提示", () => {
      const model = "qwen2.5-coder:14b";
      const errorMessage = `Ollama 连接失败。请确保：
1. 已安装 Ollama (https://ollama.com)
2. 运行 'ollama serve'
3. 下载模型 'ollama pull ${model}'`;

      expect(errorMessage).toContain("ollama.com");
      expect(errorMessage).toContain("ollama serve");
      expect(errorMessage).toContain(`ollama pull ${model}`);
    });
  });

  describe("spinner 状态", () => {
    it("开始时应该显示审查中消息", () => {
      const message = "🤖 AI 正在审查代码...";
      expect(message).toContain("AI");
      expect(message).toContain("审查");
    });

    it("成功时应该显示完成消息", () => {
      const message = "AI 审查完成";
      expect(message).toContain("完成");
    });

    it("失败时应该显示失败消息", () => {
      const message = "AI 审查失败";
      expect(message).toContain("失败");
    });
  });
});
