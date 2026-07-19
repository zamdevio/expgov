/** One human-readable insight line for CLI + JSON serialization. */
export interface InsightLine {
  key: string;
  text: string;
}

/**
 * Shared insights envelope for every command.
 * Typed fields are command-specific and omitted when absent.
 *
 * Delta sign convention (JSON typed fields + human `+/−` text):
 * - **Positive** = growth toward the newer / right / later side
 * - **Negative** = shrink toward the newer / right / later side
 * - `diff`: right − left
 * - `trend`: later tag − earlier tag (tags oldest → newest)
 * - `timeline`: newer commit − older commit (rows newest-first; oldest row `delta` is null)
 */
export interface InsightsBase {
  lines: InsightLine[];
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

export interface InventoryInsights extends InsightsBase {
  largestModule?: ModuleRef;
  medianExportsPerModule?: number;
  trackedModuleCount?: number;
  rootNamespaceExports?: number;
}

export interface ValidateInsights extends InsightsBase {
  hottestUnclassifiedModule?: ModuleRef;
  worstSubpath?: { npmSubpath: string; unclassified: number };
}

export interface DiffInsights extends InsightsBase {
  largestModuleDelta?: ModuleDeltaRef;
  tierMovement?: Record<string, number>;
}

export interface TrendInsights extends InsightsBase {
  largestJump?: TagPairDelta;
  largestDrop?: TagPairDelta;
  stableRatioFirst?: number;
  stableRatioLast?: number;
}

export interface GraphInsights extends InsightsBase {
  densestModule?: ModuleRef;
  fanOut?: { targetSubpath: string; moduleCount: number };
}

export interface TimelineInsights extends InsightsBase {
  addedTotal?: number;
  removedTotal?: number;
  netFlat?: number;
  largestStep?: { delta: number; date: string };
  busiestWeek?: { week: string; commits: number };
}

export interface TimelineInsightRow {
  date: string;
  rollup: { rootFlat: number; stable: number };
  delta: number | null;
}

export interface TrendRollupRow {
  tag: string;
  rollup: {
    rootFlat: number;
    stable: number;
    advanced: number;
    internal: number;
  };
}
