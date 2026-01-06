/**
 * Completion commands tests
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { InstallCompletionCommand } from "../../src/commands/completion/install.command.js";
import { UninstallCompletionCommand } from "../../src/commands/completion/uninstall.command.js";
import { createMockOutputService } from "../setup.js";
import type { CommandContext } from "../../src/core/interfaces/commands.js";

describe("Completion Commands", () => {
  let output: ReturnType<typeof createMockOutputService>;
  let mockTabtabInstall: ReturnType<typeof mock.fn>;
  let mockTabtabUninstall: ReturnType<typeof mock.fn>;

  beforeEach(() => {
    output = createMockOutputService();

    mockTabtabInstall = mock(() => Promise.resolve());
    mockTabtabUninstall = mock(() => Promise.resolve());

    mock.module("tabtab", () => ({
      default: {
        install: mockTabtabInstall,
        uninstall: mockTabtabUninstall,
      },
    }));
  });

  afterEach(() => {
    mock.restore("tabtab");
  });

  describe("InstallCompletionCommand", () => {
    it("should have correct name", () => {
      const command = new InstallCompletionCommand(output);

      expect(command.name).toBe("install");
      expect(typeof command.name).toBe("string");
    });

    it("should have description", () => {
      const command = new InstallCompletionCommand(output);

      expect(command.description).toBe("Install shell completions");
      expect(typeof command.description).toBe("string");
    });

    it("should call tabtab.install with correct options", async () => {
      const command = new InstallCompletionCommand(output);
      const context: CommandContext = { globalOptions: {} };

      await command.execute(undefined, context);

      expect(mockTabtabInstall).toHaveBeenCalledWith({
        name: "bb",
        completer: "bb",
      });
      expect(mockTabtabInstall).toHaveBeenCalledTimes(1);
    });

    it("should output success message on successful install", async () => {
      const command = new InstallCompletionCommand(output);
      const context: CommandContext = { globalOptions: {} };

      await command.execute(undefined, context);

      expect(output.logs).toContainEqual("success:Shell completions installed successfully!");
      expect(output.logs).toContainEqual("text:Restart your shell or source your profile to enable completions.");
    });

    it("should handle installation errors gracefully", async () => {
      const mockInstallFail = mock(() => Promise.reject(new Error("Permission denied")));
      mock.module("tabtab", () => ({
        default: {
          install: mockInstallFail,
          uninstall: mockTabtabUninstall,
        },
      }));

      const command = new InstallCompletionCommand(output);
      const context: CommandContext = { globalOptions: {} };

      const result = await command.execute(undefined, context);

      expect(result.success).toBe(true);
      expect(output.logs).toContainEqual("error:Failed to install completions: Error: Permission denied");
    });

    it("should return ok result even on error", async () => {
      const mockInstallFail = mock(() => Promise.reject(new Error("Some error")));
      mock.module("tabtab", () => ({
        default: {
          install: mockInstallFail,
          uninstall: mockTabtabUninstall,
        },
      }));

      const command = new InstallCompletionCommand(output);
      const context: CommandContext = { globalOptions: {} };

      const result = await command.execute(undefined, context);

      expect(result.success).toBe(true);
    });
  });

  describe("UninstallCompletionCommand", () => {
    it("should have correct name", () => {
      const command = new UninstallCompletionCommand(output);

      expect(command.name).toBe("uninstall");
      expect(typeof command.name).toBe("string");
    });

    it("should have description", () => {
      const command = new UninstallCompletionCommand(output);

      expect(command.description).toBe("Uninstall shell completions");
      expect(typeof command.description).toBe("string");
    });

    it("should call tabtab.uninstall with correct options", async () => {
      const command = new UninstallCompletionCommand(output);
      const context: CommandContext = { globalOptions: {} };

      await command.execute(undefined, context);

      expect(mockTabtabUninstall).toHaveBeenCalledWith({
        name: "bb",
      });
      expect(mockTabtabUninstall).toHaveBeenCalledTimes(1);
    });

    it("should output success message on successful uninstall", async () => {
      const command = new UninstallCompletionCommand(output);
      const context: CommandContext = { globalOptions: {} };

      await command.execute(undefined, context);

      expect(output.logs).toContainEqual("success:Shell completions uninstalled successfully!");
    });

    it("should handle uninstallation errors gracefully", async () => {
      const mockUninstallFail = mock(() => Promise.reject(new Error("File not found")));
      mock.module("tabtab", () => ({
        default: {
          install: mockTabtabInstall,
          uninstall: mockUninstallFail,
        },
      }));

      const command = new UninstallCompletionCommand(output);
      const context: CommandContext = { globalOptions: {} };

      const result = await command.execute(undefined, context);

      expect(result.success).toBe(true);
      expect(output.logs).toContainEqual("error:Failed to uninstall completions: Error: File not found");
    });

    it("should return ok result even on error", async () => {
      const mockUninstallFail = mock(() => Promise.reject(new Error("Some error")));
      mock.module("tabtab", () => ({
        default: {
          install: mockTabtabInstall,
          uninstall: mockUninstallFail,
        },
      }));

      const command = new UninstallCompletionCommand(output);
      const context: CommandContext = { globalOptions: {} };

      const result = await command.execute(undefined, context);

      expect(result.success).toBe(true);
    });
  });
});
