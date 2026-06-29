import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/** Namespaced temp root: `<os.tmpdir()>/expgov/<label>-<random>/` */
export const EXPGOV_TMP_ROOT = path.join(tmpdir(), 'expgov');

export function createExpgovTmpDir(label: string): string {
  mkdirSync(EXPGOV_TMP_ROOT, { recursive: true });
  const dir = mkdtempSync(path.join(EXPGOV_TMP_ROOT, `${label}-`));
  return dir;
}

export function writeRepoFiles(root: string, files: Record<string, string>): void {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content, 'utf8');
  }
}

export function removeExpgovTmpDir(root: string): void {
  const normalizedRoot = path.resolve(root);
  const normalizedBase = path.resolve(EXPGOV_TMP_ROOT);
  if (!normalizedRoot.startsWith(normalizedBase + path.sep)) return;
  rmSync(normalizedRoot, { recursive: true, force: true });
}

export class ExpgovTmpFixture {
  readonly root: string;

  constructor(label: string) {
    this.root = createExpgovTmpDir(label);
  }

  write(files: Record<string, string>): void {
    writeRepoFiles(this.root, files);
  }

  cleanup(): void {
    removeExpgovTmpDir(this.root);
  }
}
