/**
 * Login command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IConfigService, IOutputService } from "../../core/interfaces/services.js";
import type { UsersApi } from "../../generated/api.js";

export interface LoginOptions {
  username?: string;
  password?: string;
}

export class LoginCommand extends BaseCommand<LoginOptions, void> {
  public readonly name = "login";
  public readonly description = "Authenticate with Bitbucket using an API token";

  constructor(
    private readonly configService: IConfigService,
    private readonly usersApi: UsersApi,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: LoginOptions,
    context: CommandContext
  ): Promise<void> {
    const username = options.username || process.env.BB_USERNAME;
    const apiToken = options.password || process.env.BB_API_TOKEN;

    if (!username) {
      const error = new Error(
        "Username is required. Use --username option or set BB_USERNAME environment variable."
      );
      this.output.error(error.message);
      throw error;
    }

    if (!apiToken) {
      const error = new Error(
        "API token is required. Use --password option or set BB_API_TOKEN environment variable."
      );
      this.output.error(error.message);
      throw error;
    }

    await this.configService.setCredentials({ username, apiToken });

    try {
      const response = await this.usersApi.userGet();
      const user = response.data;

      this.output.success(`Logged in as ${user.display_name} (${user.username})`);
    } catch (error) {
      await this.configService.clearConfig();
      this.output.error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
