/**
 * HTTP client for Bitbucket API
 */

import type { IHttpClient, IConfigService } from "../core/interfaces/services.js";
import { Result } from "../types/result.js";
import { APIError, BBError, ErrorCode } from "../types/errors.js";

export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  debug?: boolean;
}

export class HttpClient implements IHttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly debug: boolean;

  constructor(private readonly configService: IConfigService, config?: Partial<HttpClientConfig>) {
    this.baseUrl = config?.baseUrl ?? "https://api.bitbucket.org/2.0";
    this.timeout = config?.timeout ?? 30000;
    this.debug = config?.debug ?? process.env.DEBUG === "true";
  }

  private logDebug(message: string, data?: unknown): void {
    if (!this.debug) {
      return;
    }
    if (data === undefined) {
      console.log(`[debug] ${message}`);
      return;
    }
    console.log(`[debug] ${message}`, data);
  }

  private async getAuthHeader(): Promise<Result<string, BBError>> {
    const credentialsResult = await this.configService.getCredentials();
    if (!credentialsResult.success) {
      return credentialsResult;
    }

    const { username, apiToken } = credentialsResult.value;
    const encoded = Buffer.from(`${username}:${apiToken}`).toString("base64");
    return Result.ok(`Basic ${encoded}`);
  }

  private async request<T>(method: string, path: string, body?: unknown, acceptText: boolean = false): Promise<Result<T, BBError>> {
    const authResult = await this.getAuthHeader();
    if (!authResult.success) {
      return authResult;
    }

    const headers: Record<string, string> = {
      Authorization: authResult.value,
      "Content-Type": "application/json",
      Accept: acceptText ? "text/plain" : "application/json",
    };

    const url = `${this.baseUrl}${path}`;
    const requestBody = body ? JSON.stringify(body) : undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      this.logDebug("Request", {
        url,
        method,
        headers,
        body: requestBody,
      });

      const response = await fetch(url, {
        method,
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      if (process.env.DEBUG === "true") {
        console.debug(`[HTTP] ${method} ${url} - ${response.status}`);
        console.debug(`[HTTP] Response Headers:`, Object.fromEntries(response.headers.entries()));
        console.debug(`[HTTP] Response Body:`, await response.clone().text());
      }

      clearTimeout(timeoutId);

      if (this.debug) {
        const responseClone = response.clone();
        const responseText = await responseClone.text();
        this.logDebug("Response", {
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText,
        });
      }

      return acceptText ? this.handleTextResponse<T>(response) : this.handleResponse<T>(response);
    } catch (error) {
      this.logDebug("Request error", {
        url,
        method,
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof Error && error.name === "AbortError") {
        return Result.err(
          new BBError({
            code: ErrorCode.API_REQUEST_FAILED,
            message: `Request timeout after ${this.timeout}ms`,
            context: { url, method },
          })
        );
      }

      return Result.err(
        new BBError({
          code: ErrorCode.API_REQUEST_FAILED,
          message: error instanceof Error ? error.message : "Request failed",
          cause: error instanceof Error ? error : undefined,
          context: { url, method },
        })
      );
    }
  }

  private async handleResponse<T>(response: Response): Promise<Result<T, BBError>> {
    if (!response.ok) {
      // Read body as text first to avoid "Body already used" error
      const textBody = await response.text();
      let errorBody: unknown;
      try {
        errorBody = JSON.parse(textBody);
      } catch {
        errorBody = textBody;
      }

      const message = this.extractErrorMessage(errorBody, response.statusText);

      return Result.err(
        new APIError(message, response.status, errorBody, {
          url: response.url,
        })
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return Result.ok(undefined as T);
    }

    try {
      const data = (await response.json()) as T;
      return Result.ok(data);
    } catch (error) {
      return Result.err(
        new BBError({
          code: ErrorCode.API_REQUEST_FAILED,
          message: "Failed to parse response JSON",
          cause: error instanceof Error ? error : undefined,
        })
      );
    }
  }

  private async handleTextResponse<T>(response: Response): Promise<Result<T, BBError>> {
    if (!response.ok) {
      // Read body as text first to avoid "Body already used" error
      const textBody = await response.text();
      let errorBody: unknown;
      try {
        errorBody = JSON.parse(textBody);
      } catch {
        errorBody = textBody;
      }

      const message = this.extractErrorMessage(errorBody, response.statusText);

      return Result.err(
        new APIError(message, response.status, errorBody, {
          url: response.url,
        })
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return Result.ok(undefined as T);
    }

    try {
      const data = (await response.text()) as T;
      return Result.ok(data);
    } catch (error) {
      return Result.err(
        new BBError({
          code: ErrorCode.API_REQUEST_FAILED,
          message: "Failed to read response text",
          cause: error instanceof Error ? error : undefined,
        })
      );
    }
  }

  private extractErrorMessage(body: unknown, fallback: string): string {
    if (typeof body === "object" && body !== null) {
      const obj = body as Record<string, unknown>;
      if (typeof obj.error === "object" && obj.error !== null) {
        const error = obj.error as Record<string, unknown>;
        if (typeof error.message === "string") {
          return error.message;
        }
      }
      if (typeof obj.message === "string") {
        return obj.message;
      }
    }
    return fallback;
  }

  public async get<T>(path: string): Promise<Result<T, BBError>> {
    return this.request<T>("GET", path);
  }

  public async getText(path: string): Promise<Result<string, BBError>> {
    return this.request<string>("GET", path, undefined, true);
  }

  public async post<T>(path: string, body?: unknown): Promise<Result<T, BBError>> {
    return this.request<T>("POST", path, body);
  }

  public async put<T>(path: string, body?: unknown): Promise<Result<T, BBError>> {
    return this.request<T>("PUT", path, body);
  }

  public async delete<T>(path: string): Promise<Result<T, BBError>> {
    return this.request<T>("DELETE", path);
  }
}
