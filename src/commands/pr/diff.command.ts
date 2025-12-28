/**
 * PR diff command implementation
 */

import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IPullRequestRepository,
  IContextService,
  IOutputService,
  IGitService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import { BBError, ErrorCode } from "../../types/errors.js";
import type { GlobalOptions } from "../../types/config.js";

const execAsync = promisify(exec);

export interface DiffPROptions extends GlobalOptions {
  id?: string;
  color?: "auto" | "always" | "never";
  nameOnly?: boolean;
  stat?: boolean;
  web?: boolean;
}

interface DiffResult {
  diff?: string;
  stat?: {
    filesChanged: number;
    insertions: number;
    deletions: number;
    files: Array<{ path: string; additions: number; deletions: number }>;
  };
}

export class DiffPRCommand extends BaseCommand<DiffPROptions, DiffResult> {
  public readonly name = "diff";
  public readonly description = "View pull request diff";

  constructor(
    private readonly prRepository: IPullRequestRepository,
    private readonly contextService: IContextService,
    private readonly gitService: IGitService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: DiffPROptions,
    context: CommandContext
  ): Promise<Result<DiffResult, BBError>> {
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

    // Get PR ID - either from argument or find from current branch
    let prId: number;
    if (options.id) {
      prId = parseInt(options.id, 10);
      if (isNaN(prId)) {
        const error = new BBError({
          code: ErrorCode.VALIDATION_INVALID,
          message: "Invalid PR ID",
        });
        this.handleResult(Result.err(error), context);
        return Result.err(error);
      }
    } else {
      // Try to find PR for current branch
      const currentBranchResult = await this.gitService.getCurrentBranch();
      if (!currentBranchResult.success) {
        const error = new BBError({
          code: ErrorCode.VALIDATION_INVALID,
          message: "No PR ID provided and could not determine current branch",
        });
        this.handleResult(Result.err(error), context);
        return Result.err(error);
      }

      const currentBranch = currentBranchResult.value;
      const prsResult = await this.prRepository.list(workspace, repoSlug, "OPEN", 100);

      if (!prsResult.success) {
        this.handleResult(prsResult, context);
        return prsResult;
      }

      const pr = prsResult.value.values.find(
        (p) => p.source.branch.name === currentBranch
      );

      if (!pr) {
        const error = new BBError({
          code: ErrorCode.VALIDATION_INVALID,
          message: `No open pull request found for branch "${currentBranch}"`,
        });
        this.handleResult(Result.err(error), context);
        return Result.err(error);
      }

      prId = pr.id;
    }

    // Handle --web flag
    if (options.web) {
      const prResult = await this.prRepository.get(workspace, repoSlug, prId);
      if (!prResult.success) {
        this.handleResult(prResult, context);
        return prResult;
      }

      const diffUrl = prResult.value.links.diff.href;
      // Convert API diff URL to web diff URL
      const webUrl = diffUrl.replace(
        /api\.bitbucket\.org\/2\.0\/repositories\/(.*?)\/pullrequests\/(\d+)\/diff/,
        "bitbucket.org/$1/pull-requests/$2/diff"
      );

      return this.openInBrowser(webUrl, context);
    }

    // Handle --stat flag
    if (options.stat) {
      return this.showStat(workspace, repoSlug, prId, context);
    }

    // Handle --name-only flag
    if (options.nameOnly) {
      return this.showNameOnly(workspace, repoSlug, prId, context);
    }

    // Show full diff
    return this.showDiff(workspace, repoSlug, prId, options, context);
  }

  private async openInBrowser(
    url: string,
    context: CommandContext
  ): Promise<Result<DiffResult, BBError>> {
    if (context.globalOptions.json) {
      this.output.json({ url });
      return Result.ok({ diff: url });
    }

    this.output.info(`Opening ${url} in your browser...`);

    try {
      const platform = process.platform;
      let command: string;

      if (platform === "darwin") {
        command = `open "${url}"`;
      } else if (platform === "win32") {
        command = `start "" "${url}"`;
      } else {
        command = `xdg-open "${url}"`;
      }

      await execAsync(command);
      return Result.ok({ diff: url });
    } catch (error) {
      const bbError = new BBError({
        code: ErrorCode.GIT_COMMAND_FAILED,
        message: "Failed to open browser",
        cause: error instanceof Error ? error : undefined,
      });
      this.handleResult(Result.err(bbError), context);
      return Result.err(bbError);
    }
  }

  private async showStat(
    workspace: string,
    repoSlug: string,
    prId: number,
    context: CommandContext
  ): Promise<Result<DiffResult, BBError>> {
    const diffstatResult = await this.prRepository.getDiffstat(workspace, repoSlug, prId);

    if (!diffstatResult.success) {
      this.handleResult(diffstatResult, context);
      return diffstatResult;
    }

    const diffstat = diffstatResult.value;
    const files = diffstat.values.map((file) => {
      const path = file.new?.path || file.old?.path || "unknown";
      return {
        path,
        additions: file.lines_added,
        deletions: file.lines_removed,
      };
    });

    const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
    const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);
    const filesChanged = files.length;

    const result: DiffResult = {
      stat: {
        filesChanged,
        insertions: totalAdditions,
        deletions: totalDeletions,
        files,
      },
    };

    this.handleResult(Result.ok(result), context, () => {
      for (const file of files) {
        const additions = file.additions > 0 ? chalk.green(`+${file.additions}`) : "";
        const deletions = file.deletions > 0 ? chalk.red(`-${file.deletions}`) : "";
        const stats = [additions, deletions].filter(Boolean).join(" ");
        this.output.text(`${file.path} ${stats ? `| ${stats}` : ""}`);
      }

      this.output.text("");
      const summary = [
        `${filesChanged} file${filesChanged !== 1 ? "s" : ""} changed`,
        totalAdditions > 0 ? chalk.green(`${totalAdditions} insertion${totalAdditions !== 1 ? "s" : ""}(+)`) : null,
        totalDeletions > 0 ? chalk.red(`${totalDeletions} deletion${totalDeletions !== 1 ? "s" : ""}(-)`) : null,
      ].filter(Boolean).join(", ");

      this.output.text(summary);
    });

    return Result.ok(result);
  }

  private async showNameOnly(
    workspace: string,
    repoSlug: string,
    prId: number,
    context: CommandContext
  ): Promise<Result<DiffResult, BBError>> {
    const diffstatResult = await this.prRepository.getDiffstat(workspace, repoSlug, prId);

    if (!diffstatResult.success) {
      this.handleResult(diffstatResult, context);
      return diffstatResult;
    }

    const diffstat = diffstatResult.value;
    const fileNames = diffstat.values.map((file) => file.new?.path || file.old?.path || "unknown");

    const result: DiffResult = {
      diff: fileNames.join("\n"),
    };

    this.handleResult(Result.ok(result), context, () => {
      for (const fileName of fileNames) {
        this.output.text(fileName);
      }
    });

    return Result.ok(result);
  }

  private async showDiff(
    workspace: string,
    repoSlug: string,
    prId: number,
    options: DiffPROptions,
    context: CommandContext
  ): Promise<Result<DiffResult, BBError>> {
    const diffResult = await this.prRepository.getDiff(workspace, repoSlug, prId);

    if (!diffResult.success) {
      this.handleResult(diffResult, context);
      return diffResult;
    }

    const diff = diffResult.value;
    const result: DiffResult = { diff };

    this.handleResult(Result.ok(result), context, () => {
      const shouldColorize = this.shouldColorize(options.color);
      const colorizedDiff = shouldColorize ? this.colorizeDiff(diff) : diff;
      this.output.text(colorizedDiff);
    });

    return Result.ok(result);
  }

  private shouldColorize(colorOption?: "auto" | "always" | "never"): boolean {
    if (!colorOption || colorOption === "auto") {
      // Auto: colorize if stdout is a TTY
      return process.stdout.isTTY ?? false;
    }
    return colorOption === "always";
  }

  private colorizeDiff(diff: string): string {
    const lines = diff.split("\n");
    return lines
      .map((line) => {
        if (line.startsWith("+") && !line.startsWith("+++")) {
          return chalk.green(line);
        } else if (line.startsWith("-") && !line.startsWith("---")) {
          return chalk.red(line);
        } else if (line.startsWith("@@")) {
          return chalk.cyan(line);
        } else if (line.startsWith("diff --git")) {
          return chalk.bold(line);
        } else if (line.startsWith("index ") || line.startsWith("---") || line.startsWith("+++")) {
          return chalk.dim(line);
        }
        return line;
      })
      .join("\n");
  }
}
