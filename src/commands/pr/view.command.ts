/**
 * View PR command implementation
 */

import chalk from "chalk";
import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IPullRequestRepository,
  IContextService,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import type { BitbucketPullRequest, PullRequestState } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface ViewPROptions extends GlobalOptions {}

export class ViewPRCommand extends BaseCommand<
  { id: string } & ViewPROptions,
  BitbucketPullRequest
> {
  public readonly name = "view";
  public readonly description = "View pull request details";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & ViewPROptions,
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

    // Get pull request
    const result = await this.prRepository.get(workspace, repoSlug, prId);

    this.handleResult(result, context, (pr) => {
      const stateColor = this.getStateColor(pr.state);
      const draftLabel = pr.draft ? chalk.yellow("[DRAFT]") : "";
      this.output.text(
        `${chalk.bold(`#${pr.id}`)} ${pr.title} ${stateColor(`[${pr.state}]`)}${draftLabel ? ` ${draftLabel}` : ""}`
      );
      this.output.text("");

      if (pr.description) {
        this.output.text(pr.description);
        this.output.text("");
      }

      this.output.text(
        `  ${chalk.dim("Branches:")} ${pr.source.branch.name} → ${pr.destination.branch.name}`
      );
      this.output.text(`  ${chalk.dim("Author:")} ${pr.author.display_name}`);
      this.output.text(`  ${chalk.dim("Created:")} ${this.output.formatDate(pr.created_on)}`);
      this.output.text(`  ${chalk.dim("Updated:")} ${this.output.formatDate(pr.updated_on)}`);
      this.output.text(
        `  ${chalk.dim("Comments:")} ${pr.comment_count}  ${chalk.dim("Tasks:")} ${pr.task_count}`
      );

      // Show reviewers/approvals
      const reviewers = pr.participants.filter((p) => p.role === "REVIEWER");
      if (reviewers.length > 0) {
        this.output.text("");
        this.output.text(`  ${chalk.dim("Reviewers:")}`);
        for (const reviewer of reviewers) {
          const status = reviewer.approved
            ? chalk.green("✓ approved")
            : chalk.yellow("pending");
          this.output.text(`    ${reviewer.user.display_name} - ${status}`);
        }
      }

      this.output.text("");
      this.output.text(`  ${chalk.dim("URL:")} ${pr.links.html.href}`);
    });

    return result;
  }

  private getStateColor(state: PullRequestState): (text: string) => string {
    switch (state) {
      case "OPEN":
        return chalk.green;
      case "MERGED":
        return chalk.magenta;
      case "DECLINED":
        return chalk.red;
      default:
        return chalk.gray;
    }
  }
}
