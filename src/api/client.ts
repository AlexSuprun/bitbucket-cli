import { getConfig } from "../lib/config.js";
import { AuthError, APIError } from "../lib/errors.js";

const BASE_URL = "https://api.bitbucket.org/2.0";

export interface ApiClientConfig {
  username: string;
  apiToken: string;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

function createAuthHeader(username: string, apiToken: string): string {
  const credentials = Buffer.from(`${username}:${apiToken}`).toString("base64");
  return `Basic ${credentials}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const textBody = await response.text();
    let errorBody: unknown;
    try {
      errorBody = JSON.parse(textBody);
    } catch {
      errorBody = textBody;
    }

    const message =
      typeof errorBody === "object" && errorBody !== null && "error" in errorBody
        ? String((errorBody as { error: { message?: string } }).error?.message || response.statusText)
        : response.statusText;

    throw new APIError(message, response.status, errorBody);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const authHeader = createAuthHeader(config.username, config.apiToken);

  const headers: Record<string, string> = {
    Authorization: authHeader,
    "Content-Type": "application/json",
  };

  return {
    async get<T>(path: string): Promise<T> {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers,
      });
      return handleResponse<T>(response);
    },

    async post<T>(path: string, body?: unknown): Promise<T> {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      return handleResponse<T>(response);
    },

    async put<T>(path: string, body?: unknown): Promise<T> {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "PUT",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      return handleResponse<T>(response);
    },

    async delete<T>(path: string): Promise<T> {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        headers,
      });
      return handleResponse<T>(response);
    },
  };
}

let cachedClient: ApiClient | null = null;

export async function getApiClient(): Promise<ApiClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const config = await getConfig();

  if (!config.username || !config.apiToken) {
    throw new AuthError();
  }

  cachedClient = createApiClient({
    username: config.username,
    apiToken: config.apiToken,
  });

  return cachedClient;
}

export function clearApiClient(): void {
  cachedClient = null;
}
