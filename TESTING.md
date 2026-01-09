# 测试体系说明

## 为什么需要测试？

在开发 CLI 工具时，测试能够：

1. **防止回归** - 确保新功能不会破坏现有功能
2. **提高信心** - 重构代码时更有底气
3. **文档作用** - 测试用例本身就是最好的使用示例
4. **快速反馈** - 比手动测试快得多

## 测试框架选择

我们选择 **Vitest** 的原因：

- ✅ 快速 - 基于 Vite，启动和运行都很快
- ✅ 兼容 Jest - API 与 Jest 几乎完全兼容
- ✅ ESM 原生支持 - 无需额外配置
- ✅ TypeScript 支持 - 开箱即用
- ✅ UI 界面 - 提供可视化测试界面
- ✅ 覆盖率报告 - 内置覆盖率工具

## 测试结构

```
tests/
├── utils.test.ts      # 工具函数测试
├── tag.test.ts        # Tag 功能测试
├── commit.test.ts     # Commit 功能测试
└── README.md          # 测试指南
```

## 当前测试覆盖

### Tag 功能 ✅

- [x] 前缀提取（v, g, release-, 无前缀）
- [x] Tag 分组逻辑
- [x] 显示逻辑（最多 5 个）
- [x] 列宽计算
- [x] 省略号显示

### Commit 功能 ✅

- [x] 提交类型定义
- [x] 提交消息格式
- [x] Refactor 对齐处理
- [x] Emoji 使用

### Utils 功能 ✅

- [x] 字符串操作
- [x] 基本工具函数

## 运行测试

### 基本命令

```bash
# 运行所有测试（单次）
npm test

# 监听模式（开发时使用）
npm run test:watch

# 可视化界面
npm run test:ui

# 生成覆盖率报告
npm run test:coverage
```

### 运行特定测试

```bash
# 只运行 tag 相关测试
npx vitest tests/tag.test.ts

# 只运行匹配的测试
npx vitest -t "前缀提取"

# 运行并查看详细输出
npx vitest --reporter=verbose
```

## 编写测试

### 基本示例

```typescript
import { describe, it, expect } from "vitest";

describe("功能模块", () => {
  it("应该做某事", () => {
    const result = someFunction();
    expect(result).toBe(expectedValue);
  });
});
```

### 测试分组

```typescript
describe("Tag 功能", () => {
  describe("前缀提取", () => {
    it("应该提取 v 前缀", () => {
      // 测试代码
    });

    it("应该处理无前缀", () => {
      // 测试代码
    });
  });

  describe("Tag 分组", () => {
    it("应该按前缀分组", () => {
      // 测试代码
    });
  });
});
```

### Mock 外部依赖

```typescript
import { vi } from "vitest";
import { execSync } from "child_process";

// Mock 整个模块
vi.mock("child_process");

it("应该调用 git 命令", () => {
  const mockExecSync = vi.mocked(execSync);
  mockExecSync.mockReturnValue("v0.1.0\nv0.2.0");

  // 测试代码...

  expect(mockExecSync).toHaveBeenCalledWith("git tag -l");
});
```

### 测试异步代码

```typescript
it("应该异步获取数据", async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

## CI/CD 集成

### GitHub Actions

已配置 `.github/workflows/test.yml`：

```yaml
name: Test

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
```

### Pre-commit Hook

已配置 `.husky/pre-commit`，每次提交前自动运行测试：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行测试
npm test
```

如果测试失败，提交会被阻止。

## 测试最佳实践

### 1. 测试应该独立

每个测试不应该依赖其他测试的结果：

```typescript
// ❌ 不好 - 依赖全局状态
let result;
it("测试 1", () => {
  result = doSomething();
});
it("测试 2", () => {
  expect(result).toBe(expected); // 依赖测试 1
});

// ✅ 好 - 每个测试独立
it("测试 1", () => {
  const result = doSomething();
  expect(result).toBe(expected);
});
it("测试 2", () => {
  const result = doSomething();
  expect(result).toBe(expected);
});
```

### 2. 使用描述性的测试名称

```typescript
// ❌ 不好
it("测试 1", () => {});

// ✅ 好
it("应该正确提取 v 前缀", () => {});
it("无前缀时应该返回 (无前缀)", () => {});
```

### 3. 测试边界情况

```typescript
describe("Tag 显示", () => {
  it("应该显示少于 5 个的所有 tag", () => {
    // 测试 1-4 个 tag
  });

  it("应该只显示最后 5 个 tag", () => {
    // 测试正好 5 个 tag
  });

  it("超过 5 个时应该显示省略号", () => {
    // 测试 6+ 个 tag
  });

  it("应该处理空数组", () => {
    // 测试 0 个 tag
  });
});
```

### 4. 使用 beforeEach/afterEach

```typescript
import { beforeEach, afterEach } from "vitest";

describe("测试套件", () => {
  beforeEach(() => {
    // 每个测试前执行
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 每个测试后执行
    vi.restoreAllMocks();
  });

  it("测试 1", () => {});
  it("测试 2", () => {});
});
```

### 5. 测试覆盖率目标

- **核心功能** - 100% 覆盖
- **工具函数** - 90%+ 覆盖
- **UI 交互** - 关键路径覆盖

## 添加新功能时的测试流程

1. **先写测试（TDD）**

   ```typescript
   // 1. 写测试
   it("应该支持新功能", () => {
     const result = newFeature();
     expect(result).toBe(expected);
   });

   // 2. 运行测试（应该失败）
   // npm test

   // 3. 实现功能
   function newFeature() {
     // 实现代码
   }

   // 4. 运行测试（应该通过）
   // npm test
   ```

2. **或先实现后测试**

   ```typescript
   // 1. 实现功能
   function newFeature() {
     // 实现代码
   }

   // 2. 写测试
   it("应该支持新功能", () => {
     const result = newFeature();
     expect(result).toBe(expected);
   });

   // 3. 运行测试
   // npm test
   ```

3. **提交前检查**
   ```bash
   # 运行所有测试
   npm test
   # 检查覆盖率
   npm run test:coverage
   # 构建验证
   npm run build
   ```

## 调试测试

### 使用 console.log

```typescript
it("调试测试", () => {
  const result = someFunction();
  console.log("result:", result); // 会在测试输出中显示
  expect(result).toBe(expected);
});
```

### 使用 test.only

```typescript
// 只运行这一个测试
it.only("调试这个测试", () => {
  // 测试代码
});
```

### 使用 UI 界面

```bash
npm run test:ui
```

在浏览器中查看测试结果，可以：

- 查看测试树
- 查看失败详情
- 重新运行单个测试
- 查看覆盖率

## 常见问题

### Q: 测试运行很慢怎么办？

A: 使用监听模式，只运行改动的测试：

```bash
npm run test:watch
```

### Q: 如何跳过某个测试？

A: 使用 `it.skip`：

```typescript
it.skip("暂时跳过这个测试", () => {
  // 测试代码
});
```

### Q: 如何测试 CLI 交互？

A: Mock inquirer 的 prompt：

```typescript
import { vi } from "vitest";
import { select } from "@inquirer/prompts";

vi.mock("@inquirer/prompts");

it("应该选择正确的选项", async () => {
  vi.mocked(select).mockResolvedValue("option1");
  // 测试代码
});
```

### Q: 如何测试 git 命令？

A: Mock child_process：

```typescript
import { vi } from "vitest";
import { execSync } from "child_process";

vi.mock("child_process");

it("应该执行 git 命令", () => {
  vi.mocked(execSync).mockReturnValue("success");
  // 测试代码
});
```

## 未来计划

- [ ] 增加集成测试
- [ ] 增加 E2E 测试
- [ ] 提高测试覆盖率到 90%+
- [ ] 添加性能测试
- [ ] 添加快照测试

## 参考资料

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)
