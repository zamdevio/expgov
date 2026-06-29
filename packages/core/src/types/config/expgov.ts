import type { TierRulesConfig } from './tiers.js';

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
  cacheDir?: string;
  git?: ExpgovGitConfig;
  tiers?: TierRulesConfig;
}

export interface ExpgovConfigOverrides {
  cwd?: string;
  configPath?: string;
  packageName?: string;
  repoRoot?: string;
  cacheDir?: string;
  tsconfig?: string;
  verbose?: boolean;
}
