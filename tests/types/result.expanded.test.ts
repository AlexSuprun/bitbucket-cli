/**
 * Extended Result type tests with edge cases
 */

import { describe, it, expect } from "bun:test";
import { Result } from "../../src/types/result.js";

describe("Result - Extended Tests", () => {
  describe("Result.ok", () => {
    it("should create success with primitive values", () => {
      expect(Result.ok(42).success).toBe(true);
      expect(Result.ok("string").success).toBe(true);
      expect(Result.ok(true).success).toBe(true);
      expect(Result.ok(null).success).toBe(true);
      expect(Result.ok(undefined).success).toBe(true);
    });

    it("should create success with complex objects", () => {
      const obj = { nested: { deeply: { value: 1 } } };
      const result = Result.ok(obj);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(obj);
        expect(result.value.nested.deeply.value).toBe(1);
      }
    });

    it("should create success with arrays", () => {
      const arr = [1, 2, 3];
      const result = Result.ok(arr);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual([1, 2, 3]);
      }
    });

    it("should create success with functions", () => {
      const fn = () => "test";
      const result = Result.ok(fn);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value()).toBe("test");
      }
    });
  });

  describe("Result.err", () => {
    it("should create failure with Error objects", () => {
      const error = new Error("test error");
      const result = Result.err(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("test error");
      }
    });

    it("should create failure with custom error types", () => {
      class CustomError extends Error {
        constructor(public code: number) {
          super(`Error ${code}`);
        }
      }

      const result = Result.err(new CustomError(500));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(500);
      }
    });

    it("should create failure with plain objects", () => {
      const result = Result.err({ code: "ERR_001", message: "Something failed" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("ERR_001");
      }
    });

    it("should create failure with string errors", () => {
      const result = Result.err("simple error");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("simple error");
      }
    });
  });

  describe("Result.map", () => {
    it("should map success values", () => {
      const result = Result.ok(5);
      const mapped = Result.map(result, (x) => x * 2);

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.value).toBe(10);
      }
    });

    it("should not map failure values", () => {
      const result = Result.err<number, string>("error");
      let called = false;
      const mapped = Result.map(result, (x) => {
        called = true;
        return x * 2;
      });

      expect(mapped.success).toBe(false);
      expect(called).toBe(false);
    });

    it("should chain multiple maps", () => {
      const result = Result.ok(2);
      const mapped = Result.map(
        Result.map(result, (x) => x + 3),
        (x) => x * 2
      );

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.value).toBe(10); // (2 + 3) * 2
      }
    });

    it("should change value types", () => {
      const result = Result.ok(42);
      const mapped = Result.map(result, (x) => `number: ${x}`);

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.value).toBe("number: 42");
      }
    });
  });

  describe("Result.mapErr", () => {
    it("should map error values", () => {
      const result = Result.err("original error");
      const mapped = Result.mapErr(result, (e) => new Error(e));

      expect(mapped.success).toBe(false);
      if (!mapped.success) {
        expect(mapped.error.message).toBe("original error");
      }
    });

    it("should not map success values", () => {
      const result = Result.ok<number, string>(42);
      let called = false;
      const mapped = Result.mapErr(result, (e) => {
        called = true;
        return new Error(e);
      });

      expect(mapped.success).toBe(true);
      expect(called).toBe(false);
    });
  });

  describe("Result.unwrap", () => {
    it("should return value for success", () => {
      const result = Result.ok("test");
      expect(Result.unwrap(result)).toBe("test");
    });

    it("should throw for failure", () => {
      const result = Result.err(new Error("error"));
      expect(() => Result.unwrap(result)).toThrow("error");
    });

    it("should throw non-Error failures as Error", () => {
      const result = Result.err("string error");
      expect(() => Result.unwrap(result)).toThrow();
    });
  });

  describe("Result.unwrapOr", () => {
    it("should return value for success", () => {
      const result = Result.ok("success");
      expect(Result.unwrapOr(result, "default")).toBe("success");
    });

    it("should return default for failure", () => {
      const result = Result.err<string, Error>(new Error("error"));
      expect(Result.unwrapOr(result, "default")).toBe("default");
    });

    it("should work with null as default", () => {
      const result = Result.err<string | null, Error>(new Error("error"));
      expect(Result.unwrapOr(result, null)).toBe(null);
    });

    it("should work with undefined as default", () => {
      const result = Result.err<string | undefined, Error>(new Error("error"));
      expect(Result.unwrapOr(result, undefined)).toBe(undefined);
    });
  });

  describe("Result.fromPromise", () => {
    it("should convert resolved promise to success", async () => {
      const promise = Promise.resolve(42);
      const result = await Result.fromPromise(promise);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(42);
      }
    });

    it("should convert rejected promise to failure", async () => {
      const promise = Promise.reject(new Error("rejected"));
      const result = await Result.fromPromise(promise);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("rejected");
      }
    });

    it("should wrap non-Error rejections", async () => {
      const promise = Promise.reject("string rejection");
      const result = await Result.fromPromise(promise);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("string rejection");
      }
    });

    it("should handle async functions", async () => {
      const asyncFn = async () => {
        await new Promise((r) => setTimeout(r, 10));
        return "async result";
      };

      const result = await Result.fromPromise(asyncFn());

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe("async result");
      }
    });

    it("should handle async functions that throw", async () => {
      const asyncFn = async () => {
        await new Promise((r) => setTimeout(r, 10));
        throw new Error("async error");
      };

      const result = await Result.fromPromise(asyncFn());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("async error");
      }
    });
  });

  describe("Type narrowing", () => {
    it("should narrow types correctly in if blocks", () => {
      const result: Result<number, string> = Result.ok(42);

      if (result.success) {
        // TypeScript should know result.value exists
        const value: number = result.value;
        expect(value).toBe(42);
      } else {
        // TypeScript should know result.error exists
        const error: string = result.error;
        expect(error).toBeDefined();
      }
    });

    it("should work with different success and error types", () => {
      interface User {
        id: number;
        name: string;
      }

      interface ApiError {
        code: number;
        message: string;
      }

      const success: Result<User, ApiError> = Result.ok({
        id: 1,
        name: "Test",
      });

      const failure: Result<User, ApiError> = Result.err({
        code: 404,
        message: "Not found",
      });

      if (success.success) {
        expect(success.value.id).toBe(1);
        expect(success.value.name).toBe("Test");
      }

      if (!failure.success) {
        expect(failure.error.code).toBe(404);
        expect(failure.error.message).toBe("Not found");
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle very large objects", () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      const result = Result.ok(largeArray);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.length).toBe(10000);
      }
    });

    it("should handle circular references in values", () => {
      const obj: Record<string, unknown> = { a: 1 };
      obj.self = obj;

      const result = Result.ok(obj);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.self).toBe(result.value);
      }
    });

    it("should handle Symbol values", () => {
      const sym = Symbol("test");
      const result = Result.ok(sym);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(sym);
      }
    });

    it("should handle BigInt values", () => {
      const big = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1);
      const result = Result.ok(big);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(big);
      }
    });
  });
});
