import type { TierRulesConfig } from './tiers.js';
import type { ExpgovCacheInput } from './cache.js';

export interface ExpgovCoreConfig {
  dir: string;
  packageJson?: string;
  rootBarrel: string;
  subpaths: Record<string, string>;
}

export interface ExpgovGitConfig {
  tagPattern?: string;
  timelineBarrelPath?: string;
}

/** Stable project identity — paths, package name, tier rules. */
export interface ExpgovConfig {
  packageName: string;
  repoRoot?: string;
  core: ExpgovCoreConfig;
  tsconfig?: string;
  /**
   * Snapshot cache — `true` / `false` shorthand or `{ enabled?, dir? }`.
   */
  cache?: ExpgovCacheInput;
  git?: ExpgovGitConfig;
  tiers?: TierRulesConfig;
}

export interface ExpgovConfigOverrides {
  cwd?: string;
  configPath?: string;
  packageName?: string;
  repoRoot?: string;
  /** CLI override — merges into `cache.dir`. */
  cacheDir?: string;
  tsconfig?: string;
  verbose?: boolean;
}
