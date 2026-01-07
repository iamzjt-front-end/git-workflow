import { TODAY } from "../utils.js";

export function showHelp(): string {
  return `
分支命令:
  gw feature [--base <branch>]    创建 feature 分支
  gw feat [--base <branch>]       同上 (简写)
  gw f [--base <branch>]          同上 (简写)

  gw hotfix [--base <branch>]     创建 hotfix 分支
  gw fix [--base <branch>]        同上 (简写)
  gw h [--base <branch>]          同上 (简写)

  gw delete [branch]              删除本地/远程分支
  gw del [branch]                 同上 (简写)
  gw d [branch]                   同上 (简写)

Tag 命令:
  gw tags [prefix]                列出所有 tag，可按前缀过滤
  gw ts [prefix]                  同上 (简写)

  gw tag [prefix]                 交互式选择版本类型并创建 tag
  gw t [prefix]                   同上 (简写)

发布命令:
  gw release                      交互式选择版本号并更新 package.json
  gw r                            同上 (简写)

配置命令:
  gw init                         初始化配置文件 .gwrc.json

示例:
  gw feat                         基于 main/master 创建 feature 分支
  gw feat --base develop          基于 develop 分支创建 feature 分支
  gw fix --base release           基于 release 分支创建 hotfix 分支
  gw del                          交互式选择并删除分支
  gw del feature/xxx              直接删除指定分支
  gw tags v                       列出所有 v 开头的 tag
  gw tag                          交互式创建 tag

分支命名格式:
  feature/${TODAY}-<Story ID>-<描述>
  hotfix/${TODAY}-<Issue ID>-<描述>
`;
}
