/**
 * Command interfaces for the command pattern
 */

import type { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import type { GlobalOptions } from "../../types/config.js";

/**
 * Base command context passed to all commands
 */
export interface CommandContext {
  globalOptions: GlobalOptions;
}

/**
 * Base interface for all commands
 */
export interface ICommand<TOptions = unknown, TResult = void> {
  readonly name: string;
  readonly description: string;

  execute(options: TOptions, context: CommandContext): Promise<Result<TResult, BBError>>;
}

/**
 * Command with validation
 */
export interface IValidatedCommand<TOptions = unknown, TResult = void> extends ICommand<TOptions, TResult> {
  validate(options: TOptions): Result<void, BBError>;
}

/**
 * Command metadata for registration
 */
export interface CommandMetadata {
  name: string;
  description: string;
  arguments?: ArgumentDefinition[];
  options?: OptionDefinition[];
}

export interface ArgumentDefinition {
  name: string;
  description: string;
  required?: boolean;
}

export interface OptionDefinition {
  flags: string;
  description: string;
  defaultValue?: unknown;
}
