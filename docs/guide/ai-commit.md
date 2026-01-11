# AI 智能提交

AI 智能提交是 Git Workflow 的核心功能之一，它能够自动分析代码变更并生成规范的 commit message，让你告别"词穷"的烦恼。

## 🤖 功能概述

### 核心特性

- **⚡️ 快速生成** - 2-3 秒内完成分析和生成
- **🎯 准确识别** - 自动识别 feat/fix/docs 等提交类型
- **📝 规范格式** - 符合 Conventional Commits 标准
- **🇨🇳 多语言支持** - 支持中文和英文
- **🔄 可预览可拒绝** - 生成后可预览，不满意可切换到手动模式
- **🛡️ 隐私保护** - 只分析 git diff，不上传完整代码

### 支持的 AI 提供商

| 提供商        | 费用   | 特点                           | 推荐指数 |
| ------------- | ------ | ------------------------------ | -------- |
| GitHub Models | 免费   | 每天 150 次，需要 GitHub Token | ⭐⭐⭐⭐⭐ |
| OpenAI        | 付费   | 质量高，速度快                 | ⭐⭐⭐⭐   |
| Claude        | 付费   | 理解能力强，适合复杂变更       | ⭐⭐⭐⭐   |
| Ollama        | 免费   | 本地运行，完全私有             | ⭐⭐⭐     |

## 🚀 快速开始

### 1. 启用 AI Commit

如果还没有配置，运行初始化命令：

```bash
gw init
```

选择启用 AI commit 功能：

```
? 是否启用 AI commit 功能: 是
? 选择 AI 提供商: GitHub Models（免费，推荐）

💡 如何获取 GitHub Token:
  1. 访问: https://github.com/settings/tokens/new
  2. 勾选 'repo' 权限
  3. 生成并复制 token

? 输入你的 GitHub Token: ghp_xxxxxxxxxxxx
? 选择语言: 中文
```

### 2. 使用 AI 提交

在有代码变更的项目中：

```bash
gw c
```

选择 AI 模式：

```
已暂存的文件:
  src/auth.ts
  src/login.ts
────────────────────────────────────────
? 选择 commit 方式:
❯ 🤖 AI 自动生成 commit message
  ✍️  手动编写 commit message
```

AI 会自动分析变更并生成提交信息：

```
✔ AI 生成完成

AI 生成的 commit message:
✨ feat(auth): 添加用户登录功能

- 实现用户名密码验证
- 添加登录状态管理
- 集成 JWT token 处理
────────────────────────────────────────
? 使用这个 commit message?
❯ ✅ 使用
  ❌ 不使用，切换到手动模式
```

## 🔧 配置详解

### 配置文件位置

AI commit 配置保存在：

- **全局配置**: `~/.gwrc.json`
- **项目配置**: `.gwrc.json`

### 完整配置示例

```json
{
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "apiKey": "ghp_xxxxxxxxxxxx",
    "model": "gpt-4o-mini",
    "language": "zh-CN",
    "maxTokens": 200,
    "temperature": 0.7,
    "customPrompt": ""
  }
}
```

### 配置项说明

| 配置项         | 类型      | 默认值     | 说明                                                 |
| -------------- | --------- | ---------- | ---------------------------------------------------- |
| `enabled`      | `boolean` | `true`     | 是否启用 AI commit 功能                              |
| `provider`     | `string`  | `"github"` | AI 提供商：`github` / `openai` / `claude` / `ollama` |
| `apiKey`       | `string`  | -          | API key，留空使用内置 key（仅 GitHub Models）       |
| `model`        | `string`  | 根据提供商 | 模型名称                                             |
| `language`     | `string`  | `"zh-CN"`  | 生成语言：`zh-CN` / `en-US`                          |
| `maxTokens`    | `number`  | `200`      | 最大 token 数                                        |
| `temperature`  | `number`  | `0.7`      | 创造性参数（0-1）                                    |
| `customPrompt` | `string`  | -          | 自定义提示词                                         |

## 🌟 各提供商详细配置

### GitHub Models（推荐）

**优势：**
- 完全免费，每天 150 次调用
- 无需信用卡，只需 GitHub 账号
- 模型质量高，速度快
- 支持多种模型

**配置步骤：**

1. 获取 GitHub Token：
   - 访问：https://github.com/settings/tokens/new
   - Token 名称：`git-workflow-ai`
   - 勾选权限：`repo`（用于访问 GitHub Models API）
   - 点击 "Generate token"
   - 复制生成的 token（以 `ghp_` 开头）

2. 配置 Git Workflow：

```json
{
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "apiKey": "ghp_your_token_here",
    "model": "gpt-4o-mini",
    "language": "zh-CN"
  }
}
```

**可用模型：**
- `gpt-4o-mini` - 快速，适合日常使用（推荐）
- `gpt-4o` - 质量更高，token 消耗更多
- `gpt-3.5-turbo` - 经典模型，平衡性能和质量

### OpenAI

**优势：**
- 模型质量最高
- 响应速度快
- 支持最新的 GPT 模型

**配置步骤：**

1. 获取 API Key：
   - 访问：https://platform.openai.com/api-keys
   - 创建新的 API Key
   - 复制 API Key（以 `sk-` 开头）

2. 配置：

```json
{
  "aiCommit": {
    "enabled": true,
    "provider": "openai",
    "apiKey": "sk-your-api-key-here",
    "model": "gpt-4o-mini",
    "language": "zh-CN"
  }
}
```

**可用模型：**
- `gpt-4o-mini` - 性价比最高（推荐）
- `gpt-4o` - 最新最强模型
- `gpt-3.5-turbo` - 经济实惠

### Claude (Anthropic)

**优势：**
- 理解能力强，适合复杂变更
- 生成的描述更详细
- 对中文支持良好

**配置步骤：**

1. 获取 API Key：
   - 访问：https://console.anthropic.com/
   - 创建 API Key
   - 复制 API Key

2. 配置：

```json
{
  "aiCommit": {
    "enabled": true,
    "provider": "claude",
    "apiKey": "sk-ant-your-api-key-here",
    "model": "claude-3-haiku-20240307",
    "language": "zh-CN"
  }
}
```

**可用模型：**
- `claude-3-haiku-20240307` - 快速经济（推荐）
- `claude-3-sonnet-20240229` - 平衡性能
- `claude-3-opus-20240229` - 最高质量

### Ollama（本地）

**优势：**
- 完全免费，无限制
- 数据不离开本地，隐私性最高
- 支持多种开源模型

**配置步骤：**

1. 安装 Ollama：
   - 访问：https://ollama.com/
   - 下载并安装 Ollama
   - 启动 Ollama 服务

2. 下载模型：

```bash
# 推荐模型
ollama pull llama3.2:3b
ollama pull qwen2.5:7b
ollama pull codellama:7b
```

3. 配置：

```json
{
  "aiCommit": {
    "enabled": true,
    "provider": "ollama",
    "model": "llama3.2:3b",
    "language": "zh-CN",
    "baseURL": "http://localhost:11434"
  }
}
```

**推荐模型：**
- `llama3.2:3b` - 轻量快速，适合日常使用
- `qwen2.5:7b` - 中文支持更好
- `codellama:7b` - 专门针对代码优化

## 🎯 使用技巧

### 1. 提高生成质量

**暂存相关文件：**
```bash
# 只暂存相关的文件，避免混合不同功能的变更
git add src/auth.ts src/login.ts
gw c
```

**分批提交：**
```bash
# 将大的变更拆分成多个小的、逻辑清晰的提交
git add src/auth.ts
gw c  # 提交认证相关变更

git add src/ui/login.tsx
gw c  # 提交 UI 相关变更
```

### 2. 自定义提示词

如果默认生成的提交信息不符合你的需求，可以自定义提示词：

```json
{
  "aiCommit": {
    "customPrompt": "请生成简洁的中文 commit message，格式为：类型(范围): 描述。类型使用中文，如：功能、修复、文档等。"
  }
}
```

### 3. 语言设置

根据团队需求选择合适的语言：

```json
{
  "aiCommit": {
    "language": "en-US"  // 英文提交信息
  }
}
```

生成效果对比：

```bash
# 中文 (zh-CN)
✨ feat(auth): 添加用户登录功能

# 英文 (en-US)  
✨ feat(auth): add user login functionality
```

### 4. 调整创造性

通过 `temperature` 参数控制生成的创造性：

```json
{
  "aiCommit": {
    "temperature": 0.3  // 更保守，生成更一致的结果
  }
}
```

- `0.0-0.3` - 保守，结果一致性高
- `0.4-0.7` - 平衡（推荐）
- `0.8-1.0` - 创造性高，结果多样

## 🔍 生成示例

### 功能开发

**代码变更：**
```diff
// src/auth.ts
+ export function validateUser(username: string, password: string) {
+   return username.length > 0 && password.length >= 6;
+ }

// src/login.tsx
+ const handleLogin = () => {
+   if (validateUser(username, password)) {
+     // 登录逻辑
+   }
+ }
```

**AI 生成：**
```
✨ feat(auth): 添加用户登录验证功能

- 实现用户名和密码验证逻辑
- 添加登录表单处理函数
- 设置密码最小长度要求
```

### Bug 修复

**代码变更：**
```diff
// src/utils.ts
- return data.map(item => item.name);
+ return data?.map(item => item?.name) || [];
```

**AI 生成：**
```
🐛 fix(utils): 修复数据为空时的崩溃问题

- 添加空值检查避免 TypeError
- 使用可选链操作符增强安全性
- 提供默认空数组作为兜底
```

### 文档更新

**代码变更：**
```diff
// README.md
+ ## 安装
+ 
+ ```bash
+ npm install -g @zjex/git-workflow
+ ```
```

**AI 生成：**
```
📝 docs: 添加安装说明文档

- 补充 npm 全局安装命令
- 完善项目使用指南
```

### 重构代码

**代码变更：**
```diff
// src/api.ts
- function getUserData(id) {
-   return fetch(`/api/users/${id}`).then(res => res.json());
- }
+ async function getUserData(id: string): Promise<User> {
+   const response = await fetch(`/api/users/${id}`);
+   return response.json();
+ }
```

**AI 生成：**
```
♻️ refactor(api): 重构用户数据获取函数

- 使用 async/await 替代 Promise 链
- 添加 TypeScript 类型注解
- 提升代码可读性和类型安全
```

## 🛡️ 隐私与安全

### 数据处理

Git Workflow 在使用 AI 功能时：

- ✅ **只发送 git diff** - 仅发送代码变更差异，不发送完整文件
- ✅ **不存储数据** - AI 提供商不会存储你的代码变更
- ✅ **本地处理** - 敏感信息（如 API key）仅存储在本地
- ✅ **可选功能** - 可以随时禁用 AI 功能

### 安全建议

1. **使用项目配置** - 敏感项目可以禁用 AI 功能
2. **定期更新 Token** - 定期轮换 API key
3. **检查权限** - GitHub Token 只需要 `repo` 权限
4. **本地优先** - 对于高度敏感的项目，考虑使用 Ollama

### 禁用 AI 功能

如果不想使用 AI 功能，可以在配置中禁用：

```json
{
  "aiCommit": {
    "enabled": false
  }
}
```

或者在使用时选择手动模式：

```bash
gw c
# 选择 "✍️ 手动编写 commit message"
```

## 🔧 故障排除

### 常见问题

**1. API Key 无效**

```
❌ AI 生成失败: Invalid API key
```

**解决方案：**
- 检查 API key 是否正确
- 确认 API key 有足够的权限
- 尝试重新生成 API key

**2. 网络连接问题**

```
❌ AI 生成失败: Network timeout
```

**解决方案：**
- 检查网络连接
- 尝试使用代理
- 切换到其他 AI 提供商

**3. 配额超限**

```
❌ AI 生成失败: Rate limit exceeded
```

**解决方案：**
- 等待配额重置（GitHub Models 每天重置）
- 切换到其他 AI 提供商
- 考虑升级到付费计划

**4. Ollama 连接失败**

```
❌ AI 生成失败: Connection refused
```

**解决方案：**
- 确认 Ollama 服务正在运行
- 检查端口配置（默认 11434）
- 确认模型已下载

### 调试模式

启用详细日志查看具体错误：

```bash
DEBUG=gw:ai gw c
```

### 降级方案

如果 AI 功能不可用，Git Workflow 会自动降级到手动模式：

```
⚠️ AI 服务暂时不可用，已切换到手动模式

? 选择提交类型:
  ✨  feat       新功能
  🐛  fix        修复 Bug
  📝  docs       文档更新
  ...
```

## 📊 性能优化

### 提高响应速度

1. **选择合适的模型**：
   - GitHub Models: `gpt-4o-mini`（推荐）
   - OpenAI: `gpt-3.5-turbo`
   - Claude: `claude-3-haiku`
   - Ollama: `llama3.2:3b`

2. **减少 token 消耗**：
```json
{
  "aiCommit": {
    "maxTokens": 150,  // 减少最大 token 数
    "temperature": 0.3  // 降低创造性
  }
}
```

3. **本地缓存**：
Git Workflow 会缓存相似的变更，避免重复请求。

### 批量操作

对于多个小的变更，可以分批暂存和提交：

```bash
# 脚本示例
for file in src/*.ts; do
  git add "$file"
  gw c --auto  # 假设的自动模式
done
```

---

AI 智能提交功能让你告别"词穷"的烦恼，生成规范、准确的提交信息。选择适合的 AI 提供商，配置好参数，就能享受高效的提交体验！