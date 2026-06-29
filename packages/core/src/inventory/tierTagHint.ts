import { getProjectContext } from '../context/index.js';

/** Active JSDoc tier tag for user-facing hints (`@sdkTier` by default). */
export function formatTierTagHint(): string {
  return `@${getProjectContext().tierTag.name}`;
}
