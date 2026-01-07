#!/usr/bin/env node --no-warnings

import { colors, checkGitRepo, type BranchType } from "./utils.js";
import { createBranch, deleteBranch } from "./commands/branch.js";
import { listTags, createTag } from "./commands/tag.js";
import { showHelp } from "./commands/help.js";

interface ParsedArgs {
  baseBranch: string | null;
}

function parseArgs(args: string[]): ParsedArgs {
  let baseBranch: string | null = null;
  for (const arg of args) {
    if (arg.startsWith("--base=")) {
      baseBranch = arg.slice(7);
    }
  }
  return { baseBranch };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const { baseBranch } = parseArgs(args);

  switch (command) {
    case "feature":
    case "feat":
    case "f":
      checkGitRepo();
      await createBranch("feature", baseBranch);
      break;
    case "hotfix":
    case "fix":
    case "h":
      checkGitRepo();
      await createBranch("hotfix", baseBranch);
      break;
    case "delete":
    case "del":
    case "d":
      checkGitRepo();
      await deleteBranch(args[1]);
      break;
    case "tags":
    case "ts":
      checkGitRepo();
      await listTags(args[1]);
      break;
    case "tag":
    case "t":
      checkGitRepo();
      await createTag(args[1]);
      break;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      showHelp();
      break;
    default:
      console.log(colors.red(`未知命令: ${command}`));
      showHelp();
      process.exit(1);
  }
}

main().catch((e: Error) => {
  if (e.name === "ExitPromptError") {
    console.log(colors.yellow("\n已取消"));
  } else {
    console.error(e);
  }
});
