# 基础用法

本指南介绍 Git Workflow 的基础用法，帮助你快速掌握日常开发中最常用的功能。

## 🎯 核心工作流程

Git Workflow 的核心理念是简化 Git 操作，让你专注于代码开发。基本工作流程如下：

```mermaid
graph LR
    A[创建分支] --> B[开发代码]
    B --> C[提交代码]
    C --> D[创建标签]
    D --> E[清理分支]
```

## 📋 交互式菜单

### 启动主菜单

```bash
gw
```

你会看到优雅的主菜单：

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

### 菜单操作

- **数字键** - 选择对应功能
- **字母键** - 选择对应功能（a, b）
- **方向键** - 上下移动选择
- **回车键** - 确认选择
- **q 键** - 退出程序
- **Ctrl+C** - 优雅退出

## 🌿 分支管理基础

### 创建 Feature 分支

```bash
gw f
```

**交互流程：**
```bash
? 请输入 Story ID (可跳过): PROJ-123
? 请输入描述: add-user-profile
✔ 分支创建成功: feature/20260111-PROJ-123-add-user-profile
? 是否推送到远程? 是
✔ 已推送到远程
```

**生成的分支名格式：**
```
feature/YYYYMMDD-[ID-]description
```

### 创建 Hotfix 分支

```bash
gw h
```

用于紧急修复生产环境问题：

```bash
? 请输入 Issue ID (可跳过): BUG-456
? 请输入描述: fix-login-crash
✔ 分支创建成功: hotfix/20260111-BUG-456-fix-login-crash
```

### 删除分支

```bash
gw d
```

**智能分支列表：**
```bash
? 选择要删除的分支:
❯ feature/20260105-old-feature (本地+远程) 3 days ago
  feature/20260103-test (仅本地) 5 days ago
  取消
```

- 按最近使用时间排序
- 显示本地/远程状态
- 自动检测并删除远程分支

## 📝 代码提交基础

### AI 智能提交（推荐）

```bash
gw c
```

**AI 模式流程：**
```bash
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
────────────────────────────────────────
? 使用这个 commit message?
❯ ✅ 使用
  ❌ 不使用，切换到手动模式

✔ 提交成功
```

### 手动提交模式

如果选择手动模式或 AI 不可用：

```bash
? 选择提交类型:
❯ ✨  feat       新功能
  🐛  fix        修复 Bug
  📝  docs       文档更新
  💄  style      代码格式
  ♻️  refactor   重构
  ⚡️  perf       性能优化
  ✅  test       测试相关
  📦  build      构建相关
  👷  ci         CI/CD 相关
  🔧  chore      其他杂项
  ⏪  revert     回退提交

? 输入影响范围 scope (可跳过): auth
? 输入简短描述: add login validation
```

### 文件暂存处理

**自动暂存模式（默认）：**
```bash
gw c
没有暂存的更改
────────────────────────────────────────
未暂存的文件:
  M src/index.ts
  M src/utils.ts
────────────────────────────────────────
✔ 已自动暂存所有更改
```

**手动选择模式：**
```bash
? 选择要暂存的文件: (使用空格选择)
❯ ◉ M src/index.ts
  ◉ M src/utils.ts
  ◯ ?? src/new-file.ts
```

## 🏷️ 版本标签基础

### 创建版本标签

```bash
gw t
```

**智能版本检测：**
```bash
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

### 版本类型说明

| 类型    | 说明                     | 示例变化        |
| ------- | ------------------------ | --------------- |
| patch   | 修复 Bug，向下兼容       | 1.2.0 → 1.2.1   |
| minor   | 新功能，向下兼容         | 1.2.0 → 1.3.0   |
| major   | 破坏性变更，不向下兼容   | 1.2.0 → 2.0.0   |
| alpha   | 内测版本                 | 1.2.1-alpha.1   |
| beta    | 公测版本                 | 1.2.1-beta.1    |
| rc      | 候选发布版本             | 1.2.1-rc.1      |

### 列出现有标签

```bash
gw ts
```

**按前缀过滤：**
```bash
gw ts v        # 只显示 v 开头的标签
gw ts release  # 只显示 release 开头的标签
```

### 删除标签

```bash
gw td
```

**安全删除流程：**
```bash
? 选择要删除的 tag:
❯ v1.2.0 (2 days ago)
  v1.1.0 (1 week ago)

? 确认删除 tag v1.2.0?
❯ 是，删除本地和远程
  仅删除本地
  取消
```

## 💾 Stash 管理基础

### 查看和管理 Stash

```bash
gw s
```

**可视化 Stash 列表：**
```bash
共 3 个 stash:

? 选择 stash:
❯ [0] main fix login bug (3 文件) 2 hours ago
  [1] develop add feature (5 文件) 1 day ago
  [2] main WIP (1 文件) 3 days ago
  + 创建新 stash
  取消
```

### Stash 操作

选择 stash 后可以进行以下操作：

```bash
? 操作:
❯ 应用 (保留 stash)
  弹出 (应用并删除)
  创建分支
  查看差异
  删除
  返回列表
```

### 创建新 Stash

```bash
gw s
# 选择 "+ 创建新 stash"

? 检测到未跟踪的文件，是否一并 stash?
❯ 是 (包含未跟踪文件)
  否 (仅已跟踪文件)

? Stash 消息 (可跳过): 临时保存登录功能开发进度

✔ Stash 创建成功
```

## 📦 版本发布基础

### 更新 package.json 版本

```bash
gw r
```

**版本选择：**
```bash
当前版本: 0.2.24
? 选择新版本:
❯ patch   → 0.2.25
  minor   → 0.3.0
  major   → 1.0.0
  alpha   → 0.2.25-alpha.1
  beta    → 0.2.25-beta.1
  rc      → 0.2.25-rc.1

✔ 版本号已更新: 0.2.24 → 0.2.25
```

## ⚙️ 基础配置

### 初始化配置

```bash
gw init
```

**配置选择：**
```bash
? 选择配置范围:
❯ 全局配置（所有项目生效）
  项目配置（仅当前项目）
```

### 常用配置项

**全局配置示例：**
```json
{
  "autoStage": true,
  "useEmoji": true,
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "language": "zh-CN"
  }
}
```

**项目配置示例：**
```json
{
  "requireId": true,
  "featureIdLabel": "Story ID",
  "autoPush": true,
  "baseBranch": "develop"
}
```

## 🔄 工具更新

### 检查和更新

```bash
gw upt
```

**更新流程：**
```bash
🔍 检查更新...

🎉 发现新版本！
0.2.24  →  0.2.25

✔ 更新成功！
请重新打开终端使用新版本
```

## 🎯 日常开发示例

### 完整的功能开发流程

```bash
# 1. 创建功能分支
gw f
# 输入: PROJ-123, add-user-dashboard

# 2. 开发代码...
# 修改文件，添加功能

# 3. 提交代码
gw c
# AI 生成: ✨ feat(dashboard): 添加用户仪表板功能

# 4. 继续开发和提交...
gw c
# AI 生成: 🐛 fix(dashboard): 修复数据加载问题

# 5. 功能完成，创建版本标签
gw t
# 选择: minor → v1.3.0

# 6. 合并到主分支后，清理功能分支
gw d
# 选择并删除已合并的功能分支
```

### 紧急修复流程

```bash
# 1. 创建 hotfix 分支
gw h
# 输入: BUG-456, fix-payment-error

# 2. 修复问题
# 修改相关文件

# 3. 提交修复
gw c
# AI 生成: 🐛 fix(payment): 修复支付金额计算错误

# 4. 创建补丁版本
gw t
# 选择: patch → v1.2.1

# 5. 合并到主分支和开发分支后，删除 hotfix 分支
gw d
```

## 🎨 界面特性

### 颜色编码

- 🟢 **绿色** - 成功信息、分支名
- 🟡 **黄色** - 警告信息、版本号
- 🔴 **红色** - 错误信息
- 🔵 **蓝色** - 链接、命令
- ⚪ **灰色** - 辅助信息、时间

### 键盘操作

| 按键       | 功能                     |
| ---------- | ------------------------ |
| ↑/↓        | 上下选择选项             |
| 空格       | 选择/取消选择（多选模式） |
| 回车       | 确认选择                 |
| Ctrl+C     | 优雅退出                 |
| q          | 退出（在主菜单中）       |

### 搜索和过滤

在长列表中可以输入关键词快速过滤：

```bash
? 选择要删除的分支: (输入关键词过滤)
❯ feature/20260105-login
  feature/20260103-dashboard
  hotfix/20260101-payment
```

## 🔍 快速参考

### 常用命令速查

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
| `gw upt`| 更新工具             | `gw upt`                |

### 分支命名规范

```
feature/YYYYMMDD-[ID-]description
hotfix/YYYYMMDD-[ID-]description

示例:
feature/20260111-PROJ-123-add-user-login
hotfix/20260111-BUG-456-fix-payment-error
```

### 提交信息格式

```
<emoji> <type>[optional scope]: <description>

[optional body]

[optional footer(s)]

示例:
✨ feat(auth): 添加用户登录功能
🐛 fix(payment): 修复支付计算错误
📝 docs: 更新 API 使用说明
```

## 📚 下一步

掌握了基础用法后，你可以继续学习：

- [**AI 智能提交**](/guide/ai-commit) - 深入了解 AI commit 功能
- [**分支管理**](/guide/branch-management) - 高级分支管理技巧
- [**Tag 管理**](/guide/tag-management) - 版本标签的高级用法
- [**配置文件**](/config/) - 自定义工具行为
- [**最佳实践**](/guide/best-practices) - 学习高效的工作流程

---

通过这些基础用法，你已经可以高效地管理 Git 工作流了。Git Workflow 的设计理念是简化复杂操作，让你专注于代码开发而不是 Git 命令。