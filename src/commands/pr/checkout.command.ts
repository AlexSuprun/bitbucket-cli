/**
 * Checkout PR command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IPullRequestRepository,
  IContextService,
  IGitService,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import type { GlobalOptions } from "../../types/config.js";

export interface CheckoutPROptions extends GlobalOptions {}

export interface CheckoutResult {
  prId: number;
  branch: string;
  title: string;
}

export class CheckoutPRCommand extends BaseCommand<
  { id: string } & CheckoutPROptions,
  CheckoutResult
> {
  public readonly name = "checkout";
  public readonly description = "Checkout a pull request locally";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    private readonly gitService: IGitService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & CheckoutPROptions,
    context: CommandContext
  ): Promise<Result<CheckoutResult, BBError>> {
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

    // Get PR details
    const prResult = await this.prRepository.get(workspace, repoSlug, prId);
    if (!prResult.success) {
      this.handleResult(prResult, context);
      return prResult;
    }

    const pr = prResult.value;
    const branchName = pr.source.branch.name;
    const localBranchName = `pr-${prId}`;

    // Fetch latest
    const fetchResult = await this.gitService.fetch();
    if (!fetchResult.success) {
      this.handleResult(fetchResult, context);
      return fetchResult;
    }

    // Try to checkout the branch
    let checkoutResult = await this.gitService.checkout(branchName);

    if (!checkoutResult.success) {
      // If branch doesn't exist locally, create tracking branch
      checkoutResult = await this.gitService.checkoutNewBranch(
        localBranchName,
        `origin/${branchName}`
      );

      if (!checkoutResult.success) {
        this.output.error(
          `Could not checkout branch '${branchName}'. ` +
            `Make sure the source branch exists and try fetching first.`
        );
        if (process.env.NODE_ENV !== "test") {
          process.exitCode = 1;
        }
        return checkoutResult;
      }
    }

    const result: CheckoutResult = {
      prId,
      branch: checkoutResult.success ? branchName : localBranchName,
      title: pr.title,
    };

    this.handleResult(Result.ok(result), context, (data) => {
      this.output.success(`Checked out PR #${data.prId} as '${data.branch}'`);
      this.output.text(`  Title: ${data.title}`);
    });

    return Result.ok(result);
  }
}
