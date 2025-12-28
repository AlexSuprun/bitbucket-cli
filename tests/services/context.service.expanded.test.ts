/**
 * Extended ContextService tests
 */

import { describe, it, expect } from "bun:test";
import { ContextService } from "../../src/services/context.service.js";
import { Result } from "../../src/types/result.js";
import { ErrorCode } from "../../src/types/errors.js";
import type { IGitService, IConfigService } from "../../src/core/interfaces/services.js";
import type { BBError } from "../../src/types/errors.js";
import type { BBConfig } from "../../src/types/config.js";

function createMockGitService(options: {
  isRepo?: boolean;
  remoteUrl?: string;
  remoteError?: boolean;
}): IGitService {
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
      return Result.ok("main");
    },
    async getRemoteUrl() {
      if (options.remoteError) {
        return Result.err({ code: ErrorCode.GIT_REMOTE_NOT_FOUND, message: "No remote" } as BBError);
      }
      if (options.remoteUrl) {
        return Result.ok(options.remoteUrl);
      }
      return Result.err({ code: ErrorCode.GIT_REMOTE_NOT_FOUND, message: "No remote" } as BBError);
    },
  };
}

function createMockConfigService(config: BBConfig = {}): IConfigService {
  return {
    async getConfig() {
      return Result.ok(config);
    },
    async setConfig() {
      return Result.ok(undefined);
    },
    async getCredentials() {
      if (config.username && config.apiToken) {
        return Result.ok({
          username: config.username,
          apiToken: config.apiToken,
        });
      }
      return Result.err({ code: ErrorCode.AUTH_REQUIRED, message: "Auth required" } as BBError);
    },
    async setCredentials() {
      return Result.ok(undefined);
    },
    async clearConfig() {
      return Result.ok(undefined);
    },
    async getValue<K extends keyof BBConfig>(key: K) {
      return Result.ok(config[key]);
    },
    async setValue() {
      return Result.ok(undefined);
    },
    getConfigPath() {
      return "/test/config.json";
    },
  };
}

describe("ContextService - Extended Tests", () => {
  describe("URL Parsing", () => {
    describe("SSH URLs", () => {
      it("should parse git@bitbucket.org:workspace/repo.git", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "git@bitbucket.org:workspace/repo.git",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        expect(result.success).toBe(true);
        if (result.success && result.value) {
          expect(result.value.workspace).toBe("workspace");
          expect(result.value.repoSlug).toBe("repo");
        }
      });

      it("should parse ssh://git@bitbucket.org/workspace/repo.git", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "ssh://git@bitbucket.org/workspace/repo.git",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        expect(result.success).toBe(true);
        if (result.success && result.value) {
          expect(result.value.workspace).toBe("workspace");
          expect(result.value.repoSlug).toBe("repo");
        }
      });

      it("should handle repo without .git extension", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "git@bitbucket.org:workspace/repo",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        expect(result.success).toBe(true);
        if (result.success && result.value) {
          expect(result.value.repoSlug).toBe("repo");
        }
      });
    });

    describe("HTTPS URLs", () => {
      it("should parse https://bitbucket.org/workspace/repo.git", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "https://bitbucket.org/workspace/repo.git",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        expect(result.success).toBe(true);
        if (result.success && result.value) {
          expect(result.value.workspace).toBe("workspace");
          expect(result.value.repoSlug).toBe("repo");
        }
      });

      it("should parse https://username@bitbucket.org/workspace/repo.git", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "https://username@bitbucket.org/workspace/repo.git",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        expect(result.success).toBe(true);
        if (result.success && result.value) {
          expect(result.value.workspace).toBe("workspace");
          expect(result.value.repoSlug).toBe("repo");
        }
      });

      it("should handle repo without .git extension", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "https://bitbucket.org/workspace/repo",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        expect(result.success).toBe(true);
        if (result.success && result.value) {
          expect(result.value.repoSlug).toBe("repo");
        }
      });
    });

    describe("Edge Cases", () => {
      it("should handle workspace with hyphens", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "git@bitbucket.org:my-workspace/my-repo.git",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        expect(result.success).toBe(true);
        if (result.success && result.value) {
          expect(result.value.workspace).toBe("my-workspace");
          expect(result.value.repoSlug).toBe("my-repo");
        }
      });

      it("should handle workspace with underscores", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "git@bitbucket.org:my_workspace/my_repo.git",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        expect(result.success).toBe(true);
        if (result.success && result.value) {
          expect(result.value.workspace).toBe("my_workspace");
          expect(result.value.repoSlug).toBe("my_repo");
        }
      });

      it("should handle numeric workspace/repo names", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "git@bitbucket.org:123/456.git",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        expect(result.success).toBe(true);
        if (result.success && result.value) {
          expect(result.value.workspace).toBe("123");
          expect(result.value.repoSlug).toBe("456");
        }
      });
    });

    describe("Non-Bitbucket URLs", () => {
      it("should return null for GitHub URLs (not parsed as Bitbucket)", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "git@github.com:user/repo.git",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        // Returns success with null value (not an error, just not parseable)
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.value).toBeNull();
        }
      });

      it("should return null for GitLab URLs (not parsed as Bitbucket)", async () => {
        const gitService = createMockGitService({
          isRepo: true,
          remoteUrl: "git@gitlab.com:user/repo.git",
        });
        const configService = createMockConfigService();
        const contextService = new ContextService(gitService, configService);

        const result = await contextService.getRepoContext({});

        // Returns success with null value (not an error, just not parseable)
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.value).toBeNull();
        }
      });
    });
  });

  describe("getRepoContext", () => {
    it("should return null when not in git repository", async () => {
      const gitService = createMockGitService({ isRepo: false });
      const configService = createMockConfigService();
      const contextService = new ContextService(gitService, configService);

      const result = await contextService.getRepoContext({});

      // Returns success with null (not in a git repo is not an error)
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeNull();
      }
    });

    it("should return null when no remote exists", async () => {
      const gitService = createMockGitService({
        isRepo: true,
        remoteError: true,
      });
      const configService = createMockConfigService();
      const contextService = new ContextService(gitService, configService);

      const result = await contextService.getRepoContext({});

      // Returns success with null (no remote is not an error)
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe("requireRepoContext", () => {
    it("should use provided options over git context", async () => {
      const gitService = createMockGitService({
        isRepo: true,
        remoteUrl: "git@bitbucket.org:git-workspace/git-repo.git",
      });
      const configService = createMockConfigService();
      const contextService = new ContextService(gitService, configService);

      const result = await contextService.requireRepoContext({
        workspace: "option-workspace",
        repo: "option-repo",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.workspace).toBe("option-workspace");
        expect(result.value.repoSlug).toBe("option-repo");
      }
    });

    it("should use partial options with git context", async () => {
      const gitService = createMockGitService({
        isRepo: true,
        remoteUrl: "git@bitbucket.org:git-workspace/git-repo.git",
      });
      const configService = createMockConfigService();
      const contextService = new ContextService(gitService, configService);

      const result = await contextService.requireRepoContext({
        workspace: "option-workspace",
        // repo not provided, should come from git
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.workspace).toBe("option-workspace");
        expect(result.value.repoSlug).toBe("git-repo");
      }
    });

    it("should fail when not in git repo and no context available", async () => {
      const gitService = createMockGitService({ isRepo: false });
      const configService = createMockConfigService({
        // Config defaults don't directly provide context in current implementation
        defaultWorkspace: "config-workspace",
      });
      const contextService = new ContextService(gitService, configService);

      const result = await contextService.requireRepoContext({});

      // requireRepoContext fails when no context can be determined
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.CONTEXT_REPO_NOT_FOUND);
      }
    });

    it("should fail when no context available", async () => {
      const gitService = createMockGitService({ isRepo: false });
      const configService = createMockConfigService({});
      const contextService = new ContextService(gitService, configService);

      const result = await contextService.requireRepoContext({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.CONTEXT_REPO_NOT_FOUND);
      }
    });

    it("should fail when only workspace available", async () => {
      const gitService = createMockGitService({ isRepo: false });
      const configService = createMockConfigService({
        defaultWorkspace: "workspace",
        // No defaultRepo
      });
      const contextService = new ContextService(gitService, configService);

      const result = await contextService.requireRepoContext({});

      expect(result.success).toBe(false);
    });

    it("should fail when only repo available", async () => {
      const gitService = createMockGitService({ isRepo: false });
      const configService = createMockConfigService({
        // No defaultWorkspace
        defaultRepo: "repo",
      });
      const contextService = new ContextService(gitService, configService);

      const result = await contextService.requireRepoContext({});

      expect(result.success).toBe(false);
    });
  });

  describe("Priority Order", () => {
    it("should prioritize: options > git remote > config defaults", async () => {
      const gitService = createMockGitService({
        isRepo: true,
        remoteUrl: "git@bitbucket.org:git-ws/git-repo.git",
      });
      const configService = createMockConfigService({
        defaultWorkspace: "config-ws",
        defaultRepo: "config-repo",
      });
      const contextService = new ContextService(gitService, configService);

      // Options take highest priority
      let result = await contextService.requireRepoContext({
        workspace: "option-ws",
        repo: "option-repo",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.workspace).toBe("option-ws");
        expect(result.value.repoSlug).toBe("option-repo");
      }

      // Git remote takes priority over config
      result = await contextService.requireRepoContext({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.workspace).toBe("git-ws");
        expect(result.value.repoSlug).toBe("git-repo");
      }
    });
  });
});
