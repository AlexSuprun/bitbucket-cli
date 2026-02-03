/**
 * Set config command implementation
 */

import { BaseCommand } from '../../core/base-command.js';
import type { CommandContext } from '../../core/interfaces/commands.js';
import type {
  IConfigService,
  IOutputService,
} from '../../core/interfaces/services.js';
import {
  isSettableConfigKey,
  type SettableConfigKey,
} from '../../types/config.js';

export class SetConfigCommand extends BaseCommand<
  { key: string; value: string },
  void
> {
  public readonly name = 'set';
  public readonly description = 'Set a configuration value';

  private static readonly PROTECTED_KEYS = ['username', 'apiToken'];

  constructor(
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { key: string; value: string },
    _context: CommandContext
  ): Promise<void> {
    const { key, value } = options;

    // Check if key is protected
    if (SetConfigCommand.PROTECTED_KEYS.includes(key)) {
      throw new Error(
        `Cannot set '${key}' directly. Use 'bb auth login' to configure authentication.`
      );
    }

    // Check if key is valid
    if (!isSettableConfigKey(key)) {
      throw new Error(
        `Unknown config key '${key}'. Valid keys: defaultWorkspace`
      );
    }

    await this.configService.setValue(key, value);

    this.output.success(`Set ${key} = ${value}`);
  }
}
