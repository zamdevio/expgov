export interface SourceReader {
  read(repoRelativePath: string): string | null;
}
