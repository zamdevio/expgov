import { line, tipLine } from '../ansi/index.js';

export const logger = {
  info(msg: string): void {
    console.log(line('info', msg));
  },
  notice(msg: string): void {
    console.warn(line('notice', msg));
  },
  warn(msg: string): void {
    console.warn(line('warn', msg));
  },
  err(msg: string): void {
    console.error(line('error', msg));
  },
  tip(msg: string): void {
    console.log(tipLine(msg));
  },
  decorative: {
    dim(msg: string): void {
      console.log(msg);
    },
  },
};
