/**
 * Add comment to PR command implementation
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

export interface CommentPROptions extends GlobalOptions {}

export class CommentPRCommand extends BaseCommand<
  { id: string; message: string } & CommentPROptions,
  BitbucketComment
> {
  public readonly name = "comment";
  public readonly description = "Add a comment to a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string; message: string } & CommentPROptions,
    context: CommandContext
  ): Promise<Result<BitbucketComment, BBError>> {
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

    // Create comment
    const result = await this.prRepository.createComment(
      workspace,
      repoSlug,
      prId,
      options.message
    );

    this.handleResult(result, context, () => {
      this.output.success(`Added comment to pull request #${prId}`);
    });

    return result;
  }
}
