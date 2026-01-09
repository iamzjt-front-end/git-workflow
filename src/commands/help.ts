import { TODAY } from "../utils.js";

export function showHelp(): string {
  return `
分支命令:
  gw feature [--base <branch>]    创建 feature 分支
  gw feat [--base <branch>]       同上 (别名)
  gw f [--base <branch>]          同上 (别名)

  gw hotfix [--base <branch>]     创建 hotfix 分支
  gw fix [--base <branch>]        同上 (别名)
  gw h [--base <branch>]          同上 (别名)

  gw delete [branch]              删除本地/远程分支
  gw del [branch]                 同上 (别名)
  gw d [branch]                   同上 (别名)

Tag 命令:
  gw tags [prefix]                列出所有 tag，可按前缀过滤
  gw ts [prefix]                  同上 (别名)

  gw tag [prefix]                 交互式选择版本类型并创建 tag
  gw t [prefix]                   同上 (别名)

  gw tag:delete                   删除 tag
  gw td                           同上 (别名)

  gw tag:update                   修改 tag 消息
  gw tu                           同上 (别名)

发布命令:
  gw release                      交互式选择版本号并更新 package.json
  gw r                            同上 (别名)

配置命令:
  gw init                         初始化配置文件
                                  • 全局配置: ~/.gwrc.json (所有项目生效)
                                  • 项目配置: .gwrc.json (仅当前项目)
                                  运行时可选择配置范围

更新命令:
  gw update                       检查并更新到最新版本
  gw upt                          同上 (别名)

Stash 命令:
  gw stash                        交互式管理 stash
  gw s                            同上 (别名)
  gw st                           同上 (别名)

Commit 命令:
  gw commit                       交互式提交 (Conventional Commits + Gitmoji)
  gw c                            同上 (别名)
  gw cm                           同上 (别名)

示例:
  gw f                            基于 main/master 创建 feature 分支
  gw f --base develop             基于 develop 分支创建 feature 分支
  gw h --base release             基于 release 分支创建 hotfix 分支
  gw d                            交互式选择并删除分支
  gw d feature/xxx                直接删除指定分支
  gw ts v                         列出所有 v 开头的 tag
  gw t                            交互式创建 tag
  gw td                           交互式删除 tag
  gw tu                           交互式修改 tag
  gw r                            交互式发布版本
  gw s                            交互式管理 stash
  gw c                            交互式提交代码

分支命名格式:
  feature/${TODAY}-<Story ID>-<描述>
  hotfix/${TODAY}-<Issue ID>-<描述>
`;
}
