/** Root program options from Commander (`expgov` global flags). */
export interface GlobalOpts {
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

/** Subset of global opts read when formatting help output. */
export type HelpOutputOpts = Pick<GlobalOpts, 'json' | 'silent'>;
