import type { TierPolicy } from '../types/inventory/tiers.js';

const BUILTIN_DEFAULT_POLICIES: Record<string, TierPolicy> = {
  stable: 'public',
  internal: 'maintainer',
  advanced: 'experimental',
};

export function defaultPolicyForBucket(bucketName: string): TierPolicy {
  return BUILTIN_DEFAULT_POLICIES[bucketName] ?? 'preview';
}

export function resolveBucketPolicy(bucketName: string, policy?: TierPolicy): TierPolicy {
  return policy ?? defaultPolicyForBucket(bucketName);
}

/** Root flat exports are blocked when policy is maintainer or experimental. */
export function policyViolatesRootFlat(policy: TierPolicy): boolean {
  return policy === 'maintainer' || policy === 'experimental';
}
