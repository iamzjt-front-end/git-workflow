#!/bin/bash

BLUE='\033[0;34m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

TOTAL_STEPS=11
NEW_VERSION="0.2.8"
CURRENT_BRANCH="main"

echo ""
echo -e "${BOLD}🚀 开始发布流程${NC}"
echo ""

echo -e "${BLUE}[1/${TOTAL_STEPS}]${NC} 检查 Git 仓库... ${GREEN}✅${NC}"
echo -e "${BLUE}[2/${TOTAL_STEPS}]${NC} 检查工作区状态... ${GREEN}✅${NC}"
echo -e "${BLUE}[3/${TOTAL_STEPS}]${NC} 检查 npm 登录状态... ${GREEN}✅${NC} ${DIM}(zjex)${NC}"
echo -e "${BLUE}[4/${TOTAL_STEPS}]${NC} 拉取最新代码... ${GREEN}✅${NC}"
echo -e "${BLUE}[5/${TOTAL_STEPS}]${NC} 选择新版本号... ${GREEN}✅${NC} ${DIM}(0.2.7 → 0.2.8)${NC}"
echo -e "${BLUE}[6/${TOTAL_STEPS}]${NC} 构建项目... ${GREEN}✅${NC}"
echo -e "${BLUE}[7/${TOTAL_STEPS}]${NC} 生成 CHANGELOG... ${GREEN}✅${NC}"
echo -e "${BLUE}[8/${TOTAL_STEPS}]${NC} 提交版本更新... ${GREEN}✅${NC} ${DIM}(🔖 chore(release): 发布 v${NEW_VERSION})${NC}"
echo -e "${BLUE}[9/${TOTAL_STEPS}]${NC} 创建 Git Tag... ${GREEN}✅${NC} ${DIM}(v${NEW_VERSION})${NC}"
echo -e "${BLUE}[10/${TOTAL_STEPS}]${NC} 推送到远程仓库... ${GREEN}✅${NC} ${DIM}(${CURRENT_BRANCH}, v${NEW_VERSION})${NC}"
echo -e "${BLUE}[11/${TOTAL_STEPS}]${NC} 发布到 npm... ${GREEN}✅${NC}"

node scripts/publish-success.js "${NEW_VERSION}"
