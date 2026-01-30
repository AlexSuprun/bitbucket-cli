/**
 * Clone command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IGitService, IConfigService, IOutputService } from "../../core/interfaces/services.js";

export interface CloneOptions {
  directory?: string;
}

export class CloneCommand extends BaseCommand<{ repository: string } & CloneOptions, void> {
  public readonly name = "clone";
  public readonly description = "Clone a Bitbucket repository";

  constructor(
    private readonly gitService: IGitService,
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { repository: string } & CloneOptions,
    context: CommandContext
  ): Promise<void> {
    const { repository, directory } = options;

    const repoUrl = await this.resolveRepositoryUrl(repository);
    await this.gitService.clone(repoUrl, directory);

    const targetDir = directory || this.extractRepoName(repository);
    this.output.success(`Cloned ${repository} into ${targetDir}`);
  }

  private async resolveRepositoryUrl(repository: string): Promise<string> {
    if (repository.includes("://") || repository.startsWith("git@")) {
      return repository;
    }

    const parts = repository.split("/");

    let workspace: string;
    let repoSlug: string;

    if (parts.length === 1) {
      const config = await this.configService.getConfig();

      if (!config.defaultWorkspace) {
        throw new Error(
          "No workspace specified. Use workspace/repo format or set a default workspace."
        );
      }

      workspace = config.defaultWorkspace;
      repoSlug = parts[0];
    } else if (parts.length === 2) {
      workspace = parts[0];
      repoSlug = parts[1];
    } else {
      throw new Error(
        "Invalid repository format. Use workspace/repo or a full URL."
      );
    }

    return `git@bitbucket.org:${workspace}/${repoSlug}.git`;
  }

  private extractRepoName(repository: string): string {
    const parts = repository.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(".git", "");
  }
}
