import { gitRevParse } from './ref.js';
import { listVersionTags } from './log.js';

/** Map full commit SHAs to version tags (`git.tagPattern`) pointing at that commit. */
export function indexVersionTagsByCommit(): Map<string, string[]> {
  const byCommit = new Map<string, string[]>();
  for (const tag of listVersionTags()) {
    let sha: string;
    try {
      sha = gitRevParse(tag);
    } catch {
      continue;
    }
    const tags = byCommit.get(sha) ?? [];
    tags.push(tag);
    byCommit.set(sha, tags);
  }
  return byCommit;
}

export function versionTagsForCommit(
  sha: string,
  index: ReadonlyMap<string, string[]>,
): string[] {
  return index.get(sha) ?? [];
}
