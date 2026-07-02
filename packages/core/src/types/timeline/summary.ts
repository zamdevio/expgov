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

export interface TimelineSummary {
  apiGrowth: TimelineApiGrowth;
  largestExpansion?: TimelineStepPeak;
  largestReduction?: TimelineStepPeak;
  avgStepChange?: number;
  mostActivePeriod?: TimelineActivePeriod;
  largestRelease?: TimelineReleaseJump;
}
