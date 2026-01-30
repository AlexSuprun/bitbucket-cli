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
import { ActivityPRCommand } from "../../src/commands/pr/activity.command.js";
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
  BitbucketPullRequestActivity,
  BitbucketComment,
  UpdatePullRequestRequest,
} from "../../src/types/api.js";

function createMockPRRepository(
  prs: BitbucketPullRequest[] = [mockPullRequest]
): IPullRequestRepository {
  return {
    async get(workspace: string, repoSlug: string, id: number) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return pr;
      }
      throw { code: 2002, message: "Not found" } as BBError;
    },
    async list(workspace: string, repoSlug: string, state = "OPEN", limit = 25) {
      const filtered = prs.filter((p) => p.state === state);
      return {
        values: filtered.slice(0, limit),
        pagelen: limit,
        size: filtered.length,
      } as PaginatedResponse<BitbucketPullRequest>;
    },
    async create(workspace: string, repoSlug: string, request) {
      return {
        ...mockPullRequest,
        title: request.title,
        source: { ...mockPullRequest.source, branch: request.source.branch },
        destination: { ...mockPullRequest.destination, branch: request.destination.branch },
        draft: request.draft ?? false,
      };
    },
    async merge(workspace: string, repoSlug: string, id: number, request) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return { ...pr, state: "MERGED" as const };
      }
      throw { code: 2002, message: "Not found" } as BBError;
    },
    async approve(workspace: string, repoSlug: string, id: number) {
      return mockApproval;
    },
    async decline(workspace: string, repoSlug: string, id: number) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return { ...pr, state: "DECLINED" as const };
      }
      throw { code: 2002, message: "Not found" } as BBError;
    },
    async getDiff(workspace: string, repoSlug: string, id: number) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return mockDiff;
      }
      throw { code: 2002, message: "Not found" } as BBError;
    },
    async getDiffstat(workspace: string, repoSlug: string, id: number) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return mockDiffStat;
      }
      throw { code: 2002, message: "Not found" } as BBError;
    },
    async listActivity(workspace: string, repoSlug: string, prId: number, limit = 25) {
      const activity: BitbucketPullRequestActivity = {
        comment: {
          id: 101,
          content: { raw: "Looks good to me" },
          user: mockPullRequest.author,
          created_on: "2024-01-02T00:00:00.000Z",
        },
      };
      return {
        values: [activity].slice(0, limit),
        pagelen: limit,
        size: 1,
      };
    },
    async update(workspace: string, repoSlug: string, id: number, request: UpdatePullRequestRequest) {
      const pr = prs.find((p) => p.id === id);
      if (pr) {
        return {
          ...pr,
          title: request.title ?? pr.title,
          description: request.description ?? pr.description,
          draft: request.draft ?? pr.draft,
        };
      }
      throw { code: 2002, message: "Not found" } as BBError;
    },
    async listComments() {
      return {
        values: [] as BitbucketComment[],
        pagelen: 0,
        size: 0,
      } as PaginatedResponse<BitbucketComment>;
    },
    async getComment() {
      throw { code: 2002, message: "Not found" } as BBError;
    },
    async createComment() {
      throw { code: 2001, message: "Failed" } as BBError;
    },
    async updateComment() {
      throw { code: 2001, message: "Failed" } as BBError;
    },
    async deleteComment() {
      throw { code: 2001, message: "Failed" } as BBError;
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
      return null;
    },
    async getRepoContext(options) {
      // Options take priority
      if (options?.workspace && options?.repo) {
        return {
          workspace: options.workspace,
          repoSlug: options.repo,
        };
      }
      if (context?.workspace && context?.repoSlug) {
        return {
          workspace: context.workspace,
          repoSlug: context.repoSlug,
        };
      }
      return null;
    },
    async requireRepoContext(options) {
      // Options take priority
      if (options?.workspace && options?.repo) {
        return {
          workspace: options.workspace,
          repoSlug: options.repo,
        };
      }
      if (context?.workspace && context?.repoSlug) {
        return {
          workspace: context.workspace,
          repoSlug: context.repoSlug,
        };
      }
      throw { code: 6001, message: "No repo context" } as BBError;
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

    expect(result.values).toHaveLength(1);
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

    expect(result.values.every((pr) => pr.state === "MERGED")).toBe(true);
  });

  it("should fail when no repo context", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService();
    const output = createMockOutputService();

    const command = new ListPRsCommand(prRepository, contextService, output);
    
    await expect(command.execute({}, { globalOptions: {} })).rejects.toThrow();
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

    expect(result.values.length).toBeLessThanOrEqual(2);
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

    expect(result.id).toBe(1);
    expect(result.title).toBe("Test PR");
  });

  it("should fail when ID not provided", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ViewPRCommand(prRepository, contextService, output);
    
    await expect(command.execute({} as { id: string }, { globalOptions: {} })).rejects.toThrow();
  });

  it("should fail for non-existent PR", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ViewPRCommand(prRepository, contextService, output);
    
    await expect(command.execute({ id: "999" }, { globalOptions: {} })).rejects.toThrow();
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

describe("ActivityPRCommand", () => {
  it("should list activity entries", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ActivityPRCommand(prRepository, contextService, output);
    const result = await command.execute({ id: "1" }, { globalOptions: {} });

    expect(result).toBeDefined();
    expect(output.logs.some((log) => log.includes("table:"))).toBe(true);
  });

  it("should filter activity by type", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService({
      workspace: "workspace",
      repoSlug: "repo",
    });
    const output = createMockOutputService();

    const command = new ActivityPRCommand(prRepository, contextService, output);
    await command.execute({ id: "1", type: "approval" }, { globalOptions: {} });

    expect(
      output.logs.some((log) => log.includes("info:No activity entries matched"))
    ).toBe(true);
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

    expect(result).toBeDefined();
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
    
    await expect(command.execute({}, { globalOptions: {} })).rejects.toThrow();
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

    expect(result.source.branch.name).toBe("my-feature");
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

    expect(result.source.branch.name).toBe("explicit-branch");
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

    expect(result.destination.branch.name).toBe("main");
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

    expect(result.destination.branch.name).toBe("develop");
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

    expect(result.draft).toBe(true);
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

    expect(result.state).toBe("MERGED");
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
    
    await expect(command.execute({} as { id: string }, { globalOptions: {} })).rejects.toThrow();
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

    expect(result.approved).toBe(true);
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
    expect(result).toBeDefined();
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

    expect(result.state).toBe("DECLINED");
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
    
    await expect(command.execute({} as { id: string }, { globalOptions: {} })).rejects.toThrow();
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

    expect(result.draft).toBe(false);
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

    expect(result).toBeDefined();
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
    
    await expect(command.execute({} as { id: string }, { globalOptions: {} })).rejects.toThrow();
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
    
    await expect(command.execute({ id: "999" }, { globalOptions: {} })).rejects.toThrow();
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

    expect(result.diff).toContain("diff --git");
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

    expect(result.diff).toContain("diff --git");
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
    
    await expect(command.execute({}, { globalOptions: {} })).rejects.toThrow();
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

    expect(result.stat).toBeDefined();
    expect(result.stat!.filesChanged).toBe(2);
    expect(result.stat!.insertions).toBe(30);
    expect(result.stat!.deletions).toBe(5);
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

    expect(result.diff).toContain("src/file.ts");
    expect(result.diff).toContain("src/newfile.ts");
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
    
    await expect(command.execute({ id: "999" }, { globalOptions: {} })).rejects.toThrow();
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

    expect(result.title).toBe("New Title");
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

    expect(result.description).toBe("New description");
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

    expect(result.title).toBe("New Title");
    expect(result.description).toBe("New description");
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

    expect(result.title).toBe("Updated via auto-detect");
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
    
    await expect(command.execute({ id: "1" }, { globalOptions: {} })).rejects.toThrow();
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
    
    await expect(command.execute(
      { id: "999", title: "New Title" },
      { globalOptions: {} }
    )).rejects.toThrow();
  });

  it("should fail when no repo context", async () => {
    const prRepository = createMockPRRepository();
    const contextService = createMockContextService();
    const gitService = createMockGitService();
    const output = createMockOutputService();

    const command = new EditPRCommand(prRepository, contextService, gitService, output);
    
    await expect(command.execute(
      { id: "1", title: "New Title" },
      { globalOptions: {} }
    )).rejects.toThrow();
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
    
    await expect(command.execute(
      { title: "New Title" },
      { globalOptions: {} }
    )).rejects.toThrow();
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
