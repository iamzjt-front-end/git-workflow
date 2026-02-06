#!/usr/bin/env node

/**
 * 更新 README 中的版本号显示
 * 用于发布时同步更新示例中的版本号
 */

import { readFileSync, writeFileSync } from 'fs';

const version = process.argv[2];

if (!version) {
  console.error('❌ 请提供版本号参数');
  console.error('用法: node scripts/update-version-badge.js 0.5.0');
  process.exit(1);
}

try {
  const readmePath = 'README.md';
  let content = readFileSync(readmePath, 'utf8');

  // 更新示例中的版本号 (git-workflow v0.x.x)
  const versionRegex = /git-workflow v\d+\.\d+\.\d+/g;
  const newVersion = `git-workflow v${version}`;

  if (content.match(versionRegex)) {
    const oldContent = content;
    content = content.replace(versionRegex, newVersion);

    if (oldContent !== content) {
      writeFileSync(readmePath, content);
      console.log(`✅ README 版本号已更新为 v${version}`);
    } else {
      console.log(`ℹ️  版本号无变化，保持 v${version}`);
    }
  } else {
    console.log('⚠️  未找到版本号模式，跳过更新');
  }

} catch (error) {
  console.error('❌ 更新版本号失败:', error.message);
  process.exit(1);
}
