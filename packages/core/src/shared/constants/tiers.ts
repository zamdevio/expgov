import type { DeclaredTierTag, TierBucketName } from '../../types/inventory/tiers.js';
import {
  DEFAULT_ADVANCED_PREFIXES,
  DEFAULT_INTERNAL_PREFIXES,
  DEFAULT_STABLE_PREFIXES,
} from '../../config/tiers.js';

/** Default JSDoc tag name (without `@`) for export tier declarations. */
export const DEFAULT_TIER_TAG_NAME = 'sdkTier' as const;

/** Max custom tag literals in `tiers.tag.values`. */
export const MAX_TIER_TAG_VALUES = 10 as const;

export const DEFAULT_TIER_TAG_VALUES: Readonly<Record<string, DeclaredTierTag>> = {
  stable: 'stable',
  internal: 'internal',
  advanced: 'advanced',
};

export const TIER_BUCKET_ORDER: readonly {
  name: TierBucketName;
  tier: DeclaredTierTag;
  defaults: readonly string[];
}[] = [
  { name: 'internal', tier: 'internal', defaults: DEFAULT_INTERNAL_PREFIXES },
  { name: 'advanced', tier: 'advanced', defaults: DEFAULT_ADVANCED_PREFIXES },
  { name: 'stable', tier: 'stable', defaults: DEFAULT_STABLE_PREFIXES },
];
