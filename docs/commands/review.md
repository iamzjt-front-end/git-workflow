# review - AI 代码审查

使用 AI 对代码变更进行智能审查，生成详细的 Markdown 审查报告。

## 基本用法

```bash
# 交互式选择要审查的 commits
gw review

# 审查指定的 commit
gw review abc1234

# 审查多个 commits
gw review abc1234 def5678

# 审查 commit 范围（包含 abc1234 和 def5678 的所有 commits）
gw review abc1234..def5678

# 审查最近 N 个 commits
gw review -n 3
gw review --last 3

# 审查暂存区的更改
gw review -s
gw review --staged

# 指定输出文件路径
gw review -o ./my-review.md
```

## 命令别名

- `gw rw` - review 的简写

## 选项

| 选项 | 简写 | 说明 |
|------|------|------|
| `--last <number>` | `-n` | 审查最近 N 个 commits |
| `--staged` | `-s` | 审查暂存区的更改 |
| `--output <path>` | `-o` | 指定输出文件路径 |

## 审查报告

审查报告会保存在 `.gw-reviews/` 目录下，文件名格式为：

```
review-{commit-hash}-{timestamp}.md
```

报告内容包括：

1. **变更统计** - 文件数、新增行数、删除行数
2. **审查的提交** - 相关 commit 信息
3. **AI 审查结果**
   - 概述 - 变更内容和整体评价
   - 问题列表 - 按严重程度分类
   - 改进建议 - 具体的代码改进建议
   - 亮点 - 代码中写得好的地方

## 问题严重程度

- 🔴 **严重** - 必须修复的问题（安全漏洞、严重 Bug）
- 🟡 **警告** - 建议修复的问题（潜在 Bug、性能问题）
- 🔵 **建议** - 可选的改进（代码风格、最佳实践）

## 审查维度

AI 会从以下维度进行代码审查：

1. **代码质量** - 可读性、可维护性、代码风格
2. **潜在 Bug** - 空指针、边界条件、异常处理
3. **安全问题** - SQL 注入、XSS、敏感信息泄露
4. **性能问题** - 不必要的循环、内存泄漏、重复计算
5. **最佳实践** - 设计模式、SOLID 原则、DRY 原则

## 配置

AI 审查使用与 AI Commit 相同的配置，在 `.gwrc.json` 中设置：

```json
{
  "aiCommit": {
    "enabled": true,
    "provider": "github",
    "apiKey": "your-api-key",
    "model": "gpt-4o",
    "language": "zh-CN"
  }
}
```

### 支持的 AI 提供商

| 提供商 | 默认模型 | 说明 |
|--------|----------|------|
| `github` | gpt-4o | GitHub Models（推荐） |
| `openai` | gpt-4o | OpenAI API |
| `claude` | claude-3-5-sonnet | Anthropic Claude |
| `ollama` | qwen2.5-coder:14b | 本地 Ollama |

## 示例

### 审查最近的提交

```bash
$ gw review -n 1

────────────────────────────────────────
📊 变更统计:
   文件: 3 个
   新增: +45 行
   删除: -12 行
────────────────────────────────────────
✔ AI 审查完成

✅ 审查报告已生成: .gw-reviews/review-abc1234-2024-01-20T10-30-00.md
```

### 交互式选择

```bash
$ gw review

────────────────────────────────────────
? 选择要审查的内容 (空格选择，回车确认):
❯ ◯ 📦 暂存区的更改 (staged changes)
  ◯ abc1234 feat: 添加用户登录功能 - 张三 (2024-01-20)
  ◯ def5678 fix: 修复数据获取失败 - 李四 (2024-01-19)
  ◯ ghi9012 docs: 更新 README - 王五 (2024-01-18)
```

## 注意事项

1. **API Key 必需** - 除 Ollama 外，其他提供商需要配置 API Key
2. **代码长度限制** - 过长的 diff 会被截断以避免超出 token 限制
3. **网络要求** - 需要能够访问 AI 服务的网络环境
4. **报告目录** - 建议将 `.gw-reviews/` 添加到 `.gitignore`

## 相关命令

- [commit](./commit.md) - AI 辅助提交
- [log](./log.md) - 查看提交日志
- [amend](./amend.md) - 修改提交信息
