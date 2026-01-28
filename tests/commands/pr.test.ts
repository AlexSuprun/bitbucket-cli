/**
 * PR command tests
 */

import { describe, it, expect } from "bun:test";
import { ListPRsCommand } from "../../src/commands/pr/list.command.js";
import { ViewPRCommand } from "../../src/commands/pr/view.command.js";
import { CreatePRCommand } from "../../src/commands/pr/create.command.js";
import { EditPRCommand } from "../../src/commands/pr/edit.command.js";
import { MergePRCommand } from "../../src/commands/pr/merge.command.js";
import { ApprovePRCommand } from "../../src/commands/pr/approve.command.js";
import { DeclinePRCommand } from "../../src/commands/pr/decline.command.js";
import { ReadyPRCommand } from "../../src/commands/pr/ready.command.js";
import { CheckoutPRCommand } from "../../src/commands/pr/checkout.command.js";
import { DiffPRCommand } from "../../src/commands/pr/diff.command.js";
import { Result } from "../../src/types/result.js";
import {
  createMockOutputService,
  createMockGitService,
  mockPullRequest,
  mockApproval,
  mockDiff,
  mockDiffStat,
} from "../setup.js";
import type {
  IPullRequestRepository,
  IContextService,
  IGitService,
} from "../../src/core/interfaces/services.js";
import type { BBError } from "../../src/types/errors.js";
import type {
  PaginatedResponse,
  BitbucketPullRequest,
  BitbucketApproval,
  DiffStat,
  UpdatePullRequestRequest,
  BitbucketComment,
} from "../../src/types/api.js";

function createMockPRRepository(
  prs: BitbucketPullRequest[] = [mockPullRequest]
): IPullRequestRepository {
  return {
    async get(workspace: string, repoSlug: string, id: number) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return Result.ok(pr);
      }
      return Result.err({ code: 2002, message: "Not found" } as BBError);
    },
    async list(workspace: string, repoSlug: string, state = "OPEN", limit = 25) {
      const filtered = prs.filter((p) => p.state === state);
      return Result.ok({
        values: filtered.slice(0, limit),
        pagelen: limit,
        size: filtered.length,
      } as PaginatedResponse<BitbucketPullRequest>);
    },
    async create(workspace: string, repoSlug: string, request) {
      return Result.ok({
        ...mockPullRequest,
        title: request.title,
        source: { ...mockPullRequest.source, branch: request.source.branch },
        destination: { ...mockPullRequest.destination, branch: request.destination.branch },
        draft: request.draft ?? false,
      });
    },
    async merge(workspace: string, repoSlug: string, id: number, request) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return Result.ok({ ...pr, state: "MERGED" as const });
      }
      return Result.err({ code: 2002, message: "Not found" } as BBError);
    },
    async approve(workspace: string, repoSlug: string, id: number) {
      return Result.ok(mockApproval);
    },
    async decline(workspace: string, repoSlug: string, id: number) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return Result.ok({ ...pr, state: "DECLINED" as const });
      }
      return Result.err({ code: 2002, message: "Not found" } as BBError);
    },
    async getDiff(workspace: string, repoSlug: string, id: number) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return Result.ok(mockDiff);
      }
      return Result.err({ code: 2002, message: "Not found" } as BBError);
    },
    async getDiffstat(workspace: string, repoSlug: string, id: number) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return Result.ok(mockDiffStat);
      }
      return Result.err({ code: 2002, message: "Not found" } as BBError);
    },
    async update(workspace: string, repoSlug: string, id: number, request: UpdatePullRequestRequest) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return Result.ok({
          ...pr,
          title: request.title ?? pr.title,
          description: request.description ?? pr.description,
          draft: request.draft ?? pr.draft,
        });
      }
      return Result.err({ code: 2002, message: "Not found" } as BBError);
    },
    async listComments() {
      return Result.ok({
        values: [] as BitbucketComment[],
        pagelen: 0,
        size: 0,
      } as PaginatedResponse<BitbucketComment>);
    },
    async getComment() {
      return Result.err({ code: 2002, message: "Not found" } as BBError);
    },
    async createComment() {
      return Result.err({ code: 2001, message: "Failed" } as BBError);
    },
    async updateComment() {
      return Result.err({ code: 2001, message: "Failed" } as BBError);
    },
    async deleteComment() {
      return Result.err({ code: 2001, message: "Failed" } as BBError);
    },
  };
}

function createMockContextService(context?: {
  workspace?: string;
  repoSlug?: string;
}): IContextService {
  return {
    parseRemoteUrl() {
      return null;
    },
    async getRepoContextFromGit() {
      return Result.ok(null);
    },
    async getRepoContext(options) {
      // Options take priority
      if (options?.workspace && options?.repo) {
        return Result.ok({
          workspace: options.workspace,
          repoSlug: options.repo,
        });
      }
      if (context?.workspace && context?.repoSlug) {
        return Result.ok({
          workspace: context.workspace,
          repoSlug: context.repoSlug,
        });
      }
      return Result.ok(null);
    },
    async requireRepoContext(options) {
      // Options take priority
      if (options?.workspace && options?.repo) {
        return Result.ok({
          workspace: options.workspace,
          repoSlug: options.repo,
        });
      }
      if (context?.workspace && context?.repoSlug) {
        return Result.ok({
          workspace: context.workspace,
          repoSlug: context.repoSlug,
        });
      }
      return Result.err({ code: 6001, message: "No repo context" } as BBError);
    },
  };
}

describe("ListPRsCommand", () => {
  it("should list open pull requests by default", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ListPRsCommand(prRepository, contextService, output);
    const result = await command.execute({}, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.values).toHaveLength(1);
    }
    expect(output.logs.some((log) => log.includes("table:"))).toBe(true);
  });

  it("should filter by state", async () => {
    const prs = [
      { ...mockPullRequest, id: 1, state: "OPEN" as const },
      { ...mockPullRequest, id: 2, state: "MERGED" as const },
    ];
    const prRepository = createMockPRRepository(prs);
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ListPRsCommand(prRepository, contextService, output);
    const result = await command.execute(
      { state: "MERGED" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.values.every((pr) => pr.state === "MERGED")).toBe(true);
    }
  });

  it("should fail when no repo context", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService();
    const output = createMockOutputService();

    const command = new ListPRsCommand(prRepository, contextService, output);
    const result = await command.execute({}, { globalOptions: {} });

    expect(result.success).toBe(false);
  });

  it("should show message when no PRs found", async () => {
    const prRepository = createMockPRRepository([]);
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ListPRsCommand(prRepository, contextService, output);
    await command.execute({}, { globalOptions: {} });

    expect(output.logs.some((log) => log.includes("No open pull requests found"))).toBe(
      true
    );
  });

  it("should respect limit option", async () => {
    const prs = [
      { ...mockPullRequest, id: 1 },
      { ...mockPullRequest, id: 2 },
      { ...mockPullRequest, id: 3 },
    ];
    const prRepository = createMockPRRepository(prs);
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ListPRsCommand(prRepository, contextService, output);
    const result = await command.execute(
      { limit: "2" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.values.length).toBeLessThanOrEqual(2);
    }
  });

  it("should output JSON when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ListPRsCommand(prRepository, contextService, output);
    await command.execute({}, { globalOptions: { json: true } });

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });

  it("should label draft pull requests", async () => {
    const prs = [{ ...mockPullRequest, id: 1, draft: true }];
    const prRepository = createMockPRRepository(prs);
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ListPRsCommand(prRepository, contextService, output);
    await command.execute({}, { globalOptions: {} });

    expect(output.logs.some((log) => log.includes("table-rows:"))).toBe(true);
    expect(output.logs.some((log) => log.includes("[DRAFT]"))).toBe(true);
  });
});

describe("ViewPRCommand", () => {
  it("should view pull request by ID", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ViewPRCommand(prRepository, contextService, output);
    const result = await command.execute({ id: "1" }, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.id).toBe(1);
      expect(result.value.title).toBe("Test PR");
    }
  });

  it("should fail when ID not provided", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ViewPRCommand(prRepository, contextService, output);
    const result = await command.execute({} as { id: string }, { globalOptions: {} });

    expect(result.success).toBe(false);
  });

  it("should fail for non-existent PR", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ViewPRCommand(prRepository, contextService, output);
    const result = await command.execute({ id: "999" }, { globalOptions: {} });

    expect(result.success).toBe(false);
  });

  it("should output JSON when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ViewPRCommand(prRepository, contextService, output);
    await command.execute({ id: "1" }, { globalOptions: { json: true } });

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });

  it("should show draft indicator when PR is draft", async () => {
    const prRepository = createMockPRRepository([{ ...mockPullRequest, draft: true }]);
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ViewPRCommand(prRepository, contextService, output);
    await command.execute({ id: "1" }, { globalOptions: {} });

    expect(output.logs.some((log) => log.includes("[DRAFT]"))).toBe(true);
  });
});

describe("CreatePRCommand", () => {
  it("should create pull request with title", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "feature-branch" });
    const output = createMockOutputService();

    const command = new CreatePRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute(
      { title: "My PR" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    expect(output.logs.some((log) => log.includes("success:"))).toBe(true);
  });

  it("should fail when title not provided", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new CreatePRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute({}, { globalOptions: {} });

    expect(result.success).toBe(false);
    expect(output.logs.some((log) => log.includes("title"))).toBe(true);
  });

  it("should use current branch as source", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "my-feature" });
    const output = createMockOutputService();

    const command = new CreatePRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute(
      { title: "My PR" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.source.branch.name).toBe("my-feature");
    }
  });

  it("should use explicit source branch", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new CreatePRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute(
      { title: "My PR", source: "explicit-branch" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.source.branch.name).toBe("explicit-branch");
    }
  });

  it("should use main as default destination", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "feature" });
    const output = createMockOutputService();

    const command = new CreatePRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute(
      { title: "My PR" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.destination.branch.name).toBe("main");
    }
  });

  it("should use explicit destination branch", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "feature" });
    const output = createMockOutputService();

    const command = new CreatePRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute(
      { title: "My PR", destination: "develop" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.destination.branch.name).toBe("develop");
    }
  });

  it("should output JSON when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "feature" });
    const output = createMockOutputService();

    const command = new CreatePRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    await command.execute(
      { title: "My PR" },
      { globalOptions: { json: true } }
    );

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });

  it("should create draft pull request when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "feature" });
    const output = createMockOutputService();

    const command = new CreatePRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute(
      { title: "Draft PR", draft: true },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.draft).toBe(true);
    }
  });
});

describe("MergePRCommand", () => {
  it("should merge pull request", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new MergePRCommand(prRepository, contextService, output);
    const result = await command.execute({ id: "1" }, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.state).toBe("MERGED");
    }
    expect(output.logs.some((log) => log.includes("success:"))).toBe(true);
  });

  it("should fail when ID not provided", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new MergePRCommand(prRepository, contextService, output);
    const result = await command.execute({} as { id: string }, { globalOptions: {} });

    expect(result.success).toBe(false);
  });

  it("should output JSON when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new MergePRCommand(prRepository, contextService, output);
    await command.execute({ id: "1" }, { globalOptions: { json: true } });

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });
});

describe("ApprovePRCommand", () => {
  it("should approve pull request", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ApprovePRCommand(prRepository, contextService, output);
    const result = await command.execute({ id: "1" }, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.approved).toBe(true);
    }
    expect(output.logs.some((log) => log.includes("success:"))).toBe(true);
  });

  it("should handle undefined ID by parsing to NaN", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ApprovePRCommand(prRepository, contextService, output);
    // Even without ID, the command still runs - this tests the current behavior
    const result = await command.execute({ id: undefined as unknown as string }, { globalOptions: {} });

    // The approve call happens with NaN, which the mock handles
    expect(result.success).toBe(true);
  });

  it("should output JSON when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ApprovePRCommand(prRepository, contextService, output);
    await command.execute({ id: "1" }, { globalOptions: { json: true } });

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });
});

describe("DeclinePRCommand", () => {
  it("should decline pull request", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new DeclinePRCommand(prRepository, contextService, output);
    const result = await command.execute({ id: "1" }, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.state).toBe("DECLINED");
    }
    expect(output.logs.some((log) => log.includes("success:"))).toBe(true);
  });

  it("should fail when ID not provided", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new DeclinePRCommand(prRepository, contextService, output);
    const result = await command.execute({} as { id: string }, { globalOptions: {} });

    expect(result.success).toBe(false);
  });

  it("should output JSON when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new DeclinePRCommand(prRepository, contextService, output);
    await command.execute({ id: "1" }, { globalOptions: { json: true } });

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });
});

describe("ReadyPRCommand", () => {
  it("should mark pull request as ready", async () => {
    const prRepository = createMockPRRepository([{ ...mockPullRequest, draft: true }]);
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ReadyPRCommand(prRepository, contextService, output);
    const result = await command.execute({ id: "1" }, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.draft).toBe(false);
    }
    expect(output.logs.some((log) => log.includes("ready for review"))).toBe(true);
  });

  it("should output JSON when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ReadyPRCommand(prRepository, contextService, output);
    await command.execute({ id: "1" }, { globalOptions: { json: true } });

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });
});

describe("CheckoutPRCommand", () => {
  it("should checkout pull request branch", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ isRepo: true });
    const output = createMockOutputService();

    const command = new CheckoutPRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute({ id: "1" }, { globalOptions: {} });

    expect(result.success).toBe(true);
    expect(output.logs.some((log) => log.includes("success:"))).toBe(true);
  });

  it("should fail when ID not provided", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ isRepo: true });
    const output = createMockOutputService();

    const command = new CheckoutPRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute({} as { id: string }, { globalOptions: {} });

    expect(result.success).toBe(false);
  });

  it("should fail for non-existent PR", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ isRepo: true });
    const output = createMockOutputService();

    const command = new CheckoutPRCommand(
      prRepository,
      contextService,
      gitService,
      output
    );
    const result = await command.execute({ id: "999" }, { globalOptions: {} });

    expect(result.success).toBe(false);
  });
});

describe("DiffPRCommand", () => {
  it("should display full diff by ID", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new DiffPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute({ id: "1" }, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.diff).toContain("diff --git");
    }
    expect(output.logs.some((log) => log.includes("text:diff --git"))).toBe(true);
  });

  it("should display diff for current branch when no ID provided", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "feature-branch" });
    const output = createMockOutputService();

    const command = new DiffPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute({}, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.diff).toContain("diff --git");
    }
  });

  it("should fail when no ID provided and branch not found", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "other-branch" });
    const output = createMockOutputService();

    const command = new DiffPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute({}, { globalOptions: {} });

    expect(result.success).toBe(false);
  });

  it("should display diffstat when --stat flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new DiffPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute({ id: "1", stat: true }, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.stat).toBeDefined();
      expect(result.value.stat!.filesChanged).toBe(2);
      expect(result.value.stat!.insertions).toBe(30);
      expect(result.value.stat!.deletions).toBe(5);
    }
    expect(output.logs.some((log) => log.includes("2 files changed"))).toBe(true);
  });

  it("should display file names only when --name-only flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new DiffPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute({ id: "1", nameOnly: true }, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.diff).toContain("src/file.ts");
      expect(result.value.diff).toContain("src/newfile.ts");
    }
    expect(output.logs.some((log) => log.includes("text:src/file.ts"))).toBe(true);
  });

  it("should output JSON when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new DiffPRCommand(prRepository, contextService, gitService, output);
    await command.execute({ id: "1" }, { globalOptions: { json: true } });

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });

  it("should fail for non-existent PR", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new DiffPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute({ id: "999" }, { globalOptions: {} });

    expect(result.success).toBe(false);
  });
});

describe("EditPRCommand", () => {
  it("should update PR title", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute(
      { id: "1", title: "New Title" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.title).toBe("New Title");
    }
    expect(output.logs.some((log) => log.includes("success:"))).toBe(true);
  });

  it("should update PR body", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute(
      { id: "1", body: "New description" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.description).toBe("New description");
    }
  });

  it("should update both title and body", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute(
      { id: "1", title: "New Title", body: "New description" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.title).toBe("New Title");
      expect(result.value.description).toBe("New description");
    }
  });

  it("should auto-detect PR from current branch", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "feature-branch" });
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute(
      { title: "Updated via auto-detect" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.title).toBe("Updated via auto-detect");
    }
  });

  it("should fail when no changes provided", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute({ id: "1" }, { globalOptions: {} });

    expect(result.success).toBe(false);
    expect(output.logs.some((log) => log.includes("At least one of"))).toBe(true);
  });

  it("should fail when PR not found", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute(
      { id: "999", title: "New Title" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
  });

  it("should fail when no repo context", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService();
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute(
      { id: "1", title: "New Title" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
  });

  it("should fail when auto-detect finds no matching PR", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService({ currentBranch: "other-branch" });
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    const result = await command.execute(
      { title: "New Title" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
    expect(output.logs.some((log) => log.includes("No open pull request found"))).toBe(true);
  });

  it("should output JSON when flag is set", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    await command.execute(
      { id: "1", title: "New Title" },
      { globalOptions: { json: true } }
    );

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });
});
