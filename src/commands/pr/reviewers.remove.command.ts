/**
 * Remove reviewer from PR command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IContextService, IOutputService } from "../../core/interfaces/services.js";
import type { PullrequestsApi } from "../../generated/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface RemoveReviewerPROptions extends GlobalOptions {
  id: string;
  username: string;
}

export class RemoveReviewerPRCommand extends BaseCommand<RemoveReviewerPROptions, void> {
  public readonly name = "reviewers.remove";
  public readonly description = "Remove a reviewer from a pull request";

  constructor(
    private readonly pullrequestsApi: PullrequestsApi,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: RemoveReviewerPROptions,
    context: CommandContext
  ): Promise<void> {
    const repoContext = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    const prId = parseInt(options.id, 10);

    try {
      // First get the current PR to see existing reviewers
      const prResponse = await this.pullrequestsApi.repositoriesWorkspaceRepoSlugPullrequestsPullRequestIdGet({
        workspace: repoContext.workspace,
        repoSlug: repoContext.repoSlug,
        pullRequestId: prId,
      });

      const pr = prResponse.data;
      const currentReviewers = pr.reviewers ?? [];
      
      // Filter out the reviewer to remove
      const updatedReviewers = currentReviewers.filter(
        (r) => r.username !== options.username
      );

      await this.pullrequestsApi.repositoriesWorkspaceRepoSlugPullrequestsPullRequestIdPut({
        workspace: repoContext.workspace,
        repoSlug: repoContext.repoSlug,
        pullRequestId: prId,
        body: {
          reviewers: updatedReviewers,
        },
      });

      this.output.success(`Removed ${options.username} as reviewer from pull request #${prId}`);
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }
}
