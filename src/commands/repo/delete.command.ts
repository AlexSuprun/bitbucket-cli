/**
 * Delete repository command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IRepoRepository,
  IContextService,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import { BBError, ValidationError } from "../../types/errors.js";
import type { GlobalOptions } from "../../types/config.js";

export interface DeleteRepoOptions extends GlobalOptions {
  yes?: boolean;
}

export class DeleteRepoCommand extends BaseCommand<
  { repository: string } & DeleteRepoOptions,
  void
> {
  public readonly name = "delete";
  public readonly description = "Delete a repository";

  constructor(
    private readonly repoRepository: IRepoRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { repository: string } & DeleteRepoOptions,
    context: CommandContext
  ): Promise<Result<void, BBError>> {
    const { repository, yes } = options;

    // Parse repository argument
    let contextOptions = { ...context.globalOptions, ...options };
    const parts = repository.split("/");

    if (parts.length === 2) {
      contextOptions.workspace = parts[0];
      contextOptions.repo = parts[1];
    } else {
      contextOptions.repo = repository;
    }

    // Require repository context
    const repoContextResult = await this.contextService.requireRepoContext(contextOptions);
    if (!repoContextResult.success) {
      this.handleResult(repoContextResult, context);
      return repoContextResult;
    }

    const { workspace, repoSlug } = repoContextResult.value;

    // Require confirmation
    if (!yes) {
      const error = new ValidationError(
        "yes",
        `This will permanently delete ${workspace}/${repoSlug}.\n` +
          "Use --yes to confirm deletion."
      );
      this.output.error(error.message);
      process.exitCode = 1;
      return Result.err(error);
    }

    // Delete repository
    const result = await this.repoRepository.delete(workspace, repoSlug);

    this.handleResult(result, context, () => {
      this.output.success(`Deleted repository ${workspace}/${repoSlug}`);
    });

    return result;
  }
}
