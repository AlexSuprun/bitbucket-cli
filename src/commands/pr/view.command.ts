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
import type { BitbucketPullRequest, PullRequestState, BitbucketParticipant } from "../../types/api.js";
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
      this.renderHeader(pr);
      this.renderDescription(pr);
      this.renderBranchInfo(pr);
      this.renderMetadata(pr);
      this.renderReviewers(pr);
      this.renderFooter(pr);
    });

    return result;
  }

  private renderHeader(pr: BitbucketPullRequest): void {
    const stateColor = this.getStateColor(pr.state);
    const draftLabel = pr.draft ? chalk.yellow(" [DRAFT]") : "";
    
    this.output.text("");
    this.output.text(
      `${chalk.bold(`#${pr.id}`)} ${pr.title}${draftLabel} ${stateColor(`[${pr.state}]`)}`
    );
    this.output.text(chalk.gray("─".repeat(60)));
  }

  private renderDescription(pr: BitbucketPullRequest): void {
    if (pr.description) {
      this.output.text(pr.description);
      this.output.text("");
    }
  }

  private renderBranchInfo(pr: BitbucketPullRequest): void {
    const sourceBranch = chalk.cyan(pr.source.branch.name);
    const destBranch = chalk.cyan(pr.destination.branch.name);
    const arrow = chalk.gray(" → ");
    
    this.output.text(`${chalk.dim("Branch:")}   ${sourceBranch}${arrow}${destBranch}`);
    
    // Show commit hashes if available
    if (pr.source.commit?.hash || pr.destination.commit?.hash) {
      const sourceHash = pr.source.commit?.hash ? chalk.gray(pr.source.commit.hash.slice(0, 7)) : chalk.gray("unknown");
      const destHash = pr.destination.commit?.hash ? chalk.gray(pr.destination.commit.hash.slice(0, 7)) : chalk.gray("unknown");
      this.output.text(`${chalk.dim("Commits:")}  ${sourceHash}${arrow}${destHash}`);
    }
  }

  private renderMetadata(pr: BitbucketPullRequest): void {
    this.output.text(`${chalk.dim("Author:")}   ${pr.author.display_name}`);
    
    // Show who closed/merged the PR
    if (pr.closed_by) {
      const action = pr.state === "MERGED" ? "Merged" : "Closed";
      this.output.text(`${chalk.dim(action + ":")}   ${pr.closed_by.display_name}`);
    }
    
    this.output.text(`${chalk.dim("Created:")}  ${this.output.formatDate(pr.created_on)}`);
    this.output.text(`${chalk.dim("Updated:")}  ${this.output.formatDate(pr.updated_on)}`);
    
    // Show merge commit for merged PRs
    if (pr.merge_commit?.hash) {
      this.output.text(`${chalk.dim("Merge:")}    ${chalk.magenta(pr.merge_commit.hash.slice(0, 7))}`);
    }
    
    // Show close source branch indicator
    const closeBranchIndicator = pr.close_source_branch ? chalk.green("✓") : chalk.gray("✗");
    this.output.text(`${chalk.dim("Close Src:")} ${closeBranchIndicator} ${chalk.gray("(close source branch on merge)")}`);
    
    this.output.text(`${chalk.dim("Activity:")} ${pr.comment_count} comments · ${pr.task_count} tasks`);
  }

  private renderReviewers(pr: BitbucketPullRequest): void {
    const reviewers = pr.participants.filter((p) => p.role === "REVIEWER");
    
    if (reviewers.length === 0) {
      this.output.text("");
      this.output.text(chalk.gray("No reviewers assigned"));
      return;
    }

    this.output.text("");
    this.output.text(chalk.dim("Reviewers:"));
    
    for (const reviewer of reviewers) {
      const status = this.getReviewerStatus(reviewer);
      this.output.text(`  ${status.icon} ${reviewer.user.display_name} ${chalk.gray(status.label)}`);
    }
  }

  private getReviewerStatus(reviewer: BitbucketParticipant): { icon: string; label: string } {
    if (reviewer.approved) {
      return { icon: chalk.green("✓"), label: "approved" };
    }
    
    if (reviewer.state === "changes_requested") {
      return { icon: chalk.red("✗"), label: "changes requested" };
    }
    
    return { icon: chalk.yellow("○"), label: "pending" };
  }

  private renderFooter(pr: BitbucketPullRequest): void {
    this.output.text("");
    this.output.text(chalk.gray("─".repeat(60)));
    this.output.text(`${chalk.dim("URL:")} ${chalk.blue.underline(pr.links.html.href)}`);
    this.output.text("");
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
