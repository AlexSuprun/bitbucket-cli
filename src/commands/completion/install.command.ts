/**
 * Install completion command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IOutputService } from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import tabtab from "tabtab";

export class InstallCompletionCommand extends BaseCommand<void, void> {
  public readonly name = "install";
  public readonly description = "Install shell completions";

  constructor(output: IOutputService) {
    super(output);
  }

  public async execute(
    _options: void,
    _context: CommandContext
  ): Promise<Result<void, BBError>> {
    try {
      await tabtab.install({
        name: "bb",
        completer: "bb",
      });
      this.output.success("Shell completions installed successfully!");
      this.output.text("Restart your shell or source your profile to enable completions.");
      return Result.ok(undefined);
    } catch (error) {
      this.output.error(`Failed to install completions: ${error}`);
      return Result.ok(undefined);
    }
  }
}
