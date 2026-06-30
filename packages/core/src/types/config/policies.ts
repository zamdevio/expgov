/** Whether flat exports on the root barrel are allowed for a tier policy. */
export type TierRootFlatRule = 'allow' | 'deny';

/** Composable tier policy rules — extend as new governance checks ship. */
export interface TierPolicyRules {
  /** Block or allow `exportKind: 'flat'` symbols on the root barrel. */
  rootFlat?: TierRootFlatRule;
}

/** User-defined or built-in override under `tiers.policies`. */
export interface TierPolicyDefinition {
  rules?: TierPolicyRules;
}

export interface ResolvedTierPolicyRules {
  rootFlat: TierRootFlatRule;
}

export interface ResolvedTierPolicy {
  name: string;
  rules: ResolvedTierPolicyRules;
}
