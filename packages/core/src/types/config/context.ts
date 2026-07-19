import type { ResolvedTierCatalog, ResolvedTierTagPolicy } from './catalog.js';
import type { ExpgovConfig } from './expgov.js';
import type { TierRulesConfig } from './tiers.js';

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
  /** Repo-relative path to `expgov.config.ts` when present. */
  configRepoPath: string | null;
  /** Resolved from `cache.enabled` (default true). */
  cacheEnabled: boolean;
  tsconfigPath: string;
  subpathSourceEntries: Record<string, string>;
  git: {
    tagPattern: string;
    timelineBarrelPath: string;
    /** Raw `git.compatBaseline` from config (unresolved). */
    compatBaseline?: string;
  };
  tierCatalog: ResolvedTierCatalog;
  /** Raw tier buckets from config (for provenance labels). */
  tierConfig: TierRulesConfig;
  /** Resolved JSDoc tier-tag matcher (`tiers.tag`). */
  tierTag: ResolvedTierTagPolicy;
}

export type { ExpgovConfig };
