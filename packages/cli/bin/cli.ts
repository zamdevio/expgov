#!/usr/bin/env node
import path from 'node:path';
import { Command } from 'commander';
import {
  bootstrapRuntime,
  configureStyle,
  initProjectContext,
  isExportError,
  printExportError,
  printHelpHint,
  printUnexpected,
  resetRunOptions,
  runExportsDiff,
  runExportsGraph,
  runExportsInventory,
  runExportsTimeline,
  runExportsTrend,
  runExportsValidate,
  runExportsDoctor,
  runExportsSuggest,
  setRunOptions,
} from '@expgov/core';

import { ensureConfig } from '../src/commands/init/index.js';
import { preprocessArgv } from '../src/argv/index.js';
import { CLI_NAME, CLI_ROOT_DESCRIPTION } from '../src/constants/cli.js';
import { getCliYesFlag, resetCliGlobals, setCliYesFlag } from '../src/shared/context/globals.js';
import { maybePrintCommandBanner } from '../src/utils/cli/banner.js';
import { addCacheFlags, addListFlags } from '../src/utils/cli/listFlags.js';
import { resolveNoColor } from '../src/utils/cli/noColor.js';
import { configureCliHelp } from '../src/utils/help/configureCliHelp.js';
import { printCliHelp } from '../src/utils/help/printCliHelp.js';
import { printCurrentVersionLine, runVersionCheckCommand, runVersionResetCommand } from '../src/utils/version/index.js';

interface GlobalOpts {
  cwd?: string;
  config?: string;
  packageName?: string;
  cacheDir?: string;
  yes?: boolean;
  json?: boolean;
  quiet?: boolean;
  silent?: boolean;
  noColor?: boolean;
  noLogPrefix?: boolean;
  noLogChannel?: boolean;
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

function handleError(err: unknown, program: Command): never {
  if (isExportError(err)) {
    if (err.code === 'usage') {
      if (err.exitCode !== 0) printExportError(err);
      const topic = typeof err.details.command === 'string' ? err.details.command : undefined;
      printCliHelp(program, topic);
      printHelpHint(topic);
      process.exit(err.exitCode);
    }
    printExportError(err);
    printHelpHint();
    process.exit(err.exitCode);
  }
  printUnexpected(err);
  process.exit(1);
}

function withContext(cmd: Command, verbose: boolean | undefined, program: Command, fn: () => void | number): void {
  try {
    initFromCommand(cmd, verbose);
    const code = fn();
    if (typeof code === 'number') process.exit(code);
  } catch (err) {
    handleError(err, program);
  }
}

function buildProgram(): Command {
  const program = new Command();

  configureCliHelp(program);

  program
    .name(CLI_NAME)
    .description(CLI_ROOT_DESCRIPTION)
    .option('-C, --cwd <dir>', 'project root')
    .option('-c, --config <path>', 'path to expgov.config.ts')
    .option('-pn, --package-name <name>', 'override package name')
    .option('-cd, --cache-dir <path>', 'override cache.dir')
    .option('-y, --yes', 'non-interactive (init writes config without prompting)')
    .option('-j, --json', 'machine-readable JSON envelope output')
    .option('-q, --quiet', 'suppress info logs and tips; keep primary command output')
    .option('-s, --silent', 'suppress all human output except errors and --json')
    .option('-ncl, --no-color', 'disable color output')
    .option('-nlg, --no-log-prefix', 'omit [expgov] prefix on log lines')
    .option('-nlc, --no-log-channel', 'omit info/warn/tip channel tags on log lines');

  program.hook('preAction', (_thisCommand, actionCommand) => {
    const opts = program.opts<GlobalOpts>();
    resetCliGlobals();
    resetRunOptions();
    setCliYesFlag(Boolean(opts.yes));
    const noColor = resolveNoColor(Boolean(opts.noColor));
    configureStyle(noColor);
    setRunOptions({
      json: Boolean(opts.json),
      jsonPretty: true,
      quiet: Boolean(opts.quiet),
      silent: Boolean(opts.silent),
      noColor,
      noLogPrefix: Boolean(opts.noLogPrefix),
      noLogChannel: Boolean(opts.noLogChannel),
      verbose: Boolean((actionCommand.opts() as { verbose?: boolean }).verbose),
    });
    if (opts.cwd) process.chdir(path.resolve(opts.cwd));
    maybePrintCommandBanner(actionCommand, program);
  });

  program
    .command('init')
    .description(`create ${CLI_NAME}.config.ts when missing (interactive unless --yes)`)
    .option('-y, --yes', 'write config without prompting')
    .option('-r, --rich', 'commented cache + tier examples (stable, internal, advanced)', false)
    .option('-f, --force', 'overwrite existing config file')
    .action(async (opts: { yes?: boolean; rich?: boolean; force?: boolean }, _cmd, cmd) => {
      try {
        await ensureConfig({
          yes: Boolean(opts.yes) || getCliYesFlag(),
          force: Boolean(opts.force),
          rich: Boolean(opts.rich),
        });
      } catch (err) {
        handleError(err, cmd.root());
      }
    });

  addListFlags(
    addCacheFlags(
      program
        .command('inventory')
        .description('summarize root barrel exports')
        .argument('[ref]', 'git ref (default: working tree)')
        .option('-v, --verbose', 'verbose output')
        .action((ref: string | undefined, _opts, cmd) => {
          const local = cmd.opts() as {
            verbose?: boolean;
            force?: boolean;
            cache?: boolean;
            top?: number;
            full?: boolean;
          };
          withContext(cmd, local.verbose, program, () => {
            runExportsInventory({
              ref,
              verbose: local.verbose,
              noCache: local.cache === false,
              force: local.force,
              top: local.top,
              full: local.full,
            });
          });
        }),
    ),
  );

  addListFlags(
    addCacheFlags(
      program
        .command('diff')
        .description('compare export surfaces between refs')
        .argument('[range]', 'ref or A..B range')
        .option('-v, --verbose', 'verbose output')
        .action((range: string | undefined, _opts, cmd) => {
          const local = cmd.opts() as {
            verbose?: boolean;
            force?: boolean;
            cache?: boolean;
            top?: number;
            full?: boolean;
          };
          withContext(cmd, local.verbose, program, () => {
            runExportsDiff({
              range,
              noCache: local.cache === false,
              force: local.force,
              verbose: local.verbose,
              top: local.top,
              full: local.full,
            });
          });
        }),
    ),
  );

  addListFlags(
    program
      .command('validate')
      .description('governance checks on working tree')
      .option('-v, --verbose', 'verbose output')
      .option('--since <ref>', 'reserved for future delta validation')
      .action((_opts, cmd) => {
        const local = cmd.opts() as { verbose?: boolean; since?: string; top?: number; full?: boolean };
        withContext(cmd, local.verbose, program, () =>
          runExportsValidate({
            since: local.since,
            verbose: local.verbose,
            top: local.top,
            full: local.full,
          }),
        );
      }),
  );

  program
    .command('doctor')
    .description('config discovery and cache hygiene checks')
    .option('-v, --verbose', 'verbose output')
    .action((_opts, cmd) => {
      const local = cmd.opts() as { verbose?: boolean };
      withContext(cmd, local.verbose, program, () => runExportsDoctor({ verbose: local.verbose }));
    });

  program
    .command('suggest')
    .description('suggest tiers.stable.exact additions for unclassified exports (dry-run)')
    .option('-v, --verbose', 'verbose output')
    .action((_opts, cmd) => {
      const local = cmd.opts() as { verbose?: boolean };
      withContext(cmd, local.verbose, program, () => runExportsSuggest({ verbose: local.verbose }));
    });

  addListFlags(
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
            top?: number;
            full?: boolean;
          };
          withContext(cmd, local.verbose, program, () => {
            runExportsTrend({
              tagLimit: local.tags,
              noCache: local.cache === false,
              force: local.force,
              verbose: local.verbose,
              top: local.top,
              full: local.full,
            });
          });
        }),
    ),
  );

  addListFlags(
    addCacheFlags(
      program
        .command('timeline')
        .description('commits that changed the root export barrel')
        .argument('[range]', 'time range (default: @4w)')
        .option('-v, --verbose', 'verbose output')
        .action((range: string | undefined, _opts, cmd) => {
          const local = cmd.opts() as {
            verbose?: boolean;
            force?: boolean;
            cache?: boolean;
            top?: number;
            full?: boolean;
          };
          withContext(cmd, local.verbose, program, () => {
            runExportsTimeline({
              range,
              top: local.top,
              full: local.full,
              noCache: local.cache === false,
              force: local.force,
              verbose: local.verbose,
            });
          });
        }),
    ),
  );

  addListFlags(
    addCacheFlags(
      program
        .command('graph')
        .description('re-export map')
        .argument('[ref]', 'git ref')
        .option('-v, --verbose', 'verbose output')
        .action((ref: string | undefined, _opts, cmd) => {
          const local = cmd.opts() as {
            verbose?: boolean;
            force?: boolean;
            cache?: boolean;
            top?: number;
            full?: boolean;
          };
          withContext(cmd, local.verbose, program, () => {
            runExportsGraph({
              ref,
              noCache: local.cache === false,
              force: local.force,
              verbose: local.verbose,
              top: local.top,
              full: local.full,
            });
          });
        }),
    ),
  );

  program
    .command('version')
    .description(
      'Print the CLI version; use --check to query npm; use --reset to clear local update state',
    )
    .option('--check', 'fetch latest from the npm registry and show install instructions', false)
    .option('--reset', 'clear cached npm update check', false)
    .action(async (opts: { check?: boolean; reset?: boolean }) => {
      if (opts.reset) {
        runVersionResetCommand();
      }
      if (opts.check) {
        await runVersionCheckCommand();
      } else {
        printCurrentVersionLine();
      }
    });

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
      printCliHelp(program, topic);
    });

  program.action(() => {
    printCliHelp(program);
  });

  return program;
}

bootstrapRuntime();
const program = buildProgram();
program
  .parseAsync(preprocessArgv(process.argv))
  .catch((err: unknown) => {
    handleError(err, program);
  });
