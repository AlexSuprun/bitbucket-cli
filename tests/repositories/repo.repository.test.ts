/**
 * Repo repository tests
 */

import { describe, it, expect } from "bun:test";
import { RepoRepository } from "../../src/repositories/repo.repository.js";
import { Result } from "../../src/types/result.js";
import { createMockHttpClient, mockRepository } from "../setup.js";
import type { BBError } from "../../src/types/errors.js";
import type { PaginatedResponse, BitbucketRepository } from "../../src/types/api.js";

describe("RepoRepository", () => {
  describe("get", () => {
    it("should return repository on success", async () => {
      const responses = new Map([
        ["GET:/repositories/workspace/repo", Result.ok(mockRepository)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new RepoRepository(httpClient);

      const result = await repository.get("workspace", "repo");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.full_name).toBe("workspace/repo");
        expect(result.value.is_private).toBe(true);
      }
    });

    it("should URL-encode workspace and repo", async () => {
      const responses = new Map([
        ["GET:/repositories/my%20workspace/my%20repo", Result.ok(mockRepository)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new RepoRepository(httpClient);

      const result = await repository.get("my workspace", "my repo");

      expect(result.success).toBe(true);
    });
  });

  describe("list", () => {
    it("should return paginated repositories", async () => {
      const paginatedResponse: PaginatedResponse<BitbucketRepository> = {
        values: [mockRepository],
        pagelen: 25,
        size: 1,
      };
      const responses = new Map([
        ["GET:/repositories/workspace?pagelen=25", Result.ok(paginatedResponse)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new RepoRepository(httpClient);

      const result = await repository.list("workspace", 25);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.values).toHaveLength(1);
        expect(result.value.values[0].full_name).toBe("workspace/repo");
      }
    });

    it("should use default limit of 25", async () => {
      const paginatedResponse: PaginatedResponse<BitbucketRepository> = {
        values: [],
        pagelen: 25,
      };
      const responses = new Map([
        ["GET:/repositories/workspace?pagelen=25", Result.ok(paginatedResponse)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new RepoRepository(httpClient);

      const result = await repository.list("workspace");

      expect(result.success).toBe(true);
    });
  });

  describe("create", () => {
    it("should create repository", async () => {
      const responses = new Map([
        ["POST:/repositories/workspace/new-repo", Result.ok(mockRepository)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new RepoRepository(httpClient);

      const result = await repository.create("workspace", {
        scm: "git",
        name: "New Repo",
        is_private: true,
      });

      expect(result.success).toBe(true);
    });

    it("should convert repo name to slug", async () => {
      const responses = new Map([
        ["POST:/repositories/workspace/my-new-repo", Result.ok(mockRepository)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new RepoRepository(httpClient);

      const result = await repository.create("workspace", {
        scm: "git",
        name: "My New Repo",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("delete", () => {
    it("should delete repository", async () => {
      const responses = new Map<string, Result<unknown, BBError>>([
        ["DELETE:/repositories/workspace/repo", Result.ok(undefined)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new RepoRepository(httpClient);

      const result = await repository.delete("workspace", "repo");

      expect(result.success).toBe(true);
    });
  });
});
