#!/bin/bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
  echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
  echo -e "${GREEN}✔ ${1}${NC}"
}

print_error() {
  echo -e "${RED}✖ ${1}${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_step() {
  echo -e "${CYAN}▶ ${1}${NC}"
}

# 错误处理
trap 'handle_error $? $LINENO' ERR

handle_error() {
  print_error "发布失败 (退出码: $1, 行号: $2)"
  
  if [[ -n "$NEW_VERSION" ]]; then
    print_warning "正在回滚更改..."
    
    # 回滚 package.json
    if [[ -f "package.json.backup" ]]; then
      mv package.json.backup package.json
      print_info "已恢复 package.json"
    fi
    
    # 删除本地 tag
    if git tag -l "v${NEW_VERSION}" | grep -q "v${NEW_VERSION}"; then
      git tag -d "v${NEW_VERSION}" 2>/dev/null || true
      print_info "已删除本地 tag"
    fi
    
    # 回滚 commit
    if git log -1 --pretty=%B | grep -q "chore(release): v${NEW_VERSION}"; then
      git reset --hard HEAD~1 2>/dev/null || true
      print_info "已回滚 commit"
    fi
  fi
  
  exit 1
}

# 检查命令是否存在
check_command() {
  if ! command -v "$1" &> /dev/null; then
    print_error "未找到命令: $1"
    exit 1
  fi
}

# 检查必要的命令
check_command git
check_command node
check_command npm

# Dry-run 模式
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  print_warning "Dry-run 模式：仅预览，不会实际执行"
  echo ""
fi

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  print_error "当前目录不是 git 仓库"
  exit 1
fi

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
  print_error "有未提交的更改，请先提交或暂存"
  git status --short
  exit 1
fi

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
  print_warning "当前分支是 ${CURRENT_BRANCH}，建议在 main/master 分支发布"
  read -p "是否继续? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "已取消"
    exit 0
  fi
fi

# 检查 npm 登录状态
print_step "检查 npm 登录状态..."
if ! npm whoami &> /dev/null; then
  echo -e "${YELLOW}⚠️  未登录 npm，需要先登录${NC}"
  echo -e "${DIM}正在为你打开 npm 登录...${NC}"
  echo ""
  
  # 执行 npm login
  if npm login; then
    echo ""
    echo -e "${GREEN}✅ npm 登录成功！${NC}"
    echo -e "${DIM}继续发布流程...${NC}"
    echo ""
    
    # 重新检查登录状态
    if ! npm whoami &> /dev/null; then
      print_error "登录验证失败，请手动执行: npm login"
      exit 1
    fi
  else
    print_error "npm 登录失败，请手动执行: npm login"
    exit 1
  fi
fi
NPM_USER=$(npm whoami)
print_success "已登录 npm (用户: ${NPM_USER})"

# 拉取最新代码
print_step "拉取最新代码..."
if [[ "$DRY_RUN" == false ]]; then
  # 检查是否有远程更新
  git fetch origin "$CURRENT_BRANCH"
  
  # 检查本地和远程是否有分歧
  LOCAL_COMMIT=$(git rev-parse HEAD)
  REMOTE_COMMIT=$(git rev-parse "origin/$CURRENT_BRANCH")
  
  if [[ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]]; then
    print_warning "检测到本地和远程分支有分歧"
    
    # 检查是否可以快进
    if git merge-base --is-ancestor HEAD "origin/$CURRENT_BRANCH"; then
      print_info "远程有新提交，正在快进合并..."
      git pull origin "$CURRENT_BRANCH" --ff-only
    elif git merge-base --is-ancestor "origin/$CURRENT_BRANCH" HEAD; then
      print_info "本地有新提交，需要推送到远程"
      print_warning "建议先推送本地提交再发布"
      read -p "是否继续发布? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消，请先推送本地提交: git push origin $CURRENT_BRANCH"
        exit 0
      fi
    else
      print_warning "本地和远程分支有冲突，需要解决分歧"
      echo ""
      echo "建议的解决方案："
      echo "1. 使用 rebase: git pull origin $CURRENT_BRANCH --rebase"
      echo "2. 使用 merge:  git pull origin $CURRENT_BRANCH --no-rebase"
      echo ""
      read -p "选择解决方案 (1=rebase, 2=merge, q=退出): " -n 1 -r
      echo
      
      case $REPLY in
        1)
          print_info "使用 rebase 策略合并..."
          if git pull origin "$CURRENT_BRANCH" --rebase; then
            print_success "Rebase 成功"
          else
            print_error "Rebase 失败，请手动解决冲突后重新运行发布脚本"
            exit 1
          fi
          ;;
        2)
          print_info "使用 merge 策略合并..."
          if git pull origin "$CURRENT_BRANCH" --no-rebase; then
            print_success "Merge 成功"
          else
            print_error "Merge 失败，请手动解决冲突后重新运行发布脚本"
            exit 1
          fi
          ;;
        *)
          print_info "已取消，请手动解决分支分歧后重新运行"
          exit 0
          ;;
      esac
    fi
  else
    print_info "本地和远程分支已同步"
  fi
fi
print_success "代码已更新"

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "当前版本: ${CURRENT_VERSION}"

# 检查远程是否已存在该版本的 tag
check_tag_exists() {
  local tag="v$1"
  if git ls-remote --tags origin | grep -q "refs/tags/${tag}$"; then
    return 0
  else
    return 1
  fi
}

# 计算下一个版本号
calculate_next_version() {
  local current=$1
  local type=$2
  
  IFS='.' read -r major minor patch <<< "$current"
  
  case $type in
    patch)
      echo "${major}.${minor}.$((patch + 1))"
      ;;
    minor)
      echo "${major}.$((minor + 1)).0"
      ;;
    major)
      echo "$((major + 1)).0.0"
      ;;
  esac
}

# 验证版本号格式
validate_version() {
  if [[ ! $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$ ]]; then
    return 1
  fi
  return 0
}

# 选择版本类型
echo ""
print_step "选择新版本号"
echo ""

PATCH_VERSION=$(calculate_next_version "$CURRENT_VERSION" "patch")
MINOR_VERSION=$(calculate_next_version "$CURRENT_VERSION" "minor")
MAJOR_VERSION=$(calculate_next_version "$CURRENT_VERSION" "major")

echo -e "  ${GREEN}1)${NC} patch  ${CYAN}${CURRENT_VERSION}${NC} → ${GREEN}${PATCH_VERSION}${NC}  (bug 修复)"
echo -e "  ${GREEN}2)${NC} minor  ${CYAN}${CURRENT_VERSION}${NC} → ${GREEN}${MINOR_VERSION}${NC}  (新功能)"
echo -e "  ${GREEN}3)${NC} major  ${CYAN}${CURRENT_VERSION}${NC} → ${GREEN}${MAJOR_VERSION}${NC}  (破坏性更新)"
echo -e "  ${GREEN}4)${NC} custom (自定义版本号)"
echo -e "  ${RED}5)${NC} cancel (取消发布)"
echo ""

while true; do
  read -p "请选择 (1-5): " -n 1 -r VERSION_TYPE
  echo ""
  
  if [[ "$VERSION_TYPE" =~ ^[1-5]$ ]]; then
    break
  else
    print_error "无效的选择，请输入 1-5"
  fi
done

# 备份 package.json
cp package.json package.json.backup

case $VERSION_TYPE in
  1)
    NEW_VERSION=$PATCH_VERSION
    ;;
  2)
    NEW_VERSION=$MINOR_VERSION
    ;;
  3)
    NEW_VERSION=$MAJOR_VERSION
    ;;
  4)
    while true; do
      read -p "请输入版本号 (如 1.0.0 或 1.0.0-beta.1): " CUSTOM_VERSION
      
      if [[ -z "$CUSTOM_VERSION" ]]; then
        print_error "版本号不能为空"
        continue
      fi
      
      if ! validate_version "$CUSTOM_VERSION"; then
        print_error "版本号格式无效，请使用语义化版本格式 (如 1.0.0 或 1.0.0-beta.1)"
        continue
      fi
      
      NEW_VERSION=$CUSTOM_VERSION
      break
    done
    ;;
  5)
    rm package.json.backup
    print_info "已取消发布"
    exit 0
    ;;
esac

# 更新 package.json 中的版本号
if [[ "$DRY_RUN" == false ]]; then
  npm version "$NEW_VERSION" --no-git-tag-version > /dev/null 2>&1 || {
    print_error "更新版本号失败"
    mv package.json.backup package.json
    exit 1
  }
fi

print_success "版本号已更新: ${CURRENT_VERSION} → ${NEW_VERSION}"

# 检查版本号是否已存在
if check_tag_exists "$NEW_VERSION"; then
  print_error "版本 v${NEW_VERSION} 已存在于远程仓库"
  mv package.json.backup package.json
  exit 1
fi

# 运行测试（如果有）
if grep -q '"test"' package.json; then
  print_step "运行测试..."
  if [[ "$DRY_RUN" == false ]]; then
    npm test || {
      print_error "测试失败"
      mv package.json.backup package.json
      exit 1
    }
  fi
  print_success "测试通过"
fi

# 构建项目
print_step "构建项目..."
if [[ "$DRY_RUN" == false ]]; then
  npm run build
fi
print_success "构建完成"

# 检查构建产物
if [[ "$DRY_RUN" == false ]]; then
  if [[ ! -f "dist/index.js" ]]; then
    print_error "构建产物不存在: dist/index.js"
    mv package.json.backup package.json
    exit 1
  fi
  print_success "构建产物验证通过"
fi

# 生成 changelog
print_step "生成 CHANGELOG..."
if [[ "$DRY_RUN" == false ]]; then
  npm run changelog
fi
print_success "CHANGELOG 已更新"

# 预览 changelog
if [[ "$DRY_RUN" == false ]]; then
  echo ""
  print_info "最新的 CHANGELOG 内容:"
  echo "----------------------------------------"
  head -n 30 CHANGELOG.md
  echo "----------------------------------------"
  echo ""
  read -p "是否继续发布? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "已取消"
    mv package.json.backup package.json
    exit 0
  fi
fi

# 删除备份
rm package.json.backup

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  print_success "Dry-run 完成！以下是将要执行的操作："
  echo ""
  echo "  1. 提交更改: package.json, package-lock.json, CHANGELOG.md"
  echo "  2. Commit 信息: 🔖 chore(release): v${NEW_VERSION}"
  echo "  3. 创建 tag: v${NEW_VERSION}"
  echo "  4. 推送到 GitHub: ${CURRENT_BRANCH} + v${NEW_VERSION}"
  echo "  5. 发布到 npm: @zjex/git-workflow@${NEW_VERSION}"
  echo ""
  print_info "执行 'npm run release' 进行实际发布"
  exit 0
fi

# 最终确认
echo ""
print_warning "即将发布版本 v${NEW_VERSION} 到 npm 和 GitHub"
read -p "确认发布? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  print_info "已取消"
  exit 0
fi

# 提交更改
print_step "提交更改..."
git add package.json package-lock.json CHANGELOG.md
git commit -m "🔖 chore(release): v${NEW_VERSION}"
print_success "更改已提交"

# 创建 tag
print_step "创建 tag: v${NEW_VERSION}..."
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"
print_success "Tag 已创建"

# 推送到 GitHub
print_step "推送到 GitHub..."
git push origin "$CURRENT_BRANCH"
git push origin "v${NEW_VERSION}"
print_success "已推送到 GitHub"

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
print_info "提示: 可以在 GitHub 上创建 Release 并添加发布说明"
echo "      https://github.com/iamzjt-front-end/git-workflow/releases/new?tag=v${NEW_VERSION}"
