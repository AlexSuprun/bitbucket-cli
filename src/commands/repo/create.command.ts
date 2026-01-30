/**
 * Create repository command implementation
 */

import chalk from "chalk";
import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IConfigService, IOutputService } from "../../core/interfaces/services.js";
import type { RepositoriesApi } from "../../generated/api.js";

export interface CreateRepoOptions {
  workspace?: string;
  description?: string;
  private?: boolean;
  public?: boolean;
  project?: string;
}

export class CreateRepoCommand extends BaseCommand<{ name: string } & CreateRepoOptions, void> {
  public readonly name = "create";
  public readonly description = "Create a new repository";

  constructor(
    private readonly repositoriesApi: RepositoriesApi,
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { name: string } & CreateRepoOptions,
    context: CommandContext
  ): Promise<void> {
    const { name, description, project } = options;
    const isPublic = options.public === true;

    const workspace = await this.resolveWorkspace(options.workspace);

    const request: {
      scm: string;
      name: string;
      is_private: boolean;
      description?: string;
      project?: { key: string };
    } = {
      scm: "git",
      name,
      is_private: !isPublic,
    };

    if (description) {
      request.description = description;
    }

    if (project) {
      request.project = { key: project };
    }

    try {
      const response = await this.repositoriesApi.repositoriesWorkspaceRepoSlugPost({
        workspace,
        body: request,
      });

      const repo = response.data;

      this.output.success(`Created repository ${repo.full_name}`);
      this.output.text(`  ${chalk.dim("URL:")} ${repo.links?.html?.href}`);

      const sshClone = repo.links?.clone?.find((c) => c.name === "ssh");
      if (sshClone) {
        this.output.text(`  ${chalk.dim("Clone:")} git clone ${sshClone.href}`);
      }
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }

  private async resolveWorkspace(workspace?: string): Promise<string> {
    if (workspace) {
      return workspace;
    }

    const config = await this.configService.getConfig();

    if (!config.defaultWorkspace) {
      throw new Error(
        "No workspace specified. Use --workspace option or set a default workspace."
      );
    }

    return config.defaultWorkspace;
  }
}
