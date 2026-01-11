---
layout: home

hero:
  name: "Git Workflow"
  text: "极简的 Git 工作流 CLI 工具"
  tagline: "让分支管理和版本发布变得轻松愉快"
  image:
    src: /hero-logo.svg
    alt: Git Workflow Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/iamzjt-front-end/git-workflow

features:
  - icon: 🤖
    title: AI 智能提交
    details: 使用 AI 自动分析代码变更生成 commit message，支持 GitHub Models、OpenAI 等多种提供商
  - icon: 🎯
    title: 规范命名
    details: 自动生成带日期的规范分支名，如 feature/20260109-PROJ-123-add-login
  - icon: 📋
    title: 优雅日志
    details: GitHub 风格的提交历史查看，时间线分组，交互式浏览，支持搜索和过滤
  - icon: 🏷️
    title: 智能版本
    details: 自动识别当前版本，交互式选择下一版本，支持 semver + 预发布版本
  - icon: 📝
    title: 规范提交
    details: 遵循 Conventional Commits + Gitmoji，提交信息更清晰规范
  - icon: 🗑️
    title: 批量清理
    details: 一键删除本地+远程分支，按最近使用排序，智能检测远程分支状态
  - icon: 💾
    title: Stash 管理
    details: 可视化管理 stash，支持预览、应用、创建分支等操作
  - icon: ⚙️
    title: 灵活配置
    details: 支持项目级和全局配置，不同项目可使用不同规范
  - icon: 🔔
    title: 版本提醒
    details: 自动检测新版本，一键更新，保持工具始终最新
---

## 🎯 为什么选择 Git Workflow？

在日常开发中，你是否经常遇到这些问题：

- 🤔 每次创建分支都要手动输入一长串命名规范？
- 😫 发布版本时总是忘记当前版本号是多少？
- 📝 提交信息格式不统一，难以生成 CHANGELOG？
- 🔄 删除分支时需要分别处理本地和远程？
- 📋 团队成员的分支命名风格五花八门？
- 💬 写 commit message 总是词穷，不知道怎么描述？

**Git Workflow** 就是为解决这些痛点而生的。它提供了一套简洁的命令，让你专注于编码，而不是 Git 操作。

## ⚡️ 快速开始

### 安装

::: code-group

```bash [npm]
npm install -g @zjex/git-workflow
```

```bash [pnpm]
pnpm add -g @zjex/git-workflow
```

```bash [yarn]
yarn global add @zjex/git-workflow
```

:::

### 三步开始使用

```bash
# 第 1 步：创建全局配置（只需一次）
gw init
# 选择 "全局配置（所有项目生效）"
# 配置 AI commit、分支规范等

# 第 2 步：在任意项目中使用
cd your-project
gw c                    # AI 自动生成 commit message
gw f                    # 创建规范的 feature 分支
gw t                    # 创建语义化版本 tag

# 第 3 步：享受高效的 Git 工作流 🎉
```

## 🌟 核心特性

### 🤖 AI 智能提交

使用 AI 自动分析代码变更生成 commit message，2-3 秒完成，支持多种 AI 提供商：

```bash
gw c
# 已暂存的文件:
#   src/auth.ts
#   src/login.ts
# ────────────────────────────────────────
# ? 选择 commit 方式:
# ❯ 🤖 AI 自动生成 commit message
#   ✍️  手动编写 commit message
#
# ✔ AI 生成完成
#
# AI 生成的 commit message:
# ✨ feat(auth): 添加用户登录功能
```

### 🎯 规范分支命名

自动生成带日期的规范分支名，支持自定义前缀和 ID 标签：

```bash
gw f
# ? 请输入 Story ID (可跳过): PROJ-123
# ? 请输入描述: add-user-login
# ✔ 分支创建成功: feature/20260109-PROJ-123-add-user-login
```

### 📋 优雅的提交历史

GitHub 风格的提交历史查看，让代码历史一目了然：

```bash
gw log
# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                                Git 提交历史                                │
# ├─────────────────────────────────────────────────────────────────────────────┤
# │                                                                             │
# │ 📅 今天                                                                     │
# │                                                                             │
# │ ✅ test: 完善commit message格式化测试用例                                   │
# │    🔗 #8d74ffa • 2小时前 • zjex                                            │
# │                                                                             │
# │ 🔧 chore: 删除重复的测试文件                                               │
# │    🔗 #746aa87 • 3小时前 • zjex                                            │
# │                                                                             │
# │ 📅 昨天                                                                     │
# │                                                                             │
# │ ✨ feat(log): 实现GitHub风格的提交历史查看                                  │
# │    🔗 #a1b2c3d • 1天前 • zjex                                              │
# │    🔖 v0.3.0                                                               │
# └─────────────────────────────────────────────────────────────────────────────┘
```

### 🏷️ 智能版本管理

自动检测现有 tag 前缀，智能递增版本号：

```bash
gw t
# ? 选择 tag 前缀: v (最新: v1.2.0)
# ? 选择版本类型:
# ❯ patch   → v1.2.1
#   minor   → v1.3.0
#   major   → v2.0.0
#   alpha   → v1.2.1-alpha.1
```

### 💾 可视化 Stash 管理

原生 `git stash list` 输出难以阅读，Git Workflow 提供清晰的交互式界面：

```bash
gw s
# 共 3 个 stash:
#
# ? 选择 stash:
#   [0] main fix login bug (3 文件) 2 hours ago
#   [1] develop add new feature (5 文件) 1 day ago
#   [2] main WIP (1 文件) 3 days ago
#   + 创建新 stash
#   取消
```

## 📊 与其他工具对比

| 特性             | Git Workflow  | git-flow    | 手动操作  |
| ---------------- | ------------- | ----------- | --------- |
| 学习成本         | ⭐ 极低       | ⭐⭐⭐ 较高 | ⭐⭐ 中等 |
| 分支命名规范     | ✅ 自动生成   | ❌ 需手动   | ❌ 需手动 |
| 版本号管理       | ✅ 智能递增   | ❌ 需手动   | ❌ 需手动 |
| AI Commit        | ✅ 支持       | ❌ 不支持   | ❌ 不支持 |
| 提交历史查看     | ✅ GitHub风格 | ❌ 不支持   | ⚠️ 原生命令 |
| Stash 可视化管理 | ✅ 支持       | ❌ 不支持   | ❌ 不支持 |
| 交互式操作       | ✅ 支持       | ❌ 不支持   | ❌ 不支持 |
| 配置灵活性       | ✅ 项目级配置 | ⚠️ 有限     | -         |

## 🎨 优雅的用户界面

Git Workflow 提供优雅的命令行界面，支持键盘快捷操作：

```
 ███████╗     ██╗███████╗██╗  ██╗
 ╚══███╔╝     ██║██╔════╝╚██╗██╔╝
   ███╔╝      ██║█████╗   ╚███╔╝
  ███╔╝  ██   ██║██╔══╝   ██╔██╗
 ███████╗╚█████╔╝███████╗██╔╝ ██╗
 ╚══════╝ ╚════╝ ╚══════╝╚═╝  ╚═╝

  git-workflow v0.2.24

? 选择操作:
  [1] ✨ 创建 feature 分支      gw f
  [2] 🐛 创建 hotfix 分支       gw h
  [3] 🗑️  删除分支               gw d
  [4] 📝 提交代码               gw c
  [5] 📋 查看提交历史           gw log
  [6] 🏷️  创建 tag               gw t
  ...
```

## 🤝 社区与支持

- 📖 [完整文档](/guide/)
- 🐛 [问题反馈](https://github.com/iamzjt-front-end/git-workflow/issues)
- 💡 [功能建议](https://github.com/iamzjt-front-end/git-workflow/discussions)
- 📦 [npm 包](https://www.npmjs.com/package/@zjex/git-workflow)

---

<div style="text-align: center; margin-top: 2rem;">
  <strong>如果这个工具对你有帮助，请给个 ⭐️ 支持一下！</strong>
</div>