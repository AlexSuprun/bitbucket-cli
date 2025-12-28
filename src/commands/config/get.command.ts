/**
 * Get config command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IConfigService, IOutputService } from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import { BBError, ErrorCode } from "../../types/errors.js";
import { isReadableConfigKey, type ReadableConfigKey } from "../../types/config.js";

export class GetConfigCommand extends BaseCommand<{ key: string }, string | undefined> {
  public readonly name = "get";
  public readonly description = "Get a configuration value";

  private static readonly HIDDEN_KEYS = ["appPassword"];

  constructor(
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { key: string },
    context: CommandContext
  ): Promise<Result<string | undefined, BBError>> {
    const { key } = options;

    // Check if key is hidden
    if (GetConfigCommand.HIDDEN_KEYS.includes(key)) {
      const error = new BBError({
        code: ErrorCode.CONFIG_INVALID_KEY,
        message: `Cannot display '${key}' - use 'bb auth token' to get authentication credentials`,
      });
      this.output.error(error.message);
      if (process.env.NODE_ENV !== "test") {
        process.exitCode = 1;
      }
      return Result.err(error);
    }

    // Check if key is valid
    if (!isReadableConfigKey(key)) {
      const error = new BBError({
        code: ErrorCode.CONFIG_INVALID_KEY,
        message: `Unknown config key '${key}'. Valid keys: username, defaultWorkspace`,
      });
      this.output.error(error.message);
      if (process.env.NODE_ENV !== "test") {
        process.exitCode = 1;
      }
      return Result.err(error);
    }

    const valueResult = await this.configService.getValue(key as ReadableConfigKey);
    if (!valueResult.success) {
      this.handleResult(valueResult, context);
      return valueResult;
    }

    const value = valueResult.value as string | undefined;

    // Output the value (or empty string if undefined)
    this.output.text(value || "");

    return Result.ok(value);
  }
}
