import type { TierPolicy } from '../inventory/tiers.js';
import type { TierPolicyDefinition } from './policies.js';

export type { TierPolicy };
export type { TierPolicyDefinition, TierPolicyRules, TierRootFlatRule } from './policies.js';

/** One tier bucket — policy, matchers, and optional classifier precedence. */
export interface TierBucket {
  /** Policy name — built-in preset or key under `tiers.policies`. */
  policy?: string;
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
  /** Policy registry — override built-in presets or define custom policies for buckets. */
  policies?: Record<string, TierPolicyDefinition>;
  stable?: TierBucket;
  internal?: TierBucket;
  advanced?: TierBucket;
  [bucketName: string]: TierBucket | TierTagConfig | Record<string, TierPolicyDefinition> | undefined;
}
