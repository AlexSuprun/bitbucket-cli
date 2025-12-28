/**
 * ConfigService tests
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { ConfigService } from "../../src/services/config.service.js";
import { ErrorCode } from "../../src/types/errors.js";
import { mkdir, rm, readFile, writeFile } from "fs/promises";
import { join } from "path";

describe("ConfigService", () => {
  const testConfigDir = join("/tmp", `bb-test-${Date.now()}`);
  let configService: ConfigService;

  beforeEach(async () => {
    configService = new ConfigService(testConfigDir);
  });

  afterEach(async () => {
    try {
      await rm(testConfigDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("getConfig", () => {
    it("should return empty config when file does not exist", async () => {
      const result = await configService.getConfig();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({});
      }
    });

    it("should return config from file", async () => {
      await mkdir(testConfigDir, { recursive: true });
      await writeFile(
        join(testConfigDir, "config.json"),
        JSON.stringify({ username: "testuser", defaultWorkspace: "workspace" })
      );

      configService.clearCache();
      const result = await configService.getConfig();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.username).toBe("testuser");
        expect(result.value.defaultWorkspace).toBe("workspace");
      }
    });

    it("should cache config after first read", async () => {
      await mkdir(testConfigDir, { recursive: true });
      await writeFile(
        join(testConfigDir, "config.json"),
        JSON.stringify({ username: "original" })
      );

      // First read
      await configService.getConfig();

      // Modify file directly
      await writeFile(
        join(testConfigDir, "config.json"),
        JSON.stringify({ username: "modified" })
      );

      // Second read should return cached value
      const result = await configService.getConfig();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.username).toBe("original");
      }
    });

    it("should return error for invalid JSON", async () => {
      await mkdir(testConfigDir, { recursive: true });
      await writeFile(join(testConfigDir, "config.json"), "invalid json {");

      configService.clearCache();
      const result = await configService.getConfig();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.CONFIG_READ_FAILED);
      }
    });
  });

  describe("setConfig", () => {
    it("should create config file with correct permissions", async () => {
      const result = await configService.setConfig({
        username: "testuser",
        appPassword: "secret",
      });

      expect(result.success).toBe(true);

      const content = await readFile(join(testConfigDir, "config.json"), "utf-8");
      const parsed = JSON.parse(content);
      expect(parsed.username).toBe("testuser");
      expect(parsed.appPassword).toBe("secret");
    });

    it("should update cached config", async () => {
      await configService.setConfig({ username: "user1" });

      const result = await configService.getConfig();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.username).toBe("user1");
      }
    });

    it("should create directory if it does not exist", async () => {
      const result = await configService.setConfig({ username: "testuser" });

      expect(result.success).toBe(true);

      const content = await readFile(join(testConfigDir, "config.json"), "utf-8");
      expect(content).toContain("testuser");
    });

    it("should format JSON with indentation", async () => {
      await configService.setConfig({ username: "testuser" });

      const content = await readFile(join(testConfigDir, "config.json"), "utf-8");
      expect(content).toContain("\n");
      expect(content).toMatch(/{\n\s+"username"/);
    });
  });

  describe("getCredentials", () => {
    it("should return credentials when both username and appPassword exist", async () => {
      await configService.setConfig({
        username: "testuser",
        appPassword: "testpass",
      });

      const result = await configService.getCredentials();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.username).toBe("testuser");
        expect(result.value.appPassword).toBe("testpass");
      }
    });

    it("should return error when username is missing", async () => {
      await configService.setConfig({ appPassword: "testpass" });

      const result = await configService.getCredentials();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.AUTH_REQUIRED);
      }
    });

    it("should return error when appPassword is missing", async () => {
      await configService.setConfig({ username: "testuser" });

      const result = await configService.getCredentials();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.AUTH_REQUIRED);
      }
    });

    it("should return error when config is empty", async () => {
      const result = await configService.getCredentials();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.AUTH_REQUIRED);
        expect(result.error.message).toContain("bb auth login");
      }
    });
  });

  describe("setCredentials", () => {
    it("should set username and appPassword", async () => {
      await configService.setCredentials({
        username: "newuser",
        appPassword: "newpass",
      });

      const result = await configService.getCredentials();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.username).toBe("newuser");
        expect(result.value.appPassword).toBe("newpass");
      }
    });

    it("should preserve other config values", async () => {
      await configService.setConfig({
        defaultWorkspace: "myworkspace",
        defaultRepo: "myrepo",
      });

      await configService.setCredentials({
        username: "user",
        appPassword: "pass",
      });

      const result = await configService.getConfig();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.defaultWorkspace).toBe("myworkspace");
        expect(result.value.defaultRepo).toBe("myrepo");
        expect(result.value.username).toBe("user");
      }
    });
  });

  describe("clearConfig", () => {
    it("should clear all config values", async () => {
      await configService.setConfig({
        username: "user",
        appPassword: "pass",
        defaultWorkspace: "workspace",
      });

      await configService.clearConfig();

      const result = await configService.getConfig();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({});
      }
    });
  });

  describe("getValue", () => {
    it("should return specific config value", async () => {
      await configService.setConfig({
        username: "testuser",
        defaultWorkspace: "myworkspace",
      });

      const result = await configService.getValue("defaultWorkspace");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe("myworkspace");
      }
    });

    it("should return undefined for missing value", async () => {
      await configService.setConfig({ username: "testuser" });

      const result = await configService.getValue("defaultWorkspace");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeUndefined();
      }
    });
  });

  describe("setValue", () => {
    it("should set specific config value", async () => {
      await configService.setValue("defaultWorkspace", "newworkspace");

      const result = await configService.getValue("defaultWorkspace");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe("newworkspace");
      }
    });

    it("should preserve other values", async () => {
      await configService.setConfig({ username: "user" });
      await configService.setValue("defaultWorkspace", "workspace");

      const result = await configService.getConfig();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.username).toBe("user");
        expect(result.value.defaultWorkspace).toBe("workspace");
      }
    });
  });

  describe("getConfigPath", () => {
    it("should return correct config file path", () => {
      const path = configService.getConfigPath();

      expect(path).toBe(join(testConfigDir, "config.json"));
    });
  });

  describe("clearCache", () => {
    it("should clear cached config", async () => {
      await configService.setConfig({ username: "original" });

      // Verify cached
      let result = await configService.getConfig();
      expect(result.success && result.value.username).toBe("original");

      // Modify file directly
      await writeFile(
        join(testConfigDir, "config.json"),
        JSON.stringify({ username: "modified" })
      );

      // Still cached
      result = await configService.getConfig();
      expect(result.success && result.value.username).toBe("original");

      // Clear cache
      configService.clearCache();

      // Now reads from file
      result = await configService.getConfig();
      expect(result.success && result.value.username).toBe("modified");
    });
  });
});
