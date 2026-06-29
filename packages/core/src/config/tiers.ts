import type { TierBucket, TierRulesConfig } from '../types/config/tiers.js';

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
}

const REGEX_METACHAR = /[\^$[\]()+?|\\]/;

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

export function resolveBucket(
  nested: TierBucket | undefined,
  defaultPrefixes: readonly string[],
): ResolvedTierBucket {
  const hasConfig = Boolean(nested && (nested.exact?.length || nested.prefix?.length));
  const prefixSources = [...(nested?.prefix ?? []), ...(hasConfig ? [] : defaultPrefixes)];
  return {
    exact: new Set(nested?.exact ?? []),
    matchers: prefixSources.map(compilePrefixMatcher),
  };
}

export function resolveTierRules(config?: TierRulesConfig): ResolvedTierRules {
  return {
    stable: resolveBucket(config?.stable, DEFAULT_STABLE_PREFIXES),
    internal: resolveBucket(config?.internal, DEFAULT_INTERNAL_PREFIXES),
    advanced: resolveBucket(config?.advanced, DEFAULT_ADVANCED_PREFIXES),
  };
}
