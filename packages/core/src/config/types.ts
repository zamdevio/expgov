import type { TierPolicy } from '../types/inventory/tiers.js';

export type { TierPolicy };
export interface TierBucket {
  /** Governance policy preset (built-ins default when omitted). */
  policy?: TierPolicy;
  /** Lower runs first in the classifier (built-ins have defaults). */
  precedence?: number;
  exact?: string[];
  prefix?: string[];
}

/**
 * JSDoc export-tier tag policy under `tiers.tag`.
 * Tag literals must match configured bucket names (e.g. `@sdkTier stable`).
 */
export interface TierTagConfig {
  name?: string;
}

export interface TierRulesConfig {
  tag?: TierTagConfig;
  stable?: TierBucket;
  internal?: TierBucket;
  advanced?: TierBucket;
  [bucketName: string]: TierBucket | TierTagConfig | undefined;
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

export type { ResolvedTierBucket } from './tiers.js';
import type { ResolvedTierCatalog } from './tierCatalog.js';
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
  tierCatalog: ResolvedTierCatalog;
  /** Raw tier buckets from config (for provenance labels). */
  tierConfig: TierRulesConfig;
  /** Resolved JSDoc tier-tag matcher (`tiers.tag`). */
  tierTag: ResolvedTierTagPolicy;
}
