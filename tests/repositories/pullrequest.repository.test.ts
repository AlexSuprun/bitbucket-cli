/**
 * PullRequest repository tests
 */

import { describe, it, expect } from "bun:test";
import { PullRequestRepository } from "../../src/repositories/pullrequest.repository.js";
import { Result } from "../../src/types/result.js";
import { createMockHttpClient, mockPullRequest, mockApproval } from "../setup.js";
import type { BBError } from "../../src/types/errors.js";
import type {
  PaginatedResponse,
  BitbucketPullRequest,
  BitbucketApproval,
} from "../../src/types/api.js";

describe("PullRequestRepository", () => {
  describe("get", () => {
    it("should return pull request on success", async () => {
      const responses = new Map([
        ["GET:/repositories/workspace/repo/pullrequests/1", Result.ok(mockPullRequest)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.get("workspace", "repo", 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id).toBe(1);
        expect(result.value.title).toBe("Test PR");
        expect(result.value.state).toBe("OPEN");
      }
    });

    it("should URL-encode workspace and repo", async () => {
      const responses = new Map([
        [
          "GET:/repositories/my%20workspace/my%20repo/pullrequests/1",
          Result.ok(mockPullRequest),
        ],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.get("my workspace", "my repo", 1);

      expect(result.success).toBe(true);
    });

    it("should return error for non-existent PR", async () => {
      const responses = new Map<string, Result<unknown, BBError>>();
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.get("workspace", "repo", 999);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(2002); // Not found
      }
    });
  });

  describe("list", () => {
    it("should return paginated pull requests", async () => {
      const paginatedResponse: PaginatedResponse<BitbucketPullRequest> = {
        values: [mockPullRequest],
        pagelen: 25,
        size: 1,
      };
      const responses = new Map([
        [
          "GET:/repositories/workspace/repo/pullrequests?state=OPEN&pagelen=25",
          Result.ok(paginatedResponse),
        ],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.list("workspace", "repo", "OPEN", 25);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.values).toHaveLength(1);
        expect(result.value.values[0].id).toBe(1);
      }
    });

    it("should use default state of OPEN", async () => {
      const paginatedResponse: PaginatedResponse<BitbucketPullRequest> = {
        values: [],
        pagelen: 25,
      };
      const responses = new Map([
        [
          "GET:/repositories/workspace/repo/pullrequests?state=OPEN&pagelen=25",
          Result.ok(paginatedResponse),
        ],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.list("workspace", "repo");

      expect(result.success).toBe(true);
    });

    it("should support MERGED state", async () => {
      const paginatedResponse: PaginatedResponse<BitbucketPullRequest> = {
        values: [],
        pagelen: 10,
      };
      const responses = new Map([
        [
          "GET:/repositories/workspace/repo/pullrequests?state=MERGED&pagelen=10",
          Result.ok(paginatedResponse),
        ],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.list("workspace", "repo", "MERGED", 10);

      expect(result.success).toBe(true);
    });

    it("should support DECLINED state", async () => {
      const paginatedResponse: PaginatedResponse<BitbucketPullRequest> = {
        values: [],
        pagelen: 50,
      };
      const responses = new Map([
        [
          "GET:/repositories/workspace/repo/pullrequests?state=DECLINED&pagelen=50",
          Result.ok(paginatedResponse),
        ],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.list("workspace", "repo", "DECLINED", 50);

      expect(result.success).toBe(true);
    });

    it("should use custom limit", async () => {
      const paginatedResponse: PaginatedResponse<BitbucketPullRequest> = {
        values: [],
        pagelen: 100,
      };
      const responses = new Map([
        [
          "GET:/repositories/workspace/repo/pullrequests?state=OPEN&pagelen=100",
          Result.ok(paginatedResponse),
        ],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.list("workspace", "repo", "OPEN", 100);

      expect(result.success).toBe(true);
    });
  });

  describe("create", () => {
    it("should create pull request", async () => {
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests", Result.ok(mockPullRequest)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.create("workspace", "repo", {
        title: "New PR",
        source: { branch: { name: "feature" } },
        destination: { branch: { name: "main" } },
      });

      expect(result.success).toBe(true);
    });

    it("should create with description", async () => {
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests", Result.ok(mockPullRequest)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.create("workspace", "repo", {
        title: "New PR",
        description: "This is a description",
        source: { branch: { name: "feature" } },
        destination: { branch: { name: "main" } },
      });

      expect(result.success).toBe(true);
    });

    it("should create with close_source_branch flag", async () => {
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests", Result.ok(mockPullRequest)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.create("workspace", "repo", {
        title: "New PR",
        source: { branch: { name: "feature" } },
        destination: { branch: { name: "main" } },
        close_source_branch: true,
      });

      expect(result.success).toBe(true);
    });

    it("should create with reviewers", async () => {
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests", Result.ok(mockPullRequest)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.create("workspace", "repo", {
        title: "New PR",
        source: { branch: { name: "feature" } },
        destination: { branch: { name: "main" } },
        reviewers: [{ uuid: "{user-uuid}" }],
      });

      expect(result.success).toBe(true);
    });
  });

  describe("update", () => {
    it("should update pull request", async () => {
      const updatedPR = { ...mockPullRequest, title: "Updated Title" };
      const responses = new Map([
        ["PUT:/repositories/workspace/repo/pullrequests/1", Result.ok(updatedPR)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.update("workspace", "repo", 1, {
        title: "Updated Title",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.title).toBe("Updated Title");
      }
    });

    it("should update with description", async () => {
      const updatedPR = { ...mockPullRequest, description: "Updated description" };
      const responses = new Map([
        ["PUT:/repositories/workspace/repo/pullrequests/1", Result.ok(updatedPR)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.update("workspace", "repo", 1, {
        description: "Updated description",
      });

      expect(result.success).toBe(true);
    });

    it("should update with reviewers", async () => {
      const updatedPR = { ...mockPullRequest, reviewers: [{ uuid: "{user-uuid}" }] };
      const responses = new Map([
        ["PUT:/repositories/workspace/repo/pullrequests/1", Result.ok(updatedPR)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.update("workspace", "repo", 1, {
        reviewers: [{ uuid: "{user-uuid}" }],
      });

      expect(result.success).toBe(true);
    });
  });

  describe("merge", () => {
    it("should merge pull request", async () => {
      const mergedPR = { ...mockPullRequest, state: "MERGED" as const };
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests/1/merge", Result.ok(mergedPR)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.merge("workspace", "repo", 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.state).toBe("MERGED");
      }
    });

    it("should merge with custom message", async () => {
      const mergedPR = { ...mockPullRequest, state: "MERGED" as const };
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests/1/merge", Result.ok(mergedPR)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.merge("workspace", "repo", 1, {
        message: "Custom merge message",
      });

      expect(result.success).toBe(true);
    });

    it("should merge with merge strategy", async () => {
      const mergedPR = { ...mockPullRequest, state: "MERGED" as const };
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests/1/merge", Result.ok(mergedPR)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.merge("workspace", "repo", 1, {
        merge_strategy: "squash",
      });

      expect(result.success).toBe(true);
    });

    it("should merge with close_source_branch", async () => {
      const mergedPR = { ...mockPullRequest, state: "MERGED" as const };
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests/1/merge", Result.ok(mergedPR)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.merge("workspace", "repo", 1, {
        close_source_branch: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("approve", () => {
    it("should approve pull request", async () => {
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests/1/approve", Result.ok(mockApproval)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.approve("workspace", "repo", 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.approved).toBe(true);
        expect(result.value.user.username).toBe("testuser");
      }
    });
  });

  describe("decline", () => {
    it("should decline pull request", async () => {
      const declinedPR = { ...mockPullRequest, state: "DECLINED" as const };
      const responses = new Map([
        ["POST:/repositories/workspace/repo/pullrequests/1/decline", Result.ok(declinedPR)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.decline("workspace", "repo", 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.state).toBe("DECLINED");
      }
    });
  });

  describe("getDiff", () => {
    it("should return diff text", async () => {
      const diffText = `diff --git a/file.ts b/file.ts
index abc123..def456 100644
--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,4 @@
 line 1
+line 2
 line 3`;
      const responses = new Map([
        ["GET:/repositories/workspace/repo/pullrequests/1/diff", Result.ok(diffText)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.getDiff("workspace", "repo", 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toContain("diff --git");
        expect(result.value).toContain("+line 2");
      }
    });

    it("should handle non-existent PR", async () => {
      const responses = new Map<string, Result<unknown, BBError>>();
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.getDiff("workspace", "repo", 999);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(2002);
      }
    });
  });

  describe("getDiffstat", () => {
    it("should return diffstat", async () => {
      const diffstat = {
        values: [
          {
            type: "diffstat",
            status: "modified",
            lines_removed: 1,
            lines_added: 2,
            old: { path: "src/file.ts" },
            new: { path: "src/file.ts" },
          },
          {
            type: "diffstat",
            status: "added",
            lines_removed: 0,
            lines_added: 10,
            new: { path: "src/newfile.ts" },
          },
        ],
        pagelen: 2,
        size: 2,
      };
      const responses = new Map([
        ["GET:/repositories/workspace/repo/pullrequests/1/diffstat", Result.ok(diffstat)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.getDiffstat("workspace", "repo", 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.values).toHaveLength(2);
        expect(result.value.values[0].lines_added).toBe(2);
        expect(result.value.values[0].lines_removed).toBe(1);
        expect(result.value.values[1].status).toBe("added");
      }
    });

    it("should handle empty diffstat", async () => {
      const diffstat = {
        values: [],
        pagelen: 0,
        size: 0,
      };
      const responses = new Map([
        ["GET:/repositories/workspace/repo/pullrequests/1/diffstat", Result.ok(diffstat)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new PullRequestRepository(httpClient);

      const result = await repository.getDiffstat("workspace", "repo", 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.values).toHaveLength(0);
      }
    });
  });
});
