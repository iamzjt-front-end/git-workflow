# 贡献指南

感谢你考虑为 git-workflow 做出贡献！本指南将帮助你了解如何参与项目开发。

## 行为准则

我们致力于为所有人提供友好、安全和包容的环境。参与本项目即表示你同意遵守以下准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 如何贡献

### 报告 Bug

如果你发现了 bug，请：

1. 检查 [Issues](https://github.com/iamzjt-front-end/git-workflow/issues) 确认问题未被报告
2. 创建新 Issue，包含：
   - 清晰的标题和描述
   - 重现步骤
   - 预期行为和实际行为
   - 环境信息（OS、Node.js 版本等）
   - 相关的错误信息或截图

**Bug 报告模板：**

```markdown
## 问题描述

简要描述遇到的问题

## 重现步骤

1. 运行命令 `gw xxx`
2. 选择选项 xxx
3. 看到错误 xxx

## 预期行为

应该显示 xxx

## 实际行为

显示了 xxx 错误

## 环境信息

- OS: macOS 14.0
- Node.js: v20.0.0
- git-workflow: v0.4.0

## 错误信息
```

错误堆栈或截图

```

```

### 提出新功能

如果你有新功能的想法：

1. 先创建 Issue 讨论功能的必要性和设计
2. 等待维护者反馈
3. 获得批准后再开始开发

**功能请求模板：**

```markdown
## 功能描述

简要描述想要的功能

## 使用场景

为什么需要这个功能？它解决什么问题？

## 建议的实现

如何实现这个功能？

## 替代方案

是否考虑过其他方案？
```

### 提交代码

#### 1. Fork 仓库

点击 GitHub 页面右上角的 "Fork" 按钮。

#### 2. 克隆你的 Fork

```bash
git clone https://github.com/YOUR_USERNAME/git-workflow.git
cd git-workflow
```

#### 3. 添加上游仓库

```bash
git remote add upstream https://github.com/iamzjt-front-end/git-workflow.git
```

#### 4. 创建分支

```bash
# 使用 gw 创建规范分支
gw f
# 输入 Story ID（可选）和描述

# 或手动创建
git checkout -b feature/20260116-PROJ-123-your-feature
```

#### 5. 开发功能

- 编写代码
- 添加测试
- 更新文档
- 确保代码通过 lint 和测试

```bash
# 运行测试
npm test

# 检查类型
npm run build
```

#### 6. 提交代码

使用规范的提交信息：

```bash
# 使用 gw 提交（推荐）
gw c

# 或手动提交
git add .
git commit -m "feat: add new feature"
```

提交信息格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关
- `perf`: 性能优化

示例：

```
feat(commit): 添加 AI 提交消息生成功能

- 集成 OpenAI API
- 支持自定义提示词
- 添加错误处理

Closes #123
```

#### 7. 推送到你的 Fork

```bash
git push origin feature/20260116-PROJ-123-your-feature
```

#### 8. 创建 Pull Request

1. 访问你的 Fork 页面
2. 点击 "New Pull Request"
3. 填写 PR 描述：
   - 说明改动内容
   - 关联相关 Issue
   - 添加截图（如果适用）
4. 等待 review

**PR 模板：**

```markdown
## 改动说明

简要描述这个 PR 做了什么

## 关联 Issue

Closes #123

## 改动类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 测试相关

## 测试

- [ ] 添加了新的测试
- [ ] 所有测试通过
- [ ] 手动测试通过

## 截图（如果适用）

添加截图展示改动效果

## Checklist

- [ ] 代码遵循项目规范
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 提交信息符合规范
```

## 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 2 空格缩进
- 使用单引号
- 添加必要的注释

### 命名规范

```typescript
// 文件名：kebab-case
// ai-service.ts, commit-format.ts

// 函数名：camelCase
function getBranchName() {}
async function generateCommitMessage() {}

// 类型/接口：PascalCase
interface CommitConfig {}
type BranchType = "feature" | "hotfix";

// 常量：UPPER_SNAKE_CASE
const DEFAULT_CONFIG = {};
const MAX_RETRIES = 3;

// 私有函数：以 _ 开头
function _internalHelper() {}
```

### 函数设计

```typescript
// ✅ 好的函数设计
/**
 * 生成规范的分支名
 * @param type - 分支类型
 * @param storyId - Story ID（可选）
 * @param description - 分支描述
 * @returns 格式化的分支名
 */
function generateBranchName(
  type: BranchType,
  storyId: string,
  description: string
): string {
  // 实现
}

// ❌ 不好的函数设计
function doStuff(a: any, b: any): any {
  // 实现
}
```

### 错误处理

```typescript
// ✅ 好的错误处理
try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error instanceof NetworkError) {
    console.error("网络错误:", error.message);
  } else {
    console.error("未知错误:", error);
  }
  throw error;
}

// ❌ 不好的错误处理
try {
  const result = await apiCall();
  return result;
} catch (error) {
  // 忽略错误
}
```

### 测试要求

每个新功能都必须包含测试：

```typescript
describe("新功能", () => {
  it("应该正确处理正常情况", () => {
    // 测试正常流程
  });

  it("应该处理边界情况", () => {
    // 测试边界条件
  });

  it("应该处理错误情况", () => {
    // 测试错误处理
  });
});
```

### 文档要求

- 为新功能添加文档
- 更新 README（如果需要）
- 添加代码注释
- 更新 CHANGELOG

## Review 流程

### 提交 PR 后

1. 自动运行 CI 测试
2. 维护者 review 代码
3. 根据反馈修改代码
4. 再次 review
5. 合并到 main 分支

### Review 标准

代码会从以下方面进行 review：

- ✅ 功能是否正确实现
- ✅ 代码质量和可读性
- ✅ 测试覆盖率
- ✅ 文档完整性
- ✅ 性能影响
- ✅ 安全性考虑

### 常见 Review 意见

**代码质量：**

```typescript
// ❌ 需要改进
function process(data: any) {
  const result = data.map((x) => x * 2);
  return result;
}

// ✅ 改进后
/**
 * 处理数据，将每个值翻倍
 */
function processData(numbers: number[]): number[] {
  return numbers.map((num) => num * 2);
}
```

**错误处理：**

```typescript
// ❌ 需要改进
async function fetchData() {
  const response = await fetch(url);
  return response.json();
}

// ✅ 改进后
async function fetchData(): Promise<Data> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("获取数据失败:", error);
    throw error;
  }
}
```

## 发布流程

发布由维护者执行：

1. 更新版本号
2. 更新 CHANGELOG
3. 创建 tag
4. 发布到 npm
5. 发布 GitHub Release

## 获取帮助

如果你在贡献过程中遇到问题：

- 📖 查看 [开发指南](./development.md)
- 🧪 查看 [测试指南](./testing.md)
- 💬 在 Issue 中提问
- 💡 参与 [Discussions](https://github.com/iamzjt-front-end/git-workflow/discussions)

## 贡献者

感谢所有贡献者！

<a href="https://github.com/iamzjt-front-end/git-workflow/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=iamzjt-front-end/git-workflow" />
</a>

## 许可证

通过贡献代码，你同意你的贡献将在 [MIT License](https://github.com/iamzjt-front-end/git-workflow/blob/main/LICENSE) 下发布。
