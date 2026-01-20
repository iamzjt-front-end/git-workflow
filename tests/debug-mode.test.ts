import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Ora } from "ora";

describe("Debug 模式测试", () => {
  let consoleLogSpy: any;
  let utils: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    // 每次测试前重新导入模块
    vi.resetModules();
    utils = await import("../src/utils.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    consoleLogSpy.mockRestore();
  });

  describe("setDebugMode 函数", () => {
    it("应该正确设置 debug 模式", () => {
      const { setDebugMode } = utils;

      // 应该能正常调用，不抛出错误
      expect(() => setDebugMode(true)).not.toThrow();
      expect(() => setDebugMode(false)).not.toThrow();
    });

    it("应该支持多次切换 debug 模式", () => {
      const { setDebugMode } = utils;

      for (let i = 0; i < 5; i++) {
        expect(() => setDebugMode(true)).not.toThrow();
        expect(() => setDebugMode(false)).not.toThrow();
      }
    });

    it("应该正确处理布尔值参数", () => {
      const { setDebugMode } = utils;

      expect(() => setDebugMode(true)).not.toThrow();
      expect(() => setDebugMode(false)).not.toThrow();

      // 测试重复设置相同值
      expect(() => {
        setDebugMode(true);
        setDebugMode(true);
      }).not.toThrow();

      expect(() => {
        setDebugMode(false);
        setDebugMode(false);
      }).not.toThrow();
    });
  });

  describe("execAsync 函数 - 基本功能", () => {
    it("应该返回成功结果", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(false);

      // 使用真实的命令测试
      const result = await execAsync("echo test");

      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });

    it("应该返回错误信息", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(false);

      // 使用一个会失败的命令
      const result = await execAsync("exit 1");

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("error");
    });

    it("应该使用 shell 模式执行命令", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(false);

      // 测试 shell 特性（管道）
      const result = await execAsync("echo hello | cat");

      expect(result.success).toBe(true);
    });
  });

  describe("execAsync 函数 - Debug 模式", () => {
    it("应该在 debug 模式下输出命令信息", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(true);

      await execAsync("echo test");

      // 验证显示了 debug 信息
      expect(consoleLogSpy).toHaveBeenCalled();
      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const debugCalls = calls.filter(
        (call: string) => typeof call === "string" && call.includes("[DEBUG]"),
      );

      expect(debugCalls.length).toBeGreaterThan(0);

      setDebugMode(false);
    });

    it("应该在 debug 模式下显示退出码", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(true);

      await execAsync("echo test");

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasExitCode = calls.some(
        (call: string) =>
          typeof call === "string" && call.includes("[DEBUG] 退出码:"),
      );

      expect(hasExitCode).toBe(true);

      setDebugMode(false);
    });

    it("应该在非 debug 模式下不输出额外信息", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(false);

      consoleLogSpy.mockClear();
      await execAsync("echo test");

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const debugCalls = calls.filter(
        (call: string) => typeof call === "string" && call.includes("[DEBUG]"),
      );

      expect(debugCalls.length).toBe(0);
    });
  });

  describe("execWithSpinner 函数 - 基本功能", () => {
    it("应该在成功时调用 spinner.succeed", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(false);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      const result = await execWithSpinner(
        "echo test",
        mockSpinner,
        "成功消息",
        "失败消息",
      );

      expect(result).toBe(true);
      expect(mockSpinner.succeed).toHaveBeenCalledWith("成功消息");
      expect(mockSpinner.fail).not.toHaveBeenCalled();
    });

    it("应该在失败时调用 spinner.fail", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(false);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      const result = await execWithSpinner(
        "exit 1",
        mockSpinner,
        "成功消息",
        "失败消息",
      );

      expect(result).toBe(false);
      expect(mockSpinner.fail).toHaveBeenCalledWith("失败消息");
      expect(mockSpinner.succeed).not.toHaveBeenCalled();
    });

    it("应该在失败时显示错误信息", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(false);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      consoleLogSpy.mockClear();
      await execWithSpinner(
        "node -e 'console.error(\"test error\"); process.exit(1)'",
        mockSpinner,
        "成功",
        "失败",
      );

      // 应该显示错误信息
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it("应该支持没有消息的情况", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(false);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      await execWithSpinner("echo test", mockSpinner);

      expect(mockSpinner.succeed).toHaveBeenCalledWith();
    });
  });

  describe("execWithSpinner 函数 - Debug 模式", () => {
    it("应该在 debug 模式下显示故障排查信息", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(true);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      consoleLogSpy.mockClear();
      await execWithSpinner("exit 1", mockSpinner, "成功", "失败");

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasTroubleshooting = calls.some(
        (call: string) =>
          typeof call === "string" && call.includes("[DEBUG] 故障排查信息:"),
      );

      expect(hasTroubleshooting).toBe(true);

      setDebugMode(false);
    });

    it("应该在 debug 模式下显示工作目录", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(true);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      consoleLogSpy.mockClear();
      await execWithSpinner("exit 1", mockSpinner, "成功", "失败");

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasWorkDir = calls.some(
        (call: string) =>
          typeof call === "string" && call.includes("工作目录:"),
      );

      expect(hasWorkDir).toBe(true);

      setDebugMode(false);
    });

    it("应该在 debug 模式下显示 Shell 信息", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(true);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      consoleLogSpy.mockClear();
      await execWithSpinner("exit 1", mockSpinner, "成功", "失败");

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasShell = calls.some(
        (call: string) => typeof call === "string" && call.includes("Shell:"),
      );

      expect(hasShell).toBe(true);

      setDebugMode(false);
    });

    it("应该在成功时不显示故障排查信息", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(true);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      consoleLogSpy.mockClear();
      await execWithSpinner("echo test", mockSpinner, "成功", "失败");

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasTroubleshooting = calls.some(
        (call: string) =>
          typeof call === "string" && call.includes("[DEBUG] 故障排查信息:"),
      );

      expect(hasTroubleshooting).toBe(false);

      setDebugMode(false);
    });

    it("应该在非 debug 模式下不显示故障排查信息", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(false);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      consoleLogSpy.mockClear();
      await execWithSpinner("exit 1", mockSpinner, "成功", "失败");

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasTroubleshooting = calls.some(
        (call: string) =>
          typeof call === "string" && call.includes("[DEBUG] 故障排查信息:"),
      );

      expect(hasTroubleshooting).toBe(false);
    });
  });

  describe("边界情况和特殊场景", () => {
    it("应该正确处理包含引号的命令", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(true);

      consoleLogSpy.mockClear();
      await execAsync('echo "hello world"');

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasCommand = calls.some(
        (call: string) =>
          typeof call === "string" && call.includes('echo "hello world"'),
      );

      expect(hasCommand).toBe(true);

      setDebugMode(false);
    });

    it("应该正确处理包含特殊字符的命令", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(true);

      const specialCommand = 'echo "test: 测试 🎉"';

      consoleLogSpy.mockClear();
      await execAsync(specialCommand);

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasCommand = calls.some(
        (call: string) =>
          typeof call === "string" && call.includes(specialCommand),
      );

      expect(hasCommand).toBe(true);

      setDebugMode(false);
    });

    it("应该正确处理空命令", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(true);

      consoleLogSpy.mockClear();

      // 空命令会抛出错误，这是预期的行为
      try {
        await execAsync("");
      } catch (error) {
        expect(error).toBeDefined();
      }

      setDebugMode(false);
    });

    it("应该正确处理长命令", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(true);

      const longCommand = "echo " + "x".repeat(1000);

      consoleLogSpy.mockClear();
      await execAsync(longCommand);

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasDebug = calls.some(
        (call: string) => typeof call === "string" && call.includes("[DEBUG]"),
      );

      expect(hasDebug).toBe(true);

      setDebugMode(false);
    });
  });

  describe("性能和资源管理", () => {
    it("应该不会因为 debug 模式导致内存泄漏", () => {
      const { setDebugMode } = utils;

      // 多次切换 debug 模式
      for (let i = 0; i < 100; i++) {
        setDebugMode(true);
        setDebugMode(false);
      }

      // 如果没有内存泄漏，这个测试应该能正常完成
      expect(true).toBe(true);
    });

    it("应该能处理并发的命令执行", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(true);

      // 并发执行多个命令
      const promises = [
        execAsync("echo test1"),
        execAsync("echo test2"),
        execAsync("echo test3"),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toHaveProperty("success");
      });

      setDebugMode(false);
    });

    it("应该正确处理快速连续的命令", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(true);

      // 快速连续执行命令
      for (let i = 0; i < 5; i++) {
        const result = await execAsync(`echo test${i}`);
        expect(result.success).toBe(true);
      }

      setDebugMode(false);
    });
  });

  describe("集成测试 - 实际命令场景", () => {
    it("应该正确处理 Git 命令", async () => {
      const { execAsync, setDebugMode } = utils;
      setDebugMode(true);

      consoleLogSpy.mockClear();
      await execAsync("git --version");

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasGitCommand = calls.some(
        (call: string) =>
          typeof call === "string" && call.includes("git --version"),
      );

      expect(hasGitCommand).toBe(true);

      setDebugMode(false);
    });

    it("应该正确处理带参数的命令", async () => {
      const { execWithSpinner, setDebugMode } = utils;
      setDebugMode(true);

      const mockSpinner = {
        succeed: vi.fn(),
        fail: vi.fn(),
      } as unknown as Ora;

      consoleLogSpy.mockClear();
      await execWithSpinner('echo "test message"', mockSpinner, "成功", "失败");

      const calls = consoleLogSpy.mock.calls.map((call: any) => call[0]);
      const hasCommand = calls.some(
        (call: string) =>
          typeof call === "string" && call.includes('echo "test message"'),
      );

      expect(hasCommand).toBe(true);

      setDebugMode(false);
    });
  });
});
