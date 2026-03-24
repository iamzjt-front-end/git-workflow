# Tag 管理

Tag 管理是版本控制的重要组成部分，Git Workflow 提供了智能的标签创建、管理和版本递增功能。

## 🏷️ Tag 管理理念

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

### 智能前缀检测

自动检测仓库中已有的 tag 前缀：

```bash
gw t
检测到以下 tag 前缀:
? 选择 tag 前缀:
❯ v (最新: v1.2.0)
  release- (最新: release-1.0.0)
  @scope/pkg@ (最新: @scope/pkg@0.1.0)
  + 使用新前缀
```

## 🎯 创建 Tag

### 基本用法

```bash
gw t
# 或使用别名
gw tag
```

### 智能版本选择

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
  custom  → 自定义版本号

✔ Tag 创建成功: v1.2.1
✔ Tag 已推送: v1.2.1
```

### 版本类型详解

#### 正式版本

| 类型    | 说明                     | 示例变化        | 使用场景                 |
| ------- | ------------------------ | --------------- | ------------------------ |
| patch   | 修复 Bug，向下兼容       | 1.2.0 → 1.2.1   | Bug 修复、安全补丁       |
| minor   | 新功能，向下兼容         | 1.2.0 → 1.3.0   | 新功能、API 扩展         |
| major   | 破坏性变更，不向下兼容   | 1.2.0 → 2.0.0   | 重大重构、API 变更       |

#### 预发布版本

| 类型  | 说明         | 示例                | 使用场景                 |
| ----- | ------------ | ------------------- | ------------------------ |
| alpha | 内测版本     | 1.2.1-alpha.1       | 早期开发、内部测试       |
| beta  | 公测版本     | 1.2.1-beta.1        | 功能完整、公开测试       |
| rc    | 候选发布版本 | 1.2.1-rc.1          | 发布前最终测试           |

### 预发布版本管理

#### 从正式版本创建预发布版本

```bash
# 当前版本: v1.2.0
gw t
? 选择版本类型:
❯ alpha   → v1.2.1-alpha.1
  beta    → v1.2.1-beta.1
  rc      → v1.2.1-rc.1
```

#### 预发布版本递增

```bash
# 当前版本: v1.2.1-beta.1
gw t
? 选择版本类型:
❯ pre     → v1.2.1-beta.2    # 预发布版本递增
  release → v1.2.1            # 转为正式版本
  patch   → v1.2.2            # 跳过当前预发布，创建新的 patch
  minor   → v1.3.0            # 跳过当前预发布，创建新的 minor
  major   → v2.0.0            # 跳过当前预发布，创建新的 major
```

#### 预发布版本转正

```bash
# 当前版本: v1.2.1-rc.2
gw t
? 选择版本类型:
❯ release → v1.2.1            # 转为正式版本

✔ Tag 创建成功: v1.2.1
✔ 预发布版本已转为正式版本
```

### 自定义版本号

```bash
gw t
? 选择版本类型:
  patch   → v1.2.1
  minor   → v1.3.0
  major   → v2.0.0
❯ custom  → 自定义版本号

? 输入自定义版本号: 2.0.0-beta.1
✔ Tag 创建成功: v2.0.0-beta.1
```

### 指定前缀创建

```bash
# 直接指定前缀
gw t v
gw t release-
gw t @scope/pkg@
```

## 📋 列出 Tags

### 基本用法

```bash
gw ts
# 或使用别名
gw tags
```

### 按前缀过滤

```bash
# 列出所有 v 开头的标签
gw ts v

# 列出所有 release- 开头的标签
gw ts release-

# 列出所有标签
gw ts
```

### 标签列表显示

```bash
gw ts v
📋 标签列表 (前缀: v)

v2.1.0    (2 days ago)    Latest release with new features
v2.0.1    (1 week ago)    Hotfix for critical bug
v2.0.0    (2 weeks ago)   Major release with breaking changes
v1.3.2    (3 weeks ago)   Bug fixes and improvements
v1.3.1    (1 month ago)   Security patch
v1.3.0    (1 month ago)   New features and enhancements

共 6 个标签
```

**显示信息：**
- **标签名** - 完整的标签名称
- **时间** - 创建时间（相对时间）
- **消息** - 标签附带的消息（如果有）

## 🗑️ 删除 Tags

### 基本用法

```bash
gw td
# 或使用别名
gw tag:delete
```

### 交互式删除

```bash
gw td
? 选择要删除的 tag:
❯ v1.2.0 Release v1.2.0 (2 days ago)
  v1.1.0 Release v1.1.0 (1 week ago)
  v1.0.0 Initial release (2 weeks ago)
  取消

分支信息:
  名称: v1.2.0
  创建时间: 2 days ago
  提交: a1b2c3d
  消息: Release v1.2.0
────────────────────────────────────────
? 确认删除 tag v1.2.0?
❯ 是，删除本地和远程
  仅删除本地
  取消

✔ 本地 tag 已删除: v1.2.0
✔ 远程 tag 已删除: origin/v1.2.0
```

### 批量删除策略

#### 删除预发布版本

```bash
# 删除所有 alpha 版本
git tag -l "*alpha*" | xargs git tag -d
git tag -l "*alpha*" | xargs -I {} git push origin :refs/tags/{}

# 删除所有 beta 版本
git tag -l "*beta*" | xargs git tag -d
git tag -l "*beta*" | xargs -I {} git push origin :refs/tags/{}
```

#### 删除过期版本

```bash
# 删除 6 个月前的标签
git for-each-ref --format='%(refname:short) %(creatordate:unix)' refs/tags | \
  awk '$2 < '$(date -d '6 months ago' +%s)' {print $1}' | \
  xargs git tag -d
```

## ✏️ 修改 Tags

### 基本用法

```bash
gw tu
# 或使用别名
gw tag:update
```

### 修改标签消息

```bash
gw tu
? 选择要修改的 tag:
❯ v1.2.0 Release v1.2.0 (2 days ago)
  v1.1.0 Release v1.1.0 (1 week ago)

当前消息: Release v1.2.0
? 输入新的 tag 消息: Release v1.2.0 - Bug fixes and performance improvements

✔ Tag 消息已更新: v1.2.0
✔ 已推送到远程
```

### 修改标签指向

```bash
# 手动修改标签指向的提交
git tag -f v1.2.0 abc1234
git push origin v1.2.0 --force
```

## 🎯 Tag 使用场景

### 场景一：版本发布流程

```bash
# 1. 开发完成，准备发布
gw c  # 最后的提交

# 2. 创建预发布版本进行测试
gw t
# 选择: beta → v1.3.0-beta.1

# 3. 测试发现问题，修复后递增预发布版本
gw c  # 修复提交
gw t
# 选择: pre → v1.3.0-beta.2

# 4. 测试通过，创建候选版本
gw t
# 选择: rc → v1.3.0-rc.1

# 5. 最终测试通过，发布正式版本
gw t
# 选择: release → v1.3.0
```

### 场景二：紧急修复发布

```bash
# 1. 发现生产环境 Bug
gw h --base main
# BUG-456, fix-critical-security-issue

# 2. 修复问题
gw c
# 🐛 fix(security): 修复 SQL 注入漏洞

# 3. 立即发布补丁版本
gw t
# 选择: patch → v1.2.1

# 4. 部署到生产环境
```

### 场景三：功能预览版本

```bash
# 1. 新功能开发完成
gw f
# PROJ-123, add-new-dashboard

gw c
# ✨ feat(dashboard): 添加新的仪表板功能

# 2. 创建 alpha 版本供内部测试
gw t
# 选择: alpha → v1.3.0-alpha.1

# 3. 收集反馈，改进功能
gw c
# 💄 style(dashboard): 优化界面布局

gw t
# 选择: pre → v1.3.0-alpha.2

# 4. 功能稳定后创建 beta 版本
gw t
# 选择: beta → v1.3.0-beta.1
```

### 场景四：多版本维护

```bash
# 维护多个版本分支
# v1.x 分支
git checkout release/1.x
gw t
# 选择: patch → v1.2.3

# v2.x 分支
git checkout release/2.x
gw t
# 选择: patch → v2.1.1

# 主开发分支
git checkout main
gw t
# 选择: minor → v2.2.0
```

## 🔧 高级 Tag 技巧

### 技巧一：带签名的标签

```bash
# 创建 GPG 签名标签
git tag -s v1.2.0 -m "Release v1.2.0"

# 验证签名
git tag -v v1.2.0
```

### 技巧二：标签与分支关联

```bash
# 查看标签对应的分支
git branch --contains v1.2.0

# 查看标签之间的差异
git diff v1.1.0..v1.2.0

# 基于标签创建分支
git checkout -b hotfix/v1.2.1 v1.2.0
```

### 技巧三：标签搜索和过滤

```bash
# 搜索包含特定模式的标签
git tag -l "v1.2.*"
git tag -l "*beta*"
git tag -l "*rc*"

# 按时间排序标签
git tag --sort=-creatordate
git tag --sort=version:refname
```

### 技巧四：标签与 CI/CD 集成

```bash
# GitHub Actions 示例
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/v')
        run: |
          echo "Creating release for ${GITHUB_REF#refs/tags/}"
```

## ⚙️ Tag 配置管理

### 默认前缀配置

```json
{
  "defaultTagPrefix": "v"
}
```

设置后，创建标签时会跳过前缀选择步骤。

### Tag 基准策略

```json
{
  "defaultTagPrefix": "v",
  "tagLookupStrategy": "latest"
}
```

`tagLookupStrategy` 支持两种模式：
- `all`：全量拉取并按版本号排序，兼容当前默认行为
- `latest`：优先基于最新创建的 tag 递增，适合历史上出现过误打高版本 tag 的仓库；如果本地没有该前缀的 tag，会自动回退一次全量同步

### 版本格式配置

```json
{
  "tagFormat": {
    "prefix": "v",
    "separator": ".",
    "prerelease": {
      "alpha": "alpha",
      "beta": "beta",
      "rc": "rc"
    }
  }
}
```

### 自动推送配置

```json
{
  "tagAutoPush": true
}
```

创建标签后自动推送到远程仓库。

## 📊 Tag 管理度量

### 版本发布频率

```bash
#!/bin/bash
# tag-metrics.sh

echo "=== Tag 管理度量报告 ==="
echo "时间: $(date)"
echo

# 版本发布统计
echo "📊 版本发布统计:"
git tag --sort=-creatordate | head -10 | while read tag; do
  date=$(git log -1 --format=%ai $tag)
  echo "$tag - $date"
done
echo

# 版本类型分布
echo "📊 版本类型分布:"
echo "正式版本: $(git tag -l | grep -v -E '(alpha|beta|rc)' | wc -l)"
echo "Alpha 版本: $(git tag -l | grep alpha | wc -l)"
echo "Beta 版本: $(git tag -l | grep beta | wc -l)"
echo "RC 版本: $(git tag -l | grep rc | wc -l)"
echo

# 发布间隔分析
echo "📊 发布间隔分析:"
git tag --sort=-creatordate | head -5 | while read tag; do
  commits=$(git rev-list --count ${tag}..HEAD 2>/dev/null || echo "0")
  echo "$tag: $commits commits behind HEAD"
done
```

### 版本质量度量

```bash
# 统计每个版本的提交数量
git tag --sort=-creatordate | head -10 | while read current; do
  previous=$(git tag --sort=-creatordate | grep -A1 "^$current$" | tail -1)
  if [ "$previous" != "$current" ] && [ -n "$previous" ]; then
    commits=$(git rev-list --count $previous..$current)
    echo "$current: $commits commits"
  fi
done
```

## 🚨 常见问题解决

### 问题一：标签已存在

```bash
❌ 标签 'v1.2.0' 已存在
```

**解决方案：**
```bash
# 删除现有标签
git tag -d v1.2.0
git push origin :refs/tags/v1.2.0

# 重新创建
gw t
```

### 问题二：无法推送标签

```bash
❌ 标签推送失败: 权限不足
```

**解决方案：**
1. 检查推送权限
2. 手动推送：`git push origin v1.2.0`
3. 联系仓库管理员

### 问题三：版本号格式错误

```bash
❌ 版本号格式不正确: 1.2.3.4
```

**解决方案：**
- 遵循 semver 格式：`major.minor.patch[-prerelease]`
- 使用工具提供的版本选择而不是自定义

### 问题四：标签与提交不匹配

```bash
❌ 标签指向的提交不存在
```

**解决方案：**
```bash
# 检查提交是否存在
git log --oneline -n 10

# 重新创建标签
git tag v1.2.0 <correct-commit-hash>
```

## 🔗 与其他功能集成

### 与分支管理集成

```bash
# 功能开发完成后创建标签
gw f  # 创建功能分支
gw c  # 提交代码
gw t  # 创建版本标签
gw d  # 删除功能分支
```

### 与版本发布集成

```bash
# 更新 package.json 版本
gw r  # 选择版本类型

# 创建对应的 git 标签
gw t  # 创建相同版本的标签
```

### 与 CI/CD 集成

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
      - name: Get tag version
        run: echo "VERSION=${GITHUB_REF#refs/tags/}" >> $GITHUB_ENV
      - name: Create Release
        run: |
          echo "Creating release for $VERSION"
```

---

通过系统化的 Tag 管理，你可以建立清晰的版本发布流程。Git Workflow 的智能版本递增和前缀检测功能，让版本管理变得简单而规范。
