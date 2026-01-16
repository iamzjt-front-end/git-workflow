# 团队协作

本指南介绍如何在团队中使用 git-workflow，统一工作流程和规范。

## 为什么需要统一工作流？

在团队开发中，统一的 Git 工作流可以：

- ✅ 提高代码审查效率
- ✅ 减少合并冲突
- ✅ 保持提交历史清晰
- ✅ 便于追踪问题和功能
- ✅ 自动化发布流程

## 团队配置策略

### 配置层级

git-workflow 支持三个配置层级：

1. **全局配置**（`~/.gwrc.json`）- 个人偏好设置
2. **项目配置**（`.gwrc.json`）- 团队统一规范
3. **运行时配置** - 临时覆盖

优先级：运行时 > 项目 > 全局

### 推荐配置方案

#### 方案 1: 项目配置（推荐）

在项目根目录创建 `.gwrc.json`，提交到 Git：

```json
{
  "branch": {
    "types": ["feature", "hotfix", "bugfix"],
    "baseBranch": "main",
    "includeDate": true,
    "includeStoryId": true,
    "storyIdRequired": false
  },
  "commit": {
    "useAI": false,
    "format": "conventional",
    "useGitmoji": true
  },
  "tag": {
    "prefix": "v",
    "prerelease": ["alpha", "beta", "rc"]
  }
}
```

**优点：**

- 团队成员自动使用统一配置
- 配置随项目版本管理
- 新成员无需额外配置

**适用场景：**

- 中大型团队
- 多个项目需要不同规范
- 需要严格的工作流控制

#### 方案 2: 全局配置 + 项目覆盖

团队成员各自配置全局设置，项目中只覆盖必要的规范：

```json
// 项目 .gwrc.json（只配置团队规范）
{
  "branch": {
    "baseBranch": "main",
    "includeStoryId": true
  },
  "commit": {
    "format": "conventional"
  }
}
```

**优点：**

- 灵活性高
- 个人可以自定义偏好
- 项目配置简洁

**适用场景：**

- 小型团队
- 成员有不同的工作习惯
- 只需统一核心规范

## 分支管理规范

### 分支命名规范

统一的分支命名格式：

```
<type>/<date>-<story-id>-<description>
```

示例：

```
feature/20260116-PROJ-123-user-login
hotfix/20260116-BUG-456-fix-crash
bugfix/20260116-fix-memory-leak
```

### 分支类型定义

在项目配置中定义团队使用的分支类型：

```json
{
  "branch": {
    "types": ["feature", "hotfix", "bugfix", "refactor"],
    "baseBranch": "main"
  }
}
```

### 分支工作流

#### Git Flow 风格

```
main (生产)
  ├── develop (开发)
  │   ├── feature/xxx (功能)
  │   ├── feature/yyy (功能)
  │   └── bugfix/zzz (修复)
  └── hotfix/aaa (紧急修复)
```

配置：

```json
{
  "branch": {
    "baseBranch": "develop",
    "types": ["feature", "bugfix", "hotfix"]
  }
}
```

#### GitHub Flow 风格

```
main (生产)
  ├── feature/xxx
  ├── feature/yyy
  └── hotfix/zzz
```

配置：

```json
{
  "branch": {
    "baseBranch": "main",
    "types": ["feature", "hotfix"]
  }
}
```

## 提交规范

### Conventional Commits

团队统一使用 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交类型

在项目中统一提交类型：

| 类型     | 说明      | 示例                            |
| -------- | --------- | ------------------------------- |
| feat     | 新功能    | `feat(auth): 添加用户登录`      |
| fix      | 修复 bug  | `fix(api): 修复数据获取错误`    |
| docs     | 文档更新  | `docs: 更新 README`             |
| style    | 代码格式  | `style: 格式化代码`             |
| refactor | 重构      | `refactor(utils): 优化工具函数` |
| test     | 测试      | `test: 添加单元测试`            |
| chore    | 构建/工具 | `chore: 更新依赖`               |
| perf     | 性能优化  | `perf: 优化查询性能`            |

### AI 提交配置

#### 团队共享 AI 配置

如果团队使用 AI 生成提交消息，可以配置团队共享的 API：

```json
{
  "commit": {
    "useAI": true,
    "ai": {
      "provider": "github",
      "model": "gpt-4o",
      "customPrompt": "请生成符合团队规范的提交消息..."
    }
  }
}
```

#### 个人 API Key

API Key 应该在个人全局配置中设置，不要提交到项目：

```bash
# 每个成员运行
gw init
# 选择 "全局配置"
# 配置个人的 API Key
```

## 版本管理规范

### 语义化版本

团队统一使用语义化版本：

```
v<major>.<minor>.<patch>[-<prerelease>]
```

示例：

- `v1.0.0` - 正式版本
- `v1.1.0-alpha.1` - 预发布版本
- `v2.0.0-beta.2` - 测试版本

### 版本发布流程

#### 1. 开发阶段

```bash
# 创建功能分支
gw f
# 输入: PROJ-123, add-payment

# 开发并提交
gw c

# 推送到远程
git push origin feature/20260116-PROJ-123-add-payment
```

#### 2. 代码审查

```bash
# 创建 Pull Request
# 等待 review 和测试通过
# 合并到 main/develop
```

#### 3. 发布版本

```bash
# 切换到主分支
git checkout main
git pull

# 创建版本 tag
gw t
# 选择版本类型: patch/minor/major

# 推送 tag
git push --tags
```

#### 4. 自动化发布

配置 CI/CD 在 tag 推送时自动发布：

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - "v*"
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy
        run: |
          npm install
          npm run build
          npm publish
```

## 团队最佳实践

### 1. 统一开发环境

确保团队成员使用相同的工具版本：

```json
// package.json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 2. 代码审查流程

建立规范的 PR 流程：

1. 创建功能分支
2. 完成开发和测试
3. 提交 PR，填写完整描述
4. 至少 1 人 review
5. CI 测试通过
6. 合并到主分支

### 3. 提交频率

建议：

- ✅ 小步提交，频繁推送
- ✅ 每个提交只做一件事
- ✅ 提交信息清晰描述改动
- ❌ 避免大量代码一次提交
- ❌ 避免提交未完成的功能

### 4. 分支管理

建议：

- ✅ 及时删除已合并的分支
- ✅ 定期同步主分支
- ✅ 功能分支不要存在太久
- ❌ 避免在主分支直接提交
- ❌ 避免长期存在的功能分支

### 5. 冲突处理

遇到合并冲突时：

```bash
# 1. 更新主分支
git checkout main
git pull

# 2. 切回功能分支
git checkout feature/xxx

# 3. 合并主分支
git merge main

# 4. 解决冲突
# 编辑冲突文件

# 5. 提交合并
git add .
git commit -m "chore: 解决合并冲突"

# 6. 推送
git push
```

## 团队培训

### 新成员入职

1. **安装工具**

```bash
npm install -g @zjex/git-workflow
```

2. **配置全局设置**

```bash
gw init
# 选择 "全局配置"
# 配置 AI API Key（如果使用）
```

3. **克隆项目**

```bash
git clone <project-url>
cd <project>
```

4. **查看项目配置**

```bash
gw config
```

5. **开始开发**

```bash
# 创建分支
gw f

# 提交代码
gw c

# 查看日志
gw log
```

### 培训材料

准备团队培训文档：

1. **快速开始指南** - 5 分钟上手
2. **工作流规范** - 分支、提交、发布流程
3. **常见问题** - FAQ 和解决方案
4. **最佳实践** - 团队约定和建议

## 常见场景

### 场景 1: 多人协作同一功能

```bash
# 成员 A 创建功能分支
gw f
# feature/20260116-PROJ-123-payment

# 成员 B 基于该分支创建子分支
git checkout feature/20260116-PROJ-123-payment
git checkout -b feature/20260116-PROJ-123-payment-ui

# 各自开发并提交
gw c

# 成员 B 先合并到功能分支
git checkout feature/20260116-PROJ-123-payment
git merge feature/20260116-PROJ-123-payment-ui

# 功能完成后合并到主分支
```

### 场景 2: 紧急修复

```bash
# 从生产分支创建 hotfix
git checkout main
gw h
# hotfix/20260116-BUG-456-fix-crash

# 快速修复并测试
gw c

# 合并到 main 和 develop
git checkout main
git merge hotfix/20260116-BUG-456-fix-crash

git checkout develop
git merge hotfix/20260116-BUG-456-fix-crash

# 发布补丁版本
git checkout main
gw t
# 选择 patch
```

### 场景 3: 功能开关

使用功能开关管理未完成的功能：

```typescript
// feature-flags.ts
export const FEATURES = {
  NEW_PAYMENT: process.env.ENABLE_NEW_PAYMENT === "true",
  BETA_UI: process.env.ENABLE_BETA_UI === "true",
};

// 使用
if (FEATURES.NEW_PAYMENT) {
  // 新功能代码
} else {
  // 旧功能代码
}
```

## 监控和度量

### 团队效率指标

跟踪以下指标优化工作流：

- 📊 平均 PR 合并时间
- 📊 代码审查响应时间
- 📊 分支存活时间
- 📊 提交频率
- 📊 冲突解决时间

### 使用 Git 统计

```bash
# 查看提交统计
git log --oneline --since="1 month ago" | wc -l

# 查看贡献者统计
git shortlog -sn --since="1 month ago"

# 查看分支数量
git branch -a | wc -l
```

## 相关资源

- [开发指南](./development.md)
- [最佳实践](./best-practices.md)
- [分支管理](./branch-management.md)
- [版本管理](./tag-management.md)

## 获取帮助

如果团队在使用过程中遇到问题：

- 📖 查看文档
- 💬 提交 Issue
- 💡 参与 Discussions
- 📧 联系维护者
