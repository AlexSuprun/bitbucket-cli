/**
 * List comments on PR command implementation
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
import type { PaginatedResponse, BitbucketComment } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface ListCommentsPROptions extends GlobalOptions {
  limit?: string;
}

export class ListCommentsPRCommand extends BaseCommand<
  { id: string } & ListCommentsPROptions,
  PaginatedResponse<BitbucketComment>
> {
  public readonly name = "comments";
  public readonly description = "List comments on a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & ListCommentsPROptions,
    context: CommandContext
  ): Promise<Result<PaginatedResponse<BitbucketComment>, BBError>> {
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
    const limit = options.limit ? parseInt(options.limit, 10) : 25;

    const result = await this.prRepository.listComments(
      workspace,
      repoSlug,
      prId,
      limit
    );

    this.handleResult(result, context, (data) => {
      if (data.values.length === 0) {
        this.output.info("No comments found on this pull request");
        return;
      }

      const rows = data.values.map((comment: BitbucketComment) => [
        comment.id.toString(),
        comment.user?.nickname ?? comment.user?.display_name ?? "Unknown",
        comment.deleted
          ? "[deleted]"
          : comment.content.raw.slice(0, 60) +
            (comment.content.raw.length > 60 ? "..." : ""),
        this.output.formatDate(comment.created_on),
      ]);

      this.output.table(
        ["ID", "Author", "Content", "Date"],
        rows
      );
    });

    return result;
  }
}
