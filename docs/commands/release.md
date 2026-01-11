# Release 命令

版本发布相关的命令详解。

## 📋 命令概览

| 命令 | 别名 | 说明 |
|------|------|------|
| `gw release` | `gw r` | 交互式版本发布 |

## 📦 版本发布

### 基本用法

```bash
gw release
gw r
```

### 发布流程

```bash
$ gw r
📦 版本发布

当前版本: 0.2.24
package.json: /path/to/your/project/package.json

? 选择新版本:
❯ patch   → 0.2.25
  minor   → 0.3.0
  major   → 1.0.0
  alpha   → 0.2.25-alpha.1
  beta    → 0.2.25-beta.1
  rc      → 0.2.25-rc.1
  自定义...

✔ 版本号已更新: 0.2.24 → 0.2.25
✔ package.json 已更新
```

## 🔢 版本类型

### 标准版本

| 类型 | 说明 | 示例 |
|------|------|------|
| `patch` | 补丁版本，Bug 修复 | 0.2.24 → 0.2.25 |
| `minor` | 次版本，新功能 | 0.2.24 → 0.3.0 |
| `major` | 主版本，破坏性变更 | 0.2.24 → 1.0.0 |

### 预发布版本

| 类型 | 说明 | 示例 |
|------|------|------|
| `alpha` | 内部测试版 | 0.2.24 → 0.2.25-alpha.1 |
| `beta` | 公开测试版 | 0.2.24 → 0.2.25-beta.1 |
| `rc` | 发布候选版 | 0.2.24 → 0.2.25-rc.1 |

### 自定义版本

```bash
? 选择新版本: 自定义...

? 输入自定义版本号: 2.0.0-beta.1

✔ 版本号已更新: 0.2.24 → 2.0.0-beta.1
```

## 📝 package.json 更新

工具会自动更新 `package.json` 中的版本号：

### 更新前

```json
{
  "name": "@zjex/git-workflow",
  "version": "0.2.24",
  "description": "Git workflow CLI tool"
}
```

### 更新后

```json
{
  "name": "@zjex/git-workflow",
  "version": "0.2.25",
  "description": "Git workflow CLI tool"
}
```

## 🔄 预发布版本处理

### 当前为预发布版本

如果当前版本是预发布版本，会提供额外选项：

```bash
当前版本: 1.0.0-beta.1

? 选择新版本:
❯ pre     → 1.0.0-beta.2    # 升级预发布版本
  release → 1.0.0           # 转为正式版本
  patch   → 1.0.1           # 跳过当前，升级 patch
  minor   → 1.1.0           # 跳过当前，升级 minor
  major   → 2.0.0           # 跳过当前，升级 major
  alpha   → 1.0.1-alpha.1   # 新的 alpha 版本
  beta    → 1.0.1-beta.1    # 新的 beta 版本
  rc      → 1.0.1-rc.1      # 新的 rc 版本
```

## 🎯 使用场景

### 日常开发

```bash
# 修复 bug 后发布补丁版本
gw r
# 选择 patch → 1.0.0 → 1.0.1
```

### 功能发布

```bash
# 添加新功能后发布次版本
gw r
# 选择 minor → 1.0.0 → 1.1.0
```

### 重大更新

```bash
# 破坏性变更后发布主版本
gw r
# 选择 major → 1.0.0 → 2.0.0
```

### 测试版本

```bash
# 发布内部测试版
gw r
# 选择 alpha → 1.0.0 → 1.0.1-alpha.1

# 发布公开测试版
gw r
# 选择 beta → 1.0.1-alpha.1 → 1.0.1-beta.1

# 发布候选版本
gw r
# 选择 rc → 1.0.1-beta.1 → 1.0.1-rc.1

# 发布正式版本
gw r
# 选择 release → 1.0.1-rc.1 → 1.0.1
```

## 🔗 与其他命令配合

### 完整发布流程

```bash
# 1. 完成开发并提交
gw c

# 2. 更新版本号
gw r

# 3. 创建版本标签
gw t

# 4. 推送到远程
git push origin main --tags
```

### 自动化脚本

可以结合其他工具创建自动化发布脚本：

```bash
#!/bin/bash
# release.sh

# 运行测试
npm test

# 构建项目
npm run build

# 更新版本
gw release

# 创建 tag
gw tag

# 推送更改
git push origin main --tags

# 发布到 npm
npm publish
```

## 📋 版本规范

### 语义化版本

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/) 规范：

```
主版本号.次版本号.修订号[-预发布版本号]

例如：
1.0.0        - 正式版本
1.0.1        - 补丁版本
1.1.0        - 次版本
2.0.0        - 主版本
1.0.0-alpha.1 - 预发布版本
```

### 版本号含义

**主版本号（MAJOR）**：
- 不兼容的 API 修改
- 重大架构变更
- 破坏性变更

**次版本号（MINOR）**：
- 向下兼容的功能性新增
- 新特性添加
- 功能增强

**修订号（PATCH）**：
- 向下兼容的问题修正
- Bug 修复
- 安全补丁

### 预发布版本

**Alpha 版本**：
- 内部测试版本
- 功能不完整
- 可能有严重 bug

**Beta 版本**：
- 公开测试版本
- 功能基本完整
- 可能有小 bug

**RC 版本**：
- 发布候选版本
- 功能完整
- 准备正式发布

## 🚀 最佳实践

### 版本发布策略

1. **开发阶段** - 使用 alpha 版本
2. **测试阶段** - 使用 beta 版本
3. **预发布** - 使用 rc 版本
4. **正式发布** - 使用标准版本

### 版本号管理

1. **保持一致** - 所有相关文件版本号同步
2. **遵循规范** - 严格按照语义化版本规范
3. **记录变更** - 维护 CHANGELOG 文件
4. **标签同步** - 版本发布后创建对应 tag

### 团队协作

1. **统一流程** - 团队使用相同的发布流程
2. **权限控制** - 限制版本发布权限
3. **自动化** - 使用 CI/CD 自动化发布
4. **通知机制** - 版本发布后及时通知团队

### 错误处理

如果版本更新出错：

```bash
# 手动回滚 package.json
git checkout HEAD -- package.json

# 或者使用 git reset
git reset --hard HEAD~1
```

### 发布检查清单

发布前确认：

- [ ] 所有测试通过
- [ ] 代码已提交
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号符合规范
- [ ] 没有未完成的功能