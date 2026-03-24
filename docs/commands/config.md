# Config 命令

配置管理相关的命令详解。

## 📋 命令概览

| 命令 | 说明 |
|------|------|
| `gw init` | 交互式初始化配置 |

## ⚙️ 初始化配置

### 基本用法

```bash
gw init
```

### 配置流程

```bash
$ gw init
⚙️  初始化 git-workflow 配置

? 选择配置范围:
❯ 全局配置（所有项目生效）
  项目配置（仅当前项目）
```

## 🌍 配置范围

### 全局配置

**位置**：`~/.gwrc.json`  
**作用域**：所有项目  
**优势**：一次配置，处处使用

```bash
? 选择配置范围: 全局配置（所有项目生效）

配置保存到: ~/.gwrc.json
✔ 所有项目都会使用此配置
✔ 无需在每个项目中重复配置
✔ 新项目自动继承配置
```

### 项目配置

**位置**：`.gwrc.json`  
**作用域**：当前项目  
**优势**：项目特定配置，团队共享

```bash
? 选择配置范围: 项目配置（仅当前项目）

配置保存到: .gwrc.json
✔ 仅当前项目使用此配置
✔ 可以提交到版本控制
✔ 团队成员共享配置
```

## 🔧 配置项详解

### 基础分支配置

```bash
? 默认基础分支 (留空自动检测 main/master): develop
```

### 分支前缀配置

```bash
? Feature 分支前缀: feature
? Hotfix 分支前缀: hotfix
```

### ID 配置

```bash
? 是否要求必填 ID (Story ID / Issue ID)?
❯ 否
  是

? Feature 分支 ID 标签: Story ID
? Hotfix 分支 ID 标签: Issue ID
```

### Tag 配置

```bash
? 默认 Tag 前缀 (留空则每次选择): v
? Tag 递增基准策略:
❯ 仅基于最新创建的 Tag（默认）
  全量排序
```

### 推送配置

```bash
? 创建分支后是否自动推送?
❯ 每次询问
  自动推送
  不推送
```

### Commit 配置

```bash
? Commit 时是否自动暂存所有更改?
❯ 是
  否

? Commit 时是否使用 emoji?
❯ 是
  否
```

### AI Commit 配置

```bash
? 是否启用 AI Commit 功能?
❯ 是（推荐）
  否

? 选择 AI 提供商:
❯ GitHub Models（免费，推荐）
  OpenAI（付费）
  Claude（付费）
  Ollama（本地）

? 生成的 commit message 语言:
❯ 中文
  English

? 是否生成详细的修改点描述?
❯ 是（包含修改点列表，推荐）
  否（仅生成标题）
```

## 📁 配置文件位置

### 查找顺序

1. **当前目录** - `.gwrc.json`, `.gwrc`, `gw.config.json`
2. **Git 根目录** - 同上文件名
3. **用户主目录** - `~/.gwrc.json`

### 配置合并

**优先级**：项目配置 > 全局配置 > 默认配置

```bash
# 全局配置
~/.gwrc.json
{
  "useEmoji": true,
  "aiCommit": {
    "enabled": true,
    "provider": "github"
  }
}

# 项目配置
.gwrc.json
{
  "requireId": true,
  "featureIdLabel": "Jira ID"
}

# 最终生效配置
{
  "useEmoji": true,           # 来自全局配置
  "requireId": true,          # 来自项目配置
  "featureIdLabel": "Jira ID", # 来自项目配置
  "aiCommit": {
    "enabled": true,          # 来自全局配置
    "provider": "github"      # 来自全局配置
  }
}
```

## 🎯 使用场景

### 个人开发者

**推荐**：全局配置

```bash
gw init
# 选择：全局配置（所有项目生效）
# 配置 AI commit、个人偏好等
```

**优势**：
- 一次配置，所有项目生效
- 新项目自动继承配置
- 无需重复配置

### 团队协作

**推荐**：全局配置 + 项目配置

```bash
# 1. 个人全局配置
gw init
# 选择：全局配置
# 配置 AI commit API key 等个人信息

# 2. 项目团队配置
cd team-project
gw init
# 选择：项目配置
# 配置团队统一的分支规范、ID 要求等
```

**优势**：
- 个人配置私有化
- 团队规范统一化
- 灵活组合配置

### 开源项目

**推荐**：项目配置

```bash
gw init
# 选择：项目配置（仅当前项目）
# 配置项目特定规范
# 提交到版本控制，贡献者共享
```

## 🔄 配置更新

### 重新配置

```bash
# 覆盖现有配置
gw init

? 全局配置文件已存在，是否覆盖?
❯ 否，取消
  是，覆盖
```

### 手动编辑

```bash
# 编辑全局配置
vim ~/.gwrc.json

# 编辑项目配置
vim .gwrc.json
```

### 配置验证

工具会自动验证配置文件格式：

```bash
# 配置文件格式错误时
⚠️  配置文件解析失败: ~/.gwrc.json
使用默认配置继续执行
```

## 📋 配置模板

### 个人开发模板

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

### 团队协作模板

```json
{
  "baseBranch": "develop",
  "requireId": true,
  "featureIdLabel": "Jira ID",
  "hotfixIdLabel": "Bug ID",
  "autoPush": true,
  "autoStage": true,
  "useEmoji": true,
  "aiCommit": {
    "enabled": true,
    "language": "zh-CN",
    "detailedDescription": true
  }
}
```

### 企业级模板

```json
{
  "baseBranch": "develop",
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
    "detailedDescription": true
  }
}
```

## 🚀 最佳实践

### 配置策略

1. **全局配置** - 个人偏好和 API key
2. **项目配置** - 团队规范和项目特定设置
3. **环境变量** - 敏感信息（如 API key）

### 团队配置管理

1. **提交项目配置** - 将 `.gwrc.json` 提交到版本控制
2. **文档说明** - 在 README 中说明配置要求
3. **配置检查** - 在 CI 中检查配置完整性

### 安全考虑

1. **API Key 保护** - 不要将 API key 提交到版本控制
2. **环境变量** - 使用环境变量存储敏感信息
3. **权限控制** - 限制配置文件的访问权限

### 配置维护

1. **定期更新** - 根据需求更新配置
2. **备份配置** - 备份重要的配置文件
3. **版本控制** - 跟踪配置文件的变更历史
