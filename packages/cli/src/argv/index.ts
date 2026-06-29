const VERSION_SHORT_FLAG = '-V';
const VERSION_SUB_OPTS = ['--check', '--reset'];

const KNOWN_COMMAND_FIRST_TOKEN = new Set([
  'init',
  'inventory',
  'diff',
  'validate',
  'doctor',
  'suggest',
  'trend',
  'timeline',
  'graph',
  'help',
  'version',
]);

/** Global CLI options that consume the next argv token (must not be treated as a subcommand). */
const GLOBAL_OPTION_WITH_VALUE = new Set([
  '-C',
  '--cwd',
  '-c',
  '--config',
  '-pn',
  '--package-name',
  '-cd',
  '--cache-dir',
]);

function findFirstCommandToken(args: string[]): string | null {
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a.startsWith('-')) continue;
    const prev = i > 0 ? args[i - 1]! : '';
    if (GLOBAL_OPTION_WITH_VALUE.has(prev)) continue;
    return a;
  }
  return null;
}

/**
 * Rewrites global `-V` usage to the `version` subcommand.
 * Keeps explicit command invocations untouched (e.g. `doctor -V`).
 */
function rewriteVersionShortFlag(argv: string[]): string[] {
  const args = argv.slice(2);
  if (args.length === 0 || !args.includes(VERSION_SHORT_FLAG)) {
    return argv;
  }

  const firstCmd = findFirstCommandToken(args);
  if (firstCmd && KNOWN_COMMAND_FIRST_TOKEN.has(firstCmd)) {
    return argv;
  }

  const filtered = args.filter((a) => a !== VERSION_SHORT_FLAG);
  const hasVersionSubOpt = filtered.some((a) => VERSION_SUB_OPTS.includes(a));
  const next = hasVersionSubOpt
    ? (() => {
        const globalsOnly = filtered.filter((a) => !VERSION_SUB_OPTS.includes(a));
        const vopts = filtered.filter((a) => VERSION_SUB_OPTS.includes(a));
        return [...globalsOnly, 'version', ...vopts];
      })()
    : [...filtered, 'version'];

  const out = [...argv];
  out.splice(2, out.length - 2, ...next);
  return out;
}

/** Normalizes argv before Commander: global `-V` → `version`. */
export function preprocessArgv(argv: string[]): string[] {
  return rewriteVersionShortFlag(argv);
}
