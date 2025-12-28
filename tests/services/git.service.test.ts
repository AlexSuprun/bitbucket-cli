/**
 * GitService tests
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { GitService } from "../../src/services/git.service.js";
import { ErrorCode } from "../../src/types/errors.js";
import { mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";

describe("GitService", () => {
  const testDir = join("/tmp", `bb-git-test-${Date.now()}`);
  let gitService: GitService;

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    gitService = new GitService(testDir);
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("isRepository", () => {
    it("should return false for non-git directory", async () => {
      const result = await gitService.isRepository();

      expect(result).toBe(false);
    });

    it("should return true for git directory", async () => {
      // Initialize a git repo
      const proc = Bun.spawn(["git", "init"], { cwd: testDir });
      await proc.exited;

      const result = await gitService.isRepository();

      expect(result).toBe(true);
    });
  });

  describe("getCurrentBranch", () => {
    it("should return current branch name", async () => {
      // Initialize git repo with a commit
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.email", "test@test.com"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.name", "Test"], { cwd: testDir }).exited;
      await writeFile(join(testDir, "test.txt"), "test");
      await Bun.spawn(["git", "add", "."], { cwd: testDir }).exited;
      await Bun.spawn(["git", "commit", "-m", "Initial"], { cwd: testDir }).exited;

      const result = await gitService.getCurrentBranch();

      expect(result.success).toBe(true);
      if (result.success) {
        // Could be 'main' or 'master' depending on git config
        expect(["main", "master"]).toContain(result.value);
      }
    });

    it("should return error for non-git directory", async () => {
      const result = await gitService.getCurrentBranch();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.GIT_COMMAND_FAILED);
      }
    });
  });

  describe("getRemoteUrl", () => {
    it("should return error when no remote exists", async () => {
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;

      const result = await gitService.getRemoteUrl("origin");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.GIT_REMOTE_NOT_FOUND);
        expect(result.error.message).toContain("origin");
      }
    });

    it("should return remote URL when exists", async () => {
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;
      await Bun.spawn(
        ["git", "remote", "add", "origin", "git@bitbucket.org:workspace/repo.git"],
        { cwd: testDir }
      ).exited;

      const result = await gitService.getRemoteUrl("origin");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe("git@bitbucket.org:workspace/repo.git");
      }
    });

    it("should support different remote names", async () => {
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;
      await Bun.spawn(
        ["git", "remote", "add", "upstream", "https://bitbucket.org/other/repo.git"],
        { cwd: testDir }
      ).exited;

      const result = await gitService.getRemoteUrl("upstream");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe("https://bitbucket.org/other/repo.git");
      }
    });
  });

  describe("checkout", () => {
    it("should checkout existing branch", async () => {
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.email", "test@test.com"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.name", "Test"], { cwd: testDir }).exited;
      await writeFile(join(testDir, "test.txt"), "test");
      await Bun.spawn(["git", "add", "."], { cwd: testDir }).exited;
      await Bun.spawn(["git", "commit", "-m", "Initial"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "branch", "feature"], { cwd: testDir }).exited;

      const result = await gitService.checkout("feature");

      expect(result.success).toBe(true);

      const branchResult = await gitService.getCurrentBranch();
      expect(branchResult.success && branchResult.value).toBe("feature");
    });

    it("should return error for non-existent branch", async () => {
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.email", "test@test.com"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.name", "Test"], { cwd: testDir }).exited;
      await writeFile(join(testDir, "test.txt"), "test");
      await Bun.spawn(["git", "add", "."], { cwd: testDir }).exited;
      await Bun.spawn(["git", "commit", "-m", "Initial"], { cwd: testDir }).exited;

      const result = await gitService.checkout("nonexistent");

      expect(result.success).toBe(false);
    });
  });

  describe("checkoutNewBranch", () => {
    it("should create and checkout new branch", async () => {
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.email", "test@test.com"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.name", "Test"], { cwd: testDir }).exited;
      await writeFile(join(testDir, "test.txt"), "test");
      await Bun.spawn(["git", "add", "."], { cwd: testDir }).exited;
      await Bun.spawn(["git", "commit", "-m", "Initial"], { cwd: testDir }).exited;

      const result = await gitService.checkoutNewBranch("new-feature");

      expect(result.success).toBe(true);

      const branchResult = await gitService.getCurrentBranch();
      expect(branchResult.success && branchResult.value).toBe("new-feature");
    });

    it("should create branch from specific start point", async () => {
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.email", "test@test.com"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.name", "Test"], { cwd: testDir }).exited;
      await writeFile(join(testDir, "test.txt"), "test");
      await Bun.spawn(["git", "add", "."], { cwd: testDir }).exited;
      await Bun.spawn(["git", "commit", "-m", "Initial"], { cwd: testDir }).exited;

      // Get current commit hash
      const proc = Bun.spawn(["git", "rev-parse", "HEAD"], { cwd: testDir, stdout: "pipe" });
      const commitHash = (await new Response(proc.stdout).text()).trim();

      const result = await gitService.checkoutNewBranch("from-commit", commitHash);

      expect(result.success).toBe(true);
    });

    it("should fail if branch already exists", async () => {
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.email", "test@test.com"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "config", "user.name", "Test"], { cwd: testDir }).exited;
      await writeFile(join(testDir, "test.txt"), "test");
      await Bun.spawn(["git", "add", "."], { cwd: testDir }).exited;
      await Bun.spawn(["git", "commit", "-m", "Initial"], { cwd: testDir }).exited;
      await Bun.spawn(["git", "branch", "existing"], { cwd: testDir }).exited;

      const result = await gitService.checkoutNewBranch("existing");

      expect(result.success).toBe(false);
    });
  });

  describe("fetch", () => {
    it("should return error when no remote exists", async () => {
      await Bun.spawn(["git", "init"], { cwd: testDir }).exited;

      const result = await gitService.fetch("origin");

      expect(result.success).toBe(false);
    });
  });

  describe("clone", () => {
    it("should clone repository", async () => {
      // Create a bare repo to clone from
      const bareDir = join(testDir, "bare.git");
      await Bun.spawn(["git", "init", "--bare", bareDir]).exited;

      const cloneDir = join(testDir, "cloned");
      const result = await gitService.clone(bareDir, cloneDir);

      expect(result.success).toBe(true);
    });

    it("should handle clone with destination directory", async () => {
      const bareDir = join(testDir, "bare2.git");
      await Bun.spawn(["git", "init", "--bare", bareDir]).exited;

      const cloneDir = join(testDir, "cloned-with-dest");
      const result = await gitService.clone(bareDir, cloneDir);

      expect(result.success).toBe(true);
    });
  });

  describe("withCwd", () => {
    it("should create new instance with different cwd", async () => {
      const otherDir = join(testDir, "other");
      await mkdir(otherDir, { recursive: true });
      await Bun.spawn(["git", "init"], { cwd: otherDir }).exited;

      const otherService = gitService.withCwd(otherDir);
      const result = await otherService.isRepository();

      expect(result).toBe(true);
    });

    it("should not affect original instance", async () => {
      const otherDir = join(testDir, "other");
      await mkdir(otherDir, { recursive: true });
      await Bun.spawn(["git", "init"], { cwd: otherDir }).exited;

      gitService.withCwd(otherDir);

      // Original should still be non-git directory
      const result = await gitService.isRepository();
      expect(result).toBe(false);
    });
  });
});
