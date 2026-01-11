# 配置示例

各种使用场景的完整配置示例。

## 🏠 个人开发者

适合个人项目的轻量配置。

```json
{
  "featurePrefix": "feat",
  "hotfixPrefix": "fix",
  "requireId": false,
  "autoStage": true,
  "useEmoji": true,
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "zh-CN",
    "detailedDescription": true
  }
}
```

**特点：**
- 简化的分支前缀
- 不强制要求 ID
- 启用 AI commit
- 使用中文

## 👥 团队协作

适合团队开发的规范配置。

```json
{
  "baseBranch": "develop",
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix",
  "requireId": true,
  "featureIdLabel": "Jira ID",
  "hotfixIdLabel": "Bug ID",
  "autoPush": true,
  "autoStage": true,
  "useEmoji": true,
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "zh-CN",
    "detailedDescription": true
  }
}
```

**特点：**
- 基于 develop 分支开发
- 强制要求 Jira ID
- 自动推送到远程
- 统一的 AI commit 配置

## 🌍 开源项目

适合开源项目的国际化配置。

```json
{
  "featurePrefix": "feature",
  "hotfixPrefix": "fix",
  "requireId": false,
  "autoPush": false,
  "autoStage": true,
  "useEmoji": true,
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "en-US",
    "detailedDescription": true
  }
}
```

**特点：**
- 使用英文
- 不自动推送（让贡献者决定）
- 不强制 ID（适合外部贡献）

## 🏢 企业级项目

适合大型企业项目的严格配置。

```json
{
  "baseBranch": "develop",
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix",
  "requireId": true,
  "featureIdLabel": "Story ID",
  "hotfixIdLabel": "Incident ID",
  "defaultTagPrefix": "v",
  "autoPush": true,
  "autoStage": false,
  "useEmoji": false,
  "aiCommit": {
    "enabled": true,
    "provider": "openai",
    "language": "en-US",
    "detailedDescription": true,
    "maxTokens": 300
  }
}
```

**特点：**
- 严格的 ID 要求
- 手动选择暂存文件
- 禁用 emoji（适合正式环境）
- 使用付费 AI 服务

## 🚀 CI/CD 优化

适合自动化流程的配置。

```json
{
  "baseBranch": "main",
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix",
  "requireId": true,
  "featureIdLabel": "Ticket",
  "hotfixIdLabel": "Issue",
  "defaultTagPrefix": "v",
  "autoPush": true,
  "autoStage": true,
  "useEmoji": false,
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "en-US",
    "detailedDescription": true,
    "maxTokens": 200
  }
}
```

**特点：**
- 固定 tag 前缀
- 自动推送和暂存
- 禁用 emoji（避免 CI 问题）
- 限制 token 数量

## 🎨 创意项目

适合设计或创意项目的个性化配置。

```json
{
  "featurePrefix": "feat",
  "hotfixPrefix": "fix",
  "requireId": false,
  "autoStage": true,
  "useEmoji": true,
  "commitEmojis": {
    "feat": "🎨",
    "fix": "🔧",
    "docs": "📝",
    "style": "💄",
    "refactor": "♻️",
    "perf": "⚡️",
    "test": "✅"
  },
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "zh-CN",
    "detailedDescription": true
  }
}
```

**特点：**
- 自定义 emoji
- 灵活的分支管理
- 中文友好

## 📱 移动端项目

适合移动应用开发的配置。

```json
{
  "baseBranch": "develop",
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix",
  "requireId": true,
  "featureIdLabel": "Feature ID",
  "hotfixIdLabel": "Bug ID",
  "defaultTagPrefix": "v",
  "autoPush": true,
  "autoStage": true,
  "useEmoji": true,
  "commitEmojis": {
    "feat": "📱",
    "fix": "🐛",
    "perf": "⚡️",
    "test": "🧪"
  },
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "zh-CN",
    "detailedDescription": true
  }
}
```

**特点：**
- 移动端相关的 emoji
- 版本标签管理
- 性能优化重视

## 🔒 安全项目

适合安全敏感项目的配置。

```json
{
  "baseBranch": "main",
  "featurePrefix": "feature",
  "hotfixPrefix": "security",
  "requireId": true,
  "featureIdLabel": "Security ID",
  "hotfixIdLabel": "CVE ID",
  "autoPush": false,
  "autoStage": false,
  "useEmoji": false,
  "aiCommit": {
    "enabled": false
  }
}
```

**特点：**
- 禁用 AI（避免数据泄露）
- 手动控制推送和暂存
- 安全相关的标签
- 禁用 emoji

## 🧪 实验项目

适合实验性项目的灵活配置。

```json
{
  "featurePrefix": "exp",
  "hotfixPrefix": "fix",
  "requireId": false,
  "autoPush": false,
  "autoStage": true,
  "useEmoji": true,
  "commitEmojis": {
    "feat": "🧪",
    "fix": "🔧",
    "docs": "📚"
  },
  "aiCommit": {
    "enabled": true,
    "provider": "ollama",
    "model": "llama3.2:3b",
    "language": "zh-CN",
    "detailedDescription": false
  }
}
```

**特点：**
- 实验性前缀
- 本地 AI 模型
- 简洁的 commit message
- 灵活的推送策略