/**
 * Login command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IConfigService,
  IUserRepository,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import { ValidationError } from "../../types/errors.js";
import type { BitbucketUser } from "../../types/api.js";
import { HttpClient } from "../../services/http.client.js";

export interface LoginOptions {
  username?: string;
  password?: string;
}

export class LoginCommand extends BaseCommand<LoginOptions, BitbucketUser> {
  public readonly name = "login";
  public readonly description = "Authenticate with Bitbucket using an app password";

  constructor(
    private readonly configService: IConfigService,
    private readonly userRepositoryFactory: (configService: IConfigService) => IUserRepository,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: LoginOptions,
    context: CommandContext
  ): Promise<Result<BitbucketUser, BBError>> {
    // Get credentials from options or environment
    const username = options.username || process.env.BB_USERNAME;
    const appPassword = options.password || process.env.BB_APP_PASSWORD;

    // Validate credentials
    if (!username) {
      const error = Result.err(
        new ValidationError(
          "username",
          "Username is required. Use --username option or set BB_USERNAME environment variable."
        )
      );
      this.handleResult(error, context);
      return error;
    }

    if (!appPassword) {
      const error = Result.err(
        new ValidationError(
          "password",
          "App password is required. Use --password option or set BB_APP_PASSWORD environment variable."
        )
      );
      this.handleResult(error, context);
      return error;
    }

    // Store credentials temporarily to test them
    const setResult = await this.configService.setCredentials({ username, appPassword });
    if (!setResult.success) {
      this.handleResult(setResult, context);
      return setResult;
    }

    // Verify credentials by fetching user info
    const userRepository = this.userRepositoryFactory(this.configService);
    const userResult = await userRepository.getCurrentUser();

    if (!userResult.success) {
      // Clear invalid credentials
      await this.configService.clearConfig();
      this.output.error(`Authentication failed: ${userResult.error.message}`);
      return userResult;
    }

    // Output result
    const user = userResult.value;
    this.handleResult(userResult, context, () => {
      this.output.success(`Logged in as ${user.display_name} (${user.username})`);
    });

    return userResult;
  }
}
