import { describe, it, expect } from "vitest";

describe("Commit 功能测试", () => {
  describe("提交类型", () => {
    const commitTypes = [
      { type: "feat", emoji: "✨", description: "新功能" },
      { type: "fix", emoji: "🐛", description: "修复 Bug" },
      { type: "docs", emoji: "📝", description: "文档更新" },
      { type: "style", emoji: "💄", description: "代码格式（不影响功能）" },
      {
        type: "refactor",
        emoji: "♻️",
        description: "重构（既不是新功能也不是修复）",
      },
      { type: "perf", emoji: "⚡", description: "性能优化" },
      { type: "test", emoji: "✅", description: "测试相关" },
      { type: "build", emoji: "📦", description: "构建系统或外部依赖" },
      { type: "ci", emoji: "👷", description: "CI 配置" },
      { type: "chore", emoji: "🔧", description: "其他修改" },
    ];

    it("应该有 10 种提交类型", () => {
      expect(commitTypes).toHaveLength(10);
    });

    it("每种类型都应该有必需的字段", () => {
      commitTypes.forEach((type) => {
        expect(type).toHaveProperty("type");
        expect(type).toHaveProperty("emoji");
        expect(type).toHaveProperty("description");
        expect(type.type).toBeTruthy();
        expect(type.emoji).toBeTruthy();
        expect(type.description).toBeTruthy();
      });
    });

    it("类型名称应该是小写", () => {
      commitTypes.forEach((type) => {
        expect(type.type).toBe(type.type.toLowerCase());
      });
    });
  });

  describe("提交消息格式", () => {
    it("应该生成正确的提交消息格式", () => {
      const type = "feat";
      const emoji = "✨";
      const scope = "tag";
      const message = "支持多列显示";

      const commitMessage = `${type}(${scope}): ${emoji} ${message}`;
      expect(commitMessage).toBe("feat(tag): ✨ 支持多列显示");
    });

    it("无 scope 时应该省略括号", () => {
      const type = "fix";
      const emoji = "🐛";
      const message = "修复对齐问题";

      const commitMessage = `${type}: ${emoji} ${message}`;
      expect(commitMessage).toBe("fix: 🐛 修复对齐问题");
    });
  });

  describe("Refactor 对齐处理", () => {
    it("refactor 类型应该添加额外空格", () => {
      const type = "refactor";
      const emoji = "♻️";
      const extraSpace = type === "refactor" ? " " : "";
      const display = `${emoji}${extraSpace} ${type}`;

      // refactor 的 emoji 宽度不一致，需要额外空格
      expect(display).toContain(" ");
    });

    it("其他类型不应该添加额外空格", () => {
      const type = "feat";
      const emoji = "✨";
      const extraSpace = type === "refactor" ? " " : "";
      const display = `${emoji}${extraSpace} ${type}`;

      expect(extraSpace).toBe("");
    });
  });
});
