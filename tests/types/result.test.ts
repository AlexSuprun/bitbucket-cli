/**
 * Result type tests
 */

import { describe, it, expect } from "bun:test";
import { Result } from "../../src/types/result.js";

describe("Result", () => {
  describe("ok", () => {
    it("should create a success result with value", () => {
      const result = Result.ok(42);

      expect(result.success).toBe(true);
      expect(Result.isOk(result)).toBe(true);
      expect(Result.isErr(result)).toBe(false);

      if (result.success) {
        expect(result.value).toBe(42);
      }
    });

    it("should work with complex types", () => {
      const data = { name: "test", items: [1, 2, 3] };
      const result = Result.ok(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual(data);
      }
    });
  });

  describe("err", () => {
    it("should create a failure result with error", () => {
      const error = new Error("Something went wrong");
      const result = Result.err(error);

      expect(result.success).toBe(false);
      expect(Result.isOk(result)).toBe(false);
      expect(Result.isErr(result)).toBe(true);

      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe("map", () => {
    it("should transform success value", () => {
      const result = Result.ok(10);
      const mapped = Result.map(result, (x) => x * 2);

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.value).toBe(20);
      }
    });

    it("should pass through error unchanged", () => {
      const error = new Error("error");
      const result = Result.err(error);
      const mapped = Result.map(result, (x: number) => x * 2);

      expect(mapped.success).toBe(false);
      if (!mapped.success) {
        expect(mapped.error).toBe(error);
      }
    });
  });

  describe("mapErr", () => {
    it("should transform error", () => {
      const result = Result.err("original error");
      const mapped = Result.mapErr(result, (e) => new Error(e));

      expect(mapped.success).toBe(false);
      if (!mapped.success) {
        expect(mapped.error).toBeInstanceOf(Error);
        expect(mapped.error.message).toBe("original error");
      }
    });

    it("should pass through success unchanged", () => {
      const result = Result.ok(42);
      const mapped = Result.mapErr(result, (e: string) => new Error(e));

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.value).toBe(42);
      }
    });
  });

  describe("unwrap", () => {
    it("should return value for success", () => {
      const result = Result.ok("hello");
      expect(Result.unwrap(result)).toBe("hello");
    });

    it("should throw for error", () => {
      const error = new Error("test error");
      const result = Result.err(error);

      expect(() => Result.unwrap(result)).toThrow("test error");
    });
  });

  describe("unwrapOr", () => {
    it("should return value for success", () => {
      const result = Result.ok("hello");
      expect(Result.unwrapOr(result, "default")).toBe("hello");
    });

    it("should return default for error", () => {
      const result = Result.err(new Error("error"));
      expect(Result.unwrapOr(result, "default")).toBe("default");
    });
  });

  describe("fromPromise", () => {
    it("should wrap resolved promise in ok", async () => {
      const promise = Promise.resolve(42);
      const result = await Result.fromPromise(promise);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(42);
      }
    });

    it("should wrap rejected promise in err", async () => {
      const promise = Promise.reject(new Error("failed"));
      const result = await Result.fromPromise(promise);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("failed");
      }
    });

    it("should wrap non-Error rejection in Error", async () => {
      const promise = Promise.reject("string error");
      const result = await Result.fromPromise(promise);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe("string error");
      }
    });
  });
});
