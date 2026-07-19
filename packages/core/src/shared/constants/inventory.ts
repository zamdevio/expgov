export const INVENTORY_NAME_WIDTH = 33;
export const INVENTORY_TIER_WIDTH = 10;
/** Padded width for dim `(exact)` / `(default-prefix)` beside the tier cell. */
export const INVENTORY_PROVENANCE_WIDTH = 16;
export const INVENTORY_CATEGORY_WIDTH = 10;
export const INVENTORY_SYMBOL_KIND_WIDTH = 10;

export const VERBOSE_INVENTORY_ROW_PREFIX = '       · ';

/** Max hops when following re-export chains for JSDoc tier tags. */
export const MAX_REEXPORT_DEPTH = 12;

/** Category heuristics for root flat export names. */
export const CATEGORY_RUN_ENTRY = /^run[A-Z]/;
export const CATEGORY_CONTEXT = /^create[A-Z].*Context$/;
