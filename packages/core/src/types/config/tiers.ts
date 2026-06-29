import type { TierPolicy } from '../inventory/tiers.js';

export type { TierPolicy };

/** One tier bucket — policy, matchers, and optional classifier precedence. */
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
  /**
   * When both JSDoc tag and config bucket match the same export:
   * - `tag` (default) — JSDoc wins
   * - `config` — tiers.<bucket>.exact/prefix wins
   */
  precedence?: 'tag' | 'config';
}

export interface TierRulesConfig {
  tag?: TierTagConfig;
  stable?: TierBucket;
  internal?: TierBucket;
  advanced?: TierBucket;
  [bucketName: string]: TierBucket | TierTagConfig | undefined;
}
