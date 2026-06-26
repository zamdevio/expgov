let yesFromArgv = false;

export function setCliYesFlag(value: boolean): void {
  yesFromArgv = value;
}

export function getCliYesFlag(): boolean {
  return yesFromArgv;
}

export function resetCliGlobals(): void {
  yesFromArgv = false;
}
