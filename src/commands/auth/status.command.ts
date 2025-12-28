/**
 * Status command implementation
 */

import chalk from "chalk";
import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IConfigService,
  IUserRepository,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import type { BitbucketUser } from "../../types/api.js";

export interface AuthStatus {
  authenticated: boolean;
  user?: BitbucketUser;
  defaultWorkspace?: string;
}

export class StatusCommand extends BaseCommand<void, AuthStatus> {
  public readonly name = "status";
  public readonly description = "Show authentication status";

  constructor(
    private readonly configService: IConfigService,
    private readonly userRepository: IUserRepository,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    _options: void,
    context: CommandContext
  ): Promise<Result<AuthStatus, BBError>> {
    const configResult = await this.configService.getConfig();
    if (!configResult.success) {
      return configResult;
    }

    const config = configResult.value;

    // Check if credentials exist
    if (!config.username || !config.appPassword) {
      const status: AuthStatus = { authenticated: false };

      this.handleResult(Result.ok(status), context, () => {
        this.output.info("Not logged in");
        this.output.text(`Run ${chalk.cyan("bb auth login")} to authenticate.`);
      });

      return Result.ok(status);
    }

    // Verify credentials by fetching user info
    const userResult = await this.userRepository.getCurrentUser();

    if (!userResult.success) {
      const status: AuthStatus = { authenticated: false };

      this.handleResult(Result.ok(status), context, () => {
        this.output.error("Authentication is invalid or expired");
        this.output.text(`Run ${chalk.cyan("bb auth login")} to re-authenticate.`);
      });

      return Result.ok(status);
    }

    const user = userResult.value;
    const status: AuthStatus = {
      authenticated: true,
      user,
      defaultWorkspace: config.defaultWorkspace,
    };

    this.handleResult(Result.ok(status), context, () => {
      this.output.success("Logged in to Bitbucket");
      this.output.text(`  Username: ${chalk.cyan(user.username)}`);
      this.output.text(`  Display name: ${user.display_name}`);
      this.output.text(`  Account ID: ${user.account_id}`);

      if (config.defaultWorkspace) {
        this.output.text(`  Default workspace: ${chalk.cyan(config.defaultWorkspace)}`);
      }
    });

    return Result.ok(status);
  }
}
