export type StabilityTier = 'stable' | 'advanced' | 'internal' | 'unclassified';

export type DeclaredTierTag = Exclude<StabilityTier, 'unclassified'>;

export type TierBucketName = 'stable' | 'internal' | 'advanced';

export type TierProvenanceKind = 'tag' | 'config-exact' | 'config-prefix' | 'default-prefix';

export interface TierProvenance {
  kind: TierProvenanceKind;
  label: string;
  bucket?: TierBucketName;
}

export interface SymbolTierClassification {
  tier: StabilityTier;
  provenance: TierProvenance | null;
}
