/**
 * Edit comment on PR command implementation
 */

import { BaseCommand } from '../../core/base-command.js';
import type { CommandContext } from '../../core/interfaces/commands.js';
import type {
  IContextService,
  IOutputService,
} from '../../core/interfaces/services.js';
import type { PullrequestsApi } from '../../generated/api.js';
import type { GlobalOptions } from '../../types/config.js';

export interface EditCommentPROptions extends GlobalOptions {}

export class EditCommentPRCommand extends BaseCommand<
  { prId: string; commentId: string; message: string } & EditCommentPROptions,
  void
> {
  public readonly name = 'edit';
  public readonly description = 'Edit a comment on a pull request';

  constructor(
    private readonly pullrequestsApi: PullrequestsApi,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: {
      prId: string;
      commentId: string;
      message: string;
    } & EditCommentPROptions,
    context: CommandContext
  ): Promise<void> {
    const repoContext = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    const prId = parseInt(options.prId, 10);
    const commentId = parseInt(options.commentId, 10);

    try {
      await this.pullrequestsApi.repositoriesWorkspaceRepoSlugPullrequestsPullRequestIdCommentsCommentIdPut(
        {
          workspace: repoContext.workspace,
          repoSlug: repoContext.repoSlug,
          pullRequestId: prId,
          commentId: commentId,
          body: {
            type: 'pullrequest_comment',
            content: {
              raw: options.message,
            },
          },
        }
      );

      this.output.success(`Updated comment #${commentId}`);
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }
}
