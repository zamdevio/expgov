/** @sdkTier advanced */
export function experimentalProbe(): boolean {
  return true;
}

/** Classified advanced via `tiers.advanced.prefix` when no tag is present. */
export function betaChannel(): string {
  return 'preview';
}
