import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// Mock 所有外部依赖
vi.mock("fs", () => ({
  existsSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock("path", () => ({
  join: vi.fn(),
}));

vi.mock("os", () => ({
  homedir: vi.fn(),
}));

vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
  input: vi.fn(),
}));

vi.mock("../src/utils.js", () => ({
  colors: {
    bold: (text: string) => text,
    green: (text: string) => text,
    yellow: (text: string) => text,
    cyan: (text: string) => text,
    dim: (text: string) => text,
  },
  theme: {},
  divider: vi.fn(),
}));

describe("Init 模块测试", () => {
  const mockExistsSync = vi.mocked(existsSync);
  const mockWriteFileSync = vi.mocked(writeFileSync);
  const mockJoin = vi.mocked(join);
  const mockHomedir = vi.mocked(homedir);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    mockHomedir.mockReturnValue("/home/user");
    mockJoin.mockReturnValue("/home/user/.gwrc.json");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("配置范围选择", () => {
    it("应该支持全局配置", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("global")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      expect(mockJoin).toHaveBeenCalledWith("/home/user", ".gwrc.json");
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "/home/user/.gwrc.json",
        expect.stringContaining('"featurePrefix": "feature"')
      );
    });

    it("应该支持项目配置", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        ".gwrc.json",
        expect.stringContaining('"featurePrefix": "feature"')
      );
    });
  });

  describe("配置文件覆盖", () => {
    it("应该处理配置文件已存在的情况", async () => {
      mockExistsSync.mockReturnValue(true);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("global")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it("应该处理用户取消覆盖", async () => {
      mockExistsSync.mockReturnValue(true);
      const { select } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("global")
        .mockResolvedValueOnce(false);
      const { init } = await import("../src/commands/init.js");
      await init();
      expect(console.log).toHaveBeenCalledWith("已取消");
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });
  });

  describe("基础配置", () => {
    it("应该正确配置分支前缀", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("develop")
        .mockResolvedValueOnce("feat")
        .mockResolvedValueOnce("fix")
        .mockResolvedValueOnce("Jira ID")
        .mockResolvedValueOnce("Bug ID")
        .mockResolvedValueOnce("v");
      const { init } = await import("../src/commands/init.js");
      await init();
      const writtenConfig = mockWriteFileSync.mock.calls[0][1] as string;
      const config = JSON.parse(writtenConfig);
      expect(config.baseBranch).toBe("develop");
      expect(config.featurePrefix).toBe("feat");
      expect(config.hotfixPrefix).toBe("fix");
      expect(config.featureIdLabel).toBe("Jira ID");
      expect(config.hotfixIdLabel).toBe("Bug ID");
      expect(config.defaultTagPrefix).toBe("v");
    });

    it("应该正确配置 ID 要求", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      const writtenConfig = mockWriteFileSync.mock.calls[0][1] as string;
      const config = JSON.parse(writtenConfig);
      expect(config.requireId).toBe(true);
    });

    it("应该正确配置自动推送选项", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("yes")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      const writtenConfig = mockWriteFileSync.mock.calls[0][1] as string;
      const config = JSON.parse(writtenConfig);
      expect(config.autoPush).toBe(true);
    });
  });

  describe("AI 配置", () => {
    it("应该正确配置 GitHub Models", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce("github")
        .mockResolvedValueOnce("zh-CN")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("ghp_test_token");
      const { init } = await import("../src/commands/init.js");
      await init();
      const writtenConfig = mockWriteFileSync.mock.calls[0][1] as string;
      const config = JSON.parse(writtenConfig);
      expect(config.aiCommit.enabled).toBe(true);
      expect(config.aiCommit.provider).toBe("github");
      expect(config.aiCommit.apiKey).toBe("ghp_test_token");
      expect(config.aiCommit.language).toBe("zh-CN");
      expect(config.aiCommit.model).toBe("gpt-4o-mini");
    });

    it("应该正确配置 OpenAI", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce("openai")
        .mockResolvedValueOnce("en-US")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("sk-test-key");
      const { init } = await import("../src/commands/init.js");
      await init();
      const writtenConfig = mockWriteFileSync.mock.calls[0][1] as string;
      const config = JSON.parse(writtenConfig);
      expect(config.aiCommit.enabled).toBe(true);
      expect(config.aiCommit.provider).toBe("openai");
      expect(config.aiCommit.apiKey).toBe("sk-test-key");
      expect(config.aiCommit.language).toBe("en-US");
      expect(config.aiCommit.model).toBe("gpt-4o-mini");
    });

    it("应该正确配置 Ollama", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce("ollama")
        .mockResolvedValueOnce("zh-CN")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      const writtenConfig = mockWriteFileSync.mock.calls[0][1] as string;
      const config = JSON.parse(writtenConfig);
      expect(config.aiCommit.enabled).toBe(true);
      expect(config.aiCommit.provider).toBe("ollama");
      expect(config.aiCommit.apiKey).toBeUndefined();
      expect(config.aiCommit.language).toBe("zh-CN");
      expect(config.aiCommit.model).toBe("qwen2.5-coder:7b");
    });

    it("应该正确配置禁用 AI", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      const writtenConfig = mockWriteFileSync.mock.calls[0][1] as string;
      const config = JSON.parse(writtenConfig);
      expect(config.aiCommit.enabled).toBe(false);
    });
  });

  describe("配置验证", () => {
    it("应该验证 GitHub Token 不为空", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce("github")
        .mockResolvedValueOnce("zh-CN")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("ghp_valid_token");
      const { init } = await import("../src/commands/init.js");
      await init();
      const inputCalls = vi.mocked(input).mock.calls;
      const tokenInputCall = inputCalls.find((call) =>
        call[0].message?.includes("GitHub Token")
      );
      expect(tokenInputCall).toBeDefined();
      expect(tokenInputCall![0].validate).toBeDefined();
      const validate = tokenInputCall![0].validate!;
      expect(validate("")).toBe("GitHub Token 不能为空");
      expect(validate("valid-token")).toBe(true);
    });

    it("应该验证 OpenAI API Key 不为空", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce("openai")
        .mockResolvedValueOnce("en-US")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("sk-valid-key");
      const { init } = await import("../src/commands/init.js");
      await init();
      const inputCalls = vi.mocked(input).mock.calls;
      const keyInputCall = inputCalls.find((call) =>
        call[0].message?.includes("OpenAI API Key")
      );
      expect(keyInputCall).toBeDefined();
      expect(keyInputCall![0].validate).toBeDefined();
      const validate = keyInputCall![0].validate!;
      expect(validate("")).toBe("API Key 不能为空");
      expect(validate("valid-key")).toBe(true);
    });
  });

  describe("配置输出", () => {
    it("应该包含默认的 commit emojis", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("project")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      const writtenConfig = mockWriteFileSync.mock.calls[0][1] as string;
      const config = JSON.parse(writtenConfig);
      expect(config.commitEmojis).toBeDefined();
      expect(config.commitEmojis.feat).toBe("✨");
      expect(config.commitEmojis.fix).toBe("🐛");
      expect(config.commitEmojis.docs).toBe("📝");
    });

    it("应该显示成功消息", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("global")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("✓ 配置已保存到 全局配置文件")
      );
    });

    it("应该显示全局配置的提示信息", async () => {
      mockExistsSync.mockReturnValue(false);
      const { select, input } = await import("@inquirer/prompts");
      vi.mocked(select)
        .mockResolvedValueOnce("global")
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce("ask")
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(input)
        .mockResolvedValueOnce("")
        .mockResolvedValueOnce("feature")
        .mockResolvedValueOnce("hotfix")
        .mockResolvedValueOnce("Story ID")
        .mockResolvedValueOnce("Issue ID")
        .mockResolvedValueOnce("");
      const { init } = await import("../src/commands/init.js");
      await init();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("全局配置对所有项目生效")
      );
    });
  });
});
