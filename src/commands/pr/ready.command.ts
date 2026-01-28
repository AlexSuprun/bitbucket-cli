/**
 * Ready PR command implementation
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
import type { BitbucketPullRequest, UpdatePullRequestRequest } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface ReadyPROptions extends GlobalOptions {}

export class ReadyPRCommand extends BaseCommand<
  { id: string } & ReadyPROptions,
  BitbucketPullRequest
> {
  public readonly name = "ready";
  public readonly description = "Mark a draft pull request as ready for review";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & ReadyPROptions,
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

    const request: UpdatePullRequestRequest = {
      draft: false,
    };

    const result = await this.prRepository.update(workspace, repoSlug, prId, request);

    this.handleResult(result, context, (pr) => {
      this.output.success(`Marked pull request #${prId} as ready for review`);
      this.output.text(`  ${pr.title}`);
    });

    return result;
  }
}
