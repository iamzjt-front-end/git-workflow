# 测试指南

## 测试框架

本项目使用 [Vitest](https://vitest.dev/) 作为测试框架。

## 运行测试

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

## 测试结构

```
tests/
├── utils.test.ts    # 工具函数测试
├── tag.test.ts      # Tag 功能测试
└── README.md        # 本文档
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

### Mock 示例

```typescript
import { vi } from "vitest";
import { execSync } from "child_process";

vi.mock("child_process");

it("应该调用 git 命令", () => {
  const mockExecSync = vi.mocked(execSync);
  mockExecSync.mockReturnValue("v0.1.0\nv0.2.0");

  // 测试代码...

  expect(mockExecSync).toHaveBeenCalledWith("git tag -l");
});
```

## 测试覆盖的功能

### Tag 功能

- ✅ 前缀提取（v, g, release-, 无前缀）
- ✅ Tag 分组逻辑
- ✅ 显示逻辑（最多 5 个）
- ✅ 列宽计算

### Utils 功能

- ✅ 字符串操作
- ✅ 基本工具函数

## 最佳实践

1. **每个功能都应该有测试** - 确保新功能不会破坏现有功能
2. **测试应该独立** - 每个测试不应该依赖其他测试
3. **使用描述性的测试名称** - 让测试失败时容易定位问题
4. **Mock 外部依赖** - 如 git 命令、文件系统等
5. **提交前运行测试** - 确保所有测试通过

## CI/CD 集成

可以在 `.github/workflows` 中添加测试步骤：

```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

## 添加新测试

当添加新功能时：

1. 在 `tests/` 目录创建对应的测试文件
2. 编写测试用例覆盖主要逻辑
3. 运行 `npm test` 确保通过
4. 提交代码

## 调试测试

```bash
# 只运行特定文件的测试
npx vitest tests/tag.test.ts

# 只运行匹配的测试
npx vitest -t "前缀提取"

# 使用 UI 界面调试
npm run test:ui
```
