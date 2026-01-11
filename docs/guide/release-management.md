# 版本发布管理

版本发布管理是软件开发生命周期的重要环节，Git Workflow 提供了自动化的版本号管理和发布流程。

## 📦 版本发布理念

### 语义化版本控制

Git Workflow 遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/) 规范：

```
主版本号.次版本号.修订号[-预发布版本]

例如：1.2.3-beta.1
```

**版本递增规则：**
- **主版本号（Major）** - 不兼容的 API 修改
- **次版本号（Minor）** - 向下兼容的功能性新增
- **修订号（Patch）** - 向下兼容的问题修正
- **预发布版本** - alpha, beta, rc

### 自动化版本管理

- **智能版本检测** - 自动读取 package.json 中的当前版本
- **版本递增建议** - 根据当前版本提供合理的递增选项
- **文件同步更新** - 自动更新 package.json 和相关文件
- **Git 集成** - 可选择同时创建 Git 标签

## 🚀 基本用法

### 更新版本号

```bash
gw r
# 或使用别名
gw release
```

### 版本选择界面

```bash
gw r
当前版本: 0.2.24
? 选择新版本:
❯ patch   → 0.2.25
  minor   → 0.3.0
  major   → 1.0.0
  alpha   → 0.2.25-alpha.1
  beta    → 0.2.25-beta.1
  rc      → 0.2.25-rc.1
  custom  → 自定义版本号

✔ 版本号已更新: 0.2.24 → 0.2.25
```

### 版本更新结果

```bash
✔ 版本号已更新: 0.2.24 → 0.2.25

更新的文件:
  package.json
  package-lock.json (如果存在)

建议的后续操作:
  1. 提交版本更新: gw c
  2. 创建版本标签: gw t
  3. 推送到远程: git push origin main --tags
```

## 🎯 版本类型详解

### 正式版本

#### Patch 版本（修订号）

```bash
# 当前版本: 1.2.3
gw r
# 选择: patch → 1.2.4
```

**适用场景：**
- Bug 修复
- 安全补丁
- 文档更新
- 依赖版本更新（无功能影响）

**示例变更：**
```bash
# Bug 修复
🐛 fix(auth): 修复登录验证失败问题
🐛 fix(api): 修复数据获取超时问题

# 安全补丁
🔒 security: 修复 XSS 漏洞
🔒 security: 更新依赖修复安全问题
```

#### Minor 版本（次版本号）

```bash
# 当前版本: 1.2.3
gw r
# 选择: minor → 1.3.0
```

**适用场景：**
- 新功能添加
- API 扩展（向下兼容）
- 性能改进
- 新的配置选项

**示例变更：**
```bash
# 新功能
✨ feat(dashboard): 添加用户仪表板功能
✨ feat(api): 添加数据导出接口

# API 扩展
✨ feat(config): 添加新的配置选项
⚡️ perf(query): 优化数据库查询性能
```

#### Major 版本（主版本号）

```bash
# 当前版本: 1.2.3
gw r
# 选择: major → 2.0.0
```

**适用场景：**
- 破坏性 API 变更
- 架构重构
- 移除废弃功能
- 不向下兼容的更改

**示例变更：**
```bash
# 破坏性变更
💥 BREAKING CHANGE: 重构用户认证 API
💥 BREAKING CHANGE: 移除废弃的 v1 接口

# 架构重构
♻️ refactor: 重构整体架构，不兼容旧版本
🗑️ remove: 移除废弃的配置选项
```

### 预发布版本

#### Alpha 版本

```bash
# 当前版本: 1.2.3
gw r
# 选择: alpha → 1.2.4-alpha.1
```

**特点：**
- 内部测试版本
- 功能可能不完整
- 可能存在已知问题
- 不建议生产环境使用

**使用场景：**
- 早期功能预览
- 内部团队测试
- 概念验证

#### Beta 版本

```bash
# 当前版本: 1.2.4-alpha.3
gw r
# 选择: beta → 1.2.4-beta.1
```

**特点：**
- 功能基本完整
- 面向更广泛的测试
- 可能存在少量问题
- 接近最终发布版本

**使用场景：**
- 公开测试
- 用户反馈收集
- 性能测试

#### RC 版本（Release Candidate）

```bash
# 当前版本: 1.2.4-beta.2
gw r
# 选择: rc → 1.2.4-rc.1
```

**特点：**
- 候选发布版本
- 功能冻结
- 仅修复关键问题
- 准备正式发布

**使用场景：**
- 最终测试
- 生产环境验证
- 发布前确认

### 自定义版本号

```bash
gw r
? 选择新版本:
❯ custom  → 自定义版本号

? 输入自定义版本号: 2.0.0-beta.1
✔ 版本号已更新: 1.2.3 → 2.0.0-beta.1
```

**使用场景：**
- 特殊版本命名需求
- 跳跃式版本更新
- 与现有版本体系对齐

## 🔄 完整发布流程

### 标准发布流程

```bash
# 1. 完成开发和测试
gw c  # 最后的代码提交

# 2. 更新版本号
gw r
# 选择合适的版本类型

# 3. 提交版本更新
gw c
# AI 生成: 🔖 chore: 发布版本 v1.3.0

# 4. 创建版本标签
gw t
# 创建对应的 Git 标签

# 5. 推送到远程
git push origin main --tags

# 6. 发布到包管理器（如果适用）
npm publish
```

### 预发布测试流程

```bash
# 1. 创建 alpha 版本
gw r
# 选择: alpha → 1.3.0-alpha.1

gw c  # 提交版本更新
gw t  # 创建标签

# 2. 内部测试，发现问题后修复
gw c  # 提交修复

# 3. 递增 alpha 版本
gw r
# 选择: alpha → 1.3.0-alpha.2

# 4. 测试通过，升级到 beta
gw r
# 选择: beta → 1.3.0-beta.1

# 5. 公开测试，收集反馈
# 修复问题，递增 beta 版本...

# 6. 创建 RC 版本
gw r
# 选择: rc → 1.3.0-rc.1

# 7. 最终测试通过，发布正式版本
gw r
# 选择: release → 1.3.0
```

### 紧急修复发布流程

```bash
# 1. 基于生产版本创建 hotfix 分支
git checkout v1.2.3
gw h
# BUG-456, fix-critical-security-issue

# 2. 修复问题
gw c
# 🐛 fix(security): 修复关键安全漏洞

# 3. 发布补丁版本
gw r
# 选择: patch → 1.2.4

gw c  # 提交版本更新
gw t  # 创建标签

# 4. 合并到主分支
git checkout main
git merge hotfix/20260111-BUG-456-fix-critical-security-issue

# 5. 立即发布
npm publish
```

## ⚙️ 版本发布配置

### 基础配置

```json
{
  "release": {
    "autoCommit": true,
    "autoTag": true,
    "commitMessage": "chore: release v{version}",
    "tagMessage": "Release v{version}"
  }
}
```

### 配置项说明

| 配置项          | 类型      | 默认值                    | 说明                     |
| --------------- | --------- | ------------------------- | ------------------------ |
| `autoCommit`    | `boolean` | `false`                   | 版本更新后自动提交       |
| `autoTag`       | `boolean` | `false`                   | 版本更新后自动创建标签   |
| `commitMessage` | `string`  | `"chore: release v{version}"` | 版本提交的消息模板   |
| `tagMessage`    | `string`  | `"Release v{version}"`    | 标签消息模板             |

### 高级配置

```json
{
  "release": {
    "files": [
      "package.json",
      "package-lock.json",
      "src/version.ts"
    ],
    "prerelease": {
      "alpha": "alpha",
      "beta": "beta",
      "rc": "rc"
    },
    "hooks": {
      "prerelease": "npm run test",
      "postrelease": "npm run build"
    }
  }
}
```

## 🎯 发布场景管理

### 场景一：功能版本发布

```bash
# 开发周期完成，准备发布新功能
# 当前版本: 1.2.3

# 1. 确保所有功能分支已合并
git checkout main
git pull origin main

# 2. 运行完整测试
npm test

# 3. 更新版本号
gw r
# 选择: minor → 1.3.0

# 4. 生成变更日志
npm run changelog

# 5. 提交版本更新
gw c
# 🔖 chore: 发布版本 v1.3.0

# 6. 创建发布标签
gw t
# v1.3.0

# 7. 推送并发布
git push origin main --tags
npm publish
```

### 场景二：补丁版本发布

```bash
# 修复了重要 Bug，需要快速发布
# 当前版本: 1.3.0

# 1. 确认修复已完成
gw c
# 🐛 fix(api): 修复数据获取失败问题

# 2. 更新补丁版本
gw r
# 选择: patch → 1.3.1

# 3. 快速发布
gw c  # 提交版本更新
gw t  # 创建标签
git push origin main --tags
npm publish
```

### 场景三：预发布版本管理

```bash
# 大版本开发中，需要预发布版本
# 当前版本: 1.3.1

# 1. 创建 alpha 版本
gw r
# 选择: alpha → 1.4.0-alpha.1

# 2. 发布到测试环境
npm publish --tag alpha

# 3. 收集反馈，修复问题
gw c  # 修复提交

# 4. 递增 alpha 版本
gw r
# 选择: alpha → 1.4.0-alpha.2

# 5. 升级到 beta
gw r
# 选择: beta → 1.4.0-beta.1

# 6. 发布到预发布环境
npm publish --tag beta

# 7. 最终发布正式版本
gw r
# 选择: release → 1.4.0

npm publish --tag latest
```

### 场景四：多版本维护

```bash
# 同时维护多个版本分支
# v1.x 维护分支
git checkout release/1.x
gw r
# patch → 1.3.2

# v2.x 维护分支
git checkout release/2.x
gw r
# patch → 2.1.1

# 主开发分支
git checkout main
gw r
# minor → 2.2.0
```

## 🔧 高级发布技巧

### 技巧一：版本号同步

确保多个文件中的版本号保持同步：

```bash
# 自动更新多个文件中的版本号
# package.json
{
  "version": "1.3.0"
}

# src/version.ts
export const VERSION = '1.3.0';

# README.md
# MyProject v1.3.0
```

### 技巧二：变更日志生成

```bash
# 使用 conventional-changelog 生成变更日志
npm install -g conventional-changelog-cli

# 生成变更日志
conventional-changelog -p angular -i CHANGELOG.md -s

# 或集成到发布流程
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "release": "npm run changelog && gw r"
  }
}
```

### 技巧三：发布钩子

```bash
# package.json 中的发布钩子
{
  "scripts": {
    "preversion": "npm test",
    "version": "npm run build && git add -A",
    "postversion": "git push && git push --tags"
  }
}
```

### 技巧四：条件发布

```bash
# 只在特定分支发布
if [ "$(git branch --show-current)" = "main" ]; then
  gw r
  npm publish
else
  echo "只能在 main 分支发布"
fi
```

## 📊 发布管理度量

### 发布频率统计

```bash
#!/bin/bash
# release-metrics.sh

echo "=== 版本发布度量报告 ==="
echo "时间: $(date)"
echo

# 发布频率统计
echo "📊 发布频率统计:"
git tag --sort=-creatordate | head -20 | while read tag; do
  date=$(git log -1 --format=%ai $tag 2>/dev/null)
  echo "$tag - $date"
done | head -10
echo

# 版本类型分布
echo "📊 版本类型分布:"
total_tags=$(git tag | wc -l)
major_tags=$(git tag | grep -E '\.[0-9]+\.0$' | wc -l)
minor_tags=$(git tag | grep -E '\.[1-9][0-9]*\.0$' | wc -l)
patch_tags=$(git tag | grep -E '\.[0-9]+\.[1-9][0-9]*$' | wc -l)
prerelease_tags=$(git tag | grep -E '(alpha|beta|rc)' | wc -l)

echo "总版本数: $total_tags"
echo "主版本: $major_tags"
echo "次版本: $minor_tags"
echo "补丁版本: $patch_tags"
echo "预发布版本: $prerelease_tags"
echo

# 发布间隔分析
echo "📊 发布间隔分析:"
git tag --sort=-creatordate | head -5 | while read current; do
  previous=$(git tag --sort=-creatordate | grep -A1 "^$current$" | tail -1)
  if [ "$previous" != "$current" ] && [ -n "$previous" ]; then
    days=$(git log --format=%ct $previous..$current | head -1 | xargs -I {} date -d @{} +%s)
    prev_days=$(git log --format=%ct $previous | head -1)
    interval=$(( (days - prev_days) / 86400 ))
    echo "$current: $interval 天"
  fi
done
```

### 版本质量度量

```bash
# 统计每个版本的提交数量和类型
git tag --sort=-creatordate | head -10 | while read current; do
  previous=$(git tag --sort=-creatordate | grep -A1 "^$current$" | tail -1)
  if [ "$previous" != "$current" ] && [ -n "$previous" ]; then
    echo "=== $current ==="
    git log --oneline $previous..$current | wc -l | xargs echo "提交数:"
    git log --oneline $previous..$current | grep -E '^[a-f0-9]+ (feat|fix|docs)' | \
      cut -d' ' -f2 | sort | uniq -c
    echo
  fi
done
```

## 🚨 常见问题解决

### 问题一：版本号格式错误

```bash
❌ 版本号格式不正确: 1.2.3.4
```

**解决方案：**
- 遵循 semver 格式：`major.minor.patch[-prerelease]`
- 检查 package.json 中的版本号格式
- 使用工具提供的版本选择

### 问题二：package.json 不存在

```bash
❌ 找不到 package.json 文件
```

**解决方案：**
- 确认在正确的项目根目录
- 创建 package.json 文件：`npm init`
- 或手动创建基本的 package.json

### 问题三：版本更新失败

```bash
❌ 版本更新失败: 权限不足
```

**解决方案：**
- 检查文件写入权限
- 确认 package.json 不是只读
- 使用管理员权限运行

### 问题四：版本冲突

```bash
❌ 版本 1.3.0 已存在
```

**解决方案：**
- 选择不同的版本号
- 删除现有标签：`git tag -d v1.3.0`
- 或递增到下一个版本

## 🔗 与 CI/CD 集成

### GitHub Actions 集成

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: ${{ contains(github.ref, 'alpha') || contains(github.ref, 'beta') || contains(github.ref, 'rc') }}
```

### 自动化发布脚本

```bash
#!/bin/bash
# auto-release.sh

set -e

echo "🚀 开始自动发布流程..."

# 1. 检查工作区状态
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 工作区不干净，请先提交或暂存更改"
  exit 1
fi

# 2. 拉取最新代码
git pull origin main

# 3. 运行测试
echo "🧪 运行测试..."
npm test

# 4. 更新版本号
echo "📦 更新版本号..."
gw r

# 5. 构建项目
echo "🔨 构建项目..."
npm run build

# 6. 提交版本更新
echo "📝 提交版本更新..."
gw c

# 7. 创建标签
echo "🏷️ 创建版本标签..."
gw t

# 8. 推送到远程
echo "📤 推送到远程..."
git push origin main --tags

# 9. 发布到 npm
echo "📦 发布到 npm..."
npm publish

echo "✅ 发布完成！"
```

---

通过系统化的版本发布管理，你可以建立规范、可靠的软件发布流程。Git Workflow 的版本管理功能让复杂的发布过程变得简单，确保版本号的一致性和可追溯性。