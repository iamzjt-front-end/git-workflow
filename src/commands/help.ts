import { TODAY } from "../utils.js";

export function showHelp(): void {
  console.log(`
Git 工作流工具 - 快速创建开发分支和管理 Tag

用法: gw <命令> [参数]

分支命令:
  feat, f [--base=分支名]    创建 feature 分支
  fix, h [--base=分支名]     创建 hotfix 分支
  del, d [分支名]            删除本地/远程分支

Tag 命令:
  tags, ts [前缀]            列出所有 tag，可按前缀过滤
  tag, t [前缀]              交互式选择版本类型并创建 tag

其他:
  help, -h                   显示帮助信息

示例:
  gw f                       交互式创建 feature 分支 (基于 main/master)
  gw f --base=develop        基于 develop 分支创建 feature 分支
  gw h --base=release        基于 release 分支创建 hotfix 分支
  gw d                       交互式删除分支
  gw d feature/xxx           直接删除指定分支
  gw ts v                    列出所有 v 开头的 tag
  gw t                       交互式选择前缀和版本

分支命名格式:
  feature/${TODAY}-<Story ID>-<描述>
  hotfix/${TODAY}-<Issue ID>-<描述>
`);
}
