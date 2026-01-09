import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import {
  colors,
  TODAY,
  theme,
  exec,
  execOutput,
  checkGitRepo,
  getMainBranch,
  divider,
} from "../src/utils";

// Mock child_process
vi.mock("child_process");

describe("Utils 模块测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("colors 工具", () => {
    it("应该正确添加红色", () => {
      const result = colors.red("error");
      expect(result).toContain("error");
      expect(result).toMatch(/\x1b\[31m.*\x1b\[0m/);
    });

    it("应该正确添加绿色", () => {
      const result = colors.green("success");
      expect(result).toContain("success");
      expect(result).toMatch(/\x1b\[32m.*\x1b\[0m/);
    });

    it("应该正确添加黄色", () => {
      const result = colors.yellow("warning");
      expect(result).toContain("warning");
      expect(result).toMatch(/\x1b\[33m.*\x1b\[0m/);
    });

    it("应该正确添加青色", () => {
      const result = colors.cyan("info");
      expect(result).toContain("info");
      expect(result).toMatch(/\x1b\[36m.*\x1b\[0m/);
    });

    it("应该正确添加暗淡效果", () => {
      const result = colors.dim("dimmed");
      expect(result).toContain("dimmed");
      expect(result).toMatch(/\x1b\[2m.*\x1b\[0m/);
    });

    it("应该正确添加粗体", () => {
      const result = colors.bold("bold");
      expect(result).toContain("bold");
      expect(result).toMatch(/\x1b\[1m.*\x1b\[0m/);
    });

    it("应该有 reset 代码", () => {
      expect(colors.reset).toBe("\x1b[0m");
    });
  });

  describe("TODAY 常量", () => {
    it("应该是 YYYYMMDD 格式", () => {
      expect(TODAY).toMatch(/^\d{8}$/);
    });

    it("应该是今天的日期", () => {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      expect(TODAY).toBe(today);
    });
  });

  describe("exec 函数", () => {
    it("应该执行命令并返回输出", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockReturnValue("output" as any);

      const result = exec("git status", true);

      expect(result).toBe("output");
      expect(mockExecSync).toHaveBeenCalledWith("git status", {
        encoding: "utf-8",
        stdio: "pipe",
      });
    });

    it("静默模式失败时应该返回空字符串", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockImplementation(() => {
        throw new Error("Command failed");
      });

      const result = exec("git status", true);

      expect(result).toBe("");
    });

    it("非静默模式失败时应该抛出错误", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockImplementation(() => {
        throw new Error("Command failed");
      });

      expect(() => exec("git status", false)).toThrow();
    });
  });

  describe("execOutput 函数", () => {
    it("应该执行命令并返回 trim 后的输出", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockReturnValue("  output  \n" as any);

      const result = execOutput("git branch");

      expect(result).toBe("output");
    });

    it("失败时应该返回空字符串", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockImplementation(() => {
        throw new Error("Command failed");
      });

      const result = execOutput("git branch");

      expect(result).toBe("");
    });
  });

  describe("checkGitRepo 函数", () => {
    it("在 git 仓库中应该正常执行", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockReturnValue("true" as any);

      expect(() => checkGitRepo()).not.toThrow();
    });

    it("不在 git 仓库中应该退出", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockImplementation(() => {
        throw new Error("Not a git repository");
      });

      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      expect(() => checkGitRepo()).toThrow("process.exit");
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });

  describe("getMainBranch 函数", () => {
    it("应该返回 origin/main 如果存在", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockReturnValue("  origin/main\n  origin/develop\n" as any);

      const result = getMainBranch();

      expect(result).toBe("origin/main");
    });

    it("应该返回 origin/master 如果 main 不存在", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockReturnValue(
        "  origin/master\n  origin/develop\n" as any
      );

      const result = getMainBranch();

      expect(result).toBe("origin/master");
    });

    it("都不存在时应该默认返回 origin/main", () => {
      const mockExecSync = vi.mocked(execSync);
      mockExecSync.mockReturnValue("  origin/develop\n" as any);

      const result = getMainBranch();

      expect(result).toBe("origin/main");
    });
  });

  describe("divider 函数", () => {
    it("应该输出分隔线", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      divider();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("─".repeat(40))
      );

      consoleSpy.mockRestore();
    });
  });

  describe("theme 对象", () => {
    it("应该有 helpMode 属性", () => {
      expect(theme).toHaveProperty("helpMode");
      expect(theme.helpMode).toBe("always");
    });

    it("应该有 style.keysHelpTip 方法", () => {
      expect(theme.style).toHaveProperty("keysHelpTip");
      expect(typeof theme.style.keysHelpTip).toBe("function");
    });

    it("keysHelpTip 应该格式化按键提示", () => {
      const keys: [string, string][] = [
        ["↑↓", "选择"],
        ["space", "确认"],
      ];
      const result = theme.style.keysHelpTip(keys);

      expect(result).toContain("↑↓ 选择");
      expect(result).toContain("space 确认");
      expect(result).toContain("Ctrl+C quit");
    });
  });
});
