export interface GraphTargetSubpathGroup {
  targetSubpath: string;
  flat: number;
  namespace: number;
  modules: Map<string, number>;
}

export interface GraphModuleGroup {
  module: string;
  edges: number;
  symbols: string[];
  edgeProvenance: string;
}

export interface GraphNamespaceRow {
  name: string;
  targetSubpath: string;
  module: string | null;
}
