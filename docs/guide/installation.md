# 安装

本指南将详细介绍如何在不同环境下安装和配置 Git Workflow。

## 📋 系统要求

### 必需环境

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0（或其他包管理器）
- **Git** >= 2.0.0

### 推荐环境

- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **终端**: 支持 ANSI 颜色的现代终端
- **字体**: 支持 Unicode 字符的字体（用于显示 emoji）

## 🚀 安装方法

### 方法一：npm（推荐）

```bash
npm install -g @zjex/git-workflow
```

### 方法二：pnpm

```bash
pnpm add -g @zjex/git-workflow
```

### 方法三：yarn

```bash
yarn global add @zjex/git-workflow
```

### 方法四：Volta

如果你使用 [Volta](https://volta.sh/) 管理 Node.js 版本：

```bash
volta install @zjex/git-workflow
```

## ✅ 验证安装

安装完成后，验证是否成功：

```bash
# 检查版本
gw --version
# 输出: v0.2.24

# 检查命令是否可用
gw --help
# 显示帮助信息

# 运行交互式菜单
gw
# 显示主菜单
```

如果看到版本号和帮助信息，说明安装成功！

## 🔧 环境配置

### 终端配置

为了获得最佳体验，建议配置终端：

#### Windows

**推荐终端：**
- [Windows Terminal](https://github.com/microsoft/terminal) - 微软官方现代终端
- [PowerShell 7+](https://github.com/PowerShell/PowerShell) - 跨平台 PowerShell

**配置步骤：**

1. 安装 Windows Terminal：
```powershell
winget install Microsoft.WindowsTerminal
```

2. 配置字体（支持 emoji）：
   - 打开 Windows Terminal 设置
   - 选择字体：`Cascadia Code` 或 `JetBrains Mono`
   - 启用 Unicode 支持

#### macOS

**推荐终端：**
- [iTerm2](https://iterm2.com/) - 功能强大的终端
- Terminal.app - 系统自带终端

**配置步骤：**

1. 安装 iTerm2：
```bash
brew install --cask iterm2
```

2. 配置字体：
   - 偏好设置 → Profiles → Text
   - 选择字体：`SF Mono` 或 `JetBrains Mono`

#### Linux

**推荐终端：**
- [Alacritty](https://github.com/alacritty/alacritty) - 高性能终端
- [Kitty](https://sw.kovidgoyal.net/kitty/) - 功能丰富的终端
- GNOME Terminal - 系统默认终端

**配置步骤：**

1. 安装 Alacritty：
```bash
# Ubuntu/Debian
sudo apt install alacritty

# Arch Linux
sudo pacman -S alacritty

# Fedora
sudo dnf install alacritty
```

2. 配置字体：
```bash
# 安装推荐字体
sudo apt install fonts-jetbrains-mono
```

### Shell 配置

#### Bash

添加到 `~/.bashrc`：

```bash
# Git Workflow 别名
alias gwf='gw f'
alias gwh='gw h'
alias gwc='gw c'
alias gwt='gw t'
alias gwd='gw d'
alias gws='gw s'

# 自动补全（如果支持）
if command -v gw >/dev/null 2>&1; then
  eval "$(gw --completion bash)"
fi
```

#### Zsh

添加到 `~/.zshrc`：

```bash
# Git Workflow 别名
alias gwf='gw f'
alias gwh='gw h'
alias gwc='gw c'
alias gwt='gw t'
alias gwd='gw d'
alias gws='gw s'

# 自动补全（如果支持）
if command -v gw >/dev/null 2>&1; then
  eval "$(gw --completion zsh)"
fi
```

#### Fish

添加到 `~/.config/fish/config.fish`：

```fish
# Git Workflow 别名
alias gwf='gw f'
alias gwh='gw h'
alias gwc='gw c'
alias gwt='gw t'
alias gwd='gw d'
alias gws='gw s'

# 自动补全（如果支持）
if command -v gw >/dev/null 2>&1
  gw --completion fish | source
end
```

## 🎯 首次配置

安装完成后，建议立即进行初始配置：

### 1. 创建全局配置

```bash
gw init
```

选择 **全局配置（所有项目生效）**，这样所有项目都能使用 AI commit 等功能。

### 2. 配置 AI Commit（推荐）

如果选择启用 AI commit，推荐使用 GitHub Models（免费）：

1. 访问：https://github.com/settings/tokens/new
2. Token 名称：`git-workflow-ai`
3. 勾选权限：`repo`
4. 生成并复制 token
5. 在配置过程中输入 token

### 3. 测试配置

在任意 Git 项目中测试：

```bash
cd your-project
gw c  # 测试 AI commit
gw f  # 测试分支创建
```

## 🔄 更新

### 更新到最新版本

Git Workflow 会自动检查新版本。需要更新时，直接使用包管理器安装最新版本：

```bash
npm install -g @zjex/git-workflow@latest
```

如果使用 Volta：

```bash
volta install @zjex/git-workflow@latest
```

更新后可以执行 `hash -r && gw --version` 验证版本。

## 🗑️ 卸载

如果需要卸载 Git Workflow：

### 1. 卸载包

```bash
# npm
npm uninstall -g @zjex/git-workflow

# pnpm
pnpm remove -g @zjex/git-workflow

# yarn
yarn global remove @zjex/git-workflow

# Volta
volta uninstall @zjex/git-workflow
```

### 2. 清理配置文件

```bash
# 删除全局配置
rm ~/.gwrc.json

# 删除缓存文件
rm ~/.gw-update-check

# 删除项目配置（可选）
find . -name ".gwrc.json" -delete
```

### 3. 清理 Shell 配置

从 shell 配置文件中删除相关的别名和自动补全配置。

## 🐛 故障排除

### 常见问题

#### 1. 命令未找到

```bash
gw: command not found
```

**可能原因：**
- 安装失败
- PATH 环境变量未更新
- 使用了错误的包管理器

**解决方案：**
```bash
# 检查是否安装成功
npm list -g @zjex/git-workflow

# 重新安装
npm install -g @zjex/git-workflow

# 刷新 PATH（重新打开终端）
hash -r  # bash/zsh
rehash   # fish
```

#### 2. 权限错误

```bash
EACCES: permission denied
```

**解决方案：**
```bash
# 方法一：使用 npx（推荐）
npx @zjex/git-workflow

# 方法二：修复 npm 权限
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 方法三：使用 sudo（不推荐）
sudo npm install -g @zjex/git-workflow
```

#### 3. Node.js 版本过低

```bash
Error: Node.js version 16.x is not supported
```

**解决方案：**
```bash
# 检查 Node.js 版本
node --version

# 升级 Node.js（使用 nvm）
nvm install 18
nvm use 18

# 或使用 Volta
volta install node@18
```

#### 4. 网络连接问题

```bash
npm ERR! network timeout
```

**解决方案：**
```bash
# 使用国内镜像
npm install -g @zjex/git-workflow --registry=https://registry.npmmirror.com

# 或配置代理
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

#### 5. 终端显示异常

如果终端显示乱码或 emoji 不正常：

**解决方案：**
1. 确保终端支持 UTF-8 编码
2. 安装支持 Unicode 的字体
3. 在配置中禁用 emoji：
```json
{
  "useEmoji": false
}
```

### 诊断工具

#### 环境检查

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 Git 版本
git --version

# 检查安装位置
which gw
npm list -g @zjex/git-workflow
```

#### 调试模式

启用详细日志：

```bash
DEBUG=gw:* gw c
```

#### 重置配置

如果配置出现问题：

```bash
# 备份现有配置
cp ~/.gwrc.json ~/.gwrc.json.backup

# 重新初始化
gw init --reset
```

## 📚 下一步

安装完成后，建议继续学习：

- [**快速开始**](/guide/getting-started) - 三步开始使用
- [**基础用法**](/guide/basic-usage) - 掌握基本操作
- [**配置文件**](/config/) - 自定义工具行为
- [**命令参考**](/commands/) - 查看所有可用命令

## 💡 提示

- **定期更新** - 运行 `npm install -g @zjex/git-workflow@latest` 保持工具最新
- **备份配置** - 重要的配置文件建议备份
- **团队共享** - 项目配置可以提交到版本控制
- **问题反馈** - 遇到问题请在 [GitHub Issues](https://github.com/iamzjt-front-end/git-workflow/issues) 反馈

---

🎉 **安装完成！** 现在你可以开始享受高效的 Git 工作流了。
