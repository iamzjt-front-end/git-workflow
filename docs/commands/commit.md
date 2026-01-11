# 提交命令

提交命令是 Git Workflow 的核心功能，支持 AI 自动生成和手动编写两种模式，让你的提交信息更规范、更准确。

## 📋 命令概览

| 命令        | 别名            | 功能                                        |
| ----------- | --------------- | ------------------------------------------- |
| `gw commit` | `gw c`, `gw cm` | 交互式提交 (Conventional Commits + Gitmoji) |

## 🚀 基本用法

```bash
gw c
# 或
gw commit
gw cm
```

## 🤖 AI 自动生成模式

### 快速体验

```bash
gw c
已暂存的文件:
  src/auth.ts
  src/login.ts
────────────────────────────────────────
? 选择 commit 方式:
❯ 🤖 AI 自动生成 commit message
  ✍️  手动编写 commit message

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

✔ 提交成功
commit: a1b2c3d
```

### AI 生成特点

- **⚡️ 快速** - 2-3 秒内完成分析和生成
- **🎯 准确** - 自动识别 feat/fix/docs 等提交类型
- **📝 规范** - 符合 Conventional Commits 标准
- **🇨🇳 多语言** - 支持中文和英文
- **🔄 可预览** - 生成后可预览，不满意可切换到手动模式
- **🛡️ 隐私保护** - 只分析 git diff，不上传完整代码

### 支持的 AI 提供商

| 提供商        | 费用   | 特点                           | 推荐指数 |
| ------------- | ------ | ------------------------------ | -------- |
| GitHub Models | 免费   | 每天 150 次，需要 GitHub Token | ⭐⭐⭐⭐⭐ |
| OpenAI        | 付费   | 质量高，速度快                 | ⭐⭐⭐⭐   |
| Claude        | 付费   | 理解能力强，适合复杂变更       | ⭐⭐⭐⭐   |
| Ollama        | 免费   | 本地运行，完全私有             | ⭐⭐⭐     |

### AI 配置

详细的 AI 配置请参考 [AI 智能提交](/guide/ai-commit) 章节。

## ✍️ 手动编写模式

### 交互式流程

```bash
gw c
已暂存的文件:
  src/index.ts
  src/utils.ts
────────────────────────────────────────
? 选择 commit 方式:
  🤖 AI 自动生成 commit message
❯ ✍️  手动编写 commit message

? 选择提交类型:
❯ ✨  feat       新功能
  🐛  fix        修复 Bug
  📝  docs       文档更新
  💄  style      代码格式 (不影响功能)
  ♻️  refactor   重构 (非新功能/修复)
  ⚡️  perf       性能优化
  ✅  test       测试相关
  📦  build      构建/依赖相关
  👷  ci         CI/CD 相关
  🔧  chore      其他杂项
  ⏪  revert     回退提交

? 输入影响范围 scope (可跳过): auth
? 输入简短描述: add login validation
? 输入详细描述 (可跳过): 
- 添加用户名长度验证
- 添加密码强度检查
- 集成验证码功能

? 是否包含破坏性变更 (BREAKING CHANGE)?
❯ 否
  是

? 关联 Issue (如 #123, 可跳过): #42

────────────────────────────────────────
提交信息预览:
✨ feat(auth): add login validation

- 添加用户名长度验证
- 添加密码强度检查
- 集成验证码功能

#42
────────────────────────────────────────
? 确认提交?
❯ ✅ 确认提交
  ❌ 取消

✔ 提交成功
commit: a1b2c3d
```

### 提交类型详解

| 类型       | Emoji | 说明                           | 示例                                    |
| ---------- | ----- | ------------------------------ | --------------------------------------- |
| `feat`     | ✨    | 新功能                         | `feat(auth): 添加用户登录功能`          |
| `fix`      | 🐛    | Bug 修复                       | `fix(api): 修复用户数据获取失败问题`    |
| `docs`     | 📝    | 文档更新                       | `docs: 更新 API 使用说明`               |
| `style`    | 💄    | 代码格式（不影响功能）         | `style: 统一代码缩进格式`               |
| `refactor` | ♻️    | 重构（非新功能/修复）          | `refactor(utils): 优化数据处理逻辑`     |
| `perf`     | ⚡️   | 性能优化                       | `perf(db): 优化数据库查询性能`          |
| `test`     | ✅    | 测试相关                       | `test: 添加用户认证单元测试`            |
| `build`    | 📦    | 构建/依赖相关                  | `build: 升级 webpack 到 5.0`           |
| `ci`       | 👷    | CI/CD 相关                     | `ci: 添加自动部署脚本`                  |
| `chore`    | 🔧    | 其他杂项                       | `chore: 更新依赖版本`                   |
| `revert`   | ⏪    | 回退提交                       | `revert: 回退用户认证功能`              |

### 提交信息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**示例：**

```
✨ feat(auth): 添加用户登录功能

- 实现用户名密码验证
- 添加登录状态管理
- 集成 JWT token 处理

BREAKING CHANGE: 移除了旧的认证 API
Closes #123
```

### 破坏性变更

当代码包含不兼容的 API 变更时，需要标记为破坏性变更：

```bash
? 是否包含破坏性变更 (BREAKING CHANGE)?
❯ 是

? 描述破坏性变更:
移除了 getUserInfo() 方法，请使用 getUser() 替代
```

生成的提交信息：
```
✨ feat(api): 重构用户信息接口

BREAKING CHANGE: 移除了 getUserInfo() 方法，请使用 getUser() 替代
```

## 📁 文件暂存处理

### 自动暂存模式

如果配置了 `autoStage: true`（默认），Git Workflow 会自动暂存所有更改：

```bash
gw c
没有暂存的更改
────────────────────────────────────────
未暂存的文件:
  M src/index.ts
  M src/utils.ts
  ?? src/new-file.ts
────────────────────────────────────────
✔ 已自动暂存所有更改
```

### 手动选择模式

如果配置了 `autoStage: false`，可以手动选择要暂存的文件：

```bash
gw c
没有暂存的更改
────────────────────────────────────────
未暂存的文件:
  M src/index.ts
  M src/utils.ts
  ?? src/new-file.ts
────────────────────────────────────────
? 选择要暂存的文件: (使用空格选择)
❯ ◉ M src/index.ts
  ◉ M src/utils.ts
  ◯ ?? src/new-file.ts

✔ 已暂存 2 个文件
```

**操作说明：**
- **方向键** - 上下移动光标
- **空格键** - 选择/取消选择文件
- **回车键** - 确认选择
- **a 键** - 全选/取消全选

### 已暂存文件显示

如果已经有暂存的文件，会直接显示：

```bash
gw c
已暂存的文件:
  src/auth.ts
  src/login.ts
  src/types.ts
────────────────────────────────────────
? 选择 commit 方式:
❯ 🤖 AI 自动生成 commit message
  ✍️  手动编写 commit message
```

## ⚙️ 配置选项

### 基础配置

```json
{
  "autoStage": true,
  "useEmoji": true
}
```

| 配置项      | 类型      | 默认值 | 说明                          |
| ----------- | --------- | ------ | ----------------------------- |
| `autoStage` | `boolean` | `true` | commit 时是否自动暂存所有更改 |
| `useEmoji`  | `boolean` | `true` | commit 时是否使用 emoji       |

### 自定义 Emoji

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

### AI 配置

```json
{
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "apiKey": "ghp_xxxxxxxxxxxx",
    "model": "gpt-4o-mini",
    "language": "zh-CN",
    "maxTokens": 200
  }
}
```

详细配置请参考 [AI 配置](/config/ai-config) 章节。

## 🎯 使用场景

### 场景一：功能开发

```bash
# 开发新功能
# 修改了 src/auth.ts, src/login.tsx

gw c
# 选择 AI 模式
# AI 生成: ✨ feat(auth): 添加用户登录功能
```

### 场景二：Bug 修复

```bash
# 修复登录问题
# 修改了 src/auth.ts

gw c
# 选择 AI 模式
# AI 生成: 🐛 fix(auth): 修复登录验证失败问题
```

### 场景三：文档更新

```bash
# 更新 README.md

gw c
# 选择手动模式
# 类型: docs
# 描述: 更新安装说明
# 生成: 📝 docs: 更新安装说明
```

### 场景四：重构代码

```bash
# 重构工具函数
# 修改了 src/utils.ts

gw c
# 选择 AI 模式
# AI 生成: ♻️ refactor(utils): 优化数据处理函数
```

### 场景五：破坏性变更

```bash
# 重构 API 接口
# 修改了 src/api.ts

gw c
# 选择手动模式
# 类型: feat
# 范围: api
# 描述: 重构用户接口
# 破坏性变更: 是
# 描述: 移除了 getUserInfo 方法
# 生成: ✨ feat(api): 重构用户接口
#       BREAKING CHANGE: 移除了 getUserInfo 方法
```

## 🔧 高级技巧

### 技巧一：分批提交

将大的变更拆分成多个小的、逻辑清晰的提交：

```bash
# 只暂存认证相关文件
git add src/auth.ts src/types/auth.ts
gw c
# AI 生成: ✨ feat(auth): 添加用户认证逻辑

# 再暂存 UI 相关文件
git add src/components/Login.tsx
gw c
# AI 生成: ✨ feat(ui): 添加登录界面组件
```

### 技巧二：使用 scope 组织代码

通过 scope 明确变更的模块：

```bash
# 数据库相关
gw c
# scope: db
# 生成: ✨ feat(db): 添加用户表结构

# API 相关
gw c
# scope: api
# 生成: ✨ feat(api): 添加用户接口

# UI 相关
gw c
# scope: ui
# 生成: ✨ feat(ui): 添加用户界面
```

### 技巧三：关联 Issue

将提交与 Issue 关联，便于追踪：

```bash
gw c
# 关联 Issue: #123
# 生成: ✨ feat(auth): 添加用户登录功能
#       
#       #123
```

**支持的关键词：**
- `Closes #123` - 关闭 Issue
- `Fixes #123` - 修复 Issue
- `Resolves #123` - 解决 Issue
- `#123` - 引用 Issue

### 技巧四：多行描述

对于复杂的变更，添加详细描述：

```bash
gw c
# 详细描述:
# - 实现用户名密码验证
# - 添加记住登录状态功能
# - 集成第三方登录（Google, GitHub）
# - 添加登录失败重试机制
```

### 技巧五：AI 生成后微调

AI 生成的提交信息可以作为基础，然后手动微调：

```bash
gw c
# AI 生成: ✨ feat(auth): 添加用户登录功能
# 选择 "❌ 不使用，切换到手动模式"
# 在 AI 生成的基础上进行微调
```

## 🚨 常见问题

### 问题一：没有暂存的文件

```bash
gw c
❌ 没有暂存的更改，也没有未暂存的更改
```

**解决方案：**
1. 确认是否有文件修改：`git status`
2. 手动暂存文件：`git add .`
3. 或者先修改文件再提交

### 问题二：AI 生成失败

```bash
❌ AI 生成失败: API key invalid
```

**解决方案：**
1. 检查 AI 配置是否正确
2. 验证 API key 是否有效
3. 检查网络连接
4. 切换到手动模式

### 问题三：提交信息过长

```bash
⚠️ 提交信息标题过长，建议控制在 50 字符以内
```

**解决方案：**
1. 简化描述，突出核心变更
2. 将详细信息放到 body 部分
3. 使用更精确的动词

### 问题四：emoji 显示异常

```bash
# 显示为方块或问号
□ feat(auth): 添加用户登录功能
```

**解决方案：**
1. 确保终端支持 Unicode
2. 安装支持 emoji 的字体
3. 或在配置中禁用 emoji：
```json
{
  "useEmoji": false
}
```

### 问题五：暂存区冲突

```bash
❌ 暂存区存在冲突，请先解决冲突
```

**解决方案：**
1. 查看冲突文件：`git status`
2. 解决冲突后重新暂存：`git add .`
3. 然后再次提交：`gw c`

## 📊 提交质量度量

### 好的提交信息特征

- ✅ **类型明确** - 使用正确的提交类型
- ✅ **描述清晰** - 简洁明了地描述变更内容
- ✅ **范围明确** - 使用 scope 指明影响范围
- ✅ **格式规范** - 遵循 Conventional Commits 格式
- ✅ **关联明确** - 关联相关的 Issue 或 PR

### 提交信息示例

**优秀示例：**
```
✨ feat(auth): 添加 OAuth2 登录支持

- 集成 Google OAuth2 认证
- 添加用户信息自动同步
- 支持登录状态持久化

Closes #123
```

**需要改进的示例：**
```
fix bug          # 太模糊，不知道修复了什么
update code      # 没有说明更新了什么
feat: new stuff  # 描述不清晰
```

## 📚 相关命令

- [**gw f**](/commands/branch#创建-feature-分支) - 创建功能分支
- [**gw s**](/commands/stash) - 管理代码暂存
- [**gw t**](/commands/tag) - 创建版本标签
- [**gw r**](/commands/release) - 发布版本

---

通过 Git Workflow 的提交命令，你可以轻松创建规范、准确的提交信息。无论是使用 AI 自动生成还是手动编写，都能确保提交历史的清晰和可追溯性。