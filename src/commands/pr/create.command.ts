/**
 * Create PR command implementation
 */

import chalk from "chalk";
import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IPullRequestRepository,
  IContextService,
  IGitService,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import { BBError, ValidationError } from "../../types/errors.js";
import type { BitbucketPullRequest, CreatePullRequestRequest } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface CreatePROptions extends GlobalOptions {
  title?: string;
  body?: string;
  source?: string;
  destination?: string;
  closeSourceBranch?: boolean;
}

export class CreatePRCommand extends BaseCommand<CreatePROptions, BitbucketPullRequest> {
  public readonly name = "create";
  public readonly description = "Create a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    private readonly gitService: IGitService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: CreatePROptions,
    context: CommandContext
  ): Promise<Result<BitbucketPullRequest, BBError>> {
    // Validate title
    if (!options.title) {
      const error = new ValidationError(
        "title",
        "Pull request title is required. Use --title option."
      );
      this.output.error(error.message);
      if (process.env.NODE_ENV !== "test") {
        process.exitCode = 1;
      }
      return Result.err(error);
    }

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

    // Get source branch (default to current branch)
    let sourceBranch = options.source;
    if (!sourceBranch) {
      const branchResult = await this.gitService.getCurrentBranch();
      if (!branchResult.success) {
        this.handleResult(branchResult, context);
        return branchResult;
      }
      sourceBranch = branchResult.value;
    }

    const destinationBranch = options.destination || "main";

    // Build request
    const request: CreatePullRequestRequest = {
      title: options.title,
      source: { branch: { name: sourceBranch } },
      destination: { branch: { name: destinationBranch } },
    };

    if (options.body) {
      request.description = options.body;
    }

    if (options.closeSourceBranch) {
      request.close_source_branch = true;
    }

    // Create pull request
    const result = await this.prRepository.create(workspace, repoSlug, request);

    this.handleResult(result, context, (pr) => {
      this.output.success(`Created pull request #${pr.id}`);
      this.output.text(`  ${chalk.dim("Title:")} ${pr.title}`);
      this.output.text(`  ${chalk.dim("URL:")} ${pr.links.html.href}`);
    });

    return result;
  }
}
