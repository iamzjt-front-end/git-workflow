# 配置概览

Git Workflow 提供了灵活的配置系统，支持全局配置和项目配置，让你可以根据不同的需求自定义工具行为。

## 🎯 配置理念

### 约定优于配置

Git Workflow 遵循"约定优于配置"的原则：

- **零配置开箱即用** - 无需任何配置即可开始使用
- **合理的默认值** - 提供适合大多数场景的默认配置
- **渐进式配置** - 可以根据需要逐步添加配置项

### 灵活的配置层级

支持多层级配置，满足不同场景需求：

1. **内置默认配置** - 工具内置的基础配置
2. **全局配置** - 对所有项目生效的个人配置
3. **项目配置** - 仅对当前项目生效的团队配置

**配置优先级：** 项目配置 > 全局配置 > 默认配置

## 📁 配置文件位置

### 全局配置

```
~/.gwrc.json
```

**特点：**
- 对所有项目生效
- 适合个人偏好设置
- 一次配置，处处使用

**适用场景：**
- AI commit 配置（API key、提供商等）
- 个人习惯配置（emoji、自动暂存等）
- 通用的分支命名规范

### 项目配置

支持多种文件名，按优先级查找：

```
.gwrc.json          # 推荐，JSON 格式
.gwrc               # 简化文件名
gw.config.json      # 明确的配置文件名
```

**特点：**
- 仅对当前项目生效
- 可以提交到版本控制
- 团队成员共享配置

**适用场景：**
- 团队统一的分支规范
- 项目特定的 ID 要求
- 特殊的分支前缀

### 查找顺序

Git Workflow 按以下顺序查找配置文件：

1. **当前目录** - `./gwrc.json`
2. **Git 仓库根目录** - `<git-root>/.gwrc.json`
3. **用户主目录** - `~/.gwrc.json`
4. **内置默认配置**

## 🚀 快速开始

### 创建全局配置（推荐）

```bash
gw init
```

选择配置范围：

```
⚙️  初始化 git-workflow 配置

? 选择配置范围:
❯ 全局配置（所有项目生效）      # 推荐！配置一次，所有项目都能用
  项目配置（仅当前项目）         # 为特定项目自定义配置
```

选择 **全局配置**，按提示完成配置：

```
✔ 选择配置范围: 全局配置（所有项目生效）

? Feature 分支前缀: feature
? Hotfix 分支前缀: hotfix
? 是否强制要求填写 ID: 否
? Feature 分支 ID 标签: Story ID
? Hotfix 分支 ID 标签: Issue ID
? 提交时是否自动暂存所有更改: 是
? 是否使用 emoji: 是

? 是否启用 AI commit 功能: 是
? 选择 AI 提供商: GitHub Models（免费，推荐）
? 输入你的 GitHub Token: ghp_xxxxxxxxxxxx
? 选择语言: 中文

✔ 全局配置已保存到: ~/.gwrc.json
```

### 创建项目配置

在项目根目录运行：

```bash
cd your-project
gw init
```

选择 **项目配置**，配置团队规范：

```
✔ 选择配置范围: 项目配置（仅当前项目）

? 是否强制要求填写 ID: 是
? Feature 分支 ID 标签: Jira ID
? Hotfix 分支 ID 标签: Bug ID
? 创建分支后是否自动推送到远程: 是
? 默认基础分支: develop

✔ 项目配置已保存到: .gwrc.json
```

## 📋 配置项详解

### 完整配置示例

```json
{
  "baseBranch": "develop",
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix",
  "requireId": true,
  "featureIdLabel": "Jira ID",
  "hotfixIdLabel": "Bug ID",
  "defaultTagPrefix": "v",
  "tagLookupStrategy": "latest",
  "autoPush": true,
  "autoStage": true,
  "useEmoji": true,
  "commitEmojis": {
    "feat": "✨",
    "fix": "🐛",
    "docs": "📝"
  },
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "apiKey": "ghp_xxxxxxxxxxxx",
    "model": "gpt-4o-mini",
    "language": "zh-CN",
    "maxTokens": 200,
    "detailedDescription": true
  }
}
```

### 基础配置

| 配置项           | 类型      | 默认值      | 说明                                     |
| ---------------- | --------- | ----------- | ---------------------------------------- |
| `baseBranch`     | `string`  | 自动检测    | 默认基础分支，不设置则自动检测 main/master |
| `featurePrefix`  | `string`  | `"feature"` | feature 分支前缀                         |
| `hotfixPrefix`   | `string`  | `"hotfix"`  | hotfix 分支前缀                          |

### 分支配置

| 配置项             | 类型      | 默认值       | 说明                                                                            |
| ------------------ | --------- | ------------ | ------------------------------------------------------------------------------- |
| `requireId`        | `boolean` | `false`      | 是否强制要求填写 ID。开启后创建分支时必须填写 ID，不能跳过                      |
| `featureIdLabel`   | `string`  | `"Story ID"` | feature 分支 ID 提示文字                                                        |
| `hotfixIdLabel`    | `string`  | `"Issue ID"` | hotfix 分支 ID 提示文字                                                         |
| `autoPush`         | `boolean` | -            | 创建分支后是否自动推送到远程。`true` 自动推送，`false` 不推送，不设置则每次询问 |

### 版本配置

| 配置项             | 类型     | 默认值 | 说明                              |
| ------------------ | -------- | ------ | --------------------------------- |
| `defaultTagPrefix` | `string` | -      | 默认 tag 前缀，设置后跳过选择步骤 |
| `tagLookupStrategy` | `"all" \| "latest"` | `"latest"` | tag 递增基准策略：`latest` 优先基于最新创建的 tag，`all` 按版本全量排序 |

### 提交配置

| 配置项         | 类型      | 默认值 | 说明                          |
| -------------- | --------- | ------ | ----------------------------- |
| `autoStage`    | `boolean` | `true` | commit 时是否自动暂存所有更改 |
| `useEmoji`     | `boolean` | `true` | commit 时是否使用 emoji       |
| `commitEmojis` | `object`  | -      | 自定义各类型 commit 的 emoji  |

### AI 配置

| 配置项                        | 类型      | 默认值     | 说明                                                 |
| ----------------------------- | --------- | ---------- | ---------------------------------------------------- |
| `aiCommit.enabled`            | `boolean` | `true`     | 是否启用 AI commit 功能                              |
| `aiCommit.provider`           | `string`  | `"github"` | AI 提供商：`github` / `openai` / `claude` / `ollama` |
| `aiCommit.apiKey`             | `string`  | -          | API key，留空使用内置 key                            |
| `aiCommit.model`              | `string`  | 根据提供商 | 模型名称                                             |
| `aiCommit.language`           | `string`  | `"zh-CN"`  | 生成语言：`zh-CN` / `en-US`                          |
| `aiCommit.maxTokens`          | `number`  | `200`      | 最大 token 数                                        |
| `aiCommit.detailedDescription` | `boolean` | `true`     | 是否生成详细的修改点描述                             |

## 🎨 配置场景

### 场景一：个人开发者

**需求：**
- 启用 AI commit
- 使用 emoji
- 自动暂存文件
- 不强制要求 ID

**配置：**

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

### 场景二：团队协作

**需求：**
- 统一分支命名规范
- 强制关联 Issue/Story
- 自动推送到远程
- 基于 develop 分支开发

**配置：**

```json
{
  "baseBranch": "develop",
  "requireId": true,
  "featureIdLabel": "Jira ID",
  "hotfixIdLabel": "Bug ID",
  "autoPush": true
}
```

### 场景三：企业级项目

**需求：**
- 严格的分支规范
- 禁用 emoji（CI/CD 兼容性）
- 自定义分支前缀
- 手动选择暂存文件

**配置：**

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
  }
}
```

### 场景四：开源项目

**需求：**
- 英文提交信息
- 使用 emoji
- 不强制 ID
- 基于 main 分支

**配置：**

```json
{
  "baseBranch": "main",
  "requireId": false,
  "useEmoji": true,
  "aiCommit": {
    "enabled": true,
    "language": "en-US"
  }
}
```

## 🔧 配置管理

### 查看当前配置

```bash
# 查看生效的配置
gw config show

# 查看配置文件位置
gw config path
```

### 编辑配置

```bash
# 编辑全局配置
gw config edit --global

# 编辑项目配置
gw config edit --local
```

### 重置配置

```bash
# 重置为默认配置
gw config reset

# 删除配置文件
gw config clean
```

### 验证配置

```bash
# 验证配置文件语法
gw config validate

# 测试配置效果
gw config test
```

## 📚 配置最佳实践

### 1. 分层配置策略

**全局配置（个人偏好）：**
```json
{
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "apiKey": "your-token"
  },
  "useEmoji": true,
  "autoStage": true
}
```

**项目配置（团队规范）：**
```json
{
  "requireId": true,
  "featureIdLabel": "Jira ID",
  "autoPush": true,
  "baseBranch": "develop"
}
```

### 2. 版本控制

**提交项目配置：**
```bash
git add .gwrc.json
git commit -m "chore: add git-workflow config"
```

**忽略敏感信息：**
```gitignore
# .gitignore
.gwrc.local.json  # 本地覆盖配置
```

### 3. 团队协作

**文档化配置：**
```markdown
# 项目配置说明

本项目使用 git-workflow 进行版本管理，配置如下：

- 分支前缀：feature/、hotfix/
- 必须填写 Jira ID
- 基于 develop 分支开发
- 自动推送到远程

## 安装和配置

1. 安装工具：`npm install -g @zjex/git-workflow`
2. 配置已包含在项目中，无需额外配置
3. 开始使用：`gw f` 创建功能分支
```

### 4. 配置迁移

**从旧版本迁移：**
```bash
# 备份旧配置
cp ~/.gwrc.json ~/.gwrc.json.backup

# 重新初始化
gw init --migrate
```

**跨项目复制配置：**
```bash
# 复制配置到新项目
cp project-a/.gwrc.json project-b/.gwrc.json
```

## 🔍 故障排除

### 配置文件语法错误

```bash
❌ 配置文件语法错误: Unexpected token } in JSON
```

**解决方案：**
1. 使用 JSON 验证工具检查语法
2. 重新运行 `gw init` 生成新配置
3. 参考文档中的配置示例

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
1. 检查文件权限：`ls -la ~/.gwrc.json`
2. 修改权限：`chmod 644 ~/.gwrc.json`
3. 使用 sudo（不推荐）

### 配置冲突

```bash
⚠️ 项目配置与全局配置存在冲突
```

**解决方案：**
1. 项目配置优先级更高，会覆盖全局配置
2. 检查配置合并结果：`gw config show`
3. 根据需要调整配置

## 📖 深入学习

- [**配置文件详解**](/config/config-file) - 了解所有配置项的详细说明
- [**AI 配置**](/config/ai-config) - 深入配置 AI commit 功能
- [**分支配置**](/config/branch-config) - 自定义分支管理行为
- [**提交配置**](/config/commit-config) - 配置提交相关功能
- [**配置示例**](/config/examples) - 查看更多实际配置案例

---

通过合理的配置，Git Workflow 可以完美适应你的工作流程。从简单的个人项目到复杂的企业级应用，都能找到合适的配置方案。
