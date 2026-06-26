import type { TierBucket, TierRulesConfig } from './types.js';

export type PrefixMatcher =
  | { kind: 'prefix'; value: string }
  | { kind: 'regex'; pattern: RegExp };

export interface ResolvedTierBucket {
  exact: ReadonlySet<string>;
  matchers: readonly PrefixMatcher[];
}

export interface ResolvedTierRules {
  stable: ResolvedTierBucket;
  internal: ResolvedTierBucket;
  advanced: ResolvedTierBucket;
  /** True when deprecated flat tier keys were present in config. */
  usedLegacyTierKeys: boolean;
}

const DEFAULT_STABLE_PREFIXES = [
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

const DEFAULT_INTERNAL_PREFIXES = ['^internal[A-Z_]', 'Internal$'] as const;
const DEFAULT_ADVANCED_PREFIXES = [
  '^experimental[A-Z_]',
  '^beta[A-Z_]',
  '^advanced[A-Z_]',
  'Unsafe$',
] as const;

const REGEX_METACHAR = /[\^$[\]()+?|\\]/;

/** Compile a config prefix entry as literal startsWith or RegExp. */
export function compilePrefixMatcher(source: string): PrefixMatcher {
  const trimmed = source.trim();
  const slashWrap = /^\/(.+)\/([gimsuy]*)$/.exec(trimmed);
  if (slashWrap) {
    return { kind: 'regex', pattern: new RegExp(slashWrap[1]!, slashWrap[2]) };
  }
  if (REGEX_METACHAR.test(trimmed)) {
    return { kind: 'regex', pattern: new RegExp(trimmed) };
  }
  return { kind: 'prefix', value: trimmed };
}

export function testPrefixMatcher(name: string, matcher: PrefixMatcher): boolean {
  return matcher.kind === 'prefix' ? name.startsWith(matcher.value) : matcher.pattern.test(name);
}

export function matchesTierBucket(name: string, bucket: ResolvedTierBucket): boolean {
  if (bucket.exact.has(name)) return true;
  return bucket.matchers.some((matcher) => testPrefixMatcher(name, matcher));
}

function mergeBucket(
  nested: TierBucket | undefined,
  legacyExact: string[] | undefined,
  legacyPrefix: string[] | undefined,
  defaultPrefixes: readonly string[] = [],
): ResolvedTierBucket {
  const exactSources = [...(nested?.exact ?? []), ...(legacyExact ?? [])];
  const prefixSources = [...(nested?.prefix ?? []), ...(legacyPrefix ?? []), ...defaultPrefixes];
  return {
    exact: new Set(exactSources),
    matchers: prefixSources.map(compilePrefixMatcher),
  };
}

function hasStableConfig(config?: TierRulesConfig): boolean {
  return Boolean(
    config?.stable ||
      config?.stableExact?.length ||
      config?.stablePrefixes?.length,
  );
}

function hasInternalConfig(config?: TierRulesConfig): boolean {
  return Boolean(config?.internal || config?.internalPatterns?.length);
}

function hasAdvancedConfig(config?: TierRulesConfig): boolean {
  return Boolean(config?.advanced || config?.advancedPatterns?.length);
}

export function resolveTierRules(config?: TierRulesConfig): ResolvedTierRules {
  const usedLegacyTierKeys = Boolean(
    config?.stableExact?.length ||
      config?.stablePrefixes?.length ||
      config?.internalPatterns?.length ||
      config?.advancedPatterns?.length,
  );

  return {
    stable: mergeBucket(
      config?.stable,
      config?.stableExact,
      config?.stablePrefixes,
      hasStableConfig(config) ? [] : DEFAULT_STABLE_PREFIXES,
    ),
    internal: mergeBucket(
      config?.internal,
      undefined,
      config?.internalPatterns,
      hasInternalConfig(config) ? [] : DEFAULT_INTERNAL_PREFIXES,
    ),
    advanced: mergeBucket(
      config?.advanced,
      undefined,
      config?.advancedPatterns,
      hasAdvancedConfig(config) ? [] : DEFAULT_ADVANCED_PREFIXES,
    ),
    usedLegacyTierKeys,
  };
}
