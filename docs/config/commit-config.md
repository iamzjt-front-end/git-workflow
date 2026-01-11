# 提交配置

commit 相关的配置选项。

## 📝 自动暂存

控制提交时是否自动暂存所有更改。

```json
{
  "autoStage": true
}
```

**行为对比：**

`autoStage: true`（默认）：
```bash
gw c
# 自动暂存所有更改，直接进入提交流程
```

`autoStage: false`：
```bash
gw c
# 显示文件选择界面，手动选择要暂存的文件
? 选择要暂存的文件:
  ◉ M src/index.ts
  ◉ M src/utils.ts
```

## 😀 Emoji 配置

控制是否在 commit message 中使用 emoji。

```json
{
  "useEmoji": true
}
```

**效果对比：**

启用 emoji：
```
✨ feat(auth): 添加用户登录功能
```

禁用 emoji：
```
feat(auth): 添加用户登录功能
```

## 🎨 自定义 Emoji

自定义各类型 commit 的 emoji。

```json
{
  "commitEmojis": {
    "feat": "🎉",
    "fix": "🔧",
    "docs": "📚",
    "style": "🎨",
    "refactor": "🔨",
    "perf": "🚀",
    "test": "🧪",
    "build": "📦",
    "ci": "👷",
    "chore": "🔧",
    "revert": "⏪"
  }
}
```

## 🤖 AI Commit 配置

详细的 AI commit 配置请参考 [AI 配置](./ai-config.md)。

基础配置：

```json
{
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "zh-CN",
    "detailedDescription": true
  }
}
```

## 📋 使用场景

### 严格的 CI/CD 环境

```json
{
  "useEmoji": false,
  "autoStage": false,
  "aiCommit": {
    "enabled": true,
    "detailedDescription": true
  }
}
```

### 个人项目

```json
{
  "useEmoji": true,
  "autoStage": true,
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "zh-CN"
  }
}
```

### 团队协作

```json
{
  "useEmoji": true,
  "autoStage": true,
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "detailedDescription": true,
    "language": "zh-CN"
  },
  "commitEmojis": {
    "feat": "✨",
    "fix": "🐛"
  }
}
```

## 🔧 最佳实践

### Commit Message 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 添加用户登录` |
| `fix` | Bug 修复 | `fix(api): 修复数据获取失败` |
| `docs` | 文档更新 | `docs(readme): 更新安装说明` |
| `style` | 代码格式 | `style: 修复代码缩进` |
| `refactor` | 重构 | `refactor(utils): 优化工具函数` |
| `perf` | 性能优化 | `perf(query): 优化数据库查询` |
| `test` | 测试相关 | `test(auth): 添加登录测试` |
| `build` | 构建相关 | `build: 更新依赖版本` |
| `ci` | CI/CD | `ci: 添加自动部署` |
| `chore` | 其他杂项 | `chore: 更新配置文件` |
| `revert` | 回退提交 | `revert: 回退登录功能` |

### Scope 建议

- 使用模块名：`auth`, `api`, `ui`, `utils`
- 使用功能名：`login`, `payment`, `search`
- 保持简洁：避免过长的 scope

### 破坏性变更

对于包含破坏性变更的提交，添加 `BREAKING CHANGE` 标记：

```
feat(api): 重构用户 API

BREAKING CHANGE: 用户 API 响应格式已更改
```