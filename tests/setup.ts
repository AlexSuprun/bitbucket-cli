import { beforeEach, afterEach, mock } from "bun:test";

// Mock config directory for tests
const TEST_CONFIG_DIR = "/tmp/bb-test-config";

// Reset mocks before each test
beforeEach(() => {
  // Clear any cached API clients
  mock.module("../src/api/client.js", () => ({
    getApiClient: mock(() => Promise.resolve(createMockApiClient())),
    createApiClient: mock(() => createMockApiClient()),
    clearApiClient: mock(() => {}),
  }));
});

afterEach(async () => {
  // Clean up test config directory
  try {
    const fs = await import("fs/promises");
    await fs.rm(TEST_CONFIG_DIR, { recursive: true, force: true });
  } catch {
    // Ignore errors
  }
});

// Mock API client for testing
export function createMockApiClient() {
  return {
    get: mock(() => Promise.resolve({})),
    post: mock(() => Promise.resolve({})),
    put: mock(() => Promise.resolve({})),
    delete: mock(() => Promise.resolve({})),
  };
}

// Mock user response
export const mockUser = {
  username: "testuser",
  display_name: "Test User",
  account_id: "123456",
};

// Mock repository response
export const mockRepository = {
  full_name: "workspace/repo",
  name: "repo",
  description: "Test repository",
  is_private: true,
  created_on: "2024-01-01T00:00:00.000Z",
  updated_on: "2024-01-02T00:00:00.000Z",
  language: "TypeScript",
  mainbranch: { name: "main" },
  links: {
    html: { href: "https://bitbucket.org/workspace/repo" },
    clone: [
      { name: "ssh", href: "git@bitbucket.org:workspace/repo.git" },
      { name: "https", href: "https://bitbucket.org/workspace/repo.git" },
    ],
  },
  owner: {
    display_name: "Test User",
  },
};

// Mock pull request response
export const mockPullRequest = {
  id: 1,
  title: "Test PR",
  description: "Test description",
  state: "OPEN",
  author: {
    display_name: "Test User",
  },
  source: {
    branch: { name: "feature-branch" },
    repository: { full_name: "workspace/repo" },
  },
  destination: {
    branch: { name: "main" },
  },
  created_on: "2024-01-01T00:00:00.000Z",
  updated_on: "2024-01-02T00:00:00.000Z",
  comment_count: 0,
  task_count: 0,
  links: {
    html: { href: "https://bitbucket.org/workspace/repo/pull-requests/1" },
  },
  participants: [],
};
