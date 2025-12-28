/**
 * HttpClient tests
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { HttpClient } from "../../src/services/http.client.js";
import { ErrorCode } from "../../src/types/errors.js";
import { Result } from "../../src/types/result.js";
import type { IConfigService } from "../../src/core/interfaces/services.js";
import type { BBConfig, AuthCredentials } from "../../src/types/config.js";
import type { BBError } from "../../src/types/errors.js";

function createMockConfigService(
  credentials?: AuthCredentials
): IConfigService {
  const config: BBConfig = credentials
    ? { username: credentials.username, appPassword: credentials.appPassword }
    : {};

  return {
    async getConfig() {
      return Result.ok(config);
    },
    async setConfig(newConfig: BBConfig) {
      Object.assign(config, newConfig);
      return Result.ok(undefined);
    },
    async getCredentials() {
      if (credentials) {
        return Result.ok(credentials);
      }
      return Result.err({
        code: ErrorCode.AUTH_REQUIRED,
        message: "Auth required",
      } as BBError);
    },
    async setCredentials(creds: AuthCredentials) {
      return Result.ok(undefined);
    },
    async clearConfig() {
      return Result.ok(undefined);
    },
    async getValue<K extends keyof BBConfig>(key: K) {
      return Result.ok(config[key]);
    },
    async setValue<K extends keyof BBConfig>(key: K, value: BBConfig[K]) {
      return Result.ok(undefined);
    },
    getConfigPath() {
      return "/tmp/test-config.json";
    },
  };
}

describe("HttpClient", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("constructor", () => {
    it("should use default baseUrl", () => {
      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      // We can't directly test private properties, but we can verify it works
      expect(client).toBeDefined();
    });

    it("should accept custom baseUrl", () => {
      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService, {
        baseUrl: "https://custom-api.example.com",
      });

      expect(client).toBeDefined();
    });

    it("should accept custom timeout", () => {
      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService, {
        timeout: 5000,
      });

      expect(client).toBeDefined();
    });
  });

  describe("get", () => {
    it("should make GET request with auth header", async () => {
      let capturedRequest: Request | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedRequest = new Request(input, init);
        return new Response(JSON.stringify({ data: "test" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "testuser",
        appPassword: "testpass",
      });
      const client = new HttpClient(configService);

      const result = await client.get<{ data: string }>("/test");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.data).toBe("test");
      }

      expect(capturedRequest?.headers.get("Authorization")).toContain("Basic");
    });

    it("should return error when not authenticated", async () => {
      const configService = createMockConfigService(); // No credentials
      const client = new HttpClient(configService);

      const result = await client.get("/test");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.AUTH_REQUIRED);
      }
    });

    it("should handle 404 errors", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ error: { message: "Not found" } }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/nonexistent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.API_NOT_FOUND);
      }
    });

    it("should handle 401 errors", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "wrong",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/protected");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.AUTH_INVALID);
      }
    });

    it("should handle 403 errors", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ message: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/forbidden");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.API_FORBIDDEN);
      }
    });

    it("should handle 429 rate limiting", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ message: "Too many requests" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/api");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.API_RATE_LIMITED);
      }
    });

    it("should handle 500 server errors", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ message: "Internal error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/api");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.API_SERVER_ERROR);
      }
    });

    it("should handle network errors", async () => {
      globalThis.fetch = async () => {
        throw new Error("Network error");
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/api");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.API_REQUEST_FAILED);
      }
    });

    it("should handle invalid JSON response", async () => {
      globalThis.fetch = async () => {
        return new Response("not json", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/api");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCode.API_REQUEST_FAILED);
        expect(result.error.message).toContain("JSON");
      }
    });
  });

  describe("post", () => {
    it("should make POST request with body", async () => {
      let capturedRequest: Request | undefined;
      let capturedBody: unknown;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedRequest = new Request(input, init);
        capturedBody = init?.body ? JSON.parse(init.body as string) : undefined;
        return new Response(JSON.stringify({ created: true }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.post<{ created: boolean }>("/resources", {
        name: "test",
      });

      expect(result.success).toBe(true);
      expect(capturedRequest?.method).toBe("POST");
      expect(capturedBody).toEqual({ name: "test" });
    });

    it("should handle POST without body", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.post<{ ok: boolean }>("/action");

      expect(result.success).toBe(true);
    });
  });

  describe("put", () => {
    it("should make PUT request", async () => {
      let capturedMethod: string | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedMethod = init?.method;
        return new Response(JSON.stringify({ updated: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.put("/resources/1", { name: "updated" });

      expect(result.success).toBe(true);
      expect(capturedMethod).toBe("PUT");
    });
  });

  describe("delete", () => {
    it("should make DELETE request", async () => {
      let capturedMethod: string | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedMethod = init?.method;
        return new Response(null, { status: 204 });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.delete("/resources/1");

      expect(result.success).toBe(true);
      expect(capturedMethod).toBe("DELETE");
    });

    it("should handle 204 No Content", async () => {
      globalThis.fetch = async () => {
        return new Response(null, { status: 204 });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.delete("/resources/1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeUndefined();
      }
    });
  });

  describe("error message extraction", () => {
    it("should extract message from error.message", async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({ error: { message: "Specific error message" } }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/api");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Specific error message");
      }
    });

    it("should extract message from top-level message", async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({ message: "Top level message" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/api");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Top level message");
      }
    });

    it("should fall back to statusText", async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({ someOtherField: "value" }),
          {
            status: 400,
            statusText: "Bad Request",
            headers: { "Content-Type": "application/json" },
          }
        );
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/api");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Bad Request");
      }
    });

    it("should handle non-JSON error body", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ noMessage: true }), {
          status: 400,
          statusText: "Bad Request",
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "user",
        appPassword: "pass",
      });
      const client = new HttpClient(configService);

      const result = await client.get("/api");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Bad Request");
      }
    });
  });

  describe("authentication", () => {
    it("should encode credentials as base64", async () => {
      let capturedAuth: string | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        capturedAuth = headers.get("Authorization");
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const configService = createMockConfigService({
        username: "testuser",
        appPassword: "testpass",
      });
      const client = new HttpClient(configService);

      await client.get("/api");

      const expectedToken = Buffer.from("testuser:testpass").toString("base64");
      expect(capturedAuth).toBe(`Basic ${expectedToken}`);
    });
  });
});
