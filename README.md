# @zjex/git-workflow

<p align="center">
  <a href="https://iamzjt-front-end.github.io/git-workflow/">
    <img src="./zjex-logo.svg" alt="zjex logo" width="200" />
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@zjex/git-workflow"><img src="https://img.shields.io/npm/v/@zjex/git-workflow?style=flat&colorA=18181B&colorB=F0DB4F" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@zjex/git-workflow"><img src="https://img.shields.io/npm/dt/@zjex/git-workflow?style=flat&colorA=18181B&colorB=3178C6" alt="npm downloads"></a>
  <a href="https://github.com/iamzjt-front-end/git-workflow"><img src="https://img.shields.io/github/stars/iamzjt-front-end/git-workflow?style=flat&colorA=18181B&colorB=F59E0B" alt="github stars"></a>
  <a href="https://github.com/iamzjt-front-end/git-workflow/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@zjex/git-workflow?style=flat&colorA=18181B&colorB=10B981" alt="license"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-339933?style=flat&logo=node.js&logoColor=white&colorA=18181B" alt="node version"></a>
  <a href="https://github.com/iamzjt-front-end/git-workflow/actions"><img src="https://img.shields.io/badge/tests-579%20passed-success?style=flat&colorA=18181B" alt="tests"></a>
  <a href="https://github.com/iamzjt-front-end/git-workflow/issues"><img src="https://img.shields.io/github/issues/iamzjt-front-end/git-workflow?style=flat&colorA=18181B&colorB=EC4899" alt="issues"></a>
</p>

<p align="center">
  <strong>🚀 极简的 Git 工作流 CLI 工具，让分支管理和版本发布变得轻松愉快</strong>
</p>

<p align="center">
  <strong>📚 <a href="https://iamzjt-front-end.github.io/git-workflow/">完整文档</a> | 🚀 <a href="https://iamzjt-front-end.github.io/git-workflow/guide/getting-started">快速开始</a> | 📖 <a href="https://iamzjt-front-end.github.io/git-workflow/commands/">命令参考</a> | ⚙️ <a href="https://iamzjt-front-end.github.io/git-workflow/config/">配置指南</a></strong>
</p>

---

## 🎯 为什么选择 git-workflow？

在日常开发中，你是否经常遇到这些问题：

- 🤔 每次创建分支都要手动输入一长串命名规范？
- 😫 发布版本时总是忘记当前版本号是多少？
- 📝 提交信息格式不统一，难以生成 CHANGELOG？
- 🔄 删除分支时需要分别处理本地和远程？
- 📋 团队成员的分支命名风格五花八门？
- 💬 写 commit message 总是词穷，不知道怎么描述？

**git-workflow** 就是为解决这些痛点而生的。它提供了一套简洁的命令，让你专注于编码，而不是 Git 操作。

## ✨ 核心特性

### 🤖 AI 智能提交

- 使用 AI 自动分析代码变更生成 commit message（2-3 秒完成）
- 支持 GitHub Models（免费）、OpenAI、Claude、Ollama 等多种提供商
- 遵循 Conventional Commits + Gitmoji 规范

### 🔍 AI 代码审查

- 使用 AI 对代码变更进行智能审查，生成详细的 Markdown 审查报告
- 支持审查暂存区、指定 commit 或交互式选择多个 commits
- 问题分级（🔴 严重 / 🟡 警告 / 🔵 建议），提供具体代码改进建议
- 覆盖代码质量、安全问题、性能问题、最佳实践等多个维度

### 🎯 规范分支管理

- 自动生成带日期的规范分支名（`feature/20260109-PROJ-123-add-login`）
- 智能检测基础分支（main/master），支持自定义
- 一键删除本地+远程分支，按最近使用排序

### 🏷️ 智能版本管理

- 自动识别当前版本，交互式选择下一版本
- 支持 semver + 预发布版本（alpha/beta/rc）
- 自动检测 tag 前缀，支持多种命名规范

### 💾 可视化 Stash 管理

- 清晰的交互式界面，告别难读的 `git stash list`
- 支持预览、应用、创建分支等操作
- 智能处理未跟踪文件

### ⚙️ 灵活配置

- 支持全局配置（一次配置，所有项目生效）
- 支持项目级配置（团队统一规范）
- 零配置开箱即用，交互式菜单引导操作

## ⚡️ 快速开始

### 安装

```bash
# npm
npm install -g @zjex/git-workflow

# pnpm
pnpm add -g @zjex/git-workflow

# yarn
yarn global add @zjex/git-workflow
```

> **💡 安装后第一件事：** 运行 `gw init` 创建全局配置，启用 AI commit 等功能！

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

### 初次使用

```bash
# 1. 查看版本
gw --version

# 2. 创建全局配置（推荐，一次配置所有项目生效）
gw init
# 选择 "全局配置（所有项目生效）"
# 配置 AI commit、分支规范等

# 3. 运行交互式菜单
gw

# 4. 或直接使用命令
gw f       # 创建 feature 分支
gw c       # 提交代码（可使用 AI 自动生成）
gw review  # AI 代码审查
gw t       # 创建 tag
gw d       # 删除分支
gw s       # 管理 stash
```

**💡 提示：** 创建全局配置后，所有项目都能使用 AI commit 等功能，无需重复配置！

### 30 秒上手示例

```bash
# 📋 交互式菜单（推荐新手）
gw

 ███████╗     ██╗███████╗██╗  ██╗
 ╚══███╔╝     ██║██╔════╝╚██╗██╔╝
   ███╔╝      ██║█████╗   ╚███╔╝
  ███╔╝  ██   ██║██╔══╝   ██╔██╗
 ███████╗╚█████╔╝███████╗██╔╝ ██╗
 ╚══════╝ ╚════╝ ╚══════╝╚═╝  ╚═╝

  git-workflow v0.5.0

? 选择操作:
  [1] ✨ 创建 feature 分支      gw f
  [2] 🐛 创建 hotfix 分支       gw h
  [3] 🗑️  删除分支               gw d
  [4] 📝 提交代码               gw c
  [5] 🏷️  创建 tag               gw t
  ...

# ✨ 创建 feature 分支
gw f
? 请输入 Story ID (可跳过): PROJ-123
? 请输入描述: add-user-login
✔ 分支创建成功: feature/20260109-PROJ-123-add-user-login

# 📝 AI 智能提交
gw c
✔ AI 生成完成

AI 生成的 commit message:
✨ feat(auth): 添加用户登录功能
────────────────────────────────────────
? 使用这个 commit message?
❯ ✅ 使用

✔ 提交成功

# 🏷️ 创建 tag
gw t
? 选择版本类型:
❯ patch   → v1.2.1
  minor   → v1.3.0
  major   → v2.0.0

✔ Tag 创建成功: v1.2.1
```

### 🔍 AI 代码审查示例

```bash
# AI 代码审查
gw review
? 选择要审查的内容 (空格选择，回车确认):
❯ ◯ 📦 暂存区的更改 (staged changes)
  ◯ abc1234 feat: 添加用户登录功能 - 张三 (2024-01-20)
  ◯ def5678 fix: 修复数据获取失败 - 李四 (2024-01-19)

────────────────────────────────────────
📊 变更统计:
   文件: 3 个
   新增: +45 行
   删除: -12 行
────────────────────────────────────────
✔ AI 审查完成

✅ 审查报告已生成: .gw-reviews/review-abc1234-2024-01-20T10-30-00.md

# 审查指定 commit
gw review abc1234

# 审查最近 5 个 commits
gw review -n 5

# 审查暂存区
gw review -s
```

## 📚 完整文档

想了解更多功能和用法？查看我们的完整文档：

- 📖 **[完整文档](https://iamzjt-front-end.github.io/git-workflow/)** - 详细的功能介绍和使用指南
- 🚀 **[快速开始](https://iamzjt-front-end.github.io/git-workflow/guide/getting-started)** - 5 分钟上手指南
- 📋 **[命令参考](https://iamzjt-front-end.github.io/git-workflow/commands/)** - 所有命令的详细说明
- ⚙️ **[配置指南](https://iamzjt-front-end.github.io/git-workflow/config/)** - 配置文件详解和最佳实践
- 🤖 **[AI 配置](https://iamzjt-front-end.github.io/git-workflow/config/ai-config)** - AI 提供商配置指南
- 🌿 **[分支管理](https://iamzjt-front-end.github.io/git-workflow/guide/branch-management)** - 分支命名规范和管理技巧
- 🏷️ **[Tag 管理](https://iamzjt-front-end.github.io/git-workflow/guide/tag-management)** - 版本标签管理和语义化版本
- 💾 **[Stash 管理](https://iamzjt-front-end.github.io/git-workflow/guide/stash-management)** - 可视化 stash 操作指南
- � **[团队协作](https://iamzjt-front-end.github.io/git-workflow/guide/team-collaboration)** - 团队配置和最佳实践

## 🛠️ 开发与贡献

想要参与开发或了解更多技术细节？查看我们的开发文档：

- 🔧 **[开发指南](https://iamzjt-front-end.github.io/git-workflow/guide/development)** - 本地开发环境搭建
- 🧪 **[测试指南](https://iamzjt-front-end.github.io/git-workflow/guide/testing)** - 测试框架和覆盖率
- 📋 **[API 文档](https://iamzjt-front-end.github.io/git-workflow/guide/api)** - 内部 API 参考
- 🤝 **[贡献指南](https://iamzjt-front-end.github.io/git-workflow/guide/contributing)** - 如何参与贡献

### 快速开发

```bash
# 克隆仓库
git clone https://github.com/iamzjt-front-end/git-workflow.git
cd git-workflow

# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 构建
npm run build
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！在提交 PR 之前，请确保：

1. 代码通过 TypeScript 类型检查
2. 遵循现有的代码风格
3. 添加必要的测试用例
4. 更新相关文档

详细贡献指南请查看：[贡献指南](https://iamzjt-front-end.github.io/git-workflow/guide/contributing)

## 📄 License

[MIT](./LICENSE) License © 2026 [zjex](https://github.com/iamzjt-front-end)

## 🙏 致谢

感谢所有贡献者和使用者的支持！

---

<p align="center">
  <strong>📚 <a href="https://iamzjt-front-end.github.io/git-workflow/">完整文档</a> | 🚀 <a href="https://iamzjt-front-end.github.io/git-workflow/guide/getting-started">快速开始</a> | 📖 <a href="https://iamzjt-front-end.github.io/git-workflow/commands/">命令参考</a> | ⚙️ <a href="https://iamzjt-front-end.github.io/git-workflow/config/">配置指南</a></strong>
</p>

<p align="center">
  <strong>如果这个工具对你有帮助，请给个 ⭐️ 支持一下！</strong>
</p>

<p align="center">
  <a href="https://github.com/iamzjt-front-end/git-workflow">GitHub</a> •
  <a href="https://www.npmjs.com/package/@zjex/git-workflow">npm</a> •
  <a href="https://github.com/iamzjt-front-end/git-workflow/issues">Issues</a> •
  <a href="https://iamzjt-front-end.github.io/git-workflow/">文档</a>
</p>
