/**
 * List reviewers on PR command implementation
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
import type { BitbucketUser } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface ListReviewersPROptions extends GlobalOptions {
  id: string;
}

export class ListReviewersPRCommand extends BaseCommand<
  ListReviewersPROptions,
  BitbucketUser[]
> {
  public readonly name = "reviewers.list";
  public readonly description = "List reviewers on a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: ListReviewersPROptions,
    context: CommandContext
  ): Promise<Result<BitbucketUser[], BBError>> {
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

    const result = await this.prRepository.listReviewers(
      workspace,
      repoSlug,
      prId
    );

    this.handleResult(result, context, (reviewers) => {
      if (context.globalOptions.json) {
        this.output.json(reviewers);
      } else if (reviewers.length === 0) {
        this.output.info("No reviewers assigned to this pull request");
      } else {
        this.output.table(
          ["Display Name", "Account ID"],
          reviewers.map((r) => [r.display_name, r.account_id])
        );
      }
    });

    return result;
  }
}
