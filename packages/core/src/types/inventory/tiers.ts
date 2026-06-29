/** Configured tier bucket id (e.g. stable, beta, preview). */
export type TierId = string;

export type StabilityTier = TierId | 'unclassified';

export type TierBucketName = TierId;

export type TierPolicy =
  | 'public'
  | 'maintainer'
  | 'experimental'
  | 'preview'
  | 'deprecated';

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
