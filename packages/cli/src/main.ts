import path from 'node:path';

import { Command } from 'commander';

import {
  initProjectContext,
  isExportError,
  printExportError,
  printHelp,
  printHelpHint,
  printUnexpected,
  runExportsDiff,
  runExportsGraph,
  runExportsInventory,
  runExportsTimeline,
  runExportsTrend,
  runExportsValidate,
  type HelpTopic,
} from '@expgov/core';

interface GlobalOpts {
  cwd?: string;
  config?: string;
  packageName?: string;
  cacheDir?: string;
}

function globalOpts(cmd: Command): GlobalOpts {
  return (cmd.parent ?? cmd).opts() as GlobalOpts;
}

function initFromCommand(cmd: Command, verbose?: boolean): void {
  const g = globalOpts(cmd);
  if (g.cwd) process.chdir(path.resolve(g.cwd));
  initProjectContext({
    cwd: g.cwd ?? process.cwd(),
    configPath: g.config,
    packageName: g.packageName,
    cacheDir: g.cacheDir,
    verbose,
  });
}

function handleError(err: unknown): never {
  if (isExportError(err)) {
    if (err.code === 'usage') {
      if (err.exitCode !== 0) printExportError(err);
      printHelp('all');
      printHelpHint(typeof err.details.command === 'string' ? err.details.command : undefined);
      process.exit(err.exitCode);
    }
    printExportError(err);
    printHelpHint();
    process.exit(err.exitCode);
  }
  printUnexpected(err);
  process.exit(1);
}

function withContext(cmd: Command, verbose: boolean | undefined, fn: () => void | number): void {
  try {
    initFromCommand(cmd, verbose);
    const code = fn();
    if (typeof code === 'number') process.exit(code);
  } catch (err) {
    handleError(err);
  }
}

function addCacheFlags(cmd: Command): Command {
  return cmd.option('-f, --force', 'rebuild snapshot and overwrite cache').option('--no-cache', 'skip cache');
}

export function buildProgram(): Command {
  const program = new Command('expgov');

  program
    .description('Export governance for TypeScript SDK barrels')
    .version('0.1.0')
    .option('-C, --cwd <dir>', 'project root')
    .option('--config <path>', 'path to expgov.config.ts')
    .option('--package-name <name>', 'override package name')
    .option('--cache-dir <path>', 'override cache directory');

  addCacheFlags(
    program
      .command('inventory')
      .description('summarize root barrel exports')
      .argument('[ref]', 'git ref (default: working tree)')
      .option('-v, --verbose', 'verbose output')
      .action((ref: string | undefined, _opts, cmd) => {
        const local = cmd.opts() as { verbose?: boolean; force?: boolean; cache?: boolean };
        withContext(cmd, local.verbose, () => {
          runExportsInventory({
            ref,
            verbose: local.verbose,
            noCache: local.cache === false,
            force: local.force,
          });
        });
      }),
  );

  addCacheFlags(
    program
      .command('diff')
      .description('compare export surfaces between refs')
      .argument('[range]', 'ref or A..B range')
      .option('-v, --verbose', 'verbose output')
      .action((range: string | undefined, _opts, cmd) => {
        const local = cmd.opts() as { verbose?: boolean; force?: boolean; cache?: boolean };
        withContext(cmd, local.verbose, () => {
          runExportsDiff({
            range,
            noCache: local.cache === false,
            force: local.force,
            verbose: local.verbose,
          });
        });
      }),
  );

  program
    .command('validate')
    .description('governance checks on working tree')
    .option('-v, --verbose', 'verbose output')
    .option('--since <ref>', 'reserved for future delta validation')
    .action((_opts, cmd) => {
      const local = cmd.opts() as { verbose?: boolean; since?: string };
      withContext(cmd, local.verbose, () =>
        runExportsValidate({ since: local.since, verbose: local.verbose }),
      );
    });

  addCacheFlags(
    program
      .command('trend')
      .description('export counts across release tags')
      .option('--tags <n>', 'last N version tags', (v) => Number(v), 12)
      .option('-v, --verbose', 'verbose output')
      .action((_opts, cmd) => {
        const local = cmd.opts() as {
          tags: number;
          verbose?: boolean;
          force?: boolean;
          cache?: boolean;
        };
        withContext(cmd, local.verbose, () => {
          runExportsTrend({
            tagLimit: local.tags,
            noCache: local.cache === false,
            force: local.force,
            verbose: local.verbose,
          });
        });
      }),
  );

  addCacheFlags(
    program
      .command('timeline')
      .description('commits that changed the root export barrel')
      .argument('[range]', 'time range (default: @4w)')
      .option('--limit <n>', 'max commits', (v) => Number(v), 20)
      .option('-v, --verbose', 'verbose output')
      .action((range: string | undefined, _opts, cmd) => {
        const local = cmd.opts() as {
          limit: number;
          verbose?: boolean;
          force?: boolean;
          cache?: boolean;
        };
        withContext(cmd, local.verbose, () => {
          runExportsTimeline({
            range,
            limit: local.limit,
            noCache: local.cache === false,
            force: local.force,
            verbose: local.verbose,
          });
        });
      }),
  );

  addCacheFlags(
    program
      .command('graph')
      .description('re-export map')
      .argument('[ref]', 'git ref')
      .option('-v, --verbose', 'verbose output')
      .action((ref: string | undefined, _opts, cmd) => {
        const local = cmd.opts() as { verbose?: boolean; force?: boolean; cache?: boolean };
        withContext(cmd, local.verbose, () => {
          runExportsGraph({
            ref,
            noCache: local.cache === false,
            force: local.force,
            verbose: local.verbose,
          });
        });
      }),
  );

  program
    .command('help')
    .argument('[topic]', 'command topic')
    .description('show usage')
    .action((topic: string | undefined, _opts, cmd) => {
      try {
        initFromCommand(cmd, false);
      } catch {
        // generic help without config
      }
      const topics: HelpTopic[] = [
        'all',
        'inventory',
        'diff',
        'validate',
        'trend',
        'timeline',
        'graph',
        'help',
      ];
      printHelp(topics.includes(topic as HelpTopic) ? (topic as HelpTopic) : 'all');
    });

  return program;
}

export function runCli(argv: string[]): void {
  buildProgram().parse(argv);
}
