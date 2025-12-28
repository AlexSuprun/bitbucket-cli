/**
 * Base command class with common functionality
 */

import type { ICommand, CommandContext } from "./interfaces/commands.js";
import type { IOutputService } from "./interfaces/services.js";
import { Result } from "../types/result.js";
import type { BBError } from "../types/errors.js";

export abstract class BaseCommand<TOptions = unknown, TResult = void>
  implements ICommand<TOptions, TResult>
{
  public abstract readonly name: string;
  public abstract readonly description: string;

  constructor(protected readonly output: IOutputService) {}

  public abstract execute(
    options: TOptions,
    context: CommandContext
  ): Promise<Result<TResult, BBError>>;

  /**
   * Handle command result - output success or error
   */
  protected handleResult<T>(
    result: Result<T, BBError>,
    context: CommandContext,
    formatOutput?: (data: T) => void
  ): void {
    if (result.success) {
      if (context.globalOptions.json && result.value !== undefined) {
        this.output.json(result.value);
      } else if (formatOutput) {
        formatOutput(result.value);
      }
    } else {
      this.output.error(result.error.message);
      process.exitCode = 1;
    }
  }

  /**
   * Validate required option
   */
  protected requireOption<T>(
    value: T | undefined,
    name: string,
    message?: string
  ): Result<T, BBError> {
    if (value === undefined || value === null || value === "") {
      return Result.err({
        code: 5001,
        message: message || `Option --${name} is required`,
        name: "ValidationError",
      } as BBError);
    }
    return Result.ok(value);
  }
}
