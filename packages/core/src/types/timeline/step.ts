export interface TimelineStepTierDelta {
  stable?: number;
  advanced?: number;
  internal?: number;
  unclassified?: number;
  custom?: Record<string, number>;
}

export interface TimelineStepMeta {
  added: number;
  removed: number;
  namespaceDelta: number;
  subpathDelta: number;
  tierDelta: TimelineStepTierDelta;
  largestModuleChange?: { module: string; delta: number };
}
