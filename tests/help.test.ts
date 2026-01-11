import { describe, it, expect } from "vitest";
import { showHelp } from "../src/commands/help.js";
import { TODAY } from "../src/utils.js";

describe("Help 模块测试", () => {
  describe("showHelp 函数", () => {
    it("应该返回完整的帮助信息", () => {
      const helpText = showHelp();
      
      expect(helpText).toContain("分支命令:");
      expect(helpText).toContain("Tag 命令:");
      expect(helpText).toContain("发布命令:");
      expect(helpText).toContain("配置命令:");
      expect(helpText).toContain("更新命令:");
      expect(helpText).toContain("清理命令:");
      expect(helpText).toContain("Stash 命令:");
      expect(helpText).toContain("Commit 命令:");
      expect(helpText).toContain("示例:");
      expect(helpText).toContain("分支命名格式:");
    });

    it("应该包含所有主要命令", () => {
      const helpText = showHelp();
      
      // 分支命令
      expect(helpText).toContain("gw feature");
      expect(helpText).toContain("gw feat");
      expect(helpText).toContain("gw f");
      expect(helpText).toContain("gw hotfix");
      expect(helpText).toContain("gw fix");
      expect(helpText).toContain("gw h");
      expect(helpText).toContain("gw delete");
      expect(helpText).toContain("gw del");
      expect(helpText).toContain("gw d");
      
      // Tag 命令
      expect(helpText).toContain("gw tags");
      expect(helpText).toContain("gw ts");
      expect(helpText).toContain("gw tag");
      expect(helpText).toContain("gw t");
      expect(helpText).toContain("gw tag:delete");
      expect(helpText).toContain("gw td");
      expect(helpText).toContain("gw tag:update");
      expect(helpText).toContain("gw tu");
      
      // 其他命令
      expect(helpText).toContain("gw release");
      expect(helpText).toContain("gw r");
      expect(helpText).toContain("gw init");
      expect(helpText).toContain("gw update");
      expect(helpText).toContain("gw upt");
      expect(helpText).toContain("gw clean");
      expect(helpText).toContain("gw stash");
      expect(helpText).toContain("gw s");
      expect(helpText).toContain("gw st");
      expect(helpText).toContain("gw commit");
      expect(helpText).toContain("gw c");
      expect(helpText).toContain("gw cm");
    });

    it("应该包含命令描述", () => {
      const helpText = showHelp();
      
      expect(helpText).toContain("创建 feature 分支");
      expect(helpText).toContain("创建 hotfix 分支");
      expect(helpText).toContain("删除本地/远程分支");
      expect(helpText).toContain("列出所有 tag");
      expect(helpText).toContain("交互式选择版本类型并创建 tag");
      expect(helpText).toContain("删除 tag");
      expect(helpText).toContain("重命名 tag");
      expect(helpText).toContain("交互式选择版本号并更新 package.json");
      expect(helpText).toContain("初始化配置文件");
      expect(helpText).toContain("检查并更新到最新版本");
      expect(helpText).toContain("清理缓存文件");
      expect(helpText).toContain("交互式管理 stash");
      expect(helpText).toContain("交互式提交");
    });

    it("应该包含使用示例", () => {
      const helpText = showHelp();
      
      expect(helpText).toContain("gw f --base develop");
      expect(helpText).toContain("gw h --base release");
      expect(helpText).toContain("gw d feature/xxx");
      expect(helpText).toContain("gw ts v");
    });

    it("应该包含分支命名格式说明", () => {
      const helpText = showHelp();
      
      expect(helpText).toContain("feature/20260111-<Story ID>-<描述>");
      expect(helpText).toContain("hotfix/20260111-<Issue ID>-<描述>");
    });

    it("应该包含配置文件说明", () => {
      const helpText = showHelp();
      
      expect(helpText).toContain("全局配置: ~/.gwrc.json");
      expect(helpText).toContain("项目配置: .gwrc.json");
      expect(helpText).toContain("所有项目生效");
      expect(helpText).toContain("仅当前项目");
    });

    it("应该包含别名说明", () => {
      const helpText = showHelp();
      
      expect(helpText).toContain("同上 (别名)");
    });

    it("应该包含参数说明", () => {
      const helpText = showHelp();
      
      expect(helpText).toContain("[--base <branch>]");
      expect(helpText).toContain("[branch]");
      expect(helpText).toContain("[prefix]");
    });

    it("应该是非空字符串", () => {
      const helpText = showHelp();
      
      expect(typeof helpText).toBe("string");
      expect(helpText.length).toBeGreaterThan(0);
      expect(helpText.trim().length).toBeGreaterThan(0);
    });

    it("应该包含实际的日期格式", () => {
      const helpText = showHelp();
      
      // 检查是否包含实际的日期格式（YYYYMMDD）
      expect(helpText).toMatch(/feature\/\d{8}-<Story ID>-<描述>/);
      expect(helpText).toMatch(/hotfix\/\d{8}-<Issue ID>-<描述>/);
    });
  });
});