/** One human-readable insight line for CLI + JSON serialization. */
export interface InsightLine {
  key: string;
  text: string;
}

export interface ModuleRef {
  path: string;
  count: number;
}

export interface ModuleDeltaRef {
  path: string;
  delta: number;
}

export interface TagPairDelta {
  from: string;
  to: string;
  delta: number;
}

export interface InventoryInsights {
  lines: InsightLine[];
  largestModule?: ModuleRef;
  medianExportsPerModule?: number;
  trackedModuleCount?: number;
  rootNamespaceExports?: number;
}

export interface ValidateInsights {
  lines: InsightLine[];
  hottestUnclassifiedModule?: ModuleRef;
  worstSubpath?: { npmSubpath: string; unclassified: number };
}

export interface DiffInsights {
  lines: InsightLine[];
  largestModuleDelta?: ModuleDeltaRef;
  tierMovement?: Record<string, number>;
}

export interface TrendInsights {
  lines: InsightLine[];
  largestJump?: TagPairDelta;
  largestDrop?: TagPairDelta;
  stableRatioFirst?: number;
  stableRatioLast?: number;
}

export interface GraphInsights {
  lines: InsightLine[];
  densestModule?: ModuleRef;
  fanOut?: { targetSubpath: string; moduleCount: number };
}

export interface TimelineInsights {
  lines: InsightLine[];
  addedTotal?: number;
  removedTotal?: number;
  netFlat?: number;
  largestStep?: { delta: number; date: string };
  busiestWeek?: { week: string; commits: number };
  stableRatioFirst?: number;
  stableRatioLast?: number;
}
