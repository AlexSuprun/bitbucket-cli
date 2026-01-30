/**
 * Create PR command implementation
 */

import chalk from 'chalk';
import { BaseCommand } from '../../core/base-command.js';
import type { CommandContext } from '../../core/interfaces/commands.js';
import type {
  IContextService,
  IGitService,
  IOutputService,
} from '../../core/interfaces/services.js';
import type { PullrequestsApi, Pullrequest } from '../../generated/api.js';
import type { GlobalOptions } from '../../types/config.js';

export interface CreatePROptions extends GlobalOptions {
  title?: string;
  body?: string;
  source?: string;
  destination?: string;
  closeSourceBranch?: boolean;
  draft?: boolean;
}

export class CreatePRCommand extends BaseCommand<CreatePROptions, void> {
  public readonly name = 'create';
  public readonly description = 'Create a pull request';

  constructor(
    private readonly pullrequestsApi: PullrequestsApi,
    private readonly contextService: IContextService,
    private readonly gitService: IGitService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: CreatePROptions,
    context: CommandContext
  ): Promise<void> {
    if (!options.title) {
      this.output.error('Pull request title is required. Use --title option.');
      if (process.env.NODE_ENV !== 'test') {
        process.exitCode = 1;
      }
      throw new Error('Pull request title is required');
    }

    const repoContext = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    let sourceBranch = options.source;
    if (!sourceBranch) {
      sourceBranch = await this.gitService.getCurrentBranch();
    }

    const destinationBranch = options.destination || 'main';

    const request: Pullrequest = {
      type: 'pullrequest',
      title: options.title,
      source: {
        branch: { name: sourceBranch },
      } as Pullrequest['source'],
      destination: {
        branch: { name: destinationBranch },
      } as Pullrequest['destination'],
    };

    if (options.body) {
      request.description = options.body;
    }

    if (options.closeSourceBranch) {
      request.close_source_branch = true;
    }

    if (options.draft) {
      request.draft = true;
    }

    try {
      const response =
        await this.pullrequestsApi.repositoriesWorkspaceRepoSlugPullrequestsPost(
          {
            workspace: repoContext.workspace,
            repoSlug: repoContext.repoSlug,
            body: request,
          }
        );

      const pr = response.data;
      const links = pr.links as { html?: { href?: string } } | undefined;

      this.output.success(`Created pull request #${pr.id}`);
      this.output.text(`  ${chalk.dim('Title:')} ${pr.title}`);
      this.output.text(`  ${chalk.dim('URL:')} ${links?.html?.href}`);
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }
}
