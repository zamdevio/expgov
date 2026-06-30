import { style } from '../../../runtime/style.js';

/** Content width after the standard timeline row indent (`       `). */
export const TIMELINE_MARKER_WIDTH = 80;

/** Default shows the highest version tag; verbose shows every tag on the commit. */
export function resolveDisplayTags(tags: readonly string[], verbose?: boolean): string[] {
  if (!tags.length) return [];
  if (verbose || tags.length === 1) return [...tags];
  return [tags[tags.length - 1]!];
}

export function formatReleaseMarker(tags: readonly string[]): string {
  if (!tags.length) return '';
  const label = tags.join(' · ');
  const body = `── ${label} `;
  const fill = '─'.repeat(Math.max(0, TIMELINE_MARKER_WIDTH - body.length));
  return style.dim(`       ${body}${fill}`);
}
