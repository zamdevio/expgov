import { tryGetProjectContext } from '../context/index.js';
import { coreLogTip } from '../runtime/log.js';
import { canPrintTip } from '../runtime/policy.js';
import { getRunOptions } from '../runtime/runOptions.js';

let tipShownThisProcess = false;

export function maybeEmitLegacyTierConfigTip(): void {
  if (tipShownThisProcess) return;
  if (!canPrintTip(getRunOptions())) return;
  const ctx = tryGetProjectContext();
  if (!ctx?.tiers.usedLegacyTierKeys) return;
  tipShownThisProcess = true;
  coreLogTip(
    'Migrate flat tier keys (`stableExact`, `stablePrefixes`, `internalPatterns`, `advancedPatterns`) to nested `tiers.{stable,internal,advanced}.{exact,prefix}`.',
  );
}

export function resetLegacyTierConfigTipForTests(): void {
  tipShownThisProcess = false;
}
