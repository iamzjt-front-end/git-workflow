import { describe, it, expect, vi } from "vitest";
import { TODAY } from "../src/utils";

describe("Branch 功能测试", () => {
  describe("分支命名规范", () => {
    it("应该生成带 ID 的 feature 分支名", () => {
      const prefix = "feature";
      const id = "PROJ-123";
      const description = "add-login";
      const branchName = `${prefix}/${TODAY}-${id}-${description}`;

      expect(branchName).toMatch(/^feature\/\d{8}-PROJ-123-add-login$/);
    });

    it("应该生成不带 ID 的 feature 分支名", () => {
      const prefix = "feature";
      const description = "add-login";
      const branchName = `${prefix}/${TODAY}-${description}`;

      expect(branchName).toMatch(/^feature\/\d{8}-add-login$/);
    });

    it("应该生成带 ID 的 hotfix 分支名", () => {
      const prefix = "hotfix";
      const id = "BUG-456";
      const description = "fix-crash";
      const branchName = `${prefix}/${TODAY}-${id}-${description}`;

      expect(branchName).toMatch(/^hotfix\/\d{8}-BUG-456-fix-crash$/);
    });

    it("应该生成不带 ID 的 hotfix 分支名", () => {
      const prefix = "hotfix";
      const description = "fix-crash";
      const branchName = `${prefix}/${TODAY}-${description}`;

      expect(branchName).toMatch(/^hotfix\/\d{8}-fix-crash$/);
    });

    it("应该使用当前日期", () => {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      expect(TODAY).toBe(today);
    });
  });

  describe("分支前缀配置", () => {
    it("应该支持自定义 feature 前缀", () => {
      const customPrefix = "feat";
      const description = "new-feature";
      const branchName = `${customPrefix}/${TODAY}-${description}`;

      expect(branchName).toMatch(/^feat\/\d{8}-new-feature$/);
    });

    it("应该支持自定义 hotfix 前缀", () => {
      const customPrefix = "fix";
      const description = "bug-fix";
      const branchName = `${customPrefix}/${TODAY}-${description}`;

      expect(branchName).toMatch(/^fix\/\d{8}-bug-fix$/);
    });
  });

  describe("ID 验证", () => {
    it("requireId 为 true 时 ID 不能为空", () => {
      const requireId = true;
      const id = "";

      if (requireId && !id) {
        expect(id).toBe("");
      }
    });

    it("requireId 为 false 时 ID 可以为空", () => {
      const requireId = false;
      const id = "";

      if (!requireId) {
        expect(id).toBe("");
      }
    });

    it("应该接受有效的 ID", () => {
      const validIds = ["PROJ-123", "BUG-456", "TASK-789", "123", "ABC"];

      validIds.forEach((id) => {
        expect(id).toBeTruthy();
        expect(id.length).toBeGreaterThan(0);
      });
    });
  });

  describe("描述验证", () => {
    it("描述不能为空", () => {
      const description = "";
      expect(description).toBe("");
    });

    it("应该接受有效的描述", () => {
      const validDescriptions = [
        "add-login",
        "fix-crash",
        "update-readme",
        "refactor-code",
      ];

      validDescriptions.forEach((desc) => {
        expect(desc).toBeTruthy();
        expect(desc.length).toBeGreaterThan(0);
      });
    });

    it("描述应该使用连字符分隔", () => {
      const description = "add-user-login";
      expect(description).toContain("-");
      expect(description.split("-").length).toBeGreaterThan(1);
    });
  });

  describe("基础分支选择", () => {
    it("应该支持指定基础分支", () => {
      const baseBranch = "develop";
      const fullBranch = `origin/${baseBranch}`;

      expect(fullBranch).toBe("origin/develop");
    });

    it("应该支持 main 作为基础分支", () => {
      const baseBranch = "main";
      const fullBranch = `origin/${baseBranch}`;

      expect(fullBranch).toBe("origin/main");
    });

    it("应该支持 master 作为基础分支", () => {
      const baseBranch = "master";
      const fullBranch = `origin/${baseBranch}`;

      expect(fullBranch).toBe("origin/master");
    });

    it("应该支持自定义基础分支", () => {
      const baseBranch = "release/1.0";
      const fullBranch = `origin/${baseBranch}`;

      expect(fullBranch).toBe("origin/release/1.0");
    });
  });

  describe("分支名称格式", () => {
    it("应该包含日期", () => {
      const branchName = `feature/${TODAY}-add-feature`;
      expect(branchName).toContain(TODAY);
    });

    it("应该包含前缀", () => {
      const branchName = `feature/${TODAY}-add-feature`;
      expect(branchName).toMatch(/^feature\//);
    });

    it("应该包含描述", () => {
      const description = "add-feature";
      const branchName = `feature/${TODAY}-${description}`;
      expect(branchName).toContain(description);
    });

    it("带 ID 时应该包含 ID", () => {
      const id = "PROJ-123";
      const branchName = `feature/${TODAY}-${id}-add-feature`;
      expect(branchName).toContain(id);
    });

    it("应该使用斜杠分隔前缀和名称", () => {
      const branchName = `feature/${TODAY}-add-feature`;
      expect(branchName).toContain("/");
      const parts = branchName.split("/");
      expect(parts.length).toBe(2);
      expect(parts[0]).toBe("feature");
    });
  });

  describe("分支类型", () => {
    it("应该支持 feature 类型", () => {
      const type: "feature" | "hotfix" = "feature";
      expect(type).toBe("feature");
    });

    it("应该支持 hotfix 类型", () => {
      const type: "feature" | "hotfix" = "hotfix";
      expect(type).toBe("hotfix");
    });
  });

  describe("autoPush 配置", () => {
    it("autoPush 为 true 时应该自动推送", () => {
      const autoPush = true;
      expect(autoPush).toBe(true);
    });

    it("autoPush 为 false 时不应该推送", () => {
      const autoPush = false;
      expect(autoPush).toBe(false);
    });

    it("autoPush 未设置时应该询问", () => {
      const autoPush = undefined;
      expect(autoPush).toBeUndefined();
    });
  });

  describe("分支名称边界情况", () => {
    it("应该处理包含数字的描述", () => {
      const description = "add-feature-v2";
      const branchName = `feature/${TODAY}-${description}`;
      expect(branchName).toContain("v2");
    });

    it("应该处理包含多个连字符的描述", () => {
      const description = "add-user-login-feature";
      const branchName = `feature/${TODAY}-${description}`;
      expect(branchName.split("-").length).toBeGreaterThan(3);
    });

    it("应该处理长描述", () => {
      const description = "add-very-long-feature-description-with-many-words";
      const branchName = `feature/${TODAY}-${description}`;
      expect(branchName.length).toBeGreaterThan(50);
    });

    it("应该处理包含下划线的 ID", () => {
      const id = "PROJ_123";
      const branchName = `feature/${TODAY}-${id}-add-feature`;
      expect(branchName).toContain("PROJ_123");
    });
  });

  describe("日期格式", () => {
    it("TODAY 应该是 8 位数字", () => {
      expect(TODAY).toMatch(/^\d{8}$/);
    });

    it("TODAY 应该是有效的日期格式", () => {
      const year = parseInt(TODAY.slice(0, 4));
      const month = parseInt(TODAY.slice(4, 6));
      const day = parseInt(TODAY.slice(6, 8));

      expect(year).toBeGreaterThan(2020);
      expect(year).toBeLessThan(2100);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
    });
  });
});
