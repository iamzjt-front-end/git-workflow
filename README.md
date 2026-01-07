# git-workflow

[![npm version](https://img.shields.io/npm/v/git-workflow.svg)](https://www.npmjs.com/package/git-workflow)
[![license](https://img.shields.io/npm/l/git-workflow.svg)](https://github.com/iamzjt/git-workflow/blob/main/LICENSE)

个人常用的 Git 工作流 CLI 工具，快速创建规范的开发分支和管理 Tag。

## 特性

- 🚀 交互式创建 feature/hotfix 分支
- 🏷️ 交互式递增版本号并创建 tag（支持 semver 和预发布版本）
- 🗑️ 交互式删除本地/远程分支
- ⚙️ 支持项目级配置文件
- 🎨 友好的命令行交互体验

## 安装

```bash
npm install -g git-workflow
```

## 使用

```bash
gw <命令> [参数]
```

### 分支命令

| 命令                      | 缩写   | 说明              |
| ------------------------- | ------ | ----------------- |
| `gw feat [--base=分支名]` | `gw f` | 创建 feature 分支 |
| `gw fix [--base=分支名]`  | `gw h` | 创建 hotfix 分支  |
| `gw del [分支名]`         | `gw d` | 删除本地/远程分支 |

```bash
# 交互式创建 feature 分支 (基于 main/master)
gw f

# 基于 develop 分支创建
gw f --base=develop

# 交互式删除分支（按最近使用排序）
gw d

# 直接删除指定分支
gw d feature/xxx
```

### Tag 命令

| 命令             | 缩写    | 说明                       |
| ---------------- | ------- | -------------------------- |
| `gw tags [前缀]` | `gw ts` | 列出 tag（可按前缀过滤）   |
| `gw tag [前缀]`  | `gw t`  | 交互式递增版本号并创建 tag |

```bash
# 列出所有 v 开头的 tag
gw ts v

# 交互式创建下一个版本（支持 patch/minor/major/alpha/beta/rc）
gw t
```

### 帮助

```bash
gw help
gw --help
gw -h
```

## 分支命名格式

```
feature/YYYYMMDD-<ID>-<描述>
hotfix/YYYYMMDD-<ID>-<描述>
```

ID 可跳过，格式变为：

```
feature/YYYYMMDD-<描述>
hotfix/YYYYMMDD-<描述>
```

## 配置文件

在项目根目录创建 `.gwrc.json` 文件可自定义行为（不同项目可以有不同配置）：

```json
{
  "baseBranch": "develop",
  "featurePrefix": "feature",
  "hotfixPrefix": "hotfix",
  "requireId": false,
  "featureIdLabel": "Story ID",
  "hotfixIdLabel": "Issue ID",
  "defaultTagPrefix": "v",
  "autoPush": true
}
```

| 配置项             | 类型    | 默认值     | 说明                                       |
| ------------------ | ------- | ---------- | ------------------------------------------ |
| `baseBranch`       | string  | 自动检测   | 默认基础分支，不设置则自动检测 main/master |
| `featurePrefix`    | string  | `feature`  | feature 分支前缀                           |
| `hotfixPrefix`     | string  | `hotfix`   | hotfix 分支前缀                            |
| `requireId`        | boolean | `false`    | 是否要求必填 ID                            |
| `featureIdLabel`   | string  | `Story ID` | feature 分支 ID 提示文字                   |
| `hotfixIdLabel`    | string  | `Issue ID` | hotfix 分支 ID 提示文字                    |
| `defaultTagPrefix` | string  | -          | 默认 tag 前缀，设置后 `gw t` 直接使用      |
| `autoPush`         | boolean | -          | 创建分支后是否自动推送，不设置则询问       |

配置文件查找顺序：当前目录 → Git 仓库根目录

支持的文件名：`.gwrc.json`、`.gwrc`、`gw.config.json`

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 本地测试
npm link
```

## License

MIT
