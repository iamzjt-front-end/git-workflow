# 测试快速开始

## 5 分钟上手测试

### 1. 运行现有测试

```bash
# 运行所有测试
npm test

# 输出示例：
# ✓ tests/utils.test.ts (3 tests) 2ms
# ✓ tests/tag.test.ts (10 tests) 3ms
# ✓ tests/commit.test.ts (7 tests) 3ms
#
# Test Files  3 passed (3)
#      Tests  20 passed (20)
```

### 2. 监听模式（推荐开发时使用）

```bash
npm run test:watch
```

修改代码后，测试会自动重新运行。

### 3. 可视化界面

```bash
npm run test:ui
```

在浏览器中打开 `http://localhost:51204/__vitest__/`，可以：

- 查看测试树状结构
- 点击运行单个测试
- 查看测试覆盖率
- 查看失败详情

### 4. 编写你的第一个测试

创建 `tests/example.test.ts`：

```typescript
import { describe, it, expect } from "vitest";

describe("我的第一个测试", () => {
  it("1 + 1 应该等于 2", () => {
    expect(1 + 1).toBe(2);
  });

  it("数组应该包含元素", () => {
    const arr = ["a", "b", "c"];
    expect(arr).toContain("b");
  });

  it("对象应该有属性", () => {
    const obj = { name: "test", value: 123 };
    expect(obj).toHaveProperty("name");
    expect(obj.name).toBe("test");
  });
});
```

运行测试：

```bash
npm test
```

### 5. 测试实际功能

测试 tag 前缀提取：

```typescript
import { describe, it, expect } from "vitest";

describe("Tag 前缀提取", () => {
  it("应该提取 v 前缀", () => {
    const tag = "v1.0.0";
    const prefix = tag.replace(/[0-9].*/, "");
    expect(prefix).toBe("v");
  });

  it("应该提取 release- 前缀", () => {
    const tag = "release-1.0.0";
    const prefix = tag.replace(/[0-9].*/, "");
    expect(prefix).toBe("release-");
  });

  it("应该处理无前缀的 tag", () => {
    const tag = "1.0.0";
    const prefix = tag.replace(/[0-9].*/, "") || "(无前缀)";
    expect(prefix).toBe("(无前缀)");
  });
});
```

### 6. 常用断言

```typescript
// 相等性
expect(value).toBe(expected); // 严格相等 ===
expect(value).toEqual(expected); // 深度相等（对象、数组）

// 真值
expect(value).toBeTruthy(); // 真值
expect(value).toBeFalsy(); // 假值
expect(value).toBeDefined(); // 已定义
expect(value).toBeUndefined(); // 未定义
expect(value).toBeNull(); // null

// 数字
expect(value).toBeGreaterThan(3); // > 3
expect(value).toBeGreaterThanOrEqual(3); // >= 3
expect(value).toBeLessThan(5); // < 5
expect(value).toBeLessThanOrEqual(5); // <= 5

// 字符串
expect(string).toMatch(/pattern/); // 匹配正则
expect(string).toContain("substring"); // 包含子串

// 数组
expect(array).toContain(item); // 包含元素
expect(array).toHaveLength(3); // 长度为 3

// 对象
expect(object).toHaveProperty("key"); // 有属性
expect(object).toMatchObject({ key: value }); // 匹配部分属性

// 函数
expect(fn).toThrow(); // 抛出错误
expect(fn).toThrow("error message"); // 抛出特定错误
```

### 7. 测试异步代码

```typescript
it("应该异步获取数据", async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

it("应该处理 Promise", () => {
  return fetchData().then((data) => {
    expect(data).toBeDefined();
  });
});

it("应该处理 Promise 拒绝", async () => {
  await expect(fetchData()).rejects.toThrow("error");
});
```

### 8. 使用 Mock

```typescript
import { vi } from "vitest";

it("应该 mock 函数", () => {
  const mockFn = vi.fn();
  mockFn("hello");

  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledWith("hello");
  expect(mockFn).toHaveBeenCalledTimes(1);
});

it("应该 mock 返回值", () => {
  const mockFn = vi.fn().mockReturnValue("mocked");
  const result = mockFn();

  expect(result).toBe("mocked");
});
```

### 9. 分组测试

```typescript
describe("外层分组", () => {
  describe("内层分组 1", () => {
    it("测试 1", () => {});
    it("测试 2", () => {});
  });

  describe("内层分组 2", () => {
    it("测试 3", () => {});
    it("测试 4", () => {});
  });
});
```

### 10. 生成覆盖率报告

```bash
npm run test:coverage
```

输出示例：

```
 % Coverage report from v8
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.71 |    83.33 |   88.88 |   85.71 |
 src/commands       |   90.00 |    85.00 |   92.00 |   90.00 |
  tag.ts            |   92.00 |    88.00 |   95.00 |   92.00 |
  commit.ts         |   88.00 |    82.00 |   89.00 |   88.00 |
--------------------|---------|----------|---------|---------|
```

## 下一步

- 查看 [tests/README.md](./README.md) 了解更多测试技巧
- 查看 [TESTING.md](../TESTING.md) 了解测试体系
- 查看现有测试文件学习最佳实践：
  - `tests/tag.test.ts` - Tag 功能测试
  - `tests/commit.test.ts` - Commit 功能测试
  - `tests/utils.test.ts` - 工具函数测试

## 常用命令速查

```bash
npm test                  # 运行所有测试
npm run test:watch        # 监听模式
npm run test:ui           # 可视化界面
npm run test:coverage     # 覆盖率报告

npx vitest tests/tag.test.ts    # 运行单个文件
npx vitest -t "前缀提取"         # 运行匹配的测试
```

## 提交前检查清单

- [ ] 运行 `npm test` 确保所有测试通过
- [ ] 运行 `npm run build` 确保构建成功
- [ ] 新功能已添加测试
- [ ] 测试覆盖率没有下降

Happy Testing! 🎉
