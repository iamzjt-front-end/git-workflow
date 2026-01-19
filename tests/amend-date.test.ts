import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("amend-date command", () => {
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

    it("should be able to get commit date", () => {
      const date = execSync('git log -1 --format="%ai"', { encoding: "utf-8" });
      expect(date).toBeTruthy();
      expect(date.trim()).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });

    it("should get both author and committer dates", () => {
      const authorDate = execSync('git log -1 --format="%ai"', {
        encoding: "utf-8",
      }).trim();
      const committerDate = execSync('git log -1 --format="%ci"', {
        encoding: "utf-8",
      }).trim();

      expect(authorDate).toBeTruthy();
      expect(committerDate).toBeTruthy();
      expect(authorDate).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(committerDate).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });
  });

  describe("日期格式化", () => {
    it("should format date correctly", () => {
      const date = new Date("2026-01-19T00:00:00");
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      expect(formatted).toBe("2026-01-19 00:00:00");
    });

    it("should format date with leading zeros", () => {
      const date = new Date("2026-01-05T00:00:00");
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;

      expect(formatted).toBe("2026-01-05");
      expect(month).toBe("01");
      expect(day).toBe("05");
    });
  });

  describe("日期解析", () => {
    const parseDate = (input: string): Date | null => {
      const trimmed = input.trim();
      const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

      if (dateMatch) {
        const [, year, month, day] = dateMatch;
        return new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          0,
          0,
          0,
        );
      }

      return null;
    };

    it("should parse valid date format", () => {
      const date = parseDate("2026-01-19");
      expect(date).toBeTruthy();
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(0); // 0-based
      expect(date?.getDate()).toBe(19);
      expect(date?.getHours()).toBe(0);
      expect(date?.getMinutes()).toBe(0);
      expect(date?.getSeconds()).toBe(0);
    });

    it("should parse date with leading zeros", () => {
      const date = parseDate("2026-01-05");
      expect(date).toBeTruthy();
      expect(date?.getMonth()).toBe(0);
      expect(date?.getDate()).toBe(5);
    });

    it("should return null for invalid format", () => {
      expect(parseDate("invalid")).toBeNull();
      expect(parseDate("2026-1-19")).toBeNull(); // 缺少前导零
      expect(parseDate("2026/01/19")).toBeNull(); // 错误的分隔符
      expect(parseDate("19-01-2026")).toBeNull(); // 错误的顺序
    });

    it("should return null for date with time", () => {
      expect(parseDate("2026-01-19 14:30:00")).toBeNull();
      expect(parseDate("2026-01-19 14:30")).toBeNull();
    });

    it("should handle edge cases", () => {
      expect(parseDate("")).toBeNull();
      expect(parseDate("   ")).toBeNull();
      expect(parseDate("2026-13-01")).not.toBeNull(); // 月份超出范围，但格式正确
      expect(parseDate("2026-00-01")).not.toBeNull(); // 月份为0，但格式正确
    });
  });

  describe("修改最新 commit", () => {
    it("should be able to amend latest commit date", () => {
      const newDate = "2026-01-15 00:00:00";

      // 修改最新 commit 的时间
      execSync(
        `GIT_AUTHOR_DATE="${newDate}" GIT_COMMITTER_DATE="${newDate}" git commit --amend --no-edit --reset-author`,
        { stdio: "pipe" },
      );

      // 验证时间已修改
      const authorDate = execSync(
        'git log -1 --format="%ad" --date=format:"%Y-%m-%d"',
        { encoding: "utf-8" },
      ).trim();

      expect(authorDate).toBe("2026-01-15");
    });

    it("should modify both author and committer dates", () => {
      const newDate = "2026-01-15 00:00:00";

      execSync(
        `GIT_AUTHOR_DATE="${newDate}" GIT_COMMITTER_DATE="${newDate}" git commit --amend --no-edit --reset-author`,
        { stdio: "pipe" },
      );

      const authorDate = execSync(
        'git log -1 --format="%ad" --date=format:"%Y-%m-%d"',
        { encoding: "utf-8" },
      ).trim();

      const committerDate = execSync(
        'git log -1 --format="%cd" --date=format:"%Y-%m-%d"',
        { encoding: "utf-8" },
      ).trim();

      expect(authorDate).toBe("2026-01-15");
      expect(committerDate).toBe("2026-01-15");
    });

    it("should change commit hash when amending", () => {
      const beforeHash = execSync("git rev-parse HEAD", {
        encoding: "utf-8",
      }).trim();

      const newDate = "2026-01-15 00:00:00";
      execSync(
        `GIT_AUTHOR_DATE="${newDate}" GIT_COMMITTER_DATE="${newDate}" git commit --amend --no-edit --reset-author`,
        { stdio: "pipe" },
      );

      const afterHash = execSync("git rev-parse HEAD", {
        encoding: "utf-8",
      }).trim();

      expect(beforeHash).not.toBe(afterHash);
    });
  });

  describe("获取 commit 信息", () => {
    it("should get commit by full hash", () => {
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

    it("should get multiple commits", () => {
      // 创建第二个 commit
      execSync("echo 'test2' > test2.txt", { stdio: "pipe" });
      execSync("git add .", { stdio: "pipe" });
      execSync('git commit -m "Second commit"', { stdio: "pipe" });

      const log = execSync('git log -2 --format="%s"', {
        encoding: "utf-8",
      });

      expect(log).toContain("Second commit");
      expect(log).toContain("Initial commit");
    });
  });

  describe("边界情况", () => {
    it("should handle commit with special characters in message", () => {
      execSync('git commit --amend -m "feat: add \\"quotes\\" feature"', {
        stdio: "pipe",
      });

      const message = execSync('git log -1 --format="%s"', {
        encoding: "utf-8",
      }).trim();

      expect(message).toContain("quotes");
    });

    it("should handle very old dates", () => {
      const oldDate = "2000-01-01 00:00:00";

      execSync(
        `GIT_AUTHOR_DATE="${oldDate}" GIT_COMMITTER_DATE="${oldDate}" git commit --amend --no-edit --reset-author`,
        { stdio: "pipe" },
      );

      const authorDate = execSync(
        'git log -1 --format="%ad" --date=format:"%Y-%m-%d"',
        { encoding: "utf-8" },
      ).trim();

      expect(authorDate).toBe("2000-01-01");
    });

    it("should handle future dates", () => {
      const futureDate = "2030-12-31 23:59:59";

      execSync(
        `GIT_AUTHOR_DATE="${futureDate}" GIT_COMMITTER_DATE="${futureDate}" git commit --amend --no-edit --reset-author`,
        { stdio: "pipe" },
      );

      const authorDate = execSync(
        'git log -1 --format="%ad" --date=format:"%Y-%m-%d"',
        { encoding: "utf-8" },
      ).trim();

      expect(authorDate).toBe("2030-12-31");
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

    it("should get commits in reverse order", () => {
      const firstHash = execSync('git log --reverse --format="%H" | head -1', {
        encoding: "utf-8",
      }).trim();

      const message = execSync(`git log -1 ${firstHash} --format="%s"`, {
        encoding: "utf-8",
      }).trim();

      expect(message).toBe("Initial commit");
    });

    it("should modify only latest commit", () => {
      const newDate = "2026-01-15 00:00:00";

      execSync(
        `GIT_AUTHOR_DATE="${newDate}" GIT_COMMITTER_DATE="${newDate}" git commit --amend --no-edit --reset-author`,
        { stdio: "pipe" },
      );

      // 检查最新 commit
      const latestDate = execSync(
        'git log -1 --format="%ad" --date=format:"%Y-%m-%d"',
        { encoding: "utf-8" },
      ).trim();

      // 检查第二个 commit（不应该被修改）
      const secondDate = execSync(
        'git log -1 HEAD~1 --format="%ad" --date=format:"%Y-%m-%d"',
        { encoding: "utf-8" },
      ).trim();

      expect(latestDate).toBe("2026-01-15");
      expect(secondDate).not.toBe("2026-01-15");
    });
  });
});
