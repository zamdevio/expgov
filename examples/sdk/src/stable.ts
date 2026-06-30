import type { GreetOptions } from './types.js';

/** @sdkTier stable */
export const SDK_VERSION = '0.1.0';

export type { GreetOptions } from './types.js';

/** Flat stable export — allowlisted in `tiers.stable.exact`. */
export function greet(name: string, options: GreetOptions = {}): string {
  const salutation = options.salutation ?? 'Hello';
  return `${salutation}, ${name}!`;
}

/** Classified stable via `tiers.stable.prefix` (`format`). */
export function formatGreeting(name: string): string {
  return greet(name);
}
