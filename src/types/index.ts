export interface BBConfig {
  username?: string;
  appPassword?: string;
  defaultWorkspace?: string;
}

export interface GlobalOptions {
  json?: boolean;
  workspace?: string;
  repo?: string;
}

export interface RepoContext {
  workspace: string;
  repoSlug: string;
}

export interface CommandResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
