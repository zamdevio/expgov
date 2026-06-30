import type { ResolvedTierPolicy, ResolvedTierPolicyRules } from './policies.js';
import type { ResolvedTierBucket } from './prefix.js';

export interface ResolvedTierEntry {
  name: string;
  /** Policy name referenced by this bucket (`tiers.<bucket>.policy`). */
  policy: string;
  /** Resolved rules for `policy` after merging config overrides. */
  policyRules: ResolvedTierPolicyRules;
  bucket: ResolvedTierBucket;
  precedence: number;
}

export interface ResolvedTierCatalog {
  tag: ResolvedTierTagPolicy;
  entries: readonly ResolvedTierEntry[];
  byName: ReadonlyMap<string, ResolvedTierEntry>;
  policies: ReadonlyMap<string, ResolvedTierPolicy>;
}

export interface ResolvedTierTagPolicy {
  name: string;
  bucketNames: readonly string[];
  tagPattern: RegExp;
  /** When tag and config both match: `tag` (default) or `config`. */
  precedence: 'tag' | 'config';
}
