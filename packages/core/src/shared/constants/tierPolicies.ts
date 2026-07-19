import type { ResolvedTierPolicyRules } from '../../types/config/policies.js';
import type { BuiltinTierPolicyName } from '../../types/config/policies.js';

export const BUILTIN_POLICY_NAMES = [
  'public',
  'maintainer',
  'experimental',
  'preview',
  'deprecated',
] as const satisfies readonly BuiltinTierPolicyName[];

export const BUILTIN_POLICY_DEFAULTS: Record<BuiltinTierPolicyName, ResolvedTierPolicyRules> = {
  public: { rootFlat: 'allow' },
  maintainer: { rootFlat: 'deny' },
  experimental: { rootFlat: 'deny' },
  preview: { rootFlat: 'allow' },
  deprecated: { rootFlat: 'allow' },
};

/** Default rules for custom policy names not listed in built-ins. */
export const CUSTOM_POLICY_DEFAULTS: ResolvedTierPolicyRules = {
  rootFlat: 'allow',
};

export const BUILTIN_BUCKET_DEFAULT_POLICY: Record<string, BuiltinTierPolicyName> = {
  stable: 'public',
  internal: 'maintainer',
  advanced: 'experimental',
};

export const CUSTOM_BUCKET_DEFAULT_POLICY: BuiltinTierPolicyName = 'preview';
