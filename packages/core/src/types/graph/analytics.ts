import type { ExportCategory } from '../inventory/snapshot.js';
import type { StabilityTier } from '../inventory/tiers.js';

export interface GraphModuleRef {
  path: string;
  count: number;
}

export interface GraphFanInModule {
  path: string;
  namespaceCount: number;
}

export interface GraphNamespaceTierMix {
  stable: number;
  advanced: number;
  internal: number;
  unclassified: number;
}

export interface GraphNamespaceComposition {
  name: string;
  targetSubpath: string;
  module: string | null;
  tier: StabilityTier;
  category: ExportCategory;
  edgeCount: number;
  flatSymbolCount: number;
  byTier: GraphNamespaceTierMix;
  topCategories: Array<{ category: ExportCategory; count: number }>;
}

export interface GraphAnalytics {
  edgeCount: number;
  uniqueModules: number;
  edgeDensity: number;
  namespaceCount: number;
  flatEdgeCount: number;
  namespaceEdgeCount: number;
  hottestModule?: GraphModuleRef;
  fanInModules: GraphFanInModule[];
  namespaces: GraphNamespaceComposition[];
}
