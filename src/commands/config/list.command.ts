/**
 * List config command implementation
 */

import { BaseCommand } from '../../core/base-command.js';
import type { CommandContext } from '../../core/interfaces/commands.js';
import type {
  IConfigService,
  IOutputService,
} from '../../core/interfaces/services.js';

export interface ConfigDisplay {
  username: string;
  defaultWorkspace: string;
  apiToken: string;
}

export class ListConfigCommand extends BaseCommand<void, void> {
  public readonly name = 'list';
  public readonly description = 'List all configuration values';

  constructor(
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(_options: void, context: CommandContext): Promise<void> {
    const config = await this.configService.getConfig();

    // Build display config with masked password
    const displayConfig: ConfigDisplay = {
      username: config.username || '',
      defaultWorkspace: config.defaultWorkspace || '',
      apiToken: config.apiToken ? '********' : '',
    };

    if (context.globalOptions.json) {
      this.output.json({
        configPath: this.configService.getConfigPath(),
        config: Object.fromEntries(
          Object.entries(displayConfig).filter(([, value]) => value !== '')
        ),
      });
      return;
    }

    this.output.text(
      this.output.dim(`Config file: ${this.configService.getConfigPath()}`)
    );
    this.output.text('');

    const rows = Object.entries(displayConfig)
      .filter(([, value]) => value !== '')
      .map(([key, value]) => [key, value]);

    if (rows.length === 0) {
      this.output.text('No configuration set');
      return;
    }

    this.output.table(['KEY', 'VALUE'], rows);
  }
}
