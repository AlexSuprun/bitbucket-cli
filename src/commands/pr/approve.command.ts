/**
 * Approve PR command implementation
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
import type { BitbucketApproval } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface ApprovePROptions extends GlobalOptions {}

export class ApprovePRCommand extends BaseCommand<
  { id: string } & ApprovePROptions,
  BitbucketApproval
> {
  public readonly name = "approve";
  public readonly description = "Approve a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & ApprovePROptions,
    context: CommandContext
  ): Promise<Result<BitbucketApproval, BBError>> {
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

    // Approve pull request
    const result = await this.prRepository.approve(workspace, repoSlug, prId);

    this.handleResult(result, context, () => {
      this.output.success(`Approved pull request #${prId}`);
    });

    return result;
  }
}
