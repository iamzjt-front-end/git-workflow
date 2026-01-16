# 测试指南

本指南介绍 git-workflow 的测试策略、框架使用和最佳实践。

## 测试框架

我们使用 [Vitest](https://vitest.dev/) 作为测试框架，它提供：

- ⚡️ 快速的测试执行
- 🔄 Watch 模式支持
- 📊 内置代码覆盖率
- 🎯 与 Jest 兼容的 API
- 🔧 TypeScript 原生支持

## 运行测试

### 基本命令

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- tests/commit.test.ts

# Watch 模式（开发时使用）
npm run test:watch

# 查看测试覆盖率
npm run test:coverage
```

### 测试输出

```bash
✓ tests/commit.test.ts (18 tests) 9ms
✓ tests/branch.test.ts (45 tests) 7ms
✓ tests/tag.test.ts (58 tests) 14ms
...

Test Files  15 passed (15)
     Tests  375 passed (375)
  Start at  17:34:11
  Duration  426ms
```

## 测试覆盖率

当前测试覆盖率：**375 个测试用例**

查看详细覆盖率报告：

```bash
npm run test:coverage
```

覆盖率报告会生成在 `coverage/` 目录，可以在浏览器中打开 `coverage/index.html` 查看。

## 测试结构

### 测试文件组织

```
tests/
├── ai-service.test.ts      # AI 服务测试
├── branch.test.ts          # 分支管理测试
├── commit.test.ts          # 提交管理测试
├── tag.test.ts             # 标签管理测试
├── stash.test.ts           # Stash 管理测试
├── release.test.ts         # 发布管理测试
├── log.test.ts             # 日志查看测试
├── update.test.ts          # 更新检查测试
├── config.test.ts          # 配置管理测试
├── utils.test.ts           # 工具函数测试
├── commands.test.ts        # 命令别名测试
├── clean.test.ts           # 清理命令测试
├── commit-format.test.ts   # 提交格式测试
├── init.test.ts            # 初始化测试
├── update-notifier.test.ts # 更新通知测试
└── setup.ts                # 测试配置
```

### 测试文件命名

- 测试文件以 `.test.ts` 结尾
- 文件名与被测试的源文件对应
- 例如：`src/config.ts` → `tests/config.test.ts`

## 编写测试

### 基本测试结构

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("功能模块名称", () => {
  beforeEach(() => {
    // 每个测试前的准备工作
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 每个测试后的清理工作
    vi.restoreAllMocks();
  });

  describe("子功能", () => {
    it("应该正确处理某个场景", () => {
      // Arrange: 准备测试数据
      const input = "test";

      // Act: 执行被测试的功能
      const result = someFunction(input);

      // Assert: 验证结果
      expect(result).toBe("expected");
    });
  });
});
```

### Mock 外部依赖

#### Mock Node.js 模块

```typescript
vi.mock("child_process", () => ({
  execSync: vi.fn(),
  spawn: vi.fn(),
}));

// 使用 mock
import { execSync } from "child_process";
const mockExecSync = vi.mocked(execSync);
mockExecSync.mockReturnValue("output");
```

#### Mock 第三方库

```typescript
vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
  input: vi.fn(),
  confirm: vi.fn(),
}));

// 使用 mock
import { select } from "@inquirer/prompts";
vi.mocked(select).mockResolvedValue("option1");
```

#### Mock 工具函数

```typescript
vi.mock("../src/utils.js", () => ({
  colors: {
    yellow: (text: string) => text,
    green: (text: string) => text,
    red: (text: string) => text,
  },
  execOutput: vi.fn(),
}));
```

### 测试异步函数

```typescript
it("应该正确处理异步操作", async () => {
  const result = await asyncFunction();
  expect(result).toBe("expected");
});
```

### 测试错误处理

```typescript
it("应该抛出错误", () => {
  expect(() => {
    functionThatThrows();
  }).toThrow("Error message");
});

it("应该处理异步错误", async () => {
  await expect(asyncFunctionThatThrows()).rejects.toThrow("Error message");
});
```

### 测试用户交互

```typescript
it("应该正确处理用户选择", async () => {
  const { select } = await import("@inquirer/prompts");
  vi.mocked(select).mockResolvedValue("option1");

  await interactiveFunction();

  expect(select).toHaveBeenCalledWith(
    expect.objectContaining({
      message: "选择选项:",
      choices: expect.arrayContaining([
        expect.objectContaining({ value: "option1" }),
      ]),
    })
  );
});
```

## 测试最佳实践

### 1. 测试命名

使用清晰的描述性名称：

```typescript
// ✅ 好的命名
it("应该在没有配置文件时返回默认配置", () => {});
it("应该正确解析带有 Story ID 的分支名", () => {});

// ❌ 不好的命名
it("测试配置", () => {});
it("test branch", () => {});
```

### 2. 一个测试一个断言

尽量让每个测试只验证一个行为：

```typescript
// ✅ 好的做法
it("应该返回正确的分支名", () => {
  const result = getBranchName("feature", "PROJ-123", "login");
  expect(result).toBe("feature/20260116-PROJ-123-login");
});

it("应该处理没有 Story ID 的情况", () => {
  const result = getBranchName("feature", "", "login");
  expect(result).toBe("feature/20260116-login");
});

// ❌ 不好的做法
it("测试分支名生成", () => {
  expect(getBranchName("feature", "PROJ-123", "login")).toBe("...");
  expect(getBranchName("feature", "", "login")).toBe("...");
  expect(getBranchName("hotfix", "BUG-456", "fix")).toBe("...");
});
```

### 3. 使用 beforeEach 准备测试数据

```typescript
describe("配置管理", () => {
  let mockConfig: Config;

  beforeEach(() => {
    mockConfig = {
      branch: { prefix: "feature" },
      commit: { useAI: true },
    };
  });

  it("应该正确读取配置", () => {
    // 使用 mockConfig
  });
});
```

### 4. 清理 Mock

```typescript
beforeEach(() => {
  vi.clearAllMocks(); // 清除调用记录
});

afterEach(() => {
  vi.restoreAllMocks(); // 恢复原始实现
});
```

### 5. 测试边界情况

```typescript
describe("版本号解析", () => {
  it("应该处理标准版本号", () => {
    expect(parseVersion("v1.2.3")).toEqual({ major: 1, minor: 2, patch: 3 });
  });

  it("应该处理没有 v 前缀的版本号", () => {
    expect(parseVersion("1.2.3")).toEqual({ major: 1, minor: 2, patch: 3 });
  });

  it("应该处理预发布版本", () => {
    expect(parseVersion("v1.2.3-alpha.1")).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: "alpha.1",
    });
  });

  it("应该处理无效版本号", () => {
    expect(() => parseVersion("invalid")).toThrow();
  });
});
```

## 测试示例

### 示例 1: 测试配置读取

```typescript
import { describe, it, expect, vi } from "vitest";
import { readConfig } from "../src/config.js";

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe("配置读取", () => {
  it("应该读取全局配置", () => {
    const { existsSync, readFileSync } = await import("fs");
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({ branch: { prefix: "feat" } })
    );

    const config = readConfig();

    expect(config.branch.prefix).toBe("feat");
  });

  it("应该在配置文件不存在时返回默认配置", () => {
    const { existsSync } = await import("fs");
    vi.mocked(existsSync).mockReturnValue(false);

    const config = readConfig();

    expect(config).toEqual(DEFAULT_CONFIG);
  });
});
```

### 示例 2: 测试 Git 命令

```typescript
import { describe, it, expect, vi } from "vitest";
import { execSync } from "child_process";

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

describe("分支创建", () => {
  it("应该执行正确的 Git 命令", () => {
    const mockExecSync = vi.mocked(execSync);

    createBranch("feature/20260116-PROJ-123-login");

    expect(mockExecSync).toHaveBeenCalledWith(
      'git checkout -b "feature/20260116-PROJ-123-login"',
      { stdio: "pipe" }
    );
  });
});
```

### 示例 3: 测试 AI 服务

```typescript
import { describe, it, expect, vi } from "vitest";
import { generateCommitMessage } from "../src/ai-service.js";

describe("AI 提交消息生成", () => {
  it("应该生成符合规范的提交消息", async () => {
    const diff = "diff --git a/file.js...";

    const message = await generateCommitMessage(diff, {
      provider: "github",
      apiKey: "test-key",
    });

    expect(message).toMatch(/^(feat|fix|docs|style|refactor|test|chore)/);
  });

  it("应该处理 API 错误", async () => {
    await expect(
      generateCommitMessage("diff", { provider: "invalid" })
    ).rejects.toThrow();
  });
});
```

## 持续集成

测试会在以下情况自动运行：

- 每次 push 到 GitHub
- 每次创建 Pull Request
- 发布新版本前

GitHub Actions 配置在 `.github/workflows/` 目录。

## 调试测试

### 使用 console.log

```typescript
it("调试测试", () => {
  const result = someFunction();
  console.log("Result:", result);
  expect(result).toBe("expected");
});
```

### 运行单个测试

```bash
# 运行特定文件
npm test -- tests/commit.test.ts

# 运行特定测试（使用 .only）
it.only("只运行这个测试", () => {
  // ...
});
```

### 跳过测试

```typescript
it.skip("暂时跳过这个测试", () => {
  // ...
});
```

## 相关资源

- [Vitest 文档](https://vitest.dev/)
- [测试覆盖率报告](../../TEST_COVERAGE_SUMMARY.md)
- [测试说明](../../TESTING.md)

## 贡献测试

在提交 PR 时，请确保：

1. ✅ 所有测试通过
2. ✅ 新功能有对应的测试
3. ✅ 测试覆盖率不降低
4. ✅ 测试命名清晰
5. ✅ Mock 正确清理

运行测试：

```bash
npm test
```

查看覆盖率：

```bash
npm run test:coverage
```
