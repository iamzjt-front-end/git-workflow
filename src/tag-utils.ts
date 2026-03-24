export type TagLookupStrategy = "all" | "latest";

export function isValidVersionTag(tag: string): boolean {
  return /\d/.test(tag);
}

export function extractTagPrefix(tag: string): string {
  return tag.replace(/\d.*/, "");
}

export function normalizeTagLookupStrategy(
  value?: string,
): TagLookupStrategy {
  return value === "all" ? "all" : "latest";
}

export function getLatestTagCommand(
  prefix: string,
  strategy: TagLookupStrategy,
): string {
  if (strategy === "latest") {
    return `git for-each-ref --sort=-creatordate --format="%(refname:short)" "refs/tags/${prefix}*"`;
  }

  return `git tag -l "${prefix}*" --sort=-v:refname`;
}

export function shouldFetchAllTagsForCreateTag(
  strategy: TagLookupStrategy,
  prefix?: string,
): boolean {
  if (strategy === "all") {
    return true;
  }

  return !prefix;
}
