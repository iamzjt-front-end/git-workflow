#!/bin/bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
  echo -e "${CYAN}ℹ ${1}${NC}"
}

print_success() {
  echo -e "${GREEN}✔ ${1}${NC}"
}

print_error() {
  echo -e "${RED}✖ ${1}${NC}"
}

print_step() {
  echo -e "${CYAN}▶ ${1}${NC}"
}

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  print_error "当前目录不是 git 仓库"
  exit 1
fi

# 检查 npm 登录状态
print_step "检查 npm 登录状态..."
if ! npm whoami &> /dev/null; then
  print_error "未登录 npm，请先执行: npm login"
  exit 1
fi
NPM_USER=$(npm whoami)
print_success "已登录 npm (用户: ${NPM_USER})"

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
print_info "当前分支: ${CURRENT_BRANCH}"

# 检查是否有未提交的更改（发布前的脏工作区）
if [[ -n $(git status --porcelain) ]]; then
  git status --short
  
  # 使用 Node.js 交互式提示
  STASH_CHOICE=$(node scripts/stash-prompt.js)
  EXIT_CODE=$?
  
  # 如果用户按了 Ctrl+C (退出码 130)
  if [[ $EXIT_CODE -eq 130 ]]; then
    print_info "已取消发布"
    exit 0
  fi
  
  case $STASH_CHOICE in
    stash)
      print_step "暂存未提交的更改..."
      git stash push -m "Auto stash before publish at $(date '+%Y-%m-%d %H:%M:%S')"
      print_success "更改已暂存"
      
      # 设置标志，发布完成后恢复
      STASHED=true
      ;;
    cancel)
      print_info "已取消发布"
      exit 0
      ;;
    *)
      print_error "操作已取消"
      exit 1
      ;;
  esac
fi

# 拉取最新代码
print_step "拉取最新代码..."
git pull origin "$CURRENT_BRANCH"
print_success "代码已更新"

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "当前版本: ${CURRENT_VERSION}"

# 交互式选择版本号
print_step "选择新版本号..."
npm run version

# 获取新版本
NEW_VERSION=$(node -p "require('./package.json').version")

if [[ "$NEW_VERSION" == "$CURRENT_VERSION" ]]; then
  print_info "版本号未更改，已取消发布"
  exit 0
fi

print_success "版本号已更新: ${CURRENT_VERSION} → ${NEW_VERSION}"

# 构建项目
print_step "构建项目..."
npm run build
print_success "构建完成"

# 生成 changelog
print_step "生成 CHANGELOG..."
npm run changelog
print_success "CHANGELOG 已更新"

# 提交更改
print_step "提交更改..."
git add package.json package-lock.json CHANGELOG.md dist
git commit -m "🔖 chore(release): v${NEW_VERSION}"
print_success "更改已提交"

# 创建 tag
print_step "创建 tag: v${NEW_VERSION}..."
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"
print_success "Tag 已创建"

# 推送到远程
print_step "推送到远程仓库..."
git push origin "$CURRENT_BRANCH"
git push origin "v${NEW_VERSION}"
print_success "已推送到远程"

# 发布到 npm
print_step "发布到 npm..."
npm publish
print_success "已发布到 npm"

echo ""
print_success "🎉 发布成功！"
echo ""
echo "版本: v${NEW_VERSION}"
echo "GitHub: https://github.com/iamzjt-front-end/git-workflow/releases/tag/v${NEW_VERSION}"
echo "npm: https://www.npmjs.com/package/@zjex/git-workflow/v/${NEW_VERSION}"
echo ""

# 如果之前暂存了更改，询问是否恢复
if [[ "$STASHED" == true ]]; then
  RESTORE_CHOICE=$(node scripts/restore-prompt.js)
  
  if [[ "$RESTORE_CHOICE" == "yes" ]]; then
    print_step "恢复暂存的更改..."
    git stash pop
    print_success "更改已恢复"
  else
    print_info "更改仍在 stash 中，可以稍后使用 'git stash pop' 恢复"
  fi
fi
