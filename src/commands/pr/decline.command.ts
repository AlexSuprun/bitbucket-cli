/**
 * Decline PR command implementation
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
import type { BitbucketPullRequest } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface DeclinePROptions extends GlobalOptions {}

export class DeclinePRCommand extends BaseCommand<
  { id: string } & DeclinePROptions,
  BitbucketPullRequest
> {
  public readonly name = "decline";
  public readonly description = "Decline a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & DeclinePROptions,
    context: CommandContext
  ): Promise<Result<BitbucketPullRequest, BBError>> {
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

    // Decline pull request
    const result = await this.prRepository.decline(workspace, repoSlug, prId);

    this.handleResult(result, context, (pr) => {
      this.output.success(`Declined pull request #${prId}: ${pr.title}`);
    });

    return result;
  }
}
