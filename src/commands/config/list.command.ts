/**
 * List config command implementation
 */

import chalk from "chalk";
import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IConfigService, IOutputService } from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import type { BBConfig } from "../../types/config.js";

export interface ConfigDisplay {
  username: string;
  defaultWorkspace: string;
  apiToken: string;
}

export class ListConfigCommand extends BaseCommand<void, ConfigDisplay> {
  public readonly name = "list";
  public readonly description = "List all configuration values";

  constructor(
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    _options: void,
    context: CommandContext
  ): Promise<Result<ConfigDisplay, BBError>> {
    const configResult = await this.configService.getConfig();
    if (!configResult.success) {
      this.handleResult(configResult, context);
      return configResult;
    }

    const config = configResult.value;

    // Build display config with masked password
    const displayConfig: ConfigDisplay = {
      username: config.username || "",
      defaultWorkspace: config.defaultWorkspace || "",
      apiToken: config.apiToken ? "********" : "",
    };

    this.handleResult(Result.ok(displayConfig), context, (data) => {
      this.output.text(chalk.dim(`Config file: ${this.configService.getConfigPath()}`));
      this.output.text("");

      const rows = Object.entries(data)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => [key, value]);

      if (rows.length === 0) {
        this.output.text("No configuration set");
        return;
      }

      this.output.table(["KEY", "VALUE"], rows);
    });

    return Result.ok(displayConfig);
  }
}
