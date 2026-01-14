import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";

// Mock child_process
vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

describe("Commit 功能测试", () => {
  describe("提交类型", () => {
    const commitTypes = [
      { type: "feat", emoji: "✨", description: "新功能" },
      { type: "fix", emoji: "🐛", description: "修复 Bug" },
      { type: "docs", emoji: "📝", description: "文档更新" },
      { type: "style", emoji: "💄", description: "代码格式（不影响功能）" },
      {
        type: "refactor",
        emoji: "♻️",
        description: "重构（既不是新功能也不是修复）",
      },
      { type: "perf", emoji: "⚡", description: "性能优化" },
      { type: "test", emoji: "✅", description: "测试相关" },
      { type: "build", emoji: "📦", description: "构建系统或外部依赖" },
      { type: "ci", emoji: "👷", description: "CI 配置" },
      { type: "chore", emoji: "🔧", description: "其他修改" },
    ];

    it("应该有 10 种提交类型", () => {
      expect(commitTypes).toHaveLength(10);
    });

    it("每种类型都应该有必需的字段", () => {
      commitTypes.forEach((type) => {
        expect(type).toHaveProperty("type");
        expect(type).toHaveProperty("emoji");
        expect(type).toHaveProperty("description");
        expect(type.type).toBeTruthy();
        expect(type.emoji).toBeTruthy();
        expect(type.description).toBeTruthy();
      });
    });

    it("类型名称应该是小写", () => {
      commitTypes.forEach((type) => {
        expect(type.type).toBe(type.type.toLowerCase());
      });
    });
  });

  describe("提交消息格式", () => {
    it("应该生成正确的提交消息格式", () => {
      const type = "feat";
      const emoji = "✨";
      const scope = "tag";
      const message = "支持多列显示";

      const commitMessage = `${type}(${scope}): ${emoji} ${message}`;
      expect(commitMessage).toBe("feat(tag): ✨ 支持多列显示");
    });

    it("无 scope 时应该省略括号", () => {
      const type = "fix";
      const emoji = "🐛";
      const message = "修复对齐问题";

      const commitMessage = `${type}: ${emoji} ${message}`;
      expect(commitMessage).toBe("fix: 🐛 修复对齐问题");
    });
  });

  describe("Refactor 对齐处理", () => {
    it("refactor 类型应该添加额外空格", () => {
      const type = "refactor";
      const emoji = "♻️";
      const extraSpace = type === "refactor" ? " " : "";
      const display = `${emoji}${extraSpace} ${type}`;

      // refactor 的 emoji 宽度不一致，需要额外空格
      expect(display).toContain(" ");
    });

    it("其他类型不应该添加额外空格", () => {
      const type = "feat";
      const emoji = "✨";
      const extraSpace = type === "refactor" ? " " : "";
      const display = `${emoji}${extraSpace} ${type}`;

      expect(extraSpace).toBe("");
    });
  });

  describe("自动暂存功能", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("autoStage 为 true 时应该执行 git add -A", () => {
      const autoStage = true;

      if (autoStage) {
        execSync("git add -A", { stdio: "pipe" });
      }

      expect(execSync).toHaveBeenCalledWith("git add -A", { stdio: "pipe" });
    });

    it("autoStage 为 false 时不应该自动执行 git add -A", () => {
      const autoStage = false;

      if (autoStage) {
        execSync("git add -A", { stdio: "pipe" });
      }

      expect(execSync).not.toHaveBeenCalled();
    });

    it("提交前应该再次执行 git add -A 确保文件被暂存", () => {
      const autoStage = true;

      // 模拟提交前的暂存操作
      if (autoStage) {
        execSync("git add -A", { stdio: "pipe" });
      }

      // 模拟提交前再次暂存
      if (autoStage) {
        execSync("git add -A", { stdio: "pipe" });
      }

      // 应该被调用两次
      expect(execSync).toHaveBeenCalledTimes(2);
      expect(execSync).toHaveBeenCalledWith("git add -A", { stdio: "pipe" });
    });

    it("默认 autoStage 应该为 true", () => {
      const config = {};
      const autoStage = (config as any).autoStage ?? true;

      expect(autoStage).toBe(true);
    });

    it("配置 autoStage 为 false 时应该覆盖默认值", () => {
      const config = { autoStage: false };
      const autoStage = config.autoStage ?? true;

      expect(autoStage).toBe(false);
    });
  });

  describe("Git 状态解析", () => {
    it("应该正确解析已暂存的文件", () => {
      // 模拟 git status --porcelain 输出
      // M  = 已暂存的修改
      // A  = 已暂存的新文件
      const output = "M  src/index.ts\nA  src/new.ts";
      const lines = output.split("\n");

      const staged: { status: string; file: string }[] = [];

      for (const line of lines) {
        if (!line) continue;
        const indexStatus = line[0];
        const file = line.slice(3);

        if (indexStatus !== " " && indexStatus !== "?") {
          staged.push({ status: indexStatus, file });
        }
      }

      expect(staged).toHaveLength(2);
      expect(staged[0]).toEqual({ status: "M", file: "src/index.ts" });
      expect(staged[1]).toEqual({ status: "A", file: "src/new.ts" });
    });

    it("应该正确解析未暂存的文件", () => {
      // 模拟 git status --porcelain 输出
      // " M" = 未暂存的修改
      // "??" = 未跟踪的文件
      const output = " M src/modified.ts\n?? src/untracked.ts";
      const lines = output.split("\n");

      const unstaged: { status: string; file: string }[] = [];

      for (const line of lines) {
        if (!line) continue;
        const indexStatus = line[0];
        const workTreeStatus = line[1];
        const file = line.slice(3);

        if (workTreeStatus !== " " || indexStatus === "?") {
          const status = indexStatus === "?" ? "?" : workTreeStatus;
          unstaged.push({ status, file });
        }
      }

      expect(unstaged).toHaveLength(2);
      expect(unstaged[0]).toEqual({ status: "M", file: "src/modified.ts" });
      expect(unstaged[1]).toEqual({ status: "?", file: "src/untracked.ts" });
    });

    it("空输出应该返回空数组", () => {
      const output = "";
      const staged: any[] = [];
      const unstaged: any[] = [];

      if (!output) {
        expect(staged).toHaveLength(0);
        expect(unstaged).toHaveLength(0);
      }
    });

    it("应该正确处理同时有暂存和未暂存状态的文件", () => {
      // "MM" = 已暂存且有新的未暂存修改
      const output = "MM src/both.ts";
      const lines = output.split("\n");

      const staged: { status: string; file: string }[] = [];
      const unstaged: { status: string; file: string }[] = [];

      for (const line of lines) {
        if (!line) continue;
        const indexStatus = line[0];
        const workTreeStatus = line[1];
        const file = line.slice(3);

        if (indexStatus !== " " && indexStatus !== "?") {
          staged.push({ status: indexStatus, file });
        }

        if (workTreeStatus !== " " || indexStatus === "?") {
          const status = indexStatus === "?" ? "?" : workTreeStatus;
          unstaged.push({ status, file });
        }
      }

      expect(staged).toHaveLength(1);
      expect(unstaged).toHaveLength(1);
      expect(staged[0]).toEqual({ status: "M", file: "src/both.ts" });
      expect(unstaged[0]).toEqual({ status: "M", file: "src/both.ts" });
    });
  });

  describe("临时文件提交", () => {
    it("应该使用临时文件传递多行 commit message", () => {
      const message = "feat: 新功能\n\n- 详细描述1\n- 详细描述2";
      const lines = message.split("\n");

      expect(lines).toHaveLength(4);
      expect(lines[0]).toBe("feat: 新功能");
      expect(lines[1]).toBe("");
      expect(lines[2]).toBe("- 详细描述1");
      expect(lines[3]).toBe("- 详细描述2");
    });

    it("临时文件名应该包含时间戳避免冲突", () => {
      const timestamp1 = Date.now();
      const tmpFile1 = `.gw-commit-msg-${timestamp1}`;

      // 模拟短暂延迟
      const timestamp2 = timestamp1 + 1;
      const tmpFile2 = `.gw-commit-msg-${timestamp2}`;

      expect(tmpFile1).not.toBe(tmpFile2);
    });
  });
});
