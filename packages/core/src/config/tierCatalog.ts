import { resolveBucket } from './tiers.js';
import {
  resolveBucketPolicyRef,
  resolvePolicyRules,
  resolveTierPolicies,
} from './tierPolicy.js';
import { resolveTierTagPolicy } from './tierTag.js';
import {
  BUILTIN_BUCKET_NAMES,
  BUILTIN_DEFAULT_PREFIXES,
  DEFAULT_BUCKET_PRECEDENCE,
  TIER_POLICIES_CONFIG_KEY,
  TIER_TAG_CONFIG_KEY,
} from '../shared/constants/tiers.js';
import type { ResolvedTierCatalog, ResolvedTierEntry } from '../types/config/catalog.js';
import type { ResolvedTierPolicy } from '../types/config/policies.js';
import type { TierBucket, TierRulesConfig, TierTagConfig } from '../types/config/tiers.js';

function isTierTagConfig(value: TierBucket | TierTagConfig | undefined): value is TierTagConfig {
  if (!value || typeof value !== 'object') return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((k) => k === 'name' || k === 'precedence');
}

function isTierBucketConfig(
  value: TierBucket | TierTagConfig | undefined,
): value is TierBucket {
  if (!value || typeof value !== 'object') return false;
  if (isTierTagConfig(value)) return false;
  return true;
}

function collectBucketConfigs(config?: TierRulesConfig): Map<string, TierBucket> {
  const buckets = new Map<string, TierBucket>();

  for (const name of BUILTIN_BUCKET_NAMES) {
    buckets.set(name, config?.[name] ?? {});
  }

  if (!config) return buckets;

  for (const [key, value] of Object.entries(config)) {
    if (key === TIER_TAG_CONFIG_KEY || key === TIER_POLICIES_CONFIG_KEY || buckets.has(key)) continue;
    if (isTierBucketConfig(value)) {
      buckets.set(key, value);
    }
  }

  return buckets;
}

function resolvePrecedence(name: string, bucket: TierBucket, customIndex: number): number {
  if (typeof bucket.precedence === 'number' && Number.isFinite(bucket.precedence)) {
    return bucket.precedence;
  }
  if (name in DEFAULT_BUCKET_PRECEDENCE) return DEFAULT_BUCKET_PRECEDENCE[name]!;
  return 50 + customIndex;
}

function buildEntry(
  name: string,
  bucketConfig: TierBucket,
  defaultPrefixes: readonly string[],
  customIndex: number,
  policies: ReadonlyMap<string, ResolvedTierPolicy>,
): ResolvedTierEntry {
  const policy = resolveBucketPolicyRef(name, bucketConfig.policy);
  return {
    name,
    policy,
    policyRules: resolvePolicyRules(policy, policies),
    bucket: resolveBucket(bucketConfig, defaultPrefixes),
    precedence: resolvePrecedence(name, bucketConfig, customIndex),
  };
}

export function resolveTierCatalog(config?: TierRulesConfig): ResolvedTierCatalog {
  const policies = resolveTierPolicies(config);
  const bucketConfigs = collectBucketConfigs(config);
  const customNames = [...bucketConfigs.keys()]
    .filter((name) => !BUILTIN_BUCKET_NAMES.includes(name as (typeof BUILTIN_BUCKET_NAMES)[number]))
    .sort();

  const entries: ResolvedTierEntry[] = [];

  for (const [index, name] of customNames.entries()) {
    const bucketConfig = bucketConfigs.get(name)!;
    entries.push(buildEntry(name, bucketConfig, [], index, policies));
  }

  for (const name of BUILTIN_BUCKET_NAMES) {
    const bucketConfig = bucketConfigs.get(name)!;
    entries.push(buildEntry(name, bucketConfig, BUILTIN_DEFAULT_PREFIXES[name], 0, policies));
  }

  entries.sort((a, b) => a.precedence - b.precedence || a.name.localeCompare(b.name));

  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const bucketNames = [...byName.keys()].sort();

  return {
    tag: resolveTierTagPolicy(config?.tag, bucketNames),
    entries,
    byName,
    policies,
  };
}
