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
    currentTag,
  )})\n\n`;

  // 获取该版本的提交
  const commits = execSync(
    `git log ${previousTag}..${currentTag} --pretty=format:"%s|%h" --no-merges`,
    {
      encoding: "utf8",
      env: { ...process.env, LANG: "zh_CN.UTF-8", LC_ALL: "zh_CN.UTF-8" },
    },
  )
    .trim()
    .split("\n")
    .filter(Boolean);

  // 格式化消息：处理多行内容（用 - 分隔的子任务）
  const formatMessage = (msg, commitLink) => {
    const parts = msg.split(" - ");
    if (parts.length === 1) {
      // 没有子任务，直接返回
      return `${msg} ${commitLink}`;
    }
    // 有子任务，主标题后面加 commit hash，子任务换行缩进
    const mainTitle = parts[0];
    const subTasks = parts.slice(1);
    return `${mainTitle} ${commitLink}\n  - ${subTasks.join("\n  - ")}`;
  };

  // 直接输出提交信息，不分组
  commits.forEach((commit) => {
    const [message, hash] = commit.split("|");
    const link = `([${hash}](https://github.com/iamzjt-front-end/git-workflow/commit/${hash}))`;
    changelog += `- ${formatMessage(message, link)}\n`;
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
