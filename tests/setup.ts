/**
 * Test setup and utilities
 */

import { beforeEach, afterEach } from "bun:test";
import { Container } from "../src/core/container.js";
import type {
  IConfigService,
  IGitService,
  IContextService,
  IOutputService,
  IHttpClient,
  IUserRepository,
  IRepoRepository,
  IPullRequestRepository,
} from "../src/core/interfaces/services.js";
import { Result } from "../src/types/result.js";
import type { BBError } from "../src/types/errors.js";
import type {
  BBConfig,
  AuthCredentials,
  RepoContext,
  GlobalOptions,
} from "../src/types/config.js";
import type {
  BitbucketUser,
  BitbucketRepository,
  BitbucketPullRequest,
  BitbucketApproval,
  PaginatedResponse,
  PullRequestState,
  CreateRepositoryRequest,
  CreatePullRequestRequest,
  MergePullRequestRequest,
} from "../src/types/api.js";

// Reset container before each test
beforeEach(() => {
  Container.reset();
});

afterEach(() => {
  Container.reset();
});

/**
 * Mock factories
 */

export function createMockConfigService(config: BBConfig = {}): IConfigService {
  let currentConfig = { ...config };

  return {
    async getConfig() {
      return Result.ok(currentConfig);
    },
    async setConfig(newConfig: BBConfig) {
      currentConfig = newConfig;
      return Result.ok(undefined);
    },
    async getCredentials() {
      if (!currentConfig.username || !currentConfig.appPassword) {
        return Result.err({
          code: 1001,
          message: "Auth required",
        } as BBError);
      }
      return Result.ok({
        username: currentConfig.username,
        appPassword: currentConfig.appPassword,
      });
    },
    async setCredentials(creds: AuthCredentials) {
      currentConfig.username = creds.username;
      currentConfig.appPassword = creds.appPassword;
      return Result.ok(undefined);
    },
    async clearConfig() {
      currentConfig = {};
      return Result.ok(undefined);
    },
    async getValue<K extends keyof BBConfig>(key: K) {
      return Result.ok(currentConfig[key]);
    },
    async setValue<K extends keyof BBConfig>(key: K, value: BBConfig[K]) {
      currentConfig[key] = value;
      return Result.ok(undefined);
    },
    getConfigPath() {
      return "/tmp/test-config/config.json";
    },
  };
}

export function createMockGitService(options: {
  isRepo?: boolean;
  currentBranch?: string;
  remoteUrl?: string;
} = {}): IGitService {
  return {
    async isRepository() {
      return options.isRepo ?? false;
    },
    async clone() {
      return Result.ok(undefined);
    },
    async fetch() {
      return Result.ok(undefined);
    },
    async checkout() {
      return Result.ok(undefined);
    },
    async checkoutNewBranch() {
      return Result.ok(undefined);
    },
    async getCurrentBranch() {
      return Result.ok(options.currentBranch ?? "main");
    },
    async getRemoteUrl() {
      if (options.remoteUrl) {
        return Result.ok(options.remoteUrl);
      }
      return Result.err({ code: 3003, message: "No remote" } as BBError);
    },
  };
}

export function createMockOutputService(): IOutputService & { logs: string[] } {
  const logs: string[] = [];

  return {
    logs,
    json(data: unknown) {
      logs.push(`json:${JSON.stringify(data)}`);
    },
    table(headers: string[], rows: string[][]) {
      logs.push(`table:${headers.join(",")}`);
    },
    success(message: string) {
      logs.push(`success:${message}`);
    },
    error(message: string) {
      logs.push(`error:${message}`);
    },
    warning(message: string) {
      logs.push(`warning:${message}`);
    },
    info(message: string) {
      logs.push(`info:${message}`);
    },
    text(message: string) {
      logs.push(`text:${message}`);
    },
    formatDate(date: string | Date) {
      return new Date(date).toISOString();
    },
  };
}

export function createMockHttpClient<T>(
  responses: Map<string, Result<T, BBError>>
): IHttpClient {
  return {
    async get<R>(path: string): Promise<Result<R, BBError>> {
      const result = responses.get(`GET:${path}`);
      return (result as Result<R, BBError>) ?? Result.err({ code: 2002, message: "Not found" } as BBError);
    },
    async post<R>(path: string): Promise<Result<R, BBError>> {
      const result = responses.get(`POST:${path}`);
      return (result as Result<R, BBError>) ?? Result.err({ code: 2001, message: "Failed" } as BBError);
    },
    async put<R>(path: string): Promise<Result<R, BBError>> {
      const result = responses.get(`PUT:${path}`);
      return (result as Result<R, BBError>) ?? Result.err({ code: 2001, message: "Failed" } as BBError);
    },
    async delete<R>(path: string): Promise<Result<R, BBError>> {
      const result = responses.get(`DELETE:${path}`);
      return (result as Result<R, BBError>) ?? Result.err({ code: 2001, message: "Failed" } as BBError);
    },
  };
}

/**
 * Mock data
 */

export const mockUser: BitbucketUser = {
  uuid: "{user-uuid}",
  username: "testuser",
  display_name: "Test User",
  account_id: "123456789",
  links: {
    html: { href: "https://bitbucket.org/testuser" },
    avatar: { href: "https://avatar.bitbucket.org/testuser" },
  },
};

export const mockRepository: BitbucketRepository = {
  uuid: "{repo-uuid}",
  full_name: "workspace/repo",
  name: "repo",
  slug: "repo",
  description: "Test repository",
  is_private: true,
  created_on: "2024-01-01T00:00:00.000Z",
  updated_on: "2024-01-02T00:00:00.000Z",
  size: 1024,
  language: "TypeScript",
  mainbranch: { name: "main", type: "branch" },
  links: {
    html: { href: "https://bitbucket.org/workspace/repo" },
    clone: [
      { name: "ssh", href: "git@bitbucket.org:workspace/repo.git" },
      { name: "https", href: "https://bitbucket.org/workspace/repo.git" },
    ],
    avatar: { href: "https://avatar.bitbucket.org/repo" },
  },
  owner: mockUser,
  workspace: {
    uuid: "{workspace-uuid}",
    slug: "workspace",
    name: "Workspace",
    links: {
      html: { href: "https://bitbucket.org/workspace" },
      avatar: { href: "https://avatar.bitbucket.org/workspace" },
    },
  },
};

export const mockPullRequest: BitbucketPullRequest = {
  id: 1,
  title: "Test PR",
  description: "Test description",
  state: "OPEN",
  author: mockUser,
  source: {
    branch: { name: "feature-branch" },
    repository: { full_name: "workspace/repo" },
    commit: { hash: "abc123" },
  },
  destination: {
    branch: { name: "main" },
    repository: { full_name: "workspace/repo" },
    commit: { hash: "def456" },
  },
  created_on: "2024-01-01T00:00:00.000Z",
  updated_on: "2024-01-02T00:00:00.000Z",
  close_source_branch: false,
  comment_count: 0,
  task_count: 0,
  links: {
    html: { href: "https://bitbucket.org/workspace/repo/pull-requests/1" },
    diff: { href: "https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/1/diff" },
    commits: { href: "https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/1/commits" },
    comments: { href: "https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/1/comments" },
    approve: { href: "https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/1/approve" },
    decline: { href: "https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/1/decline" },
    merge: { href: "https://api.bitbucket.org/2.0/repositories/workspace/repo/pullrequests/1/merge" },
  },
  participants: [],
  reviewers: [],
};

export const mockApproval: BitbucketApproval = {
  approved: true,
  user: mockUser,
  date: "2024-01-02T00:00:00.000Z",
};
