/**
 * List comments on PR command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IContextService, IOutputService } from "../../core/interfaces/services.js";
import type { PullrequestsApi } from "../../generated/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface ListCommentsPROptions extends GlobalOptions {
  limit?: string;
  truncate?: boolean;
}

export class ListCommentsPRCommand extends BaseCommand<{ id: string } & ListCommentsPROptions, void> {
  public readonly name = "comments";
  public readonly description = "List comments on a pull request";

  constructor(
    private readonly pullrequestsApi: PullrequestsApi,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & ListCommentsPROptions,
    context: CommandContext
  ): Promise<void> {
    const repoContext = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    const prId = parseInt(options.id, 10);
    const limit = options.limit ? parseInt(options.limit, 10) : 25;

    try {
      const response = await this.pullrequestsApi.repositoriesWorkspaceRepoSlugPullrequestsPullRequestIdCommentsGet({
        workspace: repoContext.workspace,
        repoSlug: repoContext.repoSlug,
        pullRequestId: prId,
        pagelen: limit,
      });

      const data = response.data;

      if ((data.values ?? []).length === 0) {
        this.output.info("No comments found on this pull request");
        return;
      }

      const rows = (data.values ?? []).map((comment) => [
        comment.id?.toString() ?? "",
        comment.user?.nickname ?? comment.user?.display_name ?? "Unknown",
        comment.deleted
          ? "[deleted]"
          : options.truncate === false
            ? comment.content?.raw ?? ""
            : (comment.content?.raw ?? "").slice(0, 60) +
              ((comment.content?.raw ?? "").length > 60 ? "..." : ""),
        this.output.formatDate(comment.created_on ?? ""),
      ]);

      this.output.table(
        ["ID", "Author", "Content", "Date"],
        rows
      );
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }
}
