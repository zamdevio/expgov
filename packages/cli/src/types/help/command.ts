export interface CommandHelpExtra {
  examples?: string[];
  related?: string[];
  /** Full range grammar lines (shared with core formatters + invalid_range suggestions). */
  rangeFormats?: () => string[];
}
