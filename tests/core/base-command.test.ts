/**
 * Base command tests
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { BaseCommand } from "../../src/core/base-command.js";
import { createMockOutputService } from "../setup.js";
import type { CommandContext } from "../../src/core/interfaces/commands.js";
import type { BBError } from "../../src/types/errors.js";

class TestCommand extends BaseCommand<{ option?: string }, { data: string }> {
  public readonly name = "test";
  public readonly description = "Test command";

  async execute(
    _options: { option?: string },
    _context: CommandContext
  ): Promise<{ data: string }> {
    return { data: "test" };
  }
}

class TestCommandWithError extends BaseCommand<{ option?: string }, void> {
  public readonly name = "test-error";
  public readonly description = "Test command with error";

  async execute(
    _options: { option?: string },
    _context: CommandContext
  ): Promise<void> {
    throw {
      code: 5001,
      message: "Test error",
    } as BBError;
  }
}

describe("BaseCommand", () => {
  let output: ReturnType<typeof createMockOutputService>;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    output = createMockOutputService();
    originalNodeEnv = process.env.NODE_ENV;
    process.exitCode = 0;
  });

  afterEach(() => {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  describe("handleResult", () => {
    it("should output formatted data on success", () => {
      const command = new TestCommand(output);
      const context: CommandContext = { globalOptions: {} };
      const result = { data: "test" };

      command.handleResult(result, context, (data) => {
        output.text(JSON.stringify(data));
      });

      expect(output.logs).toContainEqual("text:{\"data\":\"test\"}");
    });

    it("should output JSON when json mode is enabled", () => {
      const command = new TestCommand(output);
      const context: CommandContext = { globalOptions: { json: true } };
      const result = { data: "test" };

      command.handleResult(result, context);

      expect(output.logs).toContainEqual('json:{"data":"test"}');
    });

    it("should not output when value is undefined in json mode", () => {
      const command = new TestCommand(output);
      const context: CommandContext = { globalOptions: { json: true } };
      const result = undefined as { data: string } | undefined;

      command.handleResult(result, context);

      expect(output.logs).not.toContainEqual(expect.stringContaining("json:"));
    });

    it("should output error message on failure", () => {
      const command = new TestCommandWithError(output);
      const context: CommandContext = { globalOptions: {} };
      const error = {
        code: 5001,
        message: "Test error",
      } as BBError;

      command.handleResult(error, context);

      expect(output.logs).toContainEqual("error:Test error");
    });

    it("should set exit code in production", () => {
      process.env.NODE_ENV = "production";

      const command = new TestCommandWithError(output);
      const context: CommandContext = { globalOptions: {} };
      const error = {
        code: 5001,
        message: "Test error",
      } as BBError;

      command.handleResult(error, context);

      expect(process.exitCode).toBe(1);
    });

    it("should not set exit code in test mode", () => {
      process.env.NODE_ENV = "test";

      const command = new TestCommandWithError(output);
      const context: CommandContext = { globalOptions: {} };
      const error = {
        code: 5001,
        message: "Test error",
      } as BBError;

      command.handleResult(error, context);

      expect(process.exitCode).toBe(0);
    });

    it("should not set exit code when NODE_ENV is not set", () => {
      delete process.env.NODE_ENV;

      const command = new TestCommandWithError(output);
      const context: CommandContext = { globalOptions: {} };
      const error = {
        code: 5001,
        message: "Test error",
      } as BBError;

      command.handleResult(error, context);

      expect(process.exitCode).toBe(1);
    });
  });

  describe("requireOption", () => {
    it("should return ok value when option is provided", () => {
      const command = new TestCommand(output);

      const result = command.requireOption("test-value", "test");

      expect(result).toBe("test-value");
    });

    it("should return error for empty string that is truthy", () => {
      const command = new TestCommand(output);

      expect(() => command.requireOption("", "test")).toThrow();
    });

    it("should return error for undefined value", () => {
      const command = new TestCommand(output);

      expect(() => command.requireOption(undefined, "test")).toThrow("Option --test is required");
    });

    it("should return error for null value", () => {
      const command = new TestCommand(output);

      expect(() => command.requireOption(null as unknown as string, "test")).toThrow();
    });

    it("should return error for empty string", () => {
      const command = new TestCommand(output);

      expect(() => command.requireOption("", "test")).toThrow();
    });

    it("should use custom error message when provided", () => {
      const command = new TestCommand(output);

      expect(() => command.requireOption(undefined, "test", "Custom message")).toThrow("Custom message");
    });

    it("should use correct error code", () => {
      const command = new TestCommand(output);

      try {
        command.requireOption(undefined, "test");
      } catch (error) {
        expect((error as BBError).code).toBe(5001);
      }
    });

    it("should handle numeric values", () => {
      const command = new TestCommand(output);

      const result = command.requireOption(123 as unknown as string, "test");

      expect(result).toBe(123);
    });

    it("should handle zero as valid value", () => {
      const command = new TestCommand(output);

      const result = command.requireOption(0 as unknown as string, "test");

      expect(result).toBe(0);
    });

    it("should handle false as valid value", () => {
      const command = new TestCommand(output);

      const result = command.requireOption(false as unknown as string, "test");

      expect(result).toBe(false);
    });
  });

  describe("abstract methods", () => {
    it("should have name property", () => {
      const command = new TestCommand(output);

      expect(command.name).toBe("test");
      expect(typeof command.name).toBe("string");
    });

    it("should have description property", () => {
      const command = new TestCommand(output);

      expect(command.description).toBe("Test command");
      expect(typeof command.description).toBe("string");
    });

    it("should require execute method implementation", () => {
      const command = new TestCommand(output);

      expect(typeof command.execute).toBe("function");
    });

    it("should provide output service to constructor", () => {
      const command = new TestCommand(output);

      expect(command).toBeDefined();
      expect(output).toBeDefined();
    });
  });
});
