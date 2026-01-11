# gw help - 帮助命令

`gw help` 命令提供了完整的命令帮助信息和使用指南。

## 🎯 功能特性

- 📋 **命令列表** - 显示所有可用命令及其描述
- 🔍 **详细说明** - 每个命令的具体用法和参数
- 💡 **使用示例** - 实际的命令使用示例
- ⌨️ **快捷键** - 交互式界面的键盘操作
- 🔗 **相关链接** - 文档链接和更多资源

## 📋 命令格式

```bash
# 显示帮助信息
gw help
gw --help
gw -h

# 显示特定命令的帮助
gw help <command>
gw <command> --help
gw <command> -h
```

## 🎨 帮助界面

### 主帮助页面

```bash
gw help
```

```
Git Workflow v0.3.2 - 极简的 Git 工作流 CLI 工具

用法:
  gw [command] [options]

核心命令:
  gw              显示交互式菜单
  gw f, feat      创建 feature 分支
  gw h, hotfix    创建 hotfix 分支
  gw c, commit    提交代码（支持 AI 生成）
  gw log, ls, l   查看提交历史（GitHub 风格）
  gw t, tag       创建版本标签
  gw d, delete    删除分支
  gw s, stash     管理 stash

辅助命令:
  gw r, release   发布版本
  gw ts, tags     列出标签
  gw td           删除标签
  gw tu           修改标签
  gw init         初始化配置
  gw upt, update  更新工具

全局选项:
  -h, --help      显示帮助信息
  -v, --version   显示版本号
  --config        指定配置文件路径
  --no-emoji      禁用 emoji 显示

示例:
  gw              # 显示交互式菜单
  gw f            # 创建 feature 分支
  gw c            # AI 智能提交
  gw log          # 查看提交历史
  gw t v          # 创建 v 前缀的标签

更多信息:
  文档: https://iamzjt-front-end.github.io/git-workflow/
  问题: https://github.com/iamzjt-front-end/git-workflow/issues
```

### 特定命令帮助

```bash
gw help commit
# 或
gw c --help
```

```
gw commit - 提交代码

用法:
  gw c [options]
  gw commit [options]

描述:
  交互式提交代码，支持 AI 自动生成 commit message

选项:
  -m, --message <msg>    直接指定 commit message
  --ai                   强制使用 AI 生成
  --manual               强制手动输入
  --no-verify            跳过 pre-commit 钩子
  --amend                修改上次提交
  -h, --help             显示帮助信息

示例:
  gw c                   # 交互式选择提交方式
  gw c --ai              # 直接使用 AI 生成
  gw c -m "fix: bug"     # 直接提交指定消息
  gw c --amend           # 修改上次提交

相关命令:
  gw log                 # 查看提交历史
  gw s                   # 管理 stash
```

## 📚 命令分类帮助

### 分支管理

```bash
gw help branch
```

显示所有分支相关命令的帮助：
- `gw f` - 创建 feature 分支
- `gw h` - 创建 hotfix 分支
- `gw d` - 删除分支

### 版本管理

```bash
gw help tag
```

显示所有标签相关命令的帮助：
- `gw t` - 创建标签
- `gw ts` - 列出标签
- `gw td` - 删除标签
- `gw tu` - 修改标签

### 提交管理

```bash
gw help commit
```

显示所有提交相关命令的帮助：
- `gw c` - 提交代码
- `gw log` - 查看历史

## 🔍 在线帮助

### 快速查找

如果不确定使用哪个命令，可以：

1. **运行交互式菜单**
   ```bash
   gw
   ```

2. **查看完整帮助**
   ```bash
   gw help
   ```

3. **搜索特定功能**
   ```bash
   gw help | grep "分支"
   ```

### 详细文档

每个命令都有详细的在线文档：

- [命令概览](/commands/) - 所有命令的快速参考
- [分支命令](/commands/branch) - 分支管理详细指南
- [提交命令](/commands/commit) - 提交和 AI 功能
- [日志命令](/commands/log) - 提交历史查看
- [标签命令](/commands/tag) - 版本标签管理
- [Stash 命令](/commands/stash) - 代码暂存管理

## ⌨️ 交互式帮助

在任何交互式界面中，都可以使用以下快捷键获取帮助：

| 快捷键 | 功能 |
|--------|------|
| `h` / `?` | 显示当前界面的帮助 |
| `Ctrl+H` | 显示全局帮助 |
| `F1` | 显示详细帮助 |
| `Esc` | 返回上级菜单 |

## 🛠️ 故障排除

### 常见问题

**Q: 命令不存在或无法识别？**
```bash
# 检查安装
npm list -g @zjex/git-workflow

# 重新安装
npm install -g @zjex/git-workflow@latest
```

**Q: 帮助信息显示不完整？**
```bash
# 调整终端窗口大小
# 或使用分页查看
gw help | less
```

**Q: 中文显示乱码？**
```bash
# 检查终端编码设置
echo $LANG

# 设置 UTF-8 编码
export LANG=zh_CN.UTF-8
```

### 获取支持

如果遇到问题，可以通过以下方式获取帮助：

1. **查看详细日志**
   ```bash
   DEBUG=gw:* gw <command>
   ```

2. **检查配置**
   ```bash
   gw init --show-config
   ```

3. **提交问题**
   - [GitHub Issues](https://github.com/iamzjt-front-end/git-workflow/issues)
   - [讨论区](https://github.com/iamzjt-front-end/git-workflow/discussions)

## 📖 更多资源

- 📚 [完整文档](https://iamzjt-front-end.github.io/git-workflow/)
- 🎥 [视频教程](https://github.com/iamzjt-front-end/git-workflow#videos)
- 💡 [最佳实践](https://github.com/iamzjt-front-end/git-workflow/wiki)
- 🔄 [更新日志](https://github.com/iamzjt-front-end/git-workflow/blob/main/CHANGELOG.md)

---

通过 `gw help` 命令，你可以随时获取最新的使用指南和帮助信息。如果有任何疑问，不要犹豫，直接查看帮助或访问在线文档。