/**
 * Edit PR command implementation
 */

import * as fs from "fs";
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
import type { BitbucketPullRequest, UpdatePullRequestRequest } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";
import { DEFAULT_PAGELEN } from "../../constants.js";

export interface EditPROptions extends GlobalOptions {
  id?: string;
  title?: string;
  body?: string;
  bodyFile?: string;
}

export class EditPRCommand extends BaseCommand<EditPROptions, BitbucketPullRequest> {
  public readonly name = "edit";
  public readonly description = "Edit a pull request";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    private readonly gitService: IGitService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: EditPROptions,
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

    // Determine PR ID
    let prId: number;
    if (options.id) {
      prId = parseInt(options.id, 10);
    } else {
      // Auto-detect PR from current branch
      const branchResult = await this.gitService.getCurrentBranch();
      if (!branchResult.success) {
        this.handleResult(branchResult, context);
        return branchResult;
      }

      const currentBranch = branchResult.value;
      const prsResult = await this.prRepository.list(
        workspace,
        repoSlug,
        "OPEN",
        DEFAULT_PAGELEN.PULL_REQUESTS
      );
      if (!prsResult.success) {
        this.handleResult(prsResult, context);
        return prsResult;
      }

      const matchingPR = prsResult.value.values.find(
        (pr) => pr.source.branch.name === currentBranch
      );

      if (!matchingPR) {
        const error = new ValidationError(
          "id",
          `No open pull request found for current branch '${currentBranch}'. Specify a PR ID explicitly.`
        );
        this.output.error(error.message);
        if (process.env.NODE_ENV !== "test") {
          process.exitCode = 1;
        }
        return Result.err(error);
      }

      prId = matchingPR.id;
    }

    // Read body from file if specified
    let body = options.body;
    if (options.bodyFile) {
      try {
        body = fs.readFileSync(options.bodyFile, "utf-8");
      } catch (err) {
        const error = new ValidationError(
          "bodyFile",
          `Failed to read file '${options.bodyFile}': ${err instanceof Error ? err.message : "Unknown error"}`
        );
        this.output.error(error.message);
        if (process.env.NODE_ENV !== "test") {
          process.exitCode = 1;
        }
        return Result.err(error);
      }
    }

    // Validate at least one change is provided
    if (!options.title && !body) {
      const error = new ValidationError(
        "title",
        "At least one of --title or --body (or --body-file) is required."
      );
      this.output.error(error.message);
      if (process.env.NODE_ENV !== "test") {
        process.exitCode = 1;
      }
      return Result.err(error);
    }

    // Build update request
    const request: UpdatePullRequestRequest = {};
    if (options.title) {
      request.title = options.title;
    }
    if (body) {
      request.description = body;
    }

    // Update pull request
    const result = await this.prRepository.update(workspace, repoSlug, prId, request);

    this.handleResult(result, context, (pr) => {
      this.output.success(`Updated pull request #${pr.id}`);
      this.output.text(`  ${chalk.dim("Title:")} ${pr.title}`);
      if (pr.description) {
        const truncatedDesc = pr.description.length > 100
          ? pr.description.substring(0, 100) + "..."
          : pr.description;
        this.output.text(`  ${chalk.dim("Description:")} ${truncatedDesc}`);
      }
      this.output.text(`  ${chalk.dim("URL:")} ${pr.links.html.href}`);
    });

    return result;
  }
}
