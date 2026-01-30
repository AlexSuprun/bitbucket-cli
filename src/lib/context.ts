import { getRemoteUrl, isGitRepository } from './git.js';
import { getConfig } from './config.js';
import type { RepoContext, GlobalOptions } from '../types/index.js';

/**
 * Parse Bitbucket repository URL to extract workspace and repo slug
 * Supports both SSH and HTTPS formats:
 * - git@bitbucket.org:workspace/repo.git
 * - https://bitbucket.org/workspace/repo.git
 * - https://username@bitbucket.org/workspace/repo.git
 */
export function parseRemoteUrl(url: string): RepoContext | null {
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
export async function getRepoContextFromGit(): Promise<RepoContext | null> {
  if (!(await isGitRepository())) {
    return null;
  }

  try {
    const remoteUrl = await getRemoteUrl();
    return parseRemoteUrl(remoteUrl);
  } catch {
    return null;
  }
}

/**
 * Get repository context with fallbacks:
 * 1. Command line options (--workspace, --repo)
 * 2. Current git repository remote
 * 3. Config file defaults
 */
export async function getRepoContext(
  options: GlobalOptions
): Promise<RepoContext | null> {
  // If both workspace and repo are provided via options, use them
  if (options.workspace && options.repo) {
    return {
      workspace: options.workspace,
      repoSlug: options.repo,
    };
  }

  // Try to get from current git repo
  const gitContext = await getRepoContextFromGit();

  // If only workspace is provided, use it with git-detected repo
  if (options.workspace && gitContext) {
    return {
      workspace: options.workspace,
      repoSlug: gitContext.repoSlug,
    };
  }

  // If only repo is provided, try to use default workspace or git workspace
  if (options.repo) {
    const config = await getConfig();
    const workspace = gitContext?.workspace || config.defaultWorkspace;
    if (workspace) {
      return {
        workspace,
        repoSlug: options.repo,
      };
    }
  }

  // Fall back to git context
  return gitContext;
}

/**
 * Require repository context or exit with error
 */
export async function requireRepoContext(
  options: GlobalOptions
): Promise<RepoContext> {
  const context = await getRepoContext(options);
  if (!context) {
    console.error(
      'Could not determine repository. Use --workspace and --repo options, ' +
        'or run this command from within a Bitbucket repository.'
    );
    process.exit(1);
  }
  return context;
}
