import {
  DEFAULT_ADVANCED_PREFIXES,
  DEFAULT_INTERNAL_PREFIXES,
  DEFAULT_STABLE_PREFIXES,
} from './tiers.js';
import { DEFAULT_CACHE_DIR } from './cache.js';

/** Commented tier examples for `expgov init --rich`. */
export const RICH_INIT_TIER_HINTS = {
  stable: {
    exact: ['MyPublicType', 'RESULT_API_VERSION'],
    prefix: [...DEFAULT_STABLE_PREFIXES],
  },
  internal: {
    exact: ['internalDebugHook'],
    prefix: [...DEFAULT_INTERNAL_PREFIXES],
  },
  advanced: {
    exact: ['betaFeature'],
    prefix: [...DEFAULT_ADVANCED_PREFIXES],
  },
} as const;

export const RICH_INIT_CACHE_HINT = {
  enabled: true,
  dir: DEFAULT_CACHE_DIR,
} as const;

/** Commented policy registry examples for `expgov init --rich`. */
export const RICH_INIT_POLICIES_HINT = [
  'Built-ins (public, maintainer, experimental, preview, deprecated) ship with defaults.',
  'Override rules or add custom policies buckets reference via `policy:`.',
  "public: { rules: { rootFlat: 'allow' } },",
  "partnerApi: { rules: { rootFlat: 'deny' } },",
] as const;
