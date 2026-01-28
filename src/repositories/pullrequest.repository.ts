/**
 * Pull Request repository implementation
 */

import type { IPullRequestRepository, IHttpClient } from "../core/interfaces/services.js";
import type { Result } from "../types/result.js";
import type { BBError } from "../types/errors.js";
import type {
  BitbucketPullRequest,
  BitbucketApproval,
  BitbucketComment,
  BitbucketPullRequestActivity,
  PaginatedResponse,
  PullRequestState,
  CreatePullRequestRequest,
  UpdatePullRequestRequest,
  MergePullRequestRequest,
  DiffStat,
} from "../types/api.js";
import { API_PAGELEN_LIMITS } from "../constants.js";

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
    const safeLimit = Math.min(limit, API_PAGELEN_LIMITS.PULL_REQUESTS);
    return this.httpClient.get<PaginatedResponse<BitbucketPullRequest>>(
      this.buildPath(workspace, repoSlug, `?state=${state}&pagelen=${safeLimit}`)
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

  public async listActivity(
    workspace: string,
    repoSlug: string,
    prId: number,
    limit: number = 25
  ): Promise<Result<PaginatedResponse<BitbucketPullRequestActivity>, BBError>> {
    const safeLimit = Math.min(limit, API_PAGELEN_LIMITS.PULL_REQUESTS);
    return this.httpClient.get<PaginatedResponse<BitbucketPullRequestActivity>>(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/activity?pagelen=${safeLimit}`
    );
  }

  public async listComments(
    workspace: string,
    repoSlug: string,
    prId: number,
    limit: number = 25
  ): Promise<Result<PaginatedResponse<BitbucketComment>, BBError>> {
    const safeLimit = Math.min(limit, API_PAGELEN_LIMITS.PULL_REQUESTS);
    return this.httpClient.get<PaginatedResponse<BitbucketComment>>(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/comments?pagelen=${safeLimit}`
    );
  }

  public async getComment(
    workspace: string,
    repoSlug: string,
    prId: number,
    commentId: number
  ): Promise<Result<BitbucketComment, BBError>> {
    return this.httpClient.get<BitbucketComment>(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/comments/${commentId}`
    );
  }

  public async createComment(
    workspace: string,
    repoSlug: string,
    prId: number,
    content: string
  ): Promise<Result<BitbucketComment, BBError>> {
    return this.httpClient.post<BitbucketComment>(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/comments`,
      { content: { raw: content } }
    );
  }

  public async updateComment(
    workspace: string,
    repoSlug: string,
    prId: number,
    commentId: number,
    content: string
  ): Promise<Result<BitbucketComment, BBError>> {
    return this.httpClient.put<BitbucketComment>(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/comments/${commentId}`,
      { content: { raw: content } }
    );
  }

  public async deleteComment(
    workspace: string,
    repoSlug: string,
    prId: number,
    commentId: number
  ): Promise<Result<void, BBError>> {
    return this.httpClient.delete<void>(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/comments/${commentId}`
    );
  }
}
