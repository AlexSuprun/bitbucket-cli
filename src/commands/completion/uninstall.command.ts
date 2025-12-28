/**
 * Uninstall completion command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IOutputService } from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import tabtab from "tabtab";

export class UninstallCompletionCommand extends BaseCommand<void, void> {
  public readonly name = "uninstall";
  public readonly description = "Uninstall shell completions";

  constructor(output: IOutputService) {
    super(output);
  }

  public async execute(
    _options: void,
    _context: CommandContext
  ): Promise<Result<void, BBError>> {
    try {
      await tabtab.uninstall({
        name: "bb",
      });
      this.output.success("Shell completions uninstalled successfully!");
      return Result.ok(undefined);
    } catch (error) {
      this.output.error(`Failed to uninstall completions: ${error}`);
      return Result.ok(undefined);
    }
  }
}
