import { describe, it, expect } from "vitest";

describe("Tag 功能测试", () => {
  describe("前缀提取", () => {
    it("应该正确提取 v 前缀", () => {
      const tag = "v0.1.0";
      const prefix = tag.replace(/[0-9].*/, "");
      expect(prefix).toBe("v");
    });

    it("应该正确提取 release- 前缀", () => {
      const tag = "release-1.0.0";
      const prefix = tag.replace(/[0-9].*/, "");
      expect(prefix).toBe("release-");
    });

    it("应该正确提取 @ 开头的 scope 前缀", () => {
      const tag = "@scope/package@1.0.0";
      const prefix = tag.replace(/[0-9].*/, "");
      expect(prefix).toBe("@scope/package@");
    });

    it("应该正确处理无前缀 tag", () => {
      const tag = "1.0.0";
      const prefix = tag.replace(/[0-9].*/, "") || "(无前缀)";
      expect(prefix).toBe("(无前缀)");
    });

    it("应该正确提取 g 前缀", () => {
      const tag = "g0.1.0";
      const prefix = tag.replace(/[0-9].*/, "");
      expect(prefix).toBe("g");
    });

    it("应该正确提取带下划线的前缀", () => {
      const tag = "version_1.0.0";
      const prefix = tag.replace(/[0-9].*/, "");
      expect(prefix).toBe("version_");
    });

    it("应该正确提取带点的前缀", () => {
      const tag = "v.1.0.0";
      const prefix = tag.replace(/[0-9].*/, "");
      expect(prefix).toBe("v.");
    });
  });

  describe("Tag 分组", () => {
    it("应该正确按前缀分组", () => {
      const tags = ["v0.1.0", "v0.2.0", "g0.1.0", "1.0.0"];
      const grouped = new Map<string, string[]>();

      tags.forEach((tag) => {
        const prefix = tag.replace(/[0-9].*/, "") || "(无前缀)";
        if (!grouped.has(prefix)) {
          grouped.set(prefix, []);
        }
        grouped.get(prefix)!.push(tag);
      });

      expect(grouped.size).toBe(3);
      expect(grouped.get("v")).toEqual(["v0.1.0", "v0.2.0"]);
      expect(grouped.get("g")).toEqual(["g0.1.0"]);
      expect(grouped.get("(无前缀)")).toEqual(["1.0.0"]);
    });

    it("应该处理多个不同前缀", () => {
      const tags = [
        "v1.0.0",
        "release-1.0.0",
        "hotfix-1.0.0",
        "1.0.0",
        "v2.0.0",
      ];
      const grouped = new Map<string, string[]>();

      tags.forEach((tag) => {
        const prefix = tag.replace(/[0-9].*/, "") || "(无前缀)";
        if (!grouped.has(prefix)) {
          grouped.set(prefix, []);
        }
        grouped.get(prefix)!.push(tag);
      });

      expect(grouped.size).toBe(4);
      expect(grouped.get("v")?.length).toBe(2);
      expect(grouped.get("release-")?.length).toBe(1);
      expect(grouped.get("hotfix-")?.length).toBe(1);
      expect(grouped.get("(无前缀)")?.length).toBe(1);
    });

    it("应该保持 tag 的原始顺序", () => {
      const tags = ["v0.1.0", "v0.3.0", "v0.2.0"];
      const grouped = new Map<string, string[]>();

      tags.forEach((tag) => {
        const prefix = tag.replace(/[0-9].*/, "") || "(无前缀)";
        if (!grouped.has(prefix)) {
          grouped.set(prefix, []);
        }
        grouped.get(prefix)!.push(tag);
      });

      expect(grouped.get("v")).toEqual(["v0.1.0", "v0.3.0", "v0.2.0"]);
    });
  });

  describe("Tag 显示逻辑", () => {
    it("应该只显示最后 5 个 tag", () => {
      const tags = [
        "v0.1.0",
        "v0.2.0",
        "v0.3.0",
        "v0.4.0",
        "v0.5.0",
        "v0.6.0",
        "v0.7.0",
      ];
      const displayTags = tags.slice(-5);

      expect(displayTags).toEqual([
        "v0.3.0",
        "v0.4.0",
        "v0.5.0",
        "v0.6.0",
        "v0.7.0",
      ]);
      expect(displayTags.length).toBe(5);
    });

    it("少于 5 个 tag 时应该显示全部", () => {
      const tags = ["v0.1.0", "v0.2.0", "v0.3.0"];
      const displayTags = tags.length > 5 ? tags.slice(-5) : tags;

      expect(displayTags).toEqual(tags);
      expect(displayTags.length).toBe(3);
    });

    it("正好 5 个 tag 时应该显示全部", () => {
      const tags = ["v0.1.0", "v0.2.0", "v0.3.0", "v0.4.0", "v0.5.0"];
      const displayTags = tags.length > 5 ? tags.slice(-5) : tags;

      expect(displayTags).toEqual(tags);
      expect(displayTags.length).toBe(5);
    });

    it("应该标记是否有更多 tag", () => {
      const tags = ["v0.1.0", "v0.2.0", "v0.3.0", "v0.4.0", "v0.5.0", "v0.6.0"];
      const hasMore = tags.length > 5;

      expect(hasMore).toBe(true);
    });

    it("少于 5 个 tag 时不应该有省略号", () => {
      const tags = ["v0.1.0", "v0.2.0", "v0.3.0"];
      const hasMore = tags.length > 5;

      expect(hasMore).toBe(false);
    });

    it("空数组应该返回空", () => {
      const tags: string[] = [];
      const displayTags = tags.length > 5 ? tags.slice(-5) : tags;

      expect(displayTags).toEqual([]);
      expect(displayTags.length).toBe(0);
    });
  });

  describe("列宽计算", () => {
    it("应该计算正确的列宽", () => {
      const tags = ["v0.1.0", "v0.2.0", "release-1.0.0"];
      const maxLength = Math.max(...tags.map((t) => t.length));
      const columnWidth = Math.max(maxLength + 4, 20);

      expect(maxLength).toBe(13); // "release-1.0.0" 的长度
      expect(columnWidth).toBe(20); // 至少 20
    });

    it("超长 tag 应该增加列宽", () => {
      const tags = ["very-long-tag-name-1.0.0"];
      const maxLength = Math.max(...tags.map((t) => t.length));
      const columnWidth = Math.max(maxLength + 4, 20);

      expect(columnWidth).toBeGreaterThan(20);
      expect(columnWidth).toBe(maxLength + 4);
    });

    it("短 tag 应该使用最小列宽", () => {
      const tags = ["v1", "v2"];
      const maxLength = Math.max(...tags.map((t) => t.length));
      const columnWidth = Math.max(maxLength + 4, 20);

      expect(columnWidth).toBe(20);
    });

    it("应该处理多列的最大宽度", () => {
      const columns = [
        { tags: ["v0.1.0", "v0.2.0"] },
        { tags: ["release-1.0.0", "release-2.0.0"] },
        { tags: ["1.0.0"] },
      ];

      const maxLength = Math.max(
        ...columns.flatMap((col) => col.tags.map((t) => t.length))
      );

      expect(maxLength).toBe(13);
    });
  });

  describe("版本号解析", () => {
    it("应该解析标准 semver 版本", () => {
      const version = "1.2.3";
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

      expect(match).toBeTruthy();
      expect(match![1]).toBe("1");
      expect(match![2]).toBe("2");
      expect(match![3]).toBe("3");
    });

    it("应该解析预发布版本", () => {
      const version = "1.2.3-beta.1";
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)-([a-zA-Z]+)\.(\d+)$/);

      expect(match).toBeTruthy();
      expect(match![1]).toBe("1");
      expect(match![2]).toBe("2");
      expect(match![3]).toBe("3");
      expect(match![4]).toBe("beta");
      expect(match![5]).toBe("1");
    });

    it("应该解析两位版本号", () => {
      const version = "1.2";
      const match = version.match(/^(\d+)\.(\d+)$/);

      expect(match).toBeTruthy();
      expect(match![1]).toBe("1");
      expect(match![2]).toBe("2");
    });

    it("应该解析单位版本号", () => {
      const version = "1";
      const match = version.match(/^(\d+)$/);

      expect(match).toBeTruthy();
      expect(match![1]).toBe("1");
    });

    it("不应该匹配无效版本号", () => {
      const version = "abc";
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

      expect(match).toBeNull();
    });
  });

  describe("版本号递增", () => {
    it("应该正确递增 patch 版本", () => {
      const version = "1.2.3";
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
      const [, major, minor, patch] = match!;
      const newVersion = `${major}.${minor}.${Number(patch) + 1}`;

      expect(newVersion).toBe("1.2.4");
    });

    it("应该正确递增 minor 版本", () => {
      const version = "1.2.3";
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
      const [, major, minor] = match!;
      const newVersion = `${major}.${Number(minor) + 1}.0`;

      expect(newVersion).toBe("1.3.0");
    });

    it("应该正确递增 major 版本", () => {
      const version = "1.2.3";
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
      const [, major] = match!;
      const newVersion = `${Number(major) + 1}.0.0`;

      expect(newVersion).toBe("2.0.0");
    });

    it("应该正确递增预发布版本号", () => {
      const version = "1.2.3-beta.1";
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)-([a-zA-Z]+)\.(\d+)$/);
      const [, major, minor, patch, preTag, preNum] = match!;
      const newVersion = `${major}.${minor}.${patch}-${preTag}.${
        Number(preNum) + 1
      }`;

      expect(newVersion).toBe("1.2.3-beta.2");
    });

    it("应该从预发布版本转为正式版本", () => {
      const version = "1.2.3-beta.1";
      const match = version.match(/^(\d+)\.(\d+)\.(\d+)-([a-zA-Z]+)\.(\d+)$/);
      const [, major, minor, patch] = match!;
      const newVersion = `${major}.${minor}.${patch}`;

      expect(newVersion).toBe("1.2.3");
    });
  });

  describe("Tag 排序", () => {
    it("应该按版本号升序排序", () => {
      const tags = ["v0.2.0", "v0.1.0", "v0.3.0"];
      // 模拟 git tag -l --sort=v:refname 的行为
      const sorted = [...tags].sort((a, b) => {
        const aVer = a.replace("v", "");
        const bVer = b.replace("v", "");
        return aVer.localeCompare(bVer, undefined, { numeric: true });
      });

      expect(sorted).toEqual(["v0.1.0", "v0.2.0", "v0.3.0"]);
    });

    it("应该正确排序多位版本号", () => {
      const tags = ["v0.10.0", "v0.2.0", "v0.9.0"];
      const sorted = [...tags].sort((a, b) => {
        const aVer = a.replace("v", "");
        const bVer = b.replace("v", "");
        return aVer.localeCompare(bVer, undefined, { numeric: true });
      });

      expect(sorted).toEqual(["v0.2.0", "v0.9.0", "v0.10.0"]);
    });
  });

  describe("多列显示", () => {
    it("应该计算正确的行数", () => {
      const columns = [
        { tags: ["v0.1.0", "v0.2.0", "v0.3.0"] },
        { tags: ["g0.1.0", "g0.2.0"] },
        { tags: ["1.0.0"] },
      ];

      const maxRows = Math.max(...columns.map((col) => col.tags.length));

      expect(maxRows).toBe(3);
    });

    it("应该正确填充空单元格", () => {
      const columns = [
        { tags: ["v0.1.0", "v0.2.0", "v0.3.0"] },
        { tags: ["g0.1.0"] },
      ];

      const maxRows = Math.max(...columns.map((col) => col.tags.length));
      const rows: string[][] = [];

      for (let i = 0; i < maxRows; i++) {
        const row = columns.map((col) => col.tags[i] || "");
        rows.push(row);
      }

      expect(rows).toEqual([
        ["v0.1.0", "g0.1.0"],
        ["v0.2.0", ""],
        ["v0.3.0", ""],
      ]);
    });
  });

  describe("表头格式化", () => {
    it("应该格式化表头显示总数", () => {
      const prefix = "v";
      const total = 10;
      const header = `${prefix} (${total})`;

      expect(header).toBe("v (10)");
    });

    it("应该格式化无前缀的表头", () => {
      const prefix = "(无前缀)";
      const total = 3;
      const header = `${prefix} (${total})`;

      expect(header).toBe("(无前缀) (3)");
    });

    it("应该对齐表头", () => {
      const headers = ["v (10)", "release- (5)", "(无前缀) (3)"];
      const columnWidth = 20;
      const paddedHeaders = headers.map((h) => h.padEnd(columnWidth));

      paddedHeaders.forEach((h) => {
        expect(h.length).toBe(columnWidth);
      });
    });
  });

  describe("无效标签检测", () => {
    it("应该识别不包含数字的标签为无效", () => {
      const tag = "vnull";
      const isInvalid = !/\d/.test(tag);

      expect(isInvalid).toBe(true);
    });

    it("应该识别 vundefined 为无效标签", () => {
      const tag = "vundefined";
      const isInvalid = !/\d/.test(tag);

      expect(isInvalid).toBe(true);
    });

    it("应该识别空版本号为无效标签", () => {
      const tag = "v";
      const isInvalid = !/\d/.test(tag);

      expect(isInvalid).toBe(true);
    });

    it("应该识别纯字母标签为无效", () => {
      const tag = "release";
      const isInvalid = !/\d/.test(tag);

      expect(isInvalid).toBe(true);
    });

    it("应该识别包含数字的标签为有效", () => {
      const tag = "v1.0.0";
      const isValid = /\d/.test(tag);

      expect(isValid).toBe(true);
    });

    it("应该识别预发布版本为有效", () => {
      const tag = "v1.0.0-beta.1";
      const isValid = /\d/.test(tag);

      expect(isValid).toBe(true);
    });

    it("应该识别无前缀版本号为有效", () => {
      const tag = "1.0.0";
      const isValid = /\d/.test(tag);

      expect(isValid).toBe(true);
    });

    it("应该识别带前缀的单数字版本为有效", () => {
      const tag = "v1";
      const isValid = /\d/.test(tag);

      expect(isValid).toBe(true);
    });
  });

  describe("无效标签过滤", () => {
    it("应该从标签列表中过滤出所有无效标签", () => {
      const allTags = [
        "v1.0.0",
        "vnull",
        "v1.1.0",
        "vundefined",
        "release-1.0.0",
        "v",
        "v2.0.0",
      ];
      const invalidTags = allTags.filter((tag) => !/\d/.test(tag));

      expect(invalidTags).toEqual(["vnull", "vundefined", "v"]);
      expect(invalidTags.length).toBe(3);
    });

    it("应该在没有无效标签时返回空数组", () => {
      const allTags = ["v1.0.0", "v1.1.0", "v2.0.0", "release-1.0.0"];
      const invalidTags = allTags.filter((tag) => !/\d/.test(tag));

      expect(invalidTags).toEqual([]);
      expect(invalidTags.length).toBe(0);
    });

    it("应该在全是无效标签时返回所有标签", () => {
      const allTags = ["vnull", "vundefined", "v", "release"];
      const invalidTags = allTags.filter((tag) => !/\d/.test(tag));

      expect(invalidTags).toEqual(allTags);
      expect(invalidTags.length).toBe(4);
    });

    it("应该保留有效标签", () => {
      const allTags = [
        "v1.0.0",
        "vnull",
        "v1.1.0",
        "vundefined",
        "v2.0.0-beta.1",
      ];
      const validTags = allTags.filter((tag) => /\d/.test(tag));

      expect(validTags).toEqual(["v1.0.0", "v1.1.0", "v2.0.0-beta.1"]);
      expect(validTags.length).toBe(3);
    });

    it("应该处理空标签列表", () => {
      const allTags: string[] = [];
      const invalidTags = allTags.filter((tag) => !/\d/.test(tag));

      expect(invalidTags).toEqual([]);
      expect(invalidTags.length).toBe(0);
    });

    it("应该处理混合前缀的无效标签", () => {
      const allTags = [
        "v1.0.0",
        "vnull",
        "release-",
        "hotfix",
        "g1.0.0",
        "tag",
      ];
      const invalidTags = allTags.filter((tag) => !/\d/.test(tag));

      expect(invalidTags).toEqual(["vnull", "release-", "hotfix", "tag"]);
      expect(invalidTags.length).toBe(4);
    });
  });

  describe("标签计数统计", () => {
    it("应该正确统计无效标签数量", () => {
      const allTags = ["v1.0.0", "vnull", "vundefined", "v2.0.0"];
      const invalidTags = allTags.filter((tag) => !/\d/.test(tag));
      const count = invalidTags.length;

      expect(count).toBe(2);
    });

    it("应该正确统计删除成功和失败的数量", () => {
      const invalidTags = ["vnull", "vundefined", "v"];
      let success = 0;
      let failed = 0;

      // 模拟删除操作
      invalidTags.forEach((tag) => {
        // 模拟成功删除前两个，失败最后一个
        if (tag !== "v") {
          success++;
        } else {
          failed++;
        }
      });

      expect(success).toBe(2);
      expect(failed).toBe(1);
    });

    it("应该处理全部删除成功的情况", () => {
      const invalidTags = ["vnull", "vundefined"];
      let success = 0;
      let failed = 0;

      invalidTags.forEach(() => {
        success++;
      });

      expect(success).toBe(2);
      expect(failed).toBe(0);
    });

    it("应该处理全部删除失败的情况", () => {
      const invalidTags = ["vnull", "vundefined"];
      let success = 0;
      let failed = 0;

      invalidTags.forEach(() => {
        failed++;
      });

      expect(success).toBe(0);
      expect(failed).toBe(2);
    });
  });

  describe("标签信息格式化", () => {
    it("应该格式化标签详细信息", () => {
      const tag = "vnull";
      const commitHash = "abc1234";
      const commitDate = "2026-01-14 10:00:00 +0800";
      const commitMsg = "Release vnull";

      const info = {
        tag,
        commit: commitHash,
        date: commitDate,
        message: commitMsg,
      };

      expect(info.tag).toBe("vnull");
      expect(info.commit).toBe("abc1234");
      expect(info.date).toBe("2026-01-14 10:00:00 +0800");
      expect(info.message).toBe("Release vnull");
    });

    it("应该处理无法获取提交信息的情况", () => {
      const tag = "vnull";
      const info = {
        tag,
        commit: null,
        date: null,
        message: null,
      };

      expect(info.tag).toBe("vnull");
      expect(info.commit).toBeNull();
      expect(info.date).toBeNull();
      expect(info.message).toBeNull();
    });

    it("应该格式化多个标签的信息列表", () => {
      const invalidTags = ["vnull", "vundefined"];
      const tagInfos = invalidTags.map((tag) => ({
        tag,
        commit: `${tag}-hash`,
        date: "2026-01-14",
        message: `Release ${tag}`,
      }));

      expect(tagInfos.length).toBe(2);
      expect(tagInfos[0].tag).toBe("vnull");
      expect(tagInfos[0].commit).toBe("vnull-hash");
      expect(tagInfos[1].tag).toBe("vundefined");
      expect(tagInfos[1].commit).toBe("vundefined-hash");
    });
  });
});
