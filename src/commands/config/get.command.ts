/**
 * Get config command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IConfigService, IOutputService } from "../../core/interfaces/services.js";
import { isReadableConfigKey, type ReadableConfigKey } from "../../types/config.js";

export class GetConfigCommand extends BaseCommand<{ key: string }, void> {
  public readonly name = "get";
  public readonly description = "Get a configuration value";

  private static readonly HIDDEN_KEYS = ["apiToken"];

  constructor(
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { key: string },
    _context: CommandContext
  ): Promise<void> {
    const { key } = options;

    // Check if key is hidden
    if (GetConfigCommand.HIDDEN_KEYS.includes(key)) {
      const error = new Error(
        `Cannot display '${key}' - use 'bb auth token' to get authentication credentials`
      );
      this.output.error(error.message);
      throw error;
    }

    // Check if key is valid
    if (!isReadableConfigKey(key)) {
      const error = new Error(
        `Unknown config key '${key}'. Valid keys: username, defaultWorkspace`
      );
      this.output.error(error.message);
      throw error;
    }

    const value = await this.configService.getValue(key as ReadableConfigKey);

    // Output the value (or empty string if undefined)
    this.output.text(String(value || ""));
  }
}
