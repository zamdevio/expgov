import type { GitCommitMeta } from '../types/git/commit-meta.js';
import { runGit } from './run.js';

export function gitCommitMeta(sha: string): GitCommitMeta | null {
  const result = runGit(['show', '-s', '--format=%cI|%aI', sha]);
  if (!result.ok || !result.stdout) return null;
  const [commitDate, authorDate] = result.stdout.trim().split('|');
  if (!commitDate) return null;
  return { commitDate, authorDate: authorDate || undefined };
}
