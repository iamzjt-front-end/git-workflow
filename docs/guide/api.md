# API 文档

本文档介绍 git-workflow 的内部 API 和核心模块。

## 核心模块

### config.ts - 配置管理

配置管理模块负责读取、合并和验证配置文件。

#### 类型定义

```typescript
interface Config {
  branch?: BranchConfig;
  commit?: CommitConfig;
  tag?: TagConfig;
}

interface BranchConfig {
  types?: string[];
  baseBranch?: string;
  includeDate?: boolean;
  includeStoryId?: boolean;
  storyIdRequired?: boolean;
}

interface CommitConfig {
  useAI?: boolean;
  format?: "conventional" | "simple";
  useGitmoji?: boolean;
  ai?: AIConfig;
}

interface AIConfig {
  provider?: "github" | "openai" | "claude" | "ollama";
  model?: string;
  apiKey?: string;
  baseURL?: string;
  customPrompt?: string;
}

interface TagConfig {
  prefix?: string;
  prerelease?: string[];
}
```

#### 主要函数

##### readConfig()

读取并合并配置文件。

```typescript
function readConfig(): Config;
```

**返回值：** 合并后的配置对象

**配置优先级：** 项目配置 > 全局配置 > 默认配置

**示例：**

```typescript
import { readConfig } from "./config.js";

const config = readConfig();
console.log(config.branch.baseBranch); // "main"
```

##### getGlobalConfigPath()

获取全局配置文件路径。

```typescript
function getGlobalConfigPath(): string;
```

**返回值：** `~/.gwrc.json` 的绝对路径

##### getProjectConfigPath()

获取项目配置文件路径。

```typescript
function getProjectConfigPath(): string;
```

**返回值：** 当前项目根目录下的 `.gwrc.json` 路径

### ai-service.ts - AI 服务

AI 服务模块负责调用各种 AI 提供商生成提交消息。

#### 主要函数

##### generateCommitMessage()

使用 AI 生成提交消息。

```typescript
async function generateCommitMessage(
  diff: string,
  config: AIConfig
): Promise<string>;
```

**参数：**

- `diff` - Git diff 输出
- `config` - AI 配置

**返回值：** 生成的提交消息

**抛出：** 如果 API 调用失败

**示例：**

```typescript
import { generateCommitMessage } from "./ai-service.js";

const diff = execOutput("git diff --cached");
const config = {
  provider: "github",
  model: "gpt-4o",
  apiKey: "your-api-key",
};

const message = await generateCommitMessage(diff, config);
console.log(message);
// feat(auth): 添加用户登录功能
```

##### cleanAIResponse()

清理 AI 响应，移除多余的格式。

```typescript
function cleanAIResponse(response: string): string;
```

**参数：**

- `response` - AI 原始响应

**返回值：** 清理后的提交消息

### utils.ts - 工具函数

工具模块提供常用的辅助函数。

#### 主要函数

##### execOutput()

执行 shell 命令并返回输出。

```typescript
function execOutput(command: string): string;
```

**参数：**

- `command` - 要执行的命令

**返回值：** 命令输出（去除首尾空白）

**示例：**

```typescript
import { execOutput } from "./utils.js";

const branch = execOutput("git branch --show-current");
console.log(branch); // "main"

const status = execOutput("git status --porcelain");
console.log(status); // "M file.js\nA new.js"
```

##### colors

颜色工具对象，用于终端输出着色。

```typescript
const colors: {
  yellow: (text: string) => string;
  green: (text: string) => string;
  red: (text: string) => string;
  blue: (text: string) => string;
  dim: (text: string) => string;
  bold: (text: string) => string;
  // ... 更多颜色
};
```

**示例：**

```typescript
import { colors } from "./utils.js";

console.log(colors.green("成功"));
console.log(colors.red("错误"));
console.log(colors.yellow("警告"));
```

##### divider()

打印分隔线。

```typescript
function divider(): void;
```

**示例：**

```typescript
import { divider } from "./utils.js";

console.log("标题");
divider();
console.log("内容");
```

##### theme

Inquirer 主题配置。

```typescript
const theme: Theme;
```

## 命令模块

### branch.ts - 分支管理

#### 主要函数

##### createBranch()

创建新分支。

```typescript
async function createBranch(type: BranchType): Promise<void>;
```

**参数：**

- `type` - 分支类型（"feature" | "hotfix"）

**功能：**

1. 获取 Story ID（可选）
2. 获取分支描述
3. 生成规范的分支名
4. 创建并切换到新分支

##### deleteBranch()

删除分支。

```typescript
async function deleteBranch(): Promise<void>;
```

**功能：**

1. 列出最近使用的分支
2. 用户选择要删除的分支
3. 确认删除
4. 删除本地和远程分支

##### getBranchName()

生成规范的分支名。

```typescript
async function getBranchName(type: BranchType): Promise<string | null>;
```

**参数：**

- `type` - 分支类型

**返回值：** 格式化的分支名，或 null（用户取消）

**格式：** `<type>/<date>-<storyId>-<description>`

### commit.ts - 提交管理

#### 主要函数

##### commit()

交互式提交代码。

```typescript
async function commit(): Promise<void>;
```

**功能：**

1. 检查是否有变更
2. 选择提交方式（AI 或手动）
3. 生成或输入提交消息
4. 确认并提交

##### formatCommitMessage()

格式化提交消息。

```typescript
function formatCommitMessage(
  type: string,
  scope: string,
  subject: string,
  body?: string
): string;
```

**参数：**

- `type` - 提交类型
- `scope` - 影响范围
- `subject` - 简短描述
- `body` - 详细描述（可选）

**返回值：** 格式化的提交消息

### tag.ts - 标签管理

#### 主要函数

##### createTag()

创建版本标签。

```typescript
async function createTag(): Promise<void>;
```

**功能：**

1. 获取当前版本
2. 选择版本类型（patch/minor/major）
3. 计算新版本号
4. 创建并推送 tag

##### cleanInvalidTags()

清理无效标签。

```typescript
async function cleanInvalidTags(): Promise<void>;
```

**功能：**

1. 检测无效的 tag（如 vnull）
2. 显示详情
3. 确认删除
4. 删除本地和远程 tag

##### parseVersion()

解析版本号。

```typescript
function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
};
```

**参数：**

- `version` - 版本字符串（如 "v1.2.3"）

**返回值：** 版本对象

### stash.ts - Stash 管理

#### 主要函数

##### stash()

交互式 stash 管理。

```typescript
async function stash(): Promise<void>;
```

**功能：**

1. 列出所有 stash
2. 选择操作（应用/弹出/删除/查看差异）
3. 执行相应操作

##### parseStashList()

解析 stash 列表。

```typescript
function parseStashList(): StashEntry[];
```

**返回值：** Stash 条目数组

**类型：**

```typescript
interface StashEntry {
  index: number;
  branch: string;
  message: string;
  date: string;
  files: string[];
}
```

### log.ts - 日志查看

#### 主要函数

##### log()

显示 Git 日志。

```typescript
async function log(options?: LogOptions): Promise<void>;
```

**参数：**

```typescript
interface LogOptions {
  author?: string;
  since?: string;
  until?: string;
  grep?: string;
  limit?: number;
  all?: boolean;
  interactive?: boolean;
}
```

**功能：**

1. 获取 Git 日志
2. 格式化为时间线样式
3. 使用 less 分页显示

### release.ts - 发布管理

#### 主要函数

##### release()

创建发布版本。

```typescript
async function release(): Promise<void>;
```

**功能：**

1. 选择版本类型
2. 更新版本号
3. 生成 CHANGELOG
4. 创建 tag
5. 推送到远程

### update.ts - 更新检查

#### 主要函数

##### checkUpdate()

检查是否有新版本。

```typescript
async function checkUpdate(): Promise<void>;
```

**功能：**

1. 获取最新版本信息
2. 比较当前版本
3. 显示更新提示

## 使用示例

### 示例 1: 自定义分支创建

```typescript
import { getBranchName } from "./commands/branch.js";
import { execSync } from "child_process";

async function createCustomBranch() {
  const branchName = await getBranchName("feature");
  if (branchName) {
    execSync(`git checkout -b "${branchName}"`, { stdio: "inherit" });
    console.log(`分支创建成功: ${branchName}`);
  }
}
```

### 示例 2: 批量处理提交

```typescript
import { generateCommitMessage } from "./ai-service.js";
import { execOutput } from "./utils.js";

async function batchCommit(files: string[]) {
  for (const file of files) {
    // 暂存文件
    execSync(`git add ${file}`);

    // 获取差异
    const diff = execOutput("git diff --cached");

    // 生成提交消息
    const message = await generateCommitMessage(diff, {
      provider: "github",
      apiKey: process.env.GITHUB_TOKEN,
    });

    // 提交
    execSync(`git commit -m "${message}"`);
  }
}
```

### 示例 3: 自动化发布

```typescript
import { createTag } from "./commands/tag.js";
import { execSync } from "child_process";

async function autoRelease() {
  // 运行测试
  execSync("npm test", { stdio: "inherit" });

  // 构建
  execSync("npm run build", { stdio: "inherit" });

  // 创建 tag
  await createTag();

  // 发布
  execSync("npm publish", { stdio: "inherit" });
}
```

## 扩展开发

### 添加新命令

1. 在 `src/commands/` 创建新文件
2. 实现命令逻辑
3. 在 `src/index.ts` 注册命令

```typescript
// src/commands/custom.ts
export async function customCommand(): Promise<void> {
  console.log("自定义命令");
}

// src/index.ts
import { customCommand } from "./commands/custom.js";

program
  .command("custom")
  .alias("c")
  .description("自定义命令")
  .action(customCommand);
```

### 添加新的 AI 提供商

在 `src/ai-service.ts` 中添加：

```typescript
async function generateCommitMessage(
  diff: string,
  config: AIConfig
): Promise<string> {
  switch (config.provider) {
    case "custom":
      return await callCustomAI(diff, config);
    // ... 其他提供商
  }
}

async function callCustomAI(diff: string, config: AIConfig): Promise<string> {
  // 实现自定义 AI 调用
}
```

## 相关资源

- [开发指南](./development.md)
- [测试指南](./testing.md)
- [代码文档](https://github.com/iamzjt-front-end/git-workflow/blob/main/CODE_DOCUMENTATION.md)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
