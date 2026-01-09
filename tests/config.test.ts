import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { loadConfig, getConfig } from "../src/config";
import { execOutput } from "../src/utils";

// Mock dependencies
vi.mock("fs");
vi.mock("os");
vi.mock("../src/utils");

describe("Config 模块测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock homedir to return a valid path
    vi.mocked(homedir).mockReturnValue("/home/user");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("默认配置", () => {
    it("应该返回默认配置", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(execOutput).mockReturnValue("");

      const config = loadConfig();

      expect(config).toMatchObject({
        featurePrefix: "feature",
        hotfixPrefix: "hotfix",
        requireId: false,
        featureIdLabel: "Story ID",
        hotfixIdLabel: "Issue ID",
        autoStage: true,
        useEmoji: true,
      });
    });
  });

  describe("项目配置", () => {
    it("应该加载 .gwrc.json 配置", () => {
      const mockConfig = {
        featurePrefix: "feat",
        requireId: true,
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        return path === ".gwrc.json";
      });

      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));
      vi.mocked(execOutput).mockReturnValue("");

      const config = loadConfig();

      expect(config.featurePrefix).toBe("feat");
      expect(config.requireId).toBe(true);
    });

    it("应该加载 .gwrc 配置", () => {
      const mockConfig = {
        hotfixPrefix: "fix",
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        return path === ".gwrc";
      });

      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));
      vi.mocked(execOutput).mockReturnValue("");

      const config = loadConfig();

      expect(config.hotfixPrefix).toBe("fix");
    });

    it("应该加载 gw.config.json 配置", () => {
      const mockConfig = {
        autoPush: true,
      };

      vi.mocked(existsSync).mockImplementation((path) => {
        return path === "gw.config.json";
      });

      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));
      vi.mocked(execOutput).mockReturnValue("");

      const config = loadConfig();

      expect(config.autoPush).toBe(true);
    });
  });

  describe("全局配置", () => {
    it("应该加载全局配置", () => {
      const mockGlobalConfig = {
        aiCommit: {
          enabled: true,
          provider: "github" as const,
          apiKey: "test-key",
        },
      };

      vi.mocked(homedir).mockReturnValue("/home/user");
      vi.mocked(existsSync).mockImplementation((path) => {
        return path === "/home/user/.gwrc.json";
      });

      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockGlobalConfig));
      vi.mocked(execOutput).mockReturnValue("");

      const config = loadConfig();

      expect(config.aiCommit?.enabled).toBe(true);
      expect(config.aiCommit?.provider).toBe("github");
      expect(config.aiCommit?.apiKey).toBe("test-key");
    });
  });

  describe("配置合并", () => {
    it("项目配置应该覆盖全局配置", () => {
      const mockGlobalConfig = {
        featurePrefix: "global-feature",
        requireId: false,
      };

      const mockProjectConfig = {
        featurePrefix: "project-feature",
      };

      vi.mocked(homedir).mockReturnValue("/home/user");
      vi.mocked(existsSync).mockImplementation((path) => {
        if (path === "/home/user/.gwrc.json") return true;
        if (path === ".gwrc.json") return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (path === "/home/user/.gwrc.json") {
          return JSON.stringify(mockGlobalConfig);
        }
        if (path === ".gwrc.json") {
          return JSON.stringify(mockProjectConfig);
        }
        return "{}";
      });

      vi.mocked(execOutput).mockReturnValue("");

      const config = loadConfig();

      expect(config.featurePrefix).toBe("project-feature");
      expect(config.requireId).toBe(false);
    });

    it("应该深度合并 aiCommit 配置", () => {
      const mockGlobalConfig = {
        aiCommit: {
          enabled: true,
          provider: "github" as const,
          apiKey: "global-key",
          language: "zh-CN" as const,
        },
      };

      const mockProjectConfig = {
        aiCommit: {
          provider: "openai" as const,
          model: "gpt-4",
        },
      };

      vi.mocked(homedir).mockReturnValue("/home/user");
      vi.mocked(existsSync).mockImplementation((path) => {
        if (path === "/home/user/.gwrc.json") return true;
        if (path === ".gwrc.json") return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (path === "/home/user/.gwrc.json") {
          return JSON.stringify(mockGlobalConfig);
        }
        if (path === ".gwrc.json") {
          return JSON.stringify(mockProjectConfig);
        }
        return "{}";
      });

      vi.mocked(execOutput).mockReturnValue("");

      const config = loadConfig();

      expect(config.aiCommit?.enabled).toBe(true);
      expect(config.aiCommit?.provider).toBe("openai");
      expect(config.aiCommit?.apiKey).toBe("global-key");
      expect(config.aiCommit?.language).toBe("zh-CN");
      expect(config.aiCommit?.model).toBe("gpt-4");
    });
  });

  describe("配置文件解析错误", () => {
    it("全局配置解析失败时应该使用默认配置", () => {
      vi.mocked(homedir).mockReturnValue("/home/user");
      vi.mocked(existsSync).mockImplementation((path) => {
        return path === "/home/user/.gwrc.json";
      });

      vi.mocked(readFileSync).mockReturnValue("invalid json");
      vi.mocked(execOutput).mockReturnValue("");

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const config = loadConfig();

      expect(config.featurePrefix).toBe("feature");
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it("项目配置解析失败时应该使用默认配置", () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        return path === ".gwrc.json";
      });

      vi.mocked(readFileSync).mockReturnValue("invalid json");
      vi.mocked(execOutput).mockReturnValue("");

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const config = loadConfig();

      expect(config.featurePrefix).toBe("feature");
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe("getConfig 函数", () => {
    it("应该缓存配置", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(execOutput).mockReturnValue("");

      const config1 = getConfig();
      const config2 = getConfig();

      expect(config1).toBe(config2);
    });
  });

  describe("Git 根目录查找", () => {
    it("应该在 git 根目录查找配置", () => {
      vi.mocked(execOutput).mockReturnValue("/path/to/repo");
      vi.mocked(existsSync).mockImplementation((path) => {
        return path === "/path/to/repo/.gwrc.json";
      });

      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ featurePrefix: "git-root-feature" })
      );

      const config = loadConfig();

      expect(config.featurePrefix).toBe("git-root-feature");
    });
  });

  describe("配置优先级", () => {
    it("当前目录 > git 根目录 > 全局配置", () => {
      const mockGlobalConfig = { featurePrefix: "global" };
      const mockGitRootConfig = { featurePrefix: "git-root" };
      const mockCurrentConfig = { featurePrefix: "current" };

      vi.mocked(homedir).mockReturnValue("/home/user");
      vi.mocked(execOutput).mockReturnValue("/path/to/repo");

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path === "/home/user/.gwrc.json") return true;
        if (path === "/path/to/repo/.gwrc.json") return true;
        if (path === ".gwrc.json") return true;
        return false;
      });

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (path === "/home/user/.gwrc.json") {
          return JSON.stringify(mockGlobalConfig);
        }
        if (path === "/path/to/repo/.gwrc.json") {
          return JSON.stringify(mockGitRootConfig);
        }
        if (path === ".gwrc.json") {
          return JSON.stringify(mockCurrentConfig);
        }
        return "{}";
      });

      const config = loadConfig();

      expect(config.featurePrefix).toBe("current");
    });
  });
});
