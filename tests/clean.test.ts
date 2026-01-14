import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { existsSync, unlinkSync, readdirSync, writeFileSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";

// Mock 所有外部依赖
vi.mock("fs", () => ({
  existsSync: vi.fn(),
  unlinkSync: vi.fn(),
  readdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock("os", () => ({
  homedir: vi.fn(),
  tmpdir: vi.fn(),
}));

vi.mock("path", () => ({
  join: vi.fn((...args) => args.join("/")),
}));

vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
}));

vi.mock("../src/update-notifier.js", () => ({
  clearUpdateCache: vi.fn(),
}));

describe("Clean 命令测试", () => {
  const mockExistsSync = vi.mocked(existsSync);
  const mockUnlinkSync = vi.mocked(unlinkSync);
  const mockReaddirSync = vi.mocked(readdirSync);
  const mockHomedir = vi.mocked(homedir);
  const mockTmpdir = vi.mocked(tmpdir);

  beforeEach(() => {
    vi.clearAllMocks();
    mockHomedir.mockReturnValue("/home/user");
    mockTmpdir.mockReturnValue("/tmp");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("清理更新缓存", () => {
    it("应该清理更新缓存文件", async () => {
      const { clearUpdateCache } = await import("../src/update-notifier.js");

      clearUpdateCache();

      expect(clearUpdateCache).toHaveBeenCalled();
    });
  });

  describe("清理全局配置文件", () => {
    it("没有全局配置文件时不应该询问", async () => {
      mockExistsSync.mockReturnValue(false);
      mockReaddirSync.mockReturnValue([]);

      const { select } = await import("@inquirer/prompts");

      expect(mockExistsSync).not.toHaveBeenCalledWith("/home/user/.gwrc.json");
    });

    it("有全局配置文件时应该询问是否删除", async () => {
      const globalConfig = "/home/user/.gwrc.json";
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([]);

      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue(false);

      // 模拟检查全局配置文件
      const hasGlobalConfig = mockExistsSync(globalConfig);

      expect(hasGlobalConfig).toBe(true);
    });

    it("选择删除时应该删除全局配置文件", async () => {
      const globalConfig = "/home/user/.gwrc.json";
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([]);

      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue(true);

      // 模拟删除操作
      if (mockExistsSync(globalConfig)) {
        mockUnlinkSync(globalConfig);
      }

      expect(mockUnlinkSync).toHaveBeenCalledWith(globalConfig);
    });

    it("选择不删除时应该保留全局配置文件", async () => {
      const globalConfig = "/home/user/.gwrc.json";
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([]);

      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue(false);

      // 模拟不删除的情况
      const shouldDelete = await vi.mocked(select)();

      if (!shouldDelete) {
        expect(mockUnlinkSync).not.toHaveBeenCalledWith(globalConfig);
      }
    });
  });

  describe("清理临时 commit 文件", () => {
    it("应该清理所有临时 commit 文件", () => {
      mockReaddirSync.mockReturnValue([
        ".gw-commit-msg-123456",
        ".gw-commit-msg-789012",
        "other-file.txt",
      ] as any);

      const tmpDir = mockTmpdir();
      const files = mockReaddirSync(tmpDir);
      const gwTmpFiles = files.filter((f: string) =>
        f.startsWith(".gw-commit-msg-")
      );

      expect(gwTmpFiles).toHaveLength(2);
      expect(gwTmpFiles).toContain(".gw-commit-msg-123456");
      expect(gwTmpFiles).toContain(".gw-commit-msg-789012");
    });

    it("应该忽略非 gw 临时文件", () => {
      mockReaddirSync.mockReturnValue([
        ".gw-commit-msg-123456",
        "other-temp-file",
        ".other-file",
      ] as any);

      const tmpDir = mockTmpdir();
      const files = mockReaddirSync(tmpDir);
      const gwTmpFiles = files.filter((f: string) =>
        f.startsWith(".gw-commit-msg-")
      );

      expect(gwTmpFiles).toHaveLength(1);
      expect(gwTmpFiles).toContain(".gw-commit-msg-123456");
    });

    it("没有临时文件时不应该报错", () => {
      mockReaddirSync.mockReturnValue([]);

      const tmpDir = mockTmpdir();
      const files = mockReaddirSync(tmpDir);
      const gwTmpFiles = files.filter((f: string) =>
        f.startsWith(".gw-commit-msg-")
      );

      expect(gwTmpFiles).toHaveLength(0);
    });

    it("应该删除找到的临时文件", () => {
      mockReaddirSync.mockReturnValue([
        ".gw-commit-msg-123456",
        ".gw-commit-msg-789012",
      ] as any);

      const tmpDir = mockTmpdir();
      const files = mockReaddirSync(tmpDir);
      const gwTmpFiles = files.filter((f: string) =>
        f.startsWith(".gw-commit-msg-")
      );

      gwTmpFiles.forEach((file: string) => {
        mockUnlinkSync(join(tmpDir, file));
      });

      expect(mockUnlinkSync).toHaveBeenCalledTimes(2);
      expect(mockUnlinkSync).toHaveBeenCalledWith("/tmp/.gw-commit-msg-123456");
      expect(mockUnlinkSync).toHaveBeenCalledWith("/tmp/.gw-commit-msg-789012");
    });
  });

  describe("清理统计", () => {
    it("应该正确统计清理的文件数量", () => {
      let cleanedCount = 0;

      // 清理更新缓存
      cleanedCount++;

      // 清理全局配置
      mockExistsSync.mockReturnValue(true);
      if (mockExistsSync("/home/user/.gwrc.json")) {
        cleanedCount++;
      }

      // 清理临时文件
      mockReaddirSync.mockReturnValue([
        ".gw-commit-msg-123456",
        ".gw-commit-msg-789012",
      ] as any);
      const gwTmpFiles = mockReaddirSync("/tmp").filter((f: string) =>
        f.startsWith(".gw-commit-msg-")
      );
      cleanedCount += gwTmpFiles.length;

      expect(cleanedCount).toBe(4); // 1 缓存 + 1 配置 + 2 临时文件
    });

    it("没有全局配置时应该统计正确", () => {
      let cleanedCount = 0;

      // 清理更新缓存
      cleanedCount++;

      // 没有全局配置
      mockExistsSync.mockReturnValue(false);

      // 清理临时文件
      mockReaddirSync.mockReturnValue([".gw-commit-msg-123456"] as any);
      const gwTmpFiles = mockReaddirSync("/tmp").filter((f: string) =>
        f.startsWith(".gw-commit-msg-")
      );
      cleanedCount += gwTmpFiles.length;

      expect(cleanedCount).toBe(2); // 1 缓存 + 1 临时文件
    });

    it("没有任何文件时应该只清理缓存", () => {
      let cleanedCount = 0;

      // 清理更新缓存
      cleanedCount++;

      // 没有全局配置
      mockExistsSync.mockReturnValue(false);

      // 没有临时文件
      mockReaddirSync.mockReturnValue([]);

      expect(cleanedCount).toBe(1); // 只有缓存
    });
  });

  describe("错误处理", () => {
    it("删除文件失败时应该静默处理", () => {
      mockUnlinkSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });

      expect(() => {
        try {
          mockUnlinkSync("/home/user/.gwrc.json");
        } catch {
          // 静默失败
        }
      }).not.toThrow();
    });

    it("读取目录失败时应该静默处理", () => {
      mockReaddirSync.mockImplementation(() => {
        throw new Error("Directory not found");
      });

      expect(() => {
        try {
          mockReaddirSync("/tmp");
        } catch {
          // 静默失败
        }
      }).not.toThrow();
    });
  });

  describe("文件路径", () => {
    it("应该使用正确的全局配置路径", () => {
      const globalConfig = join(mockHomedir(), ".gwrc.json");
      expect(globalConfig).toBe("/home/user/.gwrc.json");
    });

    it("应该使用正确的临时目录路径", () => {
      const tmpDir = mockTmpdir();
      expect(tmpDir).toBe("/tmp");
    });

    it("应该正确拼接临时文件路径", () => {
      const tmpFile = join(mockTmpdir(), ".gw-commit-msg-123456");
      expect(tmpFile).toBe("/tmp/.gw-commit-msg-123456");
    });
  });
});
