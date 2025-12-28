/**
 * Clone command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IGitService,
  IConfigService,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import { BBError, ErrorCode, ValidationError } from "../../types/errors.js";

export interface CloneOptions {
  directory?: string;
}

export interface CloneResult {
  url: string;
  directory: string;
}

export class CloneCommand extends BaseCommand<
  { repository: string } & CloneOptions,
  CloneResult
> {
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
  ): Promise<Result<CloneResult, BBError>> {
    const { repository, directory } = options;

    // Resolve repository URL
    const urlResult = await this.resolveRepositoryUrl(repository);
    if (!urlResult.success) {
      this.handleResult(urlResult, context);
      return urlResult;
    }

    const repoUrl = urlResult.value;

    // Clone the repository
    const cloneResult = await this.gitService.clone(repoUrl, directory);
    if (!cloneResult.success) {
      this.handleResult(cloneResult, context);
      return cloneResult;
    }

    const targetDir = directory || this.extractRepoName(repository);
    const result: CloneResult = {
      url: repoUrl,
      directory: targetDir,
    };

    this.handleResult(Result.ok(result), context, () => {
      this.output.success(`Cloned ${repository} into ${targetDir}`);
    });

    return Result.ok(result);
  }

  private async resolveRepositoryUrl(repository: string): Promise<Result<string, BBError>> {
    // If it's already a full URL, return it
    if (repository.includes("://") || repository.startsWith("git@")) {
      return Result.ok(repository);
    }

    const parts = repository.split("/");

    let workspace: string;
    let repoSlug: string;

    if (parts.length === 1) {
      // Just repo name, use default workspace
      const configResult = await this.configService.getConfig();
      if (!configResult.success) {
        return configResult;
      }

      if (!configResult.value.defaultWorkspace) {
        return Result.err(
          new ValidationError(
            "repository",
            "No workspace specified. Use workspace/repo format or set a default workspace."
          )
        );
      }

      workspace = configResult.value.defaultWorkspace;
      repoSlug = parts[0];
    } else if (parts.length === 2) {
      workspace = parts[0];
      repoSlug = parts[1];
    } else {
      return Result.err(
        new ValidationError(
          "repository",
          "Invalid repository format. Use workspace/repo or a full URL."
        )
      );
    }

    // Use SSH URL by default
    return Result.ok(`git@bitbucket.org:${workspace}/${repoSlug}.git`);
  }

  private extractRepoName(repository: string): string {
    const parts = repository.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(".git", "");
  }
}
