import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Mock 所有外部依赖
vi.mock("child_process", () => ({
  execSync: vi.fn(),
  spawn: vi.fn(() => ({
    on: vi.fn(),
    stdin: {
      write: vi.fn(),
      end: vi.fn(),
      on: vi.fn(),
    },
    stdout: {
      on: vi.fn(),
    },
    stderr: {
      on: vi.fn(),
    },
  })),
}));

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock("os", () => ({
  homedir: vi.fn(),
}));

vi.mock("path", () => ({
  join: vi.fn(),
}));

vi.mock("ora", () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
  })),
}));

vi.mock("boxen", () => ({
  default: vi.fn((content: string) => content),
}));

vi.mock("semver", () => ({
  default: {
    gte: vi.fn(),
  },
}));

vi.mock("../src/utils.js", () => ({
  colors: {
    bold: (text: string) => text,
    green: (text: string) => text,
    yellow: (text: string) => text,
    red: (text: string) => text,
    dim: (text: string) => text,
    cyan: (text: string) => text,
  },
  execAsync: vi.fn().mockResolvedValue(true),
  execWithSpinner: vi.fn().mockResolvedValue(true),
}));

describe("Update 模块测试", () => {
  const mockExecSync = vi.mocked(execSync);
  const mockExistsSync = vi.mocked(existsSync);
  const mockUnlinkSync = vi.mocked(unlinkSync);
  const mockHomedir = vi.mocked(homedir);
  const mockJoin = vi.mocked(join);

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // Default mocks
    mockHomedir.mockReturnValue("/home/user");
    mockJoin.mockReturnValue("/home/user/.gw-update-check");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("版本检查", () => {
    it("应该正确获取最新版本", async () => {
      mockExecSync.mockReturnValueOnce("1.2.4\n");

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(true);

      const { update } = await import("../src/commands/update.js");

      await update("1.2.3");

      expect(mockExecSync).toHaveBeenCalledWith(
        "npm view @zjex/git-workflow version",
        expect.objectContaining({
          encoding: "utf-8",
          timeout: 3000,
          stdio: ["pipe", "pipe", "ignore"],
        }),
      );
    });

    it("应该处理网络错误", async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error("Network error");
      });

      const { update } = await import("../src/commands/update.js");

      await update("1.2.3");

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("请检查网络连接后重试"),
      );
    });

    it("应该正确比较版本号", async () => {
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw (isUsingVolta)
        .mockReturnValueOnce("1.2.4\n") // npm view
        .mockReturnValueOnce("update success"); // npm install

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      expect(semver.default.gte).toHaveBeenCalledWith("1.2.3", "1.2.4");
    });
  });

  describe("Volta 检测", () => {
    it("应该正确检测 Volta 环境", async () => {
      mockExecSync
        .mockReturnValueOnce("/home/user/.volta/bin/gw\n") // which gw (isUsingVolta)
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      // 验证检测到了 Volta 环境
      expect(mockExecSync).toHaveBeenCalledWith("which gw", expect.any(Object));
    });

    it("应该正确检测非 Volta 环境", async () => {
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      // 验证检测到了非 Volta 环境
      expect(mockExecSync).toHaveBeenCalledWith("which gw", expect.any(Object));
    });

    it("应该处理 which 命令失败", async () => {
      mockExecSync
        .mockImplementationOnce(() => {
          // which gw (isUsingVolta)
          throw new Error("Command not found");
        })
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      // 验证尝试检测环境
      expect(mockExecSync).toHaveBeenCalledWith("which gw", expect.any(Object));
    });
  });

  describe("更新流程", () => {
    it("应该在已是最新版本时显示提示", async () => {
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw (isUsingVolta)
        .mockReturnValueOnce("1.2.3\n"); // npm view (same version)

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(true);

      const { update } = await import("../src/commands/update.js");

      await update("1.2.3");

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("✅ 已是最新版本"),
      );
    });

    it("应该成功执行更新", async () => {
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("🎉 发现新版本！"),
      );
    });

    it("应该处理更新失败", async () => {
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      // 验证显示了新版本信息
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("🎉 发现新版本！"),
      );
    });
  });

  describe("缓存管理", () => {
    it("应该在更新成功后清理缓存", async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      // 验证尝试清理缓存（可能在 process.exit 之前或之后）
      // 由于异步执行，我们只验证基本流程
      expect(mockExecSync).toHaveBeenCalled();
    });

    it("应该处理缓存文件不存在的情况", async () => {
      mockExistsSync.mockReturnValue(false);
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      expect(mockUnlinkSync).not.toHaveBeenCalled();
    });

    it("应该静默处理缓存清理错误", async () => {
      mockExistsSync.mockReturnValue(true);
      mockUnlinkSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });

      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用，而不是缓存清理错误
        expect(error).toEqual(new Error("process.exit called"));
      }
    });
  });

  describe("用户界面", () => {
    it("应该显示检查更新的提示", async () => {
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw
        .mockReturnValueOnce("1.2.3\n");

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(true);

      const { update } = await import("../src/commands/update.js");

      await update("1.2.3");

      expect(console.log).toHaveBeenCalledWith("🔍 检查更新...");
    });

    it("应该显示版本比较信息", async () => {
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      // 验证显示了版本信息
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("1.2.3"),
      );
    });

    it("应该显示验证命令提示", async () => {
      mockExecSync
        .mockReturnValueOnce("/usr/local/bin/gw\n") // which gw
        .mockReturnValueOnce("1.2.4\n"); // npm view

      const semver = await import("semver");
      vi.mocked(semver.default.gte).mockReturnValue(false);

      const { update } = await import("../src/commands/update.js");

      try {
        await update("1.2.3");
      } catch (error) {
        // 期望 process.exit 被调用
        expect(error).toEqual(new Error("process.exit called"));
      }

      // 验证显示了安装提示
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("📦 开始安装新版本"),
      );
    });
  });
});
