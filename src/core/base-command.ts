/**
 * Base command class with common functionality
 */

import type { ICommand, CommandContext } from './interfaces/commands.js';
import type { IOutputService } from './interfaces/services.js';
import { BBError, ErrorCode } from '../types/errors.js';

export abstract class BaseCommand<
  TOptions = unknown,
  TResult = void,
> implements ICommand<TOptions, TResult> {
  public abstract readonly name: string;
  public abstract readonly description: string;

  constructor(protected readonly output: IOutputService) {}

  public abstract execute(
    options: TOptions,
    context: CommandContext
  ): Promise<TResult>;

  /**
   * Execute the command with error handling
   */
  public async run(
    options: TOptions,
    context: CommandContext
  ): Promise<TResult> {
    try {
      return await this.execute(options, context);
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }

  /**
   * Handle command error - output error and set exit code
   */
  protected handleError(error: unknown, context: CommandContext): void {
    if (error instanceof Error) {
      this.output.error(error.message);
    } else {
      this.output.error(String(error));
    }
    // Only set exit code in production - during tests this causes false failures
    // because the exit code persists across test files
    if (process.env.NODE_ENV !== 'test') {
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
  ): T {
    if (value === undefined || value === null || value === '') {
      throw new BBError({
        code: ErrorCode.VALIDATION_REQUIRED,
        message: message || `Option --${name} is required`,
      });
    }
    return value;
  }
}
