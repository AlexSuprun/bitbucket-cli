/**
 * Add reviewer to PR command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IContextService, IOutputService } from "../../core/interfaces/services.js";
import type { PullrequestsApi } from "../../generated/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface AddReviewerPROptions extends GlobalOptions {
  id: string;
  username: string;
}

export class AddReviewerPRCommand extends BaseCommand<AddReviewerPROptions, void> {
  public readonly name = "reviewers.add";
  public readonly description = "Add a reviewer to a pull request";

  constructor(
    private readonly pullrequestsApi: PullrequestsApi,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: AddReviewerPROptions,
    context: CommandContext
  ): Promise<void> {
    const repoContext = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    const prId = parseInt(options.id, 10);

    try {
      await this.pullrequestsApi.repositoriesWorkspaceRepoSlugPullrequestsPullRequestIdPut({
        workspace: repoContext.workspace,
        repoSlug: repoContext.repoSlug,
        pullRequestId: prId,
        body: {
          reviewers: [
            { username: options.username },
          ],
        },
      });

      this.output.success(`Added ${options.username} as reviewer to pull request #${prId}`);
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }
}
