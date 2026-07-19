/** Stable JSON block so agents/users see list truncation + how to expand. */
export type JsonListGuidance = {
  truncated: boolean;
  /** Present when any listed section still has hidden rows. */
  note?: string;
};

export type JsonListGuidanceSection = {
  /** Field name in `data` (e.g. `symbols`, `rows`). */
  name: string;
  shown: number;
  hidden: number;
};
