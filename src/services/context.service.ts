/**
 * Context service for resolving workspace and repository
 */

import type { IContextService, IGitService, IConfigService } from "../core/interfaces/services.js";
import { Result } from "../types/result.js";
import { BBError, ErrorCode } from "../types/errors.js";
import type { RepoContext, GlobalOptions } from "../types/config.js";

export class ContextService implements IContextService {
  constructor(
    private readonly gitService: IGitService,
    private readonly configService: IConfigService
  ) {}

  /**
   * Parse Bitbucket repository URL to extract workspace and repo slug
   * Supports both SSH and HTTPS formats
   */
  public parseRemoteUrl(url: string): RepoContext | null {
    // SSH format: git@bitbucket.org:workspace/repo.git
    const sshMatch = url.match(/git@bitbucket\.org:([^/]+)\/([^.]+)(?:\.git)?/);
    if (sshMatch) {
      return {
        workspace: sshMatch[1],
        repoSlug: sshMatch[2],
      };
    }

    // HTTPS format: https://bitbucket.org/workspace/repo.git
    // or: https://username@bitbucket.org/workspace/repo.git
    const httpsMatch = url.match(
      /https?:\/\/(?:[^@]+@)?bitbucket\.org\/([^/]+)\/([^/.]+)(?:\.git)?/
    );
    if (httpsMatch) {
      return {
        workspace: httpsMatch[1],
        repoSlug: httpsMatch[2],
      };
    }

    return null;
  }

  /**
   * Get repository context from current git repository
   */
  public async getRepoContextFromGit(): Promise<Result<RepoContext | null, BBError>> {
    const isRepo = await this.gitService.isRepository();
    if (!isRepo) {
      return Result.ok(null);
    }

    const remoteResult = await this.gitService.getRemoteUrl();
    if (!remoteResult.success) {
      // No remote configured - that's okay, just return null
      return Result.ok(null);
    }

    const context = this.parseRemoteUrl(remoteResult.value);
    return Result.ok(context);
  }

  /**
   * Get repository context with fallbacks:
   * 1. Command line options (--workspace, --repo)
   * 2. Current git repository remote
   * 3. Config file defaults
   */
  public async getRepoContext(
    options: GlobalOptions
  ): Promise<Result<RepoContext | null, BBError>> {
    // If both workspace and repo are provided via options, use them
    if (options.workspace && options.repo) {
      return Result.ok({
        workspace: options.workspace,
        repoSlug: options.repo,
      });
    }

    // Try to get from current git repo
    const gitContextResult = await this.getRepoContextFromGit();
    if (!gitContextResult.success) {
      return gitContextResult;
    }
    const gitContext = gitContextResult.value;

    // If only workspace is provided, use it with git-detected repo
    if (options.workspace && gitContext) {
      return Result.ok({
        workspace: options.workspace,
        repoSlug: gitContext.repoSlug,
      });
    }

    // If only repo is provided, try to use default workspace or git workspace
    if (options.repo) {
      const configResult = await this.configService.getConfig();
      if (!configResult.success) {
        return configResult;
      }

      const workspace = gitContext?.workspace || configResult.value.defaultWorkspace;
      if (workspace) {
        return Result.ok({
          workspace,
          repoSlug: options.repo,
        });
      }
    }

    // Fall back to git context
    return Result.ok(gitContext);
  }

  /**
   * Require repository context or return error
   */
  public async requireRepoContext(
    options: GlobalOptions
  ): Promise<Result<RepoContext, BBError>> {
    const contextResult = await this.getRepoContext(options);
    if (!contextResult.success) {
      return contextResult;
    }

    if (!contextResult.value) {
      return Result.err(
        new BBError({
          code: ErrorCode.CONTEXT_REPO_NOT_FOUND,
          message:
            "Could not determine repository. Use --workspace and --repo options, " +
            "or run this command from within a Bitbucket repository.",
        })
      );
    }

    return Result.ok(contextResult.value);
  }
}
