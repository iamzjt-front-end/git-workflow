#!/usr/bin/env node

/**
 * 手动生成 CHANGELOG.md
 * 直接使用 git log，避免 changelogen 的编码问题
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";

const args = process.argv.slice(2);

console.log(`📝 生成 CHANGELOG...`);

// 获取所有 tags
const tags = execSync("git tag -l --sort=-version:refname", {
  encoding: "utf8",
  env: { ...process.env, LANG: "zh_CN.UTF-8", LC_ALL: "zh_CN.UTF-8" },
})
  .trim()
  .split("\n");

let changelog = "# Changelog\n\n";

// 为每个版本生成变更日志
for (let i = 0; i < tags.length; i++) {
  const currentTag = tags[i];
  const previousTag = tags[i + 1];

  if (!previousTag) break;

  changelog += `## [${currentTag}](https://github.com/iamzjt-front-end/git-workflow/compare/${previousTag}...${currentTag}) (${getTagDate(
    currentTag
  )})\n\n`;

  // 获取该版本的提交
  const commits = execSync(
    `git log ${previousTag}..${currentTag} --pretty=format:"%s|%h" --no-merges`,
    {
      encoding: "utf8",
      env: { ...process.env, LANG: "zh_CN.UTF-8", LC_ALL: "zh_CN.UTF-8" },
    }
  )
    .trim()
    .split("\n")
    .filter(Boolean);

  // 按类型分组
  const groups = {
    "✨ Features": [],
    "🐛 Bug Fixes": [],
    "📖 Documentation": [],
    "🎨 Styles": [],
    "♻️ Refactors": [],
    "⚡ Performance": [],
    "✅ Tests": [],
    "🔧 Chore": [],
    "🤖 CI": [],
  };

  commits.forEach((commit) => {
    const [message, hash] = commit.split("|");
    const link = `([${hash}](https://github.com/iamzjt-front-end/git-workflow/commit/${hash}))`;

    if (message.match(/^(feat|✨)/i)) {
      groups["✨ Features"].push(
        `- ${message.replace(/^(feat|✨)[:(]\w*\)?:?\s*/i, "")} ${link}`
      );
    } else if (message.match(/^(fix|🐛)/i)) {
      groups["🐛 Bug Fixes"].push(
        `- ${message.replace(/^(fix|🐛)[:(]\w*\)?:?\s*/i, "")} ${link}`
      );
    } else if (message.match(/^(docs|📖|📝)/i)) {
      groups["📖 Documentation"].push(
        `- ${message.replace(/^(docs|📖|📝)[:(]\w*\)?:?\s*/i, "")} ${link}`
      );
    } else if (message.match(/^(style|🎨)/i)) {
      groups["🎨 Styles"].push(
        `- ${message.replace(/^(style|🎨)[:(]\w*\)?:?\s*/i, "")} ${link}`
      );
    } else if (message.match(/^(refactor|♻️)/i)) {
      groups["♻️ Refactors"].push(
        `- ${message.replace(/^(refactor|♻️)[:(]\w*\)?:?\s*/i, "")} ${link}`
      );
    } else if (message.match(/^(perf|⚡)/i)) {
      groups["⚡ Performance"].push(
        `- ${message.replace(/^(perf|⚡)[:(]\w*\)?:?\s*/i, "")} ${link}`
      );
    } else if (message.match(/^(test|✅)/i)) {
      groups["✅ Tests"].push(
        `- ${message.replace(/^(test|✅)[:(]\w*\)?:?\s*/i, "")} ${link}`
      );
    } else if (message.match(/^(chore|🔧|🏡)/i)) {
      groups["🔧 Chore"].push(
        `- ${message.replace(/^(chore|🔧|🏡)[:(]\w*\)?:?\s*/i, "")} ${link}`
      );
    } else if (message.match(/^(ci|🤖)/i)) {
      groups["🤖 CI"].push(
        `- ${message.replace(/^(ci|🤖)[:(]\w*\)?:?\s*/i, "")} ${link}`
      );
    } else {
      groups["🔧 Chore"].push(`- ${message} ${link}`);
    }
  });

  // 输出各分组
  Object.entries(groups).forEach(([title, items]) => {
    if (items.length > 0) {
      changelog += `### ${title}\n\n`;
      items.forEach((item) => {
        changelog += `${item}\n`;
      });
      changelog += "\n";
    }
  });

  changelog += "\n";
}

// 写入文件（添加 UTF-8 BOM 以确保编辑器正确识别编码）
const BOM = "\uFEFF";
writeFileSync("CHANGELOG.md", BOM + changelog, { encoding: "utf8" });
console.log("✅ CHANGELOG.md 生成成功！");

function getTagDate(tag) {
  try {
    const date = execSync(`git log -1 --format=%ai ${tag}`, {
      encoding: "utf8",
      env: { ...process.env, LANG: "zh_CN.UTF-8", LC_ALL: "zh_CN.UTF-8" },
    }).trim();
    return date.split(" ")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}
