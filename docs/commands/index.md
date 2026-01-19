# 命令参考

Git Workflow 提供了一套简洁而强大的命令，涵盖了 Git 工作流的各个方面。所有命令都支持交互式操作，让你无需记忆复杂的参数。

## 📋 命令概览

### 核心命令

| 命令       | 别名              | 功能                | 示例                  |
| ---------- | ----------------- | ------------------- | --------------------- |
| `gw`       | -                 | 显示交互式菜单      | `gw`                  |
| `gw f`     | `feat`, `feature` | 创建 feature 分支   | `gw f --base develop` |
| `gw h`     | `fix`, `hotfix`   | 创建 hotfix 分支    | `gw h`                |
| `gw c`     | `cm`, `commit`    | 提交代码（AI 模式） | `gw c`                |
| `gw log`   | `ls`, `l`         | 查看提交历史        | `gw log`              |
| `gw amend` | -                 | 修改提交信息        | `gw amend a1b2c3d`    |
| `gw ad`    | `amend:date`      | 修改提交时间        | `gw ad`               |
| `gw t`     | `tag`             | 创建 tag            | `gw t v`              |
| `gw brd`   | `br:del`          | 删除分支            | `gw brd feature/old`  |
| `gw s`     | `st`, `stash`     | 管理 stash          | `gw s`                |

### 辅助命令

| 命令      | 别名         | 功能               | 示例      |
| --------- | ------------ | ------------------ | --------- |
| `gw r`    | `release`    | 发布版本           | `gw r`    |
| `gw ts`   | `tags`       | 列出 tags          | `gw ts v` |
| `gw td`   | `tag:del`    | 删除 tag           | `gw td`   |
| `gw tu`   | `tag:update` | 修改 tag           | `gw tu`   |
| `gw tc`   | `tag:clean`  | 清理无效 tag       | `gw tc`   |
| `gw init` | -            | 初始化配置         | `gw init` |
| `gw upt`  | `update`     | 更新工具           | `gw upt`  |
| `gw cc`   | `clean`      | 清理缓存和临时文件 | `gw cc`   |

## 🎯 使用模式

Git Workflow 支持两种使用模式：

### 1. 交互式模式（推荐新手）

直接运行 `gw` 显示交互式菜单：

```bash
gw
```

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
  [7] 🗑️  删除 tag               gw td
  [8] ✏️  修改 tag               gw tu
  [9] 📋 列出 tags              gw ts
  [a] 📦 发布版本               gw r
  [b] 💾 管理 stash             gw s
  [c] ⚙️  初始化配置             gw init
  [0] ❓ 帮助
  [q] 退出
```

**特点：**

- 🎨 优雅的 ASCII Art Logo
- 📋 清晰的操作菜单
- 🎯 键盘快捷操作
- 🔍 实时搜索和过滤

### 2. 命令行模式（推荐熟练用户）

直接使用具体命令：

```bash
# 创建 feature 分支
gw f

# 提交代码
gw c

# 创建 tag
gw t

# 删除分支
gw d
```

**特点：**

- ⚡️ 快速执行
- 🤖 支持脚本化
- 📝 支持参数传递
- 🔄 适合 CI/CD 集成

## 🎨 界面特性

### 颜色编码

Git Workflow 使用颜色来区分不同类型的信息：

- 🟢 **绿色** - 成功信息、分支名、确认操作
- 🟡 **黄色** - 警告信息、版本号、重要提示
- 🔴 **红色** - 错误信息、危险操作
- 🔵 **蓝色** - 链接、命令、可点击内容
- ⚪ **灰色** - 辅助信息、时间戳、次要内容

### 图标系统

每个功能都有对应的图标，提高可识别性：

- ✨ **feature** - 新功能开发
- 🐛 **hotfix** - 紧急修复
- 🏷️ **tag** - 版本标签
- 📝 **commit** - 代码提交
- 💾 **stash** - 代码暂存
- 🗑️ **delete** - 删除操作
- ⚙️ **config** - 配置管理
- 🔄 **update** - 更新操作

### 键盘操作

所有交互界面都支持键盘操作：

| 按键   | 功能                      |
| ------ | ------------------------- |
| ↑/↓    | 上下选择选项              |
| ←/→    | 左右切换（多选模式）      |
| 空格   | 选择/取消选择（多选模式） |
| 回车   | 确认选择                  |
| Ctrl+C | 优雅退出                  |
| Tab    | 自动补全（输入模式）      |
| Esc    | 取消当前操作              |

## 🔧 全局选项

所有命令都支持以下全局选项：

### 版本信息

```bash
gw --version
gw -v
```

显示当前版本号。

### 帮助信息

```bash
gw --help
gw -h
```

显示帮助信息和可用命令列表。

### 调试模式

```bash
DEBUG=gw:* gw c
```

启用详细日志，用于问题排查。

## 🎯 命令分类

### 分支管理

专注于分支的创建、删除和管理：

- [**gw f**](/commands/branch#创建-feature-分支) - 创建 feature 分支
- [**gw h**](/commands/branch#创建-hotfix-分支) - 创建 hotfix 分支
- [**gw brd**](/commands/branch#删除分支) - 删除本地/远程分支

### 提交管理

处理代码提交和提交信息：

- [**gw c**](/commands/commit) - 交互式提交（支持 AI 生成）
- [**gw log**](/commands/log) - 查看 Git 提交历史（GitHub 风格）
- [**gw amend**](/commands/amend) - 修改指定 commit 的提交信息
- [**gw ad**](/commands/amend-date) - 修改指定 commit 的提交时间

### 版本管理

管理项目版本和标签：

- [**gw t**](/commands/tag#创建-tag) - 创建版本标签
- [**gw ts**](/commands/tag#列出-tags) - 列出所有标签
- [**gw td**](/commands/tag#删除-tag) - 删除标签
- [**gw tu**](/commands/tag#修改-tag) - 修改标签
- [**gw tc**](/commands/tag#清理无效-tag) - 清理无效标签
- [**gw r**](/commands/release) - 发布新版本

### 代码暂存

管理 Git stash：

- [**gw s**](/commands/stash) - 可视化管理 stash

### 工具管理

配置和维护工具本身：

- [**gw init**](/commands/config) - 初始化配置
- [**gw upt**](/commands/update) - 更新工具
- [**gw cc**](/commands/update#清理缓存) - 清理缓存和临时文件

## 🚀 快速参考

### 日常开发流程

```bash
# 1. 创建功能分支
gw f
# 输入: PROJ-123, add-login-feature

# 2. 开发代码...

# 3. 提交代码（AI 模式）
gw c
# AI 自动生成: ✨ feat(auth): 添加用户登录功能

# 4. 创建版本标签
gw t
# 选择: patch → v1.2.1

# 5. 清理旧分支
gw d
# 选择要删除的分支
```

### 紧急修复流程

```bash
# 1. 创建 hotfix 分支
gw h
# 输入: BUG-456, fix-login-crash

# 2. 修复代码...

# 3. 提交修复
gw c
# AI 生成: 🐛 fix(auth): 修复登录页面崩溃问题

# 4. 创建补丁版本
gw t
# 选择: patch → v1.2.2
```

### 版本发布流程

```bash
# 1. 更新版本号
gw r
# 选择: minor → 1.3.0

# 2. 创建发布标签
gw t
# 选择: v1.3.0

# 3. 清理功能分支
gw d
# 批量删除已合并的分支
```

## 📚 深入学习

每个命令都有详细的使用指南：

- [**交互式菜单**](/commands/interactive) - 了解主菜单的所有功能
- [**分支命令**](/commands/branch) - 掌握分支管理的最佳实践
- [**提交命令**](/commands/commit) - 深入了解 AI 提交和手动提交
- [**日志命令**](/commands/log) - GitHub 风格的提交历史查看
- [**Tag 命令**](/commands/tag) - 学习版本标签的高级用法
- [**Stash 命令**](/commands/stash) - 高效管理代码暂存
- [**版本命令**](/commands/release) - 自动化版本发布流程
- [**配置命令**](/commands/config) - 自定义工具行为
- [**更新命令**](/commands/update) - 保持工具最新状态
- [**帮助命令**](/commands/help) - 获取详细的使用帮助和故障排除

## 🔍 命令查找

不确定使用哪个命令？可以通过以下方式快速找到：

### 按功能查找

- **我想创建分支** → `gw f` (feature) 或 `gw h` (hotfix)
- **我想提交代码** → `gw c` (commit)
- **我想查看历史** → `gw log` (log)
- **我想创建版本** → `gw t` (tag) 或 `gw r` (release)
- **我想删除分支** → `gw brd` (branch delete)
- **我想管理 stash** → `gw s` (stash)
- **我想配置工具** → `gw init`
- **我想更新工具** → `gw upt`

### 按场景查找

- **开始新功能** → `gw f`
- **修复紧急 Bug** → `gw h`
- **提交当前更改** → `gw c`
- **查看项目历史** → `gw log`
- **发布新版本** → `gw r` + `gw t`
- **清理旧分支** → `gw brd`
- **暂存当前工作** → `gw s`

### 交互式查找

如果不确定，直接运行 `gw` 查看所有可用选项：

```bash
gw
# 浏览菜单，选择需要的功能
```

---

掌握这些命令后，你就能高效地管理 Git 工作流了。每个命令都经过精心设计，旨在简化复杂的 Git 操作，让你专注于代码开发。
