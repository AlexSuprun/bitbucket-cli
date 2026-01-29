/**
 * Add reviewer to PR command implementation
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

export interface AddReviewerPROptions extends GlobalOptions {
  id: string;
  username: string;
}

export class AddReviewerPRCommand extends BaseCommand<
  AddReviewerPROptions,
  BitbucketPullRequest
> {
  public readonly name = "reviewers.add";
  public readonly description = "Add a reviewer to a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: AddReviewerPROptions,
    context: CommandContext
  ): Promise<Result<BitbucketPullRequest, BBError>> {
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

    const result = await this.prRepository.addReviewer(
      workspace,
      repoSlug,
      prId,
      options.username
    );

    this.handleResult(result, context, () => {
      this.output.success(`Added ${options.username} as reviewer to pull request #${prId}`);
    });

    return result;
  }
}
