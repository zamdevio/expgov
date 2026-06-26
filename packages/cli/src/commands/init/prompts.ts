import { confirm } from '@inquirer/prompts';

import { CONFIG_FILE_NAME } from '../../constants/cli.js';

export async function confirmWriteConfig(filePath: string, overwrite = false): Promise<boolean> {
  return confirm({
    message: overwrite ? `Overwrite ${filePath}?` : `Create ${filePath}?`,
    default: overwrite ? false : true,
  });
}

export async function confirmOverwriteExisting(): Promise<boolean> {
  return confirm({
    message: `${CONFIG_FILE_NAME} already exists. Overwrite?`,
    default: false,
  });
}
