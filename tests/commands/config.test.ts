/**
 * Config command tests
 */

import { describe, it, expect } from "bun:test";
import { GetConfigCommand } from "../../src/commands/config/get.command.js";
import { SetConfigCommand } from "../../src/commands/config/set.command.js";
import { ListConfigCommand } from "../../src/commands/config/list.command.js";
import { createMockConfigService, createMockOutputService } from "../setup.js";

describe("GetConfigCommand", () => {
  it("should get defaultWorkspace value", async () => {
    const configService = createMockConfigService({
      defaultWorkspace: "my-workspace",
    });
    const output = createMockOutputService();

    const command = new GetConfigCommand(configService, output);
    const result = await command.execute(
      { key: "defaultWorkspace" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("my-workspace");
    }

    expect(output.logs).toContain("text:my-workspace");
  });

  it("should output empty string for unset value", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new GetConfigCommand(configService, output);
    const result = await command.execute(
      { key: "defaultWorkspace" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);
    expect(output.logs).toContain("text:");
  });

  it("should reject hidden keys like appPassword", async () => {
    const configService = createMockConfigService({
      appPassword: "secret",
    });
    const output = createMockOutputService();

    const command = new GetConfigCommand(configService, output);
    const result = await command.execute(
      { key: "appPassword" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
    expect(output.logs.some((log) => log.includes("Cannot display"))).toBe(true);
  });

  it("should reject invalid keys", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new GetConfigCommand(configService, output);
    const result = await command.execute(
      { key: "invalidKey" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
    expect(output.logs.some((log) => log.includes("Unknown config key"))).toBe(true);
  });
});

describe("SetConfigCommand", () => {
  it("should set defaultWorkspace value", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new SetConfigCommand(configService, output);
    const result = await command.execute(
      { key: "defaultWorkspace", value: "new-workspace" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(true);

    // Verify value was set
    const configResult = await configService.getConfig();
    expect(configResult.success).toBe(true);
    if (configResult.success) {
      expect(configResult.value.defaultWorkspace).toBe("new-workspace");
    }

    expect(output.logs).toContain("success:Set defaultWorkspace = new-workspace");
  });

  it("should reject protected keys like username", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new SetConfigCommand(configService, output);
    const result = await command.execute(
      { key: "username", value: "newuser" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
    expect(output.logs.some((log) => log.includes("Cannot set"))).toBe(true);
  });

  it("should reject protected keys like appPassword", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new SetConfigCommand(configService, output);
    const result = await command.execute(
      { key: "appPassword", value: "newpass" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
    expect(output.logs.some((log) => log.includes("Cannot set"))).toBe(true);
  });

  it("should reject invalid keys", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new SetConfigCommand(configService, output);
    const result = await command.execute(
      { key: "invalidKey", value: "value" },
      { globalOptions: {} }
    );

    expect(result.success).toBe(false);
  });
});

describe("ListConfigCommand", () => {
  it("should list all config values", async () => {
    const configService = createMockConfigService({
      username: "testuser",
      appPassword: "testpass",
      defaultWorkspace: "myworkspace",
    });
    const output = createMockOutputService();

    const command = new ListConfigCommand(configService, output);
    const result = await command.execute(undefined, { globalOptions: {} });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.username).toBe("testuser");
      expect(result.value.defaultWorkspace).toBe("myworkspace");
      expect(result.value.appPassword).toBe("********"); // Masked
    }
  });

  it("should output JSON when flag is set", async () => {
    const configService = createMockConfigService({
      username: "testuser",
      defaultWorkspace: "myworkspace",
    });
    const output = createMockOutputService();

    const command = new ListConfigCommand(configService, output);
    await command.execute(undefined, { globalOptions: { json: true } });

    expect(output.logs.some((log) => log.startsWith("json:"))).toBe(true);
  });

  it("should show message when no config is set", async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new ListConfigCommand(configService, output);
    await command.execute(undefined, { globalOptions: {} });

    expect(output.logs.some((log) => log.includes("No configuration set"))).toBe(true);
  });
});
