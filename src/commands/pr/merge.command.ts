/**
 * Merge PR command implementation
 */

import { BaseCommand } from '../../core/base-command.js';
import type { CommandContext } from '../../core/interfaces/commands.js';
import type {
  IContextService,
  IOutputService,
} from '../../core/interfaces/services.js';
import type {
  PullrequestsApi,
  PullrequestMergeParametersMergeStrategyEnum,
} from '../../generated/api.js';
import type { GlobalOptions } from '../../types/config.js';

export interface MergePROptions extends GlobalOptions {
  message?: string;
  closeSourceBranch?: boolean;
  strategy?: string;
}

export class MergePRCommand extends BaseCommand<
  { id: string } & MergePROptions,
  void
> {
  public readonly name = 'merge';
  public readonly description = 'Merge a pull request';

  constructor(
    private readonly pullrequestsApi: PullrequestsApi,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & MergePROptions,
    context: CommandContext
  ): Promise<void> {
    const repoContext = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    const prId = parseInt(options.id, 10);

    const request: {
      type: 'pullrequest_merge_parameters';
      message?: string;
      close_source_branch?: boolean;
      merge_strategy?: PullrequestMergeParametersMergeStrategyEnum;
    } = {
      type: 'pullrequest_merge_parameters',
    };

    if (options.message) {
      request.message = options.message;
    }

    if (options.closeSourceBranch) {
      request.close_source_branch = true;
    }

    if (options.strategy) {
      request.merge_strategy =
        options.strategy as PullrequestMergeParametersMergeStrategyEnum;
    }

    try {
      const response =
        await this.pullrequestsApi.repositoriesWorkspaceRepoSlugPullrequestsPullRequestIdMergePost(
          {
            workspace: repoContext.workspace,
            repoSlug: repoContext.repoSlug,
            pullRequestId: prId,
            body: request,
          }
        );

      const pr = response.data;

      this.output.success(`Merged pull request #${prId}: ${pr.title}`);
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }
}
