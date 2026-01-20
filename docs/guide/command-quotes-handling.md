# 命令参数引号处理

本文档说明了 git-workflow 如何正确处理带引号和特殊字符的命令参数。

## 问题背景

在早期版本中，使用简单的字符串分割方式处理命令参数：

```typescript
// ❌ 错误的方式
const [cmd, ...args] = command.split(" ");
spawn(cmd, args);
```

这种方式无法正确处理引号：

```javascript
'git tag -a "v1.5.3" -m "Release v1.5.3"'.split(" ");
// 结果: ["git", "tag", "-a", '"v1.5.3"', "-m", '"Release', 'v1.5.3"']
// 引号被当作参数的一部分！
```

导致的问题：

- Tag 名称包含引号：`"v1.5.3"` 而不是 `v1.5.3`
- Git 报错：`fatal: Failed to resolve '"v1.5.3"' as a valid ref.`

## 解决方案

使用 `shell: true` 选项让 spawn 通过 shell 执行命令：

```typescript
// ✅ 正确的方式
spawn(command, {
  stdio: spinner ? "pipe" : "inherit",
  shell: true, // 使用 shell 模式
});
```

### 优势

1. **正确处理引号**：Shell 会自动解析和移除引号
2. **支持特殊字符**：emoji、中文、空格等都能正确处理
3. **支持转义**：`\"` 等转义字符正常工作

## 支持的场景

### 1. Tag 命令

```bash
# 基本版本号
gw tag  # 创建 v1.5.3

# 预发布版本
gw tag  # 创建 v1.0.0-beta.1

# 带特殊字符
git tag -a "v1.0.0-🎉" -m "Release 🎉"
```

### 2. Branch 命令

```bash
# 带日期和描述的分支
gw b feature  # 创建 feature/20240120-123-add-feature

# 删除带特殊字符的分支
git branch -D "feature/20240120-123-add-feature"
git push origin --delete "feature/20240120-123-add-feature"
```

### 3. Stash 命令

```bash
# 带中文的 stash 消息
git stash push -m "临时保存：修复登录bug"

# 带引号的消息
git stash push -m "WIP: 添加\"新功能\""

# 从 stash 创建分支
git stash branch "feature/from-stash" stash@{0}
```

### 4. Commit 命令

```bash
# 带特殊字符的提交消息
git commit -m "feat: add \"quotes\" support"
git commit -m "fix: 修复登录问题 🐛"
```

## 测试覆盖

我们创建了全面的测试用例来确保引号处理的正确性：

### 测试场景

1. **基本引号处理**
   - 带引号的 tag 名称
   - 带空格的分支名称
   - 带特殊字符的 commit message

2. **特殊字符支持**
   - Emoji：`v1.0.0-🎉`
   - 中文：`临时保存：修复bug`
   - 转义引号：`feat: add \"quotes\" support`

3. **错误处理**
   - 捕获 stderr 错误信息
   - 显示详细的失败原因
   - 提供解决建议

### 运行测试

```bash
# 运行引号处理测试
npm test -- tests/command-with-quotes.test.ts

# 运行所有测试
npm test
```

## 错误信息改进

现在当命令失败时，会显示详细的错误信息：

### Tag 已存在

```
✗ Tag v1.5.3 已存在

  提示: 如需重新创建，请先删除旧 tag:
  git tag -d v1.5.3
  git push origin --delete v1.5.3
```

### 没有提交

```
✗ 当前仓库没有任何提交

  提示: 需要先创建至少一个提交才能打 tag:
  git add .
  git commit -m "Initial commit"
  gw tag
```

### Git 命令错误

```
✗ tag 创建失败
  fatal: Failed to resolve 'HEAD' as a valid ref.
```

## 实现细节

### execAsync 函数

```typescript
export function execAsync(
  command: string,
  spinner?: Ora,
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const process = spawn(command, {
      stdio: spinner ? "pipe" : "inherit",
      shell: true, // 关键：使用 shell 模式
    });

    let errorOutput = "";

    // 捕获错误输出
    if (process.stderr) {
      process.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });
    }

    process.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: errorOutput.trim() });
      }
    });

    process.on("error", (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}
```

### execWithSpinner 函数

```typescript
export async function execWithSpinner(
  command: string,
  spinner: Ora,
  successMessage?: string,
  errorMessage?: string,
): Promise<boolean> {
  const result = await execAsync(command, spinner);

  if (result.success) {
    if (successMessage) {
      spinner.succeed(successMessage);
    } else {
      spinner.succeed();
    }
  } else {
    if (errorMessage) {
      spinner.fail(errorMessage);
    } else {
      spinner.fail();
    }

    // 显示具体的错误信息
    if (result.error) {
      console.log(colors.dim(`  ${result.error}`));
    }
  }

  return result.success;
}
```

## 最佳实践

### 1. 始终使用引号包裹可能包含特殊字符的参数

```typescript
// ✅ 推荐
await execAsync(`git tag -a "${tagName}" -m "Release ${tagName}"`);

// ❌ 不推荐（如果 tagName 包含空格会失败）
await execAsync(`git tag -a ${tagName} -m Release ${tagName}`);
```

### 2. 转义用户输入中的引号

```typescript
// ✅ 正确处理用户输入
const message = userInput.replace(/"/g, '\\"');
await execAsync(`git commit -m "${message}"`);
```

### 3. 使用 execWithSpinner 显示进度

```typescript
// ✅ 推荐：显示进度和错误信息
const spinner = ora("正在创建 tag...").start();
const success = await execWithSpinner(
  `git tag -a "${tagName}" -m "Release ${tagName}"`,
  spinner,
  "Tag 创建成功",
  "Tag 创建失败",
);

if (!success) {
  // 错误信息已自动显示
  return;
}
```

## 相关文件

- `src/utils.ts` - execAsync 和 execWithSpinner 实现
- `tests/command-with-quotes.test.ts` - 引号处理测试
- `src/commands/tag.ts` - Tag 命令实现
- `src/commands/branch.ts` - Branch 命令实现
- `src/commands/stash.ts` - Stash 命令实现

## 版本历史

- **v0.4.5** - 修复引号处理问题，添加详细错误信息
- **v0.4.4** - 修复 spinner 阻塞问题
- **v0.4.3** - 添加 execAsync 和 execWithSpinner 函数
