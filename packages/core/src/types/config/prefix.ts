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
