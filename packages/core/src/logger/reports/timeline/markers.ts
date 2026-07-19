import { style } from '../../../runtime/style.js';
import { TIMELINE_MARKER_WIDTH } from '../../../shared/constants/timeline.js';

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
