/** Shared list filters for inventory, diff detail, and graph views. */
export type FilterOptions = {
  /** Match any of these tier ids (e.g. stable, advanced, internal). */
  tier?: string[];
  /** Match any of these ExportCategory values (e.g. run, config, type). */
  category?: string[];
  /** Match any of these root namespace names (exact). */
  namespace?: string[];
  /** Substring match against source module / edge `toModule` paths. */
  module?: string[];
  /** Match any of these target subpaths (`./types`, `types`, …). */
  subpath?: string[];
};
