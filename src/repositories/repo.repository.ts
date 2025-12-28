/**
 * Repository repository implementation (for managing Bitbucket repositories)
 */

import type { IRepoRepository, IHttpClient } from "../core/interfaces/services.js";
import type { Result } from "../types/result.js";
import type { BBError } from "../types/errors.js";
import type {
  BitbucketRepository,
  PaginatedResponse,
  CreateRepositoryRequest,
} from "../types/api.js";

export class RepoRepository implements IRepoRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  public async get(
    workspace: string,
    repoSlug: string
  ): Promise<Result<BitbucketRepository, BBError>> {
    return this.httpClient.get<BitbucketRepository>(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}`
    );
  }

  public async list(
    workspace: string,
    limit: number = 25
  ): Promise<Result<PaginatedResponse<BitbucketRepository>, BBError>> {
    return this.httpClient.get<PaginatedResponse<BitbucketRepository>>(
      `/repositories/${encodeURIComponent(workspace)}?pagelen=${limit}`
    );
  }

  public async create(
    workspace: string,
    request: CreateRepositoryRequest
  ): Promise<Result<BitbucketRepository, BBError>> {
    const repoSlug = request.name.toLowerCase().replace(/\s+/g, "-");
    return this.httpClient.post<BitbucketRepository>(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}`,
      request
    );
  }

  public async delete(
    workspace: string,
    repoSlug: string
  ): Promise<Result<void, BBError>> {
    return this.httpClient.delete<void>(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}`
    );
  }
}
