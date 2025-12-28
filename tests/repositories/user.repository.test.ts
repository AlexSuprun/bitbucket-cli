/**
 * User repository tests
 */

import { describe, it, expect } from "bun:test";
import { UserRepository } from "../../src/repositories/user.repository.js";
import { Result } from "../../src/types/result.js";
import { createMockHttpClient, mockUser } from "../setup.js";
import type { BBError } from "../../src/types/errors.js";

describe("UserRepository", () => {
  describe("getCurrentUser", () => {
    it("should return user on success", async () => {
      const responses = new Map([
        ["GET:/user", Result.ok(mockUser)],
      ]);
      const httpClient = createMockHttpClient(responses);
      const repository = new UserRepository(httpClient);

      const result = await repository.getCurrentUser();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.username).toBe("testuser");
        expect(result.value.display_name).toBe("Test User");
        expect(result.value.account_id).toBe("123456789");
      }
    });

    it("should return error on failure", async () => {
      const responses = new Map<string, Result<unknown, BBError>>();
      const httpClient = createMockHttpClient(responses);
      const repository = new UserRepository(httpClient);

      const result = await repository.getCurrentUser();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(2002); // Not found
      }
    });
  });
});
