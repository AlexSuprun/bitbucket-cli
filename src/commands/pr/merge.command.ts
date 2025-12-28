/**
 * Merge PR command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IPullRequestRepository,
  IContextService,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import type {
  BitbucketPullRequest,
  MergePullRequestRequest,
  MergeStrategy,
} from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface MergePROptions extends GlobalOptions {
  message?: string;
  closeSourceBranch?: boolean;
  strategy?: string;
}

export class MergePRCommand extends BaseCommand<
  { id: string } & MergePROptions,
  BitbucketPullRequest
> {
  public readonly name = "merge";
  public readonly description = "Merge a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & MergePROptions,
    context: CommandContext
  ): Promise<Result<BitbucketPullRequest, BBError>> {
    // Get repository context
    const repoContextResult = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    if (!repoContextResult.success) {
      this.handleResult(repoContextResult, context);
      return repoContextResult;
    }

    const { workspace, repoSlug } = repoContextResult.value;
    const prId = parseInt(options.id, 10);

    // Build merge request
    const request: MergePullRequestRequest = {};

    if (options.message) {
      request.message = options.message;
    }

    if (options.closeSourceBranch) {
      request.close_source_branch = true;
    }

    if (options.strategy) {
      request.merge_strategy = options.strategy as MergeStrategy;
    }

    // Merge pull request
    const result = await this.prRepository.merge(workspace, repoSlug, prId, request);

    this.handleResult(result, context, (pr) => {
      this.output.success(`Merged pull request #${prId}: ${pr.title}`);
    });

    return result;
  }
}
