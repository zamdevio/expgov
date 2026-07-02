export interface TimelineApiGrowth {
  delta: number;
  fromLabel: string;
  toLabel: string;
}

export interface TimelineStepPeak {
  delta: number;
  sha: string;
  date: string;
}

export interface TimelineActivePeriod {
  label: string;
  commits: number;
}

export interface TimelineReleaseJump {
  fromTag: string;
  toTag: string;
  delta: number;
}

export interface TimelineExportChurn {
  added: number;
  removed: number;
  total: number;
}

export interface TimelineTierMovement {
  stable?: number;
  advanced?: number;
  internal?: number;
  unclassified?: number;
}

export interface TimelineStableRatio {
  first: number;
  last: number;
}

export interface TimelineModuleShift {
  module: string;
  delta: number;
  sha: string;
  date: string;
}

export interface TimelineCategoryShift {
  from: string;
  to: string;
}

export interface TimelineCacheCoverage {
  hits: number;
  refreshed: number;
  misses: number;
  total: number;
}

export interface TimelineSummary {
  apiGrowth: TimelineApiGrowth;
  largestExpansion?: TimelineStepPeak;
  largestReduction?: TimelineStepPeak;
  avgStepChange?: number;
  mostActivePeriod?: TimelineActivePeriod;
  largestRelease?: TimelineReleaseJump;
  exportChurn?: TimelineExportChurn;
  namespaceNet?: number;
  tierMovement?: TimelineTierMovement;
  stableRatio?: TimelineStableRatio;
  largestModuleShift?: TimelineModuleShift;
  categoryShift?: TimelineCategoryShift;
  cacheCoverage?: TimelineCacheCoverage;
}
