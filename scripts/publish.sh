#!/bin/bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
  echo -e "${CYAN}${1}${NC}"
}

print_error() {
  echo -e "${RED}✖ ${1}${NC}"
}

print_dim() {
  echo -e "${DIM}  ${1}${NC}"
}

# 执行步骤（带 loading 动画和完成标记，折叠输出）
run_step() {
  local step_num=$1
  local step_name=$2
  local command=$3
  
  # 显示初始状态
  echo -ne "${BLUE}[${step_num}/${TOTAL_STEPS}]${NC} ${step_name}... "
  
  # 创建临时文件存储输出
  local tmp_output=$(mktemp)
  local tmp_status=$(mktemp)
  
  # 在后台执行命令
  (eval "$command" > "$tmp_output" 2>&1; echo $? > "$tmp_status") &
  local pid=$!
  
  # 显示 loading 动画
  local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local i=0
  
  while kill -0 $pid 2>/dev/null; do
    i=$(( (i+1) % 10 ))
    printf "\r${BLUE}[${step_num}/${TOTAL_STEPS}]${NC} ${step_name}... ${spin:$i:1} "
    sleep 0.1
  done
  
  wait $pid
  local exit_code=$(cat "$tmp_status")
  local output=$(cat "$tmp_output")
  
  # 清理临时文件
  rm -f "$tmp_output" "$tmp_status"
  
  # 显示结果
  if [ "$exit_code" -eq 0 ]; then
    printf "\r${BLUE}[${step_num}/${TOTAL_STEPS}]${NC} ${step_name}... ${GREEN}✅${NC}\n"
    return 0
  else
    printf "\r${BLUE}[${step_num}/${TOTAL_STEPS}]${NC} ${step_name}... ${RED}❌${NC}\n"
    echo ""
    echo -e "${RED}错误详情:${NC}"
    echo "$output"
    return 1
  fi
}

# 执行步骤（显示输出，用于交互式命令）
run_step_interactive() {
  local step_num=$1
  local step_name=$2
  local command=$3
  
  echo -e "${BLUE}[${step_num}/${TOTAL_STEPS}]${NC} ${step_name}..."
  echo ""
  
  if eval "$command"; then
    echo ""
    return 0
  else
    echo -e "${RED}    ❌ 失败${NC}"
    return 1
  fi
}

# 总步骤数
TOTAL_STEPS=11

echo ""
echo -e "${BOLD}🚀 开始发布流程${NC}"
echo ""


# [1] 检查是否在 git 仓库中
if ! run_step "1" "检查 Git 仓库" "git rev-parse --git-dir"; then
  print_error "当前目录不是 git 仓库"
  exit 1
fi

# [2] 检查是否有未提交的更改
echo -ne "${BLUE}[2/${TOTAL_STEPS}]${NC} 检查工作区状态... "
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}❌${NC}"
  echo ""
  print_error "检测到未提交的更改，请先提交后再发布"
  echo ""
  git status --short
  echo ""
  print_info "💡 提示: 可以使用 'gw c' 提交更改"
  exit 1
else
  echo -e "${GREEN}✅${NC}"
fi

# [3] 检查 npm 登录状态
echo -ne "${BLUE}[3/${TOTAL_STEPS}]${NC} 检查 npm 登录状态... "
if ! npm whoami &> /dev/null; then
  echo -e "${RED}❌${NC}"
  print_error "未登录 npm，请先执行: npm login"
  exit 1
fi
NPM_USER=$(npm whoami)
echo -e "${GREEN}✅${NC} ${DIM}(${NPM_USER})${NC}"

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)

# [4] 拉取最新代码
if ! run_step "4" "拉取最新代码" "git pull origin '$CURRENT_BRANCH'"; then
  exit 1
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")

# [5] 交互式选择版本号
echo -e "${BLUE}[5/${TOTAL_STEPS}]${NC} 选择新版本号..."
echo ""

# 记录当前光标位置
tput sc

# 执行版本选择
npm run version

# 获取新版本
NEW_VERSION=$(node -p "require('./package.json').version")

if [[ "$NEW_VERSION" == "$CURRENT_VERSION" ]]; then
  print_info "版本号未更改，已取消发布"
  exit 0
fi

# 恢复光标位置并清除后续内容
tput rc
tput ed

# 显示步骤5完成，带版本信息
echo -e "${BLUE}[5/${TOTAL_STEPS}]${NC} 选择新版本号... ${GREEN}✅${NC} ${DIM}(${CURRENT_VERSION} → ${NEW_VERSION})${NC}"

# [6] 构建项目
if ! run_step "6" "构建项目" "npm run build"; then
  exit 1
fi

# [7] 生成 changelog
if ! run_step "7" "生成 CHANGELOG" "npm run changelog"; then
  exit 1
fi

# [8] 提交版本更新和 changelog
echo -ne "${BLUE}[8/${TOTAL_STEPS}]${NC} 提交版本更新... "
if output=$(git add package.json CHANGELOG.md && git commit -m "🔖 chore(release): 发布 v${NEW_VERSION}" 2>&1); then
  echo -e "${GREEN}✅${NC} ${DIM}(🔖 chore(release): 发布 v${NEW_VERSION})${NC}"
else
  echo -e "${RED}❌${NC}"
  echo ""
  echo -e "${RED}错误详情:${NC}"
  echo "$output"
  exit 1
fi

# [9] 创建 tag
echo -ne "${BLUE}[9/${TOTAL_STEPS}]${NC} 创建 Git Tag... "
if output=$(git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}" 2>&1); then
  echo -e "${GREEN}✅${NC} ${DIM}(v${NEW_VERSION})${NC}"
else
  echo -e "${RED}❌${NC}"
  echo ""
  echo -e "${RED}错误详情:${NC}"
  echo "$output"
  exit 1
fi

# [10] 推送到远程
echo -ne "${BLUE}[10/${TOTAL_STEPS}]${NC} 推送到远程仓库... "
if output=$(git push origin "$CURRENT_BRANCH" && git push origin "v${NEW_VERSION}" 2>&1); then
  echo -e "${GREEN}✅${NC} ${DIM}(${CURRENT_BRANCH}, v${NEW_VERSION})${NC}"
else
  echo -e "${RED}❌${NC}"
  echo ""
  echo -e "${RED}错误详情:${NC}"
  echo "$output"
  exit 1
fi

# [11] 发布到 npm
echo -e "${BLUE}[11/${TOTAL_STEPS}]${NC} 发布到 npm..."
echo ""

# 执行发布（保持交互式，允许 OTP 输入）
if npm publish; then
  echo ""
  echo -e "${BLUE}[11/${TOTAL_STEPS}]${NC} 发布到 npm... ${GREEN}✅${NC}"
else
  echo ""
  echo -e "${BLUE}[11/${TOTAL_STEPS}]${NC} 发布到 npm... ${RED}❌${NC}"
  exit 1
fi

# 成功总结
node scripts/publish-success.js "${NEW_VERSION}"
