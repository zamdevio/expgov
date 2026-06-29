/** One tier bucket — literal names and prefix/regex matchers. */
export interface TierBucket {
  exact?: string[];
  prefix?: string[];
}

/**
 * JSDoc export-tier tag policy under `tiers.tag`.
 * Override tag name (default `sdkTier`) and map up to 10 literals → stable | internal | advanced.
 */
export interface TierTagConfig {
  name?: string;
  values?: Partial<Record<string, 'stable' | 'internal' | 'advanced'>>;
}

export interface TierRulesConfig {
  tag?: TierTagConfig;
  stable?: TierBucket;
  internal?: TierBucket;
  advanced?: TierBucket;
}

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

export type { ResolvedTierBucket, ResolvedTierRules } from './tiers.js';
import type { ResolvedTierRules } from './tiers.js';
import type { ResolvedTierTagPolicy } from './tierTag.js';

export interface ProjectContext {
  packageName: string;
  repoRoot: string;
  coreDir: string;
  corePkgPath: string;
  coreSrcPrefix: string;
  rootIndexRepoPath: string;
  rootIndexAbsPath: string;
  exportsCacheRoot: string;
  exportsMetaPath: string;
  tsconfigPath: string;
  subpathSourceEntries: Record<string, string>;
  git: {
    tagPattern: string;
    timelineBarrelPath: string;
  };
  tiers: ResolvedTierRules;
  /** Raw tier buckets from config (for provenance labels). */
  tierConfig: TierRulesConfig;
  /** Resolved JSDoc tier-tag matcher (`tiers.tag`). */
  tierTag: ResolvedTierTagPolicy;
}
