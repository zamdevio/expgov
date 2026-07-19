/** Shared list filters for inventory, diff detail, and graph views. */
export type FilterOptions = {
  /** Match any of these tier ids (e.g. stable, advanced, internal). */
  tier?: string[];
  /** Match any of these ExportCategory values (e.g. run, config, type). */
  category?: string[];
};
