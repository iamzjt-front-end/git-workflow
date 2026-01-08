# @zjex/git-workflow

<p align="center">
  <img src="https://img.shields.io/npm/v/@zjex/git-workflow.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="npm version">
  <img src="https://img.shields.io/npm/dm/@zjex/git-workflow.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="npm downloads">
  <img src="https://img.shields.io/npm/l/@zjex/git-workflow.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="license">
  <img src="https://img.shields.io/badge/node-%3E%3D18-28CF8D?style=flat&colorA=18181B" alt="node version">
</p>

<p align="center">
🚀 极简的 Git 工作流 CLI 工具，让分支管理和版本发布变得轻松愉快
</p>

<p align="center">
  <a href="#特性">特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#命令详解">命令详解</a> •
  <a href="#配置文件">配置文件</a> •
  <a href="#最佳实践">最佳实践</a>
</p>

---

## 为什么选择 @zjex/git-workflow？

在日常开发中，你是否经常遇到这些问题：

- 🤔 每次创建分支都要手动输入一长串命名规范？
- 😫 发布版本时总是忘记当前版本号是多少？
- 📝 提交信息格式不统一，难以生成 CHANGELOG？
- 🔄 删除分支时需要分别处理本地和远程？
- 📋 团队成员的分支命名风格五花八门？

**git-workflow** 就是为解决这些痛点而生的。它提供了一套简洁的命令，让你专注于编码，而不是 Git 操作。

## 特性

- ⚡️ **极速上手** - 零配置开箱即用，交互式菜单引导操作
- 🎯 **规范命名** - 自动生成带日期的规范分支名，告别命名混乱
- 🏷️ **智能版本** - 自动识别当前版本，交互式选择下一版本（支持 semver + 预发布）
- 📝 **规范提交** - 遵循 Conventional Commits + Gitmoji，提交信息更清晰
- 🗑️ **批量清理** - 一键删除本地+远程分支，按最近使用排序
- ⚙️ **灵活配置** - 支持项目级配置文件，不同项目不同规范
- 🎨 **优雅交互** - 友好的命令行界面，支持键盘快捷操作
- 📦 **轻量依赖** - 打包体积小，安装快速无负担

## 快速开始

### 安装

```bash
# npm
npm install -g @zjex/git-workflow

# pnpm
pnpm add -g @zjex/git-workflow

# yarn
yarn global add @zjex/git-workflow
```

### 初次使用

```bash
# 1. 初始化配置（可选，使用默认配置可跳过）
gw init

# 2. 运行交互式菜单
gw

# 3. 或直接使用命令
gw f    # 创建 feature 分支
gw c    # 提交代码
gw t    # 创建 tag
```

### 30 秒上手

```bash
# 交互式菜单（推荐新手）
gw
# 显示 ZJEX Logo 和操作菜单，选择你要执行的操作

# 或直接使用命令
# 创建 feature 分支
gw f
# ? 请输入 Story ID (可跳过): PROJ-123
# ? 请输入描述: add-user-login
# ✔ 分支创建成功: feature/20260107-PROJ-123-add-user-login

# 提交代码
gw c
# ? 选择提交类型: ✨ feat 新功能
# ? 输入简短描述: add user login
# ✔ 提交成功

# 创建 tag
gw t
# ? 选择 tag 前缀: v (最新: v1.2.0)
# ? 选择版本类型: patch → v1.2.1
# ✔ Tag 创建成功: v1.2.1
# ✔ Tag 已推送: v1.2.1

# 删除分支
gw d
# ? 选择要删除的分支: feature/20260105-old-feature (本地+远程)
# ✔ 本地分支已删除
# ✔ 远程分支已删除
```

## 命令详解

### 交互式菜单

直接运行 `gw` 显示交互式菜单，适合新手快速上手：

```bash
gw

 ███████╗     ██╗███████╗██╗  ██╗
 ╚══███╔╝     ██║██╔════╝╚██╗██╔╝
   ███╔╝      ██║█████╗   ╚███╔╝
  ███╔╝  ██   ██║██╔══╝   ██╔██╗
 ███████╗╚█████╔╝███████╗██╔╝ ██╗
 ╚══════╝ ╚════╝ ╚══════╝╚═╝  ╚═╝

  git-workflow v0.0.1

? 选择操作:
  [1] ✨ 创建 feature 分支      gw f
  [2] 🐛 创建 hotfix 分支       gw h
  [3] 🗑️  删除分支               gw d
  [4] 📝 提交代码               gw c
  [5] 🏷️  创建 tag               gw t
  [6] 📋 列出 tags              gw ts
  [7] 📦 发布版本               gw r
  [8] 💾 管理 stash             gw s
  [9] ⚙️  初始化配置             gw init
  [0] ❓ 帮助
  [q] 退出
```

### 分支命令

| 命令                           | 别名              | 说明              |
| ------------------------------ | ----------------- | ----------------- |
| `gw feature [--base <branch>]` | `gw feat`, `gw f` | 创建 feature 分支 |
| `gw hotfix [--base <branch>]`  | `gw fix`, `gw h`  | 创建 hotfix 分支  |
| `gw delete [branch]`           | `gw del`, `gw d`  | 删除本地/远程分支 |

#### 创建分支

```bash
# 基于 main/master 创建（自动检测）
gw f

# 基于指定分支创建
gw f --base develop
gw fix --base release/1.0
```

如果检测到未提交的更改，会询问是否自动暂存 (stash)：

```bash
gw f
# 检测到未提交的更改:
#  M src/index.ts
# ────────────────────────────────────────
# ? 是否暂存 (stash) 这些更改后继续?
#   是
#   否，取消操作
# ✔ 更改已暂存，切换分支后可用 gw s 恢复
```

分支命名格式：

```
feature/YYYYMMDD-<ID>-<描述>
hotfix/YYYYMMDD-<ID>-<描述>

# ID 可跳过
feature/YYYYMMDD-<描述>
```

#### 删除分支

```bash
# 交互式选择（按最近使用排序）
gw d

# 直接删除指定分支
gw d feature/20260101-old-feature
```

删除时会自动检测远程分支是否存在，并询问是否一并删除。

### Tag 命令

| 命令               | 别名    | 说明                     |
| ------------------ | ------- | ------------------------ |
| `gw tags [prefix]` | `gw ts` | 列出 tag（可按前缀过滤） |
| `gw tag [prefix]`  | `gw t`  | 交互式创建 tag           |

#### 列出 Tag

```bash
# 列出所有 tag
gw ts

# 按前缀过滤
gw ts v
gw ts release-
```

#### 创建 Tag

```bash
# 交互式选择前缀和版本
gw t

# 指定前缀
gw t v
```

如果仓库没有任何 tag，会引导创建初始版本：

```bash
gw t
# 当前仓库没有 tag，请输入前缀 (如 v): v
# ? 选择初始版本号:
#   v0.0.1
#   v0.1.0
#   v1.0.0
#   自定义...
```

支持的版本类型：

| 当前版本        | 可选操作                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `v1.2.3`        | patch → `v1.2.4`<br>minor → `v1.3.0`<br>major → `v2.0.0`<br>alpha → `v1.2.4-alpha.1`<br>beta → `v1.2.4-beta.1`<br>rc → `v1.2.4-rc.1` |
| `v1.2.4-beta.1` | pre → `v1.2.4-beta.2`<br>release → `v1.2.4`<br>patch/minor/major...                                                                  |

### 版本命令

| 命令         | 别名   | 说明                                |
| ------------ | ------ | ----------------------------------- |
| `gw release` | `gw r` | 交互式选择版本号并更新 package.json |

```bash
gw r
# 当前版本: 0.0.1
# ? 选择新版本:
#   patch   → 0.0.2
#   minor   → 0.1.0
#   major   → 1.0.0
#   alpha   → 0.0.2-alpha.1
#   beta    → 0.0.2-beta.1
#   rc      → 0.0.2-rc.1
# ✓ 版本号已更新: 0.0.1 → 0.0.2
```

### 配置命令

| 命令      | 说明                            |
| --------- | ------------------------------- |
| `gw init` | 交互式初始化配置文件 .gwrc.json |

```bash
gw init
# 配置 git-workflow，直接回车使用默认值
# ? 默认基础分支 (留空自动检测 main/master):
# ? Feature 分支前缀: feature
# ? Hotfix 分支前缀: hotfix
# ? 是否要求必填 ID? No
# ? 默认 Tag 前缀 (留空则每次选择): v
# ? 创建分支后是否自动推送? 每次询问
# ✓ 配置已保存到 .gwrc.json
```

### Stash 命令

| 命令       | 别名            | 说明             |
| ---------- | --------------- | ---------------- |
| `gw stash` | `gw s`, `gw st` | 交互式管理 stash |

原生 `git stash list` 输出难以阅读，`gw stash` 提供清晰的交互式界面：

```bash
gw st
# 共 3 个 stash:
#
# ? 选择 stash:
#   [0] main fix login bug (3 文件) 2 hours ago
#   [1] develop add new feature (5 文件) 1 day ago
#   [2] main WIP (1 文件) 3 days ago
#   + 创建新 stash
#   取消
```

选择后显示详情并提供操作：

```bash
# Stash #0
# 分支: main
# 消息: fix login bug
# 时间: 2 hours ago
# 文件 (3):
#   • src/auth.ts
#   • src/login.ts
#   • tests/auth.test.ts
# ────────────────────────────────────────
# ? 操作:
#   应用 (保留 stash)
#   弹出 (应用并删除)
#   创建分支          <- 复用 feature/hotfix 命名规范
#   查看差异          <- 查看后返回菜单
#   删除
#   返回列表
#   取消
```

创建 stash 时，如果检测到未跟踪的新文件，会询问是否一并 stash。

### Commit 命令

| 命令        | 别名            | 说明                                        |
| ----------- | --------------- | ------------------------------------------- |
| `gw commit` | `gw c`, `gw cm` | 交互式提交 (Conventional Commits + Gitmoji) |

遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范，并自动添加 [Gitmoji](https://gitmoji.dev/) 表情：

```bash
gw c
# 已暂存的文件:
#   src/index.ts
#   src/utils.ts
# ────────────────────────────────────────
# ? 选择提交类型:
#   ✨  feat       新功能
#   🐛  fix        修复 Bug
#   📝  docs       文档更新
#   💄  style      代码格式 (不影响功能)
#   ♻️  refactor   重构 (非新功能/修复)
#   ⚡️  perf       性能优化
#   ✅  test       测试相关
#   📦  build      构建/依赖相关
#   👷  ci         CI/CD 相关
#   🔧  chore      其他杂项
#   ⏪  revert     回退提交
# ? 输入影响范围 scope (可跳过): auth
# ? 输入简短描述: add login validation
# ? 输入详细描述 (可跳过):
# ? 是否包含破坏性变更 (BREAKING CHANGE)? No
# ? 关联 Issue (如 #123, 可跳过): #42
# ────────────────────────────────────────
# 提交信息预览:
# ✨ feat(auth): add login validation
#
# #42
# ────────────────────────────────────────
# ? 确认提交? Yes
# ✔ 提交成功
# commit: a1b2c3d
```

如果没有暂存的更改，根据配置决定行为：

**默认行为（`autoStage: true`）：**

```bash
gw c
# 没有暂存的更改
# ────────────────────────────────────────
# 未暂存的文件:
#   M src/index.ts
#   M src/utils.ts
# ────────────────────────────────────────
# ✔ 已自动暂存所有更改
```

**手动选择文件（`autoStage: false`）：**

```bash
gw c
# 没有暂存的更改
# ────────────────────────────────────────
# 未暂存的文件:
#   M src/index.ts
#   M src/utils.ts
# ────────────────────────────────────────
# ? 选择要暂存的文件: (使用空格选择)
#   ◉ M src/index.ts
#   ◉ M src/utils.ts
# ✔ 已暂存 2 个文件
```

## 配置文件

在项目根目录创建配置文件，可自定义工具行为。不同项目可以有不同配置，满足多样化需求。

**支持的文件名：** `.gwrc.json` / `.gwrc` / `gw.config.json`

**查找顺序：** 当前目录 → Git 仓库根目录

### 完整配置示例

```json
{
  "baseBranch": "develop",
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix",
  "requireId": true,
  "featureIdLabel": "Story ID",
  "hotfixIdLabel": "Issue ID",
  "defaultTagPrefix": "v",
  "autoPush": true,
  "autoStage": true,
  "useEmoji": true
}
```

### 配置项说明

| 配置项             | 类型      | 默认值       | 说明                                       |
| ------------------ | --------- | ------------ | ------------------------------------------ |
| `baseBranch`       | `string`  | 自动检测     | 默认基础分支，不设置则自动检测 main/master |
| `featurePrefix`    | `string`  | `"feature"`  | feature 分支前缀                           |
| `hotfixPrefix`     | `string`  | `"hotfix"`   | hotfix 分支前缀                            |
| `requireId`        | `boolean` | `false`      | 是否要求必填 ID                            |
| `featureIdLabel`   | `string`  | `"Story ID"` | feature 分支 ID 提示文字                   |
| `hotfixIdLabel`    | `string`  | `"Issue ID"` | hotfix 分支 ID 提示文字                    |
| `defaultTagPrefix` | `string`  | -            | 默认 tag 前缀，设置后跳过选择步骤          |
| `autoPush`         | `boolean` | -            | 创建分支后是否自动推送，不设置则询问       |
| `autoStage`        | `boolean` | `true`       | commit 时是否自动暂存所有更改              |
| `useEmoji`         | `boolean` | `true`       | commit 时是否使用 emoji                    |
| `commitEmojis`     | `object`  | -            | 自定义各类型 commit 的 emoji               |

### 常见配置场景

<details>
<summary><b>场景一：强制要求关联 Issue</b></summary>

```json
{
  "requireId": true,
  "featureIdLabel": "Jira ID",
  "hotfixIdLabel": "Bug ID"
}
```

</details>

<details>
<summary><b>场景二：基于 develop 分支开发</b></summary>

```json
{
  "baseBranch": "develop",
  "autoPush": true
}
```

</details>

<details>
<summary><b>场景三：自定义分支前缀</b></summary>

```json
{
  "featurePrefix": "feat",
  "hotfixPrefix": "fix"
}
```

</details>

<details>
<summary><b>场景四：禁用 Emoji（适合严格的 CI/CD 环境）</b></summary>

```json
{
  "useEmoji": false,
  "autoStage": false
}
```

提交信息格式变为：`feat(scope): description` 而不是 `✨ feat(scope): description`

</details>

<details>
<summary><b>场景五：自定义 Commit Emoji</b></summary>

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

可以只覆盖部分类型，未配置的使用默认 emoji。

</details>

## 最佳实践

### 团队协作

1. **统一配置** - 将 `.gwrc.json` 提交到仓库，确保团队使用相同的分支规范
2. **强制 ID** - 开启 `requireId`，确保每个分支都能追溯到需求/Issue
3. **自动推送** - 开启 `autoPush`，减少遗忘推送的情况

### 版本发布

1. **预发布测试** - 使用 alpha/beta/rc 版本进行测试
2. **语义化版本** - 遵循 semver 规范，bug 修复用 patch，新功能用 minor，破坏性变更用 major

### 分支清理

定期使用 `gw d` 清理已合并的分支，保持仓库整洁。

## 与其他工具对比

| 特性         | git-workflow  | git-flow    | 手动操作  |
| ------------ | ------------- | ----------- | --------- |
| 学习成本     | ⭐ 极低       | ⭐⭐⭐ 较高 | ⭐⭐ 中等 |
| 分支命名规范 | ✅ 自动生成   | ❌ 需手动   | ❌ 需手动 |
| 版本号管理   | ✅ 智能递增   | ❌ 需手动   | ❌ 需手动 |
| 交互式操作   | ✅ 支持       | ❌ 不支持   | ❌ 不支持 |
| 配置灵活性   | ✅ 项目级配置 | ⚠️ 有限     | -         |
| 远程分支同步 | ✅ 自动处理   | ⚠️ 部分     | ❌ 需手动 |

## 开发

```bash
# 克隆仓库
git clone https://github.com/iamzjt-front-end/git-workflow.git
cd git-workflow

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 本地测试
npm link
```

## 发布

```bash
# 自动化发布（推荐）
npm run release

# 手动发布
npm run build
npm run changelog
npm version patch  # 或 minor/major
git push origin main --tags
npm publish
```

详见 [发布脚本文档](./scripts/README.md)

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

[MIT](./LICENSE) License © 2026

---

<p align="center">
  如果这个工具对你有帮助，请给个 ⭐️ 支持一下！
</p>
