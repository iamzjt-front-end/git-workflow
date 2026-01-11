# 分支配置

分支管理相关的配置选项。

## 🌿 基础分支

设置默认的基础分支。

```json
{
  "baseBranch": "develop"
}
```

如果不设置，工具会自动检测 `main` 或 `master`。

## 🏷️ 分支前缀

自定义分支前缀。

```json
{
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix"
}
```

**生成的分支名格式：**
```
feature/20260111-PROJ-123-add-login
hotfix/20260111-BUG-456-fix-crash
```

## 🆔 ID 配置

控制是否强制要求填写 ID。

```json
{
  "requireId": true,
  "featureIdLabel": "Jira ID",
  "hotfixIdLabel": "Bug ID"
}
```

**效果：**
- `requireId: false` - ID 可选，可以跳过
- `requireId: true` - ID 必填，不能跳过

## 🚀 自动推送

控制创建分支后是否自动推送到远程。

```json
{
  "autoPush": true
}
```

**选项：**
- `true` - 自动推送，不询问
- `false` - 不推送，不询问
- 不设置 - 每次询问（默认）

## 📋 使用场景

### 个人开发

```json
{
  "featurePrefix": "feat",
  "requireId": false,
  "autoPush": false
}
```

### 团队协作

```json
{
  "baseBranch": "develop",
  "requireId": true,
  "featureIdLabel": "Jira ID",
  "hotfixIdLabel": "Bug ID",
  "autoPush": true
}
```

### 开源项目

```json
{
  "featurePrefix": "feature",
  "hotfixPrefix": "fix",
  "requireId": false,
  "autoPush": false
}
```

## 🔧 高级用法

### 自定义分支命名

通过配置前缀和标签，可以实现不同的命名风格：

```json
{
  "featurePrefix": "feat",
  "hotfixPrefix": "fix",
  "featureIdLabel": "Story",
  "hotfixIdLabel": "Issue"
}
```

生成：`feat/20260111-Story-123-description`

### 多环境配置

不同环境使用不同的基础分支：

```json
{
  "baseBranch": "develop"
}
```

### 分支保护

配合 GitHub 分支保护规则，确保代码质量：

1. 设置 `autoPush: true`
2. 在 GitHub 设置分支保护
3. 要求 PR 审查