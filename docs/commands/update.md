# Update 命令

更新管理相关的命令详解。

## 📋 命令概览

| 命令        | 别名     | 说明                 |
| ----------- | -------- | -------------------- |
| `gw update` | `gw upt` | 检查并更新到最新版本 |
| `gw clean`  | `gw cc`  | 清理缓存和临时文件   |

## 🔄 版本更新

### 基本用法

```bash
gw update
gw upt
```

### 更新流程

```bash
$ gw update
🔍 检查更新...

┌─────────────────────────────────┐
│                                 │
│   🎉 发现新版本！               │
│                                 │
│   0.2.24  →  0.2.25             │
│                                 │
└─────────────────────────────────┘

? 是否立即更新?
❯ 是，立即更新
  否，稍后更新
  查看更新日志

✔ 更新成功！

┌─────────────────────────────────┐
│                                 │
│   ✨ 更新完成！                 │
│                                 │
│   请重新打开终端使用新版本      │
│                                 │
└─────────────────────────────────┘
```

## 📊 版本检查

### 当前版本

```bash
$ gw --version
0.2.24

$ gw -v
0.2.24
```

### 版本对比

工具会自动对比本地版本和最新版本：

```bash
当前版本: 0.2.24
最新版本: 0.2.25
状态: 有新版本可用
```

## 🎯 更新场景

### 有新版本

```bash
$ gw update
🔍 检查更新...

发现新版本: 0.2.24 → 0.2.25

新版本特性:
• 修复 AI commit 生成问题
• 优化分支创建流程
• 更新文档和示例

? 是否立即更新?
❯ 是，立即更新
  否，稍后更新
  查看完整更新日志
```

### 已是最新版本

```bash
$ gw update
🔍 检查更新...

✔ 当前已是最新版本 (0.2.25)
```

### 网络连接问题

```bash
$ gw update
🔍 检查更新...

❌ 无法连接到更新服务器
请检查网络连接后重试
```

## 📋 更新日志

### 查看更新日志

```bash
? 是否立即更新: 查看更新日志

# Git Workflow v0.2.25

## 🎉 新功能
- 添加 AI commit 详细描述功能
- 支持自定义分支前缀配置

## 🐛 Bug 修复
- 修复 tag 创建时的版本检测问题
- 优化 stash 管理的文件显示

## 📝 文档更新
- 完善 VitePress 文档站点
- 添加配置示例和最佳实践

## 🔧 其他改进
- 优化命令行界面显示
- 提升错误处理和用户体验

按任意键继续...
```

### 版本历史

可以查看完整的版本更新历史：

```bash
# 最近版本
v0.2.25 - 2026-01-11
v0.2.24 - 2026-01-10
v0.2.23 - 2026-01-09
...
```

## 🔧 更新方式

### 自动更新

工具使用 npm 进行更新：

```bash
# 实际执行的命令
npm install -g @zjex/git-workflow@latest
```

### 手动更新

如果自动更新失败，可以手动更新：

```bash
# npm
npm install -g @zjex/git-workflow@latest

# pnpm
pnpm add -g @zjex/git-workflow@latest

# yarn
yarn global add @zjex/git-workflow@latest
```

## 🔔 更新提醒

### 自动检查

工具会在以下情况自动检查更新：

1. **每日首次使用** - 每天第一次运行命令时
2. **版本差距较大** - 本地版本落后较多时
3. **手动检查** - 运行 `gw update` 时

### 提醒频率

```bash
# 配置更新检查频率
export GW_UPDATE_CHECK=daily    # 每日检查（默认）
export GW_UPDATE_CHECK=weekly   # 每周检查
export GW_UPDATE_CHECK=never    # 禁用自动检查
```

### 静默模式

```bash
# 禁用更新提醒
export GW_SILENT_UPDATE=true

# 或在配置文件中设置
{
  "updateCheck": {
    "enabled": false
  }
}
```

## 🎯 使用场景

### 定期维护

```bash
# 每周检查更新
gw update

# 查看版本信息
gw --version
```

### CI/CD 环境

```bash
# 在 CI 中使用固定版本
npm install -g @zjex/git-workflow@0.2.24

# 或使用最新版本
npm install -g @zjex/git-workflow@latest
```

### 团队同步

```bash
# 团队统一版本
echo "推荐使用 git-workflow v0.2.25"
echo "更新命令: gw update"
```

## 🚀 版本管理

### 语义化版本

工具遵循 [Semantic Versioning](https://semver.org/) 规范：

```
主版本号.次版本号.修订号

0.2.24 → 0.2.25  # 修订号：Bug 修复
0.2.25 → 0.3.0   # 次版本号：新功能
0.3.0 → 1.0.0    # 主版本号：重大变更
```

### 版本兼容性

- **修订号更新** - 完全兼容，建议立即更新
- **次版本更新** - 向下兼容，可以安全更新
- **主版本更新** - 可能不兼容，需要查看迁移指南

### 预发布版本

```bash
# 安装预发布版本
npm install -g @zjex/git-workflow@beta
npm install -g @zjex/git-workflow@alpha

# 回到稳定版本
npm install -g @zjex/git-workflow@latest
```

## 🔧 故障排除

### 更新失败

```bash
# 权限问题
sudo npm install -g @zjex/git-workflow@latest

# 缓存问题
npm cache clean --force
npm install -g @zjex/git-workflow@latest

# 网络问题
npm config set registry https://registry.npmmirror.com/
npm install -g @zjex/git-workflow@latest
```

### 版本冲突

```bash
# 卸载旧版本
npm uninstall -g @zjex/git-workflow

# 安装新版本
npm install -g @zjex/git-workflow@latest

# 验证安装
gw --version
```

### 配置迁移

主版本更新时可能需要迁移配置：

```bash
# 备份配置
cp ~/.gwrc.json ~/.gwrc.json.backup

# 重新初始化配置
gw init

# 对比配置差异
diff ~/.gwrc.json.backup ~/.gwrc.json
```

## 📋 最佳实践

### 更新策略

1. **及时更新** - 修订号更新建议立即更新
2. **测试验证** - 次版本更新前在测试环境验证
3. **谨慎升级** - 主版本更新前详细阅读变更日志

### 团队协作

1. **版本统一** - 团队使用相同版本
2. **更新通知** - 及时通知团队成员更新
3. **文档维护** - 更新项目文档中的版本要求

### 自动化

```bash
# 在 CI 中自动更新
- name: Update git-workflow
  run: |
    npm install -g @zjex/git-workflow@latest
    gw --version
```

### 监控

```bash
# 监控版本状态
gw --version
gw update --check-only  # 仅检查，不更新
```

## 🧹 清理缓存

### 基本用法

```bash
gw clean
gw cc
```

### 清理内容

工具会清理以下文件：

1. **更新缓存** - `~/.gw-update-check`
2. **全局配置** - `~/.gwrc.json` (可选)
3. **临时文件** - `/tmp/.gw-commit-msg-*`

### 清理流程

```bash
$ gw clean
? 检测到全局配置文件，是否删除？
❯ 否，保留配置文件
  是，删除配置文件

✔ 已清理 3 个文件
```

### 删除全局配置

如果选择删除全局配置文件：

```bash
$ gw clean
? 检测到全局配置文件，是否删除？
❯ 是，删除配置文件

✔ 已清理 5 个文件

⚠️  全局配置文件已删除
   如需重新配置，请运行: gw init
```

### 使用场景

**定期清理：**

```bash
# 清理缓存，释放空间
gw clean
```

**重置配置：**

```bash
# 删除配置后重新初始化
gw clean  # 选择删除配置
gw init   # 重新配置
```

**故障排除：**

```bash
# 清理缓存解决更新检查问题
gw clean
gw update
```

### 安全性

- 删除全局配置前会询问确认
- 不会删除项目级配置文件
- 不会影响 Git 仓库数据
- 可以随时通过 `gw init` 重新配置
