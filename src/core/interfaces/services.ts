/**
 * Service interfaces for dependency injection
 */

import type { Result } from "../../types/result.js";
import type { BBError } from "../../types/errors.js";
import type {
  BBConfig,
  AuthCredentials,
  RepoContext,
  GlobalOptions,
} from "../../types/config.js";
import type {
  BitbucketUser,
  BitbucketRepository,
  BitbucketPullRequest,
  BitbucketApproval,
  BitbucketComment,
  PaginatedResponse,
  PullRequestState,
  CreateRepositoryRequest,
  CreatePullRequestRequest,
  MergePullRequestRequest,
  UpdatePullRequestRequest,
  DiffStat,
} from "../../types/api.js";

/**
 * Configuration service interface
 */
export interface IConfigService {
  getConfig(): Promise<Result<BBConfig, BBError>>;
  setConfig(config: BBConfig): Promise<Result<void, BBError>>;
  getCredentials(): Promise<Result<AuthCredentials, BBError>>;
  setCredentials(credentials: AuthCredentials): Promise<Result<void, BBError>>;
  clearConfig(): Promise<Result<void, BBError>>;
  getValue<K extends keyof BBConfig>(key: K): Promise<Result<BBConfig[K] | undefined, BBError>>;
  setValue<K extends keyof BBConfig>(key: K, value: BBConfig[K]): Promise<Result<void, BBError>>;
  getConfigPath(): string;
}

/**
 * Git service interface
 */
export interface IGitService {
  isRepository(): Promise<boolean>;
  clone(url: string, destination?: string): Promise<Result<void, BBError>>;
  fetch(remote?: string): Promise<Result<void, BBError>>;
  checkout(branch: string): Promise<Result<void, BBError>>;
  checkoutNewBranch(branch: string, startPoint?: string): Promise<Result<void, BBError>>;
  getCurrentBranch(): Promise<Result<string, BBError>>;
  getRemoteUrl(remote?: string): Promise<Result<string, BBError>>;
}

/**
 * Context service interface for resolving workspace/repo
 */
export interface IContextService {
  parseRemoteUrl(url: string): RepoContext | null;
  getRepoContextFromGit(): Promise<Result<RepoContext | null, BBError>>;
  getRepoContext(options: GlobalOptions): Promise<Result<RepoContext | null, BBError>>;
  requireRepoContext(options: GlobalOptions): Promise<Result<RepoContext, BBError>>;
}

/**
 * HTTP client interface for API calls
 */
export interface IHttpClient {
  get<T>(path: string): Promise<Result<T, BBError>>;
  post<T>(path: string, body?: unknown): Promise<Result<T, BBError>>;
  put<T>(path: string, body?: unknown): Promise<Result<T, BBError>>;
  delete<T>(path: string): Promise<Result<T, BBError>>;
  getText(path: string): Promise<Result<string, BBError>>;
}

/**
 * User repository interface
 */
export interface IUserRepository {
  getCurrentUser(): Promise<Result<BitbucketUser, BBError>>;
}

/**
 * Repository repository interface (repos management)
 */
export interface IRepoRepository {
  get(workspace: string, repoSlug: string): Promise<Result<BitbucketRepository, BBError>>;
  list(workspace: string, limit?: number): Promise<Result<PaginatedResponse<BitbucketRepository>, BBError>>;
  create(workspace: string, request: CreateRepositoryRequest): Promise<Result<BitbucketRepository, BBError>>;
  delete(workspace: string, repoSlug: string): Promise<Result<void, BBError>>;
}

/**
 * Pull request repository interface
 */
export interface IPullRequestRepository {
  get(workspace: string, repoSlug: string, id: number): Promise<Result<BitbucketPullRequest, BBError>>;
  list(
    workspace: string,
    repoSlug: string,
    state?: PullRequestState,
    limit?: number
  ): Promise<Result<PaginatedResponse<BitbucketPullRequest>, BBError>>;
  create(
    workspace: string,
    repoSlug: string,
    request: CreatePullRequestRequest
  ): Promise<Result<BitbucketPullRequest, BBError>>;
  update(
    workspace: string,
    repoSlug: string,
    id: number,
    request: UpdatePullRequestRequest
  ): Promise<Result<BitbucketPullRequest, BBError>>;
  merge(
    workspace: string,
    repoSlug: string,
    id: number,
    request?: MergePullRequestRequest
  ): Promise<Result<BitbucketPullRequest, BBError>>;
  approve(workspace: string, repoSlug: string, id: number): Promise<Result<BitbucketApproval, BBError>>;
  decline(workspace: string, repoSlug: string, id: number): Promise<Result<BitbucketPullRequest, BBError>>;
  getDiff(workspace: string, repoSlug: string, id: number): Promise<Result<string, BBError>>;
  getDiffstat(workspace: string, repoSlug: string, id: number): Promise<Result<DiffStat, BBError>>;
  listComments(
    workspace: string,
    repoSlug: string,
    prId: number,
    limit?: number
  ): Promise<Result<PaginatedResponse<BitbucketComment>, BBError>>;
  getComment(
    workspace: string,
    repoSlug: string,
    prId: number,
    commentId: number
  ): Promise<Result<BitbucketComment, BBError>>;
  createComment(
    workspace: string,
    repoSlug: string,
    prId: number,
    content: string
  ): Promise<Result<BitbucketComment, BBError>>;
  updateComment(
    workspace: string,
    repoSlug: string,
    prId: number,
    commentId: number,
    content: string
  ): Promise<Result<BitbucketComment, BBError>>;
  deleteComment(
    workspace: string,
    repoSlug: string,
    prId: number,
    commentId: number
  ): Promise<Result<void, BBError>>;
}

/**
 * Output service interface for formatting and displaying output
 */
export interface IOutputService {
  json(data: unknown): void;
  table(headers: string[], rows: string[][]): void;
  success(message: string): void;
  error(message: string): void;
  warning(message: string): void;
  info(message: string): void;
  text(message: string): void;
  formatDate(date: string | Date): string;
}
