import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateAICommitMessage,
  isAICommitAvailable,
  getProviderInfo,
} from "../src/ai-service";
import { execOutput } from "../src/utils";
import type { GwConfig } from "../src/config";

// Mock dependencies
vi.mock("../src/utils");
global.fetch = vi.fn();

describe("AI Service 模块测试", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isAICommitAvailable 函数", () => {
    it("默认应该返回 true", () => {
      const config: GwConfig = {
        featurePrefix: "feature",
        hotfixPrefix: "hotfix",
        requireId: false,
        featureIdLabel: "Story ID",
        hotfixIdLabel: "Issue ID",
      };

      expect(isAICommitAvailable(config)).toBe(true);
    });

    it("明确启用时应该返回 true", () => {
      const config: GwConfig = {
        featurePrefix: "feature",
        hotfixPrefix: "hotfix",
        requireId: false,
        featureIdLabel: "Story ID",
        hotfixIdLabel: "Issue ID",
        aiCommit: {
          enabled: true,
        },
      };

      expect(isAICommitAvailable(config)).toBe(true);
    });

    it("明确禁用时应该返回 false", () => {
      const config: GwConfig = {
        featurePrefix: "feature",
        hotfixPrefix: "hotfix",
        requireId: false,
        featureIdLabel: "Story ID",
        hotfixIdLabel: "Issue ID",
        aiCommit: {
          enabled: false,
        },
      };

      expect(isAICommitAvailable(config)).toBe(false);
    });
  });

  describe("getProviderInfo 函数", () => {
    it("应该返回 GitHub 提供商信息", () => {
      const info = getProviderInfo("github");

      expect(info).toBeDefined();
      expect(info?.name).toBe("GitHub Models");
      expect(info?.free).toBe(true);
      expect(info?.needsKey).toBe(true);
      expect(info?.defaultModel).toBe("gpt-4o-mini");
    });

    it("应该返回 OpenAI 提供商信息", () => {
      const info = getProviderInfo("openai");

      expect(info).toBeDefined();
      expect(info?.name).toBe("OpenAI");
      expect(info?.free).toBe(false);
      expect(info?.needsKey).toBe(true);
    });

    it("应该返回 Claude 提供商信息", () => {
      const info = getProviderInfo("claude");

      expect(info).toBeDefined();
      expect(info?.name).toBe("Claude");
      expect(info?.free).toBe(false);
      expect(info?.needsKey).toBe(true);
    });

    it("应该返回 Ollama 提供商信息", () => {
      const info = getProviderInfo("ollama");

      expect(info).toBeDefined();
      expect(info?.name).toBe("Ollama");
      expect(info?.free).toBe(true);
      expect(info?.needsKey).toBe(false);
    });

    it("不支持的提供商应该返回 null", () => {
      const info = getProviderInfo("unknown");

      expect(info).toBeNull();
    });
  });

  describe("generateAICommitMessage 函数", () => {
    const mockConfig: GwConfig = {
      featurePrefix: "feature",
      hotfixPrefix: "hotfix",
      requireId: false,
      featureIdLabel: "Story ID",
      hotfixIdLabel: "Issue ID",
      aiCommit: {
        enabled: true,
        provider: "github",
        apiKey: "test-key",
        language: "zh-CN",
        maxTokens: 200,
      },
    };

    it("没有代码更改时应该抛出错误", async () => {
      vi.mocked(execOutput).mockReturnValue("");

      await expect(generateAICommitMessage(mockConfig)).rejects.toThrow(
        "没有检测到代码更改"
      );
    });

    it("应该调用 GitHub API", async () => {
      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "feat(test): 添加测试功能",
              },
            },
          ],
        }),
      } as Response);

      const result = await generateAICommitMessage(mockConfig);

      expect(result).toBe("feat(test): 添加测试功能");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("github.ai"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-key",
          }),
        })
      );
    });

    it("应该调用 OpenAI API", async () => {
      const openaiConfig = {
        ...mockConfig,
        aiCommit: {
          ...mockConfig.aiCommit!,
          provider: "openai" as const,
        },
      };

      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "feat(test): add test feature",
              },
            },
          ],
        }),
      } as Response);

      const result = await generateAICommitMessage(openaiConfig);

      expect(result).toBe("feat(test): add test feature");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("openai.com"),
        expect.any(Object)
      );
    });

    it("应该调用 Claude API", async () => {
      const claudeConfig = {
        ...mockConfig,
        aiCommit: {
          ...mockConfig.aiCommit!,
          provider: "claude" as const,
        },
      };

      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              text: "feat(test): add test feature",
            },
          ],
        }),
      } as Response);

      const result = await generateAICommitMessage(claudeConfig);

      expect(result).toBe("feat(test): add test feature");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("anthropic.com"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-api-key": "test-key",
          }),
        })
      );
    });

    it("应该调用 Ollama API", async () => {
      const ollamaConfig = {
        ...mockConfig,
        aiCommit: {
          ...mockConfig.aiCommit!,
          provider: "ollama" as const,
        },
      };

      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          response: "feat(test): 添加测试功能",
        }),
      } as Response);

      const result = await generateAICommitMessage(ollamaConfig);

      expect(result).toBe("feat(test): 添加测试功能");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("localhost:11434"),
        expect.any(Object)
      );
    });

    it("API 失败时应该抛出错误", async () => {
      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      } as Response);

      await expect(generateAICommitMessage(mockConfig)).rejects.toThrow(
        "GitHub Models API 错误"
      );
    });

    it("缺少 API key 时应该抛出错误", async () => {
      const configWithoutKey = {
        ...mockConfig,
        aiCommit: {
          ...mockConfig.aiCommit!,
          apiKey: "",
        },
      };

      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      await expect(generateAICommitMessage(configWithoutKey)).rejects.toThrow(
        "需要 API key"
      );
    });

    it("不支持的提供商应该抛出错误", async () => {
      const invalidConfig = {
        ...mockConfig,
        aiCommit: {
          ...mockConfig.aiCommit!,
          provider: "invalid" as any,
        },
      };

      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      await expect(generateAICommitMessage(invalidConfig)).rejects.toThrow(
        "不支持的 AI 提供商"
      );
    });

    it("应该截断过长的 diff", async () => {
      const longDiff = "a".repeat(5000);
      vi.mocked(execOutput).mockReturnValue(longDiff);

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "feat: update",
              },
            },
          ],
        }),
      } as Response);

      await generateAICommitMessage(mockConfig);

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
      const body = JSON.parse(callArgs.body as string);
      const prompt = body.messages[0].content;

      expect(prompt.length).toBeLessThan(longDiff.length + 1000);
      expect(prompt).toContain("...");
    });

    it("应该使用配置的语言", async () => {
      const enConfig = {
        ...mockConfig,
        aiCommit: {
          ...mockConfig.aiCommit!,
          language: "en-US" as const,
        },
      };

      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "feat: add feature",
              },
            },
          ],
        }),
      } as Response);

      await generateAICommitMessage(enConfig);

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
      const body = JSON.parse(callArgs.body as string);
      const prompt = body.messages[0].content;

      expect(prompt).toContain("Generate a commit message");
      expect(prompt).not.toContain("生成");
    });

    it("应该使用配置的模型", async () => {
      const customModelConfig = {
        ...mockConfig,
        aiCommit: {
          ...mockConfig.aiCommit!,
          model: "gpt-4",
        },
      };

      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "feat: add feature",
              },
            },
          ],
        }),
      } as Response);

      await generateAICommitMessage(customModelConfig);

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
      const body = JSON.parse(callArgs.body as string);

      expect(body.model).toBe("gpt-4");
    });

    it("应该使用配置的 maxTokens", async () => {
      const customTokensConfig = {
        ...mockConfig,
        aiCommit: {
          ...mockConfig.aiCommit!,
          maxTokens: 500,
        },
      };

      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "feat: add feature",
              },
            },
          ],
        }),
      } as Response);

      await generateAICommitMessage(customTokensConfig);

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
      const body = JSON.parse(callArgs.body as string);

      expect(body.max_tokens).toBe(500);
    });
  });

  describe("Ollama 特殊情况", () => {
    it("Ollama 连接失败时应该提供安装提示", async () => {
      const ollamaConfig: GwConfig = {
        featurePrefix: "feature",
        hotfixPrefix: "hotfix",
        requireId: false,
        featureIdLabel: "Story ID",
        hotfixIdLabel: "Issue ID",
        aiCommit: {
          enabled: true,
          provider: "ollama",
          model: "qwen2.5-coder:7b",
        },
      };

      vi.mocked(execOutput).mockReturnValue("diff --git a/file.ts b/file.ts");

      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValue(new Error("Connection refused"));

      await expect(generateAICommitMessage(ollamaConfig)).rejects.toThrow(
        "Ollama 连接失败"
      );
      await expect(generateAICommitMessage(ollamaConfig)).rejects.toThrow(
        "ollama.com"
      );
    });
  });
});
