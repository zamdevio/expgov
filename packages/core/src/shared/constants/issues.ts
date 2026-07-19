/** Stable issue codes for JSON `issues[]` across commands. */

// diff
export const ISSUE_DIFF_EXPORTS_REMOVED = 'expgov.diff.exports_removed';
export const ISSUE_DIFF_TIER_VIOLATION = 'expgov.diff.tier_violation';

// inventory diagnostics
export const ISSUE_INVENTORY_DIRECT_BARREL_EXPORT = 'expgov.inventory.direct_barrel_export';
export const ISSUE_INVENTORY_UNREACHABLE_MODULE_EXPORTS =
  'expgov.inventory.unreachable_module_exports';

// validate / doctor / suggest
export const ISSUE_VALIDATE_VIOLATION = 'expgov.validate.violation';
export const ISSUE_DOCTOR_WARNING = 'expgov.doctor.warning';
export const ISSUE_SUGGEST_UNCLASSIFIED = 'expgov.suggest.unclassified';

/** Max sample names shown under a diagnostic path line (human + message hint). */
export const DIAGNOSTIC_SAMPLE_LIMIT = 3;
