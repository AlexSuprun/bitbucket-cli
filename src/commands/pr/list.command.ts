/**
 * List PRs command implementation
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
import type {
  BitbucketPullRequest,
  PaginatedResponse,
  PullRequestState,
} from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface ListPRsOptions extends GlobalOptions {
  state?: string;
  limit?: string;
}

export class ListPRsCommand extends BaseCommand<
  ListPRsOptions,
  PaginatedResponse<BitbucketPullRequest>
> {
  public readonly name = "list";
  public readonly description = "List pull requests";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: ListPRsOptions,
    context: CommandContext
  ): Promise<Result<PaginatedResponse<BitbucketPullRequest>, BBError>> {
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
    const state = (options.state || "OPEN") as PullRequestState;
    const limit = parseInt(options.limit || "25", 10);

    // List pull requests
    const result = await this.prRepository.list(workspace, repoSlug, state, limit);

    this.handleResult(result, context, (data) => {
      if (data.values.length === 0) {
        this.output.text(`No ${state.toLowerCase()} pull requests found`);
        return;
      }

      const rows = data.values.map((pr) => [
        `#${pr.id}`,
        this.truncate(pr.title, 50),
        pr.author.display_name,
        `${pr.source.branch.name} → ${pr.destination.branch.name}`,
      ]);

      this.output.table(["ID", "TITLE", "AUTHOR", "BRANCHES"], rows);
    });

    return result;
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + "...";
  }
}
