#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

try {
  // 运行测试并获取结果
  console.log('🧪 运行测试...');
  const testOutput = execSync('npm test', { encoding: 'utf8' });
  
  // 从测试输出中提取测试数量
  // 移除ANSI颜色代码，然后匹配测试总数
  const cleanOutput = testOutput.replace(/\x1B\[[0-9;]*m/g, '');
  const testMatch = cleanOutput.match(/Tests\s+(\d+)\s+passed\s+\(\d+\)/);
  
  let testCount = 0;
  if (testMatch) {
    testCount = parseInt(testMatch[1]);
  }
  
  if (testCount === 0) {
    console.log('❌ 无法从测试输出中提取测试数量');
    console.log('测试输出:', testOutput.slice(-500)); // 显示最后500字符用于调试
    process.exit(1);
  }
  
  console.log(`✅ 检测到 ${testCount} 个测试用例`);
  
  // 读取README文件
  const readmePath = 'README.md';
  let readmeContent = readFileSync(readmePath, 'utf8');
  
  // 更新测试徽章
  const badgeRegex = /tests-\d+%20passed/g;
  const newBadge = `tests-${testCount}%20passed`;
  
  if (readmeContent.match(badgeRegex)) {
    const oldContent = readmeContent;
    readmeContent = readmeContent.replace(badgeRegex, newBadge);
    
    if (oldContent !== readmeContent) {
      writeFileSync(readmePath, readmeContent);
      console.log(`✅ README中的测试数量已更新为 ${testCount}`);
    } else {
      console.log(`ℹ️  测试数量无变化，保持 ${testCount}`);
    }
  } else {
    console.log('❌ 未找到测试徽章，无法更新');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ 更新测试数量失败:', error.message);
  process.exit(1);
}