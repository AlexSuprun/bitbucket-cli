/**
 * View repository command implementation
 */

import chalk from "chalk";
import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IRepoRepository,
  IContextService,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import type { BitbucketRepository } from "../../types/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface ViewRepoOptions extends GlobalOptions {
  repository?: string;
}

export class ViewRepoCommand extends BaseCommand<ViewRepoOptions, BitbucketRepository> {
  public readonly name = "view";
  public readonly description = "View repository details";

  constructor(
    private readonly repoRepository: IRepoRepository,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: ViewRepoOptions,
    context: CommandContext
  ): Promise<Result<BitbucketRepository, BBError>> {
    // Parse repository argument if provided
    let contextOptions = { ...context.globalOptions, ...options };

    if (options.repository) {
      const parts = options.repository.split("/");
      if (parts.length === 2) {
        contextOptions.workspace = parts[0];
        contextOptions.repo = parts[1];
      } else {
        contextOptions.repo = options.repository;
      }
    }

    // Require repository context
    const repoContextResult = await this.contextService.requireRepoContext(contextOptions);
    if (!repoContextResult.success) {
      this.handleResult(repoContextResult, context);
      return repoContextResult;
    }

    const { workspace, repoSlug } = repoContextResult.value;

    // Fetch repository details
    const result = await this.repoRepository.get(workspace, repoSlug);

    this.handleResult(result, context, (repo) => {
      this.output.text(chalk.bold(repo.full_name));

      if (repo.description) {
        this.output.text(chalk.dim(repo.description));
      }

      this.output.text("");
      this.output.text(`  ${chalk.dim("Visibility:")} ${repo.is_private ? "Private" : "Public"}`);
      this.output.text(`  ${chalk.dim("Owner:")} ${repo.owner.display_name}`);

      if (repo.language) {
        this.output.text(`  ${chalk.dim("Language:")} ${repo.language}`);
      }

      if (repo.mainbranch) {
        this.output.text(`  ${chalk.dim("Default branch:")} ${repo.mainbranch.name}`);
      }

      this.output.text(`  ${chalk.dim("Created:")} ${this.output.formatDate(repo.created_on)}`);
      this.output.text(`  ${chalk.dim("Updated:")} ${this.output.formatDate(repo.updated_on)}`);
      this.output.text("");
      this.output.text(`  ${chalk.dim("URL:")} ${repo.links.html.href}`);

      const sshClone = repo.links.clone.find((c) => c.name === "ssh");
      if (sshClone) {
        this.output.text(`  ${chalk.dim("SSH:")} ${sshClone.href}`);
      }
    });

    return result;
  }
}
