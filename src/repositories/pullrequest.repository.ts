/**
 * Pull Request repository implementation
 */

import type { IPullRequestRepository, IHttpClient } from "../core/interfaces/services.js";
import type { Result } from "../types/result.js";
import type { BBError } from "../types/errors.js";
import type {
  BitbucketPullRequest,
  BitbucketApproval,
  PaginatedResponse,
  PullRequestState,
  CreatePullRequestRequest,
  UpdatePullRequestRequest,
  MergePullRequestRequest,
  DiffStat,
} from "../types/api.js";

export class PullRequestRepository implements IPullRequestRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  private buildPath(workspace: string, repoSlug: string, suffix: string = ""): string {
    const base = `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests`;
    return suffix ? `${base}${suffix}` : base;
  }

  public async get(
    workspace: string,
    repoSlug: string,
    id: number
  ): Promise<Result<BitbucketPullRequest, BBError>> {
    return this.httpClient.get<BitbucketPullRequest>(
      this.buildPath(workspace, repoSlug, `/${id}`)
    );
  }

  public async list(
    workspace: string,
    repoSlug: string,
    state: PullRequestState = "OPEN",
    limit: number = 25
  ): Promise<Result<PaginatedResponse<BitbucketPullRequest>, BBError>> {
    return this.httpClient.get<PaginatedResponse<BitbucketPullRequest>>(
      this.buildPath(workspace, repoSlug, `?state=${state}&pagelen=${limit}`)
    );
  }

  public async create(
    workspace: string,
    repoSlug: string,
    request: CreatePullRequestRequest
  ): Promise<Result<BitbucketPullRequest, BBError>> {
    return this.httpClient.post<BitbucketPullRequest>(
      this.buildPath(workspace, repoSlug),
      request
    );
  }

  public async update(
    workspace: string,
    repoSlug: string,
    id: number,
    request: UpdatePullRequestRequest
  ): Promise<Result<BitbucketPullRequest, BBError>> {
    return this.httpClient.put<BitbucketPullRequest>(
      this.buildPath(workspace, repoSlug, `/${id}`),
      request
    );
  }

  public async merge(
    workspace: string,
    repoSlug: string,
    id: number,
    request?: MergePullRequestRequest
  ): Promise<Result<BitbucketPullRequest, BBError>> {
    return this.httpClient.post<BitbucketPullRequest>(
      this.buildPath(workspace, repoSlug, `/${id}/merge`),
      request
    );
  }

  public async approve(
    workspace: string,
    repoSlug: string,
    id: number
  ): Promise<Result<BitbucketApproval, BBError>> {
    return this.httpClient.post<BitbucketApproval>(
      this.buildPath(workspace, repoSlug, `/${id}/approve`),
      {}
    );
  }

  public async decline(
    workspace: string,
    repoSlug: string,
    id: number
  ): Promise<Result<BitbucketPullRequest, BBError>> {
    return this.httpClient.post<BitbucketPullRequest>(
      this.buildPath(workspace, repoSlug, `/${id}/decline`),
      {}
    );
  }

  public async getDiff(
    workspace: string,
    repoSlug: string,
    id: number
  ): Promise<Result<string, BBError>> {
    return this.httpClient.getText(
      this.buildPath(workspace, repoSlug, `/${id}/diff`)
    );
  }

  public async getDiffstat(
    workspace: string,
    repoSlug: string,
    id: number
  ): Promise<Result<DiffStat, BBError>> {
    return this.httpClient.get<DiffStat>(
      this.buildPath(workspace, repoSlug, `/${id}/diffstat`)
    );
  }
}
