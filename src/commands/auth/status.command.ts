/**
 * Status command implementation
 */

import chalk from 'chalk';
import { BaseCommand } from '../../core/base-command.js';
import type { CommandContext } from '../../core/interfaces/commands.js';
import type {
  IConfigService,
  IOutputService,
} from '../../core/interfaces/services.js';
import type { UsersApi } from '../../generated/api.js';

export interface AuthStatus {
  authenticated: boolean;
  user?: {
    username: string;
    display_name: string;
    account_id: string;
  };
  defaultWorkspace?: string;
}

export class StatusCommand extends BaseCommand<void, void> {
  public readonly name = 'status';
  public readonly description = 'Show authentication status';

  constructor(
    private readonly configService: IConfigService,
    private readonly usersApi: UsersApi,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    _options: void,
    _context: CommandContext
  ): Promise<void> {
    const config = await this.configService.getConfig();

    // Check if credentials exist
    if (!config.username || !config.apiToken) {
      this.output.info('Not logged in');
      this.output.text(`Run ${chalk.cyan('bb auth login')} to authenticate.`);
      return;
    }

    // Verify credentials by fetching user info
    try {
      const response = await this.usersApi.userGet();
      const user = response.data;

      this.output.success('Logged in to Bitbucket');
      this.output.text(`  Username: ${chalk.cyan(user.username)}`);
      this.output.text(`  Display name: ${user.display_name}`);
      this.output.text(`  Account ID: ${user.account_id}`);

      if (config.defaultWorkspace) {
        this.output.text(
          `  Default workspace: ${chalk.cyan(config.defaultWorkspace)}`
        );
      }
    } catch (error) {
      throw new Error(
        `Authentication is invalid or expired. Run ${chalk.cyan('bb auth login')} to re-authenticate.`
      );
    }
  }
}
