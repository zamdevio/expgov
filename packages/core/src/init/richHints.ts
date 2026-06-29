import {
  DEFAULT_ADVANCED_PREFIXES,
  DEFAULT_INTERNAL_PREFIXES,
  DEFAULT_STABLE_PREFIXES,
} from '../shared/constants/tiers.js';
import { DEFAULT_CACHE_DIR } from '../shared/constants/cache.js';

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
