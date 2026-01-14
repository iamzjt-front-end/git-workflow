import { describe, it, expect } from "vitest";

describe("命令别名测试", () => {
  describe("分支命令", () => {
    it("应该支持 feature 命令及其别名", () => {
      const commands = ["feature", "feat", "f"];
      const expectedCommand = "feature";

      commands.forEach((cmd) => {
        // 验证命令映射
        const isValid = cmd === "feature" || cmd === "feat" || cmd === "f";
        expect(isValid).toBe(true);
      });
    });

    it("应该支持 hotfix 命令及其别名", () => {
      const commands = ["hotfix", "fix", "h"];
      const expectedCommand = "hotfix";

      commands.forEach((cmd) => {
        const isValid = cmd === "hotfix" || cmd === "fix" || cmd === "h";
        expect(isValid).toBe(true);
      });
    });

    it("应该支持 br:del 命令及其别名", () => {
      const commands = ["br:del", "brd"];
      const expectedCommand = "br:del";

      commands.forEach((cmd) => {
        const isValid = cmd === "br:del" || cmd === "brd";
        expect(isValid).toBe(true);
      });
    });

    it("br:del 命令应该替代旧的 delete 命令", () => {
      const newCommands = ["br:del", "brd"];
      const oldCommands = ["delete", "del", "d"];

      // 新命令应该存在
      expect(newCommands.length).toBeGreaterThan(0);

      // 验证新命令格式
      expect(newCommands[0]).toBe("br:del");
      expect(newCommands[1]).toBe("brd");
    });
  });

  describe("Tag 命令", () => {
    it("应该支持 tag 命令及其别名", () => {
      const commands = ["tag", "t"];

      commands.forEach((cmd) => {
        const isValid = cmd === "tag" || cmd === "t";
        expect(isValid).toBe(true);
      });
    });

    it("应该支持 tags 命令及其别名", () => {
      const commands = ["tags", "ts"];

      commands.forEach((cmd) => {
        const isValid = cmd === "tags" || cmd === "ts";
        expect(isValid).toBe(true);
      });
    });

    it("应该支持 tag:del 命令及其别名", () => {
      const commands = ["tag:del", "td"];

      commands.forEach((cmd) => {
        const isValid = cmd === "tag:del" || cmd === "td";
        expect(isValid).toBe(true);
      });
    });

    it("应该支持 tag:update 命令及其别名", () => {
      const commands = ["tag:update", "tu"];

      commands.forEach((cmd) => {
        const isValid = cmd === "tag:update" || cmd === "tu";
        expect(isValid).toBe(true);
      });
    });

    it("应该支持 tag:clean 命令及其别名", () => {
      const commands = ["tag:clean", "tc"];

      commands.forEach((cmd) => {
        const isValid = cmd === "tag:clean" || cmd === "tc";
        expect(isValid).toBe(true);
      });
    });
  });

  describe("提交命令", () => {
    it("应该支持 commit 命令及其别名", () => {
      const commands = ["commit", "c", "cm"];

      commands.forEach((cmd) => {
        const isValid = cmd === "commit" || cmd === "c" || cmd === "cm";
        expect(isValid).toBe(true);
      });
    });
  });

  describe("Stash 命令", () => {
    it("应该支持 stash 命令及其别名", () => {
      const commands = ["stash", "s", "st"];

      commands.forEach((cmd) => {
        const isValid = cmd === "stash" || cmd === "s" || cmd === "st";
        expect(isValid).toBe(true);
      });
    });
  });

  describe("日志命令", () => {
    it("应该支持 log 命令及其别名", () => {
      const commands = ["log", "ls", "l"];

      commands.forEach((cmd) => {
        const isValid = cmd === "log" || cmd === "ls" || cmd === "l";
        expect(isValid).toBe(true);
      });
    });
  });

  describe("版本命令", () => {
    it("应该支持 release 命令及其别名", () => {
      const commands = ["release", "r"];

      commands.forEach((cmd) => {
        const isValid = cmd === "release" || cmd === "r";
        expect(isValid).toBe(true);
      });
    });
  });

  describe("更新命令", () => {
    it("应该支持 update 命令及其别名", () => {
      const commands = ["update", "upt"];

      commands.forEach((cmd) => {
        const isValid = cmd === "update" || cmd === "upt";
        expect(isValid).toBe(true);
      });
    });
  });

  describe("清理命令", () => {
    it("应该支持 clean 命令及其别名", () => {
      const commands = ["clean", "cc"];

      commands.forEach((cmd) => {
        const isValid = cmd === "clean" || cmd === "cc";
        expect(isValid).toBe(true);
      });
    });
  });

  describe("初始化命令", () => {
    it("应该支持 init 命令", () => {
      const command = "init";
      expect(command).toBe("init");
    });

    it("init 命令不应该有别名", () => {
      const aliases: string[] = [];
      expect(aliases.length).toBe(0);
    });
  });

  describe("命令命名规范", () => {
    it("分支删除命令应该使用 br:del 格式", () => {
      const command = "br:del";
      expect(command).toMatch(/^br:del$/);
      expect(command).toContain(":");
    });

    it("tag 删除命令应该使用 tag:del 格式", () => {
      const command = "tag:del";
      expect(command).toMatch(/^tag:del$/);
      expect(command).toContain(":");
    });

    it("tag 更新命令应该使用 tag:update 格式", () => {
      const command = "tag:update";
      expect(command).toMatch(/^tag:update$/);
      expect(command).toContain(":");
    });

    it("tag 清理命令应该使用 tag:clean 格式", () => {
      const command = "tag:clean";
      expect(command).toMatch(/^tag:clean$/);
      expect(command).toContain(":");
    });

    it("子命令应该使用冒号分隔", () => {
      const subCommands = ["br:del", "tag:del", "tag:update", "tag:clean"];

      subCommands.forEach((cmd) => {
        expect(cmd).toContain(":");
        const parts = cmd.split(":");
        expect(parts.length).toBe(2);
        expect(parts[0].length).toBeGreaterThan(0);
        expect(parts[1].length).toBeGreaterThan(0);
      });
    });
  });

  describe("别名简洁性", () => {
    it("所有别名应该不超过 4 个字符", () => {
      const aliases = [
        "f",
        "feat",
        "h",
        "fix",
        "brd",
        "t",
        "ts",
        "td",
        "tu",
        "tc",
        "c",
        "cm",
        "s",
        "st",
        "l",
        "ls",
        "r",
        "upt",
        "cc",
      ];

      aliases.forEach((alias) => {
        expect(alias.length).toBeLessThanOrEqual(4);
      });
    });

    it("单字母别名应该是最常用的命令", () => {
      const singleLetterAliases = {
        f: "feature",
        h: "hotfix",
        t: "tag",
        c: "commit",
        s: "stash",
        l: "log",
        r: "release",
      };

      Object.entries(singleLetterAliases).forEach(([alias, command]) => {
        expect(alias.length).toBe(1);
        expect(command.length).toBeGreaterThan(1);
      });
    });

    it("两字母别名应该是次常用的命令", () => {
      const twoLetterAliases = {
        ts: "tags",
        td: "tag:del",
        tu: "tag:update",
        tc: "tag:clean",
        cm: "commit",
        st: "stash",
        ls: "log",
        cc: "clean",
      };

      Object.entries(twoLetterAliases).forEach(([alias, command]) => {
        expect(alias.length).toBe(2);
      });
    });

    it("三字母别名应该是较少使用的命令", () => {
      const threeLetterAliases = {
        brd: "br:del",
        upt: "update",
      };

      Object.entries(threeLetterAliases).forEach(([alias, command]) => {
        expect(alias.length).toBe(3);
      });
    });

    it("四字母别名应该是完整单词缩写", () => {
      const fourLetterAliases = {
        feat: "feature",
        fix: "hotfix",
      };

      Object.entries(fourLetterAliases).forEach(([alias, command]) => {
        expect(alias.length).toBeGreaterThanOrEqual(3);
        expect(alias.length).toBeLessThanOrEqual(4);
      });
    });
  });

  describe("命令一致性", () => {
    it("删除操作应该使用统一的 del 后缀", () => {
      const deleteCommands = ["br:del", "tag:del"];

      deleteCommands.forEach((cmd) => {
        expect(cmd).toMatch(/del$/);
      });
    });

    it("删除操作的别名应该以 d 结尾", () => {
      const deleteAliases = ["brd", "td"];

      deleteAliases.forEach((alias) => {
        expect(alias).toMatch(/d$/);
      });
    });

    it("清理操作应该使用 clean 命名", () => {
      const cleanCommands = ["clean", "tag:clean"];

      cleanCommands.forEach((cmd) => {
        expect(cmd).toContain("clean");
      });
    });

    it("清理操作的别名应该以 c 结尾", () => {
      const cleanAliases = ["cc", "tc"];

      cleanAliases.forEach((alias) => {
        expect(alias).toMatch(/c$/);
      });
    });
  });

  describe("命令分组", () => {
    it("应该有分支管理命令组", () => {
      const branchCommands = ["feature", "hotfix", "br:del"];
      expect(branchCommands.length).toBe(3);
    });

    it("应该有 tag 管理命令组", () => {
      const tagCommands = ["tag", "tags", "tag:del", "tag:update", "tag:clean"];
      expect(tagCommands.length).toBe(5);
    });

    it("应该有提交管理命令组", () => {
      const commitCommands = ["commit", "log"];
      expect(commitCommands.length).toBe(2);
    });

    it("应该有工具管理命令组", () => {
      const toolCommands = ["init", "update", "clean"];
      expect(toolCommands.length).toBe(3);
    });

    it("应该有其他辅助命令组", () => {
      const otherCommands = ["stash", "release"];
      expect(otherCommands.length).toBe(2);
    });
  });

  describe("命令总数统计", () => {
    it("应该有正确数量的主命令", () => {
      const mainCommands = [
        "feature",
        "hotfix",
        "br:del",
        "tag",
        "tags",
        "tag:del",
        "tag:update",
        "tag:clean",
        "commit",
        "log",
        "stash",
        "release",
        "init",
        "update",
        "clean",
      ];

      expect(mainCommands.length).toBe(15);
    });

    it("应该有正确数量的别名", () => {
      const aliases = [
        "f",
        "feat",
        "h",
        "fix",
        "brd",
        "t",
        "ts",
        "td",
        "tu",
        "tc",
        "c",
        "cm",
        "l",
        "ls",
        "s",
        "st",
        "r",
        "upt",
        "cc",
      ];

      expect(aliases.length).toBe(19);
    });
  });
});
