import { readFileSync, writeFileSync } from "fs";
import { select } from "@inquirer/prompts";
import { colors, theme, divider } from "../utils.js";

interface VersionChoice {
  name: string;
  value: string;
}

function getPackageVersion(): string {
  const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
  return pkg.version || "0.0.0";
}

function setPackageVersion(version: string): void {
  const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
  pkg.version = version;
  writeFileSync("package.json", JSON.stringify(pkg, null, "\t") + "\n");
}

function generateChoices(current: string): VersionChoice[] {
  const preReleaseMatch = current.match(
    /^(\d+)\.(\d+)\.(\d+)-([a-zA-Z]+)\.(\d+)$/
  );
  const match = current.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (preReleaseMatch) {
    const [, majorStr, minorStr, patchStr, preTag, preNumStr] = preReleaseMatch;
    const major = Number(majorStr);
    const minor = Number(minorStr);
    const patch = Number(patchStr);
    const preNum = Number(preNumStr);
    const baseVersion = `${major}.${minor}.${patch}`;

    return [
      {
        name: `pre     → ${baseVersion}-${preTag}.${preNum + 1}`,
        value: `${baseVersion}-${preTag}.${preNum + 1}`,
      },
      { name: `release → ${baseVersion}`, value: baseVersion },
      {
        name: `patch   → ${major}.${minor}.${patch + 1}`,
        value: `${major}.${minor}.${patch + 1}`,
      },
      {
        name: `minor   → ${major}.${minor + 1}.0`,
        value: `${major}.${minor + 1}.0`,
      },
      { name: `major   → ${major + 1}.0.0`, value: `${major + 1}.0.0` },
    ];
  }

  if (match) {
    const [, majorStr, minorStr, patchStr] = match;
    const major = Number(majorStr);
    const minor = Number(minorStr);
    const patch = Number(patchStr);

    return [
      {
        name: `patch   → ${major}.${minor}.${patch + 1}`,
        value: `${major}.${minor}.${patch + 1}`,
      },
      {
        name: `minor   → ${major}.${minor + 1}.0`,
        value: `${major}.${minor + 1}.0`,
      },
      { name: `major   → ${major + 1}.0.0`, value: `${major + 1}.0.0` },
      {
        name: `alpha   → ${major}.${minor}.${patch + 1}-alpha.1`,
        value: `${major}.${minor}.${patch + 1}-alpha.1`,
      },
      {
        name: `beta    → ${major}.${minor}.${patch + 1}-beta.1`,
        value: `${major}.${minor}.${patch + 1}-beta.1`,
      },
      {
        name: `rc      → ${major}.${minor}.${patch + 1}-rc.1`,
        value: `${major}.${minor}.${patch + 1}-rc.1`,
      },
    ];
  }

  // fallback
  return [
    { name: `patch   → 0.0.1`, value: "0.0.1" },
    { name: `minor   → 0.1.0`, value: "0.1.0" },
    { name: `major   → 1.0.0`, value: "1.0.0" },
  ];
}

export async function release(): Promise<void> {
  const currentVersion = getPackageVersion();
  console.log(colors.yellow(`当前版本: ${currentVersion}`));

  divider();

  const choices = generateChoices(currentVersion);
  choices.push({ name: "取消", value: "__cancel__" });

  const nextVersion = await select({
    message: "选择新版本:",
    choices,
    theme,
  });

  if (nextVersion === "__cancel__") {
    console.log(colors.yellow("已取消"));
    return;
  }

  setPackageVersion(nextVersion);

  divider();
  console.log(
    colors.green(`✓ 版本号已更新: ${currentVersion} → ${nextVersion}`)
  );
}
