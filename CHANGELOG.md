# Changelog

## [v0.4.0](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.10...v0.4.0) (2026-01-15)

### 📖 Documentation

- 📝 docs: 自动更新测试数量徽章 [skip ci] ([3d93407](https://github.com/iamzjt-front-end/git-workflow/commit/3d93407))
- 📝 docs(test): 添加测试覆盖总结文档 ([e002054](https://github.com/iamzjt-front-end/git-workflow/commit/e002054))
- 📝 docs: 自动更新测试数量徽章 [skip ci] ([094e8fc](https://github.com/iamzjt-front-end/git-workflow/commit/094e8fc))

### 🔧 Chore

- 🔧 chore(release): 发布 v0.4.0 ([7a636e3](https://github.com/iamzjt-front-end/git-workflow/commit/7a636e3))


## [v0.3.10](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.9...v0.3.10) (2026-01-14)

### ♻️ Refactors

- ♻️ refactor(ai-service): 优化 buildPrompt 函数的参数格式化方式 ([6aec2cd](https://github.com/iamzjt-front-end/git-workflow/commit/6aec2cd))

### 🔧 Chore

- 🔧 chore(release): 发布 v0.3.10 ([0aedd8d](https://github.com/iamzjt-front-end/git-workflow/commit/0aedd8d))


## [v0.3.9](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.8...v0.3.9) (2026-01-14)

### ✨ Features

- ✨ feat(branch): 添加分支描述必填配置功能 ([d0349d0](https://github.com/iamzjt-front-end/git-workflow/commit/d0349d0))

### 📖 Documentation

- 📝 docs: 自动更新测试数量徽章 [skip ci] ([803f00e](https://github.com/iamzjt-front-end/git-workflow/commit/803f00e))
- 📝 docs: 自动更新测试数量徽章 [skip ci] ([3e6a947](https://github.com/iamzjt-front-end/git-workflow/commit/3e6a947))

### ✅ Tests

- ✅ test(commit): 添加提交功能的自动暂存和状态解析测试 ([ce65734](https://github.com/iamzjt-front-end/git-workflow/commit/ce65734))

### 🔧 Chore

- 🔧 chore(release): 发布 v0.3.9 ([80c7d2a](https://github.com/iamzjt-front-end/git-workflow/commit/80c7d2a))
- 💄 style(update-notifier): 优化通知框的边距设置 ([482f2de](https://github.com/iamzjt-front-end/git-workflow/commit/482f2de))


## [v0.3.8](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.7...v0.3.8) (2026-01-14)

### ✨ Features

- ✨ feat(commit): 优化自动暂存和用户选择未暂存文件的逻辑 ([7b7bbc6](https://github.com/iamzjt-front-end/git-workflow/commit/7b7bbc6))

### 🔧 Chore

- 🔧 chore(release): 发布 v0.3.8 ([2eb7011](https://github.com/iamzjt-front-end/git-workflow/commit/2eb7011))


## [v0.3.7](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.6...v0.3.7) (2026-01-12)

### 🔧 Chore

- 🔧 chore(release): 发布 v0.3.7 ([ef0c179](https://github.com/iamzjt-front-end/git-workflow/commit/ef0c179))
- 💄 style(log): 优化代码格式和注释 - 统一使用双引号替换单引号 - 移除多余的空行以提高代码可读性 - 更新注释以更清晰地描述功能和逻辑 - 保持原始提交顺序的日期分组逻辑更为明确 ([7580780](https://github.com/iamzjt-front-end/git-workflow/commit/7580780))


## [v0.3.6](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.5...v0.3.6) (2026-01-12)

### 🔧 Chore

- 🔧 chore(release): 发布 v0.3.6 ([34fe359](https://github.com/iamzjt-front-end/git-workflow/commit/34fe359))
- 💄 style(update): 调整更新通知边框宽度 - 更新通知的边框宽度从 50 调整为 40 - 统一 `update.ts` 和 `update-notifier.ts` 中的边框宽度设置 - 提升界面美观性和一致性 ([9e93815](https://github.com/iamzjt-front-end/git-workflow/commit/9e93815))


## [v0.3.5](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.4...v0.3.5) (2026-01-12)

### 📖 Documentation

- 📝 docs: 自动更新测试数量徽章 [skip ci] ([85ca30e](https://github.com/iamzjt-front-end/git-workflow/commit/85ca30e))

### ⚡ Performance

- ⚡️ perf(update-notifier): 优化更新检查逻辑 - 将检查间隔从 4 小时缩短为 1 小时，已是最新版本时每小时检查一次 - 修改缓存检查逻辑，确保在有新版本时每次都进行后台检查 - 更新测试用例，反映新的检查逻辑和时间限制 - 优化代码结构，提升可读性和维护性 ([59a35ab](https://github.com/iamzjt-front-end/git-workflow/commit/59a35ab))

### 🔧 Chore

- 🔧 chore(release): 发布 v0.3.5 ([1397fbc](https://github.com/iamzjt-front-end/git-workflow/commit/1397fbc))


## [v0.3.4](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.3...v0.3.4) (2026-01-12)

### ✨ Features

- ✨ feat(commit): 增强提交命令的自动暂存功能 - 添加了自动暂存功能，当暂存区为空且有未暂存的更改时会自动暂存 - 更新了提交前的状态检查逻辑，以支持自动暂存 - 优化了用户反馈信息，确保在没有暂存文件时能清晰提示 📝 feat(tag): 修改标签列表显示逻辑 - 限制标签显示数量，从最多 20 个调整为最多 5 个 - 更新了前缀过滤时的输出信息，显示总标签数量 - 优化了单前缀情况下的标签显示逻辑，确保信息简洁明了 ([2311603](https://github.com/iamzjt-front-end/git-workflow/commit/2311603))

### 🔧 Chore

- 🔧 chore(release): 发布 v0.3.4 ([04771bc](https://github.com/iamzjt-front-end/git-workflow/commit/04771bc))


## [v0.3.3](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.2...v0.3.3) (2026-01-12)

### ✨ Features

- ✨ feat(docs): 更新文档以增加帮助命令 - 添加了 [32m  ███████╗     ██╗███████╗██╗  ██╗  ╚══███╔╝     ██║██╔════╝╚██╗██╔╝    ███╔╝      ██║█████╗   ╚███╔╝   ███╔╝  ██   ██║██╔══╝   ██╔██╗  ███████╗╚█████╔╝███████╗██╔╝ ██╗  ╚══════╝ ╚════╝ ╚══════╝╚═╝  ╚═╝ [0m [2m  git-workflow v[33m0.3.2[0m [0m [34m?[39m [1m选择操作:[22m [36m❯ [1] ✨ 创建 feature 分支      [2mgw f[0m[39m   [2] 🐛 创建 hotfix 分支       [2mgw h[0m   [3] 🗑️  删除分支               [2mgw d[0m   [4] 📝 提交代码               [2mgw c[0m   [5] 🏷️  创建 tag               [2mgw t[0m   [6] 🗑️  删除 tag               [2mgw td[0m   [7] ✏️  重命名 tag               [2mgw tu[0m ([b40ab9e](https://github.com/iamzjt-front-end/git-workflow/commit/b40ab9e))
- ✨ feat(husky): 添加 commit message 格式化功能 - 新增 husky 钩子以格式化 commit message - 实现格式化脚本以支持 emoji 自动添加 - 修改 buildPrompt 函数以接受 emoji 选项 ([6c14487](https://github.com/iamzjt-front-end/git-workflow/commit/6c14487))

### 📖 Documentation

- 📝 docs: 自动更新测试数量徽章 [skip ci] ([d6f42c9](https://github.com/iamzjt-front-end/git-workflow/commit/d6f42c9))

### ✅ Tests

- ✅ test: 测试commit message格式化功能 ([8d74ffa](https://github.com/iamzjt-front-end/git-workflow/commit/8d74ffa))

### 🔧 Chore

- 🔧 chore(release): 发布 v0.3.3 ([2c7c89e](https://github.com/iamzjt-front-end/git-workflow/commit/2c7c89e))
- 🔧 chore(husky): 优化 pre-commit 钩子和更新 ROADMAP 文档 - 移除 pre-commit 钩子中的多余注释和退出代码 - 更新 ROADMAP.md 中的测试覆盖描述格式 - 添加 AI 代码审查功能的详细说明 - 增强 GitHub 集成和 diff 显示的描述 - 修正多处格式问题，提升文档可读性 ([817deff](https://github.com/iamzjt-front-end/git-workflow/commit/817deff))
- 🔧 chore: 删除重复的测试文件 ([ee1a680](https://github.com/iamzjt-front-end/git-workflow/commit/ee1a680))
- 🔧 chore: 清理测试文件 ([746aa87](https://github.com/iamzjt-front-end/git-workflow/commit/746aa87))


## [v0.3.2](https://github.com/iamzjt-front-end/git-workflow/compare/v0.3.0...v0.3.2) (2026-01-12)

### ✨ Features

- 更新发布脚本以处理分支分歧 - 添加检查本地和远程分支是否有分歧的逻辑 - 实现快进合并和推送本地提交的提示 - 提供解决冲突的建议和选择策略（rebase 或 merge） - 更新 pre-commit 钩子以确保测试通过后继续提交 - 在提交失败时重新抛出错误以便调用者处理 ([e26a9ab](https://github.com/iamzjt-front-end/git-workflow/commit/e26a9ab))
- 添加功能路线图和Git Wrapped文档 - 创建功能路线图文档，记录即将实现的功能 - 添加Git Wrapped功能概述，提供年度编程回顾的详细信息 - 列出高优先级功能及其技术难点和独特价值 - 详细描述Git Wrapped的核心功能和高级选项 - 更新报告内容的统计信息和年度亮点说明 ([9b868b0](https://github.com/iamzjt-front-end/git-workflow/commit/9b868b0))

### 📖 Documentation

- 自动更新测试数量徽章 [skip ci] ([a60fe90](https://github.com/iamzjt-front-end/git-workflow/commit/a60fe90))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.3.2 ([0bfa582](https://github.com/iamzjt-front-end/git-workflow/commit/0bfa582))
- 🔖 chore(release): 发布 v0.3.1 ([b09035a](https://github.com/iamzjt-front-end/git-workflow/commit/b09035a))
- 更新 README 和版本信息 - 更新 README 中的测试通过数量 - 将版本号从 0.2.24 更新为 0.3.0 - 在 package.json 中添加 node-pager 依赖 - 在 package-lock.json 中添加 node-pager 和 tmp 相关信息 - 删除不再使用的 help.ts 文件 ([b54c37f](https://github.com/iamzjt-front-end/git-workflow/commit/b54c37f))


## [v0.3.0](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.24...v0.3.0) (2026-01-11)

### ✨ Features

- 使用 spawn 替代 exec 以支持用户交互 ([e030046](https://github.com/iamzjt-front-end/git-workflow/commit/e030046))
- 自动处理npm登录，提升发布体验 ([6fdc664](https://github.com/iamzjt-front-end/git-workflow/commit/6fdc664))
- 添加测试环境的console输出抑制功能 ([029503c](https://github.com/iamzjt-front-end/git-workflow/commit/029503c))
- 完善品牌标识系统和AI提交功能 ([c463725](https://github.com/iamzjt-front-end/git-workflow/commit/c463725))
- ✨ feat: 完善品牌标识系统和 README 布局优化 ([7acf6a4](https://github.com/iamzjt-front-end/git-workflow/commit/7acf6a4))
- ✨ feat(docs): 使用 zjex 品牌设计创建 logo 和 favicon ([5d46e4a](https://github.com/iamzjt-front-end/git-workflow/commit/5d46e4a))
- 默认启用详细描述功能 ([375cf14](https://github.com/iamzjt-front-end/git-workflow/commit/375cf14))
- 添加 AI commit 详细描述功能 ([064ec63](https://github.com/iamzjt-front-end/git-workflow/commit/064ec63))
- 添加自动更新测试数量的功能 ([78a15dc](https://github.com/iamzjt-front-end/git-workflow/commit/78a15dc))

### 🐛 Bug Fixes

- 修复GitHub Actions权限问题 ([9e0653e](https://github.com/iamzjt-front-end/git-workflow/commit/9e0653e))
- 修复所有失败测试，实现100%测试通过率 ([0a57031](https://github.com/iamzjt-front-end/git-workflow/commit/0a57031))
- 修复 GitHub Actions 依赖锁文件问题 ([fa56710](https://github.com/iamzjt-front-end/git-workflow/commit/fa56710))
- 修复 GitHub Actions 工作流配置 ([17fc9eb](https://github.com/iamzjt-front-end/git-workflow/commit/17fc9eb))

### 📖 Documentation

- 完善 VitePress 文档站点 ([3191daa](https://github.com/iamzjt-front-end/git-workflow/commit/3191daa))
- 自动更新测试数量徽章 [skip ci] ([2f880ad](https://github.com/iamzjt-front-end/git-workflow/commit/2f880ad))
- 自动更新测试数量徽章 [skip ci] ([2474caa](https://github.com/iamzjt-front-end/git-workflow/commit/2474caa))
- 优化 README 内容并添加 VitePress 文档链接 ([aac071e](https://github.com/iamzjt-front-end/git-workflow/commit/aac071e))

### 🎨 Styles

- 更新文档logo为简洁版本，移除背景渐变 ([5c93207](https://github.com/iamzjt-front-end/git-workflow/commit/5c93207))

### ♻️ Refactors

- 简化 GitHub Actions 工作流配置 ([cf1d76a](https://github.com/iamzjt-front-end/git-workflow/commit/cf1d76a))

### ✅ Tests

- 验证 skip ci 功能 [skip ci] ([bdfdb09](https://github.com/iamzjt-front-end/git-workflow/commit/bdfdb09))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.3.0 ([246b444](https://github.com/iamzjt-front-end/git-workflow/commit/246b444))
- 优化pre-commit钩子，测试失败时提供清晰的解决方案 ([d95f285](https://github.com/iamzjt-front-end/git-workflow/commit/d95f285))
- 修复pre-commit钩子配置，确保测试通过后才提交 ([937dbda](https://github.com/iamzjt-front-end/git-workflow/commit/937dbda))
- 🔧 chore: 优化 .gitignore 配置 ([487f449](https://github.com/iamzjt-front-end/git-workflow/commit/487f449))
- 🔧 fix(docs): 修复 VitePress 图标显示问题 ([35f5111](https://github.com/iamzjt-front-end/git-workflow/commit/35f5111))

### 🤖 CI

- 修复 GitHub Pages 部署配置 ([dcd55f1](https://github.com/iamzjt-front-end/git-workflow/commit/dcd55f1))
- 添加 VitePress 文档自动部署工作流 ([143e5df](https://github.com/iamzjt-front-end/git-workflow/commit/143e5df))


## [v0.2.24](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.23...v0.2.24) (2026-01-09)

### ✨ Features

- 添加 GitHub Actions 测试工作流和 Husky 预提交钩子 ([564fc3a](https://github.com/iamzjt-front-end/git-workflow/commit/564fc3a))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.24 ([f94cc11](https://github.com/iamzjt-front-end/git-workflow/commit/f94cc11))


## [v0.2.23](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.22...v0.2.23) (2026-01-09)

### ✨ Features

- 优化 tags 列表展示格式支持多前缀分列显示 ([bff916a](https://github.com/iamzjt-front-end/git-workflow/commit/bff916a))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.23 ([ad8ca55](https://github.com/iamzjt-front-end/git-workflow/commit/ad8ca55))


## [v0.2.22](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.21...v0.2.22) (2026-01-09)

### ✨ Features

- 添加对 Volta 的支持以选择更新命令 ([c4e2aaf](https://github.com/iamzjt-front-end/git-workflow/commit/c4e2aaf))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.22 ([7e6318f](https://github.com/iamzjt-front-end/git-workflow/commit/7e6318f))


## [v0.2.21](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.20...v0.2.21) (2026-01-09)

### ✨ Features

- 添加代码文档说明和详细注释规范 ([078445b](https://github.com/iamzjt-front-end/git-workflow/commit/078445b))
- 重命名 tag 功能增强与提示优化 ([4eb3c0b](https://github.com/iamzjt-front-end/git-workflow/commit/4eb3c0b))

### ♻️ Refactors

- 优化提交类型选择界面格式化逻辑 ([9b55eb2](https://github.com/iamzjt-front-end/git-workflow/commit/9b55eb2))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.21 ([8437e5a](https://github.com/iamzjt-front-end/git-workflow/commit/8437e5a))


## [v0.2.20](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.19...v0.2.20) (2026-01-09)

### ✨ Features

- 添加清理缓存命令说明并更新版本比较逻辑 ([ac62e0c](https://github.com/iamzjt-front-end/git-workflow/commit/ac62e0c))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.20 ([1ce933a](https://github.com/iamzjt-front-end/git-workflow/commit/1ce933a))


## [v0.2.19](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.18...v0.2.19) (2026-01-09)

### ✨ Features

- 添加检查并更新到最新版本的命令功能 ([26c460f](https://github.com/iamzjt-front-end/git-workflow/commit/26c460f))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.19 ([cd3f2db](https://github.com/iamzjt-front-end/git-workflow/commit/cd3f2db))


## [v0.2.18](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.17...v0.2.18) (2026-01-09)

### ✨ Features

- 优化提交命令的暂存逻辑和用户提示信息 ([6c3c1a6](https://github.com/iamzjt-front-end/git-workflow/commit/6c3c1a6))

### 🐛 Bug Fixes

- -service): 修复构建提示函数中的逻辑错误 ([ff6c942](https://github.com/iamzjt-front-end/git-workflow/commit/ff6c942))

### 📖 Documentation

- 更新 README 文件，增强可读性和内容丰富性 ([fa279f0](https://github.com/iamzjt-front-end/git-workflow/commit/fa279f0))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.18 ([ec63cb3](https://github.com/iamzjt-front-end/git-workflow/commit/ec63cb3))


## [v0.2.17](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.16...v0.2.17) (2026-01-09)

### 🐛 Bug Fixes

- Add spinner render delay and improve version display ([72f05b2](https://github.com/iamzjt-front-end/git-workflow/commit/72f05b2))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.17 ([f445516](https://github.com/iamzjt-front-end/git-workflow/commit/f445516))


## [v0.2.16](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.15...v0.2.16) (2026-01-09)

### 🐛 Bug Fixes

- Adjust line clearing count to 95 for npm publish output ([fe96d3b](https://github.com/iamzjt-front-end/git-workflow/commit/fe96d3b))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.16 ([65fb23e](https://github.com/iamzjt-front-end/git-workflow/commit/65fb23e))


## [v0.2.15](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.14...v0.2.15) (2026-01-09)

### 🐛 Bug Fixes

- Suppress Node warnings and improve output clearing ([a7fdb32](https://github.com/iamzjt-front-end/git-workflow/commit/a7fdb32))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.15 ([92b3329](https://github.com/iamzjt-front-end/git-workflow/commit/92b3329))


## [v0.2.14](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.13...v0.2.14) (2026-01-09)

### 🐛 Bug Fixes

- Simplify npm publish output handling and suppress Node warnings ([cda8a80](https://github.com/iamzjt-front-end/git-workflow/commit/cda8a80))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.14 ([a4e8b73](https://github.com/iamzjt-front-end/git-workflow/commit/a4e8b73))


## [v0.2.13](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.12...v0.2.13) (2026-01-09)

### 🐛 Bug Fixes

- Adjust line clearing count in publish script ([b0dab8d](https://github.com/iamzjt-front-end/git-workflow/commit/b0dab8d))
- 使用 script 命令精确捕获 npm publish 输出 ([00282c4](https://github.com/iamzjt-front-end/git-workflow/commit/00282c4))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.13 ([7285fa0](https://github.com/iamzjt-front-end/git-workflow/commit/7285fa0))


## [v0.2.12](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.11...v0.2.12) (2026-01-09)

### ✨ Features

- 优化发布脚本，精确清除日志输出 ([329029e](https://github.com/iamzjt-front-end/git-workflow/commit/329029e))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.12 ([596c4a1](https://github.com/iamzjt-front-end/git-workflow/commit/596c4a1))


## [v0.2.11](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.10...v0.2.11) (2026-01-09)

### ✨ Features

- 重写发布脚本为 Node.js 版本，添加 loading 动画和更好的交互体验 ([0624ffa](https://github.com/iamzjt-front-end/git-workflow/commit/0624ffa))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.11 ([2eaf682](https://github.com/iamzjt-front-end/git-workflow/commit/2eaf682))


## [v0.2.10](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.9...v0.2.10) (2026-01-09)

### ✨ Features

- Add delete and update tag commands ([db3aa50](https://github.com/iamzjt-front-end/git-workflow/commit/db3aa50))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.10 ([77dc22a](https://github.com/iamzjt-front-end/git-workflow/commit/77dc22a))


## [v0.2.9](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.7...v0.2.9) (2026-01-09)

### ✨ Features

- Refactor publish script with success message display ([cde8f32](https://github.com/iamzjt-front-end/git-workflow/commit/cde8f32))
- 为关键步骤添加结果展示 ([2507f96](https://github.com/iamzjt-front-end/git-workflow/commit/2507f96))
- 优化发布脚本，添加进度显示和步骤标记 ([660282d](https://github.com/iamzjt-front-end/git-workflow/commit/660282d))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.9 ([9ec03e1](https://github.com/iamzjt-front-end/git-workflow/commit/9ec03e1))
- 🔖 chore(release): 发布 v0.2.8 ([74a3627](https://github.com/iamzjt-front-end/git-workflow/commit/74a3627))


## [v0.2.7](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.6...v0.2.7) (2026-01-09)

### ♻️ Refactors

- -notifier): Improve update process and enhance user feedback ([476be3d](https://github.com/iamzjt-front-end/git-workflow/commit/476be3d))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.7 ([a65d917](https://github.com/iamzjt-front-end/git-workflow/commit/a65d917))


## [v0.2.6](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.5...v0.2.6) (2026-01-08)

### ✨ Features

- 添加 AI Commit 功能 ([6a6e23d](https://github.com/iamzjt-front-end/git-workflow/commit/6a6e23d))

### ♻️ Refactors

- 移除内置 token 功能，更新 GitHub Models API 端点 ([258e587](https://github.com/iamzjt-front-end/git-workflow/commit/258e587))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.6 ([6edac85](https://github.com/iamzjt-front-end/git-workflow/commit/6edac85))


## [v0.2.5](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.4...v0.2.5) (2026-01-08)

### 🐛 Bug Fixes

- -notifier): Make update check blocking and handle Ctrl+C properly ([c3e9c53](https://github.com/iamzjt-front-end/git-workflow/commit/c3e9c53))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.5 ([5b18a1c](https://github.com/iamzjt-front-end/git-workflow/commit/5b18a1c))


## [v0.2.4](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.3...v0.2.4) (2026-01-08)

### 🐛 Bug Fixes

- Remove duplicate import and simplify version resolution ([bcccc36](https://github.com/iamzjt-front-end/git-workflow/commit/bcccc36))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.4 ([8b4adfd](https://github.com/iamzjt-front-end/git-workflow/commit/8b4adfd))


## [v0.2.3](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.2...v0.2.3) (2026-01-08)

### ♻️ Refactors

- -notifier): Replace dynamic requires with ES6 imports ([7e06596](https://github.com/iamzjt-front-end/git-workflow/commit/7e06596))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.3 ([9e29271](https://github.com/iamzjt-front-end/git-workflow/commit/9e29271))


## [v0.2.2](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.1...v0.2.2) (2026-01-08)

### ♻️ Refactors

- -notifier): Improve color utility API and update flow ([eb0ade0](https://github.com/iamzjt-front-end/git-workflow/commit/eb0ade0))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.2 ([b2f57dc](https://github.com/iamzjt-front-end/git-workflow/commit/b2f57dc))


## [v0.2.1](https://github.com/iamzjt-front-end/git-workflow/compare/v0.2.0...v0.2.1) (2026-01-08)

### 📖 Documentation

- Add migration guide for scoped package upgrade ([6a21299](https://github.com/iamzjt-front-end/git-workflow/commit/6a21299))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.1 ([456c111](https://github.com/iamzjt-front-end/git-workflow/commit/456c111))


## [v0.2.0](https://github.com/iamzjt-front-end/git-workflow/compare/v0.1.1...v0.2.0) (2026-01-08)

### ✨ Features

- -notifier): Add automatic update checking and notification system ([9e18c75](https://github.com/iamzjt-front-end/git-workflow/commit/9e18c75))

### 🔧 Chore

- 🔖 chore(release): 发布 v0.2.0 ([f1b9343](https://github.com/iamzjt-front-end/git-workflow/commit/f1b9343))


