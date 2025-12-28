/**
 * Auth command tests
 */

import { describe, it, expect } from "bun:test";
import { LoginCommand } from "../../src/commands/auth/login.command.js";
import { LogoutCommand } from "../../src/commands/auth/logout.command.js";
import { StatusCommand } from "../../src/commands/auth/status.command.js";
import { TokenCommand } from "../../src/commands/auth/token.command.js";
import { Result } from "../../src/types/result.js";
import {
  createMockConfigService,
  createMockOutputService,
  mockUser,
} from "../setup.js";
import type { IUserRepository } from "../../src/core/interfaces/services.js";
import type { BBError } from "../../src/types/errors.js";

describe("LoginCommand", () => {
  it("should fail when username is not provided", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();
    const userRepoFactory = () => ({
      getCurrentUser: async () => Result.ok(mockUser),
    } as IUserRepository);

    const command = new LoginCommand(configService, userRepoFactory, output);
    const result = await command.execute({}, { globalOptions: {} });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Username is required");
    }
  });

  it("should fail when password is not provided", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();
    const userRepoFactory = () => ({
      getCurrentUser: async () => Result.ok(mockUser),
    } as IUserRepository);

    const command = new LoginCommand(configService, userRepoFactory, output);
    const result = await command.execute(
      { username: "test" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("App password is required");
    }
  });

  it("should store credentials and return user on success", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();
    const userRepoFactory = () => ({
      getCurrentUser: async () => Result.ok(mockUser),
    } as IUserRepository);

    const command = new LoginCommand(configService, userRepoFactory, output);
    const result = await command.execute(
      { username: "testuser", password: "testpass" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.username).toBe("testuser");
    }

    // Verify credentials were stored
    const credsResult = await configService.getCredentials();
    expect(credsResult.success).toBe(true);
    if (credsResult.success) {
      expect(credsResult.value.username).toBe("testuser");
      expect(credsResult.value.appPassword).toBe("testpass");
    }

    expect(output.logs).toContain(`success:Logged in as ${mockUser.display_name} (${mockUser.username})`);
  });

  it("should use environment variables for credentials", async () => {
    const originalUsername = process.env.BB_USERNAME;
    const originalPassword = process.env.BB_APP_PASSWORD;

    process.env.BB_USERNAME = "envuser";
    process.env.BB_APP_PASSWORD = "envpass";

    try {
      const configService = createMockConfigService();
      const output = createMockOutputService();
      const userRepoFactory = () => ({
        getCurrentUser: async () => Result.ok(mockUser),
      } as IUserRepository);

      const command = new LoginCommand(configService, userRepoFactory, output);
      const result = await command.execute({}, { globalOptions: {} });

      expect(result.success).toBe(true);

      const credsResult = await configService.getCredentials();
      expect(credsResult.success).toBe(true);
      if (credsResult.success) {
        expect(credsResult.value.username).toBe("envuser");
      }
    } finally {
      process.env.BB_USERNAME = originalUsername;
      process.env.BB_APP_PASSWORD = originalPassword;
    }
  });

  it("should output error message when authentication fails", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();
    const authError: BBError = {
      code: 2001,
      message: "Invalid credentials or expired token",
    };
    const userRepoFactory = () => ({
      getCurrentUser: async () => Result.err(authError),
    } as IUserRepository);

    const command = new LoginCommand(configService, userRepoFactory, output);
    const result = await command.execute(
      { username: "testuser", password: "badpassword" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Invalid credentials or expired token");
    }

    // Verify error message was output to user
    expect(output.logs).toContain("error:Authentication failed: Invalid credentials or expired token");

    // Verify credentials were cleared
    const configResult = await configService.getConfig();
    expect(configResult.success).toBe(true);
    if (configResult.success) {
      expect(configResult.value.username).toBeUndefined();
      expect(configResult.value.appPassword).toBeUndefined();
    }
  });
});

describe("LogoutCommand", () => {
  it("should clear config on logout", async () => {
    const configService = createMockConfigService({
      username: "testuser",
      appPassword: "testpass",
    });
    const output = createMockOutputService();

    const command = new LogoutCommand(configService, output);
    const result = await command.execute(undefined, { globalOptions: {} });

    expect(result.success).toBe(true);

    // Verify config was cleared
    const configResult = await configService.getConfig();
    expect(configResult.success).toBe(true);
    if (configResult.success) {
      expect(configResult.value.username).toBeUndefined();
      expect(configResult.value.appPassword).toBeUndefined();
    }

    expect(output.logs).toContain("success:Logged out of Bitbucket");
  });
});

describe("StatusCommand", () => {
  it("should show not logged in when no credentials", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();
    const userRepo: IUserRepository = {
      getCurrentUser: async () => Result.ok(mockUser),
    };

    const command = new StatusCommand(configService, userRepo, output);
    const result = await command.execute(undefined, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.authenticated).toBe(false);
    }

    expect(output.logs.some((log) => log.includes("Not logged in"))).toBe(true);
  });

  it("should show logged in when credentials valid", async () => {
    const configService = createMockConfigService({
      username: "testuser",
      appPassword: "testpass",
    });
    const output = createMockOutputService();
    const userRepo: IUserRepository = {
      getCurrentUser: async () => Result.ok(mockUser),
    };

    const command = new StatusCommand(configService, userRepo, output);
    const result = await command.execute(undefined, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.authenticated).toBe(true);
      expect(result.value.user?.username).toBe("testuser");
    }

    expect(output.logs).toContain("success:Logged in to Bitbucket");
  });

  it("should output JSON when json flag is set", async () => {
    const configService = createMockConfigService({
      username: "testuser",
      appPassword: "testpass",
    });
    const output = createMockOutputService();
    const userRepo: IUserRepository = {
      getCurrentUser: async () => Result.ok(mockUser),
    };

    const command = new StatusCommand(configService, userRepo, output);
    await command.execute(undefined, { globalOptions: { json: true } });

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });
});

describe("TokenCommand", () => {
  it("should output base64 encoded token", async () => {
    const configService = createMockConfigService({
      username: "testuser",
      appPassword: "testpass",
    });
    const output = createMockOutputService();

    const command = new TokenCommand(configService, output);
    const result = await command.execute(undefined, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      const expectedToken = Buffer.from("testuser:testpass").toString("base64");
      expect(result.value).toBe(expectedToken);
    }
  });

  it("should fail when not logged in", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new TokenCommand(configService, output);
    const result = await command.execute(undefined, { globalOptions: {} });

    expect(result.success).toBe(false);
  });
});
