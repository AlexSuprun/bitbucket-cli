/**
 * Logout command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IConfigService, IOutputService } from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";

export class LogoutCommand extends BaseCommand<void, void> {
  public readonly name = "logout";
  public readonly description = "Log out of Bitbucket";

  constructor(
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    _options: void,
    context: CommandContext
  ): Promise<Result<void, BBError>> {
    const result = await this.configService.clearConfig();

    this.handleResult(result, context, () => {
      this.output.success("Logged out of Bitbucket");
    });

    return result;
  }
}
