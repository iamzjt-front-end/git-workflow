#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync } from "fs";
import ora from "ora";
import boxen from "boxen";

const colors = {
  blue: (str) => `\x1b[34m${str}\x1b[0m`,
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  cyan: (str) => `\x1b[36m${str}\x1b[0m`,
  dim: (str) => `\x1b[2m${str}\x1b[0m`,
  bold: (str) => `\x1b[1m${str}\x1b[0m`,
};

const TOTAL_STEPS = 11;

function exec(command, silent = false) {
  try {
    return execSync(command, {
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    });
  } catch (error) {
    if (!silent) throw error;
    return null;
  }
}

async function runStep(stepNum, stepName, command) {
  const spinner = ora({
    text: `${colors.blue(`[${stepNum}/${TOTAL_STEPS}]`)} ${stepName}...`,
    spinner: "dots",
  }).start();

  // 给 spinner 一点时间渲染
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    execSync(command, { encoding: "utf-8", stdio: "pipe" });
    spinner.succeed(
      `${colors.blue(`[${stepNum}/${TOTAL_STEPS}]`)} ${stepName}`
    );
    return true;
  } catch (error) {
    spinner.fail(`${colors.blue(`[${stepNum}/${TOTAL_STEPS}]`)} ${stepName}`);
    console.log("");
    console.log(colors.red("错误详情:"));
    console.log(error.stdout || error.message);
    return false;
  }
}

async function main() {
  console.log("");
  console.log(colors.bold("🚀 开始发布流程"));
  console.log("");

  // [1] 检查 Git 仓库
  if (!(await runStep(1, "检查 Git 仓库", "git rev-parse --git-dir"))) {
    console.log(colors.red("✖ 当前目录不是 git 仓库"));
    process.exit(1);
  }

  // [2] 检查工作区状态
  const spinner2 = ora({
    text: `${colors.blue("[2/11]")} 检查工作区状态...`,
    spinner: "dots",
  }).start();

  await new Promise((resolve) => setTimeout(resolve, 100));

  const status = exec("git status --porcelain", true);
  if (status && status.trim()) {
    spinner2.fail(`${colors.blue("[2/11]")} 检查工作区状态`);
    console.log("");
    console.log(colors.red("✖ 检测到未提交的更改，请先提交后再发布"));
    console.log("");
    console.log(status);
    console.log("");
    console.log(colors.cyan("💡 提示: 可以使用 'gw c' 提交更改"));
    process.exit(1);
  }
  spinner2.succeed(`${colors.blue("[2/11]")} 检查工作区状态`);

  // [3] 检查 npm 登录状态
  const spinner3 = ora({
    text: `${colors.blue("[3/11]")} 检查 npm 登录状态...`,
    spinner: "dots",
  }).start();

  await new Promise((resolve) => setTimeout(resolve, 100));

  const npmUser = exec("npm whoami", true);
  if (!npmUser) {
    spinner3.fail(`${colors.blue("[3/11]")} 检查 npm 登录状态`);
    console.log(colors.yellow("⚠️ 未登录 npm，需要先登录"));
    console.log(colors.dim("正在为你打开 npm 登录..."));
    console.log("");
    
    try {
      // 使用 spawn 而不是 exec，以便用户可以交互
      const { spawn } = require("child_process");
      const loginProcess = spawn("npm", ["login"], {
        stdio: "inherit", // 继承父进程的 stdio，允许用户交互
        shell: true
      });
      
      // 等待登录完成
      await new Promise((resolve, reject) => {
        loginProcess.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`npm login 失败，退出码: ${code}`));
          }
        });
        
        loginProcess.on("error", (error) => {
          reject(error);
        });
      });
      
      console.log("");
      console.log(colors.green("✅ npm 登录成功！"));
      console.log(colors.dim("继续发布流程..."));
      console.log("");
      
      // 重新检查登录状态
      const newNpmUser = exec("npm whoami", true);
      if (!newNpmUser) {
        console.log(colors.red("✖ 登录验证失败，请手动执行: npm login"));
        process.exit(1);
      }
      
      spinner3.succeed(
        `${colors.blue("[3/11]")} 检查 npm 登录状态 ${colors.dim(
          `(${newNpmUser.trim()})`
        )}`
      );
    } catch (error) {
      console.log(colors.red("✖ npm 登录失败:"), error.message);
      console.log(colors.dim("请手动执行: npm login"));
      process.exit(1);
    }
  } else {
    spinner3.succeed(
      `${colors.blue("[3/11]")} 检查 npm 登录状态 ${colors.dim(
        `(${npmUser.trim()})`
      )}`
    );
  }

  // 获取当前分支
  const currentBranch = exec("git branch --show-current", true).trim();

  // [4] 拉取最新代码
  if (!(await runStep(4, "拉取最新代码", `git pull origin ${currentBranch}`))) {
    process.exit(1);
  }

  // 获取当前版本
  const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
  const currentVersion = pkg.version;

  // [5] 选择新版本号
  const spinner5 = ora({
    text: `${colors.blue("[5/11]")} 选择新版本号...`,
    spinner: "dots",
  }).start();

  // 停止 spinner，保持交互式
  spinner5.stop();

  console.log(`${colors.blue("[5/11]")} 选择新版本号...`);
  console.log("");

  try {
    execSync("npm run version", { stdio: "inherit" });
  } catch (error) {
    console.log("");
    console.log(colors.yellow("已取消发布"));
    process.exit(0);
  }

  // 获取新版本
  const newPkg = JSON.parse(readFileSync("./package.json", "utf-8"));
  const newVersion = newPkg.version;

  if (newVersion === currentVersion) {
    console.log(colors.cyan("版本号未更改，已取消发布"));
    process.exit(0);
  }

  // 清除上面的输出，重新显示步骤5
  // npm run version 输出：
  // - "> @zjex/git-workflow@x.x.x version" (1行)
  // - "> node scripts/version.js" (1行)
  // - 空行 (1行)
  // - "? 选择版本升级类型:" (1行)
  // - 选项列表 (4行: patch, minor, major, custom)
  // - 空行 (1行)
  // - "✔ 版本已更新: x.x.x → x.x.x" (1行)
  // - 空行 (1行)
  // 加上我们自己的：
  // - "[5/11] 选择新版本号..." (1行)
  // - 空行 (1行)
  // 总共约 14 行
  const linesToClear = 14;

  for (let i = 0; i < linesToClear; i++) {
    process.stdout.write("\x1b[1A"); // 向上移动一行
    process.stdout.write("\x1b[2K"); // 清除整行
  }

  console.log(
    `${colors.green("✔")} ${colors.blue("[5/11]")} 选择新版本号 ${colors.dim(
      `(${currentVersion} → ${newVersion})`
    )}`
  );

  // [6] 构建项目
  if (!(await runStep(6, "构建项目", "npm run build"))) {
    process.exit(1);
  }

  // [7] 生成 CHANGELOG
  if (!(await runStep(7, "生成 CHANGELOG", "npm run changelog"))) {
    process.exit(1);
  }

  // [8] 提交版本更新
  const spinner8 = ora({
    text: `${colors.blue("[8/11]")} 提交版本更新...`,
    spinner: "dots",
  }).start();

  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    execSync("git add package.json CHANGELOG.md", { stdio: "pipe" });
    execSync(`git commit -m "🔖 chore(release): 发布 v${newVersion}"`, {
      stdio: "pipe",
    });
    spinner8.succeed(
      `${colors.blue("[8/11]")} 提交版本更新 ${colors.dim(
        `(🔖 chore(release): 发布 v${newVersion})`
      )}`
    );
  } catch (error) {
    spinner8.fail(`${colors.blue("[8/11]")} 提交版本更新`);
    console.log("");
    console.log(colors.red("错误详情:"));
    console.log(error.message);
    process.exit(1);
  }

  // [9] 创建 Git Tag
  const spinner9 = ora({
    text: `${colors.blue("[9/11]")} 创建 Git Tag...`,
    spinner: "dots",
  }).start();

  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    execSync(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, {
      stdio: "pipe",
    });
    spinner9.succeed(
      `${colors.blue("[9/11]")} 创建 Git Tag ${colors.dim(`(v${newVersion})`)}`
    );
  } catch (error) {
    spinner9.fail(`${colors.blue("[9/11]")} 创建 Git Tag`);
    console.log("");
    console.log(colors.red("错误详情:"));
    console.log(error.message);
    process.exit(1);
  }

  // [10] 推送到远程仓库
  const spinner10 = ora({
    text: `${colors.blue("[10/11]")} 推送到远程仓库...`,
    spinner: "dots",
  }).start();

  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    execSync(`git push origin ${currentBranch}`, { stdio: "pipe" });
    execSync(`git push origin v${newVersion}`, { stdio: "pipe" });
    spinner10.succeed(
      `${colors.blue("[10/11]")} 推送到远程仓库 ${colors.dim(
        `(${currentBranch}, v${newVersion})`
      )}`
    );
  } catch (error) {
    spinner10.fail(`${colors.blue("[10/11]")} 推送到远程仓库`);
    console.log("");
    console.log(colors.red("错误详情:"));
    console.log(error.message);
    process.exit(1);
  }

  // [11] 发布到 npm
  const spinner11 = ora({
    text: `${colors.blue("[11/11]")} 发布到 npm...`,
    spinner: "dots",
  }).start();

  // 停止 spinner，保持交互式
  spinner11.stop();

  console.log(`${colors.blue("[11/11]")} 发布到 npm...`);
  console.log("");

  try {
    execSync("npm publish", { stdio: "inherit" });

    // 清除 npm publish 的所有输出
    // 根据实际测试，需要删除约 95 行
    const linesToClear = 95;

    for (let i = 0; i < linesToClear; i++) {
      process.stdout.write("\x1b[1A");
      process.stdout.write("\x1b[2K");
    }

    console.log(`${colors.green("✔")} ${colors.blue("[11/11]")} 发布到 npm`);
  } catch (error) {
    console.log("");
    console.log(`${colors.red("✖")} ${colors.blue("[11/11]")} 发布到 npm`);
    process.exit(1);
  }

  // 成功总结
  console.log("");
  console.log(
    boxen(
      [
        colors.bold("🎉 发布成功！"),
        "",
        `${colors.cyan("版本:")} ${colors.bold(`v${newVersion}`)}`,
      ].join("\n"),
      {
        padding: { top: 1, bottom: 1, left: 8, right: 8 },
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: "round",
        borderColor: "green",
        align: "center",
      }
    )
  );

  console.log(
    `  ${colors.dim("🔗")} ${colors.cyan("GitHub:")} ${colors.dim(
      "\x1b[4mhttps://github.com/iamzjt-front-end/git-workflow/releases/tag/v" +
        newVersion +
        "\x1b[0m"
    )}`
  );
  console.log(
    `  ${colors.dim("📦")} ${colors.cyan("npm:")} ${colors.dim(
      "\x1b[4mhttps://www.npmjs.com/package/@zjex/git-workflow\x1b[0m"
    )}`
  );
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
