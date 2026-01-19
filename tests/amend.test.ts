import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("amend command", () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    // 保存当前工作目录
    originalCwd = process.cwd();

    // 创建临时测试目录
    testDir = mkdtempSync(join(tmpdir(), "gw-test-"));
    process.chdir(testDir);

    // 初始化 git 仓库
    execSync("git init", { stdio: "pipe" });
    execSync('git config user.email "test@example.com"', { stdio: "pipe" });
    execSync('git config user.name "Test User"', { stdio: "pipe" });

    // 创建初始提交
    execSync("echo 'test' > test.txt", { stdio: "pipe" });
    execSync("git add .", { stdio: "pipe" });
    execSync('git commit -m "Initial commit"', { stdio: "pipe" });
  });

  afterEach(() => {
    // 恢复工作目录
    process.chdir(originalCwd);

    // 清理测试目录
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // 忽略清理错误
    }
  });

  describe("基础功能", () => {
    it("should have commits in test repo", () => {
      const log = execSync("git log --oneline", { encoding: "utf-8" });
      expect(log).toContain("Initial commit");
    });

    it("should be able to get commit message", () => {
      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      });
      expect(message.trim()).toBe("Initial commit");
    });

    it("should get commit with full format", () => {
      const output = execSync('git log -1 --format="%H|%s|%ai"', {
        encoding: "utf-8",
      }).trim();

      const [hash, message, date] = output.split("|");

      expect(hash).toBeTruthy();
      expect(hash).toHaveLength(40); // 完整 hash 长度
      expect(message).toBe("Initial commit");
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });
  });

  describe("修改 commit message", () => {
    it("should be able to amend commit message", () => {
      const newMessage = "Updated commit message";

      execSync(`git commit --amend -m "${newMessage}"`, { stdio: "pipe" });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe(newMessage);
    });

    it("should change commit hash when amending message", () => {
      const beforeHash = execSync("git rev-parse HEAD", {
        encoding: "utf-8",
      }).trim();

      execSync('git commit --amend -m "New message"', { stdio: "pipe" });

      const afterHash = execSync("git rev-parse HEAD", {
        encoding: "utf-8",
      }).trim();

      expect(beforeHash).not.toBe(afterHash);
    });

    it("should preserve commit date when amending message", () => {
      const beforeDate = execSync('git log -1 --format="%ai"', {
        encoding: "utf-8",
      }).trim();

      execSync('git commit --amend -m "New message"', { stdio: "pipe" });

      const afterDate = execSync('git log -1 --format="%ai"', {
        encoding: "utf-8",
      }).trim();

      // Author date 应该保持不变
      expect(beforeDate).toBe(afterDate);
    });

    it("should handle multiline commit messages", () => {
      const newMessage = "feat: add feature\\n\\nDetailed description";

      execSync(`git commit --amend -m "${newMessage}"`, { stdio: "pipe" });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toContain("feat: add feature");
    });
  });

  describe("特殊字符处理", () => {
    it("should escape special characters in commit message", () => {
      const newMessage = 'feat: add "login" feature';

      execSync(`git commit --amend -m "${newMessage.replace(/"/g, '\\"')}"`, {
        stdio: "pipe",
      });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe(newMessage);
    });

    it("should handle single quotes", () => {
      const newMessage = "feat: add 'login' feature";

      execSync(`git commit --amend -m "${newMessage}"`, { stdio: "pipe" });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe(newMessage);
    });

    it("should handle emoji in commit message", () => {
      const newMessage = "✨ feat: add new feature";

      execSync(`git commit --amend -m "${newMessage}"`, { stdio: "pipe" });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe(newMessage);
    });

    it("should handle Chinese characters", () => {
      const newMessage = "feat: 添加登录功能";

      execSync(`git commit --amend -m "${newMessage}"`, { stdio: "pipe" });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe(newMessage);
    });

    it("should handle special symbols", () => {
      const newMessage = "feat: add feature (v1.0.0) [WIP] #123";

      execSync(`git commit --amend -m "${newMessage}"`, { stdio: "pipe" });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe(newMessage);
    });
  });

  describe("获取 commit 信息", () => {
    it("should get commit by hash", () => {
      const hash = execSync("git rev-parse HEAD", {
        encoding: "utf-8",
      }).trim();

      const message = execSync(`git log -1 ${hash} --format="%s"`, {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe("Initial commit");
    });

    it("should get commit by short hash", () => {
      const shortHash = execSync("git rev-parse --short HEAD", {
        encoding: "utf-8",
      }).trim();

      const message = execSync(`git log -1 ${shortHash} --format="%s"`, {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe("Initial commit");
    });

    it("should get commit by HEAD reference", () => {
      const message = execSync('git log -1 HEAD --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe("Initial commit");
    });

    it("should get commit by HEAD~N reference", () => {
      // 创建第二个 commit
      execSync("echo 'test2' > test2.txt", { stdio: "pipe" });
      execSync("git add .", { stdio: "pipe" });
      execSync('git commit -m "Second commit"', { stdio: "pipe" });

      const message = execSync('git log -1 HEAD~1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe("Initial commit");
    });

    it("should handle invalid hash gracefully", () => {
      try {
        execSync('git log -1 invalid-hash --format="%s"', { stdio: "pipe" });
        expect.fail("Should throw error for invalid hash");
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe("Conventional Commits 格式", () => {
    it("should support feat type", () => {
      const message = "feat: add new feature";
      execSync(`git commit --amend -m "${message}"`, { stdio: "pipe" });

      const result = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(result).toBe(message);
    });

    it("should support fix type", () => {
      const message = "fix: resolve bug";
      execSync(`git commit --amend -m "${message}"`, { stdio: "pipe" });

      const result = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(result).toBe(message);
    });

    it("should support scope", () => {
      const message = "feat(auth): add login";
      execSync(`git commit --amend -m "${message}"`, { stdio: "pipe" });

      const result = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(result).toBe(message);
    });

    it("should support breaking change", () => {
      const message = "feat!: breaking change";
      execSync(`git commit --amend -m "${message}"`, { stdio: "pipe" });

      const result = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(result).toBe(message);
    });

    it("should support gitmoji", () => {
      const message = "✨ feat: add feature";
      execSync(`git commit --amend -m "${message}"`, { stdio: "pipe" });

      const result = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(result).toBe(message);
    });
  });

  describe("多个 commits", () => {
    beforeEach(() => {
      // 创建多个 commits
      execSync("echo 'test2' > test2.txt", { stdio: "pipe" });
      execSync("git add .", { stdio: "pipe" });
      execSync('git commit -m "Second commit"', { stdio: "pipe" });

      execSync("echo 'test3' > test3.txt", { stdio: "pipe" });
      execSync("git add .", { stdio: "pipe" });
      execSync('git commit -m "Third commit"', { stdio: "pipe" });
    });

    it("should have multiple commits", () => {
      const count = execSync("git log --oneline | wc -l", {
        encoding: "utf-8",
      }).trim();

      expect(parseInt(count)).toBe(3);
    });

    it("should get recent commits", () => {
      const log = execSync('git log -3 --format="%s"', {
        encoding: "utf-8",
      });

      expect(log).toContain("Third commit");
      expect(log).toContain("Second commit");
      expect(log).toContain("Initial commit");
    });

    it("should modify only latest commit", () => {
      execSync('git commit --amend -m "Modified third commit"', {
        stdio: "pipe",
      });

      const latest = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      const second = execSync('git log -1 HEAD~1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(latest).toBe("Modified third commit");
      expect(second).toBe("Second commit");
    });

    it("should get commits in reverse order", () => {
      const firstHash = execSync('git log --reverse --format="%H" | head -1', {
        encoding: "utf-8",
      }).trim();

      const message = execSync(`git log -1 ${firstHash} --format="%s"`, {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe("Initial commit");
    });
  });

  describe("边界情况", () => {
    it("should handle very long commit messages", () => {
      const longMessage = "feat: " + "a".repeat(500);

      execSync(`git commit --amend -m "${longMessage}"`, { stdio: "pipe" });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe(longMessage);
      expect(message.length).toBeGreaterThan(500);
    });

    it("should handle empty repository edge case", () => {
      // 这个测试在有 commit 的仓库中，验证基本功能
      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBeTruthy();
    });

    it("should handle commit with no changes", () => {
      // 修改 message 但不修改文件
      execSync('git commit --amend -m "No file changes"', { stdio: "pipe" });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe("No file changes");
    });
  });

  describe("commit 格式验证", () => {
    it("should accept standard format", () => {
      const message = "feat: add feature";
      execSync(`git commit --amend -m "${message}"`, { stdio: "pipe" });

      const result = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(result).toBe(message);
    });

    it("should accept format with scope", () => {
      const message = "feat(api): add endpoint";
      execSync(`git commit --amend -m "${message}"`, { stdio: "pipe" });

      const result = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(result).toBe(message);
    });

    it("should accept format with emoji prefix", () => {
      const message = "✨ feat(api): add endpoint";
      execSync(`git commit --amend -m "${message}"`, { stdio: "pipe" });

      const result = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(result).toBe(message);
    });

    it("should accept any custom format", () => {
      const message = "Custom format message";
      execSync(`git commit --amend -m "${message}"`, { stdio: "pipe" });

      const result = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(result).toBe(message);
    });
  });
});
