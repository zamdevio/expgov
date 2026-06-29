import type { TierBucket, TierRulesConfig } from '../types/config/tiers.js';
import type { PrefixMatcher, ResolvedTierBucket, ResolvedTierRules } from '../types/config/prefix.js';
import {
  DEFAULT_ADVANCED_PREFIXES,
  DEFAULT_INTERNAL_PREFIXES,
  DEFAULT_STABLE_PREFIXES,
  REGEX_METACHAR,
} from '../shared/constants/tiers.js';

export {
  DEFAULT_ADVANCED_PREFIXES,
  DEFAULT_INTERNAL_PREFIXES,
  DEFAULT_STABLE_PREFIXES,
} from '../shared/constants/tiers.js';

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
  const hasExplicitBucket = nested !== undefined;
  const prefixSources = [...(nested?.prefix ?? []), ...(hasExplicitBucket ? [] : defaultPrefixes)];
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
