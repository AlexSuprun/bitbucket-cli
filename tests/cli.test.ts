/**
 * CLI helper tests
 */

import { describe, it, expect } from "bun:test";
import { withGlobalOptions } from "../src/cli.js";
import type { CommandContext } from "../src/core/interfaces/commands.js";

describe("withGlobalOptions", () => {
  it("should use global workspace when local is not provided", () => {
    const options = { limit: "10" };
    const context: CommandContext = {
      globalOptions: { workspace: "global-workspace" },
    };

    const result = withGlobalOptions(options, context);

    expect(result.workspace).toBe("global-workspace");
    expect(result.limit).toBe("10");
  });

  it("should use global repo when local is not provided", () => {
    const options = { limit: "10" };
    const context: CommandContext = {
      globalOptions: { repo: "global-repo" },
    };

    const result = withGlobalOptions(options, context);

    expect(result.repo).toBe("global-repo");
    expect(result.limit).toBe("10");
  });

  it("should prefer local workspace over global", () => {
    const options = { workspace: "local-workspace", limit: "10" };
    const context: CommandContext = {
      globalOptions: { workspace: "global-workspace" },
    };

    const result = withGlobalOptions(options, context);

    expect(result.workspace).toBe("local-workspace");
  });

  it("should prefer local repo over global", () => {
    const options = { repo: "local-repo", limit: "10" };
    const context: CommandContext = {
      globalOptions: { repo: "global-repo" },
    };

    const result = withGlobalOptions(options, context);

    expect(result.repo).toBe("local-repo");
  });

  it("should merge both workspace and repo from global options", () => {
    const options = { state: "OPEN" };
    const context: CommandContext = {
      globalOptions: { workspace: "test-workspace", repo: "test-repo" },
    };

    const result = withGlobalOptions(options, context);

    expect(result.workspace).toBe("test-workspace");
    expect(result.repo).toBe("test-repo");
    expect(result.state).toBe("OPEN");
  });

  it("should handle empty global options", () => {
    const options = { limit: "25" };
    const context: CommandContext = {
      globalOptions: {},
    };

    const result = withGlobalOptions(options, context);

    expect(result.workspace).toBeUndefined();
    expect(result.repo).toBeUndefined();
    expect(result.limit).toBe("25");
  });

  it("should handle undefined values in local options", () => {
    const options = { workspace: undefined, repo: undefined, limit: "5" };
    const context: CommandContext = {
      globalOptions: { workspace: "fallback-workspace", repo: "fallback-repo" },
    };

    const result = withGlobalOptions(options, context);

    expect(result.workspace).toBe("fallback-workspace");
    expect(result.repo).toBe("fallback-repo");
    expect(result.limit).toBe("5");
  });

  it("should preserve all other options", () => {
    const options = {
      title: "My PR",
      body: "Description",
      source: "feature-branch",
      destination: "main",
    };
    const context: CommandContext = {
      globalOptions: { workspace: "ws", repo: "r" },
    };

    const result = withGlobalOptions(options, context);

    expect(result.title).toBe("My PR");
    expect(result.body).toBe("Description");
    expect(result.source).toBe("feature-branch");
    expect(result.destination).toBe("main");
    expect(result.workspace).toBe("ws");
    expect(result.repo).toBe("r");
  });

  it("should handle json global option (not merged into options)", () => {
    const options = { limit: "10" };
    const context: CommandContext = {
      globalOptions: { json: true, workspace: "ws" },
    };

    const result = withGlobalOptions(options, context);

    expect(result.workspace).toBe("ws");
    // json should not be in result as it's only in globalOptions
    expect((result as Record<string, unknown>).json).toBeUndefined();
  });
});
