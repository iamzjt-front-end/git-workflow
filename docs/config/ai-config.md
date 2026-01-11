# AI 配置

AI commit 功能的详细配置指南。

## 🤖 AI 提供商

### GitHub Models（推荐）

免费使用，每天 150 次调用限制。

```json
{
  "aiCommit": {
    "provider": "github",
    "apiKey": "ghp_your_token_here"
  }
}
```

**获取 GitHub Token：**
1. 访问：https://github.com/settings/tokens/new
2. 勾选 `repo` 权限
3. 生成并复制 token

### OpenAI

付费服务，需要 OpenAI API Key。

```json
{
  "aiCommit": {
    "provider": "openai",
    "apiKey": "sk-your_api_key_here",
    "model": "gpt-4o-mini"
  }
}
```

### Claude

付费服务，需要 Claude API Key。

```json
{
  "aiCommit": {
    "provider": "claude",
    "apiKey": "sk-ant-your_api_key_here",
    "model": "claude-3-haiku-20240307"
  }
}
```

### Ollama（本地）

免费本地运行，需要安装 Ollama。

```json
{
  "aiCommit": {
    "provider": "ollama",
    "model": "qwen2.5-coder:7b"
  }
}
```

## 📝 详细描述配置

控制是否生成包含修改点的详细 commit message。

```json
{
  "aiCommit": {
    "detailedDescription": true
  }
}
```

**效果对比：**

简洁模式：
```
feat(auth): 添加用户登录功能
```

详细模式：
```
feat(auth): 添加用户登录功能

- 实现用户名密码登录接口
- 添加登录状态验证中间件
- 完善登录错误处理逻辑
```

## 🌍 语言配置

支持中文和英文两种语言。

```json
{
  "aiCommit": {
    "language": "zh-CN"  // 或 "en-US"
  }
}
```

## ⚙️ 高级配置

### Token 限制

```json
{
  "aiCommit": {
    "maxTokens": 400
  }
}
```

### 温度参数

```json
{
  "aiCommit": {
    "temperature": 0.3
  }
}
```

### 自定义提示词

```json
{
  "aiCommit": {
    "customPrompt": "请生成简洁的中文 commit message"
  }
}
```

## 🔧 故障排除

### 常见问题

1. **API Key 无效**
   - 检查 API Key 是否正确
   - 确认权限设置

2. **网络连接问题**
   - 检查网络连接
   - 考虑使用代理

3. **Token 限制**
   - 调整 maxTokens 参数
   - 使用简洁模式

### 调试模式

设置环境变量启用调试：

```bash
DEBUG=1 gw c
```