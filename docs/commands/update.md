# 工具维护

工具维护相关的命令和安装说明。

## 命令概览

| 命令       | 别名    | 说明               |
| ---------- | ------- | ------------------ |
| `gw clean` | `gw cc` | 清理缓存和临时文件 |

## 更新到最新版本

`git-workflow` 不再提供内置更新命令。需要升级时，直接使用包管理器安装最新版本：

```bash
# npm
npm install -g @zjex/git-workflow@latest

# Volta
volta install @zjex/git-workflow@latest
```

更新后可以验证版本：

```bash
hash -r && gw --version
```

如果当前终端仍然显示旧版本，重新打开终端后再执行 `gw --version`。

## 更新提醒

工具仍会在运行时进行非阻塞的版本检查。发现新版本时，会直接提示可执行的安装命令。

## 故障排除

### 权限问题

```bash
sudo npm install -g @zjex/git-workflow@latest
```

### 缓存问题

```bash
npm cache clean --force
npm install -g @zjex/git-workflow@latest
```

### 网络问题

```bash
npm config set registry https://registry.npmmirror.com/
npm install -g @zjex/git-workflow@latest
```

### 版本冲突

```bash
npm uninstall -g @zjex/git-workflow
npm install -g @zjex/git-workflow@latest
hash -r && gw --version
```

## 清理缓存

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

```bash
# 清理缓存，释放空间
gw clean

# 删除配置后重新初始化
gw clean
gw init
```

### 安全性

- 删除全局配置前会询问确认
- 不会删除项目级配置文件
- 不会影响 Git 仓库数据
- 可以随时通过 `gw init` 重新配置
