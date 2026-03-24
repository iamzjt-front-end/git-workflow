# 配置文件详解

Git Workflow 使用 JSON 格式的配置文件来自定义工具行为，支持全局配置和项目配置两种模式。

## 📁 配置文件位置

### 查找顺序

Git Workflow 按以下顺序查找配置文件：

1. **当前目录** - `./gwrc.json`
2. **Git 仓库根目录** - `<git-root>/.gwrc.json`
3. **用户主目录** - `~/.gwrc.json`
4. **内置默认配置**

### 支持的文件名

项目配置支持多种文件名：

```bash
.gwrc.json          # 推荐，JSON 格式
.gwrc               # 简化文件名
gw.config.json      # 明确的配置文件名
```

全局配置固定为：

```bash
~/.gwrc.json        # 用户主目录下的全局配置
```

## 🔧 完整配置示例

### 基础配置

```json
{
  "baseBranch": "develop",
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix",
  "requireId": true,
  "featureIdLabel": "Story ID",
  "hotfixIdLabel": "Issue ID",
  "defaultTagPrefix": "v",
  "tagLookupStrategy": "latest",
  "autoPush": true,
  "autoStage": true,
  "useEmoji": true
}
```

### 完整配置

```json
{
  "baseBranch": "develop",
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix",
  "requireId": true,
  "featureIdLabel": "Story ID",
  "hotfixIdLabel": "Issue ID",
  "defaultTagPrefix": "v",
  "tagLookupStrategy": "latest",
  "autoPush": true,
  "autoStage": true,
  "useEmoji": true,
  "commitEmojis": {
    "feat": "✨",
    "fix": "🐛",
    "docs": "📝",
    "style": "💄",
    "refactor": "♻️",
    "perf": "⚡️",
    "test": "✅",
    "build": "📦",
    "ci": "👷",
    "chore": "🔧",
    "revert": "⏪"
  },
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "apiKey": "",
    "model": "gpt-4o-mini",
    "language": "zh-CN",
    "maxTokens": 200,
    "detailedDescription": true,
    "temperature": 0.7,
    "customPrompt": ""
  },
  "release": {
    "autoCommit": false,
    "autoTag": false,
    "commitMessage": "chore: release v{version}",
    "tagMessage": "Release v{version}"
  },
  "hooks": {
    "preCommit": "",
    "postCommit": "",
    "preTag": "",
    "postTag": ""
  }
}
```

## 📋 配置项详解

### 分支配置

#### baseBranch

**类型：** `string`  
**默认值：** 自动检测  
**说明：** 默认基础分支，不设置则自动检测 main/master

```json
{
  "baseBranch": "develop"
}
```

**效果：**
- 所有新分支都基于 `develop` 创建
- 除非使用 `--base` 参数覆盖

#### featurePrefix

**类型：** `string`  
**默认值：** `"feature"`  
**说明：** feature 分支前缀

```json
{
  "featurePrefix": "feat"
}
```

**效果：**
- 生成分支名：`feat/20260111-PROJ-123-add-login`

#### hotfixPrefix

**类型：** `string`  
**默认值：** `"hotfix"`  
**说明：** hotfix 分支前缀

```json
{
  "hotfixPrefix": "fix"
}
```

**效果：**
- 生成分支名：`fix/20260111-BUG-456-fix-crash`

#### requireId

**类型：** `boolean`  
**默认值：** `false`  
**说明：** 是否强制要求填写 ID

```json
{
  "requireId": true
}
```

**效果：**
- 创建分支时必须填写 ID，不能跳过
- 确保每个分支都能追溯到具体需求

#### featureIdLabel

**类型：** `string`  
**默认值：** `"Story ID"`  
**说明：** feature 分支 ID 提示文字

```json
{
  "featureIdLabel": "Jira ID"
}
```

**效果：**
- 提示文字变为："请输入 Jira ID (可跳过):"

#### hotfixIdLabel

**类型：** `string`  
**默认值：** `"Issue ID"`  
**说明：** hotfix 分支 ID 提示文字

```json
{
  "hotfixIdLabel": "Bug ID"
}
```

**效果：**
- 提示文字变为："请输入 Bug ID (可跳过):"

#### autoPush

**类型：** `boolean`  
**默认值：** 不设置（每次询问）  
**说明：** 创建分支后是否自动推送到远程

```json
{
  "autoPush": true
}
```

**选项说明：**
- `true` - 自动推送，不询问
- `false` - 不推送，不询问
- 不设置 - 每次询问（默认行为）

### 版本配置

#### defaultTagPrefix

**类型：** `string`  
**默认值：** 不设置  
**说明：** 默认 tag 前缀，设置后跳过选择步骤

```json
{
  "defaultTagPrefix": "v"
}
```

**效果：**
- 创建 tag 时直接使用 `v` 前缀
- 跳过前缀选择界面

#### tagLookupStrategy

**类型：** `"all" | "latest"`  
**默认值：** `"latest"`  
**说明：** 创建 tag 时如何确定递增基准

```json
{
  "tagLookupStrategy": "latest"
}
```

**选项说明：**
- `"latest"` - 默认行为。优先基于本地最新创建的 tag 递增，避免历史误打的高版本 tag 干扰排序；如果当前前缀在本地不存在，会自动回退到一次全量同步
- `"all"` - 全量拉取 tags，并按版本号排序后取最新值

### 提交配置

#### autoStage

**类型：** `boolean`  
**默认值：** `true`  
**说明：** commit 时是否自动暂存所有更改

```json
{
  "autoStage": false
}
```

**效果：**
- `true` - 自动暂存所有更改
- `false` - 手动选择要暂存的文件

#### useEmoji

**类型：** `boolean`  
**默认值：** `true`  
**说明：** commit 时是否使用 emoji

```json
{
  "useEmoji": false
}
```

**效果：**
- `true` - `✨ feat(auth): 添加登录功能`
- `false` - `feat(auth): 添加登录功能`

#### commitEmojis

**类型：** `object`  
**默认值：** 内置 emoji 映射  
**说明：** 自定义各类型 commit 的 emoji

```json
{
  "commitEmojis": {
    "feat": "🎉",
    "fix": "🔧",
    "docs": "📚"
  }
}
```

**效果：**
- 只覆盖指定的类型
- 未指定的类型使用默认 emoji

### AI 配置

#### aiCommit.enabled

**类型：** `boolean`  
**默认值：** `true`  
**说明：** 是否启用 AI commit 功能

```json
{
  "aiCommit": {
    "enabled": false
  }
}
```

#### aiCommit.provider

**类型：** `string`  
**默认值：** `"github"`  
**说明：** AI 提供商

```json
{
  "aiCommit": {
    "provider": "openai"
  }
}
```

**支持的提供商：**
- `github` - GitHub Models
- `openai` - OpenAI
- `claude` - Anthropic Claude
- `ollama` - 本地 Ollama

#### aiCommit.apiKey

**类型：** `string`  
**默认值：** 空字符串  
**说明：** API key，留空使用内置 key（仅 GitHub Models）

```json
{
  "aiCommit": {
    "apiKey": "your-api-key-here"
  }
}
```

#### aiCommit.model

**类型：** `string`  
**默认值：** 根据提供商  
**说明：** 模型名称

```json
{
  "aiCommit": {
    "provider": "openai",
    "model": "gpt-4o-mini"
  }
}
```

**常用模型：**
- GitHub: `gpt-4o-mini`, `gpt-4o`
- OpenAI: `gpt-4o-mini`, `gpt-3.5-turbo`
- Claude: `claude-3-haiku-20240307`
- Ollama: `llama3.2:3b`, `qwen2.5:7b`

#### aiCommit.language

**类型：** `string`  
**默认值：** `"zh-CN"`  
**说明：** 生成语言

```json
{
  "aiCommit": {
    "language": "en-US"
  }
}
```

**支持的语言：**
- `zh-CN` - 中文
- `en-US` - 英文

#### aiCommit.maxTokens

**类型：** `number`  
**默认值：** `200`（简洁模式）/ `400`（详细模式）  
**说明：** 最大 token 数

```json
{
  "aiCommit": {
    "maxTokens": 150
  }
}
```

#### aiCommit.detailedDescription

**类型：** `boolean`  
**默认值：** `true`  
**说明：** 是否生成详细的修改点描述

```json
{
  "aiCommit": {
    "detailedDescription": true
  }
}
```

**效果对比：**

简洁模式（`detailedDescription: false`）：
```
feat(auth): 添加用户登录功能
```

详细模式（`detailedDescription: true`）：
```
feat(auth): 添加用户登录功能

- 实现用户名密码登录接口
- 添加登录状态验证中间件
- 完善登录错误处理逻辑
- 更新用户认证相关文档
```

**注意：** 详细模式会自动使用更大的 `maxTokens`（400）和更长的 diff 长度限制（6000 字符）。

#### aiCommit.temperature

**类型：** `number`  
**默认值：** `0.7`  
**说明：** 创造性参数（0-1）

```json
{
  "aiCommit": {
    "temperature": 0.3
  }
}
```

**参数说明：**
- `0.0-0.3` - 保守，结果一致性高
- `0.4-0.7` - 平衡（推荐）
- `0.8-1.0` - 创造性高，结果多样

#### aiCommit.customPrompt

**类型：** `string`  
**默认值：** 空字符串  
**说明：** 自定义提示词

```json
{
  "aiCommit": {
    "customPrompt": "请生成简洁的中文 commit message，格式为：类型(范围): 描述"
  }
}
```

### 发布配置

#### release.autoCommit

**类型：** `boolean`  
**默认值：** `false`  
**说明：** 版本更新后是否自动提交

```json
{
  "release": {
    "autoCommit": true
  }
}
```

#### release.autoTag

**类型：** `boolean`  
**默认值：** `false`  
**说明：** 版本更新后是否自动创建标签

```json
{
  "release": {
    "autoTag": true
  }
}
```

#### release.commitMessage

**类型：** `string`  
**默认值：** `"chore: release v{version}"`  
**说明：** 版本提交的消息模板

```json
{
  "release": {
    "commitMessage": "🔖 chore: 发布版本 v{version}"
  }
}
```

#### release.tagMessage

**类型：** `string`  
**默认值：** `"Release v{version}"`  
**说明：** 标签消息模板

```json
{
  "release": {
    "tagMessage": "发布版本 v{version}"
  }
}
```

### 钩子配置

#### hooks.preCommit

**类型：** `string`  
**默认值：** 空字符串  
**说明：** 提交前执行的命令

```json
{
  "hooks": {
    "preCommit": "npm run lint"
  }
}
```

#### hooks.postCommit

**类型：** `string`  
**默认值：** 空字符串  
**说明：** 提交后执行的命令

```json
{
  "hooks": {
    "postCommit": "npm run build"
  }
}
```

#### hooks.preTag

**类型：** `string`  
**默认值：** 空字符串  
**说明：** 创建标签前执行的命令

```json
{
  "hooks": {
    "preTag": "npm test"
  }
}
```

#### hooks.postTag

**类型：** `string`  
**默认值：** 空字符串  
**说明：** 创建标签后执行的命令

```json
{
  "hooks": {
    "postTag": "npm run changelog"
  }
}
```

## 🎯 配置场景示例

### 个人开发者配置

```json
{
  "autoStage": true,
  "useEmoji": true,
  "requireId": false,
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "zh-CN"
  }
}
```

### 团队协作配置

```json
{
  "baseBranch": "develop",
  "requireId": true,
  "featureIdLabel": "Jira ID",
  "hotfixIdLabel": "Bug ID",
  "autoPush": true,
  "useEmoji": false,
  "autoStage": false
}
```

### 企业级配置

```json
{
  "featurePrefix": "feat",
  "hotfixPrefix": "fix",
  "requireId": true,
  "featureIdLabel": "需求编号",
  "hotfixIdLabel": "缺陷编号",
  "useEmoji": false,
  "autoStage": false,
  "aiCommit": {
    "enabled": false
  },
  "hooks": {
    "preCommit": "npm run lint && npm test",
    "preTag": "npm run build"
  }
}
```

### 开源项目配置

```json
{
  "baseBranch": "main",
  "requireId": false,
  "useEmoji": true,
  "aiCommit": {
    "enabled": true,
    "language": "en-US"
  },
  "release": {
    "autoCommit": true,
    "commitMessage": "chore: release v{version}"
  }
}
```

## 🔧 配置管理

### 创建配置文件

```bash
# 交互式创建
gw init

# 手动创建
touch .gwrc.json
```

### 验证配置文件

```bash
# 检查配置语法
node -e "console.log(JSON.parse(require('fs').readFileSync('.gwrc.json', 'utf8')))"

# 或使用在线 JSON 验证工具
```

### 配置文件模板

```bash
# 复制配置模板
cp ~/.gwrc.json .gwrc.json

# 或从其他项目复制
cp ../other-project/.gwrc.json .
```

### 配置合并规则

当存在多个配置文件时，Git Workflow 会按优先级合并：

1. **项目配置** 覆盖 **全局配置**
2. **全局配置** 覆盖 **默认配置**
3. **对象类型** 进行深度合并
4. **基本类型** 直接覆盖

**示例：**

全局配置：
```json
{
  "useEmoji": true,
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "zh-CN"
  }
}
```

项目配置：
```json
{
  "requireId": true,
  "aiCommit": {
    "provider": "openai"
  }
}
```

最终生效配置：
```json
{
  "useEmoji": true,
  "requireId": true,
  "aiCommit": {
    "enabled": true,
    "provider": "openai",
    "language": "zh-CN"
  }
}
```

## 🚨 常见问题

### 配置文件语法错误

```bash
❌ 配置文件语法错误: Unexpected token } in JSON
```

**解决方案：**
1. 使用 JSON 验证工具检查语法
2. 检查是否有多余的逗号
3. 确保字符串使用双引号

### 配置项不生效

```bash
❌ 配置项 'unknownOption' 不被识别
```

**解决方案：**
1. 检查配置项名称是否正确
2. 查看文档确认支持的配置项
3. 更新到最新版本

### 权限问题

```bash
❌ 无法写入配置文件: Permission denied
```

**解决方案：**
1. 检查文件权限：`ls -la .gwrc.json`
2. 修改权限：`chmod 644 .gwrc.json`
3. 检查目录权限

### 配置冲突

```bash
⚠️ 项目配置与全局配置存在冲突
```

**解决方案：**
1. 项目配置优先级更高
2. 检查合并结果是否符合预期
3. 根据需要调整配置

## 📚 相关文档

- [**AI 配置**](/config/ai-config) - 详细的 AI commit 配置
- [**分支配置**](/config/branch-config) - 分支管理相关配置
- [**提交配置**](/config/commit-config) - 提交相关配置
- [**配置示例**](/config/examples) - 更多实际配置案例

---

通过合理配置，Git Workflow 可以完美适应你的工作流程。配置文件是工具的核心，掌握配置文件的使用是高效使用 Git Workflow 的关键。
