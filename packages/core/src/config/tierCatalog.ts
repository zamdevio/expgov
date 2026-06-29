import {
  DEFAULT_ADVANCED_PREFIXES,
  DEFAULT_INTERNAL_PREFIXES,
  DEFAULT_STABLE_PREFIXES,
  resolveBucket,
  type ResolvedTierBucket,
} from './tiers.js';
import { resolveBucketPolicy } from './tierPolicy.js';
import { resolveTierTagPolicy, type ResolvedTierTagPolicy } from './tierTag.js';
import type { TierBucket, TierRulesConfig, TierTagConfig } from './types.js';
import type { TierPolicy } from '../types/inventory/tiers.js';

const BUILTIN_BUCKET_NAMES = ['stable', 'internal', 'advanced'] as const;
const TAG_CONFIG_KEY = 'tag';

const BUILTIN_DEFAULT_PREFIXES: Record<(typeof BUILTIN_BUCKET_NAMES)[number], readonly string[]> = {
  stable: DEFAULT_STABLE_PREFIXES,
  internal: DEFAULT_INTERNAL_PREFIXES,
  advanced: DEFAULT_ADVANCED_PREFIXES,
};

const DEFAULT_PRECEDENCE: Record<string, number> = {
  internal: 10,
  advanced: 20,
  stable: 100,
};

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

function isTierTagConfig(value: TierBucket | TierTagConfig | undefined): value is TierTagConfig {
  if (!value || typeof value !== 'object') return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((k) => k === 'name');
}

function collectBucketConfigs(config?: TierRulesConfig): Map<string, TierBucket> {
  const buckets = new Map<string, TierBucket>();

  for (const name of BUILTIN_BUCKET_NAMES) {
    buckets.set(name, config?.[name] ?? {});
  }

  if (!config) return buckets;

  for (const [key, value] of Object.entries(config)) {
    if (key === TAG_CONFIG_KEY || buckets.has(key)) continue;
    if (value && typeof value === 'object' && !isTierTagConfig(value)) {
      buckets.set(key, value);
    }
  }

  return buckets;
}

function resolvePrecedence(name: string, bucket: TierBucket, customIndex: number): number {
  if (typeof bucket.precedence === 'number' && Number.isFinite(bucket.precedence)) {
    return bucket.precedence;
  }
  if (name in DEFAULT_PRECEDENCE) return DEFAULT_PRECEDENCE[name]!;
  return 50 + customIndex;
}

export function resolveTierCatalog(config?: TierRulesConfig): ResolvedTierCatalog {
  const bucketConfigs = collectBucketConfigs(config);
  const customNames = [...bucketConfigs.keys()]
    .filter((name) => !BUILTIN_BUCKET_NAMES.includes(name as (typeof BUILTIN_BUCKET_NAMES)[number]))
    .sort();

  const entries: ResolvedTierEntry[] = [];

  for (const [index, name] of customNames.entries()) {
    const bucketConfig = bucketConfigs.get(name)!;
    entries.push({
      name,
      policy: resolveBucketPolicy(name, bucketConfig.policy),
      bucket: resolveBucket(bucketConfig, []),
      precedence: resolvePrecedence(name, bucketConfig, index),
    });
  }

  for (const name of BUILTIN_BUCKET_NAMES) {
    const bucketConfig = bucketConfigs.get(name)!;
    entries.push({
      name,
      policy: resolveBucketPolicy(name, bucketConfig.policy),
      bucket: resolveBucket(bucketConfig, BUILTIN_DEFAULT_PREFIXES[name]),
      precedence: resolvePrecedence(name, bucketConfig, 0),
    });
  }

  entries.sort((a, b) => a.precedence - b.precedence || a.name.localeCompare(b.name));

  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const bucketNames = [...byName.keys()].sort();

  return {
    tag: resolveTierTagPolicy(config?.tag, bucketNames),
    entries,
    byName,
  };
}
