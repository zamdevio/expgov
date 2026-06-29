import { getProjectContext } from '../context/index.js';

/** Active JSDoc tier tag and configured bucket literals for user-facing hints. */
export function formatTierTagHint(): string {
  const { tierTag } = getProjectContext();
  if (!tierTag.bucketNames.length) return `@${tierTag.name}`;
  return `@${tierTag.name} ${tierTag.bucketNames.join(' | ')}`;
}
