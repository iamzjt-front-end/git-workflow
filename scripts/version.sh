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

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")

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

# 显示当前版本
echo ""
print_info "当前版本: ${CURRENT_VERSION}"
echo ""

# 计算版本选项
PATCH_VERSION=$(calculate_next_version "$CURRENT_VERSION" "patch")
MINOR_VERSION=$(calculate_next_version "$CURRENT_VERSION" "minor")
MAJOR_VERSION=$(calculate_next_version "$CURRENT_VERSION" "major")

# 显示选项
echo "选择新版本号:"
echo ""
echo -e "  ${GREEN}1)${NC} patch  ${CYAN}${CURRENT_VERSION}${NC} → ${GREEN}${PATCH_VERSION}${NC}  (bug 修复)"
echo -e "  ${GREEN}2)${NC} minor  ${CYAN}${CURRENT_VERSION}${NC} → ${GREEN}${MINOR_VERSION}${NC}  (新功能)"
echo -e "  ${GREEN}3)${NC} major  ${CYAN}${CURRENT_VERSION}${NC} → ${GREEN}${MAJOR_VERSION}${NC}  (破坏性更新)"
echo -e "  ${GREEN}4)${NC} custom (自定义版本号)"
echo -e "  ${RED}5)${NC} cancel (取消)"
echo ""

# 读取用户选择
while true; do
  read -p "请选择 (1-5): " -n 1 -r VERSION_TYPE
  echo ""
  
  if [[ "$VERSION_TYPE" =~ ^[1-5]$ ]]; then
    break
  else
    print_error "无效的选择，请输入 1-5"
  fi
done

# 处理选择
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
    print_info "已取消"
    exit 0
    ;;
esac

# 更新版本号
echo ""
print_info "正在更新版本号到 ${NEW_VERSION}..."

npm version "$NEW_VERSION" --no-git-tag-version > /dev/null 2>&1 || {
  print_error "更新版本号失败"
  exit 1
}

print_success "版本号已更新: ${CURRENT_VERSION} → ${NEW_VERSION}"
echo ""
