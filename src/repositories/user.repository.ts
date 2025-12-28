/**
 * User repository implementation
 */

import type { IUserRepository, IHttpClient } from "../core/interfaces/services.js";
import type { Result } from "../types/result.js";
import type { BBError } from "../types/errors.js";
import type { BitbucketUser } from "../types/api.js";

export class UserRepository implements IUserRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  public async getCurrentUser(): Promise<Result<BitbucketUser, BBError>> {
    return this.httpClient.get<BitbucketUser>("/user");
  }
}
