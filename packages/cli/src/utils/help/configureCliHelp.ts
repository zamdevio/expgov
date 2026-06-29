import { Help, type Command } from 'commander';

import { CLI_NAME, CLI_ROOT_TAGLINE } from '../../constants/cli.js';
import { formatBoxHeader, style } from '@expgov/core';
import { formatCommandHelpExtras } from './commandHelp.js';
import { styleCommandHelpTerm } from './term.js';
import { formatWorkflowAppendix } from './workflowAppendix.js';

const SECTION_HEADER = /^(Options|Commands|Arguments|Global Options|Examples|Related):$/;
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
  let section: 'none' | 'arguments' | 'options' | 'commands' | 'global-options' | 'examples' | 'related' =
    'none';
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
      else if (line === 'Examples:') section = 'examples';
      else if (line === 'Related:') section = 'related';
      out.push(styleSectionHeader(line));
      continue;
    }
    if (line === '') {
      section = 'none';
      out.push('');
      continue;
    }
    if (section === 'examples' && /^\s{2}\S/.test(line)) {
      out.push(`  ${style.bold(style.accent(line.trim()))}`);
      continue;
    }
    if (section === 'related' && /^\s{2}\S/.test(line)) {
      const parts = line.trim().split(/\s+·\s+/);
      const styled = parts.map((part) => styleCommandHelpTerm(part.trim())).join(style.dim('  ·  '));
      out.push(`  ${styled}`);
      continue;
    }
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
  version: 'CLI and SDK versions',
};

export function configureCliHelp(program: Command): void {
  program.configureHelp({
    formatHelp(cmd: Command, helper: Help) {
      const raw = Help.prototype.formatHelp.call(helper, cmd, helper);
      const extras = formatCommandHelpExtras(cmd.name());
      const colored = colorizeHelpText(extras ? `${raw}${extras}` : raw);
      const root = cmd.parent ?? cmd;
      const opts = root.opts<{ json?: boolean; silent?: boolean }>();
      if (opts.json || opts.silent) return colored;
      const title = toolDisplayTitle(cmd);
      const subtitle = COMMAND_SUBTITLES[cmd.name()] ?? CLI_ROOT_TAGLINE;
      let out = `\n${formatBoxHeader(title, subtitle)}\n\n${colored}`;
      if (!cmd.parent) out += formatWorkflowAppendix();
      return out;
    },
  });
}
