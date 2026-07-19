import {
  BUILTIN_BUCKET_DEFAULT_POLICY,
  BUILTIN_POLICY_DEFAULTS,
  BUILTIN_POLICY_NAMES,
  CUSTOM_BUCKET_DEFAULT_POLICY,
  CUSTOM_POLICY_DEFAULTS,
} from '../shared/constants/tierPolicies.js';
import type { BuiltinTierPolicyName } from '../types/config/policies.js';
import type {
  ResolvedTierPolicy,
  ResolvedTierPolicyRules,
  TierPolicyDefinition,
  TierPolicyRules,
} from '../types/config/policies.js';
import type { TierRulesConfig } from '../types/config/tiers.js';

export function isBuiltinPolicyName(name: string): name is BuiltinTierPolicyName {
  return (BUILTIN_POLICY_NAMES as readonly string[]).includes(name);
}

function mergePolicyRules(
  base: ResolvedTierPolicyRules,
  override?: TierPolicyRules,
): ResolvedTierPolicyRules {
  return {
    rootFlat: override?.rootFlat ?? base.rootFlat,
  };
}

/** Resolve `tiers.policies` — built-in presets plus custom entries; config overrides merge onto defaults. */
export function resolveTierPolicies(config?: TierRulesConfig): ReadonlyMap<string, ResolvedTierPolicy> {
  const policies = new Map<string, ResolvedTierPolicy>();
  const overrides = config?.policies ?? {};

  for (const name of BUILTIN_POLICY_NAMES) {
    policies.set(name, {
      name,
      rules: mergePolicyRules(BUILTIN_POLICY_DEFAULTS[name], overrides[name]?.rules),
    });
  }

  for (const [name, definition] of Object.entries(overrides)) {
    if (isBuiltinPolicyName(name)) continue;
    policies.set(name, {
      name,
      rules: mergePolicyRules(CUSTOM_POLICY_DEFAULTS, (definition as TierPolicyDefinition)?.rules),
    });
  }

  return policies;
}

export function defaultPolicyForBucket(bucketName: string): string {
  return BUILTIN_BUCKET_DEFAULT_POLICY[bucketName] ?? CUSTOM_BUCKET_DEFAULT_POLICY;
}

export function resolveBucketPolicyRef(bucketName: string, policyRef?: string): string {
  return policyRef ?? defaultPolicyForBucket(bucketName);
}

export function resolvePolicyRules(
  policyName: string,
  policies: ReadonlyMap<string, ResolvedTierPolicy>,
): ResolvedTierPolicyRules {
  return policies.get(policyName)?.rules ?? CUSTOM_POLICY_DEFAULTS;
}

/** Root flat exports are blocked when the resolved policy sets `rootFlat: 'deny'`. */
export function policyViolatesRootFlat(rules: ResolvedTierPolicyRules): boolean {
  return rules.rootFlat === 'deny';
}

export function policyRulesDenyRootFlat(
  policyName: string,
  policies: ReadonlyMap<string, ResolvedTierPolicy>,
): boolean {
  return policyViolatesRootFlat(resolvePolicyRules(policyName, policies));
}

export function listUnknownPolicyRefs(
  entries: readonly { name: string; policy: string }[],
  policies: ReadonlyMap<string, ResolvedTierPolicy>,
): string[] {
  const unknown: string[] = [];
  for (const entry of entries) {
    if (!policies.has(entry.policy)) {
      unknown.push(`tiers.${entry.name} references unknown policy "${entry.policy}" — add tiers.policies.${entry.policy}`);
    }
  }
  return unknown;
}
