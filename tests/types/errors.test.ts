/**
 * Error types tests
 */

import { describe, it, expect } from "bun:test";
import {
  BBError,
  AuthError,
  APIError,
  GitError,
  ValidationError,
  ErrorCode,
} from "../../src/types/errors.js";

describe("BBError", () => {
  describe("constructor", () => {
    it("should create error with code and message", () => {
      const error = new BBError({
        code: ErrorCode.AUTH_REQUIRED,
        message: "Authentication required",
      });

      expect(error.code).toBe(ErrorCode.AUTH_REQUIRED);
      expect(error.message).toBe("Authentication required");
      expect(error.name).toBe("BBError");
    });

    it("should include context when provided", () => {
      const error = new BBError({
        code: ErrorCode.API_REQUEST_FAILED,
        message: "Request failed",
        context: { url: "/api/test", method: "GET" },
      });

      expect(error.context).toEqual({ url: "/api/test", method: "GET" });
    });

    it("should include cause when provided", () => {
      const cause = new Error("Original error");
      const error = new BBError({
        code: ErrorCode.CONFIG_READ_FAILED,
        message: "Failed to read config",
        cause,
      });

      expect(error.cause).toBe(cause);
    });
  });

  describe("toJSON", () => {
    it("should serialize error to JSON object", () => {
      const error = new BBError({
        code: ErrorCode.VALIDATION_REQUIRED,
        message: "Field required",
        context: { field: "username" },
      });

      const json = error.toJSON();

      expect(json).toEqual({
        name: "BBError",
        code: ErrorCode.VALIDATION_REQUIRED,
        message: "Field required",
        context: { field: "username" },
      });
    });

    it("should handle missing context", () => {
      const error = new BBError({
        code: ErrorCode.UNKNOWN,
        message: "Unknown error",
      });

      const json = error.toJSON();

      expect(json.context).toBeUndefined();
    });
  });
});

describe("AuthError", () => {
  it("should create with default error code", () => {
    const error = new AuthError("Not authenticated");

    expect(error.code).toBe(ErrorCode.AUTH_REQUIRED);
    expect(error.message).toBe("Not authenticated");
    expect(error.name).toBe("AuthError");
  });

  it("should allow custom error code", () => {
    const error = new AuthError("Token expired", ErrorCode.AUTH_EXPIRED);

    expect(error.code).toBe(ErrorCode.AUTH_EXPIRED);
  });

  it("should include context when provided", () => {
    const error = new AuthError("Invalid token", ErrorCode.AUTH_INVALID, {
      tokenType: "Bearer",
    });

    expect(error.context).toEqual({ tokenType: "Bearer" });
  });
});

describe("APIError", () => {
  describe("constructor", () => {
    it("should create with status code and response", () => {
      const error = new APIError("Not found", 404, { error: "Resource not found" });

      expect(error.statusCode).toBe(404);
      expect(error.response).toEqual({ error: "Resource not found" });
      expect(error.name).toBe("APIError");
    });

    it("should map 401 to AUTH_INVALID", () => {
      const error = new APIError("Unauthorized", 401);

      expect(error.code).toBe(ErrorCode.AUTH_INVALID);
    });

    it("should map 403 to API_FORBIDDEN", () => {
      const error = new APIError("Forbidden", 403);

      expect(error.code).toBe(ErrorCode.API_FORBIDDEN);
    });

    it("should map 404 to API_NOT_FOUND", () => {
      const error = new APIError("Not found", 404);

      expect(error.code).toBe(ErrorCode.API_NOT_FOUND);
    });

    it("should map 429 to API_RATE_LIMITED", () => {
      const error = new APIError("Too many requests", 429);

      expect(error.code).toBe(ErrorCode.API_RATE_LIMITED);
    });

    it("should map 5xx to API_SERVER_ERROR", () => {
      const error500 = new APIError("Internal server error", 500);
      const error502 = new APIError("Bad gateway", 502);
      const error503 = new APIError("Service unavailable", 503);

      expect(error500.code).toBe(ErrorCode.API_SERVER_ERROR);
      expect(error502.code).toBe(ErrorCode.API_SERVER_ERROR);
      expect(error503.code).toBe(ErrorCode.API_SERVER_ERROR);
    });

    it("should map other 4xx to API_REQUEST_FAILED", () => {
      const error = new APIError("Bad request", 400);

      expect(error.code).toBe(ErrorCode.API_REQUEST_FAILED);
    });

    it("should include context when provided", () => {
      const error = new APIError("Error", 400, null, { url: "/api/test" });

      expect(error.context).toEqual({ url: "/api/test" });
    });
  });
});

describe("GitError", () => {
  it("should create with command and exit code", () => {
    const error = new GitError("Failed to checkout", "git checkout main", 1);

    expect(error.command).toBe("git checkout main");
    expect(error.exitCode).toBe(1);
    expect(error.code).toBe(ErrorCode.GIT_COMMAND_FAILED);
    expect(error.name).toBe("GitError");
  });

  it("should include command and exit code in context", () => {
    const error = new GitError("Clone failed", "git clone url", 128);

    expect(error.context).toEqual({
      command: "git clone url",
      exitCode: 128,
    });
  });
});

describe("ValidationError", () => {
  it("should create with field and message", () => {
    const error = new ValidationError("username", "Username is required");

    expect(error.field).toBe("username");
    expect(error.message).toBe("Username is required");
    expect(error.code).toBe(ErrorCode.VALIDATION_REQUIRED);
    expect(error.name).toBe("ValidationError");
  });

  it("should include field in context", () => {
    const error = new ValidationError("email", "Invalid email format");

    expect(error.context).toEqual({ field: "email" });
  });
});

describe("ErrorCode", () => {
  it("should have authentication errors in 1xxx range", () => {
    expect(ErrorCode.AUTH_REQUIRED).toBe(1001);
    expect(ErrorCode.AUTH_INVALID).toBe(1002);
    expect(ErrorCode.AUTH_EXPIRED).toBe(1003);
  });

  it("should have API errors in 2xxx range", () => {
    expect(ErrorCode.API_REQUEST_FAILED).toBe(2001);
    expect(ErrorCode.API_NOT_FOUND).toBe(2002);
    expect(ErrorCode.API_FORBIDDEN).toBe(2003);
    expect(ErrorCode.API_RATE_LIMITED).toBe(2004);
    expect(ErrorCode.API_SERVER_ERROR).toBe(2005);
  });

  it("should have Git errors in 3xxx range", () => {
    expect(ErrorCode.GIT_NOT_REPOSITORY).toBe(3001);
    expect(ErrorCode.GIT_COMMAND_FAILED).toBe(3002);
    expect(ErrorCode.GIT_REMOTE_NOT_FOUND).toBe(3003);
  });

  it("should have config errors in 4xxx range", () => {
    expect(ErrorCode.CONFIG_READ_FAILED).toBe(4001);
    expect(ErrorCode.CONFIG_WRITE_FAILED).toBe(4002);
    expect(ErrorCode.CONFIG_INVALID_KEY).toBe(4003);
  });

  it("should have validation errors in 5xxx range", () => {
    expect(ErrorCode.VALIDATION_REQUIRED).toBe(5001);
    expect(ErrorCode.VALIDATION_INVALID).toBe(5002);
  });

  it("should have context errors in 6xxx range", () => {
    expect(ErrorCode.CONTEXT_REPO_NOT_FOUND).toBe(6001);
    expect(ErrorCode.CONTEXT_WORKSPACE_NOT_FOUND).toBe(6002);
  });

  it("should have unknown error as 9999", () => {
    expect(ErrorCode.UNKNOWN).toBe(9999);
  });
});
