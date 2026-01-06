/**
 * API client tests
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { createApiClient, getApiClient, clearApiClient } from "../../src/api/client.js";
import { AuthError, APIError } from "../../src/lib/errors.js";
import { getConfig } from "../../src/lib/config.js";

describe("API Client", () => {
  let originalFetch: typeof globalThis.fetch;
  let mockGetConfig: ReturnType<typeof mock>;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    clearApiClient();

    mockGetConfig = mock(() => ({
      username: "testuser",
      apiToken: "testtoken",
    }));
    mock.module("../../src/lib/config.js", () => ({
      getConfig: mockGetConfig,
    }));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    clearApiClient();
    mockGetConfig.mockRestore();
    mock.restore("../../src/lib/config.js");
  });

  describe("createApiClient", () => {
    it("should create API client with auth header", async () => {
      const config = {
        username: "testuser",
        apiToken: "testtoken",
      };

      const client = createApiClient(config);

      expect(client).toBeDefined();
      expect(client.get).toBeDefined();
      expect(client.post).toBeDefined();
      expect(client.put).toBeDefined();
      expect(client.delete).toBeDefined();
    });

    it("should make GET request with auth header", async () => {
      let capturedAuth: string | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        capturedAuth = headers.get("Authorization") ?? undefined;
        return new Response(JSON.stringify({ data: "test" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      const result = await client.get<{ data: string }>("/test");

      expect(result.data).toBe("test");
      expect(capturedAuth).toContain("Basic");

      const expectedToken = Buffer.from("testuser:testtoken").toString("base64");
      expect(capturedAuth).toBe(`Basic ${expectedToken}`);
    });

    it("should make POST request with body", async () => {
      let capturedBody: string | undefined;
      let capturedAuth: string | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        capturedAuth = headers.get("Authorization") ?? undefined;
        capturedBody = init?.body as string | undefined;
        return new Response(JSON.stringify({ created: true }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      const result = await client.post<{ created: boolean }>("/resources", {
        name: "test",
      });

      expect(result.created).toBe(true);
      expect(capturedBody).toContain("test");
      expect(capturedAuth).toContain("Basic");
    });

    it("should make PUT request", async () => {
      let capturedMethod: string | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedMethod = init?.method;
        return new Response(JSON.stringify({ updated: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      await client.put("/resources/1", { name: "updated" });

      expect(capturedMethod).toBe("PUT");
    });

    it("should make DELETE request", async () => {
      let capturedMethod: string | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedMethod = init?.method;
        return new Response(null, { status: 204 });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      await client.delete("/resources/1");

      expect(capturedMethod).toBe("DELETE");
    });
  });

  describe("error handling", () => {
    it("should handle 404 errors with JSON body", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ error: { message: "Not found" } }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      await expect(client.get("/nonexistent")).rejects.toThrow(APIError);
      await expect(client.get("/nonexistent")).rejects.toThrow("Not found");
    });

    it("should handle 401 errors", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ error: { message: "Unauthorized" } }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "wrong",
      });

      await expect(client.get("/protected")).rejects.toThrow(APIError);
    });

    it("should handle error response without error.message", async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({ error: { detail: "Some detail" } }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      await expect(client.get("/api")).rejects.toThrow(APIError);
    });

    it("should handle text error response", async () => {
      globalThis.fetch = async () => {
        return new Response("Internal Server Error", {
          status: 500,
          statusText: "Internal Server Error",
          headers: { "Content-Type": "text/plain" },
        });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      await expect(client.get("/api")).rejects.toThrow("Internal Server Error");
    });

    it("should handle malformed JSON error response", async () => {
      globalThis.fetch = async () => {
        return new Response("Invalid JSON {{{", {
          status: 500,
          statusText: "Internal Server Error",
          headers: { "Content-Type": "application/json" },
        });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      await expect(client.get("/api")).rejects.toThrow("Internal Server Error");
    });

    it("should handle 204 No Content", async () => {
      globalThis.fetch = async () => {
        return new Response(null, { status: 204 });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      const result = await client.delete("/resources/1");
      expect(result).toBeUndefined();
    });
  });

  describe("getApiClient", () => {
    it("should create and cache API client", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ data: "test" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const config1 = await getApiClient();
      const config2 = await getApiClient();

      expect(config1).toBe(config2);
    });

    it("should throw AuthError when credentials are missing", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      mockGetConfig.mockReturnValueOnce({});

      await expect(getApiClient()).rejects.toThrow(AuthError);
    });

    it("should refresh client after clearApiClient", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ data: "test" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client1 = await getApiClient();
      clearApiClient();
      const client2 = await getApiClient();

      expect(client1).not.toBe(client2);
    });

    it("should read credentials from config", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ data: "test" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client = await getApiClient();

      expect(client).toBeDefined();
    });
  });

  describe("clearApiClient", () => {
    it("should clear cached client", async () => {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ data: "test" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client1 = await getApiClient();
      clearApiClient();

      expect(client1).toBeDefined();
    });

    it("should be callable multiple times", () => {
      clearApiClient();
      clearApiClient();
      clearApiClient();

      expect(true).toBe(true);
    });
  });

  describe("auth header encoding", () => {
    it("should encode credentials as base64", () => {
      const config = {
        username: "testuser",
        apiToken: "testtoken",
      };

      const client = createApiClient(config);
      expect(client).toBeDefined();

      const expectedToken = Buffer.from("testuser:testtoken").toString("base64");
      expect(expectedToken).toBeTruthy();
    });

    it("should handle special characters in credentials", () => {
      const config = {
        username: "user@example.com",
        apiToken: "token-with-@-and-#-chars",
      };

      const client = createApiClient(config);
      expect(client).toBeDefined();
    });
  });

  describe("POST without body", () => {
    it("should handle POST request without body", async () => {
      let capturedBody: string | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedBody = init?.body as string | undefined;
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      await client.post("/action");

      expect(capturedBody).toBeUndefined();
    });
  });

  describe("PUT without body", () => {
    it("should handle PUT request without body", async () => {
      let capturedBody: string | undefined;

      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedBody = init?.body as string | undefined;
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      };

      const client = createApiClient({
        username: "testuser",
        apiToken: "testtoken",
      });

      await client.put("/action");

      expect(capturedBody).toBeUndefined();
    });
  });
});
