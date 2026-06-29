import type { ResolvedTierCatalog } from '../../config/tierCatalog.js';
import type { ResolvedTierTagPolicy } from '../../config/tierTag.js';
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

export type { ExpgovConfig };
