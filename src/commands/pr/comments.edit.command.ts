/**
 * Edit comment on PR command implementation
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
import type { BitbucketComment } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface EditCommentPROptions extends GlobalOptions {}

export class EditCommentPRCommand extends BaseCommand<
  { prId: string; commentId: string; message: string } & EditCommentPROptions,
  BitbucketComment
> {
  public readonly name = "edit";
  public readonly description = "Edit a comment on a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { prId: string; commentId: string; message: string } & EditCommentPROptions,
    context: CommandContext
  ): Promise<Result<BitbucketComment, BBError>> {
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

    const result = await this.prRepository.updateComment(
      workspace,
      repoSlug,
      prId,
      commentId,
      options.message
    );

    this.handleResult(result, context, () => {
      this.output.success(`Updated comment #${commentId}`);
    });

    return result;
  }
}
