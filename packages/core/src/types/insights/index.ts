/** One human-readable insight line for CLI + JSON serialization. */
export interface InsightLine {
  key: string;
  text: string;
}

export interface ModuleRef {
  path: string;
  count: number;
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
