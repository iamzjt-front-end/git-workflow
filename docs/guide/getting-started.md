# 快速开始

本指南将帮助你在几分钟内开始使用 Git Workflow。

## 📦 安装

### 系统要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0（或其他包管理器）
- **Git** >= 2.0.0

### 安装命令

选择你喜欢的包管理器：

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

```bash [Volta]
volta install @zjex/git-workflow
```

:::

### 验证安装

```bash
gw --version
# 输出: v0.2.24
```

如果看到版本号，说明安装成功！

## 🚀 三步开始使用

### 第 1 步：创建全局配置

首次使用建议创建全局配置，这样所有项目都能享受 AI commit 等功能：

```bash
gw init
```

选择配置类型：

```
⚙️  初始化 git-workflow 配置

? 选择配置范围:
❯ 全局配置（所有项目生效）      # 推荐！配置一次，所有项目都能用
  项目配置（仅当前项目）         # 为特定项目自定义配置
```

选择 **全局配置**，然后按提示配置各项参数：

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

💡 如何获取 GitHub Token:
  1. 访问: https://github.com/settings/tokens/new
  2. 勾选 'repo' 权限
  3. 生成并复制 token

? 输入你的 GitHub Token: ghp_xxxxxxxxxxxx
? 选择语言: 中文

✔ 全局配置已保存到: ~/.gwrc.json
```

::: tip 💡 关于 GitHub Token
- 只需要勾选 `repo` 权限
- Token 仅用于调用 GitHub Models API
- 不会访问你的代码仓库
- 每天有 150 次免费调用限额
:::

### 第 2 步：在项目中使用

进入任意 Git 项目目录：

```bash
cd your-project
```

现在你可以使用所有功能了：

```bash
# AI 自动生成 commit message
gw c

# 创建规范的 feature 分支
gw f

# 创建语义化版本 tag
gw t
```

### 第 3 步：享受高效的工作流

恭喜！你已经完成了 Git Workflow 的基础配置。现在可以享受高效的 Git 工作流了。

## 🎯 30 秒上手示例

让我们通过一个完整的示例来体验 Git Workflow：

### 1. 运行交互式菜单

```bash
gw
```

你会看到优雅的 ASCII Art Logo 和操作菜单：

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
  [5] 🏷️  创建 tag               gw t
  [6] 🗑️  删除 tag               gw td
  [7] ✏️  修改 tag               gw tu
  [8] 📋 列出 tags              gw ts
  [9] 📦 发布版本               gw r
  [a] 💾 管理 stash             gw s
  [b] ⚙️  初始化配置             gw init
  [0] ❓ 帮助
  [q] 退出
```

### 2. 创建 feature 分支

选择 `[1]` 或直接运行 `gw f`：

```bash
gw f
? 请输入 Story ID (可跳过): PROJ-123
? 请输入描述: add-user-login
✔ 分支创建成功: feature/20260111-PROJ-123-add-user-login
? 是否推送到远程? 是
✔ 已推送到远程: origin/feature/20260111-PROJ-123-add-user-login
```

### 3. 使用 AI 提交代码

修改一些文件后，使用 AI 自动生成提交信息：

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

### 4. 创建版本标签

功能开发完成后，创建版本标签：

```bash
gw t
? 选择 tag 前缀: v (最新: v1.2.0)
? 选择版本类型:
❯ patch   → v1.2.1
  minor   → v1.3.0
  major   → v2.0.0
  alpha   → v1.2.1-alpha.1
  beta    → v1.2.1-beta.1
  rc      → v1.2.1-rc.1

✔ Tag 创建成功: v1.2.1
✔ Tag 已推送: v1.2.1
```

## 🎨 界面特性

Git Workflow 提供了优雅的命令行界面：

### 颜色编码

- 🟢 **绿色** - 成功信息、分支名
- 🟡 **黄色** - 警告信息、版本号
- 🔴 **红色** - 错误信息
- 🔵 **蓝色** - 链接、命令
- ⚪ **灰色** - 辅助信息、时间

### 图标系统

- ✨ **功能** - feature 相关操作
- 🐛 **修复** - hotfix 相关操作
- 🏷️ **标签** - tag 相关操作
- 📝 **提交** - commit 相关操作
- 💾 **暂存** - stash 相关操作
- ⚙️ **配置** - 配置相关操作

### 键盘操作

- **方向键** - 上下选择选项
- **空格键** - 多选模式下选择/取消选择
- **回车键** - 确认选择
- **Ctrl+C** - 优雅退出

## 🔧 常用命令速查

安装完成后，你可以使用这些常用命令：

| 命令    | 功能                 | 示例                    |
| ------- | -------------------- | ----------------------- |
| `gw`    | 显示交互式菜单       | `gw`                    |
| `gw f`  | 创建 feature 分支    | `gw f --base develop`   |
| `gw h`  | 创建 hotfix 分支     | `gw h`                  |
| `gw c`  | 提交代码（AI 模式）  | `gw c`                  |
| `gw t`  | 创建 tag             | `gw t v`                |
| `gw d`  | 删除分支             | `gw d`                  |
| `gw s`  | 管理 stash           | `gw s`                  |
| `gw r`  | 发布版本             | `gw r`                  |
| `gw ts` | 列出 tags            | `gw ts v`               |
| `gw td` | 删除 tag             | `gw td`                 |
| `gw tu` | 修改 tag             | `gw tu`                 |
| `gw upt`| 更新工具             | `gw upt`                |

## 🎯 下一步

现在你已经掌握了 Git Workflow 的基础用法，可以继续学习：

- [**基础用法**](/guide/basic-usage) - 详细了解每个命令的用法
- [**AI 智能提交**](/guide/ai-commit) - 深入了解 AI commit 功能
- [**配置文件**](/config/) - 自定义工具行为
- [**最佳实践**](/guide/best-practices) - 学习高效的工作流程

## ❓ 遇到问题？

如果在使用过程中遇到问题：

1. **查看帮助** - 运行 `gw --help` 或 `gw` 选择帮助选项
2. **检查版本** - 运行 `gw --version` 确保使用最新版本
3. **更新工具** - 运行 `gw upt` 更新到最新版本
4. **查看文档** - 浏览完整的 [命令参考](/commands/)
5. **反馈问题** - 在 [GitHub Issues](https://github.com/iamzjt-front-end/git-workflow/issues) 提交问题

---

🎉 **恭喜！** 你已经成功开始使用 Git Workflow。享受高效的 Git 工作流吧！