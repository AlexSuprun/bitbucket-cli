export class BBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BBError';
  }
}

export class AuthError extends BBError {
  constructor(
    message: string = "Authentication required. Run 'bb auth login' to authenticate."
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class APIError extends BBError {
  public readonly statusCode: number;
  public readonly response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class GitError extends BBError {
  public readonly command: string;
  public readonly exitCode: number;

  constructor(message: string, command: string, exitCode: number) {
    super(message);
    this.name = 'GitError';
    this.command = command;
    this.exitCode = exitCode;
  }
}

export class ConfigError extends BBError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof BBError) {
    console.error(`Error: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error('An unknown error occurred');
  }
  process.exit(1);
}
