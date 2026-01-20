import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { spawn } from "child_process";

// Mock child_process
vi.mock("child_process", () => ({
  spawn: vi.fn(),
  execSync: vi.fn(),
}));

vi.mock("ora", () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
  })),
}));

describe("带引号的命令参数测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("execAsync 函数", () => {
    it("应该正确处理带引号的 tag 名称", async () => {
      const mockSpawn = vi.mocked(spawn);
      mockSpawn.mockImplementation(((command: string, options: any) => {
        // 验证使用了 shell 模式
        expect(options.shell).toBe(true);

        // 验证命令字符串包含正确的引号
        expect(command).toContain('"v1.5.3"');

        return {
          stderr: {
            on: vi.fn(),
          },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") {
              setTimeout(() => callback(0), 0);
            }
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");
      const result = await execAsync('git tag -a "v1.5.3" -m "Release v1.5.3"');

      expect(result.success).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        'git tag -a "v1.5.3" -m "Release v1.5.3"',
        expect.objectContaining({
          shell: true,
        }),
      );
    });

    it("应该正确处理带空格的分支名称", async () => {
      const mockSpawn = vi.mocked(spawn);
      mockSpawn.mockImplementation(((command: string, options: any) => {
        expect(options.shell).toBe(true);
        expect(command).toContain('"feature/my branch"');

        return {
          stderr: {
            on: vi.fn(),
          },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") {
              setTimeout(() => callback(0), 0);
            }
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");
      const result = await execAsync('git push -u origin "feature/my branch"');

      expect(result.success).toBe(true);
    });

    it("应该正确处理带特殊字符的 commit message", async () => {
      const mockSpawn = vi.mocked(spawn);
      mockSpawn.mockImplementation(((command: string, options: any) => {
        expect(options.shell).toBe(true);
        // 验证特殊字符被正确转义（在命令字符串中是转义的）
        expect(command).toContain('feat: add \\"quotes\\" support');

        return {
          stderr: {
            on: vi.fn(),
          },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") {
              setTimeout(() => callback(0), 0);
            }
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");
      const result = await execAsync(
        'git commit -m "feat: add \\"quotes\\" support"',
      );

      expect(result.success).toBe(true);
    });

    it("应该正确处理带 emoji 的 tag 名称", async () => {
      const mockSpawn = vi.mocked(spawn);
      mockSpawn.mockImplementation(((command: string, options: any) => {
        expect(options.shell).toBe(true);
        expect(command).toContain('"v1.0.0-🎉"');

        return {
          stderr: {
            on: vi.fn(),
          },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") {
              setTimeout(() => callback(0), 0);
            }
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");
      const result = await execAsync('git tag -a "v1.0.0-🎉" -m "Release 🎉"');

      expect(result.success).toBe(true);
    });

    it("应该正确处理带中文的 stash message", async () => {
      const mockSpawn = vi.mocked(spawn);
      mockSpawn.mockImplementation(((command: string, options: any) => {
        expect(options.shell).toBe(true);
        expect(command).toContain('"临时保存：修复bug"');

        return {
          stderr: {
            on: vi.fn(),
          },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") {
              setTimeout(() => callback(0), 0);
            }
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");
      const result = await execAsync('git stash push -m "临时保存：修复bug"');

      expect(result.success).toBe(true);
    });

    it("应该正确捕获错误信息", async () => {
      const mockSpawn = vi.mocked(spawn);
      const errorMessage = "fatal: tag 'v1.5.3' already exists";

      mockSpawn.mockImplementation((() => {
        return {
          stderr: {
            on: vi.fn((event: string, callback: (data: Buffer) => void) => {
              if (event === "data") {
                setTimeout(() => callback(Buffer.from(errorMessage)), 0);
              }
            }),
          },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") {
              setTimeout(() => callback(1), 10);
            }
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");
      const result = await execAsync('git tag -a "v1.5.3" -m "Release v1.5.3"');

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });

    it("应该处理命令执行错误", async () => {
      const mockSpawn = vi.mocked(spawn);

      mockSpawn.mockImplementation((() => {
        return {
          stderr: {
            on: vi.fn(),
          },
          on: vi.fn((event: string, callback: (error?: Error) => void) => {
            if (event === "error") {
              setTimeout(() => callback(new Error("Command not found")), 0);
            }
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");
      const result = await execAsync("invalid-command");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Command not found");
    });
  });

  describe("execWithSpinner 函数", () => {
    it("应该在成功时显示成功消息", async () => {
      const mockSpawn = vi.mocked(spawn);
      mockSpawn.mockImplementation((() => {
        return {
          stderr: {
            on: vi.fn(),
          },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") {
              setTimeout(() => callback(0), 0);
            }
          }),
        } as any;
      }) as any);

      const ora = await import("ora");
      const mockSpinner = {
        start: vi.fn().mockReturnThis(),
        succeed: vi.fn().mockReturnThis(),
        fail: vi.fn().mockReturnThis(),
      };
      vi.mocked(ora.default).mockReturnValue(mockSpinner as any);

      const { execWithSpinner } = await import("../src/utils.js");
      const result = await execWithSpinner(
        'git tag -a "v1.0.0" -m "Release"',
        mockSpinner as any,
        "Tag 创建成功",
        "Tag 创建失败",
      );

      expect(result).toBe(true);
      expect(mockSpinner.succeed).toHaveBeenCalledWith("Tag 创建成功");
    });

    it("应该在失败时显示错误消息和详细信息", async () => {
      const mockSpawn = vi.mocked(spawn);
      const errorMessage = "fatal: Failed to resolve 'HEAD' as a valid ref.";

      mockSpawn.mockImplementation((() => {
        return {
          stderr: {
            on: vi.fn((event: string, callback: (data: Buffer) => void) => {
              if (event === "data") {
                setTimeout(() => callback(Buffer.from(errorMessage)), 0);
              }
            }),
          },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") {
              setTimeout(() => callback(1), 10);
            }
          }),
        } as any;
      }) as any);

      const ora = await import("ora");
      const mockSpinner = {
        start: vi.fn().mockReturnThis(),
        succeed: vi.fn().mockReturnThis(),
        fail: vi.fn().mockReturnThis(),
      };
      vi.mocked(ora.default).mockReturnValue(mockSpinner as any);

      // Mock console.log
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const { execWithSpinner } = await import("../src/utils.js");
      const result = await execWithSpinner(
        'git tag -a "v1.0.0" -m "Release"',
        mockSpinner as any,
        "Tag 创建成功",
        "Tag 创建失败",
      );

      expect(result).toBe(false);
      expect(mockSpinner.fail).toHaveBeenCalledWith("Tag 创建失败");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage),
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe("实际命令场景测试", () => {
    it("tag 命令：创建带特殊字符的 tag", async () => {
      const mockSpawn = vi.mocked(spawn);
      mockSpawn.mockImplementation((() => {
        return {
          stderr: { on: vi.fn() },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") setTimeout(() => callback(0), 0);
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");

      // 测试各种特殊情况
      const testCases = [
        'git tag -a "v1.0.0-beta.1" -m "Release v1.0.0-beta.1"',
        'git tag -a "v1.0.0-rc.1" -m "Release v1.0.0-rc.1"',
        'git tag -a "release/2024-01-20" -m "Release 2024-01-20"',
      ];

      for (const cmd of testCases) {
        const result = await execAsync(cmd);
        expect(result.success).toBe(true);
      }
    });

    it("branch 命令：删除带特殊字符的分支", async () => {
      const mockSpawn = vi.mocked(spawn);
      mockSpawn.mockImplementation((() => {
        return {
          stderr: { on: vi.fn() },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") setTimeout(() => callback(0), 0);
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");

      const testCases = [
        'git branch -D "feature/20240120-123-add-feature"',
        'git push origin --delete "feature/20240120-123-add-feature"',
      ];

      for (const cmd of testCases) {
        const result = await execAsync(cmd);
        expect(result.success).toBe(true);
      }
    });

    it("stash 命令：创建带特殊字符的 stash", async () => {
      const mockSpawn = vi.mocked(spawn);
      mockSpawn.mockImplementation((() => {
        return {
          stderr: { on: vi.fn() },
          on: vi.fn((event: string, callback: (code: number) => void) => {
            if (event === "close") setTimeout(() => callback(0), 0);
          }),
        } as any;
      }) as any);

      const { execAsync } = await import("../src/utils.js");

      const testCases = [
        'git stash push -m "临时保存：修复登录bug"',
        'git stash push -m "WIP: 添加\\"新功能\\""',
        'git stash branch "feature/from-stash" stash@{0}',
      ];

      for (const cmd of testCases) {
        const result = await execAsync(cmd);
        expect(result.success).toBe(true);
      }
    });
  });
});
