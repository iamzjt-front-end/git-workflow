# 分支命令

分支管理是 Git Workflow 的核心功能之一，提供了创建和删除分支的简化操作。

## 📋 命令概览

| 命令                           | 别名              | 功能              |
| ------------------------------ | ----------------- | ----------------- |
| `gw feature [--base <branch>]` | `gw feat`, `gw f` | 创建 feature 分支 |
| `gw hotfix [--base <branch>]`  | `gw fix`, `gw h`  | 创建 hotfix 分支  |
| `gw br:del [branch]`           | `gw brd`          | 删除本地/远程分支 |

## ✨ 创建 Feature 分支

### 基本用法

```bash
gw f
# 或
gw feature
gw feat
```

### 交互式流程

```bash
gw f
? 请输入 Story ID (可跳过): PROJ-123
? 请输入描述: add-user-login
✔ 分支创建成功: feature/20260111-PROJ-123-add-user-login
? 是否推送到远程? 是
✔ 已推送到远程: origin/feature/20260111-PROJ-123-add-user-login
```

### 高级选项

#### 指定基础分支

```bash
# 基于 develop 分支创建
gw f --base develop

# 基于指定分支创建
gw f --base release/1.0
```

#### 自动检测基础分支

如果不指定 `--base` 参数，Git Workflow 会自动检测：

1. 检查配置文件中的 `baseBranch` 设置
2. 自动检测 `main` 或 `master` 分支
3. 使用当前分支作为基础分支

### 分支命名规范

**生成格式：**

```
feature/YYYYMMDD-[ID-]description
```

**示例：**

```bash
# 有 ID 的情况
feature/20260111-PROJ-123-add-user-login

# 无 ID 的情况（跳过 ID 输入）
feature/20260111-add-user-login
```

**命名优势：**

- 📅 **时间排序** - 按创建日期自然排序
- 🔍 **易于搜索** - 可以按日期或 ID 快速查找
- 📋 **可追溯性** - 每个分支都能追溯到具体需求
- 🤖 **自动生成** - 无需手动输入复杂的分支名

### 未提交更改处理

如果当前分支有未提交的更改，Git Workflow 会智能处理：

```bash
gw f
# 检测到未提交的更改:
#  M src/index.ts
#  M src/utils.ts
# ────────────────────────────────────────
# ? 是否暂存 (stash) 这些更改后继续?
#   是，暂存更改并创建分支
#   否，取消操作
```

选择"是"后：

```bash
✔ 更改已暂存到 stash
✔ 分支创建成功: feature/20260111-PROJ-123-add-login
💡 提示: 使用 'gw s' 可以恢复暂存的更改
```

## 🐛 创建 Hotfix 分支

### 基本用法

```bash
gw h
# 或
gw hotfix
gw fix
```

### 交互式流程

```bash
gw h
? 请输入 Issue ID (可跳过): BUG-456
? 请输入描述: fix-login-crash
✔ 分支创建成功: hotfix/20260111-BUG-456-fix-login-crash
? 是否推送到远程? 是
✔ 已推送到远程: origin/hotfix/20260111-BUG-456-fix-login-crash
```

### Hotfix 特点

**与 Feature 分支的区别：**

- 🚨 **紧急性** - 用于紧急修复生产环境问题
- 🎯 **基础分支** - 通常基于 `main` 分支创建
- 🔄 **合并策略** - 需要同时合并到 `main` 和 `develop`
- 📝 **ID 标签** - 默认提示 "Issue ID" 而不是 "Story ID"

**典型使用场景：**

- 生产环境 Bug 修复
- 安全漏洞修复
- 关键功能故障修复
- 性能问题紧急优化

## 🗑️ 删除分支

### 基本用法

```bash
gw brd
# 或
gw br:del
```

### 交互式选择

```bash
gw brd
? 选择要删除的分支:
❯ feature/20260105-PROJ-100-old-feature (本地+远程) 3 days ago
  feature/20260103-test-branch (仅本地) 5 days ago
  hotfix/20260101-BUG-200-urgent-fix (本地+远程) 1 week ago
  取消
```

**分支信息说明：**

- **分支名** - 完整的分支名称
- **状态** - 显示是否存在远程分支
- **时间** - 最后提交时间，按最近使用排序

### 删除确认

选择分支后会显示详细信息并确认：

```bash
分支信息:
  名称: feature/20260105-PROJ-100-old-feature
  最后提交: 3 days ago
  提交信息: feat(user): 添加用户管理功能
  状态: 本地+远程分支都存在
────────────────────────────────────────
? 确认删除?
❯ 是，删除本地和远程分支
  仅删除本地分支
  取消
```

### 删除结果

```bash
✔ 本地分支已删除: feature/20260105-PROJ-100-old-feature
✔ 远程分支已删除: origin/feature/20260105-PROJ-100-old-feature
```

### 直接删除指定分支

```bash
# 直接删除指定分支
gw brd feature/old-branch

# 系统会自动检测并询问是否删除远程分支
```

### 批量删除

虽然不支持多选，但可以连续删除：

```bash
gw brd
# 删除第一个分支后，会自动返回分支列表
# 可以继续选择删除其他分支
```

### 安全保护

**保护机制：**

- 🛡️ **当前分支保护** - 不能删除当前所在的分支
- 🛡️ **主分支保护** - 不会显示 main/master/develop 等主分支
- 🛡️ **确认机制** - 删除前需要明确确认
- 🛡️ **状态检查** - 显示分支的本地/远程状态

**错误处理：**

```bash
❌ 无法删除分支: 当前正在使用此分支
❌ 远程分支删除失败: 权限不足
❌ 分支不存在: feature/non-existent-branch
```

## ⚙️ 配置选项

### 分支前缀配置

```json
{
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix"
}
```

**自定义前缀示例：**

```json
{
  "featurePrefix": "feat",
  "hotfixPrefix": "fix"
}
```

生成的分支名：

```
feat/20260111-PROJ-123-add-login
fix/20260111-BUG-456-fix-crash
```

### ID 配置

```json
{
  "requireId": true,
  "featureIdLabel": "Story ID",
  "hotfixIdLabel": "Issue ID"
}
```

**强制要求 ID：**

```json
{
  "requireId": true
}
```

设置后，创建分支时必须填写 ID，不能跳过。

**自定义 ID 标签：**

```json
{
  "featureIdLabel": "Jira ID",
  "hotfixIdLabel": "Bug ID"
}
```

### 基础分支配置

```json
{
  "baseBranch": "develop"
}
```

设置后，所有新分支都会基于 `develop` 创建，除非使用 `--base` 参数覆盖。

### 自动推送配置

```json
{
  "autoPush": true
}
```

**配置选项：**

- `true` - 创建分支后自动推送，不询问
- `false` - 创建分支后不推送，不询问
- 不设置 - 每次创建分支时询问（默认行为）

## 🎯 使用场景

### 场景一：日常功能开发

```bash
# 1. 创建功能分支
gw f
# 输入: PROJ-123, add-user-profile

# 2. 开发代码...

# 3. 提交代码
gw c

# 4. 推送到远程（如果还没推送）
git push origin feature/20260111-PROJ-123-add-user-profile

# 5. 创建 Pull Request

# 6. 合并后删除分支
gw d
```

### 场景二：紧急修复

```bash
# 1. 创建 hotfix 分支（基于 main）
gw h --base main
# 输入: BUG-456, fix-payment-error

# 2. 修复代码...

# 3. 提交修复
gw c

# 4. 合并到 main 和 develop

# 5. 删除 hotfix 分支
gw brd
```

### 场景三：实验性功能

```bash
# 1. 创建实验分支
gw f
# 输入: EXP-789, try-new-algorithm

# 2. 实验开发...

# 3. 如果实验失败，直接删除分支
gw brd
# 选择实验分支删除
```

### 场景四：团队协作

```bash
# 1. 基于最新的 develop 创建分支
git checkout develop
git pull origin develop
gw f --base develop

# 2. 开发完成后推送
git push origin feature/20260111-PROJ-123-add-feature

# 3. 创建 Pull Request 到 develop

# 4. 代码审查通过后，删除本地分支
gw brd
```

## 🔧 高级技巧

### 技巧一：快速切换到新分支

```bash
# 创建分支后自动切换
gw f
# 分支创建成功后会自动切换到新分支
```

### 技巧二：基于特定提交创建分支

```bash
# 先切换到目标提交
git checkout abc1234

# 然后创建分支
gw f
```

### 技巧三：批量清理已合并分支

```bash
# 使用 Git Workflow 逐个删除
gw brd

# 或使用 Git 命令批量删除已合并分支
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d
```

### 技巧四：恢复误删的分支

```bash
# 查看最近的操作
git reflog

# 恢复分支
git checkout -b recovered-branch <commit-hash>
```

## 🚨 常见问题

### 问题一：分支名包含特殊字符

**问题：**

```bash
gw f
? 请输入描述: fix bug #123
❌ 分支名包含无效字符
```

**解决方案：**

- 避免使用 `#`, `@`, `空格` 等特殊字符
- 使用 `-` 或 `_` 连接单词
- 推荐格式：`fix-bug-123`

### 问题二：无法删除远程分支

**问题：**

```bash
❌ 远程分支删除失败: 权限不足
```

**解决方案：**

1. 检查是否有推送权限
2. 确认远程分支是否存在
3. 手动删除：`git push origin --delete branch-name`

### 问题三：基础分支不存在

**问题：**

```bash
❌ 基础分支 'develop' 不存在
```

**解决方案：**

1. 检查分支名是否正确
2. 拉取远程分支：`git fetch origin develop:develop`
3. 或使用其他基础分支：`gw f --base main`

### 问题四：分支已存在

**问题：**

```bash
❌ 分支 'feature/20260111-PROJ-123-add-login' 已存在
```

**解决方案：**

1. 使用不同的描述
2. 切换到现有分支：`git checkout feature/20260111-PROJ-123-add-login`
3. 或删除现有分支后重新创建

## 📚 相关命令

- [**gw c**](/commands/commit) - 提交代码到分支
- [**gw s**](/commands/stash) - 管理代码暂存
- [**gw t**](/commands/tag) - 为分支创建版本标签
- [**gw r**](/commands/release) - 发布版本

---

分支管理是 Git 工作流的基础，通过 Git Workflow 的分支命令，你可以轻松创建规范的分支名称，高效管理分支生命周期。
