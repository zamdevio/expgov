import type { TierPolicy } from '../inventory/tiers.js';
import type { ResolvedTierBucket } from './prefix.js';

export interface ResolvedTierEntry {
  name: string;
  policy: TierPolicy;
  bucket: ResolvedTierBucket;
  precedence: number;
}

export interface ResolvedTierCatalog {
  tag: ResolvedTierTagPolicy;
  entries: readonly ResolvedTierEntry[];
  byName: ReadonlyMap<string, ResolvedTierEntry>;
}

export interface ResolvedTierTagPolicy {
  name: string;
  bucketNames: readonly string[];
  tagPattern: RegExp;
  /** When tag and config both match: `tag` (default) or `config`. */
  precedence: 'tag' | 'config';
}
