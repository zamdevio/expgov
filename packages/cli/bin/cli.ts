#!/usr/bin/env node
import path from 'node:path';
import { Command, CommanderError } from 'commander';
import {
  isExportError,
  runDiff,
  runGraph,
  runInventory,
  runTimeline,
  runTrend,
  runValidate,
  runDoctor,
  runSuggest,
} from '@expgov/core';
import {
  bootstrapRuntime,
  configureStyle,
  emitJsonError,
  getRunOptions,
  initProjectContext,
  printExportError,
  printHelpHint,
  printUnexpected,
  resetRunOptions,
  setRunOptions,
} from '@expgov/core/internal';

import { ensureConfig } from '../src/commands/init/index.js';
import { preprocessArgv } from '../src/argv/index.js';
import { CLI_NAME, CLI_ROOT_DESCRIPTION } from '../src/constants/cli.js';
import { getCliYesFlag, resetCliGlobals, setCliYesFlag } from '../src/shared/context/globals.js';
import type {
  CacheListVerboseOpts,
  DiffCommandOpts,
  GlobalOpts,
  InitCommandOpts,
  ListFlagOpts,
  TrendCommandOpts,
  ValidateCommandOpts,
  VerboseOpts,
  VersionCommandOpts,
} from '../src/types/cli/index.js';
import { maybePrintCommandBanner } from '../src/utils/cli/banner.js';
import { addCacheFlags, addFilterFlags, addListFlags } from '../src/utils/cli/listFlags.js';
import { resolveNoColor } from '../src/utils/cli/noColor.js';
import { configureCliHelp } from '../src/utils/help/configureCliHelp.js';
import { printCliHelp } from '../src/utils/help/printCliHelp.js';
import { printCurrentVersionLine, runVersionCheckCommand, runVersionResetCommand } from '../src/utils/version/index.js';

function globalOpts(cmd: Command): GlobalOpts {
  return (cmd.parent ?? cmd).opts() as GlobalOpts;
}

function initFromCommand(cmd: Command, verbose?: boolean): void {
  const g = globalOpts(cmd);
  initProjectContext({
    cwd: process.cwd(),
    configPath: g.config,
    packageName: g.packageName,
    cacheDir: g.cacheDir,
    verbose,
  });
}

function argvCommandName(): string {
  const known = new Set([
    'init',
    'inventory',
    'diff',
    'validate',
    'doctor',
    'suggest',
    'trend',
    'timeline',
    'graph',
    'version',
    'help',
  ]);
  return process.argv.slice(2).find((token) => known.has(token)) ?? 'cli';
}

function handleError(err: unknown, program: Command, command?: Command): never {
  const commandName =
    command?.name() ||
    (isExportError(err) && typeof err.details.command === 'string'
      ? err.details.command
      : argvCommandName());

  if (getRunOptions().json) {
    if (err instanceof CommanderError) {
      emitJsonError({
        command: commandName,
        code: 'usage',
        message: err.message,
        details: { commanderCode: err.code },
        cwd: process.cwd(),
      });
      process.exit(err.exitCode);
    }
    if (isExportError(err)) {
      emitJsonError({
        command: commandName,
        code: err.code,
        message: err.message,
        details: err.details,
        cwd: process.cwd(),
      });
      process.exit(err.exitCode);
    }
    emitJsonError({
      command: commandName,
      code: 'unexpected_error',
      message: err instanceof Error ? err.message : String(err),
      cwd: process.cwd(),
    });
    process.exit(1);
  }

  if (err instanceof CommanderError) {
    process.exit(err.exitCode);
  }

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
    handleError(err, program, cmd);
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
    .action(async (opts: InitCommandOpts, _cmd, cmd) => {
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

  addFilterFlags(
    addListFlags(
      addCacheFlags(
        program
          .command('inventory')
          .description('summarize root barrel exports')
          .argument('[ref]', 'git ref (default: working tree)')
          .option('-v, --verbose', 'verbose output')
          .action((ref: string | undefined, _opts, cmd) => {
            const local = cmd.opts() as CacheListVerboseOpts;
            withContext(cmd, local.verbose, program, () => {
              runInventory({
                ref,
                verbose: local.verbose,
                noCache: local.cache === false,
                force: local.force,
                top: local.top,
                full: local.full,
                tier: local.tier,
                category: local.category,
              });
            });
          }),
      ),
    ),
  );

  addFilterFlags(
    addListFlags(
      addCacheFlags(
        program
          .command('diff')
          .description('compare export surfaces between refs')
          .argument('[range]', 'ref or A..B range')
          .option('-v, --verbose', 'verbose output')
          .option('--fail-on-removed', 'exit 1 when flat exports were removed')
          .option('--fail-on-tier-violations', 'exit 1 when right-side tier violations exist')
          .action((range: string | undefined, _opts, cmd) => {
            const local = cmd.opts() as DiffCommandOpts;
            withContext(cmd, local.verbose, program, () =>
              runDiff({
                range,
                noCache: local.cache === false,
                force: local.force,
                verbose: local.verbose,
                top: local.top,
                full: local.full,
                tier: local.tier,
                category: local.category,
                failOnRemoved: local.failOnRemoved,
                failOnTierViolations: local.failOnTierViolations,
              }),
            );
          }),
      ),
    ),
  );

  addListFlags(
    program
      .command('validate')
      .description('governance checks on working tree')
      .option('-v, --verbose', 'verbose output')
      .option('--since <ref>', 'fail if flat exports were removed since git ref')
      .action((_opts, cmd) => {
        const local = cmd.opts() as ValidateCommandOpts;
        withContext(cmd, local.verbose, program, () =>
          runValidate({
            since: local.since,
            verbose: local.verbose,
            top: local.top,
            full: local.full,
          }),
        );
      }),
  );

  addListFlags(
    program
      .command('doctor')
      .description('config discovery and cache hygiene checks')
      .option('-v, --verbose', 'verbose output')
      .action((_opts, cmd) => {
        const local = cmd.opts() as VerboseOpts & ListFlagOpts;
        withContext(cmd, local.verbose, program, () =>
          runDoctor({ verbose: local.verbose, top: local.top, full: local.full }),
        );
      }),
  );

  addListFlags(
    program
      .command('suggest')
      .description('suggest tiers.stable.exact additions for unclassified exports (dry-run)')
      .option('-v, --verbose', 'verbose output')
      .action((_opts, cmd) => {
        const local = cmd.opts() as VerboseOpts & ListFlagOpts;
        withContext(cmd, local.verbose, program, () =>
          runSuggest({ verbose: local.verbose, top: local.top, full: local.full }),
        );
      }),
  );

  addListFlags(
    addCacheFlags(
      program
        .command('trend')
        .description('export counts across release tags')
        .option('--tags <n>', 'last N version tags', (v) => Number(v), 12)
        .option('-v, --verbose', 'verbose output')
        .action((_opts, cmd) => {
          const local = cmd.opts() as TrendCommandOpts;
          withContext(cmd, local.verbose, program, () => {
            runTrend({
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
          const local = cmd.opts() as CacheListVerboseOpts;
          withContext(cmd, local.verbose, program, () => {
            runTimeline({
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

  addFilterFlags(
    addListFlags(
      addCacheFlags(
        program
          .command('graph')
          .description('re-export map')
          .argument('[ref]', 'git ref')
          .option('-v, --verbose', 'verbose output')
          .action((ref: string | undefined, _opts, cmd) => {
            const local = cmd.opts() as CacheListVerboseOpts;
            withContext(cmd, local.verbose, program, () => {
              runGraph({
                ref,
                noCache: local.cache === false,
                force: local.force,
                verbose: local.verbose,
                top: local.top,
                full: local.full,
                tier: local.tier,
                category: local.category,
              });
            });
          }),
      ),
    ),
  );

  program
    .command('version')
    .description(
      'Print the CLI version; use --check to query npm; use --reset to clear local update state',
    )
    .option('--check', 'fetch latest from the npm registry and show install instructions', false)
    .option('--reset', 'clear cached npm update check', false)
    .action(async (opts: VersionCommandOpts) => {
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
program.allowExcessArguments(false);
program.configureOutput({
  writeErr: (text) => {
    if (!getRunOptions().json) process.stderr.write(text);
  },
});
for (const command of [program, ...program.commands]) {
  command.exitOverride();
}

// Parser errors happen before `preAction`; prime JSON mode from raw argv for that path.
if (process.argv.includes('-j') || process.argv.includes('--json')) {
  setRunOptions({ json: true, jsonPretty: true });
}
program
  .parseAsync(preprocessArgv(process.argv))
  .catch((err: unknown) => {
    handleError(err, program);
  });
