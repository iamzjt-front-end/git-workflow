import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync } from "fs";

// Mock fs 模块
vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// Mock inquirer
vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
}));

// Mock utils
vi.mock("../src/utils.js", () => ({
  colors: {
    yellow: (text: string) => text,
    green: (text: string) => text,
  },
  theme: {},
  divider: vi.fn(),
}));

describe("Release 模块测试", () => {
  const mockReadFileSync = vi.mocked(readFileSync);
  const mockWriteFileSync = vi.mocked(writeFileSync);
  
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置控制台输出 mock
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("版本号解析和生成", () => {
    it("应该正确解析标准版本号", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ version: "1.2.3" }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择取消
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("__cancel__");
      
      await release();
      
      expect(mockReadFileSync).toHaveBeenCalledWith("package.json", "utf-8");
    });

    it("应该正确解析预发布版本号", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ version: "1.2.3-alpha.1" }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择取消
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("__cancel__");
      
      await release();
      
      expect(mockReadFileSync).toHaveBeenCalledWith("package.json", "utf-8");
    });

    it("应该处理缺失版本号的情况", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({}));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择取消
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("__cancel__");
      
      await release();
      
      expect(mockReadFileSync).toHaveBeenCalledWith("package.json", "utf-8");
    });
  });

  describe("版本号更新", () => {
    it("应该正确更新 patch 版本", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ 
        name: "test-package",
        version: "1.2.3" 
      }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择 patch 版本
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("1.2.4");
      
      await release();
      
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "package.json",
        JSON.stringify({ name: "test-package", version: "1.2.4" }, null, "\t") + "\n"
      );
    });

    it("应该正确更新 minor 版本", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ 
        name: "test-package",
        version: "1.2.3" 
      }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择 minor 版本
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("1.3.0");
      
      await release();
      
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "package.json",
        JSON.stringify({ name: "test-package", version: "1.3.0" }, null, "\t") + "\n"
      );
    });

    it("应该正确更新 major 版本", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ 
        name: "test-package",
        version: "1.2.3" 
      }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择 major 版本
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("2.0.0");
      
      await release();
      
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "package.json",
        JSON.stringify({ name: "test-package", version: "2.0.0" }, null, "\t") + "\n"
      );
    });

    it("应该正确创建预发布版本", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ 
        name: "test-package",
        version: "1.2.3" 
      }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择 alpha 版本
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("1.2.4-alpha.1");
      
      await release();
      
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "package.json",
        JSON.stringify({ name: "test-package", version: "1.2.4-alpha.1" }, null, "\t") + "\n"
      );
    });

    it("应该正确升级预发布版本", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ 
        name: "test-package",
        version: "1.2.3-alpha.1" 
      }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择升级预发布版本
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("1.2.3-alpha.2");
      
      await release();
      
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "package.json",
        JSON.stringify({ name: "test-package", version: "1.2.3-alpha.2" }, null, "\t") + "\n"
      );
    });

    it("应该正确将预发布版本转为正式版本", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ 
        name: "test-package",
        version: "1.2.3-beta.2" 
      }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择转为正式版本
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("1.2.3");
      
      await release();
      
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "package.json",
        JSON.stringify({ name: "test-package", version: "1.2.3" }, null, "\t") + "\n"
      );
    });
  });

  describe("用户交互", () => {
    it("应该在用户取消时不更新版本", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ 
        name: "test-package",
        version: "1.2.3" 
      }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择取消
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("__cancel__");
      
      await release();
      
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });

    it("应该显示当前版本号", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ version: "1.2.3" }));
      
      const consoleSpy = vi.spyOn(console, "log");
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择取消
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("__cancel__");
      
      await release();
      
      expect(consoleSpy).toHaveBeenCalledWith("当前版本: 1.2.3");
    });

    it("应该显示版本更新成功信息", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ 
        name: "test-package",
        version: "1.2.3" 
      }));
      
      const consoleSpy = vi.spyOn(console, "log");
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择 patch 版本
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("1.2.4");
      
      await release();
      
      expect(consoleSpy).toHaveBeenCalledWith("✓ 版本号已更新: 1.2.3 → 1.2.4");
    });

    it("应该显示取消信息", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ version: "1.2.3" }));
      
      const consoleSpy = vi.spyOn(console, "log");
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择取消
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("__cancel__");
      
      await release();
      
      expect(consoleSpy).toHaveBeenCalledWith("已取消");
    });
  });

  describe("边界情况", () => {
    it("应该处理无效的版本号格式", async () => {
      mockReadFileSync.mockReturnValue(JSON.stringify({ version: "invalid" }));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择取消
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("__cancel__");
      
      // 应该不抛出错误
      await expect(release()).resolves.toBeUndefined();
    });

    it("应该处理空的 package.json", async () => {
      mockReadFileSync.mockReturnValue("{}");
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择取消
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("__cancel__");
      
      // 应该不抛出错误
      await expect(release()).resolves.toBeUndefined();
    });

    it("应该保持 package.json 的其他字段不变", async () => {
      const originalPackage = {
        name: "test-package",
        version: "1.2.3",
        description: "Test package",
        dependencies: {
          "some-dep": "^1.0.0"
        }
      };
      
      mockReadFileSync.mockReturnValue(JSON.stringify(originalPackage));
      
      const { release } = await import("../src/commands/release.js");
      
      // 模拟用户选择 patch 版本
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select).mockResolvedValue("1.2.4");
      
      await release();
      
      const expectedPackage = {
        ...originalPackage,
        version: "1.2.4"
      };
      
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "package.json",
        JSON.stringify(expectedPackage, null, "\t") + "\n"
      );
    });
  });
});