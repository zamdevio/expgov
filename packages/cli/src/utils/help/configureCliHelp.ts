import { Help, type Command } from 'commander';

import { CLI_NAME, CLI_ROOT_TAGLINE } from '../../constants/cli.js';
import { formatBoxHeader, style } from '@expgov/core';
import { styleCommandHelpTerm } from './term.js';

const SECTION_HEADER = /^(Options|Commands|Arguments|Global Options):$/;
const HELP_ROW = /^(\s{2})(.+?)(\s{2,})(.*)$/;

function styleUsageLine(line: string): string {
  const rest = line.slice('Usage:'.length).trimStart();
  return `${style.bold(style.magenta('Usage:'))} ${style.bold(style.accent(rest))}`;
}

function styleSectionHeader(line: string): string {
  return style.bold(style.magenta(line));
}

function styleTerm(term: string, section: string): string {
  if (section === 'commands') return styleCommandHelpTerm(term);
  return style.accent(term);
}

function styleDescription(desc: string): string {
  return desc
    .split(/(\(default:[^)]+\))/)
    .map((part) => (part.match(/^\(default:/) ? style.highlight(part) : style.dim(part)))
    .join('');
}

export function colorizeHelpText(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  let section: 'none' | 'arguments' | 'options' | 'commands' | 'global-options' = 'none';
  for (const line of lines) {
    if (line.startsWith('Usage:')) {
      out.push(styleUsageLine(line));
      continue;
    }
    if (SECTION_HEADER.test(line)) {
      if (line === 'Commands:') section = 'commands';
      else if (line === 'Options:') section = 'options';
      else if (line === 'Arguments:') section = 'arguments';
      else if (line === 'Global Options:') section = 'global-options';
      out.push(styleSectionHeader(line));
      continue;
    }
    if (line === '') section = 'none';
    const row = HELP_ROW.exec(line);
    if (row) {
      const [, indent, termRaw, gap, desc] = row;
      const term = termRaw.trimEnd();
      const looksLikeFlagOrCommand =
        /^-/.test(term) ||
        term.includes('|') ||
        /^\[[^\]]+\]/.test(term.trimStart()) ||
        (section === 'commands' && /^[a-z]/i.test(term.trimStart()));
      if (looksLikeFlagOrCommand) {
        out.push(`${indent}${styleTerm(term, section)}${gap}${styleDescription(desc)}`);
        continue;
      }
    }
    if (line === '') {
      out.push('');
      continue;
    }
    out.push(styleDescription(line));
  }
  return out.join('\n');
}

function toolDisplayTitle(cmd: Command): string {
  const names: string[] = [];
  let cur: Command | null = cmd;
  while (cur) {
    const n = cur.name();
    if (n && n !== CLI_NAME) names.unshift(n);
    cur = cur.parent;
  }
  if (!names.length) {
    return CLI_NAME.charAt(0).toUpperCase() + CLI_NAME.slice(1);
  }
  return names
    .join(' ')
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}


const COMMAND_SUBTITLES: Record<string, string> = {
  init: 'expgov.config.ts — export governance scaffold',
  inventory: 'root barrel export summary',
  diff: 'compare export surfaces between refs',
  validate: 'tsconfig ↔ npm parity + tier governance',
  doctor: 'config discovery and cache hygiene',
  suggest: 'tier allowlist suggestions for unclassified exports',
  trend: 'export counts across release tags',
  timeline: 'commits that changed the root export barrel',
  graph: 're-export governance map',
  help: 'command usage reference',
};

export function configureCliHelp(program: Command): void {
  program.configureHelp({
    formatHelp(cmd: Command, helper: Help) {
      const raw = Help.prototype.formatHelp.call(helper, cmd, helper);
      const colored = colorizeHelpText(raw);
      const root = cmd.parent ?? cmd;
      const opts = root.opts<{ json?: boolean; silent?: boolean }>();
      if (opts.json || opts.silent) return colored;
      const title = toolDisplayTitle(cmd);
      const subtitle = COMMAND_SUBTITLES[cmd.name()] ?? CLI_ROOT_TAGLINE;
      return `\n${formatBoxHeader(title, subtitle)}\n\n${colored}`;
    },
  });
}
