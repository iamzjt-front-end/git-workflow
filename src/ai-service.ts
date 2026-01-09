import { execOutput } from "./utils.js";
import type { GwConfig } from "./config.js";

interface AIProvider {
  name: string;
  endpoint: string;
  defaultModel: string;
  free: boolean;
  needsKey: boolean;
}

const AI_PROVIDERS: Record<string, AIProvider> = {
  github: {
    name: "GitHub Models",
    endpoint: "https://models.github.ai/inference/chat/completions",
    defaultModel: "gpt-4o-mini",
    free: true,
    needsKey: true,
  },
  openai: {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    defaultModel: "gpt-4o-mini",
    free: false,
    needsKey: true,
  },
  claude: {
    name: "Claude",
    endpoint: "https://api.anthropic.com/v1/messages",
    defaultModel: "claude-3-haiku-20240307",
    free: false,
    needsKey: true,
  },
  ollama: {
    name: "Ollama",
    endpoint: "http://localhost:11434/api/generate",
    defaultModel: "qwen2.5-coder:7b",
    free: true,
    needsKey: false,
  },
};

/**
 * 获取 git diff 内容
 */
function getGitDiff(): string {
  try {
    // 获取已暂存的更改
    const diff = execOutput("git diff --cached");
    if (!diff) {
      // 如果没有暂存的更改，获取所有更改
      return execOutput("git diff");
    }
    return diff;
  } catch {
    return "";
  }
}

/**
 * 构建 AI prompt
 */
function buildPrompt(diff: string, language: string): string {
  const isZh = language === "zh-CN";

  const systemPrompt = isZh
    ? `你是一个专业的 Git commit message 生成助手。请根据提供的 git diff 生成符合 Conventional Commits 规范的 commit message。

规则：
1. 格式：<type>(<scope>): <subject>
2. type 必须是以下之一：feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
3. scope 是可选的，表示影响范围
4. subject 用中文描述，简洁明了，不超过 50 字
5. 只返回一条 commit message，即使有多个文件改动也要总结成一条
6. 不要有其他解释或多余内容

示例：
- feat(auth): 添加用户登录功能
- fix(api): 修复数据获取失败的问题
- docs(readme): 更新安装说明`
    : `You are a professional Git commit message generator. Generate a commit message following Conventional Commits specification based on the provided git diff.

Rules:
1. Format: <type>(<scope>): <subject>
2. type must be one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
3. scope is optional, indicates the affected area
4. subject should be concise, no more than 50 characters
5. Return only ONE commit message, even if multiple files are changed, summarize into one message
6. No explanations or extra content

Examples:
- feat(auth): add user login functionality
- fix(api): resolve data fetching failure
- docs(readme): update installation guide`;

  const userPrompt = isZh
    ? `请根据以下 git diff 生成 commit message：\n\n${diff}`
    : `Generate a commit message based on the following git diff:\n\n${diff}`;

  return `${systemPrompt}\n\n${userPrompt}`;
}

/**
 * 调用 GitHub Models API
 */
async function callGitHubAPI(
  prompt: string,
  apiKey: string,
  model: string,
  maxTokens: number
): Promise<string> {
  const response = await fetch(AI_PROVIDERS.github.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub Models API 错误: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

/**
 * 调用 OpenAI API
 */
async function callOpenAIAPI(
  prompt: string,
  apiKey: string,
  model: string,
  maxTokens: number
): Promise<string> {
  const response = await fetch(AI_PROVIDERS.openai.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API 错误: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

/**
 * 调用 Claude API
 */
async function callClaudeAPI(
  prompt: string,
  apiKey: string,
  model: string,
  maxTokens: number
): Promise<string> {
  const response = await fetch(AI_PROVIDERS.claude.endpoint, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API 错误: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text?.trim() || "";
}

/**
 * 调用 Ollama API
 */
async function callOllamaAPI(
  prompt: string,
  model: string,
  maxTokens: number
): Promise<string> {
  try {
    const response = await fetch(AI_PROVIDERS.ollama.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          num_predict: maxTokens,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama 未运行或模型未安装`);
    }

    const data = await response.json();
    return data.response?.trim() || "";
  } catch (error) {
    throw new Error(
      `Ollama 连接失败。请确保：\n1. 已安装 Ollama (https://ollama.com)\n2. 运行 'ollama serve'\n3. 下载模型 'ollama pull ${model}'`
    );
  }
}

/**
 * 生成 AI commit message
 */
export async function generateAICommitMessage(
  config: GwConfig
): Promise<string> {
  const aiConfig = config.aiCommit || {};
  const provider = aiConfig.provider || "github";
  const language = aiConfig.language || "zh-CN";
  const maxTokens = aiConfig.maxTokens || 200;

  // 获取 git diff
  const diff = getGitDiff();
  if (!diff) {
    throw new Error("没有检测到代码更改");
  }

  // 限制 diff 长度，避免超过 token 限制
  const maxDiffLength = 4000;
  const truncatedDiff =
    diff.length > maxDiffLength ? diff.slice(0, maxDiffLength) + "\n..." : diff;

  // 构建 prompt
  const prompt = buildPrompt(truncatedDiff, language);

  // 根据提供商调用对应的 API
  const providerInfo = AI_PROVIDERS[provider];
  if (!providerInfo) {
    throw new Error(`不支持的 AI 提供商: ${provider}`);
  }

  const model = aiConfig.model || providerInfo.defaultModel;

  // 获取 API key
  const apiKey = aiConfig.apiKey || "";

  if (providerInfo.needsKey && !apiKey) {
    throw new Error(
      `${providerInfo.name} 需要 API key。请运行 'gw init' 配置 AI commit，或在 .gwrc.json 中设置 aiCommit.apiKey`
    );
  }

  // 调用 API
  switch (provider) {
    case "github":
      return await callGitHubAPI(prompt, apiKey, model, maxTokens);
    case "openai":
      return await callOpenAIAPI(prompt, apiKey, model, maxTokens);
    case "claude":
      return await callClaudeAPI(prompt, apiKey, model, maxTokens);
    case "ollama":
      return await callOllamaAPI(prompt, model, maxTokens);
    default:
      throw new Error(`不支持的 AI 提供商: ${provider}`);
  }
}

/**
 * 检查 AI commit 是否可用
 */
export function isAICommitAvailable(config: GwConfig): boolean {
  const aiConfig = config.aiCommit;
  if (!aiConfig) return true; // 默认启用

  // 如果明确禁用，返回 false
  if (aiConfig.enabled === false) return false;

  return true;
}

/**
 * 获取 AI 提供商信息
 */
export function getProviderInfo(provider: string): AIProvider | null {
  return AI_PROVIDERS[provider] || null;
}
