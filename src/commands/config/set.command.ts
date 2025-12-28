/**
 * Set config command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IConfigService, IOutputService } from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import { BBError, ErrorCode } from "../../types/errors.js";
import { isSettableConfigKey, type SettableConfigKey } from "../../types/config.js";

export class SetConfigCommand extends BaseCommand<{ key: string; value: string }, void> {
  public readonly name = "set";
  public readonly description = "Set a configuration value";

  private static readonly PROTECTED_KEYS = ["username", "appPassword"];

  constructor(
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { key: string; value: string },
    context: CommandContext
  ): Promise<Result<void, BBError>> {
    const { key, value } = options;

    // Check if key is protected
    if (SetConfigCommand.PROTECTED_KEYS.includes(key)) {
      const error = new BBError({
        code: ErrorCode.CONFIG_INVALID_KEY,
        message: `Cannot set '${key}' directly. Use 'bb auth login' to configure authentication.`,
      });
      this.output.error(error.message);
      if (process.env.NODE_ENV !== "test") {
        process.exitCode = 1;
      }
      return Result.err(error);
    }

    // Check if key is valid
    if (!isSettableConfigKey(key)) {
      const error = new BBError({
        code: ErrorCode.CONFIG_INVALID_KEY,
        message: `Unknown config key '${key}'. Valid keys: defaultWorkspace`,
      });
      this.output.error(error.message);
      if (process.env.NODE_ENV !== "test") {
        process.exitCode = 1;
      }
      return Result.err(error);
    }

    const result = await this.configService.setValue(key as SettableConfigKey, value);

    this.handleResult(result, context, () => {
      this.output.success(`Set ${key} = ${value}`);
    });

    return result;
  }
}
