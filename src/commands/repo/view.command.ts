/**
 * View repository command implementation
 */

import chalk from 'chalk';
import { BaseCommand } from '../../core/base-command.js';
import type { CommandContext } from '../../core/interfaces/commands.js';
import type {
  IContextService,
  IOutputService,
} from '../../core/interfaces/services.js';
import type { RepositoriesApi } from '../../generated/api.js';
import type { GlobalOptions } from '../../types/config.js';

export interface ViewRepoOptions extends GlobalOptions {
  repository?: string;
}

export class ViewRepoCommand extends BaseCommand<ViewRepoOptions, void> {
  public readonly name = 'view';
  public readonly description = 'View repository details';

  constructor(
    private readonly repositoriesApi: RepositoriesApi,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: ViewRepoOptions,
    context: CommandContext
  ): Promise<void> {
    let contextOptions = { ...context.globalOptions, ...options };

    if (options.repository) {
      const parts = options.repository.split('/');
      if (parts.length === 2) {
        contextOptions.workspace = parts[0];
        contextOptions.repo = parts[1];
      } else {
        contextOptions.repo = options.repository;
      }
    }

    const repoContext =
      await this.contextService.requireRepoContext(contextOptions);

    try {
      const response =
        await this.repositoriesApi.repositoriesWorkspaceRepoSlugGet({
          workspace: repoContext.workspace,
          repoSlug: repoContext.repoSlug,
        });

      const repo = response.data;

      this.output.text(chalk.bold(repo.full_name ?? ''));

      if (repo.description) {
        this.output.text(chalk.dim(repo.description));
      }

      this.output.text('');
      this.output.text(
        `  ${chalk.dim('Visibility:')} ${repo.is_private ? 'Private' : 'Public'}`
      );
      this.output.text(
        `  ${chalk.dim('Owner:')} ${repo.owner?.display_name ?? 'Unknown'}`
      );

      if (repo.language) {
        this.output.text(`  ${chalk.dim('Language:')} ${repo.language}`);
      }

      if (repo.mainbranch) {
        this.output.text(
          `  ${chalk.dim('Default branch:')} ${repo.mainbranch.name}`
        );
      }

      this.output.text(
        `  ${chalk.dim('Created:')} ${this.output.formatDate(repo.created_on ?? '')}`
      );
      this.output.text(
        `  ${chalk.dim('Updated:')} ${this.output.formatDate(repo.updated_on ?? '')}`
      );
      this.output.text('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.output.text(
        `  ${chalk.dim('URL:')} ${(repo.links as any)?.html?.href}`
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sshClone = Array.from((repo.links as any)?.clone ?? []).find(
        (c: any) => c.name === 'ssh'
      ) as { href?: string } | undefined;
      if (sshClone?.href) {
        this.output.text(`  ${chalk.dim('SSH:')} ${sshClone.href}`);
      }
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }
}
