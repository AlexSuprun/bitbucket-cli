/**
 * Token command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IConfigService, IOutputService } from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";

export class TokenCommand extends BaseCommand<void, string> {
  public readonly name = "token";
  public readonly description = "Print the current access token";

  constructor(
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    _options: void,
    _context: CommandContext
  ): Promise<Result<string, BBError>> {
    const credentialsResult = await this.configService.getCredentials();
    if (!credentialsResult.success) {
      this.output.error(credentialsResult.error.message);
      if (process.env.NODE_ENV !== "test") {
        process.exitCode = 1;
      }
      return credentialsResult;
    }

    const { username, appPassword } = credentialsResult.value;
    const token = Buffer.from(`${username}:${appPassword}`).toString("base64");

    // Always output the raw token (not JSON formatted)
    this.output.text(token);

    return Result.ok(token);
  }
}
