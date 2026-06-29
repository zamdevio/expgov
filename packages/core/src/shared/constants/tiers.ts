/** Default JSDoc tag name (without `@`) for export tier declarations. */
export const DEFAULT_TIER_TAG_NAME = 'sdkTier' as const;

/** Detect regex metacharacters in tier prefix config entries. */
export const REGEX_METACHAR = /[\^$[\]()+?|\\]/;

export const DEFAULT_STABLE_PREFIXES = [
  'run',
  'build',
  'emit',
  'get',
  'set',
  'reset',
  'is',
  'format',
  'resolve',
  'walk',
  'directory',
  'normalize',
  'rethrow',
  'noop',
] as const;

export const DEFAULT_INTERNAL_PREFIXES = ['^internal[A-Z_]', 'Internal$'] as const;

export const DEFAULT_ADVANCED_PREFIXES = [
  '^experimental[A-Z_]',
  '^beta[A-Z_]',
  '^advanced[A-Z_]',
  'Unsafe$',
] as const;

export const BUILTIN_BUCKET_NAMES = ['stable', 'internal', 'advanced'] as const;

/** `tiers` config key for JSDoc tag settings (not a bucket). */
export const TIER_TAG_CONFIG_KEY = 'tag';

export const DEFAULT_BUCKET_PRECEDENCE: Record<string, number> = {
  internal: 10,
  advanced: 20,
  stable: 100,
};

export const BUILTIN_DEFAULT_PREFIXES: Record<(typeof BUILTIN_BUCKET_NAMES)[number], readonly string[]> = {
  stable: DEFAULT_STABLE_PREFIXES,
  internal: DEFAULT_INTERNAL_PREFIXES,
  advanced: DEFAULT_ADVANCED_PREFIXES,
};
