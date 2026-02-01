/**
 * Add comment to PR command implementation
 */

import { BaseCommand } from '../../core/base-command.js';
import type { CommandContext } from '../../core/interfaces/commands.js';
import type {
  IContextService,
  IOutputService,
} from '../../core/interfaces/services.js';
import type { PullrequestsApi } from '../../generated/api.js';
import type { GlobalOptions } from '../../types/config.js';

export interface CommentPROptions extends GlobalOptions {}

export class CommentPRCommand extends BaseCommand<
  { id: string; message: string } & CommentPROptions,
  void
> {
  public readonly name = 'comment';
  public readonly description = 'Add a comment to a pull request';

  constructor(
    private readonly pullrequestsApi: PullrequestsApi,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string; message: string } & CommentPROptions,
    context: CommandContext
  ): Promise<void> {
    const repoContext = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    const prId = Number.parseInt(options.id, 10);

    try {
      await this.pullrequestsApi.repositoriesWorkspaceRepoSlugPullrequestsPullRequestIdCommentsPost(
        {
          workspace: repoContext.workspace,
          repoSlug: repoContext.repoSlug,
          pullRequestId: prId,
          body: {
            type: 'pullrequest_comment',
            content: {
              raw: options.message,
            },
          },
        }
      );

      this.output.success(`Added comment to pull request #${prId}`);
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }
}
