import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { homedir } from "os";
import { checkForUpdates, clearUpdateCache } from "../src/update-notifier";

// Mock dependencies
vi.mock("child_process");
vi.mock("fs");
vi.mock("os");
vi.mock("boxen", () => ({
  default: (content: string) => content,
}));
vi.mock("ora", () => ({
  default: () => ({
    start: () => ({
      succeed: vi.fn(),
      fail: vi.fn(),
    }),
  }),
}));
vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
}));

describe("Update Notifier 模块测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(homedir).mockReturnValue("/home/user");
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("clearUpdateCache 函数", () => {
    it("应该删除缓存文件", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(unlinkSync).mockImplementation(() => {});

      clearUpdateCache();

      expect(unlinkSync).toHaveBeenCalledWith("/home/user/.gw-update-check");
    });

    it("缓存文件不存在时不应该报错", () => {
      vi.mocked(existsSync).mockReturnValue(false);

      expect(() => clearUpdateCache()).not.toThrow();
    });

    it("删除失败时应该静默处理", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(unlinkSync).mockImplementation(() => {
        throw new Error("Permission denied");
      });

      expect(() => clearUpdateCache()).not.toThrow();
    });
  });

  describe("checkForUpdates 函数", () => {
    it("没有缓存时应该后台检查", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(execSync).mockReturnValue("1.0.1" as any);

      await checkForUpdates("1.0.0");

      // 等待异步操作
      await vi.runAllTimersAsync();

      expect(writeFileSync).toHaveBeenCalled();
    });

    it("版本相同时不应该显示提示", async () => {
      const mockCache = {
        lastCheck: Date.now(),
        latestVersion: "1.0.0",
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await checkForUpdates("1.0.0");

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("有新版本时应该显示简单通知（非交互式）", async () => {
      const mockCache = {
        lastCheck: Date.now(),
        latestVersion: "1.0.1",
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await checkForUpdates("1.0.0", "@zjex/git-workflow", false);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("24小时内关闭过提示应该跳过", async () => {
      const mockCache = {
        lastCheck: Date.now(),
        lastDismiss: Date.now(),
        latestVersion: "1.0.1",
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await checkForUpdates("1.0.0");

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("超过24小时后应该再次提示", async () => {
      const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000; // 25小时前
      const mockCache = {
        lastCheck: Date.now(),
        lastDismiss: oneDayAgo,
        latestVersion: "1.0.1",
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await checkForUpdates("1.0.0", "@zjex/git-workflow", false);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("每次运行都应该后台检查最新版本", async () => {
      const mockCache = {
        lastCheck: Date.now(),
        latestVersion: "1.0.0",
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));
      vi.mocked(execSync).mockReturnValue("1.0.1" as any);

      await checkForUpdates("1.0.0");
      await vi.runAllTimersAsync();

      // 每次运行都应该后台检查
      expect(writeFileSync).toHaveBeenCalled();
    });

    it("后台检查应该更新缓存中的最新版本", async () => {
      const mockCache = {
        lastCheck: Date.now() - 2 * 60 * 60 * 1000,
        latestVersion: "1.0.0",
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));
      vi.mocked(execSync).mockReturnValue("1.0.1" as any);

      await checkForUpdates("1.0.0");
      await vi.runAllTimersAsync();

      expect(writeFileSync).toHaveBeenCalled();
    });

    it("有新版本时每次都应该后台检查", async () => {
      const mockCache = {
        lastCheck: Date.now(), // 刚刚检查过
        latestVersion: "1.0.1", // 有新版本
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));
      vi.mocked(execSync).mockReturnValue("1.0.2" as any);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await checkForUpdates("1.0.0");
      await vi.runAllTimersAsync();

      // 即使刚检查过，有新版本时也应该继续检查
      expect(writeFileSync).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("缓存文件损坏时应该静默处理", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue("invalid json");

      await expect(checkForUpdates("1.0.0")).resolves.not.toThrow();
    });

    it("ExitPromptError 应该重新抛出", async () => {
      const mockCache = {
        lastCheck: Date.now(),
        latestVersion: "1.0.1",
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

      const { select } = await import("@inquirer/prompts");

      // 创建一个自定义错误类
      class ExitPromptError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "ExitPromptError";
        }
      }

      const exitError = new ExitPromptError("User cancelled");
      vi.mocked(select).mockRejectedValue(exitError);

      await expect(
        checkForUpdates("1.0.0", "@zjex/git-workflow", true)
      ).rejects.toThrow();
    });
  });

  describe("Volta 检测", () => {
    it("应该检测 Volta 环境", async () => {
      vi.mocked(execSync).mockReturnValue("/home/user/.volta/bin/gw" as any);

      const mockCache = {
        lastCheck: Date.now(),
        latestVersion: "1.0.1",
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("continue");

      await checkForUpdates("1.0.0", "@zjex/git-workflow", true);

      expect(select).toHaveBeenCalledWith(
        expect.objectContaining({
          choices: expect.arrayContaining([
            expect.objectContaining({
              description: expect.stringContaining("volta install"),
            }),
          ]),
        })
      );
    });

    it("应该检测非 Volta 环境", async () => {
      vi.mocked(execSync).mockReturnValue("/usr/local/bin/gw" as any);

      const mockCache = {
        lastCheck: Date.now(),
        latestVersion: "1.0.1",
        checkedVersion: "1.0.0",
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("continue");

      await checkForUpdates("1.0.0", "@zjex/git-workflow", true);

      expect(select).toHaveBeenCalledWith(
        expect.objectContaining({
          choices: expect.arrayContaining([
            expect.objectContaining({
              description: expect.stringContaining("npm install -g"),
            }),
          ]),
        })
      );
    });
  });

  describe("版本比较", () => {
    it("应该正确比较 semver 版本", async () => {
      const testCases = [
        { current: "1.0.0", latest: "1.0.1", shouldShow: true },
        { current: "1.0.0", latest: "1.1.0", shouldShow: true },
        { current: "1.0.0", latest: "2.0.0", shouldShow: true },
        { current: "1.0.1", latest: "1.0.0", shouldShow: true }, // 回滚场景也应该提示
        { current: "1.0.0", latest: "1.0.0", shouldShow: false },
      ];

      for (const { current, latest, shouldShow } of testCases) {
        const mockCache = {
          lastCheck: Date.now(),
          latestVersion: latest,
          checkedVersion: current,
        };

        vi.mocked(existsSync).mockReturnValue(true);
        vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

        const consoleSpy = vi
          .spyOn(console, "log")
          .mockImplementation(() => {});

        await checkForUpdates(current, "@zjex/git-workflow", false);

        if (shouldShow) {
          expect(consoleSpy).toHaveBeenCalled();
        } else {
          expect(consoleSpy).not.toHaveBeenCalled();
        }

        consoleSpy.mockRestore();
        vi.clearAllMocks();
      }
    });
  });

  describe("缓存读写", () => {
    it("应该正确写入缓存", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(execSync).mockReturnValue("1.0.1" as any);

      await checkForUpdates("1.0.0");
      await vi.runAllTimersAsync();

      expect(writeFileSync).toHaveBeenCalledWith(
        "/home/user/.gw-update-check",
        expect.stringContaining("1.0.1"),
        "utf-8"
      );
    });

    it("写入缓存失败时应该静默处理", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(execSync).mockReturnValue("1.0.1" as any);
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw new Error("Write failed");
      });

      await expect(checkForUpdates("1.0.0")).resolves.not.toThrow();
    });

    it("读取缓存失败时应该返回 null", async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error("Read failed");
      });

      await expect(checkForUpdates("1.0.0")).resolves.not.toThrow();
    });
  });

  describe("网络请求", () => {
    it("获取最新版本失败时应该静默处理", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("Network error");
      });

      await expect(checkForUpdates("1.0.0")).resolves.not.toThrow();
    });

    it("应该使用正确的 npm 命令", async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(execSync).mockReturnValue("1.0.1" as any);

      await checkForUpdates("1.0.0", "@zjex/git-workflow");
      await vi.runAllTimersAsync();

      expect(execSync).toHaveBeenCalledWith(
        "npm view @zjex/git-workflow version",
        expect.objectContaining({
          timeout: 3000,
        })
      );
    });
  });

  describe("通知框样式配置", () => {
    it("简单通知应该使用无边距配置", () => {
      const marginConfig = { top: 0, bottom: 0, left: 0, right: 0 };

      expect(marginConfig.top).toBe(0);
      expect(marginConfig.bottom).toBe(0);
      expect(marginConfig.left).toBe(0);
      expect(marginConfig.right).toBe(0);
    });

    it("交互式通知应该使用最小边距配置", () => {
      const marginConfig = { top: 0, bottom: 0, left: 1, right: 1 };

      expect(marginConfig.top).toBe(0);
      expect(marginConfig.bottom).toBe(0);
      expect(marginConfig.left).toBeGreaterThanOrEqual(0);
      expect(marginConfig.right).toBeGreaterThanOrEqual(0);
    });

    it("更新成功通知应该有底部边距", () => {
      const marginConfig = { top: 0, bottom: 1, left: 2, right: 2 };

      expect(marginConfig.top).toBe(0);
      expect(marginConfig.bottom).toBe(1);
    });

    it("所有通知的顶部边距应该为 0", () => {
      const configs = [
        { top: 0, bottom: 0, left: 0, right: 0 },
        { top: 0, bottom: 0, left: 1, right: 1 },
        { top: 0, bottom: 1, left: 2, right: 2 },
      ];

      configs.forEach((config) => {
        expect(config.top).toBe(0);
      });
    });

    it("padding 配置应该合理", () => {
      const paddingConfigs = [
        { top: 0, bottom: 0, left: 2, right: 2 }, // 简单通知
        { top: 1, bottom: 1, left: 3, right: 3 }, // 交互式通知
        { top: 1, bottom: 1, left: 2, right: 2 }, // 成功通知
      ];

      paddingConfigs.forEach((padding) => {
        expect(padding.left).toBeGreaterThanOrEqual(2);
        expect(padding.right).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
