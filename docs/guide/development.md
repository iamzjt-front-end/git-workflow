# 开发指南

本指南将帮助你快速搭建 git-workflow 的本地开发环境。

## 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0（或使用 pnpm/yarn）
- **Git**: >= 2.0.0

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/iamzjt-front-end/git-workflow.git
cd git-workflow
```

### 2. 安装依赖

```bash
npm install
```

### 3. 开发模式

```bash
npm run dev
```

这会启动 TypeScript 的 watch 模式，自动编译代码变更。

### 4. 本地测试

在开发模式下，你可以直接运行编译后的代码：

```bash
# 使用 node 运行
node dist/index.js <command>

# 或者使用可执行权限
./dist/index.js <command>

# 示例
node dist/index.js --version
node dist/index.js f
```

### 5. 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- tests/commit.test.ts

# 监听模式（开发时使用）
npm run test:watch

# 查看测试覆盖率
npm run test:coverage
```

### 6. 构建

```bash
npm run build
```

构建产物会输出到 `dist/` 目录。

## 项目结构

```
git-workflow/
├── src/                    # 源代码
│   ├── commands/          # 命令实现
│   │   ├── branch.ts     # 分支管理
│   │   ├── commit.ts     # 提交管理
│   │   ├── tag.ts        # 标签管理
│   │   ├── stash.ts      # Stash 管理
│   │   ├── release.ts    # 发布管理
│   │   ├── log.ts        # 日志查看
│   │   ├── update.ts     # 更新检查
│   │   └── init.ts       # 初始化配置
│   ├── ai-service.ts     # AI 服务
│   ├── config.ts         # 配置管理
│   ├── utils.ts          # 工具函数
│   ├── update-notifier.ts # 更新通知
│   └── index.ts          # 入口文件
├── tests/                 # 测试文件
├── docs/                  # VitePress 文档
├── scripts/               # 构建和发布脚本
└── dist/                  # 构建输出（git ignored）
```

## 开发工作流

### 创建新功能

1. 从 main 分支创建 feature 分支：

```bash
gw f
# 或手动创建
git checkout -b feature/YYYYMMDD-STORY-description
```

2. 开发功能并编写测试

3. 运行测试确保通过：

```bash
npm test
```

4. 提交代码：

```bash
gw c
# 或手动提交
git add .
git commit -m "feat: add new feature"
```

### 调试技巧

#### 1. 使用 console.log

在代码中添加 `console.log` 进行调试：

```typescript
console.log("Debug:", variable);
```

#### 2. 使用 Node.js 调试器

在 VS Code 中创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${file}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

#### 3. 测试特定场景

创建临时测试文件快速验证：

```typescript
// test-temp.ts
import { someFunction } from "./src/utils.js";

console.log(someFunction("test"));
```

运行：

```bash
npx tsx test-temp.ts
```

## 代码规范

### TypeScript

- 使用严格模式（`strict: true`）
- 为所有函数添加类型注解
- 避免使用 `any`，使用 `unknown` 代替
- 使用接口定义数据结构

### 命名规范

- **文件名**: kebab-case（如 `ai-service.ts`）
- **函数名**: camelCase（如 `getBranchName`）
- **类型/接口**: PascalCase（如 `CommitConfig`）
- **常量**: UPPER_SNAKE_CASE（如 `DEFAULT_CONFIG`）

### 提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 常见问题

### Q: 如何添加新命令？

1. 在 `src/commands/` 创建新文件
2. 实现命令逻辑
3. 在 `src/index.ts` 注册命令
4. 添加测试文件
5. 更新文档

### Q: 如何添加新的 AI 提供商？

1. 在 `src/ai-service.ts` 的 `generateCommitMessage` 函数中添加新的 case
2. 实现 API 调用逻辑
3. 更新配置类型定义
4. 添加测试
5. 更新 AI 配置文档

### Q: 如何调试 Git 命令？

使用 `execOutput` 函数查看 Git 命令输出：

```typescript
import { execOutput } from "./utils.js";

const output = execOutput("git status --porcelain");
console.log("Git output:", output);
```

### Q: 测试失败怎么办？

1. 检查错误信息
2. 运行单个测试文件定位问题
3. 使用 `console.log` 调试
4. 检查 mock 是否正确设置

## 发布流程

发布由维护者执行：

1. 更新版本号：

```bash
npm run version
```

2. 更新 CHANGELOG

3. 提交并推送：

```bash
git add .
git commit -m "chore: release v1.x.x"
git push
```

4. 创建 tag：

```bash
gw t
```

5. 发布到 npm：

```bash
npm publish
```

## 相关资源

- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Vitest 文档](https://vitest.dev/)
- [Inquirer.js 文档](https://github.com/SBoudrias/Inquirer.js)
- [Commander.js 文档](https://github.com/tj/commander.js)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 获取帮助

- 查看 [CODE_DOCUMENTATION.md](https://github.com/iamzjt-front-end/git-workflow/blob/main/CODE_DOCUMENTATION.md) 了解代码架构
- 查看 [TESTING.md](https://github.com/iamzjt-front-end/git-workflow/blob/main/TESTING.md) 了解测试策略
- 提交 [Issue](https://github.com/iamzjt-front-end/git-workflow/issues) 报告问题
- 加入讨论 [Discussions](https://github.com/iamzjt-front-end/git-workflow/discussions)
