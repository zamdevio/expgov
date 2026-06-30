/** Per-command banner / help box subtitles (shared by banner + configureCliHelp). */
export const COMMAND_SUBTITLES: Record<string, string> = {
  init: 'expgov.config.ts — export governance scaffold',
  inventory: 'root barrel export summary',
  diff: 'compare export surfaces between refs',
  validate: 'tsconfig ↔ npm parity + tier governance',
  doctor: 'config discovery and cache hygiene',
  suggest: 'tier allowlist suggestions for unclassified exports',
  trend: 'export counts across release tags',
  timeline: 'commits that changed the root export barrel',
  graph: 're-export governance map',
  version: 'CLI and SDK versions',
  help: 'command usage reference',
};
