/**
 * Delete comment on PR command implementation
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
import type { GlobalOptions } from "../../types/config.js";

export interface DeleteCommentPROptions extends GlobalOptions {}

export class DeleteCommentPRCommand extends BaseCommand<
  { prId: string; commentId: string } & DeleteCommentPROptions,
  void
> {
  public readonly name = "delete";
  public readonly description = "Delete a comment on a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { prId: string; commentId: string } & DeleteCommentPROptions,
    context: CommandContext
  ): Promise<Result<void, BBError>> {
    const repoContextResult = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    if (!repoContextResult.success) {
      this.handleResult(repoContextResult, context);
      return repoContextResult;
    }

    const { workspace, repoSlug } = repoContextResult.value;
    const prId = parseInt(options.prId, 10);
    const commentId = parseInt(options.commentId, 10);

    const result = await this.prRepository.deleteComment(
      workspace,
      repoSlug,
      prId,
      commentId
    );

    this.handleResult(result, context, () => {
      this.output.success(
        `Deleted comment #${commentId} from PR #${prId}`
      );
    });

    return result;
  }
}
